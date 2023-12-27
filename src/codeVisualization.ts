import { HighlightingVisualization } from "./highlightingVisualization";


export class CodeVisualization extends HighlightingVisualization {

    constructor(viewport: HTMLElement, highlightableIds: string[]) {
        super(highlightableIds);
    }

    protected highlightElement(id: string, color: string): void {
        throw new Error("Method not implemented.");
    }
    protected unhighlightElement(id: string): void {
        throw new Error("Method not implemented.");
    }
}