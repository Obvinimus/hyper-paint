import './pixel.ts'
import { changePixelColor } from './pixel.ts';
import { mode, currentColor } from './state.ts';
import { screenToWorld } from './coords.ts'; 

export function setupPixelDrawing(canvas: HTMLCanvasElement, graphics: CanvasRenderingContext2D, imageData: ImageData) {
  
  let isPenDrawing = false;

  const drawPixel = (event: MouseEvent) => {
    if (mode != 3 || !imageData) return;
    
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const [worldX, worldY] = screenToWorld(screenX, screenY);

    changePixelColor(worldX, worldY, imageData.width, imageData.data, currentColor);
    
  };

  canvas.addEventListener('mousedown', (event) => {
    if (mode != 3 || event.button !== 0) return;
    isPenDrawing = true;
    drawPixel(event); 
  });
  
  canvas.addEventListener('mousemove', (event) => {
    if (!isPenDrawing || mode != 3) return;
    drawPixel(event); 
  });

  canvas.addEventListener('mouseup', (event) => {
    if (event.button !== 0) return;
    isPenDrawing = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isPenDrawing = false;
  });
}