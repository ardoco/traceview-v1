export interface StyleableUIElement {
    setStyle(style : Style) : void;
}

export class Style {

    public static readonly DEFAULT = new Style(
        "black",
        "rgb(110,110,110)",
        "rgb(200,200,200)",
        "white",
        "rgb(240,240,240)");
    public static readonly NIGHT = new Style(
        "rgb(255,255,255)",
        "rgb(130,130,130)",
        "rgb(80,80,80)",
        "rgb(50,50,50)",
        "rgb(100,100,100)");

    protected selectableText : string;
    protected notSelectableText : string;
    protected background : string;
    protected paper : string;
    protected headerColor : string;

    protected constructor (selectableText : string, notSelectableText : string, background : string, paper : string, headerColor : string) {
        this.selectableText = selectableText;
        this.notSelectableText = notSelectableText;
        this.background = background;
        this.paper = paper;
        this.headerColor = headerColor;
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

    public getButtonSelectedColor() : string {
        return this.notSelectableText; // TODO
    }

    public getPaperColor() : string {
        return this.paper;
    }

    public getBorderColor() : string {
        return "black"; // TODO
    }

    public getFadedBorderColor() : string {
        return this.notSelectableText;
    }

    public getButtonHoverColor() : string {
        return this.notSelectableText; // TODO
    }

    public getHeaderColor() : string {
        return this.headerColor;
    }

    public applyToContainer(container : HTMLElement) {
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
        button.style.backgroundColor = this.getPaperColor();
        button.style.border = "1px solid " + this.getBorderColor();
    }

    public applyToButtonHover(button : HTMLElement) {
        button.style.backgroundColor = this.getButtonHoverColor();
    }

    public applyToButtonSelected(button : HTMLElement) {
        button.style.backgroundColor = this.getButtonSelectedColor();
    }
}