import './style.css'
import './line.ts'
import { getLines, setupLineDrawing, isDrawing, startX, startY } from './line.ts';

let graphics: CanvasRenderingContext2D | null;
let canvas: HTMLCanvasElement | null;
export let mode = 0;
export let currentMousePos: [number, number];
export let currentColor = '#000000';

const colorPicker = document.getElementById('colorPicker') as HTMLInputElement;
colorPicker.addEventListener('input', (event) => {
  currentColor = (event.target as HTMLInputElement).value;
});

function mousePos(canvas: HTMLCanvasElement) {
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    currentMousePos = [x, y];
});
}

function setMode(newMode: number) {
  mode = newMode;
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


function init() {
  canvas = document.getElementById('maincanvas') as HTMLCanvasElement;
  graphics = canvas.getContext('2d');
  mousePos(canvas);
  if(mode == 0){
    
    setupLineDrawing(canvas);
  }
  draw();
}

function drawLines(){
  if (!graphics) return;
  if (isDrawing) { 
    graphics.strokeStyle = currentColor; 
    graphics.beginPath();
    graphics.moveTo(startX, startY);
    graphics.lineTo(currentMousePos[0], currentMousePos[1]);
    graphics.stroke();
  }
}

function draw(){
  if (!graphics || !canvas) return;
  graphics.fillStyle = 'white';
  graphics.fillRect(0, 0, canvas.width, canvas.height);
  for (const line of getLines()) {
    graphics.strokeStyle = line.color;
    graphics.beginPath();
    graphics.moveTo(line.x1, line.y1);
    graphics.lineTo(line.x2, line.y2);
    graphics.stroke();
  }
  if(mode == 0) {
    drawLines();
  }
  requestAnimationFrame(draw);
} 

window.onload = init;