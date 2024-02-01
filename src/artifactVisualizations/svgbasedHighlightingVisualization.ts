import * as d3 from 'd3';
import { HighlightingVisualization } from "./highlightingVisualization";
import { Config } from '../config';
import { UIButton } from '../abstractUI';
import { Style } from '../style';



    export abstract class SVGBasedHighlightingVisualization extends HighlightingVisualization {

        private readonly zoomMinFactor = 0.1;
        private readonly zoomMaxFactor = 10;

        protected plot: d3.Selection<SVGSVGElement, unknown, null, undefined>;
        protected svgWidth: number;
        protected svgHeight: number;
        private zoomFactor: number = 1;
        private isDragging: boolean = false;
        private dragStart : {x : number, y : number} = {x : 0, y : 0};
        private translation : {x : number, y : number} = {x : 0, y : 0};
    
        constructor(viewport: HTMLElement, width : number, height : number, highlightableIds: string[], title: string, style : Style) {
            super(highlightableIds, title, style);
            this.svgWidth = width;
            this.svgHeight = height;
            viewport.style.overflow = "hidden";
            viewport.style.backgroundColor = this.style.getPaperColor();
            this.plot = d3.select(viewport).append("svg")
                .attr("width", this.svgWidth)
                .attr("height", this.svgHeight);
            viewport.addEventListener("wheel", (event) => {
                event.preventDefault();
                this.zoomFactor = Math.max(this.zoomMinFactor, Math.min(this.zoomMaxFactor, this.zoomFactor * (1 + -event.deltaY / 1000)));
                this.plot.attr("transform", "translate(" + this.translation.x + "," + this.translation.y + ") scale(" + this.zoomFactor + ")");
            });
            viewport.addEventListener("mousedown", (event) => {
                this.isDragging = true;
                this.dragStart = {x : event.clientX, y : event.clientY};
            });
            viewport.addEventListener("mouseup", (event) => {
                this.isDragging = false;
            });
            viewport.addEventListener("mousemove", (event) => {
                if (this.isDragging) {
                    const dx = event.clientX - this.dragStart.x;
                    const dy = event.clientY - this.dragStart.y;
                    this.dragStart = {x : event.clientX, y : event.clientY};
                    this.translation.x += dx;
                    this.translation.y += dy;
                    this.plot.attr("transform", "translate(" + this.translation.x + "," + this.translation.y + ") scale(" + this.zoomFactor + ")");
                }
            });
        }

        protected setZoomFactor(zoomFactor : number) {
            this.zoomFactor = zoomFactor;
            this.plot.attr("transform", "translate(" + this.translation.x + "," + this.translation.y + ") scale(" + this.zoomFactor + ")");
        }

        protected setTranslation(translation : {x : number, y : number}) {
            this.translation = translation;
            this.plot.attr("transform", "translate(" + this.translation.x + "," + this.translation.y + ") scale(" + this.zoomFactor + ")");
        }

        protected resetZoomAndPan() {
            this.zoomFactor = 1;
            this.translation = {x : 0, y : 0};
            this.plot.attr("transform", "translate(" + this.translation.x + "," + this.translation.y + ") scale(" + this.zoomFactor + ")");
        }

        getButtons(): UIButton[] {
            const superButtons = super.getButtons();
            return [new UIButton(UIButton.SYMBOL_REFRESH, "Reset Zoom And Pan",() => {this.resetZoomAndPan();return true;})].concat(super.getButtons());
        }
    }