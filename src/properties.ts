import { selectedShape } from "./grabtool";
import { mode, currentColor } from "./state";
import { Line, getLines } from "./line";
import { Rectangle, getRectangles } from "./rectangle";
import { Circle, getCircles } from "./circle";
import { BezierCurve, getBezierCurves, getBezierDegree, type Point } from "./bezier";
import { Polygon, getPolygons, type Point as PolygonPoint } from "./polygon";
import {
    setSliceEnabled,
    setSliceAxis,
    setSlicePosition,
    setAutoRotate,
    resetRotation as cubeResetRotation
} from './rgbcube';

let panel: HTMLElement;
let noSelection: HTMLElement;
let lineProps: HTMLElement, rectProps: HTMLElement, circleProps: HTMLElement, commonProps: HTMLElement;
let bezierProps: HTMLElement;
let polygonProps: HTMLElement;
let rgbCubeProps: HTMLElement;

let lineX1: HTMLInputElement, lineY1: HTMLInputElement, lineX2: HTMLInputElement, lineY2: HTMLInputElement;

let rectX1: HTMLInputElement, rectY1: HTMLInputElement, rectWidth: HTMLInputElement, rectHeight: HTMLInputElement;

let circleCX: HTMLInputElement, circleCY: HTMLInputElement, circleRadius: HTMLInputElement;

let bezierPointsContainer: HTMLElement;
let addBezierPointBtn: HTMLButtonElement;
let removeBezierPointBtn: HTMLButtonElement;

let polygonVerticesContainer: HTMLElement;
let addPolygonVertexBtn: HTMLButtonElement;
let removePolygonVertexBtn: HTMLButtonElement;

// Polygon transformation inputs
let translateDx: HTMLInputElement;
let translateDy: HTMLInputElement;
let rotateCx: HTMLInputElement;
let rotateCy: HTMLInputElement;
let rotateAngle: HTMLInputElement;
let scaleCx: HTMLInputElement;
let scaleCy: HTMLInputElement;
let scaleFactor: HTMLInputElement;

// Mode for setting transformation points via mouse
let settingRotateCenter = false;
let settingScaleCenter = false;

// Storage for creating new polygons from text fields
let createPolygonVertices: PolygonPoint[] = [];

let shapeColor: HTMLInputElement;
let updateButton: HTMLButtonElement;
let createButton: HTMLButtonElement;



export function initPropertiesPanel() {
    panel = document.getElementById('properties-panel') as HTMLElement;
    noSelection = document.getElementById('no-selection') as HTMLElement;
    lineProps = document.getElementById('line-props') as HTMLElement;
    rectProps = document.getElementById('rect-props') as HTMLElement;
    circleProps = document.getElementById('circle-props') as HTMLElement;
    bezierProps = document.getElementById('bezier-props') as HTMLElement;
    polygonProps = document.getElementById('polygon-props') as HTMLElement;
    commonProps = document.getElementById('common-props') as HTMLElement;
    rgbCubeProps = document.getElementById('rgb-cube-props') as HTMLElement;

    lineX1 = document.getElementById('line-x1') as HTMLInputElement;
    lineY1 = document.getElementById('line-y1') as HTMLInputElement;
    lineX2 = document.getElementById('line-x2') as HTMLInputElement;
    lineY2 = document.getElementById('line-y2') as HTMLInputElement;

    rectX1 = document.getElementById('rect-x1') as HTMLInputElement;
    rectY1 = document.getElementById('rect-y1') as HTMLInputElement;
    rectWidth = document.getElementById('rect-width') as HTMLInputElement;
    rectHeight = document.getElementById('rect-height') as HTMLInputElement;

    circleCX = document.getElementById('circle-cx') as HTMLInputElement;
    circleCY = document.getElementById('circle-cy') as HTMLInputElement;
    circleRadius = document.getElementById('circle-radius') as HTMLInputElement;

    bezierPointsContainer = document.getElementById('bezier-points-container') as HTMLElement;
    addBezierPointBtn = document.getElementById('addBezierPointBtn') as HTMLButtonElement;
    removeBezierPointBtn = document.getElementById('removeBezierPointBtn') as HTMLButtonElement;

    polygonVerticesContainer = document.getElementById('polygon-vertices-container') as HTMLElement;
    addPolygonVertexBtn = document.getElementById('addPolygonVertexBtn') as HTMLButtonElement;
    removePolygonVertexBtn = document.getElementById('removePolygonVertexBtn') as HTMLButtonElement;

    // Polygon transformation inputs
    translateDx = document.getElementById('translate-dx') as HTMLInputElement;
    translateDy = document.getElementById('translate-dy') as HTMLInputElement;
    rotateCx = document.getElementById('rotate-cx') as HTMLInputElement;
    rotateCy = document.getElementById('rotate-cy') as HTMLInputElement;
    rotateAngle = document.getElementById('rotate-angle') as HTMLInputElement;
    scaleCx = document.getElementById('scale-cx') as HTMLInputElement;
    scaleCy = document.getElementById('scale-cy') as HTMLInputElement;
    scaleFactor = document.getElementById('scale-factor') as HTMLInputElement;

    shapeColor = document.getElementById('shape-color') as HTMLInputElement;
    updateButton = document.getElementById('updateButton') as HTMLButtonElement;
    createButton = document.getElementById('createButton') as HTMLButtonElement;

    updateButton.addEventListener('click', applyPropertyChanges);
    createButton.addEventListener('click', createShapeFromProperties);

    setupRGBCubeListeners();
    setupBezierListeners();
    setupPolygonListeners();
}

function setupRGBCubeListeners() {
    const sliceEnabled = document.getElementById('cube-slice-enabled') as HTMLInputElement;
    const sliceAxis = document.getElementById('cube-slice-axis') as HTMLSelectElement;
    const slicePosition = document.getElementById('cube-slice-position') as HTMLInputElement;
    const sliceValue = document.getElementById('cube-slice-value') as HTMLSpanElement;
    const autoRotate = document.getElementById('cube-auto-rotate') as HTMLInputElement;
    const resetButton = document.getElementById('cube-reset-rotation') as HTMLButtonElement;

    sliceEnabled?.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        setSliceEnabled(target.checked);
    });

    sliceAxis?.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        setSliceAxis(target.value as 'x' | 'y' | 'z');
    });

    slicePosition?.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const value = parseFloat(target.value) / 100;
        setSlicePosition(value);
        if (sliceValue) {
            sliceValue.textContent = target.value + '%';
        }
    });

    autoRotate?.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        setAutoRotate(target.checked);
    });

    resetButton?.addEventListener('click', () => {
        cubeResetRotation();
    });
}

function setupBezierListeners() {
    addBezierPointBtn?.addEventListener('click', () => {
        if (!selectedShape || selectedShape.type !== 'bezier') return;

        const bezier = selectedShape as BezierCurve;
        bezier.controlPoints.push({ x: 0, y: 0 });
        renderBezierPointsUI(bezier.controlPoints);
    });

    removeBezierPointBtn?.addEventListener('click', () => {
        if (!selectedShape || selectedShape.type !== 'bezier') return;

        const bezier = selectedShape as BezierCurve;
        if (bezier.controlPoints.length > 2) {
            bezier.controlPoints.pop();
            renderBezierPointsUI(bezier.controlPoints);
        }
    });
}

function setupPolygonListeners() {
    // Add/remove vertex buttons - works both for editing and creating
    addPolygonVertexBtn?.addEventListener('click', () => {
        if (selectedShape && selectedShape.type === 'polygon') {
            // Editing existing polygon
            const polygon = selectedShape as Polygon;
            const lastVertex = polygon.vertices[polygon.vertices.length - 1] || { x: 100, y: 100 };
            polygon.vertices.push({ x: lastVertex.x + 20, y: lastVertex.y });
            renderPolygonVerticesUI(polygon.vertices);
        } else if (mode === 6) {
            // Creating new polygon - add to createPolygonVertices
            const lastVertex = createPolygonVertices[createPolygonVertices.length - 1] || { x: 100, y: 100 };
            createPolygonVertices.push({ x: lastVertex.x + 20, y: lastVertex.y });
            renderCreatePolygonVerticesUI();
        }
    });

    removePolygonVertexBtn?.addEventListener('click', () => {
        if (selectedShape && selectedShape.type === 'polygon') {
            // Editing existing polygon
            const polygon = selectedShape as Polygon;
            if (polygon.vertices.length > 3) {
                polygon.vertices.pop();
                renderPolygonVerticesUI(polygon.vertices);
            }
        } else if (mode === 6) {
            // Creating new polygon - remove from createPolygonVertices
            if (createPolygonVertices.length > 3) {
                createPolygonVertices.pop();
                renderCreatePolygonVerticesUI();
            }
        }
    });

    // Translation button
    document.getElementById('applyTranslateBtn')?.addEventListener('click', () => {
        if (!selectedShape || selectedShape.type !== 'polygon') return;

        const polygon = selectedShape as Polygon;
        const dx = parseFloat(translateDx.value) || 0;
        const dy = parseFloat(translateDy.value) || 0;

        polygon.move(dx, dy);
        renderPolygonVerticesUI(polygon.vertices);
    });

    // Rotation button
    document.getElementById('applyRotateBtn')?.addEventListener('click', () => {
        if (!selectedShape || selectedShape.type !== 'polygon') return;

        const polygon = selectedShape as Polygon;
        const cx = parseFloat(rotateCx.value);
        const cy = parseFloat(rotateCy.value);
        const angle = parseFloat(rotateAngle.value) || 0;

        // Use centroid if no center specified
        if (isNaN(cx) || isNaN(cy)) {
            const centroid = polygon.getCentroid();
            polygon.rotate(centroid.x, centroid.y, angle);
        } else {
            polygon.rotate(cx, cy, angle);
        }
        renderPolygonVerticesUI(polygon.vertices);
    });

    // Scale button
    document.getElementById('applyScaleBtn')?.addEventListener('click', () => {
        if (!selectedShape || selectedShape.type !== 'polygon') return;

        const polygon = selectedShape as Polygon;
        const cx = parseFloat(scaleCx.value);
        const cy = parseFloat(scaleCy.value);
        const factor = parseFloat(scaleFactor.value) || 1;

        // Use centroid if no center specified
        if (isNaN(cx) || isNaN(cy)) {
            const centroid = polygon.getCentroid();
            polygon.scale(centroid.x, centroid.y, factor);
        } else {
            polygon.scale(cx, cy, factor);
        }
        renderPolygonVerticesUI(polygon.vertices);
    });

    // Set rotation center via mouse - toggle mode, no alert
    document.getElementById('setRotateCenterBtn')?.addEventListener('click', () => {
        settingRotateCenter = !settingRotateCenter;
        settingScaleCenter = false;
        updateSetCenterButtonStyles();
    });

    // Set scale center via mouse - toggle mode, no alert
    document.getElementById('setScaleCenterBtn')?.addEventListener('click', () => {
        settingScaleCenter = !settingScaleCenter;
        settingRotateCenter = false;
        updateSetCenterButtonStyles();
    });
}

function updateSetCenterButtonStyles() {
    const rotateBtn = document.getElementById('setRotateCenterBtn');
    const scaleBtn = document.getElementById('setScaleCenterBtn');

    if (rotateBtn) {
        if (settingRotateCenter) {
            rotateBtn.textContent = 'Kliknij na canvas...';
            rotateBtn.classList.add('bg-yellow-500');
            rotateBtn.classList.remove('bg-green-400');
        } else {
            rotateBtn.textContent = 'Ustaw punkt myszka';
            rotateBtn.classList.remove('bg-yellow-500');
            rotateBtn.classList.add('bg-green-400');
        }
    }

    if (scaleBtn) {
        if (settingScaleCenter) {
            scaleBtn.textContent = 'Kliknij na canvas...';
            scaleBtn.classList.add('bg-yellow-500');
            scaleBtn.classList.remove('bg-purple-400');
        } else {
            scaleBtn.textContent = 'Ustaw punkt myszka';
            scaleBtn.classList.remove('bg-yellow-500');
            scaleBtn.classList.add('bg-purple-400');
        }
    }
}

// Export function to handle mouse click for setting transformation centers
export function handleTransformCenterClick(worldX: number, worldY: number): boolean {
    if (settingRotateCenter) {
        rotateCx.value = Math.round(worldX).toString();
        rotateCy.value = Math.round(worldY).toString();
        settingRotateCenter = false;
        updateSetCenterButtonStyles();
        return true;
    }
    if (settingScaleCenter) {
        scaleCx.value = Math.round(worldX).toString();
        scaleCy.value = Math.round(worldY).toString();
        settingScaleCenter = false;
        updateSetCenterButtonStyles();
        return true;
    }
    return false;
}

export function isSettingTransformCenter(): boolean {
    return settingRotateCenter || settingScaleCenter;
}

function renderPolygonVerticesUI(vertices: PolygonPoint[]) {
    if (!polygonVerticesContainer) return;

    polygonVerticesContainer.innerHTML = '';

    vertices.forEach((vertex, index) => {
        const vertexDiv = document.createElement('div');
        vertexDiv.className = 'flex items-center gap-1 text-sm';

        vertexDiv.innerHTML = `
            <span class="w-8 font-medium">V${index}:</span>
            <input type="number" class="polygon-vertex-x w-16 p-1 border rounded text-sm" data-index="${index}" value="${Math.round(vertex.x)}">
            <input type="number" class="polygon-vertex-y w-16 p-1 border rounded text-sm" data-index="${index}" value="${Math.round(vertex.y)}">
        `;

        polygonVerticesContainer.appendChild(vertexDiv);
    });

    // Add event listeners for the inputs
    polygonVerticesContainer.querySelectorAll('.polygon-vertex-x, .polygon-vertex-y').forEach(input => {
        input.addEventListener('change', (e) => {
            if (!selectedShape || selectedShape.type !== 'polygon') return;

            const polygon = selectedShape as Polygon;
            const target = e.target as HTMLInputElement;
            const index = parseInt(target.dataset.index || '0');
            const value = parseFloat(target.value);

            if (!isNaN(value) && index < polygon.vertices.length) {
                if (target.classList.contains('polygon-vertex-x')) {
                    polygon.vertices[index].x = value;
                } else {
                    polygon.vertices[index].y = value;
                }
            }
        });
    });
}

function renderCreatePolygonVerticesUI() {
    if (!polygonVerticesContainer) return;

    polygonVerticesContainer.innerHTML = '';

    // Initialize with default triangle
    if (createPolygonVertices.length < 3) {
        createPolygonVertices = [
            { x: 100, y: 100 },
            { x: 200, y: 100 },
            { x: 150, y: 200 }
        ];
    }

    createPolygonVertices.forEach((vertex, index) => {
        const vertexDiv = document.createElement('div');
        vertexDiv.className = 'flex items-center gap-1 text-sm';

        vertexDiv.innerHTML = `
            <span class="w-8 font-medium">V${index}:</span>
            <input type="number" class="create-polygon-vertex-x w-16 p-1 border rounded text-sm" data-index="${index}" value="${Math.round(vertex.x)}">
            <input type="number" class="create-polygon-vertex-y w-16 p-1 border rounded text-sm" data-index="${index}" value="${Math.round(vertex.y)}">
        `;

        polygonVerticesContainer.appendChild(vertexDiv);
    });

    // Add event listeners for the inputs
    polygonVerticesContainer.querySelectorAll('.create-polygon-vertex-x, .create-polygon-vertex-y').forEach(input => {
        input.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            const index = parseInt(target.dataset.index || '0');
            const value = parseFloat(target.value);

            if (!isNaN(value) && index < createPolygonVertices.length) {
                if (target.classList.contains('create-polygon-vertex-x')) {
                    createPolygonVertices[index].x = value;
                } else {
                    createPolygonVertices[index].y = value;
                }
            }
        });
    });
}

function renderBezierPointsUI(points: Point[]) {
    if (!bezierPointsContainer) return;

    bezierPointsContainer.innerHTML = '';

    points.forEach((point, index) => {
        const pointDiv = document.createElement('div');
        pointDiv.className = 'flex items-center gap-1 text-sm';

        pointDiv.innerHTML = `
            <span class="w-8 font-medium">P${index}:</span>
            <input type="number" class="bezier-point-x w-16 p-1 border rounded text-sm" data-index="${index}" value="${Math.round(point.x)}">
            <input type="number" class="bezier-point-y w-16 p-1 border rounded text-sm" data-index="${index}" value="${Math.round(point.y)}">
        `;

        bezierPointsContainer.appendChild(pointDiv);
    });

    // Add event listeners for the inputs
    bezierPointsContainer.querySelectorAll('.bezier-point-x, .bezier-point-y').forEach(input => {
        input.addEventListener('change', (e) => {
            if (!selectedShape || selectedShape.type !== 'bezier') return;

            const bezier = selectedShape as BezierCurve;
            const target = e.target as HTMLInputElement;
            const index = parseInt(target.dataset.index || '0');
            const value = parseFloat(target.value);

            if (!isNaN(value) && index < bezier.controlPoints.length) {
                if (target.classList.contains('bezier-point-x')) {
                    bezier.controlPoints[index].x = value;
                } else {
                    bezier.controlPoints[index].y = value;
                }
            }
        });
    });
}

let createBezierPoints: Point[] = [];

function renderCreateBezierPointsUI() {
    if (!bezierPointsContainer) return;

    bezierPointsContainer.innerHTML = '';

    const degree = getBezierDegree();
    const numPoints = degree + 1;

    // Initialize points if needed
    while (createBezierPoints.length < numPoints) {
        createBezierPoints.push({ x: 100 + createBezierPoints.length * 50, y: 100 });
    }
    while (createBezierPoints.length > numPoints) {
        createBezierPoints.pop();
    }

    createBezierPoints.forEach((point, index) => {
        const pointDiv = document.createElement('div');
        pointDiv.className = 'flex items-center gap-1 text-sm';

        pointDiv.innerHTML = `
            <span class="w-8 font-medium">P${index}:</span>
            <input type="number" class="create-bezier-point-x w-16 p-1 border rounded text-sm" data-index="${index}" value="${Math.round(point.x)}">
            <input type="number" class="create-bezier-point-y w-16 p-1 border rounded text-sm" data-index="${index}" value="${Math.round(point.y)}">
        `;

        bezierPointsContainer.appendChild(pointDiv);
    });

    // Add event listeners for the inputs
    bezierPointsContainer.querySelectorAll('.create-bezier-point-x, .create-bezier-point-y').forEach(input => {
        input.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            const index = parseInt(target.dataset.index || '0');
            const value = parseFloat(target.value);

            if (!isNaN(value) && index < createBezierPoints.length) {
                if (target.classList.contains('create-bezier-point-x')) {
                    createBezierPoints[index].x = value;
                } else {
                    createBezierPoints[index].y = value;
                }
            }
        });
    });
}

function clearInputFields() {
    lineX1.value = ''; lineY1.value = ''; lineX2.value = ''; lineY2.value = '';
    rectX1.value = ''; rectY1.value = ''; rectWidth.value = ''; rectHeight.value = '';
    circleCX.value = ''; circleCY.value = ''; circleRadius.value = '';
    createBezierPoints = [];
}

export function showRGBCubeProperties() {
    lineProps.classList.add('hidden');
    rectProps.classList.add('hidden');
    circleProps.classList.add('hidden');
    bezierProps.classList.add('hidden');
    polygonProps.classList.add('hidden');
    commonProps.classList.add('hidden');
    noSelection.classList.add('hidden');
    updateButton.classList.add('hidden');
    createButton.classList.add('hidden');
    rgbCubeProps.classList.remove('hidden');
    panel.classList.remove('translate-x-full');
}

export function hideRGBCubeProperties() {
    rgbCubeProps.classList.add('hidden');
    panel.classList.add('translate-x-full');
}

export function updatePropertiesPanel(shape: any) {
    lineProps.classList.add('hidden');
    rectProps.classList.add('hidden');
    circleProps.classList.add('hidden');
    bezierProps.classList.add('hidden');
    polygonProps.classList.add('hidden');
    commonProps.classList.add('hidden');
    noSelection.classList.add('hidden');
    updateButton.classList.add('hidden');
    createButton.classList.add('hidden');
    rgbCubeProps.classList.add('hidden');

    if (shape) {
        panel.classList.remove('translate-x-full');
        commonProps.classList.remove('hidden');
        updateButton.classList.remove('hidden');

        if (shape.type === 'line') {
            lineProps.classList.remove('hidden');
            lineX1.value = shape.x1.toString();
            lineY1.value = shape.y1.toString();
            lineX2.value = shape.x2.toString();
            lineY2.value = shape.y2.toString();
        } else if (shape.type === 'rectangle') {
            rectProps.classList.remove('hidden');
            rectX1.value = shape.x1.toString();
            rectY1.value = shape.y1.toString();
            rectWidth.value = (shape.x2 - shape.x1).toString();
            rectHeight.value = (shape.y2 - shape.y1).toString();
        } else if (shape.type === 'circle') {
            circleProps.classList.remove('hidden');
            circleCX.value = shape.centerX.toString();
            circleCY.value = shape.centerY.toString();
            circleRadius.value = shape.radius.toString();
        } else if (shape.type === 'bezier') {
            bezierProps.classList.remove('hidden');
            renderBezierPointsUI(shape.controlPoints);
        } else if (shape.type === 'polygon') {
            polygonProps.classList.remove('hidden');
            renderPolygonVerticesUI(shape.vertices);
            // Set default transformation centers to centroid
            const centroid = shape.getCentroid();
            rotateCx.value = Math.round(centroid.x).toString();
            rotateCy.value = Math.round(centroid.y).toString();
            scaleCx.value = Math.round(centroid.x).toString();
            scaleCy.value = Math.round(centroid.y).toString();
        }
        shapeColor.value = shape.color;

    } else if (mode < 3 || mode === 5 || mode === 6) {
        panel.classList.remove('translate-x-full');
        commonProps.classList.remove('hidden');
        createButton.classList.remove('hidden');

        clearInputFields();
        shapeColor.value = currentColor;

        if (mode === 0) {
            lineProps.classList.remove('hidden');
        } else if (mode === 1) {
            rectProps.classList.remove('hidden');
        } else if (mode === 2) {
            circleProps.classList.remove('hidden');
        } else if (mode === 5) {
            bezierProps.classList.remove('hidden');
            renderCreateBezierPointsUI();
        } else if (mode === 6) {
            polygonProps.classList.remove('hidden');
            renderCreatePolygonVerticesUI();
        }
    } else {
        panel.classList.add('translate-x-full');
    }
}

function createShapeFromProperties() {
    try {
        const color = shapeColor.value;

        if (mode === 0) {
            const x1 = parseFloat(lineX1.value);
            const y1 = parseFloat(lineY1.value);
            const x2 = parseFloat(lineX2.value);
            const y2 = parseFloat(lineY2.value);
            if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) throw new Error("Error invalid line properties.");

            getLines().push(new Line(x1, y1, x2, y2, color));

        } else if (mode === 1) {
            const x1 = parseFloat(rectX1.value);
            const y1 = parseFloat(rectY1.value);
            const width = parseFloat(rectWidth.value);
            const height = parseFloat(rectHeight.value);
            if (isNaN(x1) || isNaN(y1) || isNaN(width) || isNaN(height)) throw new Error("Error invalid rectangle properties.");

            const x2 = x1 + width;
            const y2 = y1 + height;
            getRectangles().push(new Rectangle(x1, y1, x2, y2, color));

        } else if (mode === 2) {
            const cx = parseFloat(circleCX.value);
            const cy = parseFloat(circleCY.value);
            const r = parseFloat(circleRadius.value);
            if (isNaN(cx) || isNaN(cy) || isNaN(r)) throw new Error("Error invalid circle properties.");

            getCircles().push(new Circle(cx, cy, r, color));

        } else if (mode === 5) {
            if (createBezierPoints.length < 2) throw new Error("Error: Bezier curve needs at least 2 points.");

            // Read values from inputs
            const points: Point[] = [];

            for (let i = 0; i < createBezierPoints.length; i++) {
                const xInput = bezierPointsContainer.querySelector(`.create-bezier-point-x[data-index="${i}"]`) as HTMLInputElement;
                const yInput = bezierPointsContainer.querySelector(`.create-bezier-point-y[data-index="${i}"]`) as HTMLInputElement;

                if (xInput && yInput) {
                    const x = parseFloat(xInput.value);
                    const y = parseFloat(yInput.value);
                    if (isNaN(x) || isNaN(y)) throw new Error("Error invalid Bezier point.");
                    points.push({ x, y });
                }
            }

            if (points.length >= 2) {
                getBezierCurves().push(new BezierCurve(points, color));
                createBezierPoints = [];
            }
        } else if (mode === 6) {
            if (createPolygonVertices.length < 3) throw new Error("Error: Polygon needs at least 3 vertices.");

            // Read values from inputs
            const vertices: PolygonPoint[] = [];

            for (let i = 0; i < createPolygonVertices.length; i++) {
                const xInput = polygonVerticesContainer.querySelector(`.create-polygon-vertex-x[data-index="${i}"]`) as HTMLInputElement;
                const yInput = polygonVerticesContainer.querySelector(`.create-polygon-vertex-y[data-index="${i}"]`) as HTMLInputElement;

                if (xInput && yInput) {
                    const x = parseFloat(xInput.value);
                    const y = parseFloat(yInput.value);
                    if (isNaN(x) || isNaN(y)) throw new Error("Error invalid polygon vertex.");
                    vertices.push({ x, y });
                }
            }

            if (vertices.length >= 3) {
                getPolygons().push(new Polygon(vertices, color));
                createPolygonVertices = [];
            }
        }

    } catch (e) {
        alert("Error invalid input values.");
    }
}


function applyPropertyChanges() {
    if (!selectedShape) return;

    try {
        selectedShape.color = shapeColor.value;

        if (selectedShape.type === 'line') {
            selectedShape.x1 = parseFloat(lineX1.value);
            selectedShape.y1 = parseFloat(lineY1.value);
            selectedShape.x2 = parseFloat(lineX2.value);
            selectedShape.y2 = parseFloat(lineY2.value);
        } else if (selectedShape.type === 'rectangle') {
            const x1 = parseFloat(rectX1.value);
            const y1 = parseFloat(rectY1.value);
            const width = parseFloat(rectWidth.value);
            const height = parseFloat(rectHeight.value);

            selectedShape.x1 = x1;
            selectedShape.y1 = y1;
            selectedShape.x2 = x1 + width;
            selectedShape.y2 = y1 + height;
            selectedShape.normalize();
        } else if (selectedShape.type === 'circle') {
            selectedShape.centerX = parseFloat(circleCX.value);
            selectedShape.centerY = parseFloat(circleCY.value);
            selectedShape.radius = parseFloat(circleRadius.value);
        } else if (selectedShape.type === 'bezier') {
            // Bezier points are already updated in real-time through the input listeners
            // Just update the color here
        }
    } catch (e) {
        alert("Invalid input values. Please check and try again.");
    }
}