import './main.ts'
import { mode, currentColor } from './state.ts';
import { changePixelColor } from './pixel.ts';

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
}

let lines: Line[] = [];
export let isDrawing = false;
export let startX = 0;
export let startY = 0;
let endX = 0;
let endY = 0;

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

export function setupLineDrawing(canvas: HTMLCanvasElement, imageData: ImageData) {
    canvas.addEventListener('mousedown', (event) => {
        if (mode != 0) return;

        startX = event.offsetX;
        startY = event.offsetY;
        isDrawing = true;
    });

    canvas.addEventListener('mouseup', (event) => {
        if (mode != 0 || !isDrawing) return;

        isDrawing = false;
        const endX = event.offsetX;
        const endY = event.offsetY;

        drawLineBresenham(startX, startY, endX, endY, canvas, imageData.data);
        lines.push(new Line(startX, startY, endX, endY, currentColor));
    });
    
}

export function getLines(): Line[] {
  return lines; 
}

export function clearLines(): void {
  lines = [];
}

