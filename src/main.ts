import './style.css'
import { setupPixelDrawing } from './pentool.ts';
import { setColor, setMode } from './state.ts';
import { setupSelection, selectedShape, drawHandle } from './grabtool.ts';
import { getLines, setupLineDrawing, drawLineBresenham, previewLine, setLines, Line } from './line.ts';
import { setupRectangleDrawing, getRectangles, previewRect, setRectangles, Rectangle } from './rectangle.ts';
import { setupCircleDrawing, getCircles, drawCircleMidpoint, previewCircle, setCircles, Circle } from './circle.ts';
import { initPropertiesPanel, updatePropertiesPanel } from './properties.ts';
import {  parsePPMP3, parsePPMP6 } from './ppm.ts';


let graphics: CanvasRenderingContext2D | null;
let canvas: HTMLCanvasElement | null;
let imageData: ImageData | undefined;
let data: Uint8ClampedArray | undefined;
export let currentMousePos: [number, number];
let loadedPPMImage: ImageData | null = null;

const colorPicker = document.getElementById('colorPicker') as HTMLInputElement;
colorPicker.addEventListener('input', (event) => {
    setColor(colorPicker.value);
});



function mousePos(canvas: HTMLCanvasElement) {
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    currentMousePos = [x, y];
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


function init() {
  canvas = document.getElementById('maincanvas') as HTMLCanvasElement;
  graphics = canvas.getContext('2d');
  
  if (graphics) {
      imageData = graphics.createImageData(canvas.width, canvas.height);
      data = imageData.data;
  }
  
  mousePos(canvas);

  if (!graphics || !canvas || !imageData) return; 

  setupPixelDrawing(canvas, graphics, imageData);
  setupLineDrawing(canvas); 
  setupRectangleDrawing(canvas);
  setupCircleDrawing(canvas);
  setupSelection(canvas);
  initPropertiesPanel();

  document.getElementById('saveButton')?.addEventListener('click', saveDrawing);
  
  const loadInput = document.getElementById('loadInput') as HTMLInputElement;
  document.getElementById('loadButton')?.addEventListener('click', () => {
      loadInput.click(); 
  });
  loadInput.addEventListener('change', loadDrawing);

const loadPPMInput = document.getElementById('loadPPMInput') as HTMLInputElement;
  document.getElementById('loadPPM')?.addEventListener('click', () => {
      loadPPMInput.click();
  });

loadPPMInput.addEventListener('change', (event) => {
    console.log("1. Change event triggered");
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
        console.log("2. No files selected");
        return;
    }
    
    const file = input.files[0];
    console.log("3. File selected:", file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        if (!buffer) {
            alert("Nie udało się wczytać pliku.");
            return;
        }
        console.log("4. File loaded, length:", buffer.byteLength);

        const view = new Uint8Array(buffer, 0, 2);
        const magicNumber = String.fromCharCode(view[0], view[1]);

        let ppmData;

        if (magicNumber === 'P3') {
            console.log("Detected PPM P3 (ASCII)");
            const content = new TextDecoder().decode(buffer);
            ppmData = parsePPMP3(content); 
        } else if (magicNumber === 'P6') {
            console.log("Detected PPM P6 (Binary)");
            ppmData = parsePPMP6(buffer); 
        } else {
            alert(`Nieobsługiwany format pliku PPM: ${magicNumber}`);
            return;
        }

        console.log("5. PPM data parsed:", ppmData);
        
        if (!ppmData) {
            alert("Nieprawidłowy format pliku PPM lub błąd parsowania.");
            return;
        }
        
        console.log("6. PPM dimensions:", ppmData.width, "x", ppmData.height);
        console.log("7. Canvas before:", canvas!.width, "x", canvas!.height);
        
        canvas!.width = ppmData.width;
        canvas!.height = ppmData.height;
        
        imageData = graphics!.createImageData(canvas!.width, canvas!.height);
        console.log("8. Canvas resized to:", canvas!.width, "x", canvas!.height);
        

        const ppmImageData = graphics!.createImageData(canvas!.width, canvas!.height);
        ppmImageData.data.fill(255); 
        
        for (let y = 0; y < ppmData.height; y++) {
            for (let x = 0; x < ppmData.width; x++) {
                const pixelIndex = y * ppmData.width + x;
                if (pixelIndex >= ppmData.pixels.length) continue; 
                
                const pixel = ppmData.pixels[pixelIndex];
                
                const actualIndex = (y * canvas!.width + x) * 4;
                
                const r_norm = (pixel.r / ppmData.maxColorValue) * 255;
                const g_norm = (pixel.g / ppmData.maxColorValue) * 255;
                const b_norm = (pixel.b / ppmData.maxColorValue) * 255;
                
                ppmImageData.data[actualIndex] = r_norm;
                ppmImageData.data[actualIndex + 1] = g_norm;
                ppmImageData.data[actualIndex + 2] = b_norm;
                ppmImageData.data[actualIndex + 3] = 255;
            }
        }
        
        console.log("9. PPM saved to loadedPPMImage");
        loadedPPMImage = ppmImageData;
    };
    
    reader.readAsArrayBuffer(file); 
    input.value = '';
});


draw();
}

function draw(){
  if (!graphics || !canvas || !imageData) return;

  if (loadedPPMImage) {
    imageData.data.set(loadedPPMImage.data);
  } else {
    imageData.data.fill(255); 
  }

  drawLines();
  drawRectangles();
  drawCircles(); 

  if (selectedShape && typeof selectedShape.getHandles === 'function') {
      const handles = selectedShape.getHandles();
      for (const handle of handles) {
          drawHandle(handle.x, handle.y, imageData.data, canvas.width);
      }
  }

  if (previewLine) {
    drawLineBresenham(previewLine.x1, previewLine.y1, previewLine.x2, previewLine.y2, canvas, imageData.data, previewLine.color);
  }
  if (previewRect) {
    const rect = previewRect;
    drawLineBresenham(rect.x1, rect.y1, rect.x1, rect.y2, canvas, imageData.data, rect.color); 
    drawLineBresenham(rect.x2, rect.y1, rect.x2, rect.y2, canvas, imageData.data, rect.color); 
    drawLineBresenham(rect.x1, rect.y1, rect.x2, rect.y1, canvas, imageData.data, rect.color);
    drawLineBresenham(rect.x1, rect.y2, rect.x2, rect.y2, canvas, imageData.data, rect.color); 
  }
  if (previewCircle) {
    drawCircleMidpoint(previewCircle.centerX, previewCircle.centerY, previewCircle.radius, canvas, imageData.data, previewCircle.color);
  }

  graphics.putImageData(imageData, 0, 0);
  requestAnimationFrame(draw);
}

function drawLines(){
  const lines = getLines();
  for (const line of lines) {
    drawLineBresenham(line.x1, line.y1, line.x2, line.y2, canvas!, imageData!.data, line.color);
  }
}

function drawRectangles(){
  const rectangles = getRectangles();
  for (const rect of rectangles) {
    drawLineBresenham(rect.x1, rect.y1, rect.x1, rect.y2, canvas!, imageData!.data, rect.color); 
    drawLineBresenham(rect.x2, rect.y1, rect.x2, rect.y2, canvas!, imageData!.data, rect.color); 
    drawLineBresenham(rect.x1, rect.y1, rect.x2, rect.y1, canvas!, imageData!.data, rect.color);
    drawLineBresenham(rect.x1, rect.y2, rect.x2, rect.y2, canvas!, imageData!.data, rect.color); 
  }
}

function drawCircles(){
  const circles = getCircles();
  for (const circle of circles) {
    drawCircleMidpoint(circle.centerX, circle.centerY, circle.radius, canvas!, imageData!.data, circle.color);
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

function loadDrawing(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) {
    return; 
  }

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const jsonString = e.target?.result as string;
      const data = JSON.parse(jsonString);

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


    } catch (error) {
      alert("Failed to load file. Please ensure it is a valid JSON file with a drawing.");
    }
  };

  reader.readAsText(file);

  input.value = '';
}


window.onload = init;