import { Style, StyleableUIElement } from "../style";

/**
 * Encapsulates the logic required to resize two divs along an axis based on the user dragging a third div (the handle) along this axis
 */
abstract class AbstractResizingHandle implements StyleableUIElement {
  protected handle: HTMLElement;
  protected startValue: number;
  protected isResizing: boolean;
  protected previousDiv: HTMLElement;
  protected nextDiv: HTMLElement | null;
  protected style: Style;

  constructor(previousDiv: HTMLElement, style: Style) {
    this.handle = document.createElement("div");
    this.style = style;
    this.setStyle(style);
    this.handle.style.opacity = "0.5";
    this.handle.addEventListener("mouseover", () => {
      this.handle.style.opacity = "1";
    });
    this.handle.addEventListener("mouseleave", () => {
      this.handle.style.opacity = "0.5";
    });
    this.startValue = 0;
    this.isResizing = false;
    this.previousDiv = previousDiv;
    this.nextDiv = null;
  }

  public setPrecedingDiv(topOfHandle: HTMLElement) {
    this.previousDiv = topOfHandle;
  }

  public setNextDiv(bottomOfHandle: HTMLElement | null) {
    this.nextDiv = bottomOfHandle;
  }

  public getPrecedingDiv(): HTMLElement {
    return this.previousDiv;
  }

  public getNextDiv(): HTMLElement | null {
    return this.nextDiv;
  }

  public remove() {
    this.handle.remove();
  }

  public getHandle(): HTMLElement {
    return this.handle;
  }

  setStyle(style: Style): void {
    this.style = style;
    this.handle.style.backgroundColor = style.getHeaderColor();
    this.handle.style.border = "1px solid " + style.getBorderColor();
    this.handle.style.color = style.getSelectableTextColor();
  }
}

/**
 * A handle that resizes two divs along the x-axis
 */
export class XResizingHandle extends AbstractResizingHandle {
  constructor(lastVisPanel: HTMLElement, style: Style) {
    super(lastVisPanel, style);
    this.handle.classList.add("resizer-handle-x");
    this.previousDiv = lastVisPanel;
    this.handle.addEventListener("mousedown", (e) => {
      this.startValue = e.clientX;
      this.isResizing = true;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", () => {
        this.isResizing = false;
        document.removeEventListener("mousemove", handleMouseMove);
      });
    });
    const handleMouseMove = (e: MouseEvent) => {
      if (this.isResizing) {
        const width = e.clientX - this.startValue;
        const minWidth = window
          .getComputedStyle(this.previousDiv)
          .getPropertyValue("min-width");
        if (
          this.previousDiv.getBoundingClientRect().width <= parseInt(minWidth)
        ) {
          return;
        }
        this.previousDiv.style.width =
          this.previousDiv.getBoundingClientRect().width + width + "px";
        if (this.nextDiv != null) {
          this.nextDiv.style.width =
            this.nextDiv.getBoundingClientRect().width - width + "px";
        }
        this.startValue = e.clientX;
      }
    };
  }
}

/**
 * A handle that resizes two divs along the y-axis
 */
export class YResizingHandle extends AbstractResizingHandle {
  constructor(lastVisPanel: HTMLElement, style: Style) {
    super(lastVisPanel, style);
    this.handle.classList.add("resizer-handle-y");
    this.handle.addEventListener("mousedown", (e) => {
      this.startValue = e.clientY;
      this.isResizing = true;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", () => {
        this.isResizing = false;
        document.removeEventListener("mousemove", handleMouseMove);
      });
    });
    const handleMouseMove = (e: MouseEvent) => {
      if (this.isResizing) {
        const height = e.clientY - this.startValue;
        const minHeight = window
          .getComputedStyle(this.previousDiv)
          .getPropertyValue("min-height");
        if (
          this.previousDiv.getBoundingClientRect().height <= parseInt(minHeight)
        ) {
          return;
        }
        this.previousDiv.style.height =
          this.previousDiv.getBoundingClientRect().height + height + "px";
        if (this.nextDiv != null) {
          this.nextDiv.style.height =
            this.nextDiv.getBoundingClientRect().height - height + "px";
        }
        this.startValue = e.clientY;
      }
    };
  }
}
