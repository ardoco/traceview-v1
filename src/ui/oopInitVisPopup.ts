import { FileManager } from "../app/fileManager";
import { Config } from "../config";
import { Style } from "../style";

export class FilePicker {

    protected listeners : ((fileName : string | null) => void)[] = [];

    constructor(parent : HTMLElement, style : Style, appFileManager : FileManager, fontSizeInPx : number, allowEmpty : boolean) {
        this.listeners = [];
        const select = document.createElement("select");
        const actualOptions = allowEmpty ? [Config.EMPTY].concat(appFileManager.getAllFileNames()) : appFileManager.getAllFileNames();
        parent.appendChild(select);
        for (let option of actualOptions) {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.text = option;
            select.appendChild(optionElement);
        }
        select.addEventListener("change", () => {
            if (select.value != Config.EMPTY) {
                this.listeners.forEach((listener) => listener(select.value));
            }
        });
        select.style.fontSize = fontSizeInPx + "px";
        select.style.backgroundColor = style.getPaperColor();
        select.style.color = style.getSelectableTextColor();
        select.style.border = "1px solid " + style.getBorderColor();
        select.style.padding = "5px";
    }

    addListener(listener : (fileName : string | null) => void) {
        this.listeners.push(listener);
    }
}