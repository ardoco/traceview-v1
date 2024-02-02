import { FileManager } from "../app/fileManager";
import { VisualizationType, getAllVisualizationTypes, getTypeName } from "../artifactVisualizations/visFactory";
import { TraceabilityLink } from "../classes";
import { MediationTraceabilityLink } from "../concepts/mediationTraceLink";
import { Config } from "../config";
import { parseNLTXT, parseTraceLinksFromCSV, parseUML } from "../parse/parse";
import { parseCodeFromACM } from "../parse/parseACM";
import { Style } from "../style";

class ProtoVisData {

    protected artifactNames : string[] = [];
    protected type : VisualizationType | null = null;

    constructor(appFileManager : FileManager, linkablesNames : string[]) {

    }

    setType(typeIndex : number) {
        
    }

    setArtifact(index : number, fileName : string) : boolean {
        return false;
    }

    setLinkTo(linkFileName : string, linkableIndex : number, reverse : boolean) : boolean {
        return false;
    }

    finalize() {

    }
}


export function fabricateNewVisPopupPanel(
    otherVisualizationNames: string[], sendToApp: (data: { visTypeIndex: number; artifactData: string[]; outgoingMediationTraceLinks: MediationTraceabilityLink[] }) => boolean, appFileManager : FileManager, style : Style): void {
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
    const bottomPanel = document.createElement('div');
    let selectedTypeIndex = 0;
    const visLabels = getAllVisualizationTypes().map((type) => { return getTypeName(type); });
    const visActions = getAllVisualizationTypes().map((type) => () => {
        selectedTypeIndex = type;
        return 2;
    });
    let artifactData : string[] = [];
    let traceLinks : MediationTraceabilityLink[] = [];
    const typeEntry = fabricatePopupEntry(popup, "Type:", visLabels, visActions, fontSize, false,style);
    typeEntry.style.paddingTop = 4*fontSize + "px";
    typeEntry.style.paddingBottom = 2*fontSize + "px";
    popup.appendChild(bottomPanel);
    bottomPanel.innerHTML = "";
    const protoVisData = new ProtoVisData(appFileManager, otherVisualizationNames);
    const tooLongListener : (artifactFileIndices : number[], linkFileIndices : number[], reverse : boolean[]) => [number,number[]] = (artifactFileIndices : number[], linkFileIndices : number[], reverse : boolean[]) => {
        let artifactDataOK = 0;
        const traceLinkStatuses = [];
        const artifactFileIndex = artifactFileIndices[0];
        if (artifactFileIndex != -1) {
            const fileName = appFileManager.getAllFileNames()[artifactFileIndex];
            const fileContent = appFileManager.getContent(fileName);
            artifactData = [fileContent];
            try {
                if (selectedTypeIndex == VisualizationType.NL) {
                    parseNLTXT(fileContent);
                } else if (selectedTypeIndex == VisualizationType.UML) {
                    parseUML(fileContent);
                } else if (selectedTypeIndex == VisualizationType.CODE) {
                    parseCodeFromACM(fileContent);
                } else if (selectedTypeIndex == VisualizationType.IMG) {
                    // TODO: check if matches image format
                }
                artifactDataOK = 1;
            } catch {
                artifactDataOK = -1;
            }    
        }
        for (let i = 0; i < linkFileIndices.length; i++) {
            if (linkFileIndices[i] == -1) {
                traceLinkStatuses.push(0);
            } else {
                try {
                    const key = appFileManager.getAllFileNames()[linkFileIndices[i]];
                    const fileContent = appFileManager.getContent(key);
                    let localTraceLinks = parseTraceLinksFromCSV(fileContent);
                    localTraceLinks = localTraceLinks.map((link) => reverse[i] ? new TraceabilityLink(link.target, link.source) : new TraceabilityLink(link.source, link.target));
                    traceLinks = traceLinks.concat(localTraceLinks.map((link) => new MediationTraceabilityLink(link.source, link.target, otherVisualizationNames.length, i)));
                    traceLinkStatuses.push(1);
                } catch (e) {
                    traceLinkStatuses.push(-1);
                }
            }
        }
        return [artifactDataOK, traceLinkStatuses];
    };
    fabricateVisualizationInputFilesPanel(bottomPanel, fontSize, otherVisualizationNames, appFileManager, tooLongListener, style);

    const closeButton = document.createElement('div');
    closeButton.classList.add("initVis-bigButton");
    closeButton.style.border = "1px solid " + style.getBorderColor();
    closeButton.style.height = 6*fontSize + "px";
    closeButton.style.fontSize = 2*fontSize + "px";
    closeButton.style.backgroundColor = style.getHeaderColor();
    closeButton.style.color = style.getSelectableTextColor();
    closeButton.appendChild(document.createTextNode("OK"));
    style.applyToButton(closeButton);
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.backgroundColor = style.getButtonStyle().getButtonHoverColor();
    });
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.backgroundColor = style.getButtonStyle().getButtonColor();
    });
    closeButton.addEventListener('mousedown', () => {
        closeButton.style.backgroundColor = style.getButtonStyle().getButtonDownColor();
    });
    closeButton.addEventListener('mouseup', () => {
        if (artifactData.length > 0) {
            sendToApp({visTypeIndex: selectedTypeIndex, artifactData: artifactData.concat([appFileManager.getContent("goldstandard_sad_id_2018.json")]), outgoingMediationTraceLinks: traceLinks}); //TODO
        }
        overlay.remove();
    });
    popup.appendChild(closeButton);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            overlay.remove();
        }
    });
}

export function fabricatePopupEntry(parent : HTMLElement, text : string, options : string[], actions : (() => number)[], fontSizeinPx : number, allowEmpty : boolean = false, style : Style) : HTMLElement {
    const panel = document.createElement('div');
    panel.classList.add("initVis-entry");
    parent.appendChild(panel);
    panel.style.height = 3*fontSizeinPx + "px";
    panel.style.fontSize = fontSizeinPx + "px";
    const textDiv = document.createElement('div');
    textDiv.classList.add("initVis-entry-text");
    textDiv.style.fontSize = fontSizeinPx + "px";
    textDiv.style.color = style.getSelectableTextColor();
    textDiv.appendChild(document.createTextNode(text));
    panel.appendChild(textDiv);
    const artifactDropdown = fabricateDropDown(panel, options, actions.map((action) => () => {
        const status = action();
        if (status == 1) {
            artifactDropdown.style.backgroundColor = "green";
        } else if (status == -1) {
            artifactDropdown.style.backgroundColor = "red";
        } else if (status == 0){
            artifactDropdown.style.backgroundColor = "yellow";
        }
    }), fontSizeinPx, allowEmpty, style);
    artifactDropdown.style.marginLeft = fontSizeinPx + "px";
    artifactDropdown.classList.add("initVis-dropdown");
    const checkboxDiv = document.createElement('div');
    panel.appendChild(checkboxDiv);
    checkboxDiv.style.width = "10%";
    checkboxDiv.style.height = "100%";
    checkboxDiv.style.marginLeft = 0.8*fontSizeinPx + "px";
    checkboxDiv.style.fontSize = 1.4 * fontSizeinPx + "px";
    checkboxDiv.style.color = style.getSelectableTextColor();
    return panel;
}

export function fabricatePopupEntryWithCheckbox(parent : HTMLElement, text : string[], options : string[], actions : (() => number)[], fontSizeinPx : number, allowEmpty : boolean, checkboxAction : (checked : boolean) => void = () => {}, style : Style) : HTMLElement {
    const panel = document.createElement('div');
    panel.classList.add("initVis-entry");
    parent.appendChild(panel);
    panel.style.height = 3*fontSizeinPx + "px";
    panel.style.fontSize = fontSizeinPx + "px";
    const textDiv = document.createElement('div');
    textDiv.classList.add("initVis-entry-text");
    textDiv.style.fontSize = fontSizeinPx + "px";
    textDiv.style.color = style.getSelectableTextColor();
    panel.appendChild(textDiv);
    const artifactDropdown = fabricateDropDown(panel, options, actions.map((action) => () => {
        const status = action();
        if (status == 1) {
            artifactDropdown.style.backgroundColor = "green";
        } else if (status == -1) {
            artifactDropdown.style.backgroundColor = "red";
        } else if (status == 0){
            artifactDropdown.style.backgroundColor = "yellow";
        }
    }), fontSizeinPx, allowEmpty, style);
    artifactDropdown.style.marginLeft = fontSizeinPx + "px";
    artifactDropdown.classList.add("initVis-dropdown");
    const checkboxDiv = document.createElement('div');
    panel.appendChild(checkboxDiv);
    checkboxDiv.classList.add("initVis-entrySwap");
    checkboxDiv.style.marginLeft = 0.8*fontSizeinPx + "px";
    checkboxDiv.style.fontSize = 1.4 * fontSizeinPx + "px";
    checkboxDiv.style.color = style.getSelectableTextColor();
    let swap = false;
    checkboxDiv.appendChild(document.createTextNode("⇄"));
    checkboxDiv.addEventListener('click', () => {
        swap = !swap;
        textDiv.innerHTML = "";
        if (swap) {
            textDiv.appendChild(document.createTextNode("Links | " + text[1] + ", " + text[0] + ":"));
        } else {
            textDiv.appendChild(document.createTextNode("Links | " + text[0] + ", " + text[1] + ":"));
        }
        checkboxAction(swap);
    });
    checkboxDiv.addEventListener('mouseover', () => {
        checkboxDiv.style.color = style.getNotSelectableTextColor();
    });
    checkboxDiv.addEventListener('mouseout', () => {
        checkboxDiv.style.color = style.getSelectableTextColor();
    });
    checkboxDiv.click();
    checkboxDiv.click();
    return panel;
}

export function fabricateDropDown(parent : HTMLElement, options : string[], actions : (() => void)[], fontSizeinPx : number, canBeEmpty : boolean, style : Style) : HTMLSelectElement {
    const select = document.createElement("select");
    const actualOptions = canBeEmpty ? [Config.EMPTY].concat(options) : options;
    parent.appendChild(select);
    for (let option of actualOptions) {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.text = option;
        select.appendChild(optionElement);
    }
    select.addEventListener("change", () => {
        if (select.value != Config.EMPTY) {
            const index = options.indexOf(select.value);
            actions[index]();
        }
    });
    select.style.fontSize = fontSizeinPx + "px";
    select.style.backgroundColor = style.getPaperColor();
    select.style.color = style.getSelectableTextColor();
    select.style.border = "1px solid " + style.getBorderColor();
    select.style.padding = "5px";
    return select;
}

export function fabricateVisualizationInputFilesPanel(container : HTMLElement, fontSize : number, otherVisualizationNames : string[], appFileManager : FileManager,
     handler : (artifactFileIndices : number[], linkFileIndices : number[], reverse : boolean[]) => [number,number[]], style : Style) {
    let selectedArtifactIndices = [-1,-1];
    let selectedLinkIndices = otherVisualizationNames.map(() => -1);
    let selectedReverse = otherVisualizationNames.map(() => false);
    const valueForArtifactSelectedActions = [];
    for (let i = 0; i < appFileManager.getAllFileNames().length; i++) {
        valueForArtifactSelectedActions.push(() => {
            selectedArtifactIndices[0] = i;
            const statuses = handler(selectedArtifactIndices, selectedLinkIndices, selectedReverse);
            return statuses[0];
        });
    };
    fabricatePopupEntry(container, "Artifacts:", appFileManager.getAllFileNames().map((name) => appFileManager.getSymbol(name) + " " +  name), valueForArtifactSelectedActions, fontSize, true, style);
    for (let i = 0; i < otherVisualizationNames.length; i++) {
        const valueSelectedActions = [];
        for (let j = 0; j < appFileManager.getAllFileNames().length; j++) {
            valueSelectedActions.push(() => {
                selectedLinkIndices[i] = j;
                const statuses = handler(selectedArtifactIndices, selectedLinkIndices, selectedReverse);
                return statuses[1][i];
            });
        }
        const checkAction = (checked : boolean) => {
            selectedReverse[i] = checked;
            const statuses = handler(selectedArtifactIndices, selectedLinkIndices, selectedReverse);
        };
        fabricatePopupEntryWithCheckbox(container, ["This", otherVisualizationNames[i]], appFileManager.getAllFileNames().map((name) => appFileManager.getSymbol(name) + " " +  name), valueSelectedActions, fontSize, true, checkAction, style);
    }   
}