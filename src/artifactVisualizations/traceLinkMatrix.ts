import * as d3 from "d3";
import { MediationTraceabilityLink } from "../concepts/mediationTraceLink";
import { Style } from "../style";

export class TraceLinkMatrixVisualization {

    protected plot : d3.Selection<SVGSVGElement, unknown, null, undefined>;
    protected indexOfXAxis = 0;
    protected indexOfYAxis = 1;

    constructor(viewport : HTMLElement, artifacts : {identifier : string, name : string}[][], traceLinks : MediationTraceabilityLink[], style : Style) {
        viewport.innerHTML = "";
        const width = 1000;
        const height = 1000;
        this.plot = d3.select(viewport).append("svg")
            .attr("width", width)
            .attr("height", height);
        const svg = this.plot;
        var x = d3.scaleBand()
            .range([ 0, width ])
            .domain(artifacts[this.indexOfXAxis].map(d => d.name))
            .padding(0.05);
        svg.append("g")
            .style("font-size", 15)
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSize(0))
            .select(".domain").remove()
        var y = d3.scaleBand()
            .range([ height, 0 ])
            .domain(artifacts[this.indexOfYAxis].map(d => d.name))
            .padding(0.05);
        svg.append("g")
            .style("font-size", 15)
            .call(d3.axisLeft(y).tickSize(0))
            .select(".domain").remove();
            const cellsGroup = svg.append("g");
            const cells = cellsGroup.selectAll()
            .data(artifacts[this.indexOfYAxis])
            .enter().selectAll("rect")
            .data(d => artifacts[this.indexOfXAxis].map(item => ({ x: item.name, y: d.name })))
            .enter().append("g");
        cells.append("rect")
            .attr("x", d => x(d.x) || 0)
            .attr("y", d => y(d.y) || 0)
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", "steelblue")
            .style("stroke", "white")
            .style("stroke-width", 2)
            .attr("rx", 5)
            .attr("ry", 5);
        cells.append("text")
            .attr("x", d => (x(d.x) || 0) + x.bandwidth() / 2)
            .attr("y", d => (y(d.y) || 0) + y.bandwidth() / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style("fill", "white")
            .style("font-size", 12)
            .text(d => `(${d.x}, ${d.y})`);

        cells.on("mouseover", (event, d) => {
            const tooltip = d3.select("#tooltip");
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`(${d.x}, ${d.y})`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        });
    }
}