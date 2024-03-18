import { parseTraceLinksFromCSV } from './parse/parse';
import { Application } from './app/application';
import { MediationTraceabilityLink } from './concepts/mediationTraceLink';
import { fabricateFileManagerPanelButton } from './ui/fileManagerPanel';
import { FileManager } from './app/fileManager';
import { Style } from './style';
import { UIFactory } from './uiFactory';
import { VisualizationFactory, VisualizationType } from './artifactVisualizations/visFactory';

const STYLE = Style.ARDOCO;

/**
 * Helper function to load a file from an url
 * @param url the url to load the file from
 */
export async function load(url: string): Promise<string> {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load '${url}'. Status: ${response.status}`);
      }
      return response.text();
    })
    .catch(error => {
      console.error('Error loading file:', error);
      throw error;
    });
}

/**
 * Add the title to a panel
 * @param titlePanel the HTLMElement to add the title to
 */
function writeTitle(titlePanel : HTMLElement) {
  const title = "ArDoCo Trace View";
  const bigger = 50;
  const smaller = 30;
  const fontSizes = "ArDoCo T".split("").map((c) => bigger).concat("race ".split("").map((c) => smaller)).concat( bigger).concat("iew".split("").map((c) => smaller));
  for (let i = 0; i < title.length; i++) {
    const letterDiv = document.createElement('span');
    letterDiv.appendChild(document.createTextNode(title[i]));
    letterDiv.style.color = Style.ARDOCO.getHeaderColor();
    letterDiv.style.marginRight = "0px";
    letterDiv.style.fontSize = fontSizes[i] + "px";
    titlePanel.appendChild(letterDiv);
  }
}

/**
 * Initialize the UI, sets up a {@link FileManager} and attaches a corresponding button to the top bar
 * @returns the file manager
 */
function initUI() {
  const top = document.getElementById('top')!;
  top.style.height = "60px";
  top.classList.add("app-header");
  const img = document.createElement('img');
  img.src = "https://ardoco.de/favicon.ico";
  img.style.height = "100%";
  img.style.marginRight = "10px";
  img.ondragstart = () => false;
  top.appendChild(img);
  const titlePanel = document.createElement('div');
  const buttonPanel = document.createElement('div');
  top.appendChild(titlePanel);
  top.appendChild(buttonPanel);
  titlePanel.style.height = "100%";
  titlePanel.style.width = "70%";
  buttonPanel.style.height = "100%";
  buttonPanel.style.width = "30%";
  buttonPanel.style.display = "flex";
  buttonPanel.style.justifyContent = "flex-end";
  buttonPanel.style.paddingRight = "80px";
  top.style.backgroundColor = STYLE.getPaperColor();
  writeTitle(titlePanel);
  const fileManager = new FileManager();
  fabricateFileManagerPanelButton(buttonPanel, fileManager, STYLE);
  return fileManager;
}

/**
 * Initializes the application by adding the drag and drop functionality to the document, loading sample data and creating the {@link Application} object
 * @param fileManager The file manager the application should use
 */
async function init(fileManager : FileManager) {
  document.addEventListener('dragleave', (event) => {
    event.preventDefault();
  });
  document.addEventListener('dragover', (event) => {
      event.preventDefault();
  });
  document.addEventListener('drop', (event) => {
      event.preventDefault();
      const files = event.dataTransfer!.files;
      fileManager.addFiles(Array.from(files));
  });
  const middle = document.getElementById('middle')!;
  middle.style.backgroundColor = STYLE.getBackgroundColor();
  middle.style.height = "95%";
  const urlPrefix = "https://raw.githubusercontent.com/ArDoCo/Benchmark/main/teastore/";
  function truncateId (id : string) : string {
    const sep = "tools/descartes/"; // TODO: don't hardcode this
    return id.indexOf(sep) == -1 ? id : id.substring(id.indexOf(sep));  
  }

  fileManager.addTextFile("umlToNL.txt", await load(urlPrefix + "/goldstandards/goldstandard_sad_2020-sam_2020.csv"));
  fileManager.addTextFile("umlToCode.txt", await load(urlPrefix + "goldstandards/goldstandard_sam_2020-code_2022.csv"));
  fileManager.addTextFile("nlToCode.txt", await load(urlPrefix + "goldstandards/goldstandard_sad_2020-code_2022.csv"));
  fileManager.addTextFile("teastore.txt", await load(urlPrefix + "text_2020/teastore.txt"));
  fileManager.addTextFile("teastore.uml", await load(urlPrefix + "model_2020/uml/teastore.uml"));
  fileManager.addTextFile("codeModel.acm", await load(urlPrefix + "model_2022/code/codeModel.acm"));
  fileManager.addTextFile("diagramData.json", await load(urlPrefix + "goldstandards/goldstandard_sad_id_2018.json"));
  const totalTraceLinks = [
    parseTraceLinksFromCSV(fileManager.getContent("umlToNL.txt")).map((link) => new MediationTraceabilityLink(link.source, link.target, 1, 0)),
    parseTraceLinksFromCSV(fileManager.getContent("umlToCode.txt")).map((link) => new MediationTraceabilityLink(link.source, truncateId(link.target), 1, 2)),
    parseTraceLinksFromCSV(fileManager.getContent("nlToCode.txt")).map((link) => new MediationTraceabilityLink(link.source, truncateId(link.target), 0, 2)),
  ].reduce((a,b) => a.concat(b),[]);
  const app : Application = new Application(middle,fileManager, new VisualizationFactory(),STYLE);
    app.addVisualizationFromData(VisualizationType.NL, [fileManager.getContent("teastore.txt")]);
    app.addVisualizationFromData(VisualizationType.UML, [fileManager.getContent("teastore.uml")]);
    app.addVisualizationFromData(VisualizationType.CODE, [fileManager.getContent("codeModel.acm")]);
    app.addTraceLinksFromData(totalTraceLinks);
    const buttonPanel = document.getElementById('top')!.lastChild as HTMLElement;
    const openVisInitDialog = () => {
      app.promptForNewVisualization();
    };
    const addLinks = () => {
      app.promptForTraceLinks();
    }
    const addUtility = () => {
      app.addTraceLinkVisualization();
    }
    const addVisButton = UIFactory.fabricatePageHeaderDropdownButton(["+"],["Add Visualization", "Add TraceLinks", "Add Other"],[openVisInitDialog,addLinks,addUtility], 0.6 * buttonPanel.getBoundingClientRect().height, STYLE);
    const availableStylesNames = ["ArDoCo","Dark","Light"];
    const availableStyleActions = [Style.ARDOCO,Style.NIGHT,Style.DEFAULT].map((style) => () => {
      middle.style.backgroundColor = style.getBackgroundColor();
      app.setStyle(style);
    });
    const changeStyleButton = UIFactory.fabricatePageHeaderDropdownButton(["🎨"],availableStylesNames,availableStyleActions, 0.6 * buttonPanel.getBoundingClientRect().height, STYLE);
    buttonPanel.insertBefore(changeStyleButton,buttonPanel.firstChild);
    buttonPanel.insertBefore(addVisButton,buttonPanel.firstChild);
}

document.addEventListener("DOMContentLoaded", () => {
  init(initUI());
});