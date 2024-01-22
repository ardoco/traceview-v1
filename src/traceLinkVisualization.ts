import { Buttoned, UIButton } from "./abstractUI";
import { TraceLinkListener } from "./visualizationMediator";
import { TraceabilityLink } from "./classes";

export class TraceLinkVisualization implements Buttoned, TraceLinkListener {

    protected colorSelectable : string;
    protected viewport : HTMLElement;

    constructor(viewport : HTMLElement, colorSelectable : string, colorBackground : string) {
        this.viewport = viewport;
        this.viewport.style.backgroundColor = colorBackground;
        this.viewport.style.fontSize = "15pt";
        this.colorSelectable = colorSelectable;
        this.reportStateChanged([],[], []); 
    }

    reportStateChanged(links : TraceabilityLink[], colors : string[], names : string[][]): void {
        this.viewport.innerHTML = "";
        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            const color = colors[i];
            const source = names[i][0];
            const target = names[i][1];
            const linkContainer = document.createElement('div');
            const text = document.createElement("div");
            text.style.color = color;
            text.style.textShadow = "1px 1px 1px black";
            text.style.userSelect = "none";
            text.appendChild(document.createTextNode("(" + source + " -> " + target + ")"));
            this.viewport.appendChild(text);
            this.viewport.appendChild(linkContainer);
            if (i < links.length - 1) {
                const separator = document.createElement("div");
                separator.style.marginRight = "10px";
                separator.style.color = this.colorSelectable;
                separator.style.textShadow = "1px 1px 1px black";
                separator.style.userSelect = "none";
                separator.appendChild(document.createTextNode(","));
                this.viewport.appendChild(separator);
            }
        }   
    }

    reportClosed(index : number) : void {
        // Do nothing if state has not changed, if it has changed, reportStateChanged will be called anyway
    }

    getButtons(): UIButton[] {
        return [];
    }
}