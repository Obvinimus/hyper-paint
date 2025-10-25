function indexCal(x: number, y: number, width: number) {
  return (y * width + x) * 4;
}
export function changePixelColor(x: number, y: number, width: number, data: Uint8ClampedArray, color: string) {
  const index = indexCal(x, y, width);
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  data[index] = r;
  data[index + 1] = g;
  data[index + 2] = b;
  data[index + 3] = 255;
}