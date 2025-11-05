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