import './state.ts';


export function parsePPMP3(data: string){
    console.log("parsePPMP3: Starting parse, data length:", data.length);
    const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0 && !line.startsWith('#'));
    console.log("parsePPMP3: Lines count:", lines.length);
    console.log("parsePPMP3: First line:", lines[0]);
    
    if (lines[0] !== 'P3') {
        console.error("Unsupported PPM format:", lines[0]);
        return null;
    }
    const [width, height] = lines[1].split(' ').map(Number);
    const maxColorValue = Number(lines[2]);
    console.log("parsePPMP3: Width:", width, "Height:", height, "Max color:", maxColorValue);
    
    const pixels: { r: number; g: number; b: number }[] = [];
    const pixelValues = lines.slice(3).join(' ').split(/\s+/).map(Number);
    console.log("parsePPMP3: Pixel values count:", pixelValues.length);
    
    for (let i = 0; i < pixelValues.length; i += 3) {
        if(pixelValues[i] > maxColorValue || pixelValues[i+1] > maxColorValue || pixelValues[i+2] > maxColorValue){
            console.error("Color value exceeds max color value");
            return null;
        }
        pixels.push({
            r: pixelValues[i],
            g: pixelValues[i+1],
            b: pixelValues[i+2]
        });
    }
    console.log("parsePPMP3: Total pixels parsed:", pixels.length);
    return { width, height, maxColorValue, pixels };
}

export function drawPPMOnCanvas(canvas: HTMLCanvasElement, ppmData: { width: number; height: number; maxColorValue: number; pixels: { r: number; g: number; b: number }[] }) {
    console.log("drawPPMOnCanvas: Starting draw");
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Failed to get canvas context");
        return;
    }
    const imageData = ctx.createImageData(ppmData.width, ppmData.height);
    const canvasData = imageData.data;
    console.log("drawPPMOnCanvas: ImageData created, length:", canvasData.length);
    
    let canvasIndex = 0; 
    for (let i = 0; i < ppmData.pixels.length; i++) {
        const pixel = ppmData.pixels[i];
        const r_norm = (pixel.r / ppmData.maxColorValue) * 255;
        const g_norm = (pixel.g / ppmData.maxColorValue) * 255;
        const b_norm = (pixel.b / ppmData.maxColorValue) * 255;
        canvasData[canvasIndex]     = r_norm;
        canvasData[canvasIndex + 1] = g_norm;
        canvasData[canvasIndex + 2] = b_norm; 
        canvasData[canvasIndex + 3] = 255;
        
        canvasIndex += 4;
    }
    console.log("drawPPMOnCanvas: Putting image data");
    ctx.putImageData(imageData, 0, 0);
    console.log("drawPPMOnCanvas: Done");
}