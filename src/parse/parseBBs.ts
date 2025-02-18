import { text } from "d3";
import { AABB, ArtefactAABB, TextedAABB } from "../artifacts/aabb";

/**
 * Parses a list of axis-aligned boxes from a JSON string
 * @param content The JSON string
 * @returns A list of axis-aligned bounding boxes
 */
export function parseAABBs(content: string): ArtefactAABB[] {
  const json = JSON.parse(content);
  if (json.diagrams.length != 1) {
    throw new Error(
      "Expected exactly one diagram, found " + json.diagrams.length,
    );
  }
  const mainBoxes = [];
  for (let box of json.diagrams[0].boxes) {
    const mainBox = new AABB(
      box.boundingBox.x,
      box.boundingBox.y,
      box.boundingBox.w,
      box.boundingBox.h,
    );
    const textBoxes = [];
    for (let textBox of box.textBoxes) {
      textBoxes.push(
        new TextedAABB(
          textBox.boundingBox.x,
          textBox.boundingBox.y,
          textBox.boundingBox.w,
          textBox.boundingBox.h,
          textBox.text,
        ),
      );
    }
    mainBoxes.push(new ArtefactAABB(mainBox, textBoxes[0]));
  }
  return mainBoxes;
}
