import { HighlightingVisualization } from "../artifactVisualizations/highlightingVisualization";
import { CountingColorSupplier } from "../colorSupplier";
import { TraceabilityLink } from "../classes";
import {
  TraceLinkListener,
  VisualizationObserver,
} from "./visualizationObserver";
import { TraceLinkVisualization } from "../artifactVisualizations/traceLinkVisualization";
import {
  VisualizationFactory,
  VisualizationType,
} from "../artifactVisualizations/visFactory";
import { FabricatedPanel, UIFactory } from "../uiFactory";
import { ReorderableGrid } from "../ui/reorderableGrid";
import { FileManager } from "./fileManager";
import { MediationTraceabilityLink } from "../concepts/mediationTraceLink";
import { Style, StyleableUIElement } from "../style";
import {
  fabricateNewOOPVisPopupPanel,
  fabricateNewTraceLinksPopupPanel,
} from "../ui/oopInitVisPopup";
import { parseTraceLinksFromCSV } from "../parse/parse";

/**
 * A tuple containing a visualization, the closest parent HTML element that is not shared between with any other visualization, an identifier and the title used to reference the visualization in the UI
 
 */
interface VisTuple {
  vis: HighlightingVisualization;
  panel: HTMLElement;
  title: string;
}

/**
 * This class is tasked with setting up a {@link VisualizationObserver} and during the runtime of the application, adding or removing the  HTML elements used by the visualizations.
 * In particular, this class defines the layout of the application's sub panels.
 */
export class Application implements StyleableUIElement {
  protected style: Style;
  protected visTuples: VisTuple[] = [];
  protected grid: ReorderableGrid;
  protected mediator: VisualizationObserver;
  protected fileManager: FileManager;
  protected styleables: StyleableUIElement[] = [];
  protected visualizationFactory: VisualizationFactory;

  /**
   * Creates a new application
   * @param parent The HTML element the application will attach its HTML elements to
   * @param fileManager The file manager to draw files from
   * @param style A style object to be used to set the appearance of the application and all {@link StyleableUIElement}s it will instantiate
   */
  constructor(
    parent: HTMLElement,
    fileManager: FileManager,
    visFactory: VisualizationFactory,
    style: Style,
  ) {
    this.style = style;
    this.fileManager = fileManager;
    this.visualizationFactory = visFactory;
    parent.innerHTML = "";
    const viewport = document.createElement("div");
    viewport.style.height = "100%";
    viewport.style.width = "98%";
    parent.classList.add("uiBigColumn");
    parent.appendChild(viewport);
    this.grid = new ReorderableGrid(viewport, style);
    viewport.style.paddingTop = "20px";
    this.mediator = new VisualizationObserver(new CountingColorSupplier(30));
    const removeVisualization = (id: number): void => {
      this.removeVisualization(id);
    };
    this.mediator.addListener(
      new (class implements TraceLinkListener {
        reportStateChanged(
          links: TraceabilityLink[],
          colors: string[],
          names: string[][],
        ): void {}
        reportClosed(id: number): void {
          removeVisualization(id);
        }
      })(),
    );
  }

  /**
   * Removes a visualizations assigned HTML element from the application. This does not deal with the visualization itself, only the HTML element.
   * @param id The identifier of the target visualization
   */
  private removeVisualization(id: number) {
    const index = this.visTuples.findIndex((tuple) => tuple.vis.getID() == id);
    const targetVis = this.visTuples.splice(index, 1)[0];
    this.grid.remove(targetVis.panel);
  }

  /**
   * This function creates a new visualization using the passed function and performs the required setup to display it in the UI and resize it.
   * @param name The name that will be used to reference this visualization in the UI
   * @param width The viewports desired width as a fraction of the parent viewports width
   * @param constructorFunction A function that takes an HTMLElement and returns a new visualization with the HTMLElement as its viewport
   */
  private addVisualizationPanel(
    name: string,
    width: number,
    constructorFunction: (vp: HTMLElement) => HighlightingVisualization,
  ) {
    let futureVis = null;
    const fabricatedPanel = UIFactory.fabricatePanel(
      name,
      width,
      (vp2: HTMLElement) => {
        const constructed = constructorFunction(vp2);
        futureVis = constructed;
        return constructed;
      },
      this.style,
    );
    const panel = fabricatedPanel.container;
    this.grid.append(panel, fabricatedPanel.header.firstChild as HTMLElement);
    this.styleables.push(fabricatedPanel);
    this.visTuples.push({ vis: futureVis!, panel: panel, title: name });
    this.mediator.appendVisualization(futureVis!);
  }

  /**
   * Adds a visualization of the specified type and with artifacts parsed from the specified string data to the application
   * @param type The desired visualization type
   * @param data The data to be parsed into the artifacts to be visualized
   */
  public addVisualizationFromData(type: VisualizationType, data: string[]) {
    this.addVisualizationPanel(
      this.visualizationFactory.getTypeName(type),
      700,
      this.visualizationFactory.fabricateVisualization(type, data, this.style),
    );
  }

  /**
   * Adds trace links to the application
   * @param traceLinks The trace links to add to the application
   * @param indicesInsteadOfIdentifiers Whether the trace links contain an indice (based on order of addition) or an identifier (based on the visualization's ID)
   */
  public addTraceLinksFromData(
    traceLinks: MediationTraceabilityLink[],
    indicesInsteadOfIdentifiers: boolean = true,
  ) {
    if (indicesInsteadOfIdentifiers) {
      const linksWithIndicesMappedToIdentifiers = traceLinks
        .filter(
          (link) =>
            link.sourceVisIndex < this.visTuples.length &&
            link.targetVisIndex < this.visTuples.length,
        )
        .map(
          (link) =>
            new MediationTraceabilityLink(
              link.source,
              link.target,
              this.visTuples[link.sourceVisIndex].vis.getID(),
              this.visTuples[link.targetVisIndex].vis.getID(),
            ),
        );
      this.mediator.addTraceLinks(linksWithIndicesMappedToIdentifiers);
    } else {
      this.mediator.addTraceLinks(traceLinks);
    }
    this.mediator.redraw();
  }

  /**
   * Adds a visualization that will display the currently active traceability links to the application
   */
  public addTraceLinkVisualization() {
    let traceLinkVisualization = null;
    const fabricatedPanel: FabricatedPanel = UIFactory.fabricatePanel(
      "Trace Links",
      1.0,
      (vp: HTMLElement) => {
        const linkVis = new TraceLinkVisualization(vp, this.style, 20);
        traceLinkVisualization = linkVis;
        this.mediator.addListener(linkVis);
        linkVis.addCloseListener(() => {
          this.grid.remove(fabricatedPanel.container);
        });
        return linkVis;
      },
      this.style,
    );
    this.styleables.push(fabricatedPanel);
    this.styleables.push(traceLinkVisualization!);
    this.grid.append(
      fabricatedPanel.container,
      fabricatedPanel.header.firstChild as HTMLElement,
    );
    this.mediator.redraw();
  }

  /**
   * Opens a popup panel that prompts the user to select a visualization type and artifacts to visualize
   */
  public promptForNewVisualization() {
    fabricateNewOOPVisPopupPanel(
      this.visualizationFactory,
      (data: { visType: VisualizationType; artifactData: string[] }) => {
        this.addVisualizationFromData(
          data.visType,
          data.artifactData.map((fileName) =>
            this.fileManager.getContent(fileName),
          ),
        );
        return true;
      },
      this.fileManager,
      this.style,
    );
  }

  /**
   * Opens a popup panel that prompts the user to file from which to load trace links that should be added to the application
   */
  public promptForTraceLinks() {
    fabricateNewTraceLinksPopupPanel(
      (fileNames: (string | null)[], switched: boolean[]) => {
        let index = 0;
        for (let i = 0; i < this.visTuples.length; i++) {
          for (let j = 0; j < this.visTuples.length; j++) {
            const visTuple1 = this.visTuples[i];
            const visTuple2 = this.visTuples[j];
            if (visTuple1.vis.getID() == visTuple2.vis.getID()) {
              continue;
            }
            const sourceId = switched[index]
              ? visTuple2.vis.getID()
              : visTuple1.vis.getID();
            const targetId = switched[index]
              ? visTuple1.vis.getID()
              : visTuple2.vis.getID();
            const fileName = fileNames[index];
            if (fileName?.endsWith(".json")) {
              throw new Error("JSON trace links not supported yet");
            } else {
              const links = parseTraceLinksFromCSV(
                this.fileManager.getContent(fileNames[index]!),
              ).map(
                (link) =>
                  new MediationTraceabilityLink(
                    link.source,
                    link.target,
                    sourceId,
                    targetId,
                  ),
              );
              this.addTraceLinksFromData(links, false);
            }
            index++;
          }
        }
        return true;
      },
      this.visTuples.map((tuple) => tuple.title),
      this.fileManager,
      this.style,
    );
  }

  setStyle(style: Style): void {
    this.style = style;
    for (let tuple of this.visTuples) {
      tuple.vis.setStyle(style);
    }
    for (let styleable of this.styleables) {
      styleable.setStyle(style);
    }
    this.grid.setStyle(style);
    this.mediator.redraw();
  }
}
