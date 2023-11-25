import {NLSentence } from './classes';
import {HighlightingListener, HighlightingVisualization, Visualization} from './visualizationClasses';

export class NLHighlightingVisualization extends HighlightingVisualization<NLSentence> implements Visualization {

    protected visualizedArtifacts : Map<string,NLSentence>;
    protected viewportDiv : HTMLElement;
    protected artifactVisualizations : Map<string,HTMLElement>;
    protected artifactColors : Map<string,string>;
    protected highlightingListeners : HighlightingListener[];

    constructor(viewport : HTMLElement, sentences : NLSentence[], highlightableIds : string[], artifactColors : Map<string,string>) {
        super(highlightableIds);
        this.visualizedArtifacts = new Map<string,NLSentence>();
        this.artifactVisualizations = new Map<string,HTMLElement>();
        for (let artifact of sentences) {
            this.visualizedArtifacts.set(artifact.getIdentifier(), artifact);
        } 
        this.artifactColors = artifactColors;
        this.viewportDiv = viewport;
        this.highlightingListeners = [];
        this.init(viewport);
    }
    
    highlight(id: string): void {
        if (this.artifactVisualizations.has(id)) {
            this.artifactVisualizations.get(id)!.style.color = "red";
        }
    }
    unhighlight(id: string): void {
        if (this.artifactVisualizations.has(id)) {
            this.artifactVisualizations.get(id)!.style.color = "black";
        }
    }

    public init(viewportDiv : HTMLElement) : void {
        this.viewportDiv = viewportDiv;
        this.viewportDiv.style.overflow = "auto";
        const numberOfSentences = this.visualizedArtifacts.size;
        let i : number  = 0;
        for (let artifact of this.visualizedArtifacts.values()) {
            let artifactDiv = document.createElement('div');
            artifactDiv.setAttribute('id', artifact.getIdentifier());
            artifactDiv.classList.add('sentence-item');
            if (this.highlightableIds.indexOf(artifact.getIdentifier()) != -1) {
                artifactDiv.style.cursor = "pointer";
                artifactDiv.addEventListener('mouseover', () => artifactDiv.style.backgroundColor = "lightgrey");
                artifactDiv.addEventListener('mouseout', () => artifactDiv.style.backgroundColor = "white");
            } else {
                artifactDiv.style.color = "rgb(110,110,110)";
            }
            artifactDiv.innerHTML = artifact.getContent();
            this.viewportDiv.appendChild(artifactDiv);
            this.artifactVisualizations.set(artifact.getIdentifier(), artifactDiv);
            this.currentlyHighlighted.set(artifact.getIdentifier(), false);
            artifactDiv.addEventListener('click', () => {
                this.userClickedOnSentence(artifact.getIdentifier());
            });
            if (i == 0) {
                artifactDiv.style.marginTop = "60px";
                artifactDiv.style.borderTop = "0px";
            }
            if (i == numberOfSentences - 1) {
                artifactDiv.style.marginBottom = "60px";
            }
            i++;
        }
    }

    public userClickedOnSentence(id : string) {
        this.toggleHighlight(id);
    }
}