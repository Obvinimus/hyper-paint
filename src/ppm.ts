import './state.ts';


export type PpmData = {
    width: number;
    height: number;
    maxColorValue: number;
    pixels: { r: number; g: number; b: number }[];
};

export function parsePPMP3(data: string): PpmData | null {
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

function parseP6Header(view: Uint8Array): {
    width: number;
    height: number;
    maxColorValue: number;
    dataStartIndex: number;
} | null {
    let headerTokens: string[] = []; 
    let currentToken = "";
    let i = 2; 

    while (i < view.length && /\s/.test(String.fromCharCode(view[i]))) {
        i++;
    }

    while (headerTokens.length < 3 && i < view.length) {
        const char = String.fromCharCode(view[i]);

        if (char === '#') {
            while (i < view.length && String.fromCharCode(view[i]) !== '\n') {
                i++;
            }
            i++;
            continue;
        }

        if (/\s/.test(char)) {
            if (currentToken.length > 0) {
                headerTokens.push(currentToken);
            }
            currentToken = "";
        } else {
            currentToken += char;
        }
        i++;
    }

    if (currentToken.length > 0 && headerTokens.length < 3) {
        headerTokens.push(currentToken);
    }
    if (headerTokens.length < 3) {
         console.error("P6 Error: Incomplete header.");
         return null;
    }

    const dataStartIndex = i; 

    const width = Number(headerTokens[0]);
    const height = Number(headerTokens[1]);
    const maxColorValue = Number(headerTokens[2]);

    if (isNaN(width) || isNaN(height) || isNaN(maxColorValue) || width <= 0 || height <= 0) {
         console.error("P6 Error: Invalid header values. W:", width, "H:", height, "Max:", maxColorValue);
         return null;
    }

    return { width, height, maxColorValue, dataStartIndex };
}

export function parsePPMP6(buffer: ArrayBuffer): PpmData | null {
    console.log("parsePPMP6: Starting parse, data length:", buffer.byteLength);
    const view = new Uint8Array(buffer);
    
    const header = parseP6Header(view);
    if (!header) {
        return null;
    }

    const { width, height, maxColorValue, dataStartIndex } = header;
    console.log("parsePPMP6: Width:", width, "Height:", height, "Max color:", maxColorValue);
    
    const pixels: { r: number; g: number; b: number }[] = [];
    const numPixelsToRead = width * height;

    if (maxColorValue <= 255) {
        const pixelData = new Uint8Array(buffer, dataStartIndex);
        const expectedBytes = numPixelsToRead * 3;
        
        if (pixelData.length < expectedBytes) {
             console.warn(`P6 Warning: Incomplete pixel data. Expected ${expectedBytes}, found ${pixelData.length}`);
        }

        for (let i = 0; i < pixelData.length && pixels.length < numPixelsToRead; i += 3) {
            pixels.push({ r: pixelData[i], g: pixelData[i + 1], b: pixelData[i + 2] });
        }
    } else {
        const pixelDataView = new DataView(buffer, dataStartIndex);
        const bytesPerChannel = 2;
        const bytesPerPixel = 3 * bytesPerChannel;
        const expectedBytes = numPixelsToRead * bytesPerPixel;

        if (pixelDataView.byteLength < expectedBytes) {
             console.warn(`P6 Warning: Incomplete pixel data. Expected ${expectedBytes}, found ${pixelDataView.byteLength}`);
        }

        for (let i = 0; i < numPixelsToRead; i++) {
            const offset = i * bytesPerPixel;
            if (offset + 5 >= pixelDataView.byteLength) {
                 break; 
            }
            
            const r = pixelDataView.getUint16(offset, false); 
            const g = pixelDataView.getUint16(offset + 2, false);
            const b = pixelDataView.getUint16(offset + 4, false);
            pixels.push({ r, g, b });
        }
    }

    console.log("parsePPMP6: Total pixels parsed:", pixels.length);
    return { width, height, maxColorValue, pixels };
}