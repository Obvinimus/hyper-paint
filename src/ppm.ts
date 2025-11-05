import './state.ts';


export function parsePPMP3(data: string) {
    console.log("parsePPMP3: Starting parse, data length:", data.length);
    const tokens = data.replace(/#.*$/gm, '').trim().split(/\s+/);
    console.log("parsePPMP3: Total tokens found:", tokens.length);

    if (tokens[0] !== 'P3') {
        console.error("Unsupported PPM format:", tokens[0]);
        return null
    }

    const width = Number(tokens[1]);
    const height = Number(tokens[2]);
    const maxColorValue = Number(tokens[3]);

    if (isNaN(width) || isNaN(height) || isNaN(maxColorValue) || width <= 0 || height <= 0) {
         console.error("Failed to parse header. Width:", width, "Height:", height, "Max color:", maxColorValue);
         return null;
    }

    console.log("parsePPMP3: Width:", width, "Height:", height, "Max color:", maxColorValue);

    const pixels: { r: number; g: number; b: number }[] = [];
    
    const pixelValues = tokens.slice(4);
    console.log("parsePPMP3: Pixel values strings count:", pixelValues.length);

    const expectedPixelCount = width * height * 3;
    if(pixelValues.length < expectedPixelCount) {
        console.warn(`Warning: Pixel data is incomplete. Expected ${expectedPixelCount}, found ${pixelValues.length}`);
    }

    for (let i = 0; i + 2 < pixelValues.length; i += 3) {
        if (pixels.length >= width * height) {
             break;
        }

        const r = Number(pixelValues[i]);
        const g = Number(pixelValues[i+1]);
        const b = Number(pixelValues[i+2]);

        if (isNaN(r) || isNaN(g) || isNaN(b)) {
            console.error("Non-numeric pixel value encountered at index", i);
            continue; 
        }

        if (r > maxColorValue || g > maxColorValue || b > maxColorValue) {
            console.error("Color value exceeds max color value");
        }
        
        pixels.push({ r, g, b });
    }

    console.log("parsePPMP3: Total pixels parsed:", pixels.length);
    return { width, height, maxColorValue, pixels };
}