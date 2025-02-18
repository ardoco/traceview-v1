import { TraceabilityLink, NLSentence } from "../classes";

export function parseTraceLinksFromCSV(content: string): TraceabilityLink[] {
  let links: TraceabilityLink[] = [];
  let lines = content.split("\n");
  lines.shift();
  for (let line of lines) {
    let link = line.split(",");
    if (link.length == 2) {
      links.push(new TraceabilityLink(link[0], link[1]));
    } else if (link.length == 3) {
      links.push(new TraceabilityLink(link[0], link[2]));
    }
  }
  return links;
}

export function parseNLTXT(content: string): NLSentence[] {
  let sentences: NLSentence[] = [];
  let lines = content.split("\n");
  let lineIndex: number = 0;
  for (let line of lines) {
    lineIndex++;
    sentences.push(new NLSentence(line, "" + lineIndex));
  }
  return sentences;
}
