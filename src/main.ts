import './style.css'
import './line.ts'
import { getLines, setupLineDrawing, isDrawing, startX, startY } from './line.ts';

let graphics: CanvasRenderingContext2D | null;
let canvas: HTMLCanvasElement | null;
export let mode = 0;
export let currentMousePos: [number, number];

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
    graphics.strokeStyle = 'red'; 
    graphics.beginPath();
    graphics.moveTo(startX, startY);
    graphics.lineTo(currentMousePos[0], currentMousePos[1]);
    graphics.stroke();
  }
}

function draw(){
  if (!graphics || !canvas) return;
  graphics.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of getLines()) {
    graphics.beginPath();
    graphics.moveTo(line[0], line[1]);
    graphics.lineTo(line[2], line[3]);
    graphics.stroke();
  }
  if(mode == 0) {
    drawLines();
  }
  requestAnimationFrame(draw);
} 

window.onload = init;