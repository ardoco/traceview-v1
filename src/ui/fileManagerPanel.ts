import { FileManager } from "../app/fileManager";
import { Config } from "../config";
import { Style } from "../style";

export function fabricateFileManagerPanel(fileManager : FileManager, popupPosition : [number,number], buttonSize : number, style : Style) {
    const tooltipWidth = 300;
    const tooltipHeight = 300;
    const outerWidth = 300;
    const outerPanel = document.createElement('div');
    outerPanel.style.width = outerWidth + "px";
    style.applyToPanel(outerPanel);
    style.applyToContainer(outerPanel);
    outerPanel.style.position = "absolute";
    outerPanel.style.left = popupPosition[0] + "px";
    outerPanel.style.top = popupPosition[1] + "px";
    outerPanel.style.overflow = "auto";
    document.body.appendChild(outerPanel);
    outerPanel.addEventListener("click", (event) => {
        event.stopPropagation();
    });
    const innerPanel = document.createElement('div');
    innerPanel.style.backgroundColor = style.getPaperColor();
    outerPanel.appendChild(innerPanel);
    const entryFontSize = buttonSize / 3;
    for (let i = 0; i < fileManager.getAllFileNames().length; i++) {
        const fileName = fileManager.getAllFileNames()[i];
        const entry = document.createElement('div');
        innerPanel.appendChild(entry);
        entry.style.width = "85%";
        entry.style.overflow = "hidden";
        entry.style.height = 1.25 * entryFontSize + "px";
        entry.style.display = "flex";
        entry.style.justifyContent = "left";
        entry.style.marginLeft = entryFontSize  / 2.5 + "px";
        entry.style.paddingLeft = entryFontSize  / 2.5 + "px";
        entry.style.borderBottom = i == fileManager.getAllFileNames().length - 1 ? "none" : "1px solid " + style.getFadedBorderColor();
        entry.style.alignItems = "center";
        entry.style.fontSize = entryFontSize + "px";
        entry.style.cursor = "pointer";
        entry.style.color = style.getSelectableTextColor();
        entry.appendChild(document.createTextNode(fileName));
        entry.addEventListener("mouseenter", () => {
            const preview = document.createElement('div');
            preview.style.position = "absolute";
            preview.style.left = outerPanel.getBoundingClientRect().right - 5 - outerWidth - tooltipWidth + "px";
            preview.style.top = outerPanel.getBoundingClientRect().top + "px";
            preview.style.width = tooltipWidth + "px";
            preview.style.height = tooltipHeight + "px";
            style.applyToPanel(preview);
            style.applyToContainer(preview);
            const contentLines = [];
            const content = fileManager.getContent(fileName);
            let head = 0;
            while (head < content.length) {
                const index = content.indexOf("\n",head);
                contentLines.push(content.substring(head,index == -1 ? content.length : index));
                head = index == -1 ? content.length : index + 1;
            }
            preview.style.fontSize =  "10px";
            preview.style.boxShadow = "2px 2px 5px grey";
            for (let line of contentLines.slice(0,Math.min(10,contentLines.length)).concat(contentLines.length > 10 ? ["...","...",contentLines[contentLines.length-1]] : [])) {
                const lineDiv = document.createElement('div');
                lineDiv.appendChild(document.createTextNode(line));
                preview.appendChild(lineDiv);
                if (preview.getBoundingClientRect().bottom > window.innerHeight) {
                    lineDiv.remove();
                    break;
                }
            }
            document.body.appendChild(preview); 
            entry.addEventListener("mouseleave", () => {
                preview.remove();
            });
        });
    }
    outerPanel.style.boxShadow = "2px 2px 5px grey";
    return outerPanel;
}

export function fabricateFileManagerPanelButton(buttonParent : HTMLElement, fileManager: FileManager, style : Style) {
    const button = document.createElement('div');
    buttonParent.appendChild(button);
    const height = 0.9 * buttonParent.getBoundingClientRect().height;
    button.style.height = height + "px";
    button.style.width = 2*height + "px";
    button.style.fontSize = height / 1.5 + "px";
    button.style.justifyContent = "center";
    button.style.alignItems = "center";
    button.style.display = "flex";
    button.style.color = style.getSelectableTextColor();
    button.classList.add("appheader-button");
    const setButtonActive = (active : boolean) => {
        button.innerHTML = (active ? Config.FILE_ICON_OPEN : Config.FILE_ICON) + fileManager.getAllFileNames().length;
        button.style.textShadow = active ? "2px 2px 5px " + style.getFadedBorderColor() : "none";
    }
    setButtonActive(false);
    const buttonsPosInViewport = button.getBoundingClientRect();
    button.addEventListener("mouseenter", () => {
        setButtonActive(true);
        const dropdown = fabricateFileManagerPanel(fileManager, [buttonsPosInViewport.left, buttonsPosInViewport.bottom], height, style);
        button.addEventListener("mouseleave", () => {
            const closeListener = () => {
                setButtonActive(false);
                dropdown.remove();
                document.removeEventListener("click", closeListener);
            }
            document.addEventListener("click", closeListener);
            const timeout = setTimeout(() => {
                setButtonActive(false);
                dropdown.remove();
            }, 500);
            dropdown.addEventListener("mouseenter", () => {
                setButtonActive(true);
                clearTimeout(timeout);
            });
        });
        dropdown.addEventListener("mouseleave", () => {
            if (!document.elementsFromPoint(buttonsPosInViewport.left, buttonsPosInViewport.bottom).includes(button)) {
                setButtonActive(false);
                dropdown.remove();
            }
        });
    });
    fileManager.addListener(() => {
        setButtonActive(false);
    });
}