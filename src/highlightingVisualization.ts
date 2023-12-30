import { IIdentifiable } from "./classes";
import { ColorSupplier } from "./colorSupplier";

export interface HighlightingListener {
    shouldBeHighlighted(id : string) : void;
    shouldBeUnhighlighted(id : string) : void;
}

export interface HighlightingSubject {
    addHighlightingListener(listener : HighlightingListener) : void;
    highlight(id : string, color : string) : void;
    setUnhighlighted(id : string) : void;
}

export abstract class HighlightingVisualization implements HighlightingSubject {

    protected static PREFERENCE_COLOR = "black";
    protected static  PREFERENCE_COLOR_SELECTABLE = "black";
    protected static  PREFERENCE_COLOR_UNSELECTABLE = "rgb(110,110,110)";


    private highlightingListeners : HighlightingListener[];
    protected currentlyHighlighted : Map<string,boolean>;

    constructor(highlightableIds : string[]) {
        this.highlightingListeners = [];
        this.currentlyHighlighted = new Map<string,boolean>(highlightableIds.map((id) => [id,false]));
    }

    protected abstract highlightElement(id: string, color : string): void;
    protected abstract unhighlightElement(id: string): void;

    unhighlightAll() : void {
        for (let id of this.currentlyHighlighted.keys()) {
            this.unhighlightElement(id);
        }
    }

    public highlight(id: string, color : string): void {
        this.highlightElement(id, color);
        this.currentlyHighlighted.set(id, true);
    }

    public setUnhighlighted(id: string): void {
        this.unhighlightElement(id);
        this.currentlyHighlighted.set(id, false);
    }

    public addHighlightingListener(listener: HighlightingListener): void {
        this.highlightingListeners.push(listener);
    }

    protected toggleHighlight(id : string) : void {
        if (this.currentlyHighlighted.get(id)) {
            for (let listener of this.highlightingListeners) {
                listener.shouldBeUnhighlighted(id);
            }
        } else {
            for (let listener of this.highlightingListeners) {
                listener.shouldBeHighlighted(id);
            }
        }
    }
}