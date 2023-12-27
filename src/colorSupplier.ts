export interface ColorSupplier {
    reserveColor(id : string) : string;
    returnColor(id : string) : void;
    returnAllColors() : void;
}

export class ConstantColorSupplier implements ColorSupplier {

    private colors : Map<string,string>;

    constructor(colors : Map<string,string>) {
        this.colors = colors;
    }

    reserveColor(id: string): string {
        return this.colors.get(id)!;
    }

    returnColor(id : string) : void {}

    returnAllColors() : void {}
}

export class CountingColorSupplier implements ColorSupplier {

    private colorIsInUse : Map<string,string>;
    private colorPool : string[];
    private numColorsInUse : number;

    constructor(maxColors : number) {
        this.colorIsInUse = new Map<string,string>();
        const sortedColorPool = [];
        const rotation = 360 / maxColors;
        for (let i = 0; i < maxColors; i++) {
            sortedColorPool.push("hsl(" + i*rotation + ",100%,50%)");
        }
        this.colorPool = [];
        while (sortedColorPool.length > 0) {
            const index = Math.floor(Math.random() * sortedColorPool.length);
            this.colorPool.push(sortedColorPool.splice(index,1)[0]);
        }
        this.numColorsInUse = 0;
    }

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
    returnColor(id: string): void {
        if (this.colorIsInUse.has(id)) {
            this.colorIsInUse.delete(id);
            this.numColorsInUse--;
        }
    }
    returnAllColors(): void {
        this.colorIsInUse.clear();
        this.numColorsInUse = 0;
    }
}