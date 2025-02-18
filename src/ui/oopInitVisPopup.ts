import { FileManager } from "../app/fileManager";
import {
  VisualizationFactory,
  VisualizationType,
} from "../artifactVisualizations/visFactory";
import { ButtonStyle, Style } from "../style";

/**
 * This class represents a dropdown menu that allows the user to select a string from a list of options. Intended to be used to select filesNames among the files in the {@link FileManager}.
 */
export class Picker {
  protected listeners: ((fileName: string | null) => void)[] = [];

  protected select: HTMLSelectElement;

  /**
   * A facade for a dropdown menu that allows the user to select a string from a list of options. Intended to be used to select filesNames among the files in the {@link FileManager}.
   * @param style A style object to define the dropdown menu's appearance
   * @param options The list of possible options for the dropdown menu
   * @param fontSizeInPx The font size in pixels
   * @param allowEmpty Whether or not the dropdown menu should have an empty option, if it does, the empty option will be the initially selected and first option in the list
   */
  constructor(
    style: Style,
    options: string[],
    fontSizeInPx: number,
    allowEmpty: boolean,
  ) {
    this.listeners = [];
    this.select = document.createElement("select");
    const actualOptions = allowEmpty ? ["-"].concat(options) : options;
    for (let option of actualOptions) {
      const optionElement = document.createElement("option");
      optionElement.value = option;
      optionElement.text = option;
      this.select.appendChild(optionElement);
    }
    this.select.addEventListener("change", () => {
      if (this.select.value != "-") {
        this.listeners.forEach((listener) => listener(this.select.value));
      }
    });
    this.select.style.fontSize = fontSizeInPx + "px";
    this.select.style.backgroundColor = style.getPaperColor();
    this.select.style.color = style.getSelectableTextColor();
    this.select.style.border = "1px solid " + style.getBorderColor();
    this.select.style.padding = "5px";
    this.select.style.width = "50%";
  }

  addListener(listener: (fileName: string | null) => void) {
    this.listeners.push(listener);
  }

  attachTo(parent: HTMLElement) {
    parent.appendChild(this.select);
  }

  getValue(): string | null {
    return this.select.value;
  }
}

/**
 * Convenience function to avoid code duplication when creating a new row with a dropdown menu
 * @param parent The parent HTML element to attach the new row to
 * @param label A string that will be used as the label of the row
 * @param style A style object to set the row's appearance
 * @param options All possible options for the dropdown menu
 * @param fontSizeInPx The font size in pixels
 * @param allowEmpty Whether or not the dropdown menu should have an empty option
 * @param onChange A listener that will be called wheneve the dropdown menu's value changes
 * @returns The dropdown menu
 */
function fabricatePickerRow(
  parent: HTMLElement,
  label: string,
  style: Style,
  options: string[],
  fontSizeInPx: number,
  allowEmpty: boolean,
  onChange: (selected: string | null) => void,
): Picker {
  const typeDDM = new Picker(style, options, fontSizeInPx, allowEmpty);
  const typeRow = document.createElement("div");
  typeRow.style.width = "100%";
  typeRow.style.fontSize = fontSizeInPx + "px";
  typeRow.style.paddingTop = "20px";
  typeRow.classList.add("uiBigRow");
  const labelDiv = document.createElement("div");
  labelDiv.style.width = "20%";
  labelDiv.style.textAlign = "right";
  labelDiv.style.paddingRight = "20px";
  labelDiv.appendChild(document.createTextNode(label + ":"));
  typeRow.appendChild(labelDiv);
  typeDDM.attachTo(typeRow);
  typeDDM.addListener(onChange);
  parent.appendChild(typeRow);
  return typeDDM;
}

/**
 * A helper function to avoid code duplication when creating a popup panel. Sets up a dark overlay over the document and a panel in the center of the screen.
 * @param titleLabel A string that will be used as the title of the panel
 * @param style A style object to define the panel's appearance
 * @param fontSizeInPx The font size in pixels
 * @returns A tuple consisting of the panel and the overlay
 */
function createATitledPanel(
  titleLabel: string,
  style: Style,
  fontSizeInPx: number,
): [HTMLElement, HTMLElement] {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.classList.add("popup-background");
  document.body.appendChild(overlay);
  const popup = document.createElement("div");
  popup.classList.add("initVis-popup");
  style.applyToContainer(popup);
  popup.style.backgroundColor = style.getPaperColor();
  popup.style.alignItems = "center";
  const title = document.createElement("div");
  title.style.fontSize = 1.4 * fontSizeInPx + "px";
  title.style.paddingTop = fontSizeInPx + "px";
  title.style.paddingBottom = fontSizeInPx + "px";
  title.style.width = "100%";
  title.classList.add("initVis-title");
  style.applyToHeader(title);
  popup.appendChild(title);
  title.appendChild(document.createTextNode(titleLabel));
  title.style.textDecoration = "underline";
  overlay.appendChild(popup);
  overlay.addEventListener("click", () => {
    overlay.remove();
  });
  popup.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      overlay.remove();
    }
  });
  return [popup, overlay];
}

/**
 * A helper function to set a button's behaviour when, hovered over and clicked
 * @param button The target button element
 * @param style A style object to define the button's appearance
 */
function setButtonColorBehavior(button: HTMLElement, style: ButtonStyle) {
  button.addEventListener("mouseover", () => {
    button.style.backgroundColor = style.getButtonHoverColor();
  });
  button.addEventListener("mouseout", () => {
    button.style.backgroundColor = style.getButtonColor();
  });
  button.addEventListener("mousedown", () => {
    button.style.backgroundColor = style.getButtonDownColor();
  });
  button.addEventListener("mouseup", () => {
    button.style.backgroundColor = style.getButtonHoverColor();
  });
  button.addEventListener("mouseleave", () => {
    button.style.backgroundColor = style.getButtonColor();
  });
}

/**
 * Convenience function that will setup a div as a button to close the popup panel
 * @param parent The parent HTML element to attach the new button to
 * @param style A style object to define the button's appearance
 * @param fontSizeInPx The font size in pixels
 * @param clickAction The action to be performed when the button is clicked, usually removing the panel
 */
function createACloseButton(
  parent: HTMLElement,
  style: ButtonStyle,
  fontSizeInPx: number,
  clickAction: () => void,
) {
  const buttonPanel = document.createElement("div");
  buttonPanel.style.width = "80%";
  buttonPanel.style.height = "10%";
  buttonPanel.style.display = "flex";
  setButtonColorBehavior(buttonPanel, style);
  buttonPanel.addEventListener("click", () => {
    clickAction();
  });
  buttonPanel.appendChild(document.createTextNode("Create"));
  buttonPanel.style.fontSize = fontSizeInPx + "px";
  buttonPanel.style.justifyContent = "center";
  buttonPanel.style.alignItems = "center";
  buttonPanel.style.backgroundColor = style.getButtonColor();
  buttonPanel.style.color = style.getTextColor();
  buttonPanel.style.border = "1px solid " + style.getBorderColor();
  parent.appendChild(buttonPanel);
}

/**
 * Creates and displays a popup panel while darkening the rest of the document. The panel will contain a dropdown menu for the user to select a visualization type and depending on the user's choice,
 *  additional dropdown menus for the user to select the files necessary to initialize the visualization. Additionally it also contains a button to close the popup and pass the selected data to the application.
 * @param visFactory The {@link VisualizationFactory} defining the visualization types and their expected file count
 * @param sendToApp A function to be used to send the selected data to the application
 * @param appFileManager The invoking application's {@link FileManager} to draw file names from
 * @param style A style object to the new visualization's appearance
 */
export function fabricateNewOOPVisPopupPanel(
  visFactory: VisualizationFactory,
  sendToApp: (data: {
    visType: VisualizationType;
    artifactData: string[];
  }) => boolean,
  appFileManager: FileManager,
  style: Style,
): void {
  const fontSize = 25;
  const popupAndOverlay = createATitledPanel(
    "New Visualization:",
    style,
    fontSize,
  );
  const popup = popupAndOverlay[0];
  const overlay = popupAndOverlay[1];
  const artifactsPanel = document.createElement("div");
  let inputFilePickers: Picker[] = [];
  const typeRow = fabricatePickerRow(
    popup,
    "Type",
    style,
    visFactory
      .getAllVisualizationTypes()
      .map((type) => visFactory.getTypeName(type)),
    fontSize,
    true,
    (typeName) => {
      artifactsPanel.innerHTML = "";
      inputFilePickers = [];
      if (typeName != null) {
        for (
          let i = 0;
          i < visFactory.getExpectedFileCount(visFactory.getType(typeName));
          i++
        ) {
          const pick = fabricatePickerRow(
            artifactsPanel,
            "Input File " + (i + 1),
            style,
            appFileManager.getAllFileNames(),
            fontSize,
            true,
            (fileName) => {},
          );
          inputFilePickers.push(pick);
        }
      }
    },
  );
  artifactsPanel.style.borderTop = "1px solid " + style.getBorderColor();
  artifactsPanel.classList.add("uiBigColumn");
  artifactsPanel.style.marginTop = "50px";
  artifactsPanel.style.width = "100%";
  artifactsPanel.style.height = "50%";
  style.applyToPanel(artifactsPanel);
  popup.appendChild(artifactsPanel);
  createACloseButton(popup, style.getButtonStyle(), fontSize, () => {
    if (
      typeRow.getValue() != null &&
      inputFilePickers.every((picker) => picker.getValue() != null)
    ) {
      sendToApp({
        visType: visFactory.getType(typeRow.getValue()!),
        artifactData: inputFilePickers.map((picker) => picker.getValue()!),
      });
    }
    overlay.remove();
  });
}

/**
 * Convenience function that will setup a row with a dropdown menu and button that allows the user to select a string and an additional boolean state
 * @param parent The parent HTML element to attach the new row to
 * @param label The label of the row
 * @param pair A pair of strings the order of which can be switched
 * @param style A style object to define the row's appearance
 * @param options The list of possible options for the dropdown menu
 * @param fontSizeInPx The font size in pixels
 * @param allowEmpty Whether or not the dropdown menu should have an empty option
 * @param onSwitch A listener that will be called whenevet the boolean state changes
 * @returns
 */
function fabricateSwitchablePairPickerRow(
  parent: HTMLElement,
  label: string,
  pair: [string, string],
  style: Style,
  options: string[],
  fontSizeInPx: number,
  allowEmpty: boolean,
  onSwitch: (newState: boolean) => void,
): Picker {
  const typeDDM = new Picker(style, options, fontSizeInPx, allowEmpty);
  const typeRow = document.createElement("div");
  typeRow.style.width = "100%";
  typeRow.style.fontSize = 0.5 * fontSizeInPx + "px";
  typeRow.style.paddingTop = "20px";
  typeRow.classList.add("uiBigRow");
  const labelDiv = document.createElement("div");
  labelDiv.style.width = "40%";
  labelDiv.style.textAlign = "right";
  labelDiv.style.paddingRight = "20px";
  labelDiv.appendChild(
    document.createTextNode(label + " " + pair[0] + " -> " + pair[1] + ":"),
  );
  typeRow.appendChild(labelDiv);
  typeDDM.attachTo(typeRow);
  const switchButton = document.createElement("button");
  switchButton.style.width = "10%";
  switchButton.style.height = "100%";
  switchButton.style.fontSize = 0.5 * fontSizeInPx + "px";
  typeRow.appendChild(switchButton);
  setButtonColorBehavior(switchButton, style.getButtonStyle());
  let switchYes: boolean = false;
  switchButton.addEventListener("click", () => {
    labelDiv.innerHTML = "";
    if (switchYes) {
      labelDiv.appendChild(
        document.createTextNode(label + " " + pair[0] + " <- " + pair[1] + ":"),
      );
    } else {
      labelDiv.appendChild(
        document.createTextNode(label + " " + pair[1] + " -> " + pair[0] + ":"),
      );
    }
    switchYes = !switchYes;
    onSwitch(switchYes);
  });
  switchButton.appendChild(document.createTextNode("⇆"));
  parent.appendChild(typeRow);
  return typeDDM;
}

/**
 * Creates and displays a popup panel while darkening the rest of the document.
 * The panel will contain a labeled dropdown menu for each possible pair of the invoking application's currently active visualizations
 * that allows the user to select a file to add trace links between the two paired visualizations.
 * It also contains button that will close the panel and pass on the selected fileNames to the application
 * @param sendToApp The function to be used to send the selected data to the application
 * @param otherVisNames The names of the application's currently active visualizations
 * @param style A style object to define the panel's appearance
 */
export function fabricateNewTraceLinksPopupPanel(
  sendToApp: (data: (string | null)[], switchOrder: boolean[]) => boolean,
  otherVisNames: string[],
  fileManager: FileManager,
  style: Style,
): void {
  const fontSize = 25;
  const popupAndOverlay = createATitledPanel(
    "Add Trace-Links:",
    style,
    fontSize,
  );
  const popup = popupAndOverlay[0];
  const overlay = popupAndOverlay[1];
  const switchStates = otherVisNames.map((name) => false);
  const pickers: Picker[] = [];
  for (let i = 0; i < otherVisNames.length; i++) {
    for (let j = i; j < otherVisNames.length; j++) {
      const otherVisName = otherVisNames[i];
      const otherVisName2 = otherVisNames[j];
      if (otherVisName == otherVisName2) {
        continue;
      }
      const ddm = fabricateSwitchablePairPickerRow(
        popup,
        "TLs",
        [otherVisName, otherVisName2],
        style,
        fileManager.getAllFileNames(),
        fontSize,
        true,
        (newState: boolean) => {
          switchStates[otherVisNames.indexOf(otherVisName)] = newState;
          console.log(switchStates);
        },
      );
      pickers.push(ddm);
    }
  }
  createACloseButton(popup, style.getButtonStyle(), fontSize, () => {
    const pickedFileNames = [];
    for (let i = 0; i < pickers.length; i += 2) {
      if (pickers[i].getValue() != null) {
        pickedFileNames.push(pickers[i].getValue()!);
      } else {
        pickedFileNames.push(null);
      }
    }
    sendToApp(pickedFileNames, switchStates);
    overlay.remove();
  });
}
