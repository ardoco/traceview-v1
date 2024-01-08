import { NLHighlightingVisualization } from "./natLangHighlightingVis";
import { UMLHighlightingVisualization } from "./umlHighlightingVisualization";
import { HighlightingVisualization } from "./highlightingVisualization";
import { CountingColorSupplier } from "./colorSupplier";
import { NLSentence } from "./classes";
import { UMLBase } from "./uml";
import { VisualizationMediator } from "./visualizationMediator";
import { CodeModelTreeVisualization } from "./codeModelTreeVisualization";
import { Config } from "./config";
import { CodeModel } from "./acmClasses";
import { TraceLinkVisualization } from "./traceLinkVisualization";
import { Buttoned } from "./abstractUI";
import { MediationTraceabilityLink } from "./visualizationMediator";

export class SplitVisualization {
    
    leftVisualization : HighlightingVisualization;
    centerVisualization : HighlightingVisualization;
    rightVisualization : HighlightingVisualization;

    constructor(parent : HTMLElement, sentences : NLSentence[], umlObjects : UMLBase[], codeModel : CodeModel,traceLinks : MediationTraceabilityLink[], onClose : () => void) {
        const highlightableIdentifiers = [new Set<string>(), new Set<string>(), new Set<string>()];
        for (let link of traceLinks) {
            highlightableIdentifiers[link.sourceVisIndex].add(link.source);
            highlightableIdentifiers[link.targetVisIndex].add(link.target);
        }   
        console.log(highlightableIdentifiers.map((set) => "" + set.size).reduce((a,b) => a + "," + b));
        parent.innerHTML = "";
        const viewport = document.createElement('div');
        viewport.style.height = "100%";
        viewport.style.width = "98%";
        parent.classList.add("uiBigColumn");
        parent.appendChild(viewport);
        const childrenPanel = document.createElement('div');
        viewport.appendChild(childrenPanel);
        childrenPanel.classList.add("uiBigRow");
        childrenPanel.style.height = "80%";
        childrenPanel.style.width = "100%";
        childrenPanel.style.justifyContent = "space-between";
        const traceLinkContainer = document.createElement('div');
        viewport.appendChild(traceLinkContainer);
        traceLinkContainer.style.height = "18%";
        traceLinkContainer.style.width = "100%";
        traceLinkContainer.style.backgroundColor = Config.PREFERENCE_COLOR_PAPER;
        traceLinkContainer.style.border = "1px solid black";
        traceLinkContainer.style.margin = "auto";
        SplitVisualization.fabricateHeader(traceLinkContainer,"40px", "20px", Config.PREFERENCE_COLOR_ALMOST_MAIN, "Trace Links");
        const traceLinkPanel = document.createElement('div');
        traceLinkPanel.classList.add("uiBigRow");
        traceLinkPanel.style.height = traceLinkContainer.clientHeight - 41 + "px";
        traceLinkPanel.style.width = "100%";
        traceLinkContainer.appendChild(traceLinkPanel);
        const linkVis = new TraceLinkVisualization(traceLinkPanel,Config.PREFERENCE_COLOR_SELECTABLE, Config.PREFERENCE_COLOR_PAPER);
        this.leftVisualization = SplitVisualization.fabricateVisualizationPanel(childrenPanel, "S.A. Description","15%","auto",
            (vp) => new NLHighlightingVisualization(vp, sentences, Array.from(highlightableIdentifiers[0]), Config.PREFERENCE_COLOR_SELECTABLE, Config.PREFERENCE_COLOR_UNSELECTABLE, Config.PREFERENCE_COLOR_PAPER)
        );
        this.centerVisualization = SplitVisualization.fabricateVisualizationPanel(childrenPanel, "UML", "40%","auto",
            (vp) => new UMLHighlightingVisualization(vp, umlObjects, Array.from(highlightableIdentifiers[1]), Config.PREFERENCE_COLOR_SELECTABLE, Config.PREFERENCE_COLOR_UNSELECTABLE, Config.PREFERENCE_COLOR_PAPER)
        );
        this.rightVisualization = SplitVisualization.fabricateVisualizationPanel(childrenPanel, "Code Model","40%","auto",
            (vp) => new CodeModelTreeVisualization(vp, codeModel, Array.from(highlightableIdentifiers[2]), Config.PREFERENCE_COLOR_SELECTABLE, Config.PREFERENCE_COLOR_UNSELECTABLE, Config.PREFERENCE_COLOR_PAPER)
        );
        (childrenPanel.firstChild?.nextSibling! as HTMLElement).style.marginRight = "1%";      
        (childrenPanel.firstChild?.nextSibling! as HTMLElement).style.marginLeft = "1%";        
        const mediator = new VisualizationMediator(traceLinks, [this.leftVisualization, this.centerVisualization, this.rightVisualization], new CountingColorSupplier(30));
        mediator.addListener(linkVis);
    }

    private static fabricateHeader(parent : HTMLElement,height : string, fontSize : string, backgroundColor : string, name : string) {
        const header = document.createElement('div');
        header.style.height = height;
        header.style.fontSize = fontSize;
        header.classList.add('split-vis-half-header');
        header.style.backgroundColor = backgroundColor;
        for (let i = 0; i < 2; i++) {
            const headerChild = document.createElement('div');
            header.appendChild(headerChild);
            headerChild.style.width = '50%';
            headerChild.style.height = '100%';
        }
        header.firstChild!.appendChild(document.createTextNode(name));
        parent.appendChild(header);
        return header;
    }

    private static attachButtons(buttonPanel  : HTMLElement, subject : Buttoned) {
        const headerSize = buttonPanel.getBoundingClientRect().height;
        const gap = 0.45 * headerSize;
        for (let visButton of subject.getButtons()) {
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('split-vis-half-header-button');
            buttonContainer.style.height = headerSize-gap + "px";
            buttonContainer.style.width = headerSize-gap + "px";
            buttonContainer.style.fontSize = gap + "px";
            buttonContainer.style.marginLeft = gap/8 + "px";
            buttonContainer.appendChild(document.createTextNode(visButton.label));
            buttonContainer.addEventListener('click', event => {
                const newValue = visButton.onClick();
                if (visButton.isToggle) {
                    if (newValue) {
                        buttonContainer.style.backgroundColor = Config.PREFERENCE_COLOR_MAIN_SELECTED;
                    } else {
                        buttonContainer.style.backgroundColor = Config.PREFERENCE_COLOR_PAPER;
                    }
                }
                event.stopPropagation();
            });
            if (visButton.isToggle && visButton.startsToggled) {
                buttonContainer.style.backgroundColor = Config.PREFERENCE_COLOR_MAIN_SELECTED;
            }
            buttonPanel.appendChild(buttonContainer);
        }
        buttonPanel.style.display = 'flex';
        buttonPanel.style.justifyContent = 'flex-end';
        buttonPanel.style.alignItems = 'center';
        buttonPanel.style.paddingRight = gap/2 + "px";
    }

    private static fabricateVisualizationPanel<T extends Buttoned>(
        viewport: HTMLElement, name: string, width: string,overflow: string,
        constructorFunction: (vp: HTMLElement) => T): T {
        const container = document.createElement('div');
        const header = this.fabricateHeader(container,'5%', '20px', Config.PREFERENCE_COLOR_ALMOST_MAIN,name);
        container.classList.add('split-vis-half-container');
        container.style.backgroundColor = Config.PREFERENCE_COLOR_PAPER
        container.style.width = width;
        container.style.height = '95%';
        const subViewport = document.createElement('div');
        subViewport.style.height = '95%';
        subViewport.style.width = '100%';
        subViewport.style.overflow = overflow;
        container.appendChild(subViewport);
        viewport.appendChild(container);
        const visualization = constructorFunction(subViewport);
        const buttonPanel = header.lastChild! as HTMLElement;
        SplitVisualization.attachButtons(buttonPanel, visualization);
        return visualization;
    }
}