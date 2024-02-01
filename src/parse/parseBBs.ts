import { text } from "d3";
import { AABB, ArtefactAABB, TextedAABB } from "../artifacts/aabb";

export function parseAABBs(content : string) : ArtefactAABB[] {
    const json = JSON.parse(content);
    if (json.diagrams.length != 1) {
        throw new Error("Expected exactly one diagram, found " + json.diagrams.length);
    }
    const mainBoxes = [];
    for (let box of json.diagrams[0].boxes) {
        const mainBox = new AABB(box.boundingBox.x, box.boundingBox.y, box.boundingBox.width, box.boundingBox.height);
        const textBoxes = [];
        for (let textBox of box.textBoxes) {
            textBoxes.push(new TextedAABB(textBox.boundingBox.x, textBox.boundingBox.y, textBox.boundingBox.width, textBox.boundingBox.height, textBox.text));
        }
        mainBoxes.push(new ArtefactAABB(mainBox, textBoxes[0]));
    }
    return mainBoxes;
}