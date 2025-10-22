import './main.ts'
import { mode } from './main.ts';

let lines: number[][] = [];
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
        let newline = [startX, startY, endX, endY];
        lines.push(newline);
        isDrawing = false;
    }
  });
}

export function getLines(): number[][] {
  return lines; 
}

export function clearLines(): void {
  lines = [];
}

