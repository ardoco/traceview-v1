import { Buttoned, UIButton } from "../abstractUI";
import { TraceLinkListener } from "../visualizationMediator";
import { TraceabilityLink } from "../classes";
import { Style } from "../style";

export class TraceLinkVisualization implements Buttoned, TraceLinkListener {

    protected colorSelectable : string;
    protected viewport : HTMLElement;

    protected lastColors : string[] = [];
    protected lastNames : string[][] = [];
    protected lastReportedState : {text: string, color : string}[];
    protected maxFontSize : number;

    constructor(viewport : HTMLElement, style : Style, fontSize : number) {
        style.applyToPanel(viewport);
        this.viewport = viewport;
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
        const linksToAdd = this.lastReportedState.map((state) => state);
        let fontSize = this.maxFontSize;
        let currentRowDiv = document.createElement('div');
        currentRowDiv.classList.add("uiBigRow");
        this.viewport.appendChild(currentRowDiv); 
        while (linksToAdd.length > 0) {
            const link = linksToAdd.pop()!;
            const entry = document.createElement('div');
            entry.appendChild(document.createTextNode(link.text));
            entry.style.color = link.color;
            entry.style.textShadow = "1px 1px 1px black";
            entry.style.userSelect = "none";
            entry.style.fontSize = fontSize + "px";
            entry.style.whiteSpace = "nowrap";
            entry.style.marginRight = fontSize/2 + "px";
            currentRowDiv.appendChild(entry);
            if (currentRowDiv.getBoundingClientRect().width > this.viewport.getBoundingClientRect().width) {
                entry.remove();
                currentRowDiv = document.createElement('div');
                currentRowDiv.classList.add("uiBigRow");
                this.viewport.appendChild(currentRowDiv);
            }
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

    reportClosed(index : number) : void {
        // Do nothing if state has not changed, if it has changed, reportStateChanged will be called anyway
    }

    getButtons(): UIButton[] {
        return [];
    }
}