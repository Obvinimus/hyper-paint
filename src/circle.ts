import './state.ts';
import { mode, currentColor } from "./state";

let startX: number;
let startY: number;
let isDrawing: boolean = false;
let circles: Circle[] = [];

class Circle {
    centerX: number;
    centerY: number;
    radius: number;
    color: string;

    constructor(cx: number, cy: number, r: number, color: string) {
        this.centerX = cx;
        this.centerY = cy;
        this.radius = r;
        this.color = color;
    }
}


function setPixel(x: number, y: number, color: string, width: number, data: Uint8ClampedArray) {
    x = Math.round(x);
    y = Math.round(y);

    const height = data.length / (width * 4);
    if (x < 0 || x >= width || y < 0 || y >= height) {
        return;
    }

    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    const index = (y * width + x) * 4;

    data[index] = r;
    data[index + 1] = g;
    data[index + 2] = b;
    data[index + 3] = 255; 
}


function drawCircleMidpoint(centerX: number, centerY: number, radius: number, canvas: HTMLCanvasElement, data: Uint8ClampedArray, color: string) {
    let r = Math.round(radius);
    let x = r;
    let y = 0;
    let P = 1 - r; 

    const plotCirclePoints = (cx: number, cy: number, x_rel: number, y_rel: number) => {
        const w = canvas.width; 
        setPixel(cx + x_rel, cy + y_rel, color, w, data);
        setPixel(cx - x_rel, cy + y_rel, color, w, data);
        setPixel(cx + x_rel, cy - y_rel, color, w, data);
        setPixel(cx - x_rel, cy - y_rel, color, w, data);
        setPixel(cx + y_rel, cy + x_rel, color, w, data);
        setPixel(cx - y_rel, cy + x_rel, color, w, data);
        setPixel(cx + y_rel, cy - x_rel, color, w, data);
        setPixel(cx - y_rel, cy - x_rel, color, w, data);
    };

    while (x >= y) {
        plotCirclePoints(Math.round(centerX), Math.round(centerY), x, y);
        
        y++;
        if (P <= 0) {
            P = P + 2 * y + 1;
        } else {
            x--;
            P = P + 2 * y - 2 * x + 1;
        }
    }
}

export function setupCircleDrawing(canvas: HTMLCanvasElement, imageData: ImageData) {
    canvas.addEventListener('mousedown', (event) => {
        if (mode != 2) return; 

        if (isDrawing === false) {
            startX = event.offsetX;
            startY = event.offsetY;
            isDrawing = true;
        } else {
            isDrawing = false;
            const endX = event.offsetX;
            const endY = event.offsetY;

            const dx = endX - startX;
            const dy = endY - startY;
            const radius = Math.sqrt(dx * dx + dy * dy);
            
            drawCircleMidpoint(startX, startY, radius, canvas, imageData.data, currentColor);
            
            circles.push(new Circle(startX, startY, radius, currentColor));
        }
    });
}

export function getCircles(): Circle[] {
    return circles;
}