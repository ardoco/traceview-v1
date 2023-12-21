import { NLHighlightingVisualization } from "./natLangHighlightingVis";
import { UMLHighlightingVisualization } from "./umlHighlightingVisualization";
import { HighlightingListener, HighlightingVisualization } from "./highlightingVisualization";
import { NLSentence, TraceabilityLink } from "./classes";
import { UMLBase } from "./uml";
import { generateRandomRGB } from "./utils";

export class SplitVisualization {
    
    traceLinks : TraceabilityLink[];
    leftVisualization : HighlightingVisualization<NLSentence>;
    rightVisualization : HighlightingVisualization<UMLBase>;

    constructor(viewport : HTMLElement, sentences : NLSentence[], umlObjects : UMLBase[], traceLinks : TraceabilityLink[]) {
        console.log("SplitVisualization constructor called");
        console.log(traceLinks);
        viewport.innerHTML = "";
        const leftName = "Requirements";
        const rightName = "UML";
        this.traceLinks = traceLinks;
        const leftContainer = document.createElement('div');
        const rightContainer = document.createElement('div');
        let leftViewport = document.createElement('div');
        let rightViewport = document.createElement('div');
        const leftTop = document.createElement('div');
        const rightTop = document.createElement('div');
        leftContainer.style.width = "35%";
        leftContainer.style.marginRight = "1%";
        rightContainer.style.width = "55%";
        rightContainer.style.marginLeft = "1%";
        for (let header of [leftTop, rightTop]) {
            header.style.height = '5%';
            header.style.fontSize = '20px';
            header.classList.add('split-vis-half-header');
            for (let i = 0; i < 2; i++) {
                const headerChild = document.createElement('div');
                header.appendChild(headerChild);
                headerChild.style.width = '50%';
                headerChild.style.height = '100%';
            }
        }
        for (let container of [leftContainer, rightContainer]) {
            container.style.height = '90%';
            container.style.backgroundColor = 'rgb(255,255,255)';
            container.style.display = 'inline-block';
            container.style.justifyContent = 'center';
            container.style.border = '1px solid black'; 
            container.style.flexDirection = 'column';
        }
        for (let viewport of [leftViewport, rightViewport]) {
            viewport.style.height = '95%';
            viewport.style.width = '100%';
        }
        rightViewport.style.overflow = 'hidden';
        leftContainer.appendChild(leftTop);
        leftContainer.appendChild(leftViewport);
        rightContainer.appendChild(rightTop);
        rightContainer.appendChild(rightViewport);
        rightContainer.firstChild!.firstChild!.appendChild(document.createTextNode(rightName));
        leftContainer.firstChild!.firstChild!.appendChild(document.createTextNode(leftName));
        viewport.appendChild(leftContainer);
        viewport.appendChild(rightContainer);
        const highlightableSentences = new Set<string>();
        const highlightableUMLObjects = new Set<string>();
        for (let link of traceLinks) {
            highlightableSentences.add(link.source);
            highlightableUMLObjects.add(link.target);
            //highlightableSentences.add(link.target); why was this here and link.source for the inverse (used to be below)? did both vis get all identifier???
        }
        const sentenceColors = new Map<string,string>();
        const umlColors = new Map<string,string>();
        for (let sentence of highlightableSentences) {
            sentenceColors.set(sentence,generateRandomRGB());
        }
        for (let umlobject of highlightableUMLObjects) {
            umlColors.set(umlobject,generateRandomRGB());
        }
        this.leftVisualization = new NLHighlightingVisualization(leftViewport, sentences, Array.from(highlightableSentences), sentenceColors);
        this.rightVisualization = new UMLHighlightingVisualization(rightViewport, umlObjects, Array.from(highlightableUMLObjects), umlColors);
        const lv = this.leftVisualization;
        const rv = this.rightVisualization;
        let leftToRightListener : HighlightingListener = new class implements HighlightingListener {
            wasHighlighted(id: string): void {
                traceLinks.filter((link) => link.source == id).forEach((link) => rv.setHighlighted(link.target,true,sentenceColors.get(id)!));
            }
            wasUnhighlighted(id: string): void {
                traceLinks.filter((link) => link.source == id).forEach((link) => rv.setHighlighted(link.target, false,sentenceColors.get(id)!));
            }
        }
        let rightToLeftListener : HighlightingListener = new class implements HighlightingListener {
            wasHighlighted(id: string): void {
                const leftIds : string[] = traceLinks.filter((link) => link.target == id).map((link) => link.source);
                leftIds.forEach((leftId) => lv.setHighlighted(leftId, true, umlColors.get(id)!));

            }
            wasUnhighlighted(id: string): void {
                const leftIds : string[] = traceLinks.filter((link) => link.target == id).map((link) => link.source);
                leftIds.forEach((leftId) => lv.setHighlighted(leftId, false, umlColors.get(id)!));
            }
        }
        this.leftVisualization.addHighlightingListener(leftToRightListener);
        this.rightVisualization.addHighlightingListener(rightToLeftListener);
    }


}