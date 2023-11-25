const umlFileUrl = 'https://raw.githubusercontent.com/ArDoCo/Benchmark/main/teastore/model_2020/uml/teastore.uml';
const nlFileUrl = 'https://raw.githubusercontent.com/ArDoCo/Benchmark/main/teastore/text_2020/teastore.txt';
const traceLinkFileUrl = 'https://raw.githubusercontent.com/ArDoCo/Benchmark/main/teastore/goldstandards/goldstandard_sad_2020-sam_2020.csv';

import { NLSentence, TraceabilityLink, } from './classes';
import { parseNLTXT, parseTraceLinksFromCSV, parseUML } from './parse';
import { SplitVisualization } from './splitVisualization';

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
  const middle = document.getElementById('middle');
  const umlData = await load(umlFileUrl);
  const sentencesData = await load(nlFileUrl)
  const traceLinkData = await load(traceLinkFileUrl);
  let sentences : NLSentence[] = parseNLTXT(sentencesData);
  let traceLinks = parseTraceLinksFromCSV(traceLinkData).map((link) => {
    return new TraceabilityLink(link.target, link.source);
  });
  let umlObjects = parseUML(umlData);
  const colors = new Map<string,string>();
  if (middle) {
    let totalVis : SplitVisualization = new SplitVisualization(middle,sentences,umlObjects,traceLinks);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  for (let fileInputid of ['leftInput', 'rightInput', "traceLinkInput"]) {
    const fileInput = document.getElementById(fileInputid) as HTMLInputElement;
    fileInput.value = "";
  }
  init();
});