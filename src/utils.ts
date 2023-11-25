console.log('utils.ts');

export function loadAndPrintUML(umlFileUrl: string): Promise<void> {
    return fetch(umlFileUrl)
        .then(umlFile => umlFile.text())
        .then(umlText => console.log(umlText))
        .catch(error => console.error('Error loading UML:', error));
  }

export function getTextWidth(text: string, fontSize: number): number {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    context.font = fontSize + "px 'Roboto Mono', monospace";
    const width = context.measureText(text).width;
    return width;
}

export class Random {
  private seed : number;
  private iterated : number;
  
  constructor(seed : number) {
    this.seed = seed;
    this.iterated = 0;
  }

  public next() : number {
    this.iterated = 2* this.iterated + 1;
    let x = Math.sin(12.9898 * this.iterated + 78.233 * this.seed * 43758.5453);
    return 0.5 + 0.5 * x;
  }
}