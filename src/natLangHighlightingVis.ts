import {NLSentence } from './classes';
import {HighlightingListener, HighlightingVisualization} from './highlightingVisualization';

export class NLHighlightingVisualization extends HighlightingVisualization<NLSentence> implements HighlightingVisualization<NLSentence> {

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
    
    highlight(id: string, color : string): void {
        if (this.artifactVisualizations.has(id)) {
            const item = this.artifactVisualizations.get(id)!;
            item.style.color = color;
            item.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
        } else {
            console.error("NLHighlightingVisualization could not find artifactto highlight with id " + id);
        }
    }
    unhighlight(id: string): void {
        if (this.artifactVisualizations.has(id)) {
            this.artifactVisualizations.get(id)!.style.color = "black";
        } else {
            console.error("NLHighlightingVisualization could not find artifact to unhighlight with id " + id);
        }
    }

    public init(viewportDiv : HTMLElement) : void {
        this.viewportDiv = viewportDiv;
        this.viewportDiv.style.overflow = "auto";
        const numberOfSentences = this.visualizedArtifacts.size;
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
            if (this.highlightableIds.indexOf(artifact.getIdentifier()) != -1) {
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
                this.toggleHighlight(artifact.getIdentifier(), this.artifactColors.get(artifact.getIdentifier())!);
            });
            if (i == 0) {
                rowDiv.style.borderTop = "0px";
            }
            i++;
        }
    }
}