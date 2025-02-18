import { Buttoned, ConceptualUIButton } from "../abstractUI";
import { TraceLinkListener } from "../app/visualizationObserver";
import { TraceabilityLink } from "../classes";
import { Style, StyleableUIElement } from "../style";
import { Closeable } from "./closeable";

export class TraceLinkVisualization
  extends Closeable
  implements Buttoned, TraceLinkListener, StyleableUIElement
{
  protected colorSelectable: string;
  protected viewport: HTMLElement;

  protected lastColors: string[] = [];
  protected lastNames: string[][] = [];
  protected lastReportedState: { text: string; color: string }[];
  protected maxFontSize: number;
  protected style: Style;

  constructor(viewport: HTMLElement, style: Style, fontSize: number) {
    super();
    this.style = style;
    style.applyToPanel(viewport);
    this.viewport = viewport;
    viewport.style.overflow = "auto";
    this.maxFontSize = fontSize;
    this.viewport.style.backgroundColor = style.getPaperColor();
    this.viewport.style.fontSize = fontSize + "px";
    this.colorSelectable = style.getSelectableTextColor();
    this.lastReportedState = [];
    this.redraw();
  }

  public setStyle(style: Style): void {
    this.style = style;
    style.applyToPanel(this.viewport);
    this.viewport.style.backgroundColor = style.getPaperColor();
    this.viewport.style.fontSize = this.maxFontSize + "px";
    this.colorSelectable = style.getSelectableTextColor();
    this.redraw();
  }

  private redraw(): void {
    this.viewport.innerHTML = "";
    this.viewport.classList.add("uiBigColumn");
    this.viewport.style.alignItems = "start";
    const linksToAdd = this.lastReportedState.map((state) => state);
    let fontSize = this.maxFontSize;
    let currentRowDiv = document.createElement("div");
    currentRowDiv.classList.add("uiBigRow");
    currentRowDiv.style.marginLeft = fontSize / 4 + "px";
    currentRowDiv.style.marginBottom = fontSize / 4 + "px";
    this.viewport.appendChild(currentRowDiv);
    let lastColor = linksToAdd.length > 0 ? linksToAdd[0].color : "";
    while (linksToAdd.length > 0) {
      const link = linksToAdd.pop()!;
      const entry = document.createElement("div");
      entry.appendChild(document.createTextNode(link.text));
      entry.style.color = link.color;
      entry.style.textShadow =
        "1px 1px 1px" + this.style.getHighlightedTextOutlineColor();
      entry.style.userSelect = "none";
      entry.style.fontSize = fontSize + "px";
      entry.style.whiteSpace = "nowrap";
      entry.style.marginRight = fontSize / 2 + "px";
      currentRowDiv.appendChild(entry);
      if (
        currentRowDiv.getBoundingClientRect().width + fontSize >
          this.viewport.getBoundingClientRect().width ||
        link.color != lastColor
      ) {
        entry.remove();
        currentRowDiv = document.createElement("div");
        currentRowDiv.classList.add("uiBigRow");
        this.viewport.appendChild(currentRowDiv);
      }
      lastColor = link.color;
      currentRowDiv.appendChild(entry);
    }
  }

  public reportStateChanged(
    links: TraceabilityLink[],
    colors: string[],
    names: string[][],
  ): void {
    this.lastReportedState = [];
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const color = colors[i];
      const source = names[i][0];
      const target = names[i][1];
      this.lastReportedState.push({
        text: "(" + source + " <-> " + target + ")",
        color: color,
      });
    }
    this.redraw();
  }

  public reportClosed(index: number): void {
    this.redraw();
  }

  getButtons(): ConceptualUIButton[] {
    return [
      new ConceptualUIButton(ConceptualUIButton.SYMBOL_CLOSE, "Close", () => {
        this.shouldClose();
        return true;
      }),
    ];
  }
}
