import { selectedShape } from "./grabtool";
import { mode, currentColor } from "./state";
import { Line, getLines } from "./line";
import { Rectangle, getRectangles } from "./rectangle";
import { Circle, getCircles } from "./circle";
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
let rgbCubeProps: HTMLElement;

let lineX1: HTMLInputElement, lineY1: HTMLInputElement, lineX2: HTMLInputElement, lineY2: HTMLInputElement;

let rectX1: HTMLInputElement, rectY1: HTMLInputElement, rectWidth: HTMLInputElement, rectHeight: HTMLInputElement;

let circleCX: HTMLInputElement, circleCY: HTMLInputElement, circleRadius: HTMLInputElement;

let shapeColor: HTMLInputElement;
let updateButton: HTMLButtonElement;
let createButton: HTMLButtonElement;



export function initPropertiesPanel() {
    panel = document.getElementById('properties-panel') as HTMLElement;
    noSelection = document.getElementById('no-selection') as HTMLElement;
    lineProps = document.getElementById('line-props') as HTMLElement;
    rectProps = document.getElementById('rect-props') as HTMLElement;
    circleProps = document.getElementById('circle-props') as HTMLElement;
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

    shapeColor = document.getElementById('shape-color') as HTMLInputElement;
    updateButton = document.getElementById('updateButton') as HTMLButtonElement;
    createButton = document.getElementById('createButton') as HTMLButtonElement;

    updateButton.addEventListener('click', applyPropertyChanges);
    createButton.addEventListener('click', createShapeFromProperties);

    // RGB Cube event listeners
    setupRGBCubeListeners();
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

function clearInputFields() {
    lineX1.value = ''; lineY1.value = ''; lineX2.value = ''; lineY2.value = '';
    rectX1.value = ''; rectY1.value = ''; rectWidth.value = ''; rectHeight.value = '';
    circleCX.value = ''; circleCY.value = ''; circleRadius.value = '';
}

export function showRGBCubeProperties() {
    lineProps.classList.add('hidden');
    rectProps.classList.add('hidden');
    circleProps.classList.add('hidden');
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
        }
        shapeColor.value = shape.color;

    } else if (mode < 3) {
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
        }
    } catch (e) {
        alert("Invalid input values. Please check and try again.");
    }
}