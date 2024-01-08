import * as d3 from "d3";
import { HighlightingVisualization } from "./highlightingVisualization";
import { UMLBase, UMLComponent, UMLInterface } from "./uml";
import { ACMPackage, CodeModel } from "./acmClasses";

interface Node extends d3.SimulationNodeDatum {
    id: string;
    name: string;
    isPackage : boolean;
}

interface Edge extends d3.SimulationLinkDatum<Node> {
    source: string;
    target: string;
    label: string;
}

export class CodeModelNodeLinkVisualization extends HighlightingVisualization {

    protected plot : d3.Selection<SVGSVGElement, unknown, null, undefined>

    constructor(viewport : HTMLElement, codeModel : CodeModel, highlightableIds: string[], colorSelectable : string, colorNotSelectable : string, backgroundColor : string) {
        super(highlightableIds, colorSelectable, colorNotSelectable, backgroundColor);
        const nodes : Node[] = [];
        const edges : Edge[] = [];
        function traverseAndAddNodesAndEdges(pack : ACMPackage) {
            nodes.push({id: pack.id, name: pack.name, isPackage: true});
            for (let subPackage of pack.getSubPackages()) {
                edges.push({source: pack.id, target: subPackage.id, label: ""});
                traverseAndAddNodesAndEdges(subPackage);
            }
            for (let compilationUnit of pack.getCompilationUnits()) {
                nodes.push({id: compilationUnit.id, name: "", isPackage: false});
                edges.push({source: pack.id, target: compilationUnit.id, label: ""});
            }
        }
        for (let rootPackage of codeModel.getRootPackages()) {
            traverseAndAddNodesAndEdges(rootPackage);
        }
        const width = viewport.clientWidth;
        const height = viewport.clientHeight;
        this.plot = d3.select(viewport).append("svg").attr("width", width).attr("height", height);
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(edges).id(d => (d as any).id).distance(15))
            .force("charge", d3.forceManyBody().strength(-15))
            .force("center", d3.forceCenter(width / 2, height / 2));
        const link = this.plot.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(edges)
            .enter().append("line")
            .attr("stroke-width", 2)
            .attr("stroke", "black");
        const node = this.plot.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(nodes)
            .enter().append("g");
        const circles = node.append("circle")
            .attr("r", 5)
            .attr("fill", d => d.isPackage ? "black" : "white")
            .attr("stroke", "black")
            .attr("stroke-width", 2);
        const labels = node.append("text")
            .text((d : Node) => d.name)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("fill", "black").attr("transform", "translate(0,-20)")
            .attr("font-size", "12px");
        simulation.on("tick", () => {
            link
                .attr("x1", (d : any) => (d.source as any).x)
                .attr("y1", (d : any) => (d.source as any).y)
                .attr("x2", (d : any) => (d.target as any).x)
                .attr("y2", (d : any) => (d.target as any).y);
            node
                .attr("transform", (d : any) => "translate(" + d.x + "," + d.y + ")");
        });
        for (let i = 0; i < 1000; i++) {
            simulation.tick();
        }
    }

    public getName(id: string): string {
        throw new Error("Method not implemented.");
    }

    protected highlightElement(id: string, color: string): void {
        throw new Error("Method not implemented.");
    }
    protected unhighlightElement(id: string): void {
        throw new Error("Method not implemented.");
    }
}