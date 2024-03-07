import { UIButton } from "../abstractUI";
import { ButtonStyle, StyleableButtonElement } from "../style";

export class Button implements StyleableButtonElement {
    
    protected div : HTMLElement;
    protected isToggled : boolean;
    protected borderColor : string;
    protected textColor : string;
    protected backgroundColor : string;
    protected hoverBackgroundColor : string;
    protected downBackgroundColor : string;


    /**
     * Creates a new button element and appends it to the given parent element.
     * @param parent the parent element to append the button to
     * @param sizeInPx the button's total size in pixels including its border
     * @param fontSizeInPx the font size in pixels
     * @param marginInPx the button's left margin in pixels
     * @param style A {@link ButtonStyle} object that defines the button's appearance
     * @param buttonData An {@link UIButton} object that defines the button's behavior
     */
    constructor(parent : HTMLElement, sizeInPx : number, fontSizeInPx : number, marginInPx : number, style : ButtonStyle, buttonData : UIButton) {
        this.div = document.createElement('div');
        parent.appendChild(this.div);
        this.div.style.width = sizeInPx + "px";
        this.div.classList.add('split-vis-half-header-button');
        this.div.style.height = sizeInPx + "px";
        this.div.style.width = sizeInPx + "px"; 
        this.div.style.minHeight = sizeInPx + "px";
        this.div.style.minWidth = sizeInPx + "px";
        this.div.style.fontSize = fontSizeInPx + "px";
        this.div.style.marginLeft = marginInPx + "px";
        this.div.style.color = style.getTextColor();
        this.div.style.backgroundColor = style.getButtonColor();
        this.div.style.border = "1px solid " + style.getBorderColor();
        this.div.appendChild(document.createTextNode(buttonData.label));
        this.isToggled = buttonData.startsToggled;
        this.borderColor = style.getBorderColor();
        this.textColor = style.getTextColor();
        this.backgroundColor = style.getButtonColor();
        this.hoverBackgroundColor = style.getButtonHoverColor();
        this.downBackgroundColor = style.getButtonDownColor();
        this.setStyle(style);
        this.div.addEventListener('mouseenter', () => {
            if (!this.isToggled || !buttonData.isToggle) {
                this.div.style.backgroundColor = this.hoverBackgroundColor;
            }
        });
        this.div.addEventListener('mouseleave', () => {
            if (!this.isToggled && !buttonData.isToggle) {
                this.div.style.backgroundColor = this.backgroundColor;
            }
        });
        this.div.addEventListener('mousedown', () => {
            this.div.style.backgroundColor = this.downBackgroundColor;
        });
        this.div.addEventListener('mouseup', () => {
            if (!this.isToggled || !buttonData.isToggle) {
                this.div.style.backgroundColor = this.hoverBackgroundColor;
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

    setStyle(style: ButtonStyle): void {
        this.div.style.color = style.getTextColor();
        this.div.style.backgroundColor = this.isToggled ? style.getButtonDownColor() : style.getButtonColor();
        this.div.style.borderColor = style.getBorderColor();
        this.borderColor = style.getBorderColor();
        this.textColor = style.getTextColor();
        this.backgroundColor = style.getButtonColor();
        this.hoverBackgroundColor = style.getButtonHoverColor();
        this.downBackgroundColor = style.getButtonDownColor();
    }
}