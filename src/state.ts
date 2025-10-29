export let currentColor: string = "#ff0000";

export type Handle = {
    id: string; 
    x: number;
    y: number;
}


export let mode: number = 3; 

export function setMode(newMode: number) {
  mode = newMode;
}
export function setColor(newColor: string) {
  currentColor = newColor;
}