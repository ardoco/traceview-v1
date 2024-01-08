import { Buttoned, UIButton } from "./abstractUI";

export interface HighlightingListener {
    shouldBeHighlighted(id : string) : void;
    shouldBeUnhighlighted(id : string) : void;
}

export interface HighlightingSubject {
    addHighlightingListener(listener : HighlightingListener) : void;
    highlight(id : string, color : string) : void;
    setUnhighlighted(id : string) : void;
}

export abstract class HighlightingVisualization implements HighlightingSubject, Buttoned {

    private highlightingListeners : HighlightingListener[];
    protected currentlyHighlighted : Map<string,boolean>;

    protected colorSelectable : string;
    protected colorNotSelectable : string;
    protected colorBackground : string;

    constructor(highlightableIds : string[], colorSelctable : string, colorUnselectable : string, colorBackground : string) {
        this.highlightingListeners = [];
        this.currentlyHighlighted = new Map<string,boolean>(highlightableIds.map((id) => [id,false]));
        this.colorSelectable = colorSelctable;
        this.colorNotSelectable = colorUnselectable;
        this.colorBackground = colorBackground;
    }

    protected abstract highlightElement(id: string, color : string): void;
    protected abstract unhighlightElement(id: string): void;

    public abstract getName(id : string) : string;

    getButtons(): UIButton[] {
        return [new UIButton(UIButton.SYMBOL_REFRESH, () => {this.unhighlightAll(); return true;})];
    }

    unhighlightAll() : void {
        for (let id of this.currentlyHighlighted.keys()) {
            if (this.currentlyHighlighted.get(id)) {
                this.toggleHighlight(id);
            }
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

    protected idIsHighlightable(id : string) : boolean {
        return this.currentlyHighlighted.has(id);
    }
}