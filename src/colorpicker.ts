import { setColor } from './state';

let svCanvas: HTMLCanvasElement;
let svCtx: CanvasRenderingContext2D;
let pickerIndicator: HTMLElement;
let hueSlider: HTMLInputElement;
let previewBox: HTMLElement;
let colorPickerButton: HTMLButtonElement;
let colorPickerPopup: HTMLElement;

let rInput: HTMLInputElement, gInput: HTMLInputElement, bInput: HTMLInputElement;
let cInput: HTMLInputElement, mInput: HTMLInputElement, yInput: HTMLInputElement, kInput: HTMLInputElement;


let currentHue = 0;     
let currentSat = 0;     
let currentVal = 0;     
let isDragging = false; 

export function setupColorPicker() {
    svCanvas = document.getElementById('sv-canvas') as HTMLCanvasElement;
    svCtx = svCanvas.getContext('2d', { willReadFrequently: true })!;
    pickerIndicator = document.getElementById('picker-indicator') as HTMLElement;
    hueSlider = document.getElementById('hue-slider') as HTMLInputElement;
    previewBox = document.getElementById('colorPreview') as HTMLElement;
    colorPickerButton = document.getElementById('colorPickerButton') as HTMLButtonElement;
    colorPickerPopup = document.getElementById('colorPickerPopup') as HTMLElement;

    rInput = document.getElementById('r-input') as HTMLInputElement;
    gInput = document.getElementById('g-input') as HTMLInputElement;
    bInput = document.getElementById('b-input') as HTMLInputElement;

    cInput = document.getElementById('c-input') as HTMLInputElement;
    mInput = document.getElementById('m-input') as HTMLInputElement;
    yInput = document.getElementById('y-input') as HTMLInputElement;
    kInput = document.getElementById('k-input') as HTMLInputElement;

    colorPickerButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleColorPickerPopup();
    });

    document.addEventListener('click', (e) => {
        if (!colorPickerPopup.contains(e.target as Node) && e.target !== colorPickerButton) {
            closeColorPickerPopup();
        }
    });

    hueSlider.addEventListener('input', () => {
        currentHue = parseInt(hueSlider.value);
        drawSVGradient();      
        updateColorFromHSV();   
    });

    svCanvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        handleCanvasInteract(e);
    });

    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            handleCanvasInteract(e);
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });


    [rInput, gInput, bInput].forEach(el => el.addEventListener('input', updateFromRGBInput));
    [cInput, mInput, yInput, kInput].forEach(el => el.addEventListener('input', updateFromCMYKInput));

    currentHue = 0; currentSat = 0; currentVal = 0;
    drawSVGradient();
    updateIndicatorPosition();
    updateUIComponents(0, 0, 0); 
}

function toggleColorPickerPopup() {
    if (colorPickerPopup.classList.contains('hidden')) {
        openColorPickerPopup();
    } else {
        closeColorPickerPopup();
    }
}

function openColorPickerPopup() {
    colorPickerPopup.classList.remove('hidden');
    
    const buttonRect = colorPickerButton.getBoundingClientRect();
    colorPickerPopup.style.top = `${buttonRect.bottom + 5}px`;
    colorPickerPopup.style.left = `${buttonRect.left}px`;
}

function closeColorPickerPopup() {
    colorPickerPopup.classList.add('hidden');
}


function drawSVGradient() {
    const w = svCanvas.width;
    const h = svCanvas.height;

    svCtx.clearRect(0, 0, w, h);

    svCtx.fillStyle = `hsl(${currentHue}, 100%, 50%)`;
    svCtx.fillRect(0, 0, w, h);

    const whiteGrad = svCtx.createLinearGradient(0, 0, w, 0);
    whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
    whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
    svCtx.fillStyle = whiteGrad;
    svCtx.fillRect(0, 0, w, h);

    const blackGrad = svCtx.createLinearGradient(0, 0, 0, h);
    blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
    blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
    svCtx.fillStyle = blackGrad;
    svCtx.fillRect(0, 0, w, h);
}


function handleCanvasInteract(e: MouseEvent) {
    const rect = svCanvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    pickerIndicator.style.left = `${x}px`;
    pickerIndicator.style.top = `${y}px`;


    currentSat = Math.round((x / rect.width) * 100);
    currentVal = Math.round(100 - (y / rect.height) * 100);

    updateColorFromHSV();
}


function updateColorFromHSV() {
    const [r, g, b] = hsvToRgb(currentHue, currentSat, currentVal);
    updateUIComponents(r, g, b);
}

function updateFromRGBInput() {
    let r = parseInt(rInput.value) || 0;
    let g = parseInt(gInput.value) || 0;
    let b = parseInt(bInput.value) || 0;
    
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    const [h, s, v] = rgbToHsv(r, g, b);
    currentHue = h;
    currentSat = s;
    currentVal = v;

    hueSlider.value = currentHue.toString();
    drawSVGradient();
    updateIndicatorPosition();

    updateUIComponents(r, g, b, false, true);
}

function updateFromCMYKInput() {
    let c = (parseInt(cInput.value) || 0) / 100;
    let m = (parseInt(mInput.value) || 0) / 100;
    let y = (parseInt(yInput.value) || 0) / 100;
    let k = (parseInt(kInput.value) || 0) / 100;

    let r = Math.round(255 * (1 - c) * (1 - k));
    let g = Math.round(255 * (1 - m) * (1 - k));
    let b = Math.round(255 * (1 - y) * (1 - k));

    const [h, s, v] = rgbToHsv(r, g, b);
    currentHue = h;
    currentSat = s;
    currentVal = v;

    hueSlider.value = currentHue.toString();
    drawSVGradient();
    updateIndicatorPosition();

    updateUIComponents(r, g, b, true, false);
}

function updateUIComponents(r: number, g: number, b: number, updateRGB = true, updateCMYK = true) {
    const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    setColor(hex);
    previewBox.style.backgroundColor = hex;
    colorPickerButton.style.backgroundColor = hex; 

    if (updateRGB) {
        rInput.value = r.toString();
        gInput.value = g.toString();
        bInput.value = b.toString();
    }

    if (updateCMYK) {
        const [c, m, y, k] = rgbToCmyk(r, g, b);
        cInput.value = c.toString();
        mInput.value = m.toString();
        yInput.value = y.toString();
        kInput.value = k.toString();
    }
}

function updateIndicatorPosition() {
    const w = svCanvas.width;
    const h = svCanvas.height;
    
    const x = (currentSat / 100) * w;
    const y = (1 - (currentVal / 100)) * h;

    pickerIndicator.style.left = `${x}px`;
    pickerIndicator.style.top = `${y}px`;
}


function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
    let c = 0, m = 0, y = 0, k = 0;
    let rKc = r / 255;
    let gKc = g / 255;
    let bKc = b / 255;

    k = 1 - Math.max(rKc, gKc, bKc);

    if (k === 1) {
        c = 0; m = 0; y = 0;
    } else {
        c = (1 - rKc - k) / (1 - k);
        m = (1 - gKc - k) / (1 - k);
        y = (1 - bKc - k) / (1 - k);
    }
    return [Math.round(c*100), Math.round(m*100), Math.round(y*100), Math.round(k*100)];
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
    s /= 100;
    v /= 100;
    let c = v * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = v - c;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h <= 360) { r = c; g = 0; b = x; }

    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, v = max;
    let d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0; 
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
    }
    return [Math.round(h), Math.round(s * 100), Math.round(v * 100)];
}