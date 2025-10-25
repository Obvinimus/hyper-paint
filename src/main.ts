import './style.css'
import './line.ts'
import { setupPixelDrawing } from './pentool.ts';
import { mode, currentColor, setColor, setMode } from './state.ts';

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
  imageData = graphics?.getImageData(0, 0, canvas.width, canvas.height);
  data = imageData?.data;
  mousePos(canvas);
  if(mode == 3){
    if (!graphics || !canvas) return;
    setupPixelDrawing(canvas, graphics, imageData!);
  }
  draw();
}

function draw(){
  requestAnimationFrame(draw);
} 

window.onload = init;