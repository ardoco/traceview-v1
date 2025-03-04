export interface ColorSupplier {
  reserveColor(id: string): string;
  returnColor(id: string): void;
  returnAllColors(): void;
}
/**
 * This class class is used to manage in-use and available colors for tracebility links, in order to avoid color collisions while isolating the visualzation from having to manage the colors itself.
 * Colors are generated using a shuffled lists of equidistant colors in the HSL color space.
 */
export class CountingColorSupplier implements ColorSupplier {
  private colorIsInUse: Map<string, string>;
  private colorPool: string[];
  private numColorsInUse: number;

  constructor() {
    this.colorIsInUse = new Map<string, string>();
    this.colorPool = [
      "rgb(0, 150, 130)", // kit-green
      "rgb(70, 100, 170)", // kit-blue
      "rgb(162, 34, 35)", // kit-red
      "rgb(223, 155, 27)", // kit-orange
      "rgb(140, 182, 60)", // kit-lightgreen
      "rgb(163, 16, 124)", // kit-purple
      "rgb(167, 130, 46)", // kit-brown
      "rgb(35, 161, 224)", // kit-cyan
    ];
    this.numColorsInUse = 0;
  }

  /**
   * Reverses a colors marking it has used and returns it. If the id has already reserved a color, the same color is returned.
   * @param id The id used to reserve the color
   * @returns The reserved color
   */
  reserveColor(id: string): string {
    if (this.colorIsInUse.has(id)) {
      return this.colorIsInUse.get(id)!;
    }
    const color = this.colorPool[this.numColorsInUse % this.colorPool.length];
    this.colorIsInUse.set(id, color);
    this.numColorsInUse++;
    return color;
  }

  /**
   * Returns the color to the pool of available colors.
   * @param id The id used to reserve the color
   */
  returnColor(id: string): void {
    if (this.colorIsInUse.has(id)) {
      this.colorIsInUse.delete(id);
      this.numColorsInUse--;
    }
  }
  /**
   * Retunrs all colors to the pool of available colors.
   */
  returnAllColors(): void {
    this.colorIsInUse.clear();
    this.numColorsInUse = 0;
  }
}
