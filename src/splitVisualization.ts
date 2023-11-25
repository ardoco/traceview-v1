import { NLHighlightingVisualization } from "./highlightingVisualization";
import { UMLHighlightingVisualization } from "./umlHighlightingVisualization";
import { HighlightingListener, HighlightingVisualization } from "./visualizationClasses";
import { NLSentence, TraceabilityLink, UMLBase } from "./classes";

export class SplitVisualization {
    
    traceLinks : TraceabilityLink[];
    leftVisualization : HighlightingVisualization<NLSentence>;
    rightVisualization : HighlightingVisualization<UMLBase>;

    constructor(viewport : HTMLElement, sentences : NLSentence[], umlObjects : UMLBase[], traceLinks : TraceabilityLink[]) {
        this.traceLinks = traceLinks;
        let leftViewport = document.createElement('div');
        let rightViewport = document.createElement('div');
        viewport.appendChild(leftViewport);
        viewport.appendChild(rightViewport);
        leftViewport.setAttribute('id', 'left');
        rightViewport.setAttribute('id', 'right');
        const colors = new Map<string,string>();
        const highlightableSentences = new Set<string>();
        for (let link of traceLinks) {
            highlightableSentences.add(link.source);
            highlightableSentences.add(link.target);
        }
        const highlightableUMLObjects = new Set<string>();
        for (let link of traceLinks) {
            highlightableUMLObjects.add(link.source);
            highlightableUMLObjects.add(link.target);
        }
        this.leftVisualization = new NLHighlightingVisualization(leftViewport, sentences, Array.from(highlightableSentences), colors);
        this.rightVisualization = new UMLHighlightingVisualization(rightViewport, umlObjects, Array.from(highlightableUMLObjects), colors);
        const lv = this.leftVisualization;
        const rv = this.rightVisualization;
        let leftToRightListener : HighlightingListener = new class implements HighlightingListener {
            wasHighlighted(id: string): void {
                traceLinks.filter((link) => link.source == id).forEach((link) => rv.setHighlighted(link.target,true,0));
            }
            wasUnhighlighted(id: string): void {
                traceLinks.filter((link) => link.source == id).forEach((link) => rv.setHighlighted(link.target, false,0));
            }
        }
        let rightToLeftListener : HighlightingListener = new class implements HighlightingListener {
            wasHighlighted(id: string): void {
                const leftIds : string[] = traceLinks.filter((link) => link.target == id).map((link) => link.source);
                leftIds.forEach((leftId) => lv.setHighlighted(leftId, true, 0));

            }
            wasUnhighlighted(id: string): void {
                const leftIds : string[] = traceLinks.filter((link) => link.target == id).map((link) => link.source);
                leftIds.forEach((leftId) => lv.setHighlighted(leftId, false, 0));
            }
        }
        this.leftVisualization.addHighlightingListener(leftToRightListener);
        this.rightVisualization.addHighlightingListener(rightToLeftListener);
    }


}