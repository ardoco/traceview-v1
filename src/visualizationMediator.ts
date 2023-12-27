import { HighlightingListener } from "./highlightingVisualization";
import { HighlightingVisualization } from "./highlightingVisualization";
import { IIdentifiable, TraceabilityLink } from "./classes";
import { ColorSupplier } from "./colorSupplier";
import { active } from "d3";

class MediationTraceabilityLink {
    source : string;
    target : string;
    sourceVisIndex : number;
    targetVisIndex : number;

    constructor(source : string, target : string, sourceVisIndex : number, targetVisIndex : number) {
        this.source = source;
        this.target = target;
        this.sourceVisIndex = sourceVisIndex;
        this.targetVisIndex = targetVisIndex;
    }

    reverse() : MediationTraceabilityLink {
        return new MediationTraceabilityLink(this.target, this.source, this.targetVisIndex, this.sourceVisIndex);
    }
}

export class VisualizationMediator {

    protected traceLinks : MediationTraceabilityLink[];
    protected visualizations : HighlightingVisualization[];
    protected colorSupplier : ColorSupplier;
    protected activeLinks : MediationTraceabilityLink[];
    protected lastPrimaryVisualizationIndex : number;

    constructor(traceLinks : TraceabilityLink[][], visualizations : HighlightingVisualization[], colorSupplier : ColorSupplier) {
        this.lastPrimaryVisualizationIndex = 0;
        this.traceLinks = [];
        this.activeLinks = [];
        for (let i = 0; i < traceLinks.length; i++) {
            for (let traceLink of traceLinks[i]) {
                this.traceLinks.push(new MediationTraceabilityLink(traceLink.source, traceLink.target, i, i+1));
                this.traceLinks.push(new MediationTraceabilityLink(traceLink.target, traceLink.source, i+1, i));
            }
        }       
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
        for (let link of this.activeLinks) {
            const color = this.colorSupplier.reserveColor(link.source);
            this.visualizations[link.sourceVisIndex]!.highlight(link.source, color);
            this.visualizations[link.targetVisIndex]!.highlight(link.target, color);
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
}