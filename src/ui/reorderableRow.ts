import { Style, StyleableUIElement } from "../style";
import { XResizingHandle } from "./resizingHandle";

export interface ReorderableRowContent {
  element: HTMLElement;
  dragHandle: HTMLElement;
  handleToTheRight: XResizingHandle;
}

/**
 * This class represents a row containing a number of elements. The class also maintains handle the user can drag to along the X-axis to resize the elements.
 */
export class ReorderableRow implements StyleableUIElement {
  protected row: HTMLElement;
  protected content: ReorderableRowContent[] = [];
  protected style: Style;

  constructor(parent: HTMLElement, heightInPx: number, style: Style) {
    this.style = style;
    this.row = document.createElement("div");
    parent.appendChild(this.row);
    this.row.classList.add("uiBigRow");
    this.row.classList.add("reorderable-row");
    this.row.style.height = heightInPx + "px";
  }

  /**
   * Adds an element to the row. The element will be appended to the right of the row's last element whose handle will be adjusted to be able resize the new element and a new handle will be initialized to the right.
   * @param element The element to add
   * @param dragHandle The div indicating where the user can "grab" the element to move it
   */
  public append(element: HTMLElement, dragHandle: HTMLElement) {
    if (this.content.length > 0) {
      this.content[this.content.length - 1].handleToTheRight.setNextDiv(
        element,
      );
    }
    const handle = new XResizingHandle(element, this.style);
    this.content.push({
      element: element,
      dragHandle: dragHandle,
      handleToTheRight: handle,
    });
    this.row.appendChild(element);
    this.row.appendChild(handle.getHandle());
    dragHandle.style.cursor = "grab";
  }

  /**
   * Removes an element from the row. This method will also remove the corresponding handle and adjust the handles to the left and right of the removed element to "patch" the gap left behind.
   * @param element
   */
  public remove(element: HTMLElement) {
    const index = this.content.findIndex(
      (content) => content.element == element,
    );
    const popped = this.content.splice(index, 1)[0];
    if (index > 0) {
      this.content[index - 1].handleToTheRight.setNextDiv(
        index < this.content.length ? this.content[index].element : null,
      );
    }
    popped.element.remove();
    popped.handleToTheRight.remove();
    const leftContent = index > 0 ? this.content[index - 1] : null;
    const rightContent =
      index < this.content.length ? this.content[index] : null;
    if (leftContent != null && rightContent != null) {
      leftContent.handleToTheRight.setNextDiv(rightContent.element);
      rightContent.handleToTheRight.setPrecedingDiv(leftContent.element);
    }
  }

  /**
   * Gets the HTML element that row object inserts elements into.
   * @returns  The row's HTML element
   */
  public getRow(): HTMLElement {
    return this.row;
  }

  /**
   * Gets the number of elements in the row. Does not include handles.
   * @returns The number of elements in the row
   */
  public getNumberOfElements(): number {
    return this.content.length;
  }

  /**
   * Returns a {@link ReorderableRowContent} object representing the element whose drag handle the mouse is currently over. If the mouse is not over any drag handle, null is returned.
   * @param x The viewport x-coordinate of the mouse
   * @param y The viewport y-coordinate of the mouse
   * @returns The {@link ReorderableRowContent} object that can be dragged from the position of the mouse or null if the mouse is not over any drag handle
   */
  public getContentByMousePosition(
    x: number,
    y: number,
  ): ReorderableRowContent | null {
    for (let elementAndDragHandle of this.content) {
      const boundingRectangle =
        elementAndDragHandle.dragHandle.getBoundingClientRect();
      if (
        boundingRectangle.left <= x &&
        boundingRectangle.right >= x &&
        boundingRectangle.top <= y &&
        boundingRectangle.bottom >= y
      ) {
        return elementAndDragHandle;
      }
    }
    return null;
  }

  public setStyle(style: Style): void {
    this.style = style;
    for (let contentTuple of this.content) {
      contentTuple.handleToTheRight.setStyle(style);
    }
  }
}
