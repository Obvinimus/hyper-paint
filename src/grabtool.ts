import './state.ts';
import { mode } from "./state";
import { getRectangles } from "./rectangle";
import { getLines } from "./line";
import { getCircles } from "./circle";
import { getBezierCurves } from "./bezier";
import { getPolygons, Polygon } from "./polygon";
import { changePixelColor } from './pixel.ts';
import { updatePropertiesPanel } from './properties.ts';
import { screenToWorld } from './coords.ts';

export let selectedShape: any | null = null;
let isDragging = false;
let lastWorldX = 0;
let lastWorldY = 0;
let isResizing = false;
let activeHandle: { id: string; x: number; y: number; } | null = null;
const HANDLE_SIZE = 5;

// States for mouse-based rotation and scaling of polygons
let isRotating = false;
let isScaling = false;
let rotationCenterX = 0;
let rotationCenterY = 0;
let scaleCenterX = 0;
let scaleCenterY = 0;
let initialAngle = 0;
let initialDistance = 0;

export function drawHandle(x: number, y: number, data: Uint8ClampedArray, canvasWidth: number) {
    const size = HANDLE_SIZE;
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
        if (mode !== 4 || event.button !== 0) return;

        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const [worldX, worldY] = screenToWorld(screenX, screenY);

        isDragging = false;
        isResizing = false;
        isRotating = false;
        isScaling = false;
        activeHandle = null;

        // Check for rotation (Shift+click on polygon) or scaling (Ctrl+click on polygon)
        if (selectedShape && selectedShape.type === 'polygon') {
            const polygon = selectedShape as Polygon;
            const centroid = polygon.getCentroid();

            if (event.shiftKey) {
                // Start rotation mode
                isRotating = true;
                rotationCenterX = centroid.x;
                rotationCenterY = centroid.y;
                initialAngle = Math.atan2(worldY - centroid.y, worldX - centroid.x);
                lastWorldX = worldX;
                lastWorldY = worldY;
                return;
            } else if (event.ctrlKey) {
                // Start scaling mode
                isScaling = true;
                scaleCenterX = centroid.x;
                scaleCenterY = centroid.y;
                initialDistance = Math.sqrt(
                    Math.pow(worldX - centroid.x, 2) + Math.pow(worldY - centroid.y, 2)
                );
                lastWorldX = worldX;
                lastWorldY = worldY;
                return;
            }
        }

        if (selectedShape) {
            const handles = selectedShape.getHandles();
            for (const handle of handles) {
                if (
                    worldX >= handle.x - HANDLE_SIZE && worldX <= handle.x + HANDLE_SIZE &&
                    worldY >= handle.y - HANDLE_SIZE && worldY <= handle.y + HANDLE_SIZE
                ) {
                    isResizing = true;
                    activeHandle = handle;
                    lastWorldX = worldX;
                    lastWorldY = worldY;
                    return;
                }
            }
        }

        selectedShape = null;
        const hitThreshold = 5;

        for (const circle of getCircles().slice().reverse()) {
            if (circle.hitTest(worldX, worldY, hitThreshold)) {
                selectedShape = circle;
                break;
            }
        }
        if (!selectedShape) {
            for (const rect of getRectangles().slice().reverse()) {
                if (rect.hitTest(worldX, worldY, hitThreshold)) {
                    selectedShape = rect;
                    break;
                }
            }
        }
        if (!selectedShape) {
            for (const line of getLines().slice().reverse()) {
                if (line.hitTest(worldX, worldY, hitThreshold)) {
                    selectedShape = line;
                    break;
                }
            }
        }
        if (!selectedShape) {
            for (const bezier of getBezierCurves().slice().reverse()) {
                if (bezier.hitTest(worldX, worldY, hitThreshold)) {
                    selectedShape = bezier;
                    break;
                }
            }
        }
        if (!selectedShape) {
            for (const polygon of getPolygons().slice().reverse()) {
                if (polygon.hitTest(worldX, worldY, hitThreshold)) {
                    selectedShape = polygon;
                    break;
                }
            }
        }

        if (selectedShape) {
            isDragging = true;
            lastWorldX = worldX;
            lastWorldY = worldY;
        }
        updatePropertiesPanel(selectedShape);
    });

    canvas.addEventListener('mousemove', (event) => {
        if (mode !== 4) return;

        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const [worldX, worldY] = screenToWorld(screenX, screenY);

        if (isRotating && selectedShape && selectedShape.type === 'polygon') {
            // Calculate rotation angle difference
            const polygon = selectedShape as Polygon;
            const currentAngle = Math.atan2(worldY - rotationCenterY, worldX - rotationCenterX);
            const angleDiff = (currentAngle - initialAngle) * (180 / Math.PI);

            polygon.rotate(rotationCenterX, rotationCenterY, angleDiff);
            initialAngle = currentAngle;

        } else if (isScaling && selectedShape && selectedShape.type === 'polygon') {
            // Calculate scale factor based on distance change
            const polygon = selectedShape as Polygon;
            const currentDistance = Math.sqrt(
                Math.pow(worldX - scaleCenterX, 2) + Math.pow(worldY - scaleCenterY, 2)
            );

            if (initialDistance > 0) {
                const scaleFactor = currentDistance / initialDistance;
                polygon.scale(scaleCenterX, scaleCenterY, scaleFactor);
                initialDistance = currentDistance;
            }

        } else if (isResizing && activeHandle && selectedShape) {
            selectedShape.resize(activeHandle.id, worldX, worldY);

        } else if (isDragging && selectedShape) {
            const dx = worldX - lastWorldX;
            const dy = worldY - lastWorldY;
            selectedShape.move(dx, dy);
            lastWorldX = worldX;
            lastWorldY = worldY;
        }
    });

    canvas.addEventListener('mouseup', (event) => {
        if (mode !== 4 || event.button !== 0) return;

        isDragging = false;
        isResizing = false;
        isRotating = false;
        isScaling = false;
        activeHandle = null;
    });
}