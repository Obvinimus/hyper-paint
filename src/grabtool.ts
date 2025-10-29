import './state.ts';
import { mode } from "./state";
import { getRectangles } from "./rectangle";
import { getLines } from "./line";
import { getCircles } from "./circle";
import { changePixelColor } from './pixel.ts';
import { updatePropertiesPanel } from './properties.ts';

export let selectedShape: any | null = null;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let isResizing = false;
let activeHandle: { id: string; x: number; y: number; } | null = null;
const HANDLE_SIZE = 5;

export function drawHandle(x: number, y: number, data: Uint8ClampedArray, canvasWidth: number) {
    const size = 5;
    const halfSize = Math.floor(size / 2);
    const color = "#0000FF"; 

    for (let i = -halfSize; i <= halfSize; i++) {
        for (let j = -halfSize; j <= halfSize; j++) {
            if (i === -halfSize || i === halfSize || j === -halfSize || j === halfSize) {
                 changePixelColor(Math.round(x + i), Math.round(y + j), canvasWidth, data, color);
            }
        }
    }
}

export function setupSelection(canvas: HTMLCanvasElement) {

    canvas.addEventListener('mousedown', (event) => {
        if (mode !== 4) return; 

        const x = event.offsetX;
        const y = event.offsetY;

        isDragging = false;
        isResizing = false;
        activeHandle = null;

        if (selectedShape) {
            const handles = selectedShape.getHandles();
            for (const handle of handles) {
                if (
                    x >= handle.x - HANDLE_SIZE && x <= handle.x + HANDLE_SIZE &&
                    y >= handle.y - HANDLE_SIZE && y <= handle.y + HANDLE_SIZE
                ) {
                    isResizing = true;
                    activeHandle = handle;
                    lastMouseX = x;
                    lastMouseY = y;
                    return; 
                }
            }
        }

        selectedShape = null; 

        for (const circle of getCircles().slice().reverse()) {
            if (circle.hitTest(x, y)) {
                selectedShape = circle;
                break;
            }
        }
        if (!selectedShape) {
            for (const rect of getRectangles().slice().reverse()) {
                if (rect.hitTest(x, y)) {
                    selectedShape = rect;
                    break;
                }
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
            isDragging = true;
            lastMouseX = x;
            lastMouseY = y;
        }
        updatePropertiesPanel(selectedShape);
    });

    canvas.addEventListener('mousemove', (event) => {
        if (mode !== 4) return;

        const x = event.offsetX;
        const y = event.offsetY;

        if (isResizing && activeHandle && selectedShape) {
            selectedShape.resize(activeHandle.id, x, y);
            
            activeHandle.x = x;
            activeHandle.y = y;
        
        } else if (isDragging && selectedShape) {
            const dx = x - lastMouseX;
            const dy = y - lastMouseY;
            selectedShape.move(dx, dy);
            lastMouseX = x;
            lastMouseY = y;
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (mode !== 4) return;
        
        isDragging = false;
        isResizing = false;
        activeHandle = null;
    });
}