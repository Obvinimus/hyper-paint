import './style.css'

let graphics: CanvasRenderingContext2D | null;
let canvas: HTMLCanvasElement | null;



function init() {
  canvas = document.getElementById('maincanvas') as HTMLCanvasElement;
  graphics = canvas.getContext('2d');
  draw();
}

function draw(){
  graphics?.fillText("Hello World!", 10, 50);
}

window.onload = init;
