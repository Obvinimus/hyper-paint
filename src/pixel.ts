function indexCal(x: number, y: number, width: number): number | null {
  const intX = Math.round(x);
  const intY = Math.round(y);
  
  if (intX < 0 || intX >= width) return null;
  if (intY < 0) return null; 
  
  return (intY * width + intX) * 4;
}

export function changePixelColor(x: number, y: number, width: number, data: Uint8ClampedArray, color: string) {
  const index = indexCal(x, y, width);
  
  if (index === null || index + 3 >= data.length) {
    return;
  }
  
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  data[index] = r;
  data[index + 1] = g;
  data[index + 2] = b;
  data[index + 3] = 255;
}