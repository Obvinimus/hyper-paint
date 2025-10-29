import { mode, currentColor } from "./state";
import { drawLineBresenham } from "./line";
import type { Handle } from "./state";

let startX: number;
let startY: number;
let isDrawing: boolean = false;
let rectangles: Rectangle[] = [];



export class Rectangle {
    public x1: number;
    public y1: number;
    public x2: number;
    public y2: number;
    public color: string;
    public readonly type = 'rectangle'; 

    constructor(x1: number, y1: number, x2: number, y2: number, color: string) {

        this.x1 = Math.min(x1, x2);
        this.y1 = Math.min(y1, y2);
        this.x2 = Math.max(x1, x2);
        this.y2 = Math.max(y1, y2);
        this.color = color;
    }


    public hitTest(px: number, py: number, threshold: number = 5): boolean {
        const { x1, y1, x2, y2 } = this;
        
        const checkSegment = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
            const lenSq = Math.pow(bx - ax, 2) + Math.pow(by - ay, 2);
            if (lenSq === 0) {
                return Math.pow(px - ax, 2) + Math.pow(py - ay, 2) <= Math.pow(threshold, 2);
            }
            const t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / lenSq;
            const t_clamped = Math.max(0, Math.min(1, t));
            const closestX = ax + t_clamped * (bx - ax);
            const closestY = ay + t_clamped * (by - ay);
            return Math.pow(px - closestX, 2) + Math.pow(py - closestY, 2) <= Math.pow(threshold, 2);
        };

        if (checkSegment(px, py, x1, y1, x2, y1)) return true; // Góra
        if (checkSegment(px, py, x1, y2, x2, y2)) return true; // Dół
        if (checkSegment(px, py, x1, y1, x1, y2)) return true; // Lewa
        if (checkSegment(px, py, x2, y1, x2, y2)) return true; // Prawa
        return false;
    }

    public move(dx: number, dy: number) {
        this.x1 += dx;
        this.y1 += dy;
        this.x2 += dx;
        this.y2 += dy;
    }


    public getHandles(): Handle[] {
        return [
            { id: 'top-left', x: this.x1, y: this.y1 },
            { id: 'top-right', x: this.x2, y: this.y1 },
            { id: 'bottom-left', x: this.x1, y: this.y2 },
            { id: 'bottom-right', x: this.x2, y: this.y2 }
        ];
    }

    
    public resize(handleId: string, newX: number, newY: number) {
        switch (handleId) {
            case 'top-left':
                this.x1 = newX;
                this.y1 = newY;
                break;
            case 'top-right':
                this.x2 = newX;
                this.y1 = newY;
                break;
            case 'bottom-left':
                this.x1 = newX;
                this.y2 = newY;
                break;
            case 'bottom-right':
                this.x2 = newX;
                this.y2 = newY;
                break;
        }
        this.normalize();
    }

    private normalize() {
        const x1 = Math.min(this.x1, this.x2);
        const y1 = Math.min(this.y1, this.y2);
        const x2 = Math.max(this.x1, this.x2);
        const y2 = Math.max(this.y1, this.y2);
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
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
            
            const newRect = new Rectangle(startX, startY, endX, endY, currentColor);
            rectangles.push(newRect);

            const { x1, y1, x2, y2, color } = newRect;
            drawLineBresenham(x1, y1, x1, y2, canvas, imageData.data, color);
            drawLineBresenham(x2, y1, x2, y2, canvas, imageData.data, color);
            drawLineBresenham(x1, y1, x2, y1, canvas, imageData.data, color);
            drawLineBresenham(x1, y2, x2, y2, canvas, imageData.data, color);
        }
    });
}

export function getRectangles(): Rectangle[] {
    return rectangles;
}