export class AABB {

    public readonly x : number;
    public readonly y : number;
    public readonly width : number;
    public readonly height : number;

    constructor(x : number, y : number, width : number, height : number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

export class TextedAABB extends AABB {

    protected text : string;

    constructor(x : number, y : number, width : number, height : number, text : string) {
        super(x, y, width, height);
        this.text = text;
    }
}

export class ArtefactAABB {
    mainBox : AABB;
    textBox : TextedAABB

    constructor(mainBox : AABB, textBox : TextedAABB) {
        this.mainBox = mainBox;
        this.textBox = textBox;
    }

    getIdentifier() : string {
        return this.mainBox.x + "_" + this.mainBox.y + "_" + this.mainBox.width + "_" + this.mainBox.height;
    }
}