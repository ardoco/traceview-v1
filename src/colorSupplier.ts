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

  constructor(maxColors: number) {
    this.colorIsInUse = new Map<string, string>();
    const sortedColorPool = [];
    const rotation = 360 / maxColors;
    for (let i = 0; i < maxColors; i++) {
      sortedColorPool.push("hsl(" + i * rotation + ",100%,50%)");
    }
    this.colorPool = [];
    while (sortedColorPool.length > 0) {
      const index = Math.floor(Math.random() * sortedColorPool.length);
      this.colorPool.push(sortedColorPool.splice(index, 1)[0]);
    }
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
    if (this.numColorsInUse == this.colorPool.length) {
      throw new Error("No colors left!");
    }
    const color = this.colorPool[this.numColorsInUse];
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
