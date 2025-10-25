import './pixel.ts'
import { changePixelColor } from './pixel.ts';
import { mode, currentColor } from './state.ts';

export function setupPixelDrawing(canvas: HTMLCanvasElement, graphics: CanvasRenderingContext2D, imageData: ImageData) {
  canvas.addEventListener('click', (event) => {
    if(mode != 3) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);
    if (!canvas) return;
    if (!graphics) return;
    const data = imageData.data;
    changePixelColor(x, y, canvas.width, data, currentColor);
    graphics.putImageData(imageData, 0, 0);
  });
}