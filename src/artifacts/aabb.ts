export class AABB {
  public readonly x: number;
  public readonly y: number;
  public readonly width: number;
  public readonly height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }
}

export class TextedAABB extends AABB {
  protected text: string;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
  ) {
    super(x, y, width, height);
    this.text = text;
  }

  getText(): string {
    return this.text;
  }
}

export class ArtefactAABB {
  mainBox: AABB;
  textBox: TextedAABB;

  constructor(mainBox: AABB, textBox: TextedAABB) {
    this.mainBox = mainBox;
    this.textBox = textBox;
  }

  getIdentifier(): string {
    return (
      this.mainBox.x +
      "_" +
      this.mainBox.y +
      "_" +
      this.mainBox.width +
      "_" +
      this.mainBox.height
    );
  }

  getMainBox(): AABB {
    return this.mainBox;
  }

  getTextBox(): TextedAABB {
    return this.textBox;
  }

  serialize(): string {
    return JSON.stringify({ mainBox: this.mainBox, textBox: this.textBox });
  }

  static deserialize(serialized: string): ArtefactAABB {
    const json = JSON.parse(serialized);
    return new ArtefactAABB(json.mainBox, json.textBox);
  }
}
