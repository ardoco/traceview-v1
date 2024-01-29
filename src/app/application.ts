import { HighlightingVisualization } from "../artifactVisualizations/highlightingVisualization";
import { CountingColorSupplier } from "../colorSupplier";
import { TraceabilityLink } from "../classes";
import { TraceLinkListener, VisualizationMediator } from "../visualizationMediator";
import { Config } from "../config";
import { TraceLinkVisualization } from "../artifactVisualizations/traceLinkVisualization";
import { fabricateNewVisPopupPanel } from "../ui/initVisPopup";
import { VisualizationType, fabricateVisualization, getTypeName } from "../artifactVisualizations/visFactory";
import { UIFactory } from "../uiFactory";
import { ResizingHandle, YResizingHandle } from "../ui/resizingHandle";
import { FileManager } from "./fileManager";
import { MediationTraceabilityLink } from "../concepts/mediationTraceLink";
import { Style, StyleableUIElement } from "../style";

interface VisTuple {
    vis : HighlightingVisualization;
    id : number;
    panel : HTMLElement;
    title : string;
}

export class Application implements StyleableUIElement {
    
    public static STYLE : Style = Style.NIGHT;

    protected visTuples : VisTuple[] = [];
    protected childrenPanel : HTMLElement;
    protected mediator : VisualizationMediator;
    protected resizeHandles : ResizingHandle[] = [];
    protected fileManager : FileManager;

    constructor(parent : HTMLElement, fileManager : FileManager, datas : string[], traceLinks : MediationTraceabilityLink[], style : Style) {
        this.fileManager = fileManager;
        const highlightableIdentifiers = [new Set<string>(), new Set<string>(), new Set<string>()];
        for (let link of traceLinks.filter((link) => link.sourceVisIndex < datas.length && link.targetVisIndex < datas.length)) {
            highlightableIdentifiers[link.sourceVisIndex].add(link.source);
            highlightableIdentifiers[link.targetVisIndex].add(link.target);
        }
        parent.innerHTML = "";
        const viewport = document.createElement('div');
        viewport.style.height = "100%";
        viewport.style.width = "98%";
        viewport.style.maxHeight = "98%";
        parent.classList.add("uiBigColumn");
        parent.appendChild(viewport);
        this.childrenPanel = document.createElement('div');
        this.childrenPanel.style.marginTop = "1%";
        this.childrenPanel.style.marginBottom = "1%";
        viewport.appendChild(this.childrenPanel);
        this.childrenPanel.classList.add("uiBigRow");
        this.childrenPanel.style.height = "70%";
        this.childrenPanel.style.width = "100%";
        this.childrenPanel.style.maxHeight = "90%";
        const traceLinkContainer = document.createElement('div');
        traceLinkContainer.style.marginBottom = "1%";
        viewport.appendChild(traceLinkContainer);
        const resizer = new YResizingHandle(viewport, this.childrenPanel, style);
        resizer.setBottomOfHandle(traceLinkContainer);
        traceLinkContainer.style.height = "18%";
        traceLinkContainer.style.width = "100%";
        traceLinkContainer.style.minHeight = "50px";
        traceLinkContainer.style.maxHeight = "50%";
        traceLinkContainer.style.backgroundColor = style.getPaperColor();
        traceLinkContainer.style.border = style.getBorderColor();
        traceLinkContainer.style.margin = "auto";
        UIFactory.fabricateHeader(traceLinkContainer,"40px", "20px", "Trace Links", style);
        const traceLinkPanel = document.createElement('div');
        traceLinkPanel.classList.add("uiBigRow");
        traceLinkPanel.style.height = traceLinkContainer.clientHeight - 41 + "px";
        traceLinkPanel.style.width = "100%";
        traceLinkContainer.appendChild(traceLinkPanel);
        const linkVis = new TraceLinkVisualization(traceLinkPanel,style, 20);
        this.fabricatePlusButtonPanel(this.childrenPanel, 0.05, Application.STYLE);
        this.addVisualizationPanel(this.childrenPanel, getTypeName(0), 0.3,"auto", fabricateVisualization(0,datas[0],[], Application.STYLE));
        this.addVisualizationPanel(this.childrenPanel, getTypeName(1), 0.3,"hidden", fabricateVisualization(1,datas[1],[], Application.STYLE));
        this.addVisualizationPanel(this.childrenPanel, getTypeName(2),0.3,"hidden", fabricateVisualization(2,datas[2],[], Application.STYLE));  
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
        this.mediator.addTraceLinks(traceLinks);
    }
    setStyle(style: Style): void {
        throw new Error("Method not implemented.");
    }

    private removeVisualization(id : number) {
        const index = this.visTuples.findIndex((tuple) => tuple.id == id);
        if (this.visTuples.length > 1) {
            const handleToDelete = this.resizeHandles.splice(index,1)[0];
            if (index > 0) {
                this.resizeHandles[index-1].setRightOfHandle(handleToDelete.getRightOfHandle());
            }
            handleToDelete.remove();
        }
        const targetVis = this.visTuples.splice(index,1)[0];
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
        }, Application.STYLE);
        const maxIndex = this.visTuples.map((tuple : VisTuple) => tuple.id).reduce((a,b) => Math.max(a,b),-1);
        this.visTuples.push({vis : a!, id : maxIndex + 1, panel : panel, title : name});
        this.resizeHandles.push(new ResizingHandle(this.childrenPanel, panel, Application.STYLE));
        if (this.visTuples.length > 1) {
            this.resizeHandles[this.resizeHandles.length-2].setRightOfHandle(panel);
        }
    }

    private fabricatePlusButtonPanel(viewport : HTMLElement, width : number, style : Style) {
        const container = document.createElement('div');
        container.style.backgroundColor = style.getPaperColor();
        container.style.width = (100*width) + '%';
        container.style.border = "1px solid black";
        container.style.flexDirection = "column";
        container.style.display = "flex";
        viewport.appendChild(container);
        container.style.height = container.getBoundingClientRect().width + "px";
        const text = document.createElement('div');
        text.style.fontSize = container.getBoundingClientRect().width / 2    + "px";
        text.style.textAlign = "center";
        text.style.marginTop = "auto";
        text.style.marginBottom = "auto";
        text.style.userSelect = "none";
        text.style.color = style.getSelectableTextColor();
        text.appendChild(document.createTextNode("+"));
        container.appendChild(text);
        container.addEventListener('click', () => {
            fabricateNewVisPopupPanel(this.visTuples.map((tuple) => tuple.vis.getTitle()), (arg: { visTypeIndex: VisualizationType; artifactData: string; outgoingMediationTraceLinks: MediationTraceabilityLink[] }) => {
                const outgoingLinks = arg.outgoingMediationTraceLinks;
                console.log("tls: " + outgoingLinks.length);
                this.addVisualizationPanel(viewport, getTypeName(arg.visTypeIndex ), 0.3,"auto", fabricateVisualization(arg.visTypeIndex,arg.artifactData,outgoingLinks, Application.STYLE));
                this.mediator.appendVisualization(this.visTuples[this.visTuples.length-1].vis);
                this.mediator.addTraceLinks(outgoingLinks);
                return true;
            }, this.fileManager, style);
        });
        return container;
    }
}