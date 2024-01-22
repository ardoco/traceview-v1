import { TraceabilityLink } from "./classes";
import { Config } from "./config";
import { parseNLTXT, parseTraceLinksFromCSV, parseUML } from "./parse";
import { parseCodeFromACM } from "./parseACM";
import { MediationTraceabilityLink } from "./visualizationMediator";

export function fabricateNewVisPopupPanel(
    otherVisualizationNames: string[], send: (data: { visTypeIndex: number; artifactData: string; outgoingMediationTraceLinks: MediationTraceabilityLink[] }) => boolean): void {
    const fontSize = 20;
    const overlay = document.createElement('div');
    overlay.style.position = "fixed";
    overlay.classList.add("popup-background");
    document.body.appendChild(overlay);
    const popup = document.createElement('div');
    popup.classList.add("cradlePopup");
    popup.style.backgroundColor = Config.PREFERENCE_COLOR_PAPER; 
    popup.style.width = "50%";
    popup.style.height = (1.618 * 50) + "%";
    popup.style.paddingTop = 1.2 * fontSize + "px";
    const title = document.createElement('div');
    title.style.fontSize = 1.2 * fontSize + "px";
    title.style.textAlign = "center";
    title.style.userSelect = "none";
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
    const visLabels = ["Description", "UML", "Code"];
    const visActions = [
        () => {
            selectedTypeIndex = 0;
            return 2;
        },
        () => {
            selectedTypeIndex = 1;
            return 2;
        },
        () => {
            selectedTypeIndex = 2;
            return 2;
        }
    ];
    let currentFiles = new Map<string, string>();
    let artifactData = "";
    let traceLinks : MediationTraceabilityLink[] = [];
    const handler = (files : Map<string, string>) => {
        bottomPanel.innerHTML = "";
        currentFiles = files;
        makeVisParamPanel(bottomPanel, fontSize, otherVisualizationNames, files, (artifactFileIndex : number, linkFileIndices : number[], reverse : boolean[]) => {
            let artifactDataOK = 0;
            const traceLinkStatuses = [];
            if (artifactFileIndex != -1) {
                const fileName = Array.from(files.keys())[artifactFileIndex];
                const fileContent = files.get(fileName)!;
                artifactData = fileContent;
                try {
                    if (selectedTypeIndex == 0) {
                        parseNLTXT(fileContent);
                    } else if (selectedTypeIndex == 1) {
                        parseUML(fileContent);
                    } else if (selectedTypeIndex == 2) {
                        parseCodeFromACM(fileContent);
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
                        const key = Array.from(files.keys())[linkFileIndices[i]];
                        const fileContent = files.get(key)!;
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
        });
    }
    fabricateDragAndDropChute(popup, fontSize, handler);
    fabricatePopupEntry(popup, "Type:", visLabels, visActions, fontSize);
    popup.appendChild(bottomPanel);
    handler(new Map());
    const closeButton = document.createElement('div');
    closeButton.classList.add("cradlePopup-bigButton");
    closeButton.style.width = "90%";
    closeButton.style.height = 2*fontSize + "px";
    closeButton.style.fontSize = 1.5*fontSize + "px";
    closeButton.style.backgroundColor = Config.PREFERENCE_COLOR_ALMOST_MAIN
    closeButton.appendChild(document.createTextNode("Instantiate"));
    closeButton.addEventListener('click', () => {
        if (artifactData != "") {
            send({visTypeIndex: selectedTypeIndex, artifactData: artifactData, outgoingMediationTraceLinks: traceLinks});
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

export function fabricatePopupEntry(parent : HTMLElement, text : string, options : string[], actions : (() => number)[], fontSizeinPx : number, allowEmpty : boolean = false) : HTMLElement {
    return fabricatePopupEntryInner(parent, text, options, actions, fontSizeinPx, false, "", () => {},allowEmpty);
}

export function fabricatePopupEntryWithCheckbox(parent : HTMLElement, text : string, options : string[], actions : (() => number)[], fontSizeinPx : number, allowEmpty : boolean, checkboxLabel : string, checkboxAction : (checked : boolean) => void = () => {}) : HTMLElement {
    return fabricatePopupEntryInner(parent, text, options, actions, fontSizeinPx, true, checkboxLabel, checkboxAction, allowEmpty);
}

export function fabricatePopupEntryInner(parent : HTMLElement, text : string, options : string[], actions : (() => number)[], fontSizeinPx : number, checkbox : boolean, checkboxLabel : string, checkboxAction : (checked : boolean) => void, allowEmpty : boolean) : HTMLElement {
    const panel = document.createElement('div');
    panel.classList.add("cradlePopup-entry");
    parent.appendChild(panel);
    panel.style.width = "80%";
    panel.style.height = 3*fontSizeinPx + "px";
    panel.style.fontSize = fontSizeinPx + "px";
    const textDiv = document.createElement('div');
    textDiv.classList.add("cradlePopup-entry-text");
    textDiv.style.fontSize = fontSizeinPx + "px";
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
    }), fontSizeinPx, allowEmpty);
    artifactDropdown.style.marginLeft = fontSizeinPx + "px";
    artifactDropdown.style.width = "40%";
    artifactDropdown.style.marginTop = "auto";
    artifactDropdown.style.marginBottom = "auto";
        const checkboxDiv = document.createElement('div');
        panel.appendChild(checkboxDiv);
        checkboxDiv.style.width = "10%";
        checkboxDiv.style.height = "100%";
        checkboxDiv.style.marginLeft = 0.8*fontSizeinPx + "px";
        checkboxDiv.style.display = "flex";
        checkboxDiv.style.alignItems = "center";
        checkboxDiv.style.textAlign = "left";
        checkboxDiv.style.fontSize = 0.8*fontSizeinPx + "px";
        checkboxDiv.style.userSelect = "none";
    if (checkbox) {
        checkboxDiv.appendChild(document.createTextNode(checkboxLabel));
        const checkboxInput = document.createElement('input');
        checkboxInput.style.marginLeft = 0.5*fontSizeinPx + "px";
        checkboxInput.type = "checkbox";
        checkboxInput.addEventListener("change", () => {
            checkboxAction(checkboxInput.checked);
        });
        checkboxDiv.appendChild(checkboxInput);
    }
    return panel;
}


export function fabricateDropDown(parent : HTMLElement, options : string[], actions : (() => void)[], fontSizeinPx : number, canBeEmpty : boolean) : HTMLSelectElement {
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
    select.style.backgroundColor = Config.PREFERENCE_COLOR_PAPER;
    select.style.color = Config.PREFERENCE_COLOR_SELECTABLE;
    select.style.border = "1px solid " + Config.PREFERENCE_COLOR_UNSELECTABLE;
    select.style.padding = "5px";
    return select;
}

export function fabricateDragAndDropChute(parent : HTMLElement, fontSize : number, filesHandler : (files  : Map<string, string>) => void) {
    const chute = document.createElement('div');
    chute.classList.add("cradlePopup-fileChute");
    chute.style.backgroundColor = Config.PREFERENCE_COLOR_ALMOST_MAIN;
    chute.style.color = Config.PREFERENCE_COLOR_UNSELECTABLE;
    chute.appendChild(document.createTextNode("Drag & Drop"));
    chute.appendChild(document.createElement('br'));
    chute.appendChild(document.createTextNode("All Files Here"));
    parent.appendChild(chute);
    chute.addEventListener('dragenter', (event) => {
        event.preventDefault();
        chute.style.backgroundColor = Config.PREFERENCE_COLOR_MAIN_HOVER;
    });
    chute.addEventListener('dragleave', (event) => {
        event.preventDefault();
        chute.style.backgroundColor = Config.PREFERENCE_COLOR_PAPER;
    });
    chute.addEventListener('drop', (event) => {
        event.preventDefault();
        chute.style.backgroundColor = Config.PREFERENCE_COLOR_PAPER;
        const files = event.dataTransfer!.files;
        chute.innerHTML = "";
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileDiv = document.createElement('div');
            fileDiv.appendChild(document.createTextNode(file.name));
            fileDiv.style.whiteSpace = "normal";
            fileDiv.style.overflow = "hidden";
            chute.appendChild(fileDiv);
        }
        const fileMap = new Map<string, string>();
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (event) => {
                fileMap.set(file.name, event.target!.result as string);
                filesHandler(fileMap);
            };
            reader.readAsText(file);
        }
        filesHandler(fileMap);
    });
}

export function makeVisParamPanel(container : HTMLElement, fontSize : number, otherVisualizationNames : string[], files : Map<string, string>,
     handler : (artifactFileIndex : number, linkFileIndices : number[], reverse : boolean[]) => [number,number[]]) {
    let selectedArtifactIndex = -1;
    let selectedLinkIndices = otherVisualizationNames.map(() => -1);
    let selectedReverse = otherVisualizationNames.map(() => false);
    const valueForArtifactSelectedActions = [];
    for (let i = 0; i < files.size; i++) {
        valueForArtifactSelectedActions.push(() => {
            selectedArtifactIndex = i;
            const statuses = handler(selectedArtifactIndex, selectedLinkIndices, selectedReverse);
            return statuses[0];
        });
    };
    fabricatePopupEntry(container, "Artifacts:", Array.from(files.keys()), valueForArtifactSelectedActions, fontSize, true);
    for (let i = 0; i < otherVisualizationNames.length; i++) {
        const otherVisName = otherVisualizationNames[i];
        const options = Array.from(files.keys());
        const valueSelectedActions = [];
        for (let j = 0; j < options.length; j++) {
            valueSelectedActions.push(() => {
                selectedLinkIndices[i] = j;
                const statuses = handler(selectedArtifactIndex, selectedLinkIndices, selectedReverse);
                return statuses[1][i];
            });
        }
        const checkAction = (checked : boolean) => {
            selectedReverse[i] = checked;
            const statuses = handler(selectedArtifactIndex, selectedLinkIndices, selectedReverse);
        };
        fabricatePopupEntryWithCheckbox(container, "Links | This to " + otherVisName + ":", options, valueSelectedActions, fontSize, true,"Reverse Links", checkAction);
    }
    
}