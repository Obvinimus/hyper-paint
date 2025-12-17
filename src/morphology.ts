// Morphological operations for binary images
// Structuring Element: 2D array where 1 = active, 0 = ignore, -1 = must be background (for hit-or-miss)

function getPixel(data: Uint8ClampedArray, width: number, height: number, x: number, y: number): number {
    if (x < 0 || x >= width || y < 0 || y >= height) {
        return 0; // Background (black) for out of bounds
    }
    const index = (y * width + x) * 4;
    // Convert to grayscale and binarize
    const gray = 0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
    return gray > 127 ? 1 : 0;
}

// Get center of structuring element
function getSECenter(se: number[][]): { cx: number; cy: number } {
    return {
        cx: Math.floor(se[0].length / 2),
        cy: Math.floor(se.length / 2)
    };
}

// Dilation: output pixel is 1 if ANY pixel in SE neighborhood is 1
export function dilation(imageData: ImageData, structuringElement: number[][]): ImageData {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data.length);
    newData.fill(255);

    const seHeight = structuringElement.length;
    const seWidth = structuringElement[0].length;
    const { cx, cy } = getSECenter(structuringElement);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let dilated = 0;

            for (let sy = 0; sy < seHeight && !dilated; sy++) {
                for (let sx = 0; sx < seWidth && !dilated; sx++) {
                    if (structuringElement[sy][sx] === 1) {
                        const nx = x + sx - cx;
                        const ny = y + sy - cy;
                        if (getPixel(data, width, height, nx, ny) === 1) {
                            dilated = 1;
                        }
                    }
                }
            }

            const index = (y * width + x) * 4;
            const color = dilated ? 255 : 0;
            newData[index] = color;
            newData[index + 1] = color;
            newData[index + 2] = color;
            newData[index + 3] = 255;
        }
    }

    return new ImageData(newData, width, height);
}

// Erosion: output pixel is 1 only if ALL pixels in SE neighborhood are 1
export function erosion(imageData: ImageData, structuringElement: number[][]): ImageData {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data.length);
    newData.fill(255);

    const seHeight = structuringElement.length;
    const seWidth = structuringElement[0].length;
    const { cx, cy } = getSECenter(structuringElement);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let eroded = 1;

            for (let sy = 0; sy < seHeight && eroded; sy++) {
                for (let sx = 0; sx < seWidth && eroded; sx++) {
                    if (structuringElement[sy][sx] === 1) {
                        const nx = x + sx - cx;
                        const ny = y + sy - cy;
                        if (getPixel(data, width, height, nx, ny) === 0) {
                            eroded = 0;
                        }
                    }
                }
            }

            const index = (y * width + x) * 4;
            const color = eroded ? 255 : 0;
            newData[index] = color;
            newData[index + 1] = color;
            newData[index + 2] = color;
            newData[index + 3] = 255;
        }
    }

    return new ImageData(newData, width, height);
}

// Opening: Erosion followed by Dilation (removes small objects/noise)
export function opening(imageData: ImageData, structuringElement: number[][]): ImageData {
    const eroded = erosion(imageData, structuringElement);
    return dilation(eroded, structuringElement);
}

// Closing: Dilation followed by Erosion (fills small holes)
export function closing(imageData: ImageData, structuringElement: number[][]): ImageData {
    const dilated = dilation(imageData, structuringElement);
    return erosion(dilated, structuringElement);
}

// Hit-or-Miss transform
// SE values: 1 = must be foreground, 0 = must be background, -1 = don't care
export function hitOrMiss(imageData: ImageData, structuringElement: number[][]): ImageData {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data.length);
    newData.fill(0);

    const seHeight = structuringElement.length;
    const seWidth = structuringElement[0].length;
    const { cx, cy } = getSECenter(structuringElement);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let matches = true;

            for (let sy = 0; sy < seHeight && matches; sy++) {
                for (let sx = 0; sx < seWidth && matches; sx++) {
                    const seVal = structuringElement[sy][sx];
                    if (seVal !== -1) {
                        const nx = x + sx - cx;
                        const ny = y + sy - cy;
                        const pixelVal = getPixel(data, width, height, nx, ny);

                        if (seVal === 1 && pixelVal !== 1) {
                            matches = false;
                        } else if (seVal === 0 && pixelVal !== 0) {
                            matches = false;
                        }
                    }
                }
            }

            const index = (y * width + x) * 4;
            const color = matches ? 255 : 0;
            newData[index] = color;
            newData[index + 1] = color;
            newData[index + 2] = color;
            newData[index + 3] = 255;
        }
    }

    return new ImageData(newData, width, height);
}

// Thinning: A - (A hit-or-miss B)
export function thinning(imageData: ImageData, structuringElement: number[][]): ImageData {
    const { width, height, data } = imageData;
    const hitResult = hitOrMiss(imageData, structuringElement);
    const newData = new Uint8ClampedArray(data.length);

    for (let i = 0; i < data.length; i += 4) {
        const originalPixel = data[i] > 127 ? 1 : 0;
        const hitPixel = hitResult.data[i] > 127 ? 1 : 0;
        const resultPixel = originalPixel && !hitPixel ? 255 : 0;

        newData[i] = resultPixel;
        newData[i + 1] = resultPixel;
        newData[i + 2] = resultPixel;
        newData[i + 3] = 255;
    }

    return new ImageData(newData, width, height);
}

// Thickening: A + (A hit-or-miss B)
export function thickening(imageData: ImageData, structuringElement: number[][]): ImageData {
    const { width, height, data } = imageData;
    const hitResult = hitOrMiss(imageData, structuringElement);
    const newData = new Uint8ClampedArray(data.length);

    for (let i = 0; i < data.length; i += 4) {
        const originalPixel = data[i] > 127 ? 1 : 0;
        const hitPixel = hitResult.data[i] > 127 ? 1 : 0;
        const resultPixel = (originalPixel || hitPixel) ? 255 : 0;

        newData[i] = resultPixel;
        newData[i + 1] = resultPixel;
        newData[i + 2] = resultPixel;
        newData[i + 3] = 255;
    }

    return new ImageData(newData, width, height);
}
