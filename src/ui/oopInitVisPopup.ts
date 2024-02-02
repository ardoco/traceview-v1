import { FileManager } from "../app/fileManager";
import { getAllVisualizationTypes, getExpectedFileCount, getType, getTypeName } from "../artifactVisualizations/visFactory";
import { MediationTraceabilityLink } from "../concepts/mediationTraceLink";
import { Config } from "../config";
import { Style } from "../style";

export class Picker {

    protected listeners : ((fileName : string | null) => void)[] = [];

    protected select : HTMLSelectElement;

    constructor(style : Style, options : string[], fontSizeInPx : number, allowEmpty : boolean) {
        this.listeners = [];
        this.select = document.createElement("select");
        const actualOptions = allowEmpty ? [Config.EMPTY].concat(options) : options;
        for (let option of actualOptions) {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.text = option;
            this.select.appendChild(optionElement);
        }
        this.select.addEventListener("change", () => {
            if (this.select.value != Config.EMPTY) {
                this.listeners.forEach((listener) => listener(this.select.value));
            }
        });
        this.select.style.fontSize = fontSizeInPx + "px";
        this.select.style.backgroundColor = style.getPaperColor();
        this.select.style.color = style.getSelectableTextColor();
        this.select.style.border = "1px solid " + style.getBorderColor();
        this.select.style.padding = "5px";
    }

    addListener(listener : (fileName : string | null) => void) {
        this.listeners.push(listener);
    }

    attachTo(parent : HTMLElement) {
        parent.appendChild(this.select);
    
    }
}

export function fabricateNewOOPVisPopupPanel(otherVisualizationNames: string[], 
        sendToApp: (data: { visTypeIndex: number; artifactData: string[]; outgoingMediationTraceLinks: MediationTraceabilityLink[] }) => boolean,
        appFileManager : FileManager, style : Style): void {
            const fontSize = 25;
            const overlay = document.createElement('div');
            overlay.style.position = "fixed";
            overlay.classList.add("popup-background");
            document.body.appendChild(overlay);
            const popup = document.createElement('div');
            popup.classList.add("initVis-popup");
            style.applyToContainer(popup);
            popup.style.backgroundColor =  style.getPaperColor();
            const title = document.createElement('div');
            title.style.fontSize = 1.4 * fontSize + "px";
            title.style.paddingTop = fontSize + "px";
            title.style.paddingBottom = fontSize + "px";
            title.classList.add("initVis-title");
            title.style.color = style.getSelectableTextColor();
            title.style.backgroundColor = style.getHeaderColor();
            popup.appendChild(title);
            title.appendChild(document.createTextNode("New Visualization:"));
            title.style.textDecoration = "underline";
            overlay.appendChild(popup);
            overlay.addEventListener('click', () => {
                overlay.remove();
            });
            popup.addEventListener('click', (event) => {
                event.stopPropagation();
            });
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    overlay.remove();
                }
            });
            const typeDDM = new Picker(style, getAllVisualizationTypes().map((type) => getTypeName(type)), fontSize, true);
            typeDDM.attachTo(popup);
            const artifactsPanel = document.createElement('div');
            artifactsPanel.classList.add("uiBigColumn");
            artifactsPanel.style.marginTop = "50px";
            artifactsPanel.style.width = "100%";   
            style.applyToPanel(artifactsPanel);
            popup.appendChild(artifactsPanel);
            typeDDM.addListener((typeName) => {
                artifactsPanel.innerHTML = "";
                if (typeName != null) {
                    for (let i = 0; i < getExpectedFileCount(getType(typeName)); i++) {
                        const filePicker = new Picker(style, appFileManager.getAllFileNames(), fontSize, false);
                        filePicker.attachTo(artifactsPanel);
                    }
                }
            });
}