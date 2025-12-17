import { mode, currentColor } from './state.ts';
import { drawLineBresenham } from './line.ts';
import type { Handle } from "./state";
import { screenToWorld } from './coords.ts';

export type Point = { x: number; y: number };

// ============================================
// Homogeneous coordinate transformation matrices
// ============================================


// Creates a translation matrix for vector (tx, ty)
function translationMatrix(tx: number, ty: number): number[][] {
    return [
        [1, 0, tx],
        [0, 1, ty],
        [0, 0, 1]
    ];
}

// Creates a rotation matrix around origin by angle (in radians)
function rotationMatrix(angle: number): number[][] {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [
        [cos, -sin, 0],
        [sin, cos, 0],
        [0, 0, 1]
    ];
}

// Creates a scaling matrix with factors (sx, sy)
function scalingMatrix(sx: number, sy: number): number[][] {
    return [
        [sx, 0, 0],
        [0, sy, 0],
        [0, 0, 1]
    ];
}

// Multiplies two 3x3 matrices
function multiplyMatrices(a: number[][], b: number[][]): number[][] {
    const result: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            for (let k = 0; k < 3; k++) {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return result;
}

// Transforms a point using a 3x3 transformation matrix (homogeneous coordinates)
function transformPoint(point: Point, matrix: number[][]): Point {
    const x = matrix[0][0] * point.x + matrix[0][1] * point.y + matrix[0][2];
    const y = matrix[1][0] * point.x + matrix[1][1] * point.y + matrix[1][2];
    const w = matrix[2][0] * point.x + matrix[2][1] * point.y + matrix[2][2];
    return { x: x / w, y: y / w };
}

// Transforms an array of points using a transformation matrix
function transformPoints(points: Point[], matrix: number[][]): Point[] {
    return points.map(p => transformPoint(p, matrix));
}

// ============================================
// Composite transformation functions
// ============================================

// Translation by vector (dx, dy)
export function translatePoints(points: Point[], dx: number, dy: number): Point[] {
    const matrix = translationMatrix(dx, dy);
    return transformPoints(points, matrix);
}

// Rotation around point (cx, cy) by angle (in degrees)
export function rotatePointsAroundPoint(points: Point[], cx: number, cy: number, angleDegrees: number): Point[] {
    const angleRadians = (angleDegrees * Math.PI) / 180;

    // Composite transformation: translate to origin, rotate, translate back
    const toOrigin = translationMatrix(-cx, -cy);
    const rotate = rotationMatrix(angleRadians);
    const fromOrigin = translationMatrix(cx, cy);

    // Combined matrix: fromOrigin * rotate * toOrigin
    let combined = multiplyMatrices(rotate, toOrigin);
    combined = multiplyMatrices(fromOrigin, combined);

    return transformPoints(points, combined);
}

// Scaling around point (cx, cy) by factor
export function scalePointsAroundPoint(points: Point[], cx: number, cy: number, factor: number): Point[] {
    // Composite transformation: translate to origin, scale, translate back
    const toOrigin = translationMatrix(-cx, -cy);
    const scale = scalingMatrix(factor, factor);
    const fromOrigin = translationMatrix(cx, cy);

    // Combined matrix: fromOrigin * scale * toOrigin
    let combined = multiplyMatrices(scale, toOrigin);
    combined = multiplyMatrices(fromOrigin, combined);

    return transformPoints(points, combined);
}

// ============================================
// Polygon class
// ============================================

export class Polygon {
    public readonly type = 'polygon';
    public vertices: Point[];
    public color: string;

    constructor(vertices: Point[], color: string) {
        this.vertices = vertices.map(v => ({ x: v.x, y: v.y }));
        this.color = color;
    }

    // Calculates centroid of the polygon
    public getCentroid(): Point {
        if (this.vertices.length === 0) return { x: 0, y: 0 };

        let sumX = 0;
        let sumY = 0;
        for (const v of this.vertices) {
            sumX += v.x;
            sumY += v.y;
        }
        return {
            x: sumX / this.vertices.length,
            y: sumY / this.vertices.length
        };
    }

    // Hit test - checks if a point is near the polygon edges
    public hitTest(px: number, py: number, threshold: number = 5): boolean {
        for (let i = 0; i < this.vertices.length; i++) {
            const v1 = this.vertices[i];
            const v2 = this.vertices[(i + 1) % this.vertices.length];

            // Check distance to line segment
            if (this.pointToSegmentDistance(px, py, v1.x, v1.y, v2.x, v2.y) <= threshold) {
                return true;
            }
        }
        return false;
    }

    private pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
        const lenSq = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);

        if (lenSq === 0) {
            return Math.sqrt(Math.pow(px - x1, 2) + Math.pow(py - y1, 2));
        }

        const t = Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / lenSq));
        const closestX = x1 + t * (x2 - x1);
        const closestY = y1 + t * (y2 - y1);

        return Math.sqrt(Math.pow(px - closestX, 2) + Math.pow(py - closestY, 2));
    }

    // Move (translation) using homogeneous coordinates
    public move(dx: number, dy: number): void {
        this.vertices = translatePoints(this.vertices, dx, dy);
    }

    // Rotate around a point using homogeneous coordinates
    public rotate(cx: number, cy: number, angleDegrees: number): void {
        this.vertices = rotatePointsAroundPoint(this.vertices, cx, cy, angleDegrees);
    }

    // Scale around a point using homogeneous coordinates
    public scale(cx: number, cy: number, factor: number): void {
        this.vertices = scalePointsAroundPoint(this.vertices, cx, cy, factor);
    }

    // Returns handles for all vertices
    public getHandles(): Handle[] {
        return this.vertices.map((v, i) => ({
            id: `vertex-${i}`,
            x: v.x,
            y: v.y
        }));
    }

    // Resize - move a specific vertex
    public resize(handleId: string, newX: number, newY: number): void {
        const match = handleId.match(/^vertex-(\d+)$/);
        if (match) {
            const index = parseInt(match[1], 10);
            if (index >= 0 && index < this.vertices.length) {
                this.vertices[index].x = newX;
                this.vertices[index].y = newY;
            }
        }
    }
}

// ============================================
// State management
// ============================================

let polygons: Polygon[] = [];
export let isDrawingPolygon = false;
export let polygonVertices: Point[] = [];
export let previewPolygon: Polygon | null = null;

// ============================================
// Drawing functions
// ============================================

export function drawPolygon(polygon: Polygon, bufferWidth: number, data: Uint8ClampedArray): void {
    if (polygon.vertices.length < 2) return;

    // Draw edges
    for (let i = 0; i < polygon.vertices.length; i++) {
        const v1 = polygon.vertices[i];
        const v2 = polygon.vertices[(i + 1) % polygon.vertices.length];
        drawLineBresenham(
            Math.round(v1.x), Math.round(v1.y),
            Math.round(v2.x), Math.round(v2.y),
            bufferWidth, data, polygon.color
        );
    }
}

export function drawPolygonPreview(vertices: Point[], bufferWidth: number, data: Uint8ClampedArray, color: string): void {
    if (vertices.length < 2) return;

    // Draw edges between placed vertices (not closing)
    for (let i = 0; i < vertices.length - 1; i++) {
        const v1 = vertices[i];
        const v2 = vertices[i + 1];
        drawLineBresenham(
            Math.round(v1.x), Math.round(v1.y),
            Math.round(v2.x), Math.round(v2.y),
            bufferWidth, data, color
        );
    }
}

export function drawVertexMarkers(vertices: Point[], bufferWidth: number, data: Uint8ClampedArray): void {
    for (const v of vertices) {
        // Draw small cross at each vertex
        const size = 3;
        const x = Math.round(v.x);
        const y = Math.round(v.y);

        for (let i = -size; i <= size; i++) {
            const idx1 = ((y) * bufferWidth + (x + i)) * 4;
            const idx2 = ((y + i) * bufferWidth + x) * 4;

            if (idx1 >= 0 && idx1 < data.length - 3) {
                data[idx1] = 0;
                data[idx1 + 1] = 0;
                data[idx1 + 2] = 255;
                data[idx1 + 3] = 255;
            }
            if (idx2 >= 0 && idx2 < data.length - 3) {
                data[idx2] = 0;
                data[idx2 + 1] = 0;
                data[idx2 + 2] = 255;
                data[idx2 + 3] = 255;
            }
        }
    }
}

// ============================================
// Event handling for polygon drawing
// ============================================

export function setupPolygonDrawing(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('mousedown', (event) => {
        if (mode !== 6 || event.button !== 0) return;

        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const [worldX, worldY] = screenToWorld(screenX, screenY);

        // Check if clicking near the first vertex to close the polygon
        if (polygonVertices.length >= 3) {
            const first = polygonVertices[0];
            const dist = Math.sqrt(Math.pow(worldX - first.x, 2) + Math.pow(worldY - first.y, 2));

            if (dist < 10) {
                // Close the polygon
                finishPolygon();
                return;
            }
        }

        // Add new vertex
        polygonVertices.push({ x: worldX, y: worldY });
        isDrawingPolygon = true;
    });

    canvas.addEventListener('mousemove', (event) => {
        if (mode !== 6 || !isDrawingPolygon || polygonVertices.length === 0) {
            previewPolygon = null;
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const [worldX, worldY] = screenToWorld(screenX, screenY);

        // Create preview with current mouse position
        const previewVertices = [...polygonVertices, { x: worldX, y: worldY }];
        previewPolygon = new Polygon(previewVertices, currentColor);
    });

    canvas.addEventListener('dblclick', () => {
        if (mode !== 6) return;

        // Finish polygon on double-click
        if (polygonVertices.length >= 3) {
            finishPolygon();
        }
    });

    // Handle keyboard events
    window.addEventListener('keydown', (event) => {
        if (mode !== 6) return;

        if (event.key === 'Escape') {
            // Cancel current polygon
            resetPolygonDrawing();
        } else if (event.key === 'Enter') {
            // Finish polygon
            if (polygonVertices.length >= 3) {
                finishPolygon();
            }
        }
    });
}

function finishPolygon(): void {
    if (polygonVertices.length >= 3) {
        const newPolygon = new Polygon([...polygonVertices], currentColor);
        polygons.push(newPolygon);
    }
    resetPolygonDrawing();
}

export function resetPolygonDrawing(): void {
    polygonVertices = [];
    isDrawingPolygon = false;
    previewPolygon = null;
}

// ============================================
// Accessors
// ============================================

export function getPolygons(): Polygon[] {
    return polygons;
}

export function setPolygons(newPolygons: Polygon[]): void {
    polygons = newPolygons;
}

export function clearPolygons(): void {
    polygons = [];
}
