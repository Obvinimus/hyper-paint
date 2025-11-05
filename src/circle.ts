import './state.ts';
import { mode, currentColor } from "./state";
import type { Handle } from "./state";
import { screenToWorld } from './coords.ts'; 

let startX: number;
let startY: number;
let isDrawing: boolean = false;
let circles: Circle[] = [];

export class Circle {
    public readonly type = 'circle';
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
    public hitTest(px: number, py: number, threshold: number = 5): boolean {
        const dx = px - this.centerX;
        const dy = py - this.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const distanceFromEdge = Math.abs(distance - this.radius);

        return distanceFromEdge <= threshold;
    }

    public move(dx: number, dy: number) {
        this.centerX += dx;
        this.centerY += dy;
    }

    public getHandles(): Handle[] {
        return [
            { id: 'radius', x: this.centerX + this.radius, y: this.centerY }
        ];
    }

    public resize(handleId: string, newX: number, newY: number) {
        if (handleId === 'radius') {
            const dx = newX - this.centerX;
            const dy = newY - this.centerY;
            this.radius = Math.sqrt(dx * dx + dy * dy);
        }
    }
}

function setPixel(x: number, y: number, color: string, width: number, data: Uint8ClampedArray) {
    x = Math.round(x);
    y = Math.round(y);

    if (x < 0 || x >= width || y < 0) {
        return;
    }
    
    const index = (y * width + x) * 4;

    if (index + 3 >= data.length) return; 

    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    data[index] = r;
    data[index + 1] = g;
    data[index + 2] = b;
    data[index + 3] = 255; 
}


export function drawCircleMidpoint(centerX: number, centerY: number, radius: number, bufferWidth: number, data: Uint8ClampedArray, color: string) {
    let r = Math.round(radius);
    let x = r;
    let y = 0;
    let P = 1 - r; 

    const plotCirclePoints = (cx: number, cy: number, x_rel: number, y_rel: number) => {
        const w = bufferWidth; 
        setPixel(cx + x_rel, cy + y_rel, color, w, data);
        setPixel(cx - x_rel, cy + y_rel, color, w, data);
        setPixel(cx + x_rel, cy - y_rel, color, w, data);
        setPixel(cx - x_rel, cy - y_rel, color, w, data);
        setPixel(cx + y_rel, cy + x_rel, color, w, data);
        setPixel(cx - y_rel, cy + x_rel, color, w, data);
        setPixel(cx + y_rel, cy - x_rel, color, w, data);
        setPixel(cx - y_rel, cy - x_rel, color, w, data);
    };

    plotCirclePoints(Math.round(centerX), Math.round(centerY), x, y);

    while (x > y) {
        y++;
        if (P <= 0) {
            P = P + 2 * y + 1;
        } else {
            x--;
            P = P + 2 * y - 2 * x + 1;
        }
        
        if (x < y) break;
        
        plotCirclePoints(Math.round(centerX), Math.round(centerY), x, y);
    }
}

export let previewCircle: Circle | null = null;

export function setupCircleDrawing(canvas: HTMLCanvasElement) {
    canvas.addEventListener('mousedown', (event) => {
        if (mode != 2 || event.button !== 0) return; 

        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const [worldX, worldY] = screenToWorld(screenX, screenY);

        if (isDrawing === false) {
            startX = worldX;
            startY = worldY;
            isDrawing = true;
        } else {
            isDrawing = false;
            const endX = worldX;
            const endY = worldY;

            const dx = endX - startX;
            const dy = endY - startY;
            const radius = Math.sqrt(dx * dx + dy * dy);
            
            circles.push(new Circle(startX, startY, radius, currentColor));

            previewCircle = null;
        }
    });

    canvas.addEventListener('mousemove', (event) => {
        if (mode != 2 || isDrawing === false) {
            previewCircle = null;
            return;
        }
        
        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const [worldX, worldY] = screenToWorld(screenX, screenY);
        
        const dx = worldX - startX;
        const dy = worldY - startY;
        const radius = Math.sqrt(dx * dx + dy * dy);

        previewCircle = new Circle(startX, startY, radius, currentColor);
    });
}

export function getCircles(): Circle[] {
    return circles;
}

export function setCircles(newCircles: Circle[]) {
  circles = newCircles;
}