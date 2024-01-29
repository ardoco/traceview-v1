import { Buttoned } from "./abstractUI";
import { Config } from "./config";
import { Style } from "./style";

export class UIFactory {

    public static fabricateHeader(parent : HTMLElement,height : string, fontSize : string, name : string, style : Style) {
        const header = document.createElement('div');
        header.style.height = height;
        header.style.fontSize = fontSize;
        header.classList.add('split-vis-half-header');
        header.style.borderBottom = "1px solid " + style.getBorderColor();
        header.style.backgroundColor = style.getHeaderColor();
        header.style.color = style.getSelectableTextColor();
        for (let i = 0; i < 2; i++) {
            const headerChild = document.createElement('div');
            header.appendChild(headerChild);
            headerChild.style.width = '50%';
            headerChild.style.height = '100%';
        }
        header.firstChild!.appendChild(document.createTextNode(name));
        parent.appendChild(header);
        return header;
    }

    public static attachButtons(buttonPanel  : HTMLElement, subject : Buttoned, style : Style) {
        const headerSize = buttonPanel.getBoundingClientRect().height;
        const gap = 0.45 * headerSize;
        for (let visButton of subject.getButtons()) {
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('split-vis-half-header-button');
            buttonContainer.style.height = headerSize-gap + "px";
            buttonContainer.style.width = headerSize-gap + "px";
            buttonContainer.style.fontSize = gap + "px";
            buttonContainer.style.marginLeft = gap/8 + "px";
            buttonContainer.style.color = style.getSelectableTextColor();
            buttonContainer.style.backgroundColor = style.getPaperColor();
            buttonContainer.style.border = "1px solid " + style.getBorderColor();
            buttonContainer.appendChild(document.createTextNode(visButton.label));
            buttonContainer.addEventListener('mouseenter', () => {
                buttonContainer.style.backgroundColor = style.getButtonHoverColor();
            });
            buttonContainer.addEventListener('mouseleave', () => {
                buttonContainer.style.backgroundColor = style.getPaperColor(); // no
            });
            buttonContainer.addEventListener('click', event => {
                const newValue = visButton.onClick();
                if (visButton.isToggle) {
                    buttonContainer.style.backgroundColor = newValue ? style.getButtonSelectedColor() : style.getPaperColor();
                }
                event.stopPropagation();
            });
            if (visButton.isToggle && visButton.startsToggled) {
                buttonContainer.style.backgroundColor = style.getButtonSelectedColor();
            }
            buttonPanel.appendChild(buttonContainer);
        }
        buttonPanel.style.display = 'flex';
        buttonPanel.style.justifyContent = 'flex-end';
        buttonPanel.style.alignItems = 'center';
        buttonPanel.style.paddingRight = gap/2 + "px";
    }

    public static fabricatePanel<T extends Buttoned>(
        viewport: HTMLElement, name: string, width: number,overflow: string,
        constructorFunction: (vp: HTMLElement) => T, style : Style) {
        const container = document.createElement('div');
        const header = UIFactory.fabricateHeader(container,'5%', '20px',name, style);
        container.classList.add('split-vis-half-container');
        container.style.border = "1px solid " + style.getBorderColor();
        container.style.backgroundColor = style.getPaperColor();
        container.style.width = (100*width) + '%';
        container.style.height = "100%";
        const subViewport = document.createElement('div');
        subViewport.style.height = '95%';
        subViewport.style.width = '100%';
        subViewport.style.overflow = overflow;
        container.appendChild(subViewport); 
        viewport.insertBefore(container, viewport.lastChild);
        const visualization = constructorFunction(subViewport);
        const buttonPanel = header.lastChild! as HTMLElement;
        UIFactory.attachButtons(buttonPanel, visualization, style);
        return container;
    }
}