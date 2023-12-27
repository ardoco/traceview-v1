import {NLSentence } from './classes';
import {HighlightingListener, HighlightingVisualization} from './highlightingVisualization';
import {ColorSupplier} from './colorSupplier';

export class NLHighlightingVisualization extends HighlightingVisualization {

    protected visualizedArtifacts : Map<string,NLSentence>;
    protected viewportDiv : HTMLElement;
    protected artifactVisualizations : Map<string,HTMLElement>;

    constructor(viewport : HTMLElement, sentences : NLSentence[], highlightableIds : string[]) {
        super(highlightableIds);
        this.visualizedArtifacts = new Map<string,NLSentence>();
        this.artifactVisualizations = new Map<string,HTMLElement>();
        for (let artifact of sentences) {
            this.visualizedArtifacts.set(artifact.getIdentifier(), artifact);
        } 
        this.viewportDiv = viewport;
        this.viewportDiv.style.overflow = "auto";
        let i : number  = 0;
        for (let artifact of this.visualizedArtifacts.values()) {
            let artifactDiv = document.createElement('div');
            const rowDiv = document.createElement('div');
            const rowNumberDiv = document.createElement('div');
            rowNumberDiv.appendChild(document.createTextNode((i+1) + ""));
            rowNumberDiv.classList.add("sentence-item-row-number");
            rowDiv.classList.add('sentence-item-row');
            artifactDiv.setAttribute('id', artifact.getIdentifier());
            artifactDiv.classList.add('sentence-item');
            if (this.currentlyHighlighted.has(artifact.getIdentifier())) {
                artifactDiv.style.cursor = "pointer";
                artifactDiv.addEventListener('mouseover', () => artifactDiv.style.backgroundColor = "lightgrey");
                artifactDiv.addEventListener('mouseout', () => artifactDiv.style.backgroundColor = "white");
            } else {
                artifactDiv.style.color = "rgb(110,110,110)";
            }
            artifactDiv.appendChild(document.createTextNode(artifact.getContent()));
            rowDiv.appendChild(rowNumberDiv);
            rowDiv.appendChild(artifactDiv);
            this.viewportDiv.appendChild(rowDiv);
            this.artifactVisualizations.set(artifact.getIdentifier(), artifactDiv);
            this.currentlyHighlighted.set(artifact.getIdentifier(), false);
            artifactDiv.addEventListener('click', () => {
                this.toggleHighlight(artifact.getIdentifier());
            });
            if (i == 0) {
                rowDiv.style.borderTop = "0px";
            }
            i++;
        }
    }
    
    protected highlightElement(id: string, color : string): void {
        const item = this.artifactVisualizations.get(id)!;
        item.style.color = color;
        item.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
    }
    protected unhighlightElement(id: string): void {
        this.artifactVisualizations.get(id)!.style.color = "black";
    }
}