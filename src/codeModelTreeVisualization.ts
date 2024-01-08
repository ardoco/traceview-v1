import * as d3 from "d3";
import { HighlightingVisualization } from "./highlightingVisualization";
import { UMLBase, UMLComponent, UMLInterface } from "./uml";
import { ACMPackage, CodeModel } from "./acmClasses";

interface Node extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    isPackage : boolean;
}

interface Edge extends d3.SimulationLinkDatum<Node> {
    source: string;
    target: string;
    label: string;
}

export class CodeModelTreeVisualization extends HighlightingVisualization {

    protected plot : d3.Selection<SVGSVGElement, unknown, null, undefined>
    protected nodeIdRemapping : Map<string, string>;
    protected codeModel : CodeModel;

    constructor(viewport : HTMLElement, codeModel : CodeModel, highlightableIds: string[], colorSelectable : string, colorNotSelectable : string, backgroundColor : string) {
        super(highlightableIds, colorSelectable, colorNotSelectable, backgroundColor);
        this.codeModel = codeModel;
        const fontSize = 16;
        const scale = 2;
        const treeScale = 0.8;
        for (let id of highlightableIds) {
            console.log(id);
        }
        const nodes : Node[] = [];
        const edges : Edge[] = [];
        this.nodeIdRemapping = new Map<string, string>();
        const contractSingleParentAndChild = true;
        for (let rootPackage of codeModel.getRootPackages()) {
            rootPackage.setIdToPath("");
            CodeModelTreeVisualization.traverseAndAddNodesAndEdges(rootPackage,null,nodes,edges,contractSingleParentAndChild);
        }
        const stratify = d3.stratify<Node>().id((d) => d.id).parentId((d) => {
            const edge = edges.find((e) => e.target === d.id);
            return edge ? edge.source : null;
        });
        const root: d3.HierarchyNode<Node> = stratify(nodes);
        const width = scale * viewport.clientWidth;
        const height = scale * viewport.clientHeight;
        this.plot = d3.select(viewport).append("svg").attr("width", width).attr("height", height);
        viewport.scrollTop = height / 4;
        (viewport.firstChild as HTMLElement).style.backgroundColor = this.colorBackground;
        const treeLayout = d3.tree().size([treeScale *width, treeScale * height]);
        const tree = treeLayout(root as any);
        const offsetX = 50;
        const offsetY = 50;
        this.plot.append('g')
            .attr('transform', `translate(${offsetX}, ${offsetY})`)
            .selectAll('.link')
            .data(tree.links())
            .enter().append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', 'gray')
            .attr('d', d => {
                const pathGenerator = d3.linkHorizontal()
                    .x(d => (d as any).y)
                    .y(d => (d as any).x);
                return pathGenerator(d as any) || '';
            });
        this.plot.append('g')
            .attr('transform', `translate(${offsetX}, ${offsetY})`)
            .selectAll('.node')
            .data(tree.descendants())
            .enter().append('circle')
            .attr('class', 'node')
            .attr('r', d => (d as any).data.isPackage || this.idIsHighlightable((d as any).id) ? 5 : 2)
            .attr('fill', d => this.idIsHighlightable((d as any).id) ? this.colorSelectable : this.colorNotSelectable)
            .attr('cx', d => (d as any).y)
            .attr('cy', d => (d as any).x)
            .on('click', (e,d) => {
                console.log("clicked circle " + d.constructor.name + " " + d.id); 
                this.toggleHighlight((d as any).id);
            });
        this.plot.append('g')
            .attr('transform', `translate(${offsetX}, ${offsetY})`)
            .selectAll('.node-label')
            .data(tree.descendants())
            .enter().append('text')
            .attr('class', 'node-label')
            .attr('x', d => (d as any).y + fontSize)
            .attr('y', d => (d as any).x)
            .text(d => (d.data as any).label)
            .attr("fill", (d) => this.idIsHighlightable((d as any).id) ? this.colorSelectable : this.colorNotSelectable)
            .attr('font-size', fontSize)
            .style('user-select', 'none');  
    }

    protected highlightElement(id: string, color: string): void {
        this.plot.selectAll('.node').filter((d : any) => d.id === id)
            .attr('fill', color);
    }
    protected unhighlightElement(id: string): void {
        this.plot.selectAll('.node').filter((d : any) => d.id === id)
            .attr('fill', this.colorSelectable);
    }

    public getName(id: string): string {
        // find code model element with this id 
        const element = this.codeModel.getElement(id);
        return element != null ? element.name : "?" + id;
    }

    static traverseAndAddNodesAndEdges(pack : ACMPackage, parentId : string | null, nodes : Node[], edges : Edge[], contractSingleParentAndChild : boolean = true) {
        let localPack = pack;
        let localPrefix = pack.name;
        while (contractSingleParentAndChild && localPack.getSubPackages().length === 1 && localPack.getCompilationUnits().length === 0) {
            localPack = localPack.getSubPackages()[0];
            localPrefix += "/" + localPack.name;
        }
        if (parentId != null) {
            edges.push({source: parentId, target: localPack.id, label: ""});
        }
        nodes.push({id: localPack.id, label: localPrefix, isPackage: true});
        for (let subPackage of localPack.getSubPackages()) {
            CodeModelTreeVisualization.traverseAndAddNodesAndEdges(subPackage, localPack.id, nodes, edges, contractSingleParentAndChild);
        }
        for (let compilationUnit of localPack.getCompilationUnits()) {
            const truncatedCompilationUnitId = compilationUnit.id.substring(0, compilationUnit.id.length - 1);
            nodes.push({id:truncatedCompilationUnitId, label: "", isPackage: false});
            edges.push({source: localPack.id, target: truncatedCompilationUnitId, label: ""});
        }
    }
}