import { HighlightingListener } from "./highlightingVisualization";
import { HighlightingVisualization } from "./highlightingVisualization";
import { IIdentifiable, TraceabilityLink } from "./classes";
import { ColorSupplier } from "./colorSupplier";
import { active } from "d3";

export interface TraceLinkListener {
    reportStateChanged(links : TraceabilityLink[], colors : string[], names : string[][]) : void;
}


export class MediationTraceabilityLink extends TraceabilityLink {
    sourceVisIndex : number;
    targetVisIndex : number;

    constructor(source : string, target : string, sourceVisIndex : number, targetVisIndex : number) {
        super(source, target);
        this.sourceVisIndex = sourceVisIndex;
        this.targetVisIndex = targetVisIndex;
    }

    reversed() : MediationTraceabilityLink {
        return new MediationTraceabilityLink(this.target, this.source, this.targetVisIndex, this.sourceVisIndex);
    }
}

export class VisualizationMediator {

    protected traceLinks : MediationTraceabilityLink[];
    protected visualizations : HighlightingVisualization[];
    protected colorSupplier : ColorSupplier;
    protected activeLinks : MediationTraceabilityLink[];
    protected lastPrimaryVisualizationIndex : number;
    protected listeners : TraceLinkListener[];

    constructor(traceLinks : MediationTraceabilityLink[], visualizations : HighlightingVisualization[], colorSupplier : ColorSupplier) {
        this.listeners = [];
        this.activeLinks = [];
        this.lastPrimaryVisualizationIndex = 0;
        const uniqueTraceLinks = new Set<MediationTraceabilityLink>();
        for (let link of traceLinks) {
            uniqueTraceLinks.add(link);
            uniqueTraceLinks.add(link.reversed());
        }
        this.traceLinks = Array.from(uniqueTraceLinks);
        this.visualizations = [];
        this.colorSupplier = colorSupplier;
        const handleHighlight = (sourceVisIndex: number, id: string): void => {
            this.handleHighlight(sourceVisIndex, id);
        };
        const handleUnhighlight = (sourceVisIndex: number, id: string): void => {
            this.handleUnhighlight(sourceVisIndex, id);
        };
        for (let i = 0; i < visualizations.length; i++) {
            this.visualizations.push(visualizations[i]);
            visualizations[i].addHighlightingListener(new class implements HighlightingListener {
                shouldBeHighlighted(id: string): void {
                   handleHighlight(i, id);
                }
                shouldBeUnhighlighted(id: string): void {
                    handleUnhighlight(i, id);
                }
            });
        }
    }

    private clearDrawnHighlighting(): void {
        for (let link of this.activeLinks) {
            this.visualizations[link.sourceVisIndex]!.setUnhighlighted(link.source);
            this.visualizations[link.targetVisIndex]!.setUnhighlighted(link.target);
        }
    }

    private drawActiveLinks(): void {
        const colors = this.activeLinks.map((link) => this.colorSupplier.reserveColor(link.source));
        const names = this.activeLinks.map((link) => [this.visualizations[link.sourceVisIndex]!.getName(link.source), this.visualizations[link.targetVisIndex]!.getName(link.target)]);
        for (let i = 0; i < this.activeLinks.length; i++) {
            const link = this.activeLinks[i];
            console.log(link);
            this.visualizations[link.sourceVisIndex]!.highlight(link.source, colors[i]);
            this.visualizations[link.targetVisIndex]!.highlight(link.target, colors[i]);
        }
        for (let listener of this.listeners) {
            listener.reportStateChanged(this.activeLinks.map((link) => link), colors, names);
        }
    }

    private handleHighlight(sourceVisIndex : number, id: string): void {
        console.log("handling highlight " + sourceVisIndex + " " + id);
        this.ensurePrimaryConsistency(sourceVisIndex);
        this.clearDrawnHighlighting();
        console.log(this.getOutgoingLinks(id).length);
        this.getOutgoingLinks(id).forEach((link) => {
            console.log("adding link " + link.source + " " + link.target);
            this.activeLinks.push(link);
        });
        this.drawActiveLinks();
    }

    private handleUnhighlight(sourceVisIndex : number, id: string): void {
        console.log("handling unhighlight " + sourceVisIndex + " " + id);
        this.ensurePrimaryConsistency(sourceVisIndex);
        this.colorSupplier.returnColor(id); 
        this.clearDrawnHighlighting();
        this.getOutgoingLinks(id).forEach((link) => {
            if (this.activeLinks.includes(link)) {
                this.activeLinks.splice(this.activeLinks.indexOf(link), 1);
            }
        });
        this.drawActiveLinks();
    }

    private ensurePrimaryConsistency(sourceVisIndex : number) : void {
        if (this.lastPrimaryVisualizationIndex != sourceVisIndex) {
            this.lastPrimaryVisualizationIndex = sourceVisIndex;
            this.clearDrawnHighlighting();
            this.activeLinks = [];
            this.drawActiveLinks();
        }
    }

    private getOutgoingLinks(id : string) : MediationTraceabilityLink[] {
        return this.traceLinks.filter((link) => link.source == id);
    }

    public addListener(listener : TraceLinkListener) : void {
        this.listeners.push(listener);
    }

    public getActiveLinks() : MediationTraceabilityLink[] {
        const active =[];
        for (let link of this.activeLinks) {
            active.push(link);
        }
        return active
    }
        
}