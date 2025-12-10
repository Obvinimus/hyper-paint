import { mode, currentColor } from './state.ts';
import { changePixelColor } from './pixel.ts';
import type { Handle } from "./state";
import { screenToWorld } from './coords.ts';

export interface Point {
    x: number;
    y: number;
}

export class BezierCurve {
    public readonly type = 'bezier';
    public controlPoints: Point[];
    public color: string;

    constructor(controlPoints: Point[], color: string) {
        this.controlPoints = controlPoints.map(p => ({ x: p.x, y: p.y }));
        this.color = color;
    }

    public get degree(): number {
        return this.controlPoints.length - 1;
    }

    public hitTest(px: number, py: number, threshold: number = 5): boolean {
        const steps = Math.max(100, this.controlPoints.length * 50);

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const point = this.evaluateAt(t);
            const dist = Math.sqrt(Math.pow(px - point.x, 2) + Math.pow(py - point.y, 2));
            if (dist <= threshold) {
                return true;
            }
        }
        return false;
    }

    public move(dx: number, dy: number) {
        for (const point of this.controlPoints) {
            point.x += dx;
            point.y += dy;
        }
    }

    public getHandles(): Handle[] {
        return this.controlPoints.map((point, index) => ({
            id: `p${index}`,
            x: point.x,
            y: point.y
        }));
    }

    public resize(handleId: string, newX: number, newY: number) {
        const index = parseInt(handleId.substring(1));
        if (index >= 0 && index < this.controlPoints.length) {
            this.controlPoints[index].x = newX;
            this.controlPoints[index].y = newY;
        }
    }

    public evaluateAt(t: number): Point {
        return deCasteljau(this.controlPoints, t);
    }
}

// De Casteljau's algorithm for evaluating Bezier curve at parameter t
function deCasteljau(points: Point[], t: number): Point {
    if (points.length === 1) {
        return points[0];
    }

    const newPoints: Point[] = [];
    for (let i = 0; i < points.length - 1; i++) {
        newPoints.push({
            x: (1 - t) * points[i].x + t * points[i + 1].x,
            y: (1 - t) * points[i].y + t * points[i + 1].y
        });
    }

    return deCasteljau(newPoints, t);
}

let bezierCurves: BezierCurve[] = [];
export let isDrawingBezier = false;
export let bezierControlPoints: Point[] = [];
export let previewBezier: BezierCurve | null = null;
export let bezierDegree: number = 3;

export function setBezierDegree(degree: number) {
    bezierDegree = Math.max(1, degree);
}

export function getBezierDegree(): number {
    return bezierDegree;
}

export function drawBezierCurve(
    controlPoints: Point[],
    bufferWidth: number,
    data: Uint8ClampedArray,
    color: string
) {
    if (controlPoints.length < 2) return;

    const steps = Math.max(100, controlPoints.length * 50);

    let prevPoint: Point | null = null;

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const point = deCasteljau(controlPoints, t);

        if (prevPoint) {
            drawLineSegment(
                Math.round(prevPoint.x), Math.round(prevPoint.y),
                Math.round(point.x), Math.round(point.y),
                bufferWidth, data, color
            );
        }

        prevPoint = point;
    }
}

// Simple line drawing using Bresenham's algorithm
function drawLineSegment(
    x1: number, y1: number,
    x2: number, y2: number,
    bufferWidth: number,
    data: Uint8ClampedArray,
    color: string
) {
    let dx = Math.abs(x2 - x1);
    let dy = -Math.abs(y2 - y1);
    let sx = (x1 < x2) ? 1 : -1;
    let sy = (y1 < y2) ? 1 : -1;

    let err = dx + dy;
    let e2;

    while (true) {
        changePixelColor(x1, y1, bufferWidth, data, color);

        if (Math.round(x1) === Math.round(x2) && Math.round(y1) === Math.round(y2)) {
            break;
        }

        e2 = 2 * err;

        if (e2 >= dy) {
            if (Math.round(x1) === Math.round(x2)) break;
            err += dy;
            x1 += sx;
        }

        if (e2 <= dx) {
            if (Math.round(y1) === Math.round(y2)) break;
            err += dx;
            y1 += sy;
        }
    }
}

// Draw control polygon (lines connecting control points)
export function drawControlPolygon(
    controlPoints: Point[],
    bufferWidth: number,
    data: Uint8ClampedArray,
    color: string = '#888888'
) {
    for (let i = 0; i < controlPoints.length - 1; i++) {
        drawLineSegment(
            Math.round(controlPoints[i].x), Math.round(controlPoints[i].y),
            Math.round(controlPoints[i + 1].x), Math.round(controlPoints[i + 1].y),
            bufferWidth, data, color
        );
    }
}

// Draw control point markers
export function drawControlPointMarkers(
    controlPoints: Point[],
    bufferWidth: number,
    data: Uint8ClampedArray,
    markerSize: number = 3
) {
    for (const point of controlPoints) {
        const x = Math.round(point.x);
        const y = Math.round(point.y);

        for (let dy = -markerSize; dy <= markerSize; dy++) {
            for (let dx = -markerSize; dx <= markerSize; dx++) {
                changePixelColor(x + dx, y + dy, bufferWidth, data, '#0066ff');
            }
        }
    }
}

export function setupBezierDrawing(canvas: HTMLCanvasElement) {
    canvas.addEventListener('mousedown', (event) => {
        if (mode !== 5 || event.button !== 0) return;

        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const [worldX, worldY] = screenToWorld(screenX, screenY);

        bezierControlPoints.push({ x: worldX, y: worldY });

        // Check if we have enough points (degree + 1)
        if (bezierControlPoints.length === bezierDegree + 1) {
            bezierCurves.push(new BezierCurve([...bezierControlPoints], currentColor));
            bezierControlPoints = [];
            previewBezier = null;
            isDrawingBezier = false;
        } else {
            isDrawingBezier = true;
        }
    });

    canvas.addEventListener('mousemove', (event) => {
        if (mode !== 5 || bezierControlPoints.length === 0) {
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const [worldX, worldY] = screenToWorld(screenX, screenY);

        // Create preview with current points + mouse position
        const previewPoints = [...bezierControlPoints, { x: worldX, y: worldY }];
        previewBezier = new BezierCurve(previewPoints, currentColor);
    });

    // Right-click to cancel current bezier drawing
    canvas.addEventListener('contextmenu', (event) => {
        if (mode !== 5) return;

        if (bezierControlPoints.length > 0) {
            event.preventDefault();
            bezierControlPoints = [];
            previewBezier = null;
            isDrawingBezier = false;
        }
    });
}

export function getBezierCurves(): BezierCurve[] {
    return bezierCurves;
}

export function clearBezierCurves(): void {
    bezierCurves = [];
}

export function setBezierCurves(newCurves: BezierCurve[]) {
    bezierCurves = newCurves;
}

export function resetBezierDrawing() {
    bezierControlPoints = [];
    previewBezier = null;
    isDrawingBezier = false;
}
