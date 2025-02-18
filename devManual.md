# Extending TraceView

## Implementing New Visualizations

To add a new type of visualization two things are necessary: \
First, a new class extending `HighlightingVisualization` or one of it's sub classes needs to be implemented. \
See the documentation for more an explanation of the types and parameters involved.
For example:

```Typescript

public class MyNewVisualization extends HighlightingVisualization {

    constructor(viewport : HTMLElement, artifacts : ArtifactDataType[], name : string, style : Style) {
        // Initialize and "Draw" the visualization with as if no artifact is highlightable
    }

    protected highlightElement(id: string, color : string): {
        // implement the logic necessary to highlight the artifact with the input identifier using the input color (e.g. set the font color to the input color)
    }

    protected unhighlightElement(id: string): {
        // the inverse of highlightElement(id, anyColor)
    }

    protected setElementsHighlightable(ids : string[]) : {
        // set the apperance of the artifacts to indicate that they can be highlighted (e.g. use the "normal" font color)
    }

    protected setElementsNotHighlightable(ids : string[]) : void {
        // the inverse of setElementsHighlightable (e.g. set the font color to a faded color)
    }

    public setStyle(style : Style) : void {
        this.style = style;
        // if your visualization should react to changes in the application's style by the user,
        // implement the logic here to change its and its artifacts' appearance here (e.g. change a diagrams background color)
    }

    public getButtons() : ConceptualUIButton {
        return [new UIButton("T", "Tooltip info about what the button does", () => this.doSomething()].concat(super());
        // invoke super() to keep buttons inherited from super classes
    }

    private doSomething() {

    }
}
```

Second, the application needs to be aware of the new visualization and be able to instantiate it.
Both tasks are handled by the `VisualizationFactory` passed to the `Application` through its constructor.
So, to add support for your new visualization you need to either the class [`visFactory.ts`](https://github.com/ArDoCo/TraceView/blob/main/src/artifactVisualizations/visFactory.ts)
or extend it and use the child class to instantiate the [`Application`](https://github.com/ArDoCo/TraceView/blob/main/src/main.ts).

```Typescript
export class MyVisualizationFactory extends VisualizationFactory {

    constructor() {}
    public getAllVisualizationTypes() : VisualizationType[] {
        return [VisualizationType.NL, VisualizationType.UML, VisualizationType.CODE, VisualizationType.IMG, VisualizationType.MYNEWVIS];
    }

    public fabricateVisualization(visualizationType : VisualizationType, data : string[], style : Style) : ((vp: HTMLElement) => HighlightingVisualization) {
        if (visualizationType == VisualizationType.MYNEWVIS) {
            const artifacts = yourParseFunction(data[0]);
            // the application will provide the content of the files selected by the user to instantiate the visualization as elements of the data array
            // unless the visualization expects a string as it's artifacts, the content needs to be parsed
            // see the src/parse for parser implementations for already supported data types
            return (vp : HTMLElement) => new MyNewVisualization(vp, artifacts, "My New Visualization", style);
        }
        return super(visualizationType, data,style);
    }

    public getExpectedFileCount(visualizationType : VisualizationType) : number {
        if (VisualizationType.MYNEWVIS) {
            return 1; // the number of files the user needs to provide to instantiate the visualization
        }
        return super(visualizationType);
    }

    public getTypeName(typeIndex : number) : string {
        if (typeIndex == VisualizationType.MYNEWVIS) {
            "My New Visualization"
        }
        return super(number);
    }

    public getType(name : string) : VisualizationType {
        if (name == "My New Visualization") {
            return VisualizationType.MYNEWVIS;
        return super(name);
    }
}
```

In both cases a value representing the new visualization type needs to be added to the `VisualizationType` enum.

```Typescript
export enum VisualizationType {
    NL,
    UML,
    CODE,
    IMG,
    ...
    MYNEWVIS
}
```
