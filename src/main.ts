const umlFileUrl = 'https://raw.githubusercontent.com/ArDoCo/Benchmark/main/teastore/model_2020/uml/teastore.uml';
const nlFileUrl = 'https://raw.githubusercontent.com/ArDoCo/Benchmark/main/teastore/text_2020/teastore.txt';
const traceLinkFileUrl = 'https://raw.githubusercontent.com/ArDoCo/Benchmark/main/teastore/goldstandards/goldstandard_sad_2020-sam_2020.csv';
const codeFileUrl = "https://raw.githubusercontent.com/ArDoCo/Benchmark/main/teastore/model_2022/code/codeModel.acm";

const testing_bypassFileInput = true;

import { NLSentence, TraceabilityLink, } from './classes';
import { parseNLTXT, parseTraceLinksFromCSV, parseUML, parseCodeFromACM } from './parse';
import { SplitVisualization } from './splitVisualization';
import { addFileInputPlaceholder, addPlaceholder } from './ui';
import { UMLBase } from './uml';

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
  const middle = document.getElementById('middle')!;
  const umlData = await load(umlFileUrl);
  const sentencesData = await load(nlFileUrl)
  const traceLinkData = await load(traceLinkFileUrl);
  let sentences : NLSentence[] = parseNLTXT(sentencesData);
  let traceLinks = parseTraceLinksFromCSV(traceLinkData).map((link) => {
    return new TraceabilityLink(link.target, link.source);
  });
  let umlObjects = parseUML(umlData);
  let codeModel = parseCodeFromACM(await load(codeFileUrl));
  const colors = new Map<string,string>();
  if (testing_bypassFileInput) {
    const totalVis : SplitVisualization = new SplitVisualization(middle,sentences,umlObjects,traceLinks, () => {});
  } else {
    let leftContent : NLSentence[] | null = null;
    let traceLinkContent : TraceabilityLink[] | null = null;
    let rightContent : UMLBase[] | null = null;
    const placeholder = document.createElement('div');
    placeholder.style.height = "90%";
    placeholder.style.width = "70%";
    placeholder.classList.add("placeholder-shared");
    placeholder.style.backgroundColor = "rgb(255,255,255)";
    placeholder.style.border = "1px solid black";
    placeholder.style.userSelect = "none";
    placeholder.style.flexDirection = "row";
    placeholder.appendChild(document.createTextNode("+"));
    placeholder.style.fontSize = "100px";
    placeholder.addEventListener("click", () => {
      placeholder.innerHTML = "";
      addFileInputPlaceholder(placeholder, "40%", "90%", "Left", "50px", (fileContent : string) => {
        try {
          const optContent = parseNLTXT(fileContent);
          if (optContent != null && optContent.length > 0) {
            leftContent = optContent;
            console.log((leftContent == null) + " " + (traceLinkContent == null) + " " + (rightContent == null));
            if (leftContent != null && traceLinkContent != null && rightContent != null) {
              const totalVis : SplitVisualization = new SplitVisualization(middle,leftContent,rightContent,traceLinkContent, () => {});
            }
            return true;
          }
          return false;
        } catch (e) {
          return false;
        }
      });
      addFileInputPlaceholder(placeholder, "40%", "90%", "Trace Links", "30px", (fileContent : string) => {
        try {
          const optContent = parseTraceLinksFromCSV(fileContent);
          if (optContent != null && optContent.length > 0) {
            traceLinkContent = optContent;
            console.log((leftContent == null) + " " + (traceLinkContent == null) + " " + (rightContent == null));
            if (leftContent != null && traceLinkContent != null && rightContent != null) {
              const totalVis : SplitVisualization = new SplitVisualization(middle,leftContent,rightContent,traceLinkContent, () => {});
            }
            return true;
          }
          return false;
        } catch (e) {
          return false;
        }
      });
      addFileInputPlaceholder(placeholder, "40%", "90%", "Right", "50px", (fileContent : string) => {
        try {
          const optContent = parseUML(fileContent);
          if (optContent != null && optContent.length > 0) {
            rightContent = optContent;
            console.log((leftContent == null) + " " + (traceLinkContent == null) + " " + (rightContent == null));
            if (leftContent != null && traceLinkContent != null && rightContent != null) {
              const totalVis : SplitVisualization = new SplitVisualization(middle,leftContent,rightContent,traceLinkContent, () => {});
            }
            return true;
          }
          return false;
        } catch (e) {
          return false;
        }
      });
      (placeholder.childNodes[1] as HTMLElement).style.borderLeft = "1px solid black";
      (placeholder.childNodes[1] as HTMLElement).style.borderRight = "1px solid black";

      placeholder.lastChild!.addEventListener("click", () => {
        console.log("right");
      });
      //const totalVis : SplitVisualization = new SplitVisualization(middle,leftContent,rightContent,traceLinks);
    });
    middle.appendChild(placeholder);
    /*
    if (testing) {
      //placeholder.dispatchEvent(new Event('click'));
      for (let child of placeholder.childNodes) {
        child.dispatchEvent(new Event('click'));
      }
    }
    */

  }
}

document.addEventListener("DOMContentLoaded", () => {
  /*
  for (let fileInputid of ['leftInput', 'rightInput', "traceLinkInput"]) {
    const fileInput = document.getElementById(fileInputid) as HTMLInputElement;
    fileInput.value = "";
  }
  */
  init();
});