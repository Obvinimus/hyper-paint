import './main.ts'
import { mode, currentColor } from './state.ts';
import { changePixelColor } from './pixel.ts';
import type { Handle } from "./state";

export class Line {
    public x1: number;
    public y1: number;
    public x2: number;
    public y2: number;
    public color: string;

    constructor(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        color: string
    ) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.color = color;
    }
    public hitTest(px: number, py: number, threshold: number = 5): boolean {
        const x1 = this.x1;
        const y1 = this.y1;
        const x2 = this.x2;
        const y2 = this.y2;

        const lenSq = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);

        if (lenSq === 0) {
            const distSq = Math.pow(px - x1, 2) + Math.pow(py - y1, 2);
            return distSq <= Math.pow(threshold, 2);
        }

        const t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / lenSq;

        let closestX, closestY;

        if (t < 0) {
            closestX = x1;
            closestY = y1;
        } else if (t > 1) {
            closestX = x2;
            closestY = y2;
        } else {
            closestX = x1 + t * (x2 - x1);
            closestY = y1 + t * (y2 - y1);
        }

        const distSq = Math.pow(px - closestX, 2) + Math.pow(py - closestY, 2);
        return distSq <= Math.pow(threshold, 2);
    }

    public move(dx: number, dy: number) {
        this.x1 += dx;
        this.y1 += dy;
        this.x2 += dx;
        this.y2 += dy;
    }

    public getHandles(): Handle[] {
        return [
            { id: 'start', x: this.x1, y: this.y1 },
            { id: 'end', x: this.x2, y: this.y2 }
        ];
    }

    public resize(handleId: string, newX: number, newY: number) {
        if (handleId === 'start') {
            this.x1 = newX;
            this.y1 = newY;
        } else if (handleId === 'end') {
            this.x2 = newX;
            this.y2 = newY;
        }
    }
}

let lines: Line[] = [];
export let isDrawing = false;
export let startX = 0;
export let startY = 0;
export let previewLine: Line | null = null;


export function drawLineBresenham(x1: number, y1: number, x2: number, y2: number, canvas?: HTMLCanvasElement, data?: Uint8ClampedArray, color?: string) {
    let dx = Math.abs(x2 - x1);
    let dy = -Math.abs(y2 - y1); 
    let sx = (x1 < x2) ? 1 : -1;
    let sy = (y1 < y2) ? 1 : -1;

    let err = dx + dy;
    let e2; 

    while (true) {
        changePixelColor(x1, y1, canvas!.width, data!, color || currentColor);

        if (x1 === x2 && y1 === y2) {
            break;
        }

        e2 = 2 * err;

        if (e2 >= dy) { 
            if (x1 === x2) break; 
            err += dy; 
            x1 += sx;  
        }

        if (e2 <= dx) { 
            if (y1 === y2) break; 
            err += dx; 
            y1 += sy;  
        }
    }
}

export function setupLineDrawing(canvas: HTMLCanvasElement) {
    canvas.addEventListener('mousedown', (event) => {
        if (mode != 0) return;

        if (isDrawing === false) {
            startX = event.offsetX;
            startY = event.offsetY;
            isDrawing = true;
        } else {
            isDrawing = false;
            const endX = event.offsetX;
            const endY = event.offsetY;
            lines.push(new Line(startX, startY, endX, endY, currentColor));
            
            previewLine = null; 
        }
    });

    canvas.addEventListener('mousemove', (event) => {
        if (mode != 0 || isDrawing === false) {
            previewLine = null; 
            return;
        }

        const currentX = event.offsetX;
        const currentY = event.offsetY;
        
        previewLine = new Line(startX, startY, currentX, currentY, currentColor);
    });
}

export function getLines(): Line[] {
  return lines; 
}

export function clearLines(): void {
  lines = [];
}

export function setLines(newLines: Line[]) {
  lines = newLines;
}

