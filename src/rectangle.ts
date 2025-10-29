import { Line } from "./line";
import { mode, currentColor } from "./state";
import { drawLineBresenham } from "./line";

let startX: number;
let startY: number;
let isDrawing: boolean = false;
let rectangles: Rectangle[] = [];

class Rectangle {
    left: Line;
    right: Line
    top: Line;
    bottom: Line;

    constructor(line1: Line, line2: Line, line3: Line, line4: Line) {
        this.left = line1;
        this.right = line2;
        this.top = line3;
        this.bottom = line4;
    }
    public hitTest(px: number, py: number, threshold: number = 5): boolean {
        return (
            this.left.hitTest(px, py, threshold) ||
            this.right.hitTest(px, py, threshold) ||
            this.top.hitTest(px, py, threshold) ||
            this.bottom.hitTest(px, py, threshold)
        );
    }

    public move(dx: number, dy: number) {
        this.left.move(dx, dy);
        this.right.move(dx, dy);
        this.top.move(dx, dy);
        this.bottom.move(dx, dy);
    }
}

export function setupRectangleDrawing(canvas: HTMLCanvasElement, imageData: ImageData) {
    canvas.addEventListener('mousedown', (event) => {
        if (mode != 1) return;

        if (isDrawing === false) {
            startX = event.offsetX;
            startY = event.offsetY;
            isDrawing = true;
        } else {
            isDrawing = false;
            const endX = event.offsetX;
            const endY = event.offsetY;
            const line1 = new Line(startX, startY, startX, endY, currentColor);
            const line2 = new Line(endX, startY, endX, endY, currentColor);
            const line3 = new Line(startX, startY, endX, startY, currentColor);
            const line4 = new Line(startX, endY, endX, endY, currentColor);
            drawLineBresenham(line1.x1, line1.y1, line1.x2, line1.y2, canvas, imageData.data, line1.color);
            drawLineBresenham(line2.x1, line2.y1, line2.x2, line2.y2, canvas, imageData.data, line2.color);
            drawLineBresenham(line3.x1, line3.y1, line3.x2, line3.y2, canvas, imageData.data, line3.color);
            drawLineBresenham(line4.x1, line4.y1, line4.x2, line4.y2, canvas, imageData.data, line4.color);
            rectangles.push(new Rectangle(line1,line2,line3,line4));
        }
    });
}

export function getRectangles(): Rectangle[] {
    return rectangles;
}