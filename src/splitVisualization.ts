import { NLHighlightingVisualization } from "./natLangHighlightingVis";
import { UMLHighlightingVisualization } from "./umlHighlightingVisualization";
import { HighlightingListener, HighlightingVisualization } from "./highlightingVisualization";
import { CountingColorSupplier } from "./colorSupplier";
import { NLSentence, TraceabilityLink } from "./classes";
import { UMLBase } from "./uml";
import { generateRandomRGB } from "./utils";
import { IIdentifiable } from "./classes";
import { VisualizationMediator } from "./visualizationMediator";
import { CodeVisualization } from "./codeVisualization";

export class SplitVisualization {
    
    traceLinks : TraceabilityLink[];
    leftVisualization : HighlightingVisualization;
    centerVisualization : HighlightingVisualization;
    rightVisualization : HighlightingVisualization;

    constructor(viewport : HTMLElement, sentences : NLSentence[], umlObjects : UMLBase[], traceLinks : TraceabilityLink[], onClose : () => void) {
        this.traceLinks = traceLinks;
        viewport.innerHTML = "";
        const highlightableSentences = new Set<string>();
        const highlightableUMLObjects = new Set<string>();
        for (let link of traceLinks) {
            highlightableSentences.add(link.source);
            highlightableUMLObjects.add(link.target);
        }
        this.leftVisualization = SplitVisualization.fabricateVisualizationPanel(viewport, "S.A. Description","15%", false,
            (vp) => new NLHighlightingVisualization(vp, sentences, Array.from(highlightableSentences))
        );
        this.centerVisualization = SplitVisualization.fabricateVisualizationPanel(viewport, "UML", "40%", true,
            (vp) => new UMLHighlightingVisualization(vp, umlObjects, Array.from(highlightableUMLObjects))
        );
        this.rightVisualization = SplitVisualization.fabricateVisualizationPanel(viewport, "Code Model","40%", true,
            (vp) => new CodeVisualization(vp, umlObjects, Array.from(highlightableUMLObjects))
        );
        //(viewport.firstChild! as HTMLElement).style.marginRight = "1%";
        (viewport.firstChild?.nextSibling! as HTMLElement).style.marginRight = "1%";      
        (viewport.firstChild?.nextSibling! as HTMLElement).style.marginLeft = "1%";        
        const mediator = new VisualizationMediator([traceLinks], [this.leftVisualization, this.centerVisualization, this.rightVisualization], new CountingColorSupplier(30));
    }

    private static fabricateVisualizationPanel(
        viewport: HTMLElement, name: string, width: string, hideOverflow: boolean,
        constructorFunction: (vp: HTMLElement) => HighlightingVisualization): HighlightingVisualization {
        const container = document.createElement('div');
        const header = document.createElement('div');
        header.style.height = '5%';
        header.style.fontSize = '20px';
        header.classList.add('split-vis-half-header');
        for (let i = 0; i < 2; i++) {
            const headerChild = document.createElement('div');
            header.appendChild(headerChild);
            headerChild.style.width = '50%';
            headerChild.style.height = '100%';
        }
        container.classList.add('split-vis-half-container');
        container.style.width = width;
        container.style.height = '90%';
        const subViewport = document.createElement('div');
        subViewport.style.height = '95%';
        subViewport.style.width = '100%';
        subViewport.style.overflow = hideOverflow ? 'hidden' : 'auto';
        container.appendChild(header);
        container.appendChild(subViewport);
        container.firstChild!.firstChild!.appendChild(document.createTextNode(name));
        viewport.appendChild(container);
        const visualization = constructorFunction(subViewport);
        const headerSize = header.getBoundingClientRect().height;
        const gap = 0.45 * header.getBoundingClientRect().height;
        const buttonPanel = header.lastChild! as HTMLElement;
        const buttonLabels = ["↺", "X"];
        const buttonFunctions = [() => console.log("RESET"), () => console.log("CLOSE")];
        for (let i = 0; i < buttonLabels.length; i++) {
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('split-vis-half-header-button');
            buttonContainer.style.height = headerSize-gap + "px";
            buttonContainer.style.width = headerSize-gap + "px";
            buttonContainer.style.fontSize = gap + "px";
            buttonContainer.style.marginLeft = gap/8 + "px";
            buttonContainer.appendChild(document.createTextNode(buttonLabels[i]));
            buttonContainer.addEventListener('click', buttonFunctions[i]);
            buttonPanel.appendChild(buttonContainer);
        }
        buttonPanel.style.display = 'flex';
        buttonPanel.style.justifyContent = 'flex-end';
        buttonPanel.style.alignItems = 'center';
        buttonPanel.style.paddingRight = gap/2 + "px";
        return visualization;
    }
}