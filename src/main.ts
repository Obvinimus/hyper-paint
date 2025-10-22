import './style.css'

let graphics: CanvasRenderingContext2D | null;
let canvas: HTMLCanvasElement | null;
let currentMousePos: [number, number];

function mousePos(canvas: HTMLCanvasElement) {
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    currentMousePos = [x, y];
    console.log("Mouse position: " + x + ", " + y);
});
}

function mouseClick(canvas: HTMLCanvasElement) {
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    if (graphics){
      graphics.fillStyle = 'red';
      graphics.fillRect(clickX - 5, clickY - 5, 10, 10);
    }

    console.log("Mouse click at: " + clickX + ", " + clickY);
})};


function init() {
  canvas = document.getElementById('maincanvas') as HTMLCanvasElement;
  graphics = canvas.getContext('2d');
  mousePos(canvas);
  mouseClick(canvas);
  draw();
}

function draw(){
  graphics?.fillText("Hello World!", 10, 50);
}

window.onload = init;