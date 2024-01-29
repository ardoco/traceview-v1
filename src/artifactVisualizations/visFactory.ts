import { TraceabilityLink } from "../classes";
import { Config } from "../config";
import { parseNLTXT, parseUML } from "../parse/parse";
import { parseCodeFromACM } from "../parse/parseACM";
import { Style } from "../style";
import { CodeModelTreeVisualization } from "./codeModelTreeVisualization";
import { HighlightingVisualization } from "./highlightingVisualization";
import { NLHighlightingVisualization } from "./natLangHighlightingVis";
import { UMLHighlightingVisualization } from "./umlHighlightingVisualization";

export enum VisualizationType {
    NL = 0,
    UML = 1,
    CODE = 2
}

export function fabricateVisualization(visualizationType : VisualizationType, data : string, outgoingLinks : TraceabilityLink[], style : Style) : ((vp: HTMLElement) => HighlightingVisualization) {
    const highlightableIds = outgoingLinks.map((link) => link.source);
    if (visualizationType == VisualizationType.NL) {
        const sentences = parseNLTXT(data);
        return (vp : HTMLElement) => new NLHighlightingVisualization(vp, sentences, highlightableIds, style);
    } else if (visualizationType == VisualizationType.UML) {
        const uml = parseUML(data);
        return (vp : HTMLElement) => new UMLHighlightingVisualization(vp, uml, highlightableIds, style);
    } else if (visualizationType == VisualizationType.CODE) {
        const codeModel = parseCodeFromACM(data);
        return (vp : HTMLElement) => new CodeModelTreeVisualization(vp, codeModel, highlightableIds, style);
    }
    throw new Error("Unknown visualization type index: " + visualizationType);
}

export function getTypeName(typeIndex : number) {
    if (typeIndex == VisualizationType.NL) {
        return Config.NLVIS_TITLE;
    } else if (typeIndex == VisualizationType.UML) {
        return Config.UMLVIS_TITLE;
    } else if (typeIndex == VisualizationType.CODE) {
        return Config.CODEVIS_TITLE;
    }
    throw new Error("Unknown visualization type index: " + typeIndex);
}