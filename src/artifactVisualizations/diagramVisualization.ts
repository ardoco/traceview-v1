import { UIButton } from "../abstractUI";
import { ArtefactAABB } from "../artifacts/aabb";
import { Config } from "../config";
import { Style } from "../style";
import { HighlightingVisualization } from "./highlightingVisualization";
import { SVGBasedHighlightingVisualization } from "./svgbasedHighlightingVisualization";
import * as d3 from 'd3';

export class DiagramVisualization extends HighlightingVisualization {

    private readonly zoomMinFactor = 0.1;
    private readonly zoomMaxFactor = 10;

    protected plot: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    protected svgWidth: number;
    protected svgHeight: number;
    private zoomFactor: number = 1;
    private isDragging: boolean = false;
    private dragStart : {x : number, y : number} = {x : 0, y : 0};
    private translation : {x : number, y : number} = {x : 0, y : 0};

    protected boxes : Map<string,ArtefactAABB> = new Map<string,ArtefactAABB>();
    
    constructor(viewport : HTMLElement, imageData : string, aabbs : ArtefactAABB[], highlightableIds: string[], style : Style) {
        super(highlightableIds, Config.DIAGRAM_VIS_TITLE, style);
        for (let box of aabbs) {
            this.boxes.set(box.getIdentifier(), box);
        }
        viewport.style.backgroundColor = style.getPaperColor();
        viewport.style.overflow = "hidden";
        const image = new Image();
        image.src = imageData;
        let plot = null;
        const onLoad = () => {
            plot = d3.select(viewport).append("svg")
                .attr("width", image.width)
                .attr("height", image.height);
            this.svgWidth = image.width;
            this.svgHeight = image.height;
            this.plot.remove();
            this.plot = plot!;
            this.plot
                .append("defs")
                .append("pattern")
                .attr("id", "image-pattern")
                .attr("patternUnits", "userSpaceOnUse")
                .attr("width", image.width)
                .attr("height", image.height)
                .append("image")
                .attr("xlink:href", imageData)
                .attr("width", image.width)
                .attr("height", image.height);
            this.plot
                .append("rect")
                .attr("width", "100%")
                .attr("height", "100%")
                .style("fill", "url(#image-pattern)"); 
            this.plot
                .append("rect")
                .attr("x", image.width / 2 - 50)
                .attr("y", image.height / 2 - 50)
                .attr("width", 100)
                .attr("height", 100)
                .attr("stroke", "red")
                .attr("stroke-width", 5)
                .attr("fill", "none");
                viewport.addEventListener("wheel", (event) => {
                    event.preventDefault();
                    this.zoomFactor = Math.max(this.zoomMinFactor, Math.min(this.zoomMaxFactor, this.zoomFactor * (1 + -event.deltaY / 1000)));
                    this.plot.attr("transform", "translate(" + this.translation.x + "," + this.translation.y + ") scale(" + this.zoomFactor + ")");
                });
                viewport.addEventListener("mousedown", (event) => {
                    this.isDragging = true;
                    this.dragStart = {x : event.clientX, y : event.clientY};
                });
                viewport.addEventListener("mouseup", (event) => {
                    this.isDragging = false;
                });
                viewport.addEventListener("mousemove", (event) => {
                    if (this.isDragging) {
                        const dx = event.clientX - this.dragStart.x;
                        const dy = event.clientY - this.dragStart.y;
                        this.dragStart = {x : event.clientX, y : event.clientY};
                        this.translation.x += dx;
                        this.translation.y += dy;
                        this.plot.attr("transform", "translate(" + this.translation.x + "," + this.translation.y + ") scale(" + this.zoomFactor + ")");
                    }
                });
        };
        this.svgWidth = image.width;
        this.svgHeight = image.height;
        this.plot = d3.select(viewport).append("svg");
        image.onload = onLoad;
    }

    getButtons(): UIButton[] {
        return super.getButtons().concat([new UIButton("Z", "Zoom in", () => {
            this.plot.append("rect").attr("x", 50).attr("y", 50).attr("width", 100).attr("height", 100).attr("stroke", "yellow");   
            return true;
        })]);
    }

    protected highlightElement(id: string, color: string): void {
        //throw new Error("Method not implemented.");
    }
    protected unhighlightElement(id: string): void {
        //throw new Error("Method not implemented.");
    }
    protected setElementsHighlightable(ids: string[]): void {
        //throw new Error("Method not implemented.");
    }
    protected setElementsNotHighlightable(ids: string[]): void {
        //throw new Error("Method not implemented.");
    }
    public getName(id: string): string {
        return "Method not implemented.";
        //throw new Error("Method not implemented."); // return index of box?
    }

    setStyle(style: Style): void {
        throw new Error("Method not implemented.");
    }
}