import { IIdentifiable } from "./classes";

export interface HighlightingListener {
    wasHighlighted(id : string) : void;
    wasUnhighlighted(id : string) : void;
}

export interface HighlightingSubject {
    addHighlightingListener(listener : HighlightingListener) : void;
}

export interface Visualization extends HighlightingSubject {
    highlight(id : string) : void;
    unhighlight(id : string) : void;
}

export abstract class HighlightingVisualization<T extends IIdentifiable> implements HighlightingSubject {

    protected visualizedArtifacts : Map<string,T>;
    protected highlightingListeners : HighlightingListener[];
    protected highlightableIds : string[];
    protected currentlyHighlighted : Map<string,boolean>;
    protected externalReferencesForcingHighlight : Map<string,number>;

    constructor(highlightableIds : string[]) {
        this.visualizedArtifacts = new Map<string,T>();
        this.highlightingListeners = [];
        this.highlightableIds = highlightableIds;
        this.currentlyHighlighted = new Map<string,boolean>();
        this.externalReferencesForcingHighlight = new Map<string,number>();
        for (let id of highlightableIds) {
            this.currentlyHighlighted.set(id, false);
            this.externalReferencesForcingHighlight.set(id, 0);
        }
    }

    abstract highlight(id: string): void;
    abstract unhighlight(id: string): void;

    setHighlighted(id : string, highlighted : boolean) : void {
        if (this.highlightableIds.indexOf(id) != -1) {
            const numPreviousReferences = this.externalReferencesForcingHighlight.get(id)!;
            this.externalReferencesForcingHighlight.set(id, numPreviousReferences + (highlighted ? 1 : -1));
            if (this.externalReferencesForcingHighlight.get(id)! > 0) {
                this.highlight(id);
                this.currentlyHighlighted.set(id, true);
            } else {
                this.unhighlight(id);
                this.currentlyHighlighted.set(id, false);
            }
        }
    }

    addHighlightingListener(listener: HighlightingListener): void {
        this.highlightingListeners.push(listener);
    }

    toggleHighlight(id : string) : void {
        if (this.highlightableIds.indexOf(id) != -1) {
            if (this.currentlyHighlighted.has(id) && this.currentlyHighlighted.get(id)) {
                this.currentlyHighlighted.set(id, false);
                this.unhighlight(id);
                for (let listener of this.highlightingListeners) {
                    listener.wasUnhighlighted(id);
                }
            } else {
                this.currentlyHighlighted.set(id, true);
                this.highlight(id);
                for (let listener of this.highlightingListeners) {
                    listener.wasHighlighted(id);
                }
            }
        }
    }
}