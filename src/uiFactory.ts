import { Buttoned } from "./abstractUI";
import { Config } from "./config";
import { Style } from "./style";
import { Button } from "./ui/button";

export class UIFactory {

    public static fabricateHeader(parent : HTMLElement,height : string, fontSize : string, name : string, style : Style) {
        const header = document.createElement('div');
        style.applyToHeader(header);
        header.style.height = height;
        header.style.fontSize = fontSize;
        header.classList.add('split-vis-half-header');
        header.style.borderBottom = "1px solid " + style.getBorderColor();
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
            new Button(buttonPanel, headerSize-gap, gap, gap/8, style.getButtonStyle(), visButton);
        }
        buttonPanel.style.display = 'flex';
        buttonPanel.style.justifyContent = 'flex-end';
        buttonPanel.style.alignItems = 'center';
        buttonPanel.style.paddingRight = gap/2 + "px";
    }

    public static fabricatePanel<T extends Buttoned>(
        viewport: HTMLElement, name: string, width: number,
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
        container.appendChild(subViewport); 
        viewport.insertBefore(container, viewport.lastChild);
        const visualization = constructorFunction(subViewport);
        const buttonPanel = header.lastChild! as HTMLElement;
        UIFactory.attachButtons(buttonPanel, visualization, style);
        return container;
    }
}