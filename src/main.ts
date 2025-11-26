import './style.css'
import { setupPixelDrawing } from './pentool.ts';
import { setColor, setMode, scale, viewOffset, setScale, updateViewOffset, setViewOffset } from './state.ts';
import { setupSelection, selectedShape, drawHandle } from './grabtool.ts';
import { getLines, setupLineDrawing, drawLineBresenham, previewLine, setLines, Line } from './line.ts';
import { setupRectangleDrawing, getRectangles, previewRect, setRectangles, Rectangle } from './rectangle.ts';
import { setupCircleDrawing, getCircles, drawCircleMidpoint, previewCircle, setCircles, Circle } from './circle.ts';
import { initPropertiesPanel, updatePropertiesPanel, showRGBCubeProperties, hideRGBCubeProperties } from './properties.ts';
import { parsePPMP3, parsePPMP6 } from './ppm.ts';
import { screenToWorld, worldToScreen } from './coords.ts';
import type { PpmData } from './ppm.ts';
import {mode} from './state.ts';
import { setupColorPicker } from './colorpicker.ts';
import {
    addValue,
    subtractValue,
    multiplyValue,
    divideValue,
    changeBrightness,
    toGrayscaleAverage,
    toGrayscaleLuminance,
    addValueR,
    addValueG,
    addValueB,
    subtractValueR,
    subtractValueG,
    subtractValueB,
    multiplyValueR,
    multiplyValueG,
    multiplyValueB,
    divideValueR,
    divideValueG,
    divideValueB
} from './point-transforms.ts';
import {
    setupRGBCube,
    toggleRGBCube,
    isRGBCubeVisible,
    renderRGBCube,
    setRGBCubePosition,
    getRGBCubeSize,
    getRGBCubeWorldPosition,
    handleRGBCubeMouseDown,
    handleRGBCubeMouseMove,
    handleRGBCubeMouseUp,
    handleRGBCubePanStart,
    handleRGBCubePanMove,
    isRGBCubePanning,
} from './rgbcube.ts';

let graphics: CanvasRenderingContext2D | null;
let canvas: HTMLCanvasElement | null;
let imageData: ImageData | undefined;
let data: Uint8ClampedArray | undefined;
export let currentMousePos: [number, number] = [0, 0];
let loadedPPMImage: ImageData | null = null;

let offscreenCanvas: HTMLCanvasElement;
let offscreenGraphics: CanvasRenderingContext2D;
let isPanning = false;
let lastPanX = 0;
let lastPanY = 0;
let isSpacebarPressed = false;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 50;
const GRID_ZOOM_THRESHOLD = 15;



function mousePos(canvas: HTMLCanvasElement) {
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const [worldX, worldY] = screenToWorld(screenX, screenY);
    currentMousePos = [worldX, worldY];
  });
}

document.getElementById('lineTool')?.addEventListener('click', () => {
  setMode(0);
  updatePropertiesPanel(null); 
});

document.getElementById('rectTool')?.addEventListener('click', () => {
  setMode(1);
  updatePropertiesPanel(null); 
});

document.getElementById('circleTool')?.addEventListener('click', () => {
  setMode(2);
  updatePropertiesPanel(null); 
});

document.getElementById('pencilTool')?.addEventListener('click', () => {
  setMode(3);
  updatePropertiesPanel(null); 
});

document.getElementById('grabTool')?.addEventListener('click', () => {
  setMode(4);
  updatePropertiesPanel(null); 
});

document.getElementById('rgbCubeButton')?.addEventListener('click', () => {
  if (!isRGBCubeVisible() && imageData) {
    const centerX = Math.floor(imageData.width / 2);
    const centerY = Math.floor(imageData.height / 2);
    setRGBCubePosition(centerX, centerY);
  }
  toggleRGBCube();

  if (isRGBCubeVisible()) {
    showRGBCubeProperties();
  } else {
    hideRGBCubeProperties();
  }
});

document.getElementById('pointTransformButton')?.addEventListener('click', () => {
  const popup = document.getElementById('pointTransformPopup');
  if (popup) {
    if (popup.classList.contains('hidden')) {
      if (!loadedPPMImage) {
        alert('Najpierw wczytaj obraz (JPEG lub PPM)');
        return;
      }
      popup.classList.remove('hidden');
      const button = document.getElementById('pointTransformButton');
      if (button) {
        const rect = button.getBoundingClientRect();
        popup.style.top = `${rect.bottom + 5}px`;
        popup.style.left = `${rect.left}px`;
      }
    } else {
      popup.classList.add('hidden');
    }
  }
});

function applyPointTransform(transformFn: (imageData: ImageData, ...args: any[]) => ImageData, ...args: any[]) {
  if (!loadedPPMImage) {
    alert('Najpierw wczytaj obraz');
    return;
  }

  try {
    loadedPPMImage = transformFn(loadedPPMImage, ...args);
  } catch (error) {
    alert(`Błąd: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
  }
}

function setupPointTransforms() {
  setupTabSwitching();

  document.getElementById('addButton')?.addEventListener('click', () => {
    const input = document.getElementById('addValue') as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      alert('Podaj poprawną wartość');
      return;
    }
    applyPointTransform(addValue, value);
  });

  document.getElementById('subtractButton')?.addEventListener('click', () => {
    const input = document.getElementById('subtractValue') as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      alert('Podaj poprawną wartość');
      return;
    }
    applyPointTransform(subtractValue, value);
  });

  document.getElementById('multiplyButton')?.addEventListener('click', () => {
    const input = document.getElementById('multiplyValue') as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      alert('Podaj poprawną wartość');
      return;
    }
    applyPointTransform(multiplyValue, value);
  });

  document.getElementById('divideButton')?.addEventListener('click', () => {
    const input = document.getElementById('divideValue') as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      alert('Podaj poprawną wartość');
      return;
    }
    applyPointTransform(divideValue, value);
  });

  document.getElementById('brightnessButton')?.addEventListener('click', () => {
    const input = document.getElementById('brightnessValue') as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      alert('Podaj poprawną wartość');
      return;
    }
    applyPointTransform(changeBrightness, value);
  });

  document.getElementById('addButtonR')?.addEventListener('click', () => {
    const input = document.getElementById('addValueR') as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      alert('Podaj poprawną wartość');
      return;
    }
    applyPointTransform(addValueR, value);
  });

  document.getElementById('subtractButtonR')?.addEventListener('click', () => {
    const input = document.getElementById('subtractValueR') as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      alert('Podaj poprawną wartość');
      return;
    }
    applyPointTransform(subtractValueR, value);
  });

  document.getElementById('multiplyButtonR')?.addEventListener('click', () => {
    const input = document.getElementById('multiplyValueR') as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      alert('Podaj poprawną wartość');
      return;
    }
    applyPointTransform(multiplyValueR, value);
  });

  document.getElementById('divideButtonR')?.addEventListener('click', () => {
    const input = document.getElementById('divideValueR') as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      alert('Podaj poprawną wartość');
      return;
    }
    applyPointTransform(divideValueR, value);
  });

  document.getElementById('addButtonG')?.addEventListener('click', () => {
    const input = document.getElementById('addValueG') as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      alert('Podaj poprawną wartość');
      return;
    }
    applyPointTransform(addValueG, value);
  });

  document.getElementById('subtractButtonG')?.addEventListener('click', () => {
    const input = document.getElementById('subtractValueG') as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      alert('Podaj poprawną wartość');
      return;
    }
    applyPointTransform(subtractValueG, value);
  });

  document.getElementById('multiplyButtonG')?.addEventListener('click', () => {
    const input = document.getElementById('multiplyValueG') as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      alert('Podaj poprawną wartość');
      return;
    }
    applyPointTransform(multiplyValueG, value);
  });

  document.getElementById('divideButtonG')?.addEventListener('click', () => {
    const input = document.getElementById('divideValueG') as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      alert('Podaj poprawną wartość');
      return;
    }
    applyPointTransform(divideValueG, value);
  });

  document.getElementById('addButtonB')?.addEventListener('click', () => {
    const input = document.getElementById('addValueB') as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      alert('Podaj poprawną wartość');
      return;
    }
    applyPointTransform(addValueB, value);
  });

  document.getElementById('subtractButtonB')?.addEventListener('click', () => {
    const input = document.getElementById('subtractValueB') as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      alert('Podaj poprawną wartość');
      return;
    }
    applyPointTransform(subtractValueB, value);
  });

  document.getElementById('multiplyButtonB')?.addEventListener('click', () => {
    const input = document.getElementById('multiplyValueB') as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      alert('Podaj poprawną wartość');
      return;
    }
    applyPointTransform(multiplyValueB, value);
  });

  document.getElementById('divideButtonB')?.addEventListener('click', () => {
    const input = document.getElementById('divideValueB') as HTMLInputElement;
    const value = parseFloat(input.value);
    if (isNaN(value)) {
      alert('Podaj poprawną wartość');
      return;
    }
    applyPointTransform(divideValueB, value);
  });

  document.getElementById('grayscaleAverageButton')?.addEventListener('click', () => {
    applyPointTransform(toGrayscaleAverage);
  });

  document.getElementById('grayscaleLuminanceButton')?.addEventListener('click', () => {
    applyPointTransform(toGrayscaleLuminance);
  });
}

function setupTabSwitching() {
  const tabs = ['RGB', 'R', 'G', 'B', 'Gray'];
  const contents = ['contentRGB', 'contentR', 'contentG', 'contentB', 'contentGray'];

  tabs.forEach((tab, index) => {
    document.getElementById(`tab${tab}`)?.addEventListener('click', () => {
      tabs.forEach((t, i) => {
        const tabButton = document.getElementById(`tab${t}`);
        const content = document.getElementById(contents[i]);

        if (i === index) {
          tabButton?.classList.add('border-blue-500', 'text-blue-400');
          tabButton?.classList.remove('border-transparent', 'text-gray-400');
          content?.classList.remove('hidden');
        } else {
          tabButton?.classList.remove('border-blue-500', 'text-blue-400');
          tabButton?.classList.add('border-transparent', 'text-gray-400');
          content?.classList.add('hidden');
        }
      });
    });
  });
}

function init() {
  canvas = document.getElementById('maincanvas') as HTMLCanvasElement;
  graphics = canvas.getContext('2d', { willReadFrequently: true });

  offscreenCanvas = document.createElement('canvas');
  offscreenGraphics = offscreenCanvas.getContext('2d', { willReadFrequently: true })!;

  if (graphics && canvas) {
      imageData = graphics.createImageData(canvas.width, canvas.height);
      data = imageData.data;
      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;
  }

  mousePos(canvas);

  if (!graphics || !canvas || !imageData) return; 

  setupPixelDrawing(canvas, graphics, imageData);
  setupLineDrawing(canvas); 
  setupRectangleDrawing(canvas);
  setupCircleDrawing(canvas);
  setupSelection(canvas);
  initPropertiesPanel();
  setupColorPicker();
  setupRGBCube();
  setupPointTransforms();

  window.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault(); 
        isSpacebarPressed = true;
        if (canvas && !isPanning && mode >= 3) { 
             canvas.style.cursor = 'grab';
        }
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key === ' ' || event.code === 'Space') {
        isSpacebarPressed = false;
        if (canvas) {
            if (isPanning) {
                isPanning = false;
            }
            canvas.style.cursor = 'default';
        }
    }
});

  canvas.addEventListener('wheel', handleZoom, { passive: false });

  canvas.addEventListener('mousedown', (event) => {
    if (!canvas) return;

    if (isRGBCubeVisible()) {
      const rect = canvas.getBoundingClientRect();
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;
      const [worldX, worldY] = screenToWorld(screenX, screenY);

      const isPanTrigger = event.button === 1 || (event.button === 0 && isSpacebarPressed);

      if (isPanTrigger) {
        const cubeHandled = handleRGBCubePanStart(worldX, worldY);
        if (cubeHandled) {
          event.preventDefault();
          return; 
        }
      } else if (event.button === 0) {
        handleRGBCubeMouseDown(worldX, worldY);
      }
    }

    startPan(event);
  }, { passive: false });

  canvas.addEventListener('mousemove', (event) => {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const [worldX, worldY] = screenToWorld(screenX, screenY);

    if (isRGBCubeVisible() && isRGBCubePanning()) {
      handleRGBCubePanMove(worldX, worldY);
      return; 
    }

    const cubeRotating = isRGBCubeVisible() && handleRGBCubeMouseMove(worldX, worldY);
    if (!cubeRotating) {
      pan(event);
    }
  }, { passive: false });

  canvas.addEventListener('mouseup', (event) => {
    handleRGBCubeMouseUp();
    endPan(event);
  });

  canvas.addEventListener('mouseleave', (event) => {
    handleRGBCubeMouseUp();
    endPan(event);
  });

  document.getElementById('saveButton')?.addEventListener('click', saveDrawing);
  document.getElementById('saveJPEGButton')?.addEventListener('click', saveAsJPEG);
  const loadFileInput = document.getElementById('loadFileInput') as HTMLInputElement;
  document.getElementById('loadButton')?.addEventListener('click', () => {
      loadFileInput.click(); 
  });
  loadFileInput.addEventListener('change', loadFile);

  draw();
}

function draw(){
  if (!graphics || !canvas || !imageData || !offscreenCanvas || !offscreenGraphics) return;

  if (loadedPPMImage) {
    imageData.data.set(loadedPPMImage.data);
  } else {
    imageData.data.fill(255); 
  }

  drawLines(imageData.width, imageData.data);
  drawRectangles(imageData.width, imageData.data);
  drawCircles(imageData.width, imageData.data); 

  if (selectedShape && typeof selectedShape.getHandles === 'function') {
      const handles = selectedShape.getHandles();
      for (const handle of handles) {
          drawHandle(handle.x, handle.y, imageData.data, imageData.width);
      }
  }

  if (previewLine) {
    drawLineBresenham(previewLine.x1, previewLine.y1, previewLine.x2, previewLine.y2, imageData.width, imageData.data, previewLine.color);
  }
  if (previewRect) {
    const rect = previewRect;
    drawLineBresenham(rect.x1, rect.y1, rect.x1, rect.y2, imageData.width, imageData.data, rect.color); 
    drawLineBresenham(rect.x2, rect.y1, rect.x2, rect.y2, imageData.width, imageData.data, rect.color); 
    drawLineBresenham(rect.x1, rect.y1, rect.x2, rect.y1, imageData.width, imageData.data, rect.color);
    drawLineBresenham(rect.x1, rect.y2, rect.x2, rect.y2, imageData.width, imageData.data, rect.color); 
  }
  if (previewCircle) {
    drawCircleMidpoint(previewCircle.centerX, previewCircle.centerY, previewCircle.radius, imageData.width, imageData.data, previewCircle.color);
  }

  if (isRGBCubeVisible()) {
    const cubeImageData = renderRGBCube();
    if (cubeImageData) {
      drawRGBCubeToBuffer(cubeImageData, imageData.width, imageData.data);
    }
  }

  if (offscreenCanvas.width !== imageData.width || offscreenCanvas.height !== imageData.height) {
      offscreenCanvas.width = imageData.width;
      offscreenCanvas.height = imageData.height;
  }
  offscreenGraphics.putImageData(imageData, 0, 0);

  graphics.save();
  graphics.setTransform(1, 0, 0, 1, 0, 0);
  graphics.clearRect(0, 0, canvas.width, canvas.height);
  graphics.restore();

  graphics.setTransform(scale, 0, 0, scale, viewOffset.x, viewOffset.y);

  graphics.imageSmoothingEnabled = false;
  graphics.drawImage(offscreenCanvas, 0, 0);

  graphics.setTransform(1, 0, 0, 1, 0, 0);
  
  if (scale >= GRID_ZOOM_THRESHOLD) {
      drawPixelGrid();
  }

  requestAnimationFrame(draw);
}

function drawLines(bufferWidth: number, bufferData: Uint8ClampedArray){
  const lines = getLines();
  for (const line of lines) {
    drawLineBresenham(line.x1, line.y1, line.x2, line.y2, bufferWidth, bufferData, line.color);
  }
}

function drawRectangles(bufferWidth: number, bufferData: Uint8ClampedArray){
  const rectangles = getRectangles();
  for (const rect of rectangles) {
    drawLineBresenham(rect.x1, rect.y1, rect.x1, rect.y2, bufferWidth, bufferData, rect.color); 
    drawLineBresenham(rect.x2, rect.y1, rect.x2, rect.y2, bufferWidth, bufferData, rect.color); 
    drawLineBresenham(rect.x1, rect.y1, rect.x2, rect.y1, bufferWidth, bufferData, rect.color);
    drawLineBresenham(rect.x1, rect.y2, rect.x2, rect.y2, bufferWidth, bufferData, rect.color); 
  }
}

function drawCircles(bufferWidth: number, bufferData: Uint8ClampedArray){
  const circles = getCircles();
  for (const circle of circles) {
    drawCircleMidpoint(circle.centerX, circle.centerY, circle.radius, bufferWidth, bufferData, circle.color);
  }
}

function drawRGBCubeToBuffer(cubeImageData: ImageData, bufferWidth: number, bufferData: Uint8ClampedArray) {
  const cubePos = getRGBCubeWorldPosition();
  const cubeSize = getRGBCubeSize();
  const halfSize = Math.floor(cubeSize / 2);

  const startX = cubePos.x - halfSize;
  const startY = cubePos.y - halfSize;

  for (let y = 0; y < cubeSize; y++) {
    for (let x = 0; x < cubeSize; x++) {
      const worldX = startX + x;
      const worldY = startY + y;

      if (worldX < 0 || worldX >= bufferWidth || worldY < 0 || worldY >= Math.floor(bufferData.length / 4 / bufferWidth)) {
        continue;
      }

      const cubeIdx = (y * cubeSize + x) * 4;
      const bufferIdx = (worldY * bufferWidth + worldX) * 4;

      const alpha = cubeImageData.data[cubeIdx + 3];
      if (alpha > 10) {
        bufferData[bufferIdx] = cubeImageData.data[cubeIdx];
        bufferData[bufferIdx + 1] = cubeImageData.data[cubeIdx + 1];
        bufferData[bufferIdx + 2] = cubeImageData.data[cubeIdx + 2];
        bufferData[bufferIdx + 3] = 255;
      }
    }
  }
}

function saveDrawing() {
  const dataToSave = {
    lines: getLines(),
    rectangles: getRectangles(),
    circles: getCircles()
  };

  const jsonString = JSON.stringify(dataToSave, null, 2);

  const blob = new Blob([jsonString], { type: 'application/json' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'drawing.json'; 
  document.body.appendChild(a);
  a.click(); 

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function saveAsJPEG() {
    if (!canvas) return;
    
    const qualityInput = document.getElementById('jpegQuality') as HTMLInputElement;
    const quality = parseFloat(qualityInput.value);

    const dataUrl = canvas.toDataURL('image/jpeg', quality);

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `drawing-${Date.now()}.jpeg`; 
    document.body.appendChild(a);
    a.click(); 
    document.body.removeChild(a);
}

function loadFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    const extension = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();

    console.log(`Loading file: ${file.name}, ext: ${extension}`);

    switch (extension) {
        case 'json':
            reader.onload = (e) => {
                loadDrawing(e.target?.result as string);
            };
            reader.readAsText(file);
            break;

        case 'ppm':
            reader.onload = (e) => {
                const buffer = e.target?.result as ArrayBuffer;
                if (!buffer) return;

                const view = new Uint8Array(buffer, 0, 2);
                const magicNumber = String.fromCharCode(view[0], view[1]);
                
                let ppmData: PpmData | null = null;

                if (magicNumber === 'P3') {
                    const content = new TextDecoder().decode(buffer);
                    ppmData = parsePPMP3(content);
                } else if (magicNumber === 'P6') {
                    ppmData = parsePPMP6(buffer);
                } else {
                    alert(`Nieobsługiwany format PPM: ${magicNumber}`);
                    return;
                }
                
                if (ppmData) {
                    handleLoadedImage(ppmData);
                } else {
                    alert("Błąd podczas parsowania pliku PPM.");
                }
            };
            reader.readAsArrayBuffer(file);
            break;

        case 'jpg':
        case 'jpeg':
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setLines([]);
                    setRectangles([]);
                    setCircles([]);
                    
                    const ppmData: PpmData = {
                        width: img.width,
                        height: img.height,
                        maxColorValue: 255,
                        pixels: []
                    };
                    
                    handleLoadedImage(ppmData);

                    offscreenCanvas.width = img.width;
                    offscreenCanvas.height = img.height;
                    offscreenGraphics.drawImage(img, 0, 0);
                    loadedPPMImage = offscreenGraphics.getImageData(0, 0, img.width, img.height);
                    
                    console.log("JPEG loaded and set as background");
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
            break;

        default:
            alert("Nieobsługiwany format pliku. Wybierz .json, .ppm lub .jpeg");
            break;
    }

    input.value = '';
}

function handleLoadedImage(ppmData: PpmData) {
    if (!canvas || !graphics || !imageData) return;

    setLines([]);
    setRectangles([]);
    setCircles([]);
    
    console.log("6. Image dimensions:", ppmData.width, "x", ppmData.height);
    
    imageData = graphics.createImageData(ppmData.width, ppmData.height);
    data = imageData.data;
    
    offscreenCanvas.width = ppmData.width;
    offscreenCanvas.height = ppmData.height;

    setScale(1);
    setViewOffset(0, 0);

    console.log("8. World buffer resized to:", ppmData.width, "x", ppmData.height);
    
    if (ppmData.pixels.length > 0) {
        const ppmImageData = graphics.createImageData(ppmData.width, ppmData.height);
        ppmImageData.data.fill(255); 
        
        for (let y = 0; y < ppmData.height; y++) {
            for (let x = 0; x < ppmData.width; x++) {
                const pixelIndex = y * ppmData.width + x;
                if (pixelIndex >= ppmData.pixels.length) continue;
                
                const pixel = ppmData.pixels[pixelIndex];
                if (!pixel) continue;

                const actualIndex = (y * ppmData.width + x) * 4;
                
                const r_norm = (pixel.r / ppmData.maxColorValue) * 255;
                const g_norm = (pixel.g / ppmData.maxColorValue) * 255;
                const b_norm = (pixel.b / ppmData.maxColorValue) * 255;
                
                ppmImageData.data[actualIndex] = r_norm;
                ppmImageData.data[actualIndex + 1] = g_norm;
                ppmImageData.data[actualIndex + 2] = b_norm;
                ppmImageData.data[actualIndex + 3] = 255;
            }
        }
        loadedPPMImage = ppmImageData;
    } else {
        loadedPPMImage = null;
    }
}

function loadDrawing(jsonString: string) {
  try {
    var data = JSON.parse(jsonString);

    if (!data || !Array.isArray(data.lines) || !Array.isArray(data.rectangles) || !Array.isArray(data.circles)) {
      throw new Error("Wrong JSON format");
    }

    const newLines = data.lines.map((obj: any) => 
      new Line(obj.x1, obj.y1, obj.x2, obj.y2, obj.color)
    );

    const newRects = data.rectangles.map((obj: any) => 
      new Rectangle(obj.x1, obj.y1, obj.x2, obj.y2, obj.color)
    );

    const newCircles = data.circles.map((obj: any) => 
      new Circle(obj.centerX, obj.centerY, obj.radius, obj.color)
    );

    setLines(newLines);
    setRectangles(newRects);
    setCircles(newCircles);
    loadedPPMImage = null; 
    
    if (canvas && graphics && imageData) {
        const defaultWidth = 1280;
        const defaultHeight = 860;
        
        canvas.width = defaultWidth;
        canvas.height = defaultHeight; 
        
        imageData = graphics.createImageData(defaultWidth, defaultHeight);
        data = imageData.data;
        
        offscreenCanvas.width = defaultWidth;
        offscreenCanvas.height = defaultHeight;
        
        setScale(1); 
        setViewOffset(0, 0);
    }

  } catch (error) {
    alert("Failed to load file. Please ensure it is a valid JSON file with a drawing.");
  }
}

function handleZoom(event: WheelEvent) {
    event.preventDefault();
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;

    const [worldX, worldY] = screenToWorld(screenX, screenY);
    
    const zoomFactor = 1.1;
    const newScale = event.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor;
    const clampedScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));

    const newOffsetX = screenX - worldX * clampedScale;
    const newOffsetY = screenY - worldY * clampedScale;

    setScale(clampedScale);
    setViewOffset(newOffsetX, newOffsetY);
}

function startPan(event: MouseEvent) {
    const isPanTrigger = event.button === 1 || (event.button === 0 && isSpacebarPressed);
    
    if (!isPanTrigger) return;

    if (isSpacebarPressed && mode < 3) return;

    event.preventDefault();
    isPanning = true;
    lastPanX = event.clientX;
    lastPanY = event.clientY;
    if (canvas) canvas.style.cursor = 'grabbing';
}

function pan(event: MouseEvent) {
    if (!isPanning) return;
    event.preventDefault();
    
    const dx = event.clientX - lastPanX;
    const dy = event.clientY - lastPanY;

    updateViewOffset(dx, dy);

    lastPanX = event.clientX;
    lastPanY = event.clientY;
}

function endPan(event: MouseEvent) {
    if (!isPanning) return;

    const isPanRelease = event.type === 'mouseup' && (event.button === 1 || event.button === 0);
    
    if (isPanRelease || event.type === 'mouseleave') {
        isPanning = false;
        if (canvas) {
            canvas.style.cursor = isSpacebarPressed ? 'grab' : 'default';
        }
    }
}

function drawPixelGrid() {
    if (!graphics || !canvas || !imageData) return;

    graphics.font = `${Math.min(10, Math.max(4, scale / 2.5))}px Arial`;
    graphics.strokeStyle = 'rgba(0, 0, 0, 0.2)';

    const [worldXStart, worldYStart] = screenToWorld(0, 0);
    const [worldXEnd, worldYEnd] = screenToWorld(canvas.width, canvas.height);

    for (let y = worldYStart; y <= worldYEnd + 1; y++) {
        for (let x = worldXStart; x <= worldXEnd + 1; x++) {
            const [screenX, screenY] = worldToScreen(x, y);

            graphics.strokeRect(screenX, screenY, scale, scale);
            
            const index = (y * imageData.width + x) * 4;
            if (index < 0 || index + 2 >= imageData.data.length) continue;
            
            const r = imageData.data[index];
            const g = imageData.data[index + 1];
            const b = imageData.data[index + 2];
            
            if (scale > 20) {
              const textYOffset = scale / 5;
              const textXOffset = scale / 10;
              graphics.fillStyle = 'red';
              graphics.fillText(`${r}`, screenX + textXOffset, screenY + textYOffset * 2);
              graphics.fillStyle = 'green';
              graphics.fillText(`${g}`, screenX + textXOffset, screenY + textYOffset * 3);
              graphics.fillStyle = 'blue';
              graphics.fillText(`${b}`, screenX + textXOffset, screenY + textYOffset * 4);
            }
        }
    }
}

window.onload = init;