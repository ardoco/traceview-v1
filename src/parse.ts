
import {TraceabilityLink,NLSentence} from "./classes";
import { UMLComponent,UMLInterface,UMLInterfaceRealization,UMLOperation, UMLBase, UMLUsage } from "./uml";


export function parseTraceLinksFromCSV(content : string) : TraceabilityLink[] {
    let links : TraceabilityLink[] = [];
    let lines = content.split('\n');
    lines.shift();
    for (let line of lines) {
        let link = line.split(',');
        if (link.length == 2) {
            links.push(new TraceabilityLink(link[0], link[1]));
        } else if (link.length == 3) {
            links.push(new TraceabilityLink(link[0], link[2]));
        }
    }
    return links;
}

export function parseNLTXT(content :string) : NLSentence[] {
    let sentences : NLSentence[] = [];
    let lines = content.split('\n');
    let lineIndex : number = 0;
    for (let line of lines) {
        lineIndex++;
        sentences.push(new NLSentence(line, "" + lineIndex));
    }
    return sentences;
}

class Token {
    type : string;
    value : string;
    constructor(type : string, value : string) {
        this.type = type;
        this.value = value;
    }
}

function lex(content : string) : Token[] {
    let tokens : Token[] = [];
    let elements : string[] = content.split(" ").filter((s) => s.length > 0)
    for (let element of elements) {
        if (element.startsWith('<')) {
            if (element.startsWith('</')) {
                tokens.push(new Token('CLOSE', element));
            } else {
                tokens.push(new Token('OPEN', element));
            }
        } else { 
            if (element.indexOf('=') > 0) {
                tokens.push(new Token('ATTRIBUTE', element.replace("/>", "").replace(">", "")));
            }
        }
    }
    return tokens;
}

function parseLeaf(tokens : Token[], index : number) : [number, Map<string,string>] {
    let attributes : Map<string,string> = new Map<string,string>();
    while(tokens[index].type != "OPEN" && tokens[index].type != "CLOSE") {
        if (tokens[index].value.indexOf("=") > 0) {
            let key = tokens[index].value.split("=")[0];
            let value = tokens[index].value.split("=")[1].replace(">", "");
            attributes.set(key, value[0] == '"' && value[value.length-1] == '"' ? value.substring(1,value.length-1) : value);
        }
        index++;
    }
    return [index,attributes];
}

function parseOwnedOperation(tokens : Token[], index : number) : [number,UMLOperation] {
    let content = parseLeaf(tokens, index);
    let attributes = content[1];
    index = content[0];
    if (attributes.size > 2) {
        throw new Error("Unexpected number of attributes for operation: " + attributes.size);
    }
    let identifier = attributes.get('xmi:id');
    let name = attributes.get('name');
    if (identifier) {
        if (name) {
            return [index,new UMLOperation(identifier, name)];
        }
        throw new Error("Missing name attribute for operation");
    } else {
        throw new Error("Missing xmi:id attribute for operation");
    }
}

function parseInterfaceRealization(tokens : Token[], index : number) : [number,UMLInterfaceRealization] {
    let content = parseLeaf(tokens, index);
    let attributes = content[1];
    index = content[0];
    if (attributes.size > 4) {
        throw new Error("Unexpected number of attributes for interface realization: " + attributes.size);
    }
    let identifier = attributes.get('xmi:id');
    let sourceId = attributes.get('client');
    let targetId = attributes.get('supplier');
    let name = attributes.get('contract');
    if (identifier && sourceId && targetId && name) {
        return [index,new UMLInterfaceRealization(identifier, sourceId, targetId, name)];
    }
    throw new Error("Missing at least one of xmi:id, client, supplier or contract attribute for interface realization");
}

function parseUsage(tokens : Token[], index : number) : [number,UMLUsage] {
    let content = parseLeaf(tokens, index);
    let attributes = content[1];
    index = content[0];
    if (attributes.size > 4) {
        throw new Error("Unexpected number of attributes for usage: " + attributes.size);
    }
    let identifier = attributes.get('xmi:id');
    let sourceId = attributes.get('client');
    let targetId = attributes.get('supplier');
    if (identifier && sourceId && targetId) {
        return [index,new UMLUsage(identifier, sourceId, targetId)];
    }
    throw new Error("Missing at least one of xmi:id, client or supplier attribute for usage");
}

export function parseUML(content : string) : UMLBase[] {
    let contentWithoutFirstAndlastLine = content.substring(content.indexOf("<p"), content.lastIndexOf("</"));
    let cleanContent = contentWithoutFirstAndlastLine.replace(/\n/g, ' ');
    let tokens : Token[] = lex(cleanContent);
    let umlObjects : UMLBase[] = [];
    let i = 0;
    while(i  < tokens.length) {
        if (tokens[i].type == 'OPEN' && tokens[i].value.startsWith("<packagedElement")) {
            let attributes : Map<string,string> = new Map<string,string>();
            let interfaceRealizations : UMLInterfaceRealization[] = [];
            let operations : UMLOperation[] = [];
            let usages : UMLUsage[] = [];
            i++;
            while(tokens[i].type != "OPEN") {
                let key = tokens[i].value.split("=")[0];
                let value = tokens[i].value.split("=")[1];
                attributes.set(key,value.substring(1,value.length-1));
                i++;
            }
            while(tokens[i].type != "CLOSE") {
                if (tokens[i].type == 'OPEN' && tokens[i].value.startsWith("<ownedOperation")) {
                    i++;
                    let newIndexAndResult = parseOwnedOperation(tokens, i);
                    i = newIndexAndResult[0];
                    operations.push(newIndexAndResult[1]);
                } else if (tokens[i].type == 'OPEN' && tokens[i].value.startsWith("<interfaceRealization")) {
                    i++;
                    let newIndexAndResult = parseInterfaceRealization(tokens, i);
                    i = newIndexAndResult[0];
                    interfaceRealizations.push(newIndexAndResult[1]);
                } else if (tokens[i].type == 'OPEN' && tokens[i].value.startsWith("<packagedElement")) {
                    i++;
                    let newIndexAndResult = parseUsage(tokens, i);
                    i = newIndexAndResult[0];
                    usages.push(newIndexAndResult[1]);
                }
                else {
                    throw new Error("Unexpected token: " + tokens[i].type + " (" + tokens[i].value + ") at index " + i);
                }
            }
            let type = attributes.get('xmi:type');
            let identifier = attributes.get('xmi:id');
            let name = attributes.get('name');
            if (identifier && name) {
                if (type == "uml:Interface") {
                    umlObjects.push(new UMLInterface(identifier, name, operations));
                } else if (type == "uml:Component") {
                    umlObjects.push(new UMLComponent(identifier, name, interfaceRealizations, usages));
                } else {
                    throw new Error("Unexpected type: " + type);
                }
            }
            i++;
        } else {
            throw new Error("Unexpected tl token: " + tokens[i].type + " (" + tokens[i].value + ") at index " + i);
        }
    }
    return umlObjects;
}