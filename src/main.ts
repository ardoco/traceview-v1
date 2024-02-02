import { parseTraceLinksFromCSV, parseUML } from './parse/parse';
import { Application } from './app/application';
import { Config } from './config';
import { CountingColorSupplier } from './colorSupplier';
import { MediationTraceabilityLink } from './concepts/mediationTraceLink';
import { fabricateFileManagerPanelButton } from './ui/fileManagerPanel';
import { FileManager } from './app/fileManager';
import { Style } from './style';
import { parseAABBs } from './parse/parseBBs';

const STYLE = Style.NIGHT;

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

function writeTitle(titlePanel : HTMLElement) {
  const title = "Traceability Links";
  const highlightCount = 3;
  const colorSupplier = new CountingColorSupplier(title.length);
  for (let i = 0; i < title.length; i++) {
    const letterDiv = document.createElement('span');
    letterDiv.appendChild(document.createTextNode(title[i]));
    letterDiv.style.color = i % highlightCount == 0 ? colorSupplier.reserveColor("" + i) : STYLE.getSelectableTextColor();
    letterDiv.style.marginRight = "0px";
    titlePanel.appendChild(letterDiv);
  }
}

function initUI() {
  const top = document.getElementById('top')!;
  top.style.height = "60px";
  top.classList.add("app-header");
  const titlePanel = document.createElement('div');
  const buttonPanel = document.createElement('div');
  top.appendChild(titlePanel);
  top.appendChild(buttonPanel);
  titlePanel.style.height = "100%";
  titlePanel.style.width = "70%";
  buttonPanel.style.height = "100%";
  buttonPanel.style.width = "30%";
  top.style.backgroundColor = STYLE.getPaperColor();
  writeTitle(titlePanel);
  const fileManager = new FileManager();
  fabricateFileManagerPanelButton(buttonPanel, fileManager, STYLE);
  return fileManager;
}

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
  //fileManager.addTextFile("Text", await load("https://raw.githubusercontent.com/ArDoCo/Benchmark/main/teastore/text_2020/teastore.txt"));
  //fileManager.addTextFile("UML", await load("https://raw.githubusercontent.com/ArDoCo/Benchmark/main/teastore/model_2020/uml/teastore.uml"));
  const middle = document.getElementById('middle')!;
  middle.style.backgroundColor = STYLE.getBackgroundColor();
  middle.style.height = "95%";
  const urlPrefix = "https://raw.githubusercontent.com/ArDoCo/Benchmark/main/teastore/";
  function truncateId (id : string) : string {
    const sep = "tools/descartes/"; // TODO: don't hardcode this
    return id.indexOf(sep) == -1 ? id : id.substring(id.indexOf(sep));  
  }
  const totalTraceLinks = [
    parseTraceLinksFromCSV(await load(urlPrefix + "/goldstandards/goldstandard_sad_2020-sam_2020.csv")).map((link) => new MediationTraceabilityLink(link.target, link.source, 0, 1)),
    parseTraceLinksFromCSV(await load(urlPrefix + "goldstandards/goldstandard_sam_2020-code_2022.csv")).map((link) => new MediationTraceabilityLink(link.source, truncateId(link.target), 1, 2)),
    parseTraceLinksFromCSV(await load(urlPrefix + "goldstandards/goldstandard_sad_2020-code_2022.csv")).map((link) => new MediationTraceabilityLink(link.source, truncateId(link.target), 0, 2))
  ].reduce((a,b) => a.concat(b),[]);
  const app : Application = new Application(middle,fileManager,[
    await load(urlPrefix + "text_2020/teastore.txt"), await load(urlPrefix + "model_2020/uml/teastore.uml"), await load(urlPrefix + "model_2022/code/codeModel.acm")]
    , totalTraceLinks,STYLE); 
}

document.addEventListener("DOMContentLoaded", () => {
  init(initUI());
});