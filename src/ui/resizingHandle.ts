import { Config } from "../config";

export class ResizingHandle {
    handle : HTMLElement;
    leftOfHandle : HTMLElement;
    rightOfHandle : HTMLElement | null;
    startX : number;
    isResizing : boolean;

    constructor(parent : HTMLElement, lastVisPanel : HTMLElement) {
        this.handle = document.createElement('div');
        this.handle.appendChild(document.createTextNode("<->"));
        this.handle.style.backgroundColor = Config.PREFERENCE_COLOR_ALMOST_MAIN;
        this.handle.classList.add("resizer-handle");
        parent.insertBefore(this.handle, parent.lastChild);
        this.leftOfHandle = this.handle.previousSibling! as HTMLElement;
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

    public setRightOfHandle(rightOfHandle : HTMLElement) {
        this.rightOfHandle = rightOfHandle;
    }
}