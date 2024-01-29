import { HighlightingListener } from "./artifactVisualizations/highlightingVisualization";
import { HighlightingVisualization } from "./artifactVisualizations/highlightingVisualization";
import { TraceabilityLink } from "./classes";
import { ColorSupplier } from "./colorSupplier";
import { MediationTraceabilityLink } from "./concepts/mediationTraceLink";

export interface TraceLinkListener {  
    reportStateChanged(links : TraceabilityLink[], colors : string[], names : string[][]) : void;
    reportClosed(index : number) : void;
}

export class VisualizationMediator {

    protected traceLinks : MediationTraceabilityLink[] = [];
    protected visualizations : HighlightingVisualization[] = [];
    protected colorSupplier : ColorSupplier;
    protected activeLinks : MediationTraceabilityLink[] = [];
    protected lastPrimaryVisualizationIndex : number = -1;
    protected listeners : TraceLinkListener[] = [];

    constructor(colorSupplier : ColorSupplier) {
        this.colorSupplier = colorSupplier;
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
            this.visualizations[link.sourceVisIndex]!.highlight(link.source, colors[i]);
            this.visualizations[link.targetVisIndex]!.highlight(link.target, colors[i]);
        }
        for (let listener of this.listeners) {
            listener.reportStateChanged(this.activeLinks.map((link) => link), colors, names);
        }
    }

    private handleHighlight(sourceVisIndex : number, id: string): void {
        this.ensurePrimaryConsistency(sourceVisIndex);
        this.clearDrawnHighlighting();
        this.getOutgoingLinks(id).forEach((link) => {
            this.activeLinks.push(link);
        });
        this.drawActiveLinks();
    }

    private handleUnhighlight(sourceVisIndex : number, id: string): void {
        this.ensurePrimaryConsistency(sourceVisIndex);
        this.colorSupplier.returnColor(id); 
        this.clearDrawnHighlighting();
        const lastActiveLinks = this.activeLinks;
        this.activeLinks = [];
        for (let link of lastActiveLinks) {
            if (link.source != id && link.target != id) {
                this.activeLinks.push(link);
            }
        }
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
    private updateHighlightabilityForAllVisualizations() {
        for (let i = 0; i < this.visualizations.length; i++) {
            this.visualizations[i].setHighlightable(this.traceLinks.filter((link) => link.sourceVisIndex == i).map((link) => link.source));
            this.visualizations[i].setHighlightable(this.traceLinks.filter((link) => link.targetVisIndex == i).map((link) => link.target));
        }
    }

    private getOutgoingLinks(id : string) : MediationTraceabilityLink[] {
        return this.traceLinks.filter((link) => link.source == id).concat(this.traceLinks.filter((link) => link.target == id).map((link) => link.reversed()));
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
        
    public removeVisualization(index : number) : void {
        function updateTraceLinks(traceLinks : MediationTraceabilityLink[], index : number) : MediationTraceabilityLink[] {
            return traceLinks.filter((link) => link.sourceVisIndex != index && link.targetVisIndex != index)
                .map((link) => link.sourceVisIndex > index ? new MediationTraceabilityLink(link.source, link.target, link.sourceVisIndex - 1, link.targetVisIndex) : link);
        }
        this.clearDrawnHighlighting();
        this.traceLinks = updateTraceLinks(this.traceLinks, index);
        this.activeLinks = updateTraceLinks(this.activeLinks, index);
        this.drawActiveLinks();
        for (let listener of this.listeners) {
            listener.reportClosed(index);
        }
    }

    public getNumberOfVisualizations() : number {
        return this.visualizations.length;
    }

    public appendVisualization(visualization : HighlightingVisualization) : void {
        this.clearDrawnHighlighting();
        this.activeLinks = [];
        this.visualizations.push(visualization);
        const index = this.visualizations.length - 1;
        const handleHighlight = (sourceVisIndex: number, id: string): void => {
            this.handleHighlight(sourceVisIndex, id);
        };
        const handleUnhighlight = (sourceVisIndex: number, id: string): void => {
            this.handleUnhighlight(sourceVisIndex, id);
        };
        const removeVisualization = (index  : number) : void => {
            this.removeVisualization(index);
        }
        visualization.addHighlightingListener(new class implements HighlightingListener {
            shouldBeHighlighted(id: string): void {
               handleHighlight(index, id);
            }
            shouldBeUnhighlighted(id: string): void {
                handleUnhighlight(index, id);
            }
            shouldClose(): void {
                removeVisualization(index);
            }
        });
    }

    public addTraceLinks(traceLinks : MediationTraceabilityLink[]) : void {
        for (let link of traceLinks) {
            if (link.sourceVisIndex >= this.visualizations.length || link.targetVisIndex >= this.visualizations.length) {
                throw new Error("Trace link with invalid source/target visualization index: " + link.sourceVisIndex + " -> " + link.targetVisIndex);
            }
        }
        this.clearDrawnHighlighting();
        this.activeLinks = [];
        this.traceLinks = this.traceLinks.concat(traceLinks);
        for (let i = 0; i < this.visualizations.length; i++) {
            this.visualizations[i].setHighlightable(this.traceLinks.filter((link) => link.sourceVisIndex == i).map((link) => link.source));
            this.visualizations[i].setHighlightable(this.traceLinks.filter((link) => link.targetVisIndex == i).map((link) => link.target));
        }
    }
}