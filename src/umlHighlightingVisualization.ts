import * as d3 from 'd3';

import { UMLBase, UMLComponent } from './classes';
import { Random, getTextWidth } from './utils';
import {HighlightingListener, HighlightingSubject, HighlightingVisualization} from './visualizationClasses';

class UMLNode {
    x: number;
    y: number;
    name: string;
    operations: string[];
    type: string;
    identifier : string;

    constructor(x: number, y: number, name: string, identifier : string, operations: string[], type: string) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.operations = operations;
        this.type = type;
        this.identifier = identifier;
    }
  }

class Edge {
    source : number;
    target : number;
    type : string;

    constructor(source : number, target : number, type : string) {
        this.source = source;
        this.target = target;
        this.type = type;
    }
}

export class UMLHighlightingVisualization extends HighlightingVisualization<UMLBase> implements HighlightingSubject {

    protected rootUMLElements : UMLBase[];
    protected plot : d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    protected highlightingListeners : HighlightingListener[];

    constructor(viewport : HTMLElement, classes : UMLBase[], highlightableIds: string[], artifactColors : Map<string,string>) {
        super(highlightableIds);
        this.rootUMLElements = classes;
        this.highlightingListeners = [];
        this.currentlyHighlighted = new Map<string,boolean>();
        this.plot = d3.select("body").append("svg");
        this.init(viewport);
    }

    addHighlightingListener(listener: HighlightingListener): void {
        this.highlightingListeners.push(listener);
    }

    handleClickOn(id: string) : void {
        this.toggleHighlight(id);
    }

    highlight(id: string, tier : 0): void {
        this.plot.selectAll<SVGRectElement, UMLNode>("rect")
        .filter((d) => d.identifier == id)
        .attr("stroke", "red");
        this.plot.selectAll<SVGLineElement, UMLNode>("text")
        .filter((d) => d.identifier == id)
        .attr("stroke", "red")
        .attr("fill", "red");
    }
    unhighlight(id: string, tier : 0): void {
        this.plot.selectAll<SVGRectElement, UMLNode>("rect")
        .filter((d) => d.identifier == id)
        .attr("stroke", "black");
        this.plot.selectAll<SVGLineElement, UMLNode>("text")
        .filter((d) => d.identifier == id)
        .attr("stroke", "black")
        .attr("fill", "black");
    }

    init(viewport: HTMLElement): void {
        const { width, height } = { width: viewport.clientWidth, height: viewport.clientHeight };
        const fontSize : number = 20;
        const xMax : number = 100;
        const yMax : number = 100;
        const pseudoMargin = 10;
        const xScale = d3.scaleLinear()
          .domain([0, xMax])
          .range([0, width]);
      
        const yScale = d3.scaleLinear()
          .domain([0, yMax])
          .range([0, height]);
      
        let randomGen : Random = new Random(this.rootUMLElements.length + 12345);
        const data : UMLNode[] = this.rootUMLElements.map((c) => {
            const operations : string[] = [];
            const x : number = randomGen.next() * (xMax - 2*pseudoMargin) + pseudoMargin;
            const y : number = randomGen.next() * (yMax - 2*pseudoMargin) + pseudoMargin;
            return new UMLNode(x, y, c.constructor.name == "UMLComponent" ? c.getName() : "I:" +c.getName(), c.getIdentifier(), operations, c.constructor.name);
        });
        const precalcTextWidths = new Map<string,number>();
        for (let d of data) {
            precalcTextWidths.set(d.name, getTextWidth(d.name, fontSize) + 30);
        }
        const links : Edge[] = [];

        for (let c of this.rootUMLElements) {
            if (c instanceof UMLComponent) {
                for (let r of c.getInterfaceRealizations()) {
                    r.getTargetId();
                    let indexOfReferencedElement : number = this.rootUMLElements.findIndex((e) => e.getIdentifier() == r.getTargetId());
                    let indexOfComponent : number = this.rootUMLElements.findIndex((e) => e.getIdentifier() == c.getIdentifier());
                    if (indexOfReferencedElement < 0) {
                        throw new Error("Could not find referenced element: " + r.getTargetId());
                    }
                    links.push(new Edge(indexOfComponent, indexOfReferencedElement, this.rootUMLElements[indexOfReferencedElement].constructor.name));
                }
                for (let u of c.getUsages()) {
                    //let indexOfReferencedElement : number = this.rootUMLElements.findIndex((e) => e.getIdentifier() == u.getTargetId());
                    //let indexOfComponent : number = this.rootUMLElements.findIndex((e) => e.getIdentifier() == c.getIdentifier());
                    //links.push(new Edge(indexOfComponent, indexOfReferencedElement, this.rootUMLElements[indexOfReferencedElement].constructor.name));
                }
            }
        }

        this.plot.attr("width", width)
        .attr("height", height);
      
        const svg = document.querySelector('svg');
        if (!svg) {
            throw new Error('Failed to initialize UML highlighting visualization');
        }
        viewport.appendChild(svg);

        this.plot.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("refX", 6)
            .attr("refY", 3)
            .attr("markerWidth", 30)
            .attr("markerHeight", 30)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,0 L0,6 L6,3 Z");

        this.plot.selectAll<SVGLineElement, Edge>("line")
            .data(links)
            .enter()
            .append("line")
            .attr("x1", d => xScale(data[d.source].x))
            .attr("y1", d => yScale(data[d.source].y))
            .attr("x2", d => xScale(data[d.target].x))
            .attr("y2", d => yScale(data[d.target].y))
            .attr("stroke-width", 2)
            .attr("stroke", "black")
            .attr("marker-end", "url(#arrowhead)");

        const isClickable = (d : UMLNode) => this.highlightableIds.indexOf(d.identifier) != -1;

        this.plot.selectAll<SVGRectElement, UMLNode>("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("id", d => d.identifier)
            .attr("x", d => xScale(d.x) - (precalcTextWidths.get(d.name)!) / 2)
            .attr("y", d => yScale(d.y) - 15)
            .attr("width", (d) => (precalcTextWidths.get(d.name)!))
            .attr("height", 30)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("cursor", (d) => isClickable(d) ? "pointer" : "default")
            .classed("uml-node", true)
            .on("click", (i, d : UMLNode) => this.handleClickOn(d.identifier));

        this.plot.selectAll<SVGTextElement, UMLNode>("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => xScale(d.x))
        .attr("y", d => yScale(d.y))
        .attr("dy", 5)
        .attr("dx", 0)
        .attr("text-anchor", "middle")
        .attr("font-size", fontSize)
        .attr("stroke", (d) => isClickable(d) ? "black" : "rgb(110,110,110)")
        .attr("cursor", (d) => isClickable(d) ? "pointer" : "default")
        .text(d => d.name)
        .classed("uml-node", true)
        .on("click", (i, d : UMLNode) => this.handleClickOn(d.identifier));
        
    }
}