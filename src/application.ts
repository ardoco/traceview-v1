import { HighlightingVisualization } from "./artifactVisualizations/highlightingVisualization";
import { CountingColorSupplier } from "./colorSupplier";
import { TraceabilityLink } from "./classes";
import { TraceLinkListener, VisualizationMediator } from "./visualizationMediator";
import { Config } from "./config";
import { TraceLinkVisualization } from "./traceLinkVisualization";
import { Buttoned } from "./abstractUI";
import { MediationTraceabilityLink } from "./visualizationMediator";
import { fabricateNewVisPopupPanel } from "./initVisPopup";
import { VisualizationType, fabricateVisualization, getDesiredWidth, getTypeName } from "./artifactVisualizations/visFactory";
import { UIFactory } from "./uiFactory";
import { ResizingHandle } from "./ui/resizingHandle";

interface VisTuple {
    vis : HighlightingVisualization;
    id : number;
    relativeSize : number;
    panel : HTMLElement;
    title : string;
}

export class Application {
    
    private visTuples : VisTuple[] = [];
    private childrenPanel : HTMLElement;
    private mediator : VisualizationMediator;
    private resizeHandles : ResizingHandle[] = [];

    constructor(parent : HTMLElement, datas : string[], traceLinks : MediationTraceabilityLink[], onClose : () => void) {
        const highlightableIdentifiers = [new Set<string>(), new Set<string>(), new Set<string>()];
        for (let link of traceLinks.filter((link) => link.sourceVisIndex < datas.length && link.targetVisIndex < datas.length)) {
            highlightableIdentifiers[link.sourceVisIndex].add(link.source);
            highlightableIdentifiers[link.targetVisIndex].add(link.target);
        }
        parent.innerHTML = "";
        const viewport = document.createElement('div');
        viewport.style.height = "100%";
        viewport.style.width = "98%";
        parent.classList.add("uiBigColumn");
        parent.appendChild(viewport);
        this.childrenPanel = document.createElement('div');
        viewport.appendChild(this.childrenPanel);
        this.childrenPanel.classList.add("uiBigRow");
        this.childrenPanel.style.height = "80%";
        this.childrenPanel.style.width = "100%";
        const traceLinkContainer = document.createElement('div');
        viewport.appendChild(traceLinkContainer);
        traceLinkContainer.style.height = "18%";
        traceLinkContainer.style.width = "100%";
        traceLinkContainer.style.backgroundColor = Config.PREFERENCE_COLOR_PAPER;
        traceLinkContainer.style.border = "1px solid black";
        traceLinkContainer.style.margin = "auto";
        UIFactory.fabricateHeader(traceLinkContainer,"40px", "20px", Config.PREFERENCE_COLOR_ALMOST_MAIN, "Trace Links");
        const traceLinkPanel = document.createElement('div');
        traceLinkPanel.classList.add("uiBigRow");
        traceLinkPanel.style.height = traceLinkContainer.clientHeight - 41 + "px";
        traceLinkPanel.style.width = "100%";
        traceLinkContainer.appendChild(traceLinkPanel);
        const linkVis = new TraceLinkVisualization(traceLinkPanel,Config.PREFERENCE_COLOR_SELECTABLE, Config.PREFERENCE_COLOR_PAPER);
        this.fabricatePlusButtonPanel(this.childrenPanel, 0.05);
        this.addVisualizationPanel(this.childrenPanel, getTypeName(0), 0.3,"auto", fabricateVisualization(0,datas[0],[]));
        this.addVisualizationPanel(this.childrenPanel, getTypeName(1), 0.3,"hidden", fabricateVisualization(1,datas[1],[]));
        this.addVisualizationPanel(this.childrenPanel, getTypeName(2),0.3,"auto", fabricateVisualization(2,datas[2],[]));  
        //this.addVisualizationPanel(this.childrenPanel, getTypeName(0),getDesiredWidth(0),"auto", fabricateVisualization(0,datas[0],extractTraceLinkOutgoingFromIndex(0)));  
        //this.addVisualizationPanel(this.childrenPanel, getTypeName(1), 0.35,"auto", fabricateVisualization(1,datas[1],extractTraceLinkOutgoingFromIndex(1)));
        //this.addVisualizationPanel(this.childrenPanel, getTypeName(2),0.4,"auto", fabricateVisualization(2,datas[2],extractTraceLinkOutgoingFromIndex(2))); 
        this.mediator = new VisualizationMediator(new CountingColorSupplier(30));
        for (let i = 0; i < this.visTuples.length; i++) {
            this.mediator.appendVisualization(this.visTuples[i].vis);
        }

        this.mediator.addListener(linkVis);
        const removeVisualization = (index  : number) : void => {
            this.removeVisualization(index);
        }
        this.mediator.addListener(new class implements TraceLinkListener {
            reportStateChanged(links: TraceabilityLink[], colors: string[], names: string[][]): void {}
            reportClosed(index: number): void {
                removeVisualization(index);
            }
        });
    }

    private removeVisualization(index : number) {
        const key = this.visTuples.findIndex((tuple) => tuple.id == index);
            const targetVis = this.visTuples.splice(key,1)[0];
            targetVis.panel.remove();
    }

    private addVisualizationPanel(
        viewport: HTMLElement, name: string, width: number,overflow: string,
        constructorFunction: (vp: HTMLElement) => HighlightingVisualization) {
        let a = null;
        const panel = UIFactory.fabricatePanel(viewport, name, width,overflow, (vp2 : HTMLElement) => {
            const constructed = constructorFunction(vp2);
            a = constructed;
            return constructed;
        });
        const maxIndex = this.visTuples.map((tuple : VisTuple) => tuple.id).reduce((a,b) => Math.max(a,b),-1);
        this.visTuples.push({vis : a!, id : maxIndex + 1, relativeSize : width, panel : panel, title : name});
        this.resizeHandles.push(new ResizingHandle(this.childrenPanel, panel));
        if (this.visTuples.length > 1) {
            this.resizeHandles[this.resizeHandles.length-2].setRightOfHandle(panel);
        }
    }

    private fabricatePlusButtonPanel(viewport : HTMLElement, width : number) {
        const container = document.createElement('div');
        //container.classList.add('split-vis-half-container');
        container.style.backgroundColor = Config.PREFERENCE_COLOR_PAPER
        container.style.width = (100*width) + '%';
        container.style.border = "1px solid black";
        container.style.flexDirection = "column";
        container.style.display = "flex";
        viewport.appendChild(container);
        container.style.height = container.getBoundingClientRect().width + "px";
        const text = document.createElement('div');
        text.style.fontSize = container.getBoundingClientRect().width / 2 + "px";
        text.style.textAlign = "center";
        text.style.marginTop = "auto";
        text.style.marginBottom = "auto";
        text.style.userSelect = "none";
        text.appendChild(document.createTextNode("+"));
        container.appendChild(text);
        container.addEventListener('click', () => {
            // send({visTypeIndex: selectedTypeIndex, artifactData: artifactData, traceLinks: traceLinks});
            fabricateNewVisPopupPanel(this.visTuples.map((tuple) => tuple.vis.getTitle()), (arg: { visTypeIndex: VisualizationType; artifactData: string; outgoingMediationTraceLinks: MediationTraceabilityLink[] }) => {
                const outgoingLinks = arg.outgoingMediationTraceLinks; // good enough?
                console.log("tls: " + outgoingLinks.length);
                for (let i = 0; i < Math.min(5,outgoingLinks.length); i++) {
                    console.log(outgoingLinks[i].source + " -> " + outgoingLinks[i].target, "|",outgoingLinks[i].sourceVisIndex + " -> " + outgoingLinks[i].targetVisIndex);
                }
                this.addVisualizationPanel(viewport, getTypeName(arg.visTypeIndex ), getDesiredWidth(arg.visTypeIndex),"auto", fabricateVisualization(arg.visTypeIndex,arg.artifactData,outgoingLinks));
                this.mediator.appendVisualization(this.visTuples[this.visTuples.length-1].vis);
                this.mediator.addTraceLinks(outgoingLinks);
                return true;
            });
        });
        return container;
    }
}