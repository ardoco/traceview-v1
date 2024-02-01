import { Config } from "../config";
import { Style } from "../style";

export class ResizingHandle {
    handle : HTMLElement;
    leftOfHandle : HTMLElement;
    rightOfHandle : HTMLElement | null;
    startX : number;
    isResizing : boolean;

    constructor(parent : HTMLElement, lastVisPanel : HTMLElement, style : Style) {
        this.handle = document.createElement('div');
        this.handle.appendChild(document.createTextNode("<->"));
        this.handle.style.backgroundColor = style.getHeaderColor();
        this.handle.style.border = "1px solid " + style.getBorderColor();
        this.handle.style.color = style.getSelectableTextColor();
        this.handle.classList.add("resizer-handle");
        this.handle.style.height = "90%";
        this.handle.style.width = "2%";
        this.handle.style.marginLeft = "0.25%";
        this.handle.style.marginRight = "0.25%";
        parent.insertBefore(this.handle, parent.lastChild);
        this.leftOfHandle = lastVisPanel;
        this.rightOfHandle = null;
        this.isResizing = false;
        this.startX = 0;
        this.handle.addEventListener('mousedown', (e) => {
            this.startX = e.clientX;
            this.isResizing = true;
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', () => {
                this.isResizing = false;
                document.removeEventListener('mousemove', handleMouseMove);
            });
        });
        const handleMouseMove = (e: MouseEvent) => {
            if (this.isResizing) {
                const width = e.clientX - this.startX;
                const minWidth = window.getComputedStyle(this.leftOfHandle).getPropertyValue('min-width');
                if (this.leftOfHandle.getBoundingClientRect().width <= parseInt(minWidth)) {
                    return;
                }
                this.leftOfHandle.style.width = this.leftOfHandle.getBoundingClientRect().width + width + "px";
                if (this.rightOfHandle != null) {
                    this.rightOfHandle.style.width = this.rightOfHandle.getBoundingClientRect().width - width + "px";
                }
                this.startX = e.clientX;
            }
        };
    }

    public setLeftOfHandle(leftOfHandle : HTMLElement) {
        this.leftOfHandle = leftOfHandle;
    }

    public setRightOfHandle(rightOfHandle : HTMLElement | null) {
        this.rightOfHandle = rightOfHandle;
    }

    public getLeftOfHandle() : HTMLElement {
        return this.leftOfHandle;
    }

    public getRightOfHandle() : HTMLElement | null {
        return this.rightOfHandle;
    }

    remove() {
        this.handle.remove();
    }
}

export class YResizingHandle {
    handle : HTMLElement;
    topOfHandle : HTMLElement;
    bottomOfHandle : HTMLElement | null;
    startY : number;
    isResizing : boolean;

    constructor(parent : HTMLElement, lastVisPanel : HTMLElement, style : Style) {
        this.handle = document.createElement('div');
        this.handle.appendChild(document.createTextNode("↕"));
        style.applyToPanel(this.handle);
        this.handle.style.backgroundColor = style.getHeaderColor();
        this.handle.style.border = "1px solid " + style.getBorderColor();
        this.handle.style.color = style.getSelectableTextColor();
        this.handle.classList.add("resizer-handle");
        this.handle.style.height = "3%";
        this.handle.style.width = "90%";
        this.handle.style.marginLeft = "5%";
        this.handle.style.marginRight = "5%";
        this.handle.style.marginBottom = "0.5%";
        this.handle.style.cursor = "ns-resize";
        parent.insertBefore(this.handle, parent.lastChild);
        this.topOfHandle = lastVisPanel;
        this.bottomOfHandle = null;
        this.isResizing = false;
        this.startY = 0;
        this.handle.addEventListener('mousedown', (e) => {
            this.startY = e.clientY;
            this.isResizing = true;
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', () => {
                this.isResizing = false;
                document.removeEventListener('mousemove', handleMouseMove);
            });
        });
        const handleMouseMove = (e: MouseEvent) => {
            if (this.isResizing) {
                const height = e.clientY - this.startY;
                const minHeight = window.getComputedStyle(this.topOfHandle).getPropertyValue('min-height');
                if (this.topOfHandle.getBoundingClientRect().height <= parseInt(minHeight)) {
                    return;
                }
                this.topOfHandle.style.height = this.topOfHandle.getBoundingClientRect().height + height + "px";
                if (this.bottomOfHandle != null) {
                    this.bottomOfHandle.style.height = this.bottomOfHandle.getBoundingClientRect().height - height + "px";
                }
                this.startY = e.clientY;
            }
        };
    }

    public setTopOfHandle(topOfHandle : HTMLElement) {
        this.topOfHandle = topOfHandle;
    }

    public setBottomOfHandle(bottomOfHandle : HTMLElement | null) {
        this.bottomOfHandle = bottomOfHandle;
    }

    public getTopOfHandle() : HTMLElement {
        return this.topOfHandle;
    }

    public getBottomOfHandle() : HTMLElement | null {
        return this.bottomOfHandle;
    }

    remove() {
        this.handle.remove();
    }
}