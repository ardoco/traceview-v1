import { Buttoned } from "./abstractUI";
import { Config } from "./config";
import { Style, StyleableButtonElement, StyleableUIElement } from "./style";
import { Button } from "./ui/button";

const HEADER_SIZE_AS_FRACTION_OF_FONT_SIZE = 2;

export interface FabricatedPanel extends StyleableUIElement {
    container : HTMLElement;
    header : HTMLElement;
}

export class UIFactory {

    public static fabricateHeader(parent : HTMLElement,fontSizeinPx : number, name : string, style : Style) {
        const header = document.createElement('div');
        style.applyToHeader(header);    
        header.style.height = "5%";
        header.style.minHeight = HEADER_SIZE_AS_FRACTION_OF_FONT_SIZE  * fontSizeinPx + "px";
        header.style.fontSize = fontSizeinPx + "px";
        header.classList.add('split-vis-half-header');
        for (let i = 0; i < 2; i++) {
            const headerChild = document.createElement('div');
            header.appendChild(headerChild);
        }
        (header.firstChild! as HTMLElement).style.width = "100%";
        (header.lastChild! as HTMLElement).style.width = "0%";
        header.style.whiteSpace = "nowrap";
        header.style.overflow = "hidden";
        header.style.textOverflow = "ellipsis";
        header.firstChild!.appendChild(document.createTextNode(name));
        parent.appendChild(header);
        return header;
    }

    public static attachButtons(buttonPanel  : HTMLElement, headerSize : number, subject : Buttoned, style : Style) : StyleableButtonElement[] {
        const gap = 0.45 * headerSize;
        const buttons = [];
        for (let visButton of subject.getButtons()) {
            buttons.push(new Button(buttonPanel, headerSize-gap, gap, gap/8, style.getButtonStyle(), visButton));
        }
        buttonPanel.style.width = subject.getButtons().length * ((headerSize-gap) + gap/8) + "px";  
        buttonPanel.style.display = 'flex';
        buttonPanel.style.justifyContent = 'flex-end';
        buttonPanel.style.alignItems = 'center';
        buttonPanel.style.paddingRight = gap/2 + "px";
        return buttons;
    }

    public static fabricatePanel<T extends Buttoned>(name: string, widthInPixels: number,
        constructorFunction: (vp: HTMLElement) => T, style : Style) : FabricatedPanel {
        const container = document.createElement('div');
        const header = UIFactory.fabricateHeader(container, 20,name, style);
        container.classList.add('split-vis-half-container');
        style.applyToContainer(container);
        container.style.width = widthInPixels + "px";
        container.style.height = "100%";
        const subViewport = document.createElement('div');
        subViewport.style.height = '95%';
        subViewport.style.width = '100%';
        container.appendChild(subViewport); 
        const visualization = constructorFunction(subViewport);
        const buttonPanel = header.lastChild! as HTMLElement;
        const buttons : StyleableButtonElement[] = UIFactory.attachButtons(buttonPanel, 40, visualization, style);
        return new class implements FabricatedPanel {
            container = container;
            header = header;
            setStyle(style: Style): void {
                style.applyToContainer(container);
                style.applyToHeader(header);
                for (let button of buttons) {
                    button.setStyle(style.getButtonStyle());
                }
            }
        }
    }

    public static fabricatePageHeaderDropdownButton(symbols : string[], options : string[], actions : (() => void)[], fontSizeInPx : number, style : Style) {
        const button = document.createElement('div');
        const width = 40;
        button.style.height = "100%";
        button.style.width = width + "px";
        button.style.marginRight = width + "px";
        button.style.fontSize = fontSizeInPx + "px";
        button.style.justifyContent = "center";
        button.style.alignItems = "center";
        button.style.display = "flex";
        button.style.color = Style.ARDOCO.getSelectableTextColor();
        button.style.cursor = "pointer";
        button.classList.add("appheader-button");
        button.appendChild(document.createTextNode(symbols[0]));
        const setButtonActive = (active : boolean) => {
            button.innerHTML = (active ? symbols[0] : symbols[Math.max(symbols.length-1,0)]);
            button.style.textShadow = active ? "2px 2px 5px " + style.getFadedBorderColor() : "none";
        }
        button.addEventListener("mouseenter", () => {
            setButtonActive(true);
            const buttonsPosInViewport = button.getBoundingClientRect();
            const dropdown = UIFactory.fabricatePageHeaderDropdown(options, actions, width, [buttonsPosInViewport.left, buttonsPosInViewport.bottom],style);
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
                const buttonsPosInViewport = button.getBoundingClientRect();
                if (!document.elementsFromPoint(buttonsPosInViewport.left, buttonsPosInViewport.bottom).includes(button)) {
                    setButtonActive(false);
                    dropdown.remove();
                }
            });
        });
        return button;
    }

    public static fabricatePageHeaderDropdown(options : string[], actions : (() => void)[], buttonSizeInPx : number,popupPosition : [number, number], style : Style) {
    const outerWidth = 300;
    const outerPanel = document.createElement('div');
    outerPanel.style.width = outerWidth + "px";
    style.applyToPanel(outerPanel);
    style.applyToContainer(outerPanel);
    outerPanel.style.position = "absolute";
    if (popupPosition[0] + outerWidth > window.innerWidth) {
        popupPosition[0] = popupPosition[0] - outerWidth + buttonSizeInPx + 40;
    }
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
    const entryFontSize = buttonSizeInPx / 2;
    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const entry = document.createElement('div');
        innerPanel.appendChild(entry);
        entry.style.width = (outerWidth  - 3 * entryFontSize  / 2.5) + "px";
        entry.style.overflow = "hidden";
        entry.style.height = 1.5 * entryFontSize + "px";
        entry.style.display = "flex";
        entry.style.justifyContent = "left";
        entry.style.marginLeft = entryFontSize  / 2.5 + "px";
        entry.style.paddingLeft = entryFontSize  / 2.5 + "px";
        entry.style.marginRight = entryFontSize  / 2.5 + "px";
        entry.style.borderBottom = i == options.length - 1 ? "none" : "1px solid " + style.getFadedBorderColor();
        entry.style.alignItems = "center";
        entry.style.fontSize = entryFontSize + "px";
        entry.style.cursor = "pointer";
        entry.style.color = style.getSelectableTextColor();
        entry.appendChild(document.createTextNode(option));
        entry.addEventListener("mouseenter", () => {
            entry.style.backgroundColor = style.getButtonStyle().getButtonColor();
        });
        entry.addEventListener("mouseleave", () => {
            entry.style.backgroundColor = style.getPaperColor();
        });
        entry.addEventListener("click", () => {
            actions[i]();
            outerPanel.remove();
        });
    }
    outerPanel.style.boxShadow = "2px 2px 5px grey";
    return outerPanel;
    }
}