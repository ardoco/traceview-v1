import { Style, StyleableUIElement } from "../style";
import { ReorderableRow, ReorderableRowContent } from "./reorderableRow";
import { YResizingHandle } from "./resizingHandle";

/**
 * This class represents a grid of reorderable rows. Elements can be resized by dragging handles added to the grid for the purpose and can be moved between rows by dragging and dropping them.
 */
export class ReorderableGrid implements StyleableUIElement {
  protected rows: ReorderableRow[] = [];
  protected handles: YResizingHandle[] = [];
  protected style: Style;
  protected viewport: HTMLElement;
  private addRowListenerIsSet: boolean = false;
  private dragStartRow: ReorderableRow | null = null;
  private dragStartContent: ReorderableRowContent | null = null;
  private dragIndicator: HTMLElement | null = null;
  protected indicatorFollowMouse = (event: MouseEvent) => {
    if (this.dragIndicator != null) {
      this.dragIndicator.style.left = event.clientX + "px";
      this.dragIndicator.style.top = event.clientY + "px";
    }
  };

  /**
   * Instantiates a new ReorderableGrid with the given viewport and style.
   * @param viewport The viewport, i.e. the element that will contain the grid
   * @param style A Style object that will be used to style the grid
   */
  constructor(viewport: HTMLElement, style: Style) {
    this.viewport = viewport;
    this.viewport.style.paddingBottom = "20px";
    this.style = style;
    this.setStyle(style);
    this.addRow(0.9);
    this.viewport.addEventListener("mouseup", (event) => {
      if (
        this.dragIndicator == null ||
        this.dragStartContent == null ||
        this.dragStartRow == null
      ) {
        return;
      }
      let dragEndRow: ReorderableRow | null = null;
      for (let row of this.rows) {
        const rect = row.getRow().getBoundingClientRect();
        if (
          this.dragIndicator != null &&
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        ) {
          dragEndRow = row;
          if (
            this.dragStartRow != dragEndRow &&
            this.dragStartContent != null
          ) {
            this.dragStartRow.remove(this.dragStartContent.element);
            if (this.dragStartRow.getRow().children.length == 0) {
              this.removeRow(this.rows.indexOf(this.dragStartRow));
            }
            dragEndRow.append(
              this.dragStartContent.element,
              this.dragStartContent.dragHandle,
            );
          }
          this.dragIndicator!.remove();
          this.dragIndicator = null;
          return;
        }
      }
      if (dragEndRow == null) {
        this.addRow(0.9);
        for (let row of this.rows) {
          row.getRow().style.height =
            (0.9 * this.viewport.getBoundingClientRect().height) /
              this.rows.length +
            "px";
        }
        dragEndRow = this.rows[this.rows.length - 1];
      }
      this.dragStartRow.remove(this.dragStartContent.element);
      dragEndRow.append(
        this.dragStartContent.element,
        this.dragStartContent.dragHandle,
      );
      if (this.dragStartRow.getRow().children.length == 0) {
        console.log("removing");
      }
      console.log(this.dragStartRow.getRow().children.length);
      this.dragIndicator!.remove();
      this.dragIndicator = null;
      document.removeEventListener("mousemove", this.indicatorFollowMouse);
    });
  }

  /**
   * Removes an element from the grid.
   * @param element The element to remove.
   */
  public remove(element: HTMLElement) {
    for (let row of this.rows) {
      for (let child of row.getRow().children) {
        if (child == element) {
          row.remove(element);
          break;
        }
      }
    }
  }

  /**
   * Appends an element to the grid. The element will be placed in the first row.
   */
  public append(element: HTMLElement, dragHandle: HTMLElement) {
    this.rows[0].append(element, dragHandle);
  }

  private addRow(rowHeightFraction: number) {
    if (this.rows.length > 0) {
      this.handles.push(
        new YResizingHandle(
          this.rows[this.rows.length - 1].getRow(),
          this.style,
        ),
      );
      this.viewport.appendChild(
        this.handles[this.handles.length - 1].getHandle(),
      );
      const newRow = new ReorderableRow(
        this.viewport,
        this.viewport.getBoundingClientRect().height * rowHeightFraction,
        this.style,
      );
      this.handles[this.handles.length - 1].setNextDiv(newRow.getRow());
      this.rows.push(newRow);
    } else {
      const newRow = new ReorderableRow(
        this.viewport,
        this.viewport.getBoundingClientRect().height * rowHeightFraction,
        this.style,
      );
      this.rows.push(newRow);
    }
    this.setupDragAndDropForRow(this.rows[this.rows.length - 1]);
  }

  private setupDragAndDropForRow(row: ReorderableRow) {
    const indicatorFollowMouse = (event: MouseEvent) => {
      if (this.dragIndicator != null) {
        this.dragIndicator.style.left = event.clientX + "px";
        this.dragIndicator.style.top = event.clientY + "px";
      }
    };
    row.getRow().addEventListener("mousedown", (event) => {
      this.dragStartContent = row.getContentByMousePosition(
        event.clientX,
        event.clientY,
      );
      if (this.dragStartContent != null) {
        this.dragStartRow = row;
        this.dragIndicator = document.createElement("div");
        this.dragIndicator.classList.add("reorderable-row-drag-indicator");
        this.dragIndicator.style.left = event.clientX + "px";
        this.dragIndicator.style.top = event.clientY + "px";
        this.dragIndicator.style.transform = "translate(-50%, -50%)";
        this.dragIndicator.textContent = "✥";
        this.dragIndicator.style.cursor = "grabbing";
        this.viewport.appendChild(this.dragIndicator);
        document.addEventListener("mousemove", indicatorFollowMouse);
      }
    });
    if (!this.addRowListenerIsSet) {
      document.addEventListener("mouseup", (event) => {
        if (this.dragIndicator != null) {
          this.dragIndicator!.remove();
          this.dragIndicator = null;
        }
        document.removeEventListener("mousemove", indicatorFollowMouse);
      });
    }
  }

  private removeRow(index: number, height: number = 0) {
    if (this.rows.length == 1) {
      return;
    }
    if (index != 0 && this.rows.length > 2) {
      this.handles[index - 1].setNextDiv(this.handles[index].getNextDiv());
    }
    this.rows[index].getRow().remove();
    const removedRow = this.rows.splice(index, 1)[0];
    this.rows[0].getRow().style.height =
      this.rows[0].getRow().getBoundingClientRect().height + height + "px";
    this.handles[index - 1].getHandle().remove();
    this.handles.splice(index - 1, 1);
    for (let row of this.rows) {
      row.getRow().style.height =
        (0.95 * this.viewport.getBoundingClientRect().height) /
          this.rows.length +
        "px";
    }
  }

  public setStyle(style: Style): void {
    this.style = style;
    for (let row of this.rows) {
      row.setStyle(style);
    }
    for (let handle of this.handles) {
      handle.setStyle(style);
    }
  }
}
