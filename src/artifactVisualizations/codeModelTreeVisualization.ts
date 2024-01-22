import * as d3 from "d3";
import { HighlightingVisualization } from "./highlightingVisualization";
import { UMLBase, UMLComponent, UMLInterface } from "../uml";
import { ACMPackage, CodeModel } from "../acmClasses";
import { Config } from "../config";
import { SVGBasedHighlightingVisualization } from "./svgbasedHighlightingVisualization";

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

export class CodeModelTreeVisualization extends SVGBasedHighlightingVisualization {

    protected nodeIdRemapping : Map<string, string>;
    protected codeModel : CodeModel;

    constructor(viewport : HTMLElement, codeModel : CodeModel, highlightableIds: string[], colorSelectable : string, colorNotSelectable : string, backgroundColor : string) {
        super(viewport,highlightableIds, Config.CODEVIS_TITLE, colorSelectable, colorNotSelectable, backgroundColor);
        this.codeModel = codeModel;
        const scale = 2;
        const treeScale = 0.5;
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
        viewport.scrollTop = treeScale / 4; // TODO 
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
            .attr('stroke', colorNotSelectable)
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
            .attr('r', (d :any) => this.getNodeStyle(d.data).nodeSize)
            .attr("nodeSize", (d :any) => this.getNodeStyle(d.data).nodeSize)
            .attr('fill', (d : any) => this.getNodeStyle(d.data).color)
            .attr('cx', d => d.y)
            .attr('cy', d => d.x)
            .on('click', (e,d : any) => {
                this.onClick(d.id);
            });
        this.plot.append('g')
            .attr('transform', `translate(${offsetX}, ${offsetY})`)
            .selectAll('.node-label')
            .data(tree.descendants())
            .enter().append('text')
            .attr('class', 'node-label')
            .attr('x', (d : any)=> d.y + this.getNodeStyle(d.data).offsetX)
            .attr('y', (d : any) => d.x - this.getNodeStyle(d.data).offsetY)
            .text(d => (d.data as any).isPackage ? (d.data as any).label : "")
            .attr("fill", (d) => this.idIsHighlightable((d as any).id) ? this.colorSelectable : this.colorNotSelectable)
            .attr('font-size', (d : any) => this.getNodeStyle(d.data).fontSize)
            .style('user-select', 'none');
    }

    protected highlightElement(id: string, color: string): void {
        this.plot.selectAll('.node').filter((d : any) => d.id === id)
            .attr('fill', color);
        this.plot.selectAll('.node-label').filter((d : any) => d.id === id)
            .text((d : any) => this.getName(d.id))
            .style('text-shadow', '1px 1px 1px black')
            .attr('fill', color);
    }
    protected unhighlightElement(id: string): void {
        this.plot.selectAll('.node').filter((d : any) => d.id === id)
            .attr('fill', this.colorSelectable);
        this.plot.selectAll('.node-label').filter((d : any) => d.id === id)
            .text((d : any) => d.data.isPackage ? d.data.label : "")
            .style('text-shadow', 'none')
            .attr('fill', this.colorSelectable);
    }

    protected setElementsHighlightable(ids: string[]): void {
        console.log("change to unhighlightable");
    }
    protected setElementsNotHighlightable(ids: string[]): void {
        console.log("change to highlightable");
    }

    private onClick(id : string) : void {      
        this.toggleHighlight(id);
    }

    private getNodeStyle(node : Node) : {fontSize : number, color : string, nodeSize : number, offsetX : number, offsetY : number} {
        const fontSize = node.isPackage ? 16 : 8;
        return {fontSize : fontSize,
            color : this.idIsHighlightable(node.id) ? this.colorSelectable : this.colorNotSelectable,
            nodeSize : node.isPackage ? 5 : 2,
            offsetX : node.isPackage ? fontSize / 2  : fontSize / 2,
            offsetY : node.isPackage ? fontSize / 4  : 0
        };
    }

    public getName(id: string): string {
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
            const truncatedCompilationUnitId = compilationUnit.id;
            nodes.push({id:truncatedCompilationUnitId, label: compilationUnit.name, isPackage: false});
            edges.push({source: localPack.id, target: truncatedCompilationUnitId, label: ""});
        }
    }
}