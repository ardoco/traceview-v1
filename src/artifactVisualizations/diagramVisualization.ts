import { ConceptualUIButton } from "../abstractUI";
import { ArtefactAABB } from "../artifacts/aabb";
import { Style } from "../style";
import { HighlightingVisualization } from "./highlightingVisualization";
import * as d3 from "d3";

/**
 * A visualization that displays an image with the highligtable artifacts corresponding to labeled axis-aligned boxes.
 */
export class DiagramVisualization extends HighlightingVisualization {
  private readonly zoomMinFactor = 0.1;
  private readonly zoomMaxFactor = 10;

  protected viewport: HTMLElement;

  protected plot: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  protected svgWidth: number;
  protected svgHeight: number;
  private zoomFactor: number = 1;
  private isDragging: boolean = false;
  private dragStart: { x: number; y: number } = { x: 0, y: 0 };
  private translation: { x: number; y: number } = { x: 0, y: 0 };

  protected boxes: Map<string, ArtefactAABB> = new Map<string, ArtefactAABB>();
  protected drawnRects: Map<
    string,
    d3.Selection<SVGRectElement, unknown, null, undefined>
  > = new Map<string, d3.Selection<SVGRectElement, unknown, null, undefined>>();
  protected drawnLabels: Map<
    string,
    d3.Selection<SVGTextElement, unknown, null, undefined>
  > = new Map<string, d3.Selection<SVGTextElement, unknown, null, undefined>>();

  /**
   * Creates a new diagram visualization.
   * @param viewport The HTML element the visualization will used to display it's content in
   * @param imageData The image to be displayed
   * @param aabbs The displayable axis-aligned boxes
   * @param highlightableIds A list of ids, eahc corresponding each to the highlightable box of at the same index in aabbs
   * @param style A {@link Style} object that defines the visualization's appearance
   */
  constructor(
    viewport: HTMLElement,
    imageData: string,
    aabbs: ArtefactAABB[],
    name: string,
    style: Style,
  ) {
    super(name, style);
    for (let box of aabbs) {
      this.boxes.set(box.getIdentifier(), box);
    }
    this.viewport = viewport;
    this.viewport.style.backgroundColor = style.getPaperColor();
    this.viewport.style.overflow = "hidden";
    const image = new Image();
    image.src = imageData;
    let plot = null;
    const onLoad = () => {
      plot = d3
        .select(viewport)
        .append("svg")
        .attr("width", image.width)
        .attr("height", image.height);
      this.svgWidth = image.width;
      this.svgHeight = image.height;
      this.plot.remove();
      this.plot = plot!;
      this.plot
        .append("defs")
        .append("pattern")
        .attr("id", "image-pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", image.width)
        .attr("height", image.height)
        .append("image")
        .attr("xlink:href", imageData)
        .attr("width", image.width)
        .attr("height", image.height);
      this.plot
        .append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .style("fill", "url(#image-pattern)");
      viewport.addEventListener("wheel", (event) => {
        event.preventDefault();
        this.zoomFactor = Math.max(
          this.zoomMinFactor,
          Math.min(
            this.zoomMaxFactor,
            this.zoomFactor * (1 + -event.deltaY / 1000),
          ),
        );
        this.plot.attr(
          "transform",
          "translate(" +
            this.translation.x +
            "," +
            this.translation.y +
            ") scale(" +
            this.zoomFactor +
            ")",
        );
      });
      viewport.addEventListener("mousedown", (event) => {
        this.isDragging = true;
        this.dragStart = { x: event.clientX, y: event.clientY };
      });
      viewport.addEventListener("mouseup", (event) => {
        this.isDragging = false;
      });
      viewport.addEventListener("mousemove", (event) => {
        if (this.isDragging) {
          const dx = event.clientX - this.dragStart.x;
          const dy = event.clientY - this.dragStart.y;
          this.dragStart = { x: event.clientX, y: event.clientY };
          this.translation.x += dx;
          this.translation.y += dy;
          this.plot.attr(
            "transform",
            "translate(" +
              this.translation.x +
              "," +
              this.translation.y +
              ") scale(" +
              this.zoomFactor +
              ")",
          );
        }
      });
    };
    this.svgWidth = image.width;
    this.svgHeight = image.height;
    this.plot = d3.select(viewport).append("svg");
    image.onload = onLoad;
  }

  getButtons(): ConceptualUIButton[] {
    return [
      new ConceptualUIButton("[]", "draw all", () => {
        for (let id of this.boxes.keys()) {
          this.highlightElement(id, "red");
        }
        return true;
      }),
      new ConceptualUIButton("_", "clear all", () => {
        for (let id of this.boxes.keys()) {
          this.unhighlightElement(id);
        }
        return true;
      }),
    ].concat(super.getButtons());
  }

  protected highlightElement(id: string, color: string): void {
    if (this.drawnRects.has(id)) {
      this.unhighlightElement(id);
    }
    const box = this.boxes.get(id)!;
    const rect = this.plot
      .append("rect")
      .attr("x", box.getMainBox().getX())
      .attr("y", box.getMainBox().getY())
      .attr("width", box.getMainBox().getWidth())
      .attr("height", box.getMainBox().getHeight())
      .attr("stroke", color)
      .attr("stroke-width", 5)
      .on("click", () => {
        this.toggleHighlight(id);
      })
      .attr("fill", "none");
    this.drawnRects.set(id, rect);
    const label = this.plot
      .append("text")
      .attr("x", box.getTextBox().getX() + box.getTextBox().getWidth() / 2)
      .attr("y", box.getTextBox().getY() + box.getTextBox().getHeight() / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", color)
      .attr("stroke", 2)
      .attr("font-size", 25)
      .attr("user-select", "none")
      .on("click", () => {
        this.toggleHighlight(id);
      })
      .text(box.getTextBox().getText());
    this.drawnLabels.set(id, label);
  }
  protected unhighlightElement(id: string): void {
    const rect = this.drawnRects.get(id);
    const label = this.drawnLabels.get(id);
    if (rect) {
      rect.remove();
      label!.remove();
      this.drawnRects.delete(id);
      this.drawnLabels.delete(id);
    }
  }
  protected setElementsHighlightable(ids: string[]): void {
    // for visual clarity, boxes are only displayed when they are highlighted, so there is not reason to show anything here
  }
  protected setElementsNotHighlightable(ids: string[]): void {
    // for visual clarity, boxes are only displayed when they are highlighted, so there is not reason to show anything here
  }
  public getName(id: string): string {
    return this.boxes.get(id)!.getTextBox().getText();
  }

  setStyle(style: Style): void {
    this.viewport.style.backgroundColor = style.getPaperColor();
  }
}
