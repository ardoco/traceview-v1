import * as d3 from 'd3';

import { UMLBase, UMLComponent, UMLInterface } from '../uml';
import { getTextWidth } from '../utils';
import { HighlightingVisualization} from './highlightingVisualization';
import { Config } from '../config';
import { UIButton } from '../abstractUI';
import { SVGBasedHighlightingVisualization } from './svgbasedHighlightingVisualization';

const EDGE_LABEL_SCALE = 0.7;
const FONT_SIZE = 15;

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
    id: string;
}

export class UMLHighlightingVisualization extends SVGBasedHighlightingVisualization {

    protected simulation : d3.Simulation<Node, Edge>;
    protected showEdgeLabels : boolean;
    protected dragFrozen : boolean;
    protected edgeLabels : d3.Selection<SVGTextElement, Edge, SVGSVGElement, unknown>;
    protected firstEdgesSelection  : d3.Selection<SVGLineElement, Edge, SVGSVGElement, unknown>;
    protected secondEdgesSelection : d3.Selection<SVGLineElement, Edge, SVGSVGElement, unknown>;
    protected nodes : Node[]

    constructor(viewport : HTMLElement, classes : UMLBase[], highlightableIds: string[], color : string, colorNotSelectable : string, backgroundColor : string) {
        super(viewport,highlightableIds,Config.UMLVIS_TITLE,color, colorNotSelectable, backgroundColor);
        this.showEdgeLabels = true;
        this.dragFrozen = true;
        const components = classes.filter((c) => c instanceof UMLComponent).map((c) => c as UMLComponent);
        const interfaces = classes.filter((c) => c instanceof UMLInterface).map((c) => c as UMLInterface);
        this.nodes = components.map((c) => {
            return {id: c.getIdentifier(), width: getTextWidth(c.getName(), FONT_SIZE) + 25, height : 32, name: c.getName()};
        });
        const edgeSet = new Map<string,Edge>();
        for (let c of components) {
            for (let usage of c.getUsages()) {
                for (let otherComponent of components) {
                    if (otherComponent.getInterfaceRealizations().find((r) => r.getTargetId() == usage.getTargetId())) {
                        const iface = interfaces.find((c) => c.getIdentifier() == usage.getTargetId() && c.constructor.name == "UMLInterface")!;
                        edgeSet.set(c.getIdentifier() + otherComponent.getIdentifier(),{source: c.getIdentifier(), target: otherComponent.getIdentifier(), label: iface.getName(), id: iface.getIdentifier()});
                    }
                }
            }
        }
        const links = Array.from(edgeSet.values());
        viewport.scrollLeft = this.svgWidth / 4;
        viewport.scrollTop = this.svgHeight / 4;
        (viewport.firstChild as HTMLElement).style.backgroundColor = this.colorBackground;
        this.secretlyMakeMarkers();
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(links).id(d => (d as any).id).distance(100))
            .force('charge', d3.forceManyBody().strength(d => 1000))
            .force('collision', d3.forceCollide().radius(d => Math.min((d as any).width, 150)))
            .force('center', d3.forceCenter(this.svgWidth / 2, this.svgHeight / 2));
        const simulation = this.simulation;
        const dragstarted = (event: any, d: any) => {
            if (this.dragFrozen) return;
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        const dragged = (event: any, d: any) => {
            if (this.dragFrozen) return;
            d.fx = event.x;
            d.fy = event.y;
        }
        const dragended = (event: any, d: any) => {
            if (this.dragFrozen) return;
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
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
            .attr("stroke", this.colorSelectable);
        this.secondEdgesSelection = linkGroups.append("line");
        this.firstEdgesSelection = linkGroups.append("line").attr("marker-end", "url(#semicircle)");
        const node = this.plot.selectAll<SVGRectElement, Node>("rect")
            .data(this.nodes)
            .enter()
            .append("rect")
            .attr("width", (d) => d.width)
            .attr("height", (d) => d.height)
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("fill", this.colorBackground)
            .attr("stroke", this.colorSelectable)
            .attr("cursor", (d : Node) => this.idIsHighlightable(d.id) ? "pointer" : "default")
            .classed("uml-node", true)
            .on("click", (i, d : Node) => this.handleClickOn(d.id))
            .call(rectDrag);
        const labelSelection = this.plot.selectAll<SVGTextElement, Node>("text")
            .data(this.nodes)
            .enter()
            .append("text")
            .attr("dy", 5)
            .attr("dx", 0)
            .attr("text-anchor", "middle")
            .attr("font-size", FONT_SIZE)
            .attr("stroke", (d : Node) => this.idIsHighlightable(d.id) ? this.colorSelectable : colorNotSelectable)
            .attr("cursor", (d : Node) => this.idIsHighlightable(d.id) ? "pointer" : "default")
            .text(d => d.name)
            .classed("uml-node", true)
            .on("click  ", (i, d : Node) => this.handleClickOn(d.id))
            .call(labelDrag);
        this.edgeLabels = linkGroups.append("text")
            .text(d => d.label)
            .attr("stroke", (d : Edge) => this.idIsHighlightable(d.id) ? this.colorSelectable : colorNotSelectable)
            .attr("font-size", EDGE_LABEL_SCALE * FONT_SIZE)
            .attr("text-anchor", "middle")
            .attr("stroke-dasharray", null)
            .attr("stroke-width", 0.5)
            .attr("dy", -1.2 * FONT_SIZE)
            .style("user-select", "none")
            .attr("transform", this.getEdgeLabelTransform())
            .on("click", (i, d : Edge) => this.handleClickOn(d.id));
        this.redrawEdges();
        simulation.on('tick', () => {
            this.redrawEdges();
            node
                .attr('x', d => (d as any).x - d.width/ 2)
                .attr('y', d => (d as any).y - d.height / 2);
            labelSelection
                .attr('x', d => (d as any).x)
                .attr('y', d => (d as any).y);
        });
        for (let i = 0; i < 1000; i++) simulation.tick();
    }
    
    private redrawEdges() : void {
        this.firstEdgesSelection
            .attr('x1', d => this.edgeSourcePosition(d).x)
            .attr('y1', d => this.edgeSourcePosition(d).y)
            .attr('x2', d => this.edgeCenterPosition(d).x)
            .attr('y2', d => this.edgeCenterPosition(d).y);
        this.secondEdgesSelection
            .attr('x1', d => this.edgeCenterPosition(d).x)
            .attr('y1', d => this.edgeCenterPosition(d).y)
            .attr('x2', d => this.edgeTargetPosition(d).x)
            .attr('y2', d => this.edgeTargetPosition(d).y);
        this.edgeLabels
            .attr('x', d => this.edgeCenterPosition(d).x)
            .attr('y', d => this.edgeCenterPosition(d).y)
            .attr("transform", this.getEdgeLabelTransform())
            .style("display", this.showEdgeLabels ? "block" : "none");
    }

    getButtons(): UIButton[] {
        const buttons = [new UIButton("❄", "Freeze/Unfreeze Simulation",() => {
                    this.dragFrozen = !this.dragFrozen;
                    return this.dragFrozen;
                }, true, this.dragFrozen),
            new UIButton("⎁", "Toggle Edge Labels", () => {
                    this.showEdgeLabels = !this.showEdgeLabels;
                    this.redrawEdges();
                    return this.showEdgeLabels;
                }, true, this.showEdgeLabels)];
        return buttons.concat(super.getButtons());
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
        this.setEdgeLabelColor(id, color);
    }

    protected unhighlightElement(id: string): void {
        this.setNodeColor(id, this.colorSelectable);
        this.setEdgeLabelColor(id, this.colorSelectable);
    }

    protected setElementsHighlightable(ids: string[]): void {
        for (let id of ids) {
            this.setNodeColor(id, this.colorNotSelectable);
        }
    }
    protected setElementsNotHighlightable(ids: string[]): void {
        for (let id of ids) {
            this.setNodeColor(id, this.colorSelectable);
        }
    }

    public getName(id: string): string {
        const nodeElement = this.nodes.find((n) => n.id == id);
        const edgeElement = this.plot.selectAll<SVGTextElement, Edge>("text")
            .filter((d) => d.id == id);
        if (nodeElement != undefined) {
            return nodeElement.name;
        } else if (edgeElement != undefined) {
            return edgeElement.text();
        }
        return "?";
    }

    private setEdgeLabelColor(id : string, color : string) : void {
        this.plot.selectAll<SVGTextElement, Edge>("text")
            .filter((d) => d.id == id)
            .attr("stroke", color);
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

    private getEdgeLabelTransform() : (d : Edge) => string {
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
            .attr("fill", this.colorBackground)
            .attr("stroke", this.colorSelectable)
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
            .attr("stroke", this.colorSelectable)
            .attr("d", "M0,0 L10,5 L0,10");
    }
}