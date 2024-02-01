import { UIButton } from "../abstractUI";
import { ButtonStyle } from "../style";

export class Button {
    
    protected div : HTMLElement;
    protected isToggled : boolean;
    
    constructor(parent : HTMLElement, sizeInPx : number, fontSizeInPx : number, marginInPx : number, style : ButtonStyle, buttonData : UIButton) {
        this.div = document.createElement('div');
        parent.appendChild(this.div);
        this.div.style.width = sizeInPx + "px";
        this.div.classList.add('split-vis-half-header-button');
        this.div.style.height = sizeInPx + "px";
        this.div.style.width = sizeInPx + "px"; 
        this.div.style.fontSize = fontSizeInPx + "px";
        this.div.style.marginLeft = marginInPx + "px";
        this.div.style.color = style.getTextColor();
        this.div.style.backgroundColor = style.getButtonColor();
        this.div.style.border = "1px solid " + style.getBorderColor();
        this.div.appendChild(document.createTextNode(buttonData.label));
        this.isToggled = buttonData.startsToggled;
        this.div.addEventListener('mouseenter', () => {
            if (!this.isToggled || !buttonData.isToggle) {
                this.div.style.backgroundColor = style.getButtonHoverColor();
            }
        });
        this.div.addEventListener('mouseleave', () => {
            if (!this.isToggled && !buttonData.isToggle) {
                this.div.style.backgroundColor = style.getButtonColor();
            }
        });
        this.div.addEventListener('mousedown', () => {
            this.div.style.backgroundColor = style.getButtonDownColor();
        });
        this.div.addEventListener('mouseup', () => {
            if (!this.isToggled || !buttonData.isToggle) {
                this.div.style.backgroundColor = style.getButtonHoverColor();
            }
        });
        this.div.addEventListener('click', event => {
            event.stopPropagation();
            const newValue = buttonData.onClick();
            if (buttonData.isToggle) {
                this.isToggled = newValue;
                this.div.style.backgroundColor = newValue ? style.getButtonDownColor() : style.getButtonColor();
            }
        });
        if (buttonData.isToggle && buttonData.startsToggled) {
            this.div.style.backgroundColor = style.getButtonDownColor();
        }
    }
}