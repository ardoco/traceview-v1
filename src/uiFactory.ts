import { Buttoned } from "./abstractUI";
import { ButtonStyle, Style, StyleableButtonElement, StyleableUIElement } from "./style";
import { Button } from "./ui/button";

const HEADER_SIZE_AS_FRACTION_OF_FONT_SIZE = 2;

/**
 * A helper class wrapping one the HTMLElement corresponding to a visualization's panel and the panel's header as it appears to the user.
 */
export interface FabricatedPanel extends StyleableUIElement {
    container : HTMLElement;
    header : HTMLElement;
}

/**
 * Factory class for creating UI elements
 */
export class UIFactory {

    /**
     * Fabricates a header for a visualization panel
     * @param parent The parent element to attach the header to (the container of the visualization panel)
     * @param fontSizeinPx The font size in pixels to use for the header
     * @param name The name of the visualization to put in the header
     * @param style A {@link Style} object that defines the header's appearance
     * @returns The fabricated header element
     */
    public static fabricateHeader(parent : HTMLElement,fontSizeinPx : number, name : string, style : Style) : HTMLElement {
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

    /**
     * Attaches the buttons provided by {@link Buttoned} object to a HTML element
     * @param buttonPanel The HTML element to attach the buttons to
     * @param headerSize The vertical size of the header the buttons are attached to
     * @param subject The {@link Buttoned} object to get the buttons from
     * @param style A {@link ButtonStyle} object that defines the buttons' appearance
     * @returns A list of the created buttons
     */
    public static attachButtons(buttonPanel  : HTMLElement, headerSize : number, subject : Buttoned, style : ButtonStyle) : StyleableButtonElement[] {
        const gap = 0.45 * headerSize;
        const buttons = [];
        for (let visButton of subject.getButtons()) {
            buttons.push(new Button(buttonPanel, headerSize-gap, gap, gap/8, style, visButton));
        }
        buttonPanel.style.width = subject.getButtons().length * ((headerSize-gap) + gap/8) + "px";  
        buttonPanel.style.display = 'flex';
        buttonPanel.style.justifyContent = 'flex-end';
        buttonPanel.style.alignItems = 'center';
        buttonPanel.style.paddingRight = gap/2 + "px";
        return buttons;
    }

    /**
     * Fabricates a panel for a visualization and calls the supplied constructorFunction to initialize the visualization object. It will consist of a container element holding both a header and a viewport for the visualization itself.
     * @param name The name of the visualization to put in the header
     * @param widthInPixels The width of the panel in pixels
     * @param constructorFunction The constructor function for the visualization to be put in the viewport
     * @param style A {@link Style} object that defines the panel's appearance
     * @returns 
     */
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
        const buttons : StyleableButtonElement[] = UIFactory.attachButtons(buttonPanel, 40, visualization, style.getButtonStyle());
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

    /**
     * Fabricates a generic button for the page's header that will open a dropdown menu when hovered over
     * @param symbols An array of symbols to be displayed on the button depending on being hovered over, clicked or neither
     * @param options An array of strings to be displayed in the dropdown menu
     * @param actions The actions to be executed when the corresponding option is clicked
     * @param fontSizeInPx The font size in pixels to use for the button
     * @param style A {@link Style} object that defines the button's and menu's appearance
     * @returns 
     */
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

    /**
     * Fabricates a dropdown menu for one of the buttons in the page's header.
     * @param options The options to be displayed in the dropdown menu
     * @param actions The actions to be executed when the corresponding option is clicked
     * @param buttonSizeInPx The size of the button that opens the dropdown menu
     * @param popupPosition The position in screen coordinates where the dropdown menu should appear
     * @param style A {@link Style} object that defines the dropdown menu's appearance
     * @returns The HTML element representing the dropdown menu
     */
    public static fabricatePageHeaderDropdown(options : string[], actions : (() => void)[], buttonSizeInPx : number,popupPosition : [number, number], style : Style) : HTMLElement {
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