import { scale, viewOffset } from './state';

export function screenToWorld(x: number, y: number): [number, number] {
  const worldX = (x - viewOffset.x) / scale;
  const worldY = (y - viewOffset.y) / scale;
  return [Math.floor(worldX), Math.floor(worldY)];
}


export function worldToScreen(x: number, y: number): [number, number] {
  const screenX = (x * scale) + viewOffset.x;
  const screenY = (y * scale) + viewOffset.y;
  return [screenX, screenY];
}