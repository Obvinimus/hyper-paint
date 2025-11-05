export let currentColor: string = "#ff0000";
export let scale: number = 1;
export let viewOffset = { x: 0, y: 0 };

export type Handle = {
    id: string; 
    x: number;
    y: number;
}

export function setScale(newScale: number) {
  scale = newScale;
}

export function setViewOffset(x: number, y: number) {
  viewOffset.x = x;
  viewOffset.y = y;
}

export function updateViewOffset(dx: number, dy: number) {
  viewOffset.x += dx;
  viewOffset.y += dy;
}


export let mode: number = 3; 

export function setMode(newMode: number) {
  mode = newMode;
}
export function setColor(newColor: string) {
  currentColor = newColor;
}