import './main.ts'
import { mode, currentColor } from './main.ts';

export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

let lines: Line[] = [];
export let isDrawing = false;
export let startX = 0;
export let startY = 0;
let endX = 0;
let endY = 0;

export function setupLineDrawing(canvas: HTMLCanvasElement) {
  canvas.addEventListener('mousedown', (event) => {
    if(mode != 0) return;
    if(isDrawing == false){
        const rect = canvas.getBoundingClientRect();
        startX = event.clientX - rect.left;
        startY = event.clientY - rect.top;
        isDrawing = true;
    }
    else if(isDrawing == true){
        const rect = canvas.getBoundingClientRect();
        endX = event.clientX - rect.left;
        endY = event.clientY - rect.top;
        let newline:Line = {
            x1: startX,
            y1: startY,
            x2: endX,
            y2: endY,
            color: currentColor
        }
        
        lines.push(newline);
        isDrawing = false;
    }
  });
}

export function getLines(): Line[] {
  return lines; 
}

export function clearLines(): void {
  lines = [];
}

