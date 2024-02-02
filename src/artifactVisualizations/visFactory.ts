import { TraceabilityLink } from "../classes";
import { Config } from "../config";
import { parseNLTXT, parseUML } from "../parse/parse";
import { parseCodeFromACM } from "../parse/parseACM";
import { parseAABBs } from "../parse/parseBBs";
import { Style } from "../style";
import { CodeModelTreeVisualization } from "./codeModelTreeVisualization";
import { DiagramVisualization } from "./diagramVisualization";
import { HighlightingVisualization } from "./highlightingVisualization";
import { NLHighlightingVisualization } from "./natLangHighlightingVis";
import { UMLHighlightingVisualization } from "./umlHighlightingVisualization";

export enum VisualizationType {
    NL = 0,
    UML = 1,
    CODE = 2,
    IMG = 3
}

export function getAllVisualizationTypes() : VisualizationType[] {
    return [VisualizationType.NL, VisualizationType.UML, VisualizationType.CODE, VisualizationType.IMG];
}

export function fabricateVisualization(visualizationType : VisualizationType, data : string[], outgoingLinks : TraceabilityLink[], style : Style) : ((vp: HTMLElement) => HighlightingVisualization) {
    const highlightableIds = outgoingLinks.map((link) => link.source);
    if (visualizationType == VisualizationType.NL) {
        const sentences = parseNLTXT(data[0]);
        return (vp : HTMLElement) => new NLHighlightingVisualization(vp, sentences, highlightableIds, style);
    } else if (visualizationType == VisualizationType.UML) {
        const uml = parseUML(data[0]);
        return (vp : HTMLElement) => new UMLHighlightingVisualization(vp, uml, highlightableIds, style);
    } else if (visualizationType == VisualizationType.CODE) {
        const codeModel = parseCodeFromACM(data[0]);
        return (vp : HTMLElement) => new CodeModelTreeVisualization(vp, codeModel, highlightableIds, style);
    } else if (visualizationType == VisualizationType.IMG) {
        const aabbs = parseAABBs(data[1]);
        return (vp : HTMLElement) => new DiagramVisualization(vp, data[0], aabbs,highlightableIds, style);
    }
    throw new Error("Unknown visualization type index: " + visualizationType);
}

export function getExpectedFileCount(visualizationType : VisualizationType) : number {
    if (visualizationType == VisualizationType.NL) {
        return 1;
    } else if (visualizationType == VisualizationType.UML) {
        return 1;
    } else if (visualizationType == VisualizationType.CODE) {
        return 1;
    } else if (visualizationType == VisualizationType.IMG) {
        return 2;
    }
    throw new Error("Unknown visualization type index: " + visualizationType);
}

export function getTypeName(typeIndex : number) : string {
    if (typeIndex == VisualizationType.NL) {
        return Config.NLVIS_TITLE;
    } else if (typeIndex == VisualizationType.UML) {
        return Config.UMLVIS_TITLE;
    } else if (typeIndex == VisualizationType.CODE) {
        return Config.CODEVIS_TITLE;
    } else if (typeIndex == VisualizationType.IMG) {
        return Config.DIAGRAM_VIS_TITLE;
    }
    throw new Error("Unknown visualization type index: " + typeIndex);
}

export function getType(name : string) {
    if (name == Config.NLVIS_TITLE) {
        return VisualizationType.NL;
    } else if (name == Config.UMLVIS_TITLE) {
        return VisualizationType.UML;
    } else if (name == Config.CODEVIS_TITLE) {
        return VisualizationType.CODE;
    } else if (name == Config.DIAGRAM_VIS_TITLE) {
        return VisualizationType.IMG;
    }
    throw new Error("Unknown visualization type name: " + name);
}