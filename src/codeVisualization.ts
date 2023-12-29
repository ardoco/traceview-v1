import * as d3 from "d3";
import { HighlightingVisualization } from "./highlightingVisualization";

interface Node extends d3.SimulationNodeDatum {
  id: string;
}

export class CodeVisualization extends HighlightingVisualization {

    protected plot : d3.Selection<SVGSVGElement, unknown, null, undefined>

    constructor(viewport: HTMLElement, highlightableIds: string[]) {
        super(highlightableIds);
        this.plot = d3.select(viewport).append("svg")
            .attr("width", viewport.clientWidth)
            .attr("height", viewport.clientHeight);
        const nodes : Node[] = [
            { id: 'A' },
            { id: 'B' },
            { id: 'C' },
            { id: 'D' },
        ];
        const links = [
            { source: 'A', target: 'B' },
            { source: 'B', target: 'C' },
            { source: 'C', target: 'A' },
            { source: 'D', target: 'A' },
        ];
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => (d as any).id))
            .force('charge', d3.forceManyBody().strength(-1000))
            .force('center', d3.forceCenter(viewport.clientWidth / 2, viewport.clientHeight / 2));
        const link = this.plot.selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('stroke', '#999')
            .attr('stroke-width', '1');

        const drag = d3.drag<SVGCircleElement, Node>()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);

        const node = this.plot.selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('r', 10)
            .attr('fill', '#4285f4')
            .call(drag);
        simulation.on('tick', () => {
            link
                .attr('x1', d => (d.source as any).x)
                .attr('y1', d => (d.source as any).y)
                .attr('x2', d => (d.target as any).x)
                .attr('y2', d => (d.target as any).y);
            node
                .attr('cx', d => (d as any).x)
                .attr('cy', d => (d as any).y);
        });
        simulation.on('tick', () => {
        link
            .attr('x1', d => (d.source as any).x!)
            .attr('y1', d => (d.source as any).y!)
            .attr('x2', d => (d.target as any).x!)
            .attr('y2', d => (d.target as any).y!);

        node
            .attr('cx', d => d.x!)
            .attr('cy', d => d.y!);
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
    }

    protected highlightElement(id: string, color: string): void {
        throw new Error("Method not implemented.");
    }
    protected unhighlightElement(id: string): void {
        throw new Error("Method not implemented.");
    }
}