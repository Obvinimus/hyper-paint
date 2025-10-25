import './style.css'
import { getLines, setupLineDrawing, drawLineBresenham } from './line.ts';
import { setupPixelDrawing } from './pentool.ts';
import { mode, currentColor, setColor, setMode } from './state.ts';
import { setupRectangleDrawing, getRectangles } from './rectangle.ts';

let graphics: CanvasRenderingContext2D | null;
let canvas: HTMLCanvasElement | null;
let imageData: ImageData | undefined;
let data: Uint8ClampedArray | undefined;
export let currentMousePos: [number, number];

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
});

document.getElementById('rectTool')?.addEventListener('click', () => {
  setMode(1);
});

document.getElementById('circleTool')?.addEventListener('click', () => {
  setMode(2);
});

document.getElementById('pencilTool')?.addEventListener('click', () => {
  setMode(3);
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
  setupLineDrawing(canvas, imageData); 
  setupRectangleDrawing(canvas, imageData);

  draw();
}

function draw(){
  if (!graphics || !canvas || !imageData) return;
  drawLines();
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
    drawLineBresenham(rect.left.x1, rect.left.y1, rect.left.x2, rect.left.y2, canvas!, imageData!.data, rect.left.color);
    drawLineBresenham(rect.right.x1, rect.right.y1, rect.right.x2, rect.right.y2, canvas!, imageData!.data, rect.right.color);
    drawLineBresenham(rect.top.x1, rect.top.y1, rect.top.x2, rect.top.y2, canvas!, imageData!.data, rect.top.color);
    drawLineBresenham(rect.bottom.x1, rect.bottom.y1, rect.bottom.x2, rect.bottom.y2, canvas!, imageData!.data, rect.bottom.color);
  }
}

window.onload = init;