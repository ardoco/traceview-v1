import * as d3 from "d3";
import { HighlightingVisualization } from "./highlightingVisualization";
import { UMLBase, UMLComponent, UMLInterface } from "./uml";
import { getTextWidth, Random } from "./utils";

const PREFERENCE_COLOR = "black";
const PREFERENCE_COLOR_SELECTABLE = "black";
const PREFERENCE_COLOR_UNSELECTABLE = "rgb(110,110,110)";

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

export class CodeVisualization extends HighlightingVisualization {

    //protected plot : d3.Selection<SVGSVGElement, unknown, null, undefined>

    constructor(viewport : HTMLElement, classes : UMLBase[], highlightableIds: string[]) {
        super(highlightableIds);
    }

    protected highlightElement(id: string, color: string): void {
        throw new Error("Method not implemented.");
    }
    protected unhighlightElement(id: string): void {
        throw new Error("Method not implemented.");
    }
}