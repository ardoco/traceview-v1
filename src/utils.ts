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

export function generateRandomRGB() {
  const minBrightness = 128; // Adjust this value to set the minimum brightness
  let rgb = [0, 0, 0];
  do {
    rgb = [Math.random(), Math.random(), Math.random()].map(value => Math.floor(value * 255));
  } while (rgb.reduce((acc, val) => acc + val, 0) < minBrightness * 3);
  return "rgb(" + rgb[0] +"," + rgb[1] + "," + rgb[2] + ")";
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