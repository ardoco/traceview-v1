export interface StyleableUIElement {
    setStyle(style : Style) : void;
}

interface ProtoButtonStyle {
    backgroundColor : string;
    hoverBackgroundColor : string;
    downBackgroundColor : string;
}

export class ButtonStyle {
    backgroundColor : string;
    hoverBackgroundColor : string;
    downBackgroundColor : string;
    textColor : string;
    borderColor : string;

    constructor(backgroundColor : string, hoverBackgroundColor : string, downBackgroundColor : string, textColor : string, borderColor : string) {
        this.backgroundColor = backgroundColor;
        this.hoverBackgroundColor = hoverBackgroundColor;
        this.downBackgroundColor = downBackgroundColor;
        this.textColor = textColor;
        this.borderColor = borderColor;
    }

    public getButtonColor() : string {
        return this.backgroundColor;
    }

    public getButtonHoverColor() : string {
        return this.hoverBackgroundColor;
    }

    public getButtonDownColor() : string {
        return this.downBackgroundColor;
    }

    public getTextColor() {
        return this.textColor;
    }

    public getBorderColor() {
        return this.borderColor;
    }
}

export class Style {

    public static readonly DEFAULT = new Style(
        "black",
        "rgb(110,110,110)",
        "rgb(200,200,200)",
        "white",
        "black",
        "rgb(240,240,240)", {backgroundColor: "white", hoverBackgroundColor:  "rgb(220,220,220)", downBackgroundColor: "rgb(150,150,150)"});
    public static readonly NIGHT = new Style(
        "rgb(255,255,255)",
        "rgb(130,130,130)",
        "rgb(80,80,80)",
        "rgb(50,50,50)",
        "rgb(100,100,100)",
        "rgb(150,150,150)",
        {backgroundColor: "rgb(100,100,100)", hoverBackgroundColor:"rgb(90,90,90)",downBackgroundColor:"rgb(40,40,40)"});

    protected selectableText : string;
    protected notSelectableText : string;
    protected background : string;
    protected paper : string;
    protected headerColor : string;
    protected borderColor : string;
    protected buttonStyle : ButtonStyle;

    protected constructor (selectableText : string, notSelectableText : string, background : string, paper : string, headerColor : string, borderColor : string, buttonStyle : ProtoButtonStyle) {
        this.selectableText = selectableText;
        this.notSelectableText = notSelectableText;
        this.background = background;
        this.paper = paper;
        this.headerColor = headerColor;
        this.borderColor = borderColor;
        this.buttonStyle = new ButtonStyle(buttonStyle.backgroundColor, buttonStyle.hoverBackgroundColor, buttonStyle.downBackgroundColor, this.selectableText, this.borderColor);
    }

    public getButtonStyle() : ButtonStyle {
        return this.buttonStyle;
    }

    public getSelectableTextColor() : string {
        return this.selectableText;
    }

    public getNotSelectableTextColor() : string {
        return this.notSelectableText;
    }

    public getBackgroundColor() : string {
        return this.background;
    }

    public getPaperColor() : string {
        return this.paper;
    }

    public getBorderColor() : string {
        return this.borderColor
    }

    public getFadedBorderColor() : string {
        return this.notSelectableText;
    }

    public getHeaderColor() : string {
        return this.headerColor;
    }

    public getHighlightedTextOutlineColor() : string {
        return "black";
    }

    public applyToContainer(container : HTMLElement) {
        container.style.backgroundColor = this.getPaperColor();
        container.style.border = "1px solid " + this.getBorderColor();
    }

    public applyToPanel(panel : HTMLElement) {
        panel.style.color = this.getSelectableTextColor();
        panel.style.backgroundColor = this.getPaperColor();
    }

    public applyToHeader(header : HTMLElement) {
        header.style.borderBottom = "1px solid " + this.getBorderColor();
        header.style.backgroundColor = this.getHeaderColor();
        header.style.color = this.getSelectableTextColor();
    }

    public applyToButton(button : HTMLElement) {
        button.style.color = this.getSelectableTextColor();
        button.style.backgroundColor = this.getButtonStyle().getButtonColor();
        button.style.border = "1px solid " + this.getBorderColor();
    }
}