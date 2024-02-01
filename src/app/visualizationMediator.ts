import { HighlightingListener } from "../artifactVisualizations/highlightingVisualization";
import { HighlightingVisualization } from "../artifactVisualizations/highlightingVisualization";
import { TraceabilityLink } from "../classes";
import { ColorSupplier } from "../colorSupplier";
import { MediationTraceabilityLink } from "../concepts/mediationTraceLink";

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
            const sourceVis = this.visualizations.find((vis) => vis.getID() == link.sourceVisIndex)!;
            const targetVis = this.visualizations.find((vis) => vis.getID() == link.targetVisIndex)!;
            sourceVis.setUnhighlighted(link.source);
            targetVis.setUnhighlighted(link.target);
        }
    }

    private drawActiveLinks(): void {
        const colors = this.activeLinks.map((link) => this.colorSupplier.reserveColor(link.source));
        const names = this.activeLinks.map((link) => [this.visualizations.find((vis) => vis.getID() == link.sourceVisIndex)!.getName(link.source), this.visualizations.find((vis) => vis.getID() == link.targetVisIndex)!.getName(link.target)]);
        for (let i = 0; i < this.activeLinks.length; i++) {
            const sourceVis = this.visualizations.find((vis) => vis.getID() == this.activeLinks[i].sourceVisIndex)!;
            const targetVis = this.visualizations.find((vis) => vis.getID() == this.activeLinks[i].targetVisIndex)!;
            const link = this.activeLinks[i];
            sourceVis.highlight(link.source, colors[i]);
            targetVis.highlight(link.target, colors[i]);
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
        
    public removeVisualization(id : number) : void {
        this.clearDrawnHighlighting();
        for (let vis of this.visualizations) {
            vis.clearHighlightability();
        }
        const newTraceLinks = [];
        for (let link of this.traceLinks) {
            if (link.sourceVisIndex != id && link.targetVisIndex != id) {
                newTraceLinks.push(link);
            }
        }
        this.traceLinks = [];
        this.activeLinks = [];
        this.addTraceLinks(newTraceLinks);
        for (let listener of this.listeners) {
            listener.reportClosed(id);
        }
        this.drawActiveLinks();
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
        const removeVisualization = (id  : number) : void => {
            this.removeVisualization(id);
        }
        visualization.addHighlightingListener(new class implements HighlightingListener {
            shouldBeHighlighted(id: string): void {
               handleHighlight(index, id);
            }
            shouldBeUnhighlighted(id: string): void {
                handleUnhighlight(index, id);
            }
            shouldClose(): void {
                removeVisualization(visualization.getID());
            }
        });
    }

    public addTraceLinks(traceLinks : MediationTraceabilityLink[]) : void {
        this.clearDrawnHighlighting();
        this.activeLinks = [];
        this.traceLinks = this.traceLinks.concat(traceLinks);
        for (let vis of this.visualizations) {
            vis.setHighlightable(this.traceLinks.filter((link) => link.sourceVisIndex == vis.getID()).map((link) => link.source));
            vis.setHighlightable(this.traceLinks.filter((link) => link.targetVisIndex == vis.getID()).map((link) => link.target));
        }
    }
}