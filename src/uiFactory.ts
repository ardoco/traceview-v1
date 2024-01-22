import { Buttoned } from "./abstractUI";
import { Config } from "./config";

export class UIFactory {

    public static fabricateHeader(parent : HTMLElement,height : string, fontSize : string, backgroundColor : string, name : string) {
        const header = document.createElement('div');
        header.style.height = height;
        header.style.fontSize = fontSize;
        header.classList.add('split-vis-half-header');
        header.style.backgroundColor = backgroundColor;
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

    public static attachButtons(buttonPanel  : HTMLElement, subject : Buttoned) {
        const headerSize = buttonPanel.getBoundingClientRect().height;
        const gap = 0.45 * headerSize;
        for (let visButton of subject.getButtons()) {
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('split-vis-half-header-button');
            buttonContainer.style.height = headerSize-gap + "px";
            buttonContainer.style.width = headerSize-gap + "px";
            buttonContainer.style.fontSize = gap + "px";
            buttonContainer.style.marginLeft = gap/8 + "px";
            buttonContainer.appendChild(document.createTextNode(visButton.label));
            buttonContainer.addEventListener('click', event => {
                const newValue = visButton.onClick();
                if (visButton.isToggle) {
                    buttonContainer.style.backgroundColor = newValue ? Config.PREFERENCE_COLOR_MAIN_SELECTED : Config.PREFERENCE_COLOR_PAPER;
                }
                event.stopPropagation();
            });
            if (visButton.isToggle && visButton.startsToggled) {
                buttonContainer.style.backgroundColor = Config.PREFERENCE_COLOR_MAIN_SELECTED;
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
        constructorFunction: (vp: HTMLElement) => T) {
        const container = document.createElement('div');
        const header = UIFactory.fabricateHeader(container,'5%', '20px', Config.PREFERENCE_COLOR_ALMOST_MAIN,name);
        container.classList.add('split-vis-half-container');
        container.style.backgroundColor = Config.PREFERENCE_COLOR_PAPER
        container.style.width = (100*width) + '%';
        container.style.height = '95%';
        const subViewport = document.createElement('div');
        subViewport.style.height = '95%';
        subViewport.style.width = '100%';
        subViewport.style.overflow = overflow;
        container.appendChild(subViewport); 
        viewport.insertBefore(container, viewport.lastChild);
        const visualization = constructorFunction(subViewport);
        const buttonPanel = header.lastChild! as HTMLElement;
        UIFactory.attachButtons(buttonPanel, visualization);
        return container;
    }
}