import { Buttoned, UIButton } from "../abstractUI";
import { Style, StyleableUIElement } from "../style";

export interface HighlightingListener {
    shouldBeHighlighted(id : string) : void;
    shouldBeUnhighlighted(id : string) : void;
    shouldClose() : void;
}

export interface HighlightingSubject {
    addHighlightingListener(listener : HighlightingListener) : void;
    highlight(id : string, color : string) : void;
    setUnhighlighted(id : string) : void;
}

export abstract class HighlightingVisualization implements HighlightingSubject, Buttoned, StyleableUIElement {

    private highlightingListeners : HighlightingListener[];
    private currentlyHighlighted : Map<string,boolean>;
    private readonly title : string;
    protected readonly id : number;

    protected style : Style;

    constructor(highlightableIds : string[], title : string, style : Style) {
        this.highlightingListeners = [];
        this.title = title;
        this.currentlyHighlighted = new Map<string,boolean>(highlightableIds.map((id) => [id,false]));
        this.style = style;
        this.id = Date.now();
    }

    protected abstract highlightElement(id: string, color : string): void;
    protected abstract unhighlightElement(id: string): void;
    protected abstract setElementsHighlightable(ids : string[]) : void;
    protected abstract setElementsNotHighlightable(ids : string[]) : void;

    public abstract getName(id : string) : string;

    public getID() : number {
        return this.id;
    }

    public getTitle(): string {
        return this.title;
    }

    getButtons(): UIButton[] {
        return [new UIButton(UIButton.SYMBOL_ERASE, "Clear Highlighting", () => {this.unhighlightAll(); return true;}), new UIButton(UIButton.SYMBOL_CLOSE, "Close", () => {this.shouldClose(); return true;})];
    }

    shouldClose(): void {
        for (let listener of this.highlightingListeners) {
            listener.shouldClose();
        }
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

    public setHighlightable(ids : string[]) : void {
        const idsToChange = ids.filter((id) => !this.idIsHighlightable(id));
        this.setElementsHighlightable(idsToChange);
        for (let id of idsToChange) {
            this.currentlyHighlighted.set(id, false);
        }
    }

    public clearHighlightability() : void {
        this.setElementsNotHighlightable(Array.from(this.currentlyHighlighted.keys()));
        this.currentlyHighlighted.clear();
    }

    public setUnhighlightable(ids : string[]) : void {
        const idsToChange = ids.filter((id) => this.idIsHighlightable(id));
        this.setElementsNotHighlightable(idsToChange);
        for (let id of idsToChange) {
            this.currentlyHighlighted.delete(id);
        }
    }

    abstract setStyle(style : Style) : void;
}