import { Buttoned, UIButton } from "../abstractUI";
import { TraceLinkListener } from "../app/visualizationMediator";
import { TraceabilityLink } from "../classes";
import { Style } from "../style";

export class TraceLinkVisualization implements Buttoned, TraceLinkListener {

    protected colorSelectable : string;
    protected viewport : HTMLElement;

    protected lastColors : string[] = [];
    protected lastNames : string[][] = [];
    protected lastReportedState : {text: string, color : string}[];
    protected maxFontSize : number;
    protected style : Style;

    constructor(viewport : HTMLElement, style : Style, fontSize : number) {
        this.style = style;
        style.applyToPanel(viewport);
        this.viewport = document.createElement('div');
        viewport.style.overflow = "auto";
        viewport.appendChild(this.viewport);
        this.viewport.style.width = "90%";
        this.viewport.style.marginLeft = fontSize + "px";
        this.viewport.style.height = "100%";
        this.maxFontSize = fontSize;
        this.viewport.style.backgroundColor = style.getPaperColor();
        this.viewport.style.fontSize = fontSize + "px";
        this.colorSelectable = style.getSelectableTextColor();
        this.lastReportedState = [];
        this.redraw();
    }

    redraw(): void {
        this.viewport.innerHTML = "";
        this.viewport.classList.add("uiBigColumn");
        this.viewport.style.alignItems = "start";
        const linksToAdd = this.lastReportedState.map((state) => state);
        let fontSize = this.maxFontSize;
        let currentRowDiv = document.createElement('div');
        currentRowDiv.classList.add("uiBigRow");
        currentRowDiv.style.marginBottom = fontSize/4 + "px";
        this.viewport.appendChild(currentRowDiv);
        let lastColor = linksToAdd.length > 0 ? linksToAdd[0].color : "";
        while (linksToAdd.length > 0) {
            const link = linksToAdd.pop()!;
            const entry = document.createElement('div');
            entry.appendChild(document.createTextNode(link.text));
            entry.style.color = link.color;
            entry.style.textShadow = "1px 1px 1px" + this.style.getHighlightedTextOutlineColor();
            entry.style.userSelect = "none";
            entry.style.fontSize = fontSize + "px";
            entry.style.whiteSpace = "nowrap";
            entry.style.marginRight = fontSize/2 + "px";
            currentRowDiv.appendChild(entry);
            if (currentRowDiv.getBoundingClientRect().width > this.viewport.getBoundingClientRect().width || link.color != lastColor) {
                entry.remove();
                currentRowDiv = document.createElement('div');
                currentRowDiv.classList.add("uiBigRow");
                this.viewport.appendChild(currentRowDiv);
            }
            lastColor = link.color;
            currentRowDiv.appendChild(entry);
        }
    }


    reportStateChanged(links: TraceabilityLink[], colors: string[], names: string[][]): void {
        this.lastReportedState = [];
        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            const color = colors[i];
            const source = names[i][0];
            const target = names[i][1];
            this.lastReportedState.push({text : "(" + source + " <-> " + target + ")", color : color});
        }
        this.redraw();
    }

    reportClosed(index : number) : void {}

    getButtons(): UIButton[] {
        return [];
    }
}