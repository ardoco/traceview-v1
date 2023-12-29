import * as d3 from 'd3';

import { UMLBase, UMLComponent, UMLInterface } from './uml';
import { Random, getTextWidth } from './utils';
import {HighlightingListener, HighlightingSubject, HighlightingVisualization} from './highlightingVisualization';
import { ColorSupplier } from './colorSupplier';

const PREFERENCE_COLOR = "black";
const PREFERENCE_COLOR_SELECTABLE = "black";
const PREFERENCE_COLOR_UNSELECTABLE = "rgb(110,110,110)";

class UMLGraphNode {
    x: number;
    y: number;
    width : number;
    height : number;
    name: string;
    type: string;
    identifier : string;

    constructor(x: number, y: number, name: string, identifier : string, type: string, width : number = 0, height : number = 0) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.type = type;
        this.identifier = identifier;
        this.width = width;
        this.height = height;
    }
    
    getBoxPosition(xScale : d3.ScaleLinear<number, number, never>, yScale : d3.ScaleLinear<number, number, never>) : [number,number] {
        return [this.x, this.y];
    }

    getWidth() : number {
        return this.width;
    }

    getHeight() : number {
        return this.height;
    }
  }

class Edge {
    source : number;
    target : number;
    label : string;

    constructor(source : number, target : number, label : string) {
        this.source = source;
        this.target = target;
        this.label = label;
    }
}

export class UMLHighlightingVisualization extends HighlightingVisualization {

    protected plot : d3.Selection<SVGSVGElement, unknown, null, undefined>
    constructor(viewport : HTMLElement, classes : UMLBase[], highlightableIds: string[]) {
        super(highlightableIds);
        const fontSize : number = 20;
        const xMax : number = 100;
        const yMax : number = 100;
        const pseudoMargin = 10;
        let randomGen : Random = new Random(classes.length + 12345.6789);
        const components = classes.filter((c) => c instanceof UMLComponent).map((c) => c as UMLComponent);
        const interfaces = classes.filter((c) => c instanceof UMLInterface).map((c) => c as UMLInterface);
        const data : UMLGraphNode[] = components.map((c) => {
            const x : number = randomGen.next() * (xMax - 2*pseudoMargin) + pseudoMargin;
            const y : number = randomGen.next() * (yMax - 2*pseudoMargin) + pseudoMargin;
            return new UMLGraphNode(x, y, c.getName(), c.getIdentifier(), c.constructor.name, getTextWidth(c.getName(), fontSize) + 25, 32);
        });
        const edgeSet = new Set<Edge>();
        for (let c of components) {
            let indexOfComponent : number = components.findIndex((e) => e.getIdentifier() == c.getIdentifier());
            for (let usage of c.getUsages()) {
                for (let otherComponent of components) {
                    if (otherComponent.getInterfaceRealizations().find((r) => r.getTargetId() == usage.getTargetId())) {
                        const nameOfInterface = interfaces.find((c) => c.getIdentifier() == usage.getTargetId() && c.constructor.name == "UMLInterface")!.getName();
                        const indexOfOtherComponent = components.findIndex((e) => e.getIdentifier() == otherComponent.getIdentifier());
                        edgeSet.add(new Edge(indexOfComponent, indexOfOtherComponent, "I:" + nameOfInterface));
                    }
                }
            }
        }
        const links = Array.from(edgeSet);
        //this.plot = d3.select("body").append("svg");
        //viewport.appendChild(document.querySelector('svg')!);
        this.plot = d3.select(viewport).append("svg");
        this.plot
            .attr("width", viewport.clientWidth)
            .attr("height", viewport.clientHeight);

        const semiCirclePath = d3.path();
        semiCirclePath.arc(25,25,7,0.5 * Math.PI,0.5 * Math.PI + Math.PI, false);
        semiCirclePath.moveTo(30,25);
        semiCirclePath.arc(25,25,4,0,2*Math.PI);            

        const xScale = d3.scaleLinear()
          .domain([0, xMax])
          .range([0, viewport.clientWidth]);
        const yScale = d3.scaleLinear()
          .domain([0, yMax])
          .range([0, viewport.clientHeight]);
        this.plot.append("defs").append("marker")
            .attr("id", "semicircle")
            .attr("refX", 25)
            .attr("refY", 25)
            .attr("markerWidth", 50)
            .attr("markerHeight", 50)
            .attr("orient", "auto")
            .append("path")
            .attr("fill", "white")
            .attr("stroke", PREFERENCE_COLOR)
            .attr('d', semiCirclePath.toString());
        this.plot.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("refX", 5)
            .attr("refY", 5)
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .attr("orient", "auto")
            .append("path")
            .attr("fill", "none")
            .attr("stroke", PREFERENCE_COLOR)
            .attr("d", "M0,0 L10,5 L0,10");
        const edgeGroups = this.plot.selectAll<SVGGElement, Edge>("g")
            .data(links)
            .enter()
            .append("g")
            .attr("stroke-width", 2)
            .attr("stroke", PREFERENCE_COLOR);
        const edgesSecond = edgeGroups.append("line")
            .attr("x1", d => (xScale(data[d.target].x) + xScale(data[d.source].x)) / 2) 
            .attr("y1", d => (yScale(data[d.target].y) + yScale(data[d.source].y)) / 2) 
            .attr("x2", d => xScale(data[d.target].x))
            .attr("y2", d => yScale(data[d.target].y));
        const edgesFirst = edgeGroups.append("line")
            .attr("x1", d => xScale(data[d.source].x))
            .attr("y1", d => yScale(data[d.source].y))
            .attr("x2", d => (xScale(data[d.target].x) + xScale(data[d.source].x)) / 2) 
            .attr("y2", d => (yScale(data[d.target].y) + yScale(data[d.source].y)) / 2)
            .attr("marker-end", "url(#semicircle)");
        const nodesSelection = this.plot.selectAll<SVGRectElement, UMLGraphNode>("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("id", d => d.identifier)
            .attr("x", d => xScale(d.x) - d.getWidth() / 2)
            .attr("y", d => yScale(d.y) - d.getHeight() / 2)
            .attr("width", (d) => d.getWidth())
            .attr("height", (d) => d.getHeight())
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("fill", "white")
            .attr("stroke", PREFERENCE_COLOR)
            .attr("stroke-width", 1)
            .attr("cursor", (d : UMLGraphNode) => this.currentlyHighlighted.has(d.identifier) ? "pointer" : "default")
            .classed("uml-node", true)
            .on("click", (i, d : UMLGraphNode) => this.handleClickOn(d.identifier));
        const labelSelection = this.plot.selectAll<SVGTextElement, UMLGraphNode>("text")
            .data(data)
            .enter()
            .append("text")
            .attr("x", d => xScale(d.x))
            .attr("y", d => yScale(d.y))
            .attr("dy", 5)
            .attr("dx", 0)
            .attr("text-anchor", "middle")
            .attr("font-size", fontSize)
            .attr("stroke", (d : UMLGraphNode) => this.currentlyHighlighted.has(d.identifier) ? PREFERENCE_COLOR_SELECTABLE : PREFERENCE_COLOR_UNSELECTABLE)
            .attr("cursor", (d : UMLGraphNode) => this.currentlyHighlighted.has(d.identifier) ? "pointer" : "default")
            .text(d => d.name)
            .classed("uml-node", true)
            .on("click  ", (i, d : UMLGraphNode) => this.handleClickOn(d.identifier));
        const edgeLabels = edgeGroups.append("text")
            .attr("x", d => (xScale(data[d.target].x) + xScale(data[d.source].x)) / 2)
            .attr("y", d => (yScale(data[d.target].y) + yScale(data[d.source].y)) / 2)
            .text(d => d.label)
            .attr("font-size", 0.6 * fontSize)
            .attr("text-anchor", "middle")
            .attr("stroke", PREFERENCE_COLOR)
            .attr("stroke-dasharray", null)
            .attr("stroke-width", 0.5)
            .attr("dy", -1.2 * fontSize)
            .style("user-select", "none")
            .attr("transform", this.getEdgeLabelTransform(data, xScale, yScale));
        const dragHandler = d3.drag<SVGSVGElement, UMLGraphNode,UMLGraphNode>()
            .on('start', (event : any, d : UMLGraphNode) => {})
            .on('drag', (event : any, d: UMLGraphNode) => {
                d.y  += yScale.invert(event.dy);
                d.x  += xScale.invert(event.dx);
                nodesSelection
                    .attr('x', d => xScale(d.x) - d.getWidth() / 2)
                    .attr('y', d => yScale(d.y) - d.getHeight() / 2);
                labelSelection
                    .attr('x', d => xScale(d.x))
                    .attr('y', d => yScale(d.y));
                edgesFirst
                    .attr("x1", d => xScale(data[d.source].x))
                    .attr("y1", d => yScale(data[d.source].y))
                    .attr("x2", d => (xScale(data[d.target].x) + xScale(data[d.source].x)) / 2)
                    .attr("y2", d => (yScale(data[d.target].y) + yScale(data[d.source].y)) / 2);
                edgesSecond
                    .attr("x1", d => (xScale(data[d.target].x) + xScale(data[d.source].x)) / 2)
                    .attr("y1", d => (yScale(data[d.target].y) + yScale(data[d.source].y)) / 2)
                    .attr("x2", d => xScale(data[d.target].x))
                    .attr("y2", d => yScale(data[d.target].y));
                edgeLabels
                    .attr("x", d => (xScale(data[d.target].x) + xScale(data[d.source].x)) / 2)
                    .attr("y", d => (yScale(data[d.target].y) + yScale(data[d.source].y)) / 2)
                    .attr("transform", this.getEdgeLabelTransform(data, xScale, yScale));
            })
            .on('end', (event : any, d : UMLGraphNode) => {});
        nodesSelection.call(dragHandler as any);
        labelSelection.call(dragHandler as any);    
    }

    handleClickOn(id: string) : void {
        this.toggleHighlight(id);
    }

    protected highlightElement(id: string, color : string): void {
        this.setNodeColor(id, color);
    }
    protected unhighlightElement(id: string): void {
        this.setNodeColor(id, PREFERENCE_COLOR);
    }

    private setNodeColor(id : string, color : string) : void {
        this.plot.selectAll<SVGRectElement, UMLGraphNode>("rect")
            .filter((d) => d.identifier == id)
            .attr("stroke", color);
        this.plot.selectAll<SVGLineElement, UMLGraphNode>("text")
            .filter((d) => d.identifier == id)
            .attr("stroke", color)
            .attr("fill", color);
    }

    private getEdgeLabelTransform(data : UMLGraphNode[], xScale : d3.ScaleLinear<number, number, never>, yScale : d3.ScaleLinear<number, number, never>) : (d : Edge) => string {
        return (d) => {
            const x1 = xScale(data[d.source].x);
            const y1 = yScale(data[d.source].y);
            const x2 = xScale(data[d.target].x);
            const y2 = yScale(data[d.target].y);
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
            const angleAdjustment = angle > 90 ? angle - 180 : (angle < -90 ? angle + 180 : angle);
            return "rotate(" + angleAdjustment + "," + ((x1 + x2) / 2) + "," + ((y1 + y2) / 2) + ")";
        }
    }
}