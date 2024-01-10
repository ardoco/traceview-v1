import { NLSentence, TraceabilityLink, } from './classes';
import { parseNLTXT, parseTraceLinksFromCSV, parseUML } from './parse';
import { parseCodeFromACM } from './parseACM';
import { SplitVisualization } from './splitVis';
import { addFileInputPlaceholder, addPlaceholder } from './ui';
import { UMLBase } from './uml';
import { Config } from './config';
import { CodeModel } from './acmClasses';
import { CountingColorSupplier } from './colorSupplier';
import { MediationTraceabilityLink } from './visualizationMediator';

async function load(url: string): Promise<string> {
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

async function init() {
  const top = document.getElementById('top')!;
  top.innerHTML = "";
  top.style.textShadow = "1px 1px 1px #000000";
  const title = "Traceability Links";
  const highlightCount = 3;
  const colorSupplier = new CountingColorSupplier(title.length);
  for (let i = 0; i < title.length; i++) {
    const letterDiv = document.createElement('span');
    letterDiv.appendChild(document.createTextNode(title[i]));
    letterDiv.style.color = i % highlightCount == 0 ? colorSupplier.reserveColor("" + i) : Config.PREFERENCE_COLOR_SELECTABLE;
    letterDiv.style.marginRight = "0px";
    top.appendChild(letterDiv);
  }
  const middle = document.getElementById('middle')!;
  middle.style.height = "95%";
  middle.style.backgroundColor = Config.PREFERENCE_COLOR_BACKGROUND;
  const urlPrefix = "https://raw.githubusercontent.com/ArDoCo/Benchmark/main/teastore/";
  const tlSentencesToUml = await load(urlPrefix + "/goldstandards/goldstandard_sad_2020-sam_2020.csv");
  const tlSentencesCode = await load(urlPrefix + "goldstandards/goldstandard_sad_2020-code_2022.csv");
  const tlUmlToCode = await load(urlPrefix + "goldstandards/goldstandard_sam_2020-code_2022.csv");
  let sentences : NLSentence[] = parseNLTXT(await load(urlPrefix + "text_2020/teastore.txt"));
  let umlObjects = parseUML(await load(urlPrefix + "model_2020/uml/teastore.uml"));
  let codeModel = parseCodeFromACM(await load(urlPrefix + "model_2022/code/codeModel.acm"));
  function truncateId (id : string) : string {
    const sep = "tools/descartes/"; // TODO: don't hardcode this
    return id.indexOf(sep) == -1 ? id : id.substring(id.indexOf(sep));
  }
  const totalTraceLinks = [
    parseTraceLinksFromCSV(tlSentencesToUml).map((link) => new MediationTraceabilityLink(link.target, link.source, 0, 1)),
    parseTraceLinksFromCSV(tlUmlToCode).map((link) => new MediationTraceabilityLink(link.source, truncateId(link.target), 1, 2)),
    parseTraceLinksFromCSV(tlSentencesCode).map((link) => new MediationTraceabilityLink(link.source, truncateId(link.target), 0, 2))
  ].reduce((a,b) => a.concat(b),[]);
  const totalVis : SplitVisualization = new SplitVisualization(middle,sentences,umlObjects,codeModel, totalTraceLinks,() => {});
}

document.addEventListener("DOMContentLoaded", () => {
  /*
  for (let fileInputid of ['leftInput', 'rightInput', "traceLinkInput"]) {
    const fileInput = document.getElementById(fileInputid) as HTMLInputElement;
    fileInput.value = "";
  }
  */
  init();
  // iterate over all html elements on the page
});