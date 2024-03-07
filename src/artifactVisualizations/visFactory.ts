import { TraceabilityLink } from "../classes";
import { Config } from "../config";
import { parseNLTXT, } from "../parse/parse";
import { parseUML } from "../parse/parseUML";
import { parseCodeFromACM } from "../parse/parseACM";
import { parseAABBs } from "../parse/parseBBs";
import { Style } from "../style";
import { CodeModelTreeVisualization } from "./codeModelTreeVisualization";
import { DiagramVisualization } from "./diagramVisualization";
import { HighlightingVisualization } from "./highlightingVisualization";
import { NLHighlightingVisualization } from "./natLangHighlightingVis";
import { UMLHighlightingVisualization } from "./umlHighlightingVisualization";

export enum VisualizationType {
    NL,
    UML,
    CODE,
    IMG,
}

export class VisualizationFactory {

    constructor() {}

    /**
     * Returns an array of all visualization types known to this factory. These make up the valid inputs and expected outputs of the factory's methods.
     * @returns An array of all visualization types
     */
    public getAllVisualizationTypes() : VisualizationType[] {
        return [VisualizationType.NL, VisualizationType.UML, VisualizationType.CODE, VisualizationType.IMG];
    }

    /**
     * This function is used to initialize a new visualization of the specified type. It will return a generator function that returns a new visualization of the specified type by parsing the data and attaching it to the specified viewport.
     * @param visualizationType The desired visualization type
     * @param data The data to be parsed into artifacts for the visualization
     * @param style A style object to the new visualization's appearance
     * @returns A generator function that will attach a visualization based on the input data to the specified viewport
     */
    public fabricateVisualization(visualizationType : VisualizationType, data : string[], style : Style) : ((vp: HTMLElement) => HighlightingVisualization) {
        if (visualizationType == VisualizationType.NL) {
            const sentences = parseNLTXT(data[0]);
            return (vp : HTMLElement) => new NLHighlightingVisualization(vp, sentences, [], style);
        } else if (visualizationType == VisualizationType.UML) {
            const uml = parseUML(data[0]);
            return (vp : HTMLElement) => new UMLHighlightingVisualization(vp, uml, [], style);
        } else if (visualizationType == VisualizationType.CODE) {
            const codeModel = parseCodeFromACM(data[0]);
            return (vp : HTMLElement) => new CodeModelTreeVisualization(vp, codeModel, [], style);
        } else if (visualizationType == VisualizationType.IMG) {
            const aabbs = parseAABBs(data[1]);
            return (vp : HTMLElement) => new DiagramVisualization(vp, data[0], aabbs,[], style);
        }
        throw new Error("Unknown visualization type index: " + visualizationType);
    }

    /**
     * Returns the number of files necessary to initialize a visualization of the specified type
     * @param visualizationType The visualization type
     * @returns The number of files required
     */
    public getExpectedFileCount(visualizationType : VisualizationType) : number {
        if ([VisualizationType.NL, VisualizationType.UML, VisualizationType.CODE].includes(visualizationType)) {
            return 1;
        } else if (visualizationType == VisualizationType.IMG) {
            return 2;
        } else {
            throw new Error("Unknown visualization type index: " + visualizationType);
        }
    }

    /**
     * Maps a visualization type index to its corresponding name
     * @param typeIndex The visualization type index
     * @returns The corresponding name
     */
    public getTypeName(typeIndex : number) : string {
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

    /**
     * Maps a visualization type name to its corresponding enum value
     * @param name The visualization type name
     * @returns The corresponding enum value
     */
    public getType(name : string) : VisualizationType {
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

}