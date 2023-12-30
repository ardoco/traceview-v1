import * as d3 from 'd3';

import { UMLBase, UMLComponent, UMLInterface } from './uml';
import { Random, getTextWidth } from './utils';
import {HighlightingListener, HighlightingSubject, HighlightingVisualization} from './highlightingVisualization';
import { ColorSupplier } from './colorSupplier';

const ENVIRONMENT_SCALE = 1;

interface Node extends d3.SimulationNodeDatum {
    id: string;
    width: number;
    height: number;
    name: string;
}

interface Edge extends d3.SimulationLinkDatum<Node> {
    source: string;
    target: string;
    label: string;
}


export class UMLHighlightingVisualization extends HighlightingVisualization {

    protected plot : d3.Selection<SVGSVGElement, unknown, null, undefined>
    constructor(viewport : HTMLElement, classes : UMLBase[], highlightableIds: string[]) {
        super(highlightableIds);
        const fontSize : number = 20;
        const components = classes.filter((c) => c instanceof UMLComponent).map((c) => c as UMLComponent);
        const interfaces = classes.filter((c) => c instanceof UMLInterface).map((c) => c as UMLInterface);
        const nodes : Node[] = components.map((c) => {
            return {id: c.getIdentifier(), width: getTextWidth(c.getName(), fontSize) + 25, height : 32, name: c.getName()};
        });
        const edgeSet = new Set<Edge>();
        for (let c of components) {
            for (let usage of c.getUsages()) {
                for (let otherComponent of components) {
                    if (otherComponent.getInterfaceRealizations().find((r) => r.getTargetId() == usage.getTargetId())) {
                        const nameOfInterface = interfaces.find((c) => c.getIdentifier() == usage.getTargetId() && c.constructor.name == "UMLInterface")!.getName();
                        edgeSet.add({source: c.getIdentifier(), target: otherComponent.getIdentifier(), label: nameOfInterface});
                    }
                }
            }
        }
        const links = Array.from(edgeSet);
        this.plot = d3.select(viewport).append("svg")
            .attr("width", viewport.clientWidth)
            .attr("height", viewport.clientHeight);
        this.secretlyMakeMarkers();
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => (d as any).id).distance(100))
            .force('charge', d3.forceManyBody().strength(d => 1000))
            .force('collision', d3.forceCollide().radius(150))
            .force('center', d3.forceCenter(viewport.clientWidth / 2, viewport.clientHeight / 2));
        const rectDrag = d3.drag<SVGRectElement, Node>()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
        const labelDrag = d3.drag<SVGTextElement, Node>()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
        const linkGroups = this.plot.selectAll<SVGGElement, Edge>("g")
            .data(links)
            .enter()
            .append("g")
            .attr("stroke-width", 2)
            .attr("stroke", HighlightingVisualization.PREFERENCE_COLOR);
        const link2 = linkGroups.append("line");
        const link1 = linkGroups.append("line").attr("marker-end", "url(#semicircle)");
        const node = this.plot.selectAll<SVGRectElement, Node>("rect")
            .data(nodes)
            .enter()
            .append("rect")
            .attr("width", (d) => d.width)
            .attr("height", (d) => d.height)
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("fill", "white")
            .attr("stroke", HighlightingVisualization.PREFERENCE_COLOR)
            .attr("cursor", (d : Node) => this.currentlyHighlighted.has(d.id) ? "pointer" : "default")
            .classed("uml-node", true)
            .on("click", (i, d : Node) => this.handleClickOn(d.id))
            .call(rectDrag);
        const labelSelection = this.plot.selectAll<SVGTextElement, Node>("text")
            .data(nodes)
            .enter()
            .append("text")
            .attr("dy", 5)
            .attr("dx", 0)
            .attr("text-anchor", "middle")
            .attr("font-size", fontSize)
            .attr("stroke", (d : Node) => this.currentlyHighlighted.has(d.id) ? HighlightingVisualization.PREFERENCE_COLOR_SELECTABLE : HighlightingVisualization.PREFERENCE_COLOR_UNSELECTABLE)
            .attr("cursor", (d : Node) => this.currentlyHighlighted.has(d.id) ? "pointer" : "default")
            .text(d => d.name)
            .classed("uml-node", true)
            .on("click  ", (i, d : Node) => this.handleClickOn(d.id))
            .call(labelDrag);
        const edgeLabels = linkGroups.append("text")
            .text(d => d.label)
            .attr("font-size", 0.6 * fontSize)
            .attr("text-anchor", "middle")
            .attr("stroke", HighlightingVisualization.PREFERENCE_COLOR)
            .attr("stroke-dasharray", null)
            .attr("stroke-width", 0.5)
            .attr("dy", -1.2 * fontSize)
            .style("user-select", "none")
            .attr("transform", this.getEdgeLabelTransform(nodes));
        this.redrawEdges(link1, link2,edgeLabels,nodes);
        simulation.on('tick', () => {
            this.redrawEdges(link1,link2,edgeLabels,nodes);
            node
                .attr('x', d => (d as any).x - d.width/ 2)
                .attr('y', d => (d as any).y - d.height / 2);
            labelSelection
                .attr('x', d => (d as any).x)
                .attr('y', d => (d as any).y);
        });
        function dragstarted(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        function dragged(event: any, d: any) {
            d.fx = event.x;
            d.fy = event.y;
        }
        function dragended(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
        for (let i = 0; i < 1000; i++) simulation.tick();
    }
    
    private redrawEdges(firstEdgesSelection  : d3.Selection<SVGLineElement, Edge, SVGSVGElement, unknown>,
        secondEdgesSelection : d3.Selection<SVGLineElement, Edge, SVGSVGElement, unknown>,
        edgeLabels : d3.Selection<SVGTextElement, Edge, SVGSVGElement, unknown>,
        nodes : Node[]
        ) : void {
        firstEdgesSelection
            .attr('x1', d => this.edgeSourcePosition(d).x)
            .attr('y1', d => this.edgeSourcePosition(d).y)
            .attr('x2', d => this.edgeCenterPosition(d).x)
            .attr('y2', d => this.edgeCenterPosition(d).y);
        secondEdgesSelection
            .attr('x1', d => this.edgeCenterPosition(d).x)
            .attr('y1', d => this.edgeCenterPosition(d).y)
            .attr('x2', d => this.edgeTargetPosition(d).x)
            .attr('y2', d => this.edgeTargetPosition(d).y);
        edgeLabels
            .attr('x', d => this.edgeCenterPosition(d).x)
            .attr('y', d => this.edgeCenterPosition(d).y)
            .attr("transform", this.getEdgeLabelTransform(nodes));
    }

    private edgeSourcePosition(d : Edge) : {x : number, y : number} {
        return {x: (d.source as any).x, y: (d.source as any).y};
    }

    private edgeTargetPosition(d : Edge) : {x : number, y : number} {
        return {x: (d.target as any).x, y: (d.target as any).y};
    }

    private edgeCenterPosition(d : Edge) : {x : number, y : number} {
        const source = this.edgeSourcePosition(d);
        const target = this.edgeTargetPosition(d);
        return {x: (source.x + target.x) / 2, y: (source.y + target.y) / 2};
    }

    handleClickOn(id: string) : void {
        this.toggleHighlight(id);
    }

    protected highlightElement(id: string, color : string): void {
        this.setNodeColor(id, color);
    }
    protected unhighlightElement(id: string): void {
        this.setNodeColor(id, HighlightingVisualization.PREFERENCE_COLOR);
    }

    private setNodeColor(id : string, color : string) : void {
        this.plot.selectAll<SVGRectElement, Node>("rect")
            .filter((d) => d.id == id)
            .attr("stroke", color);
        this.plot.selectAll<SVGLineElement, Node>("text")
            .filter((d) => d.id == id)
            .attr("stroke", color)
            .attr("fill", color);
    }

    private getEdgeLabelTransform(data : Node[]) : (d : Edge) => string {
        return (d) => {
            const x1 = this.edgeSourcePosition(d).x;
            const y1 = this.edgeSourcePosition(d).y;
            const x2 = this.edgeTargetPosition(d).x;
            const y2 = this.edgeTargetPosition(d).y;
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
            const angleAdjustment = angle > 90 ? angle - 180 : (angle < -90 ? angle + 180 : angle);
            return "rotate(" + angleAdjustment + "," + ((x1 + x2) / 2) + "," + ((y1 + y2) / 2) + ")";
        }
    }

    private secretlyMakeMarkers() {
        const semiCirclePath = d3.path();
        semiCirclePath.arc(25,25,7,0.5 * Math.PI,0.5 * Math.PI + Math.PI, false);
        semiCirclePath.moveTo(30,25);
        semiCirclePath.arc(25,25,4,0,2*Math.PI);    
        this.plot.append("defs").append("marker")
            .attr("id", "semicircle")
            .attr("refX", 25)
            .attr("refY", 25)
            .attr("markerWidth", 50)
            .attr("markerHeight", 50)
            .attr("orient", "auto")
            .append("path")
            .attr("fill", "white")
            .attr("stroke", HighlightingVisualization.PREFERENCE_COLOR)
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
            .attr("stroke", HighlightingVisualization.PREFERENCE_COLOR)
            .attr("d", "M0,0 L10,5 L0,10");
    }
}