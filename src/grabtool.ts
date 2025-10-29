import './state.ts';
import { mode } from "./state";
import { getRectangles } from "./rectangle";
import { getLines } from "./line";

let selectedShape: any | null = null;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

export function setupSelection(canvas: HTMLCanvasElement) {
    
    canvas.addEventListener('mousedown', (event) => {
        if (mode !== 4) return; 

        const x = event.offsetX;
        const y = event.offsetY;

        selectedShape = null; 
        isDragging = false;


        for (const rect of getRectangles().slice().reverse()) { 
            if (rect.hitTest(x, y)) {
                selectedShape = rect;
                break; 
            }
        }

        if (!selectedShape) {
            for (const line of getLines().slice().reverse()) {
                if (line.hitTest(x, y)) {
                    selectedShape = line;
                    break;
                }
            }
        }
        


        if (selectedShape) {
            console.log("Trafiono obiekt!", selectedShape);
            isDragging = true;
            lastMouseX = x;
            lastMouseY = y;
        }
    });

    canvas.addEventListener('mousemove', (event) => {
        if (mode !== 4 || !isDragging || !selectedShape) return;

        const x = event.offsetX;
        const y = event.offsetY;

        const dx = x - lastMouseX;
        const dy = y - lastMouseY;

        selectedShape.move(dx, dy);

        lastMouseX = x;
        lastMouseY = y;
        
    });

    canvas.addEventListener('mouseup', () => {
        if (mode !== 4) return;
        isDragging = false;
    });
}