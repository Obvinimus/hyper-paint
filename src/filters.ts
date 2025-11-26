// Filtry obrazu - samodzielna implementacja bez użycia bibliotek

/**
 * Pomocnicza funkcja do ograniczania wartości do zakresu 0-255
 */
function clamp(value: number): number {
    return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * Funkcja pomocnicza do pobierania wartości piksela z obrazu
 * Obsługuje piksele poza granicami obrazu (padding - powtarzanie krawędzi)
 */
function getPixel(data: Uint8ClampedArray, width: number, height: number, x: number, y: number, channel: number): number {
    // Obsługa pikseli poza granicami - powtarzamy wartości krawędzi
    x = Math.max(0, Math.min(width - 1, x));
    y = Math.max(0, Math.min(height - 1, y));

    const index = (y * width + x) * 4 + channel;
    return data[index];
}

/**
 * Konwolucja 2D - podstawowa funkcja dla większości filtrów
 */
function convolve(
    imageData: ImageData,
    kernel: number[][],
    divisor: number = 1,
    offset: number = 0
): ImageData {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data.length);

    const kernelSize = kernel.length;
    const halfKernel = Math.floor(kernelSize / 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0;

            // Aplikuj kernel
            for (let ky = 0; ky < kernelSize; ky++) {
                for (let kx = 0; kx < kernelSize; kx++) {
                    const pixelX = x + kx - halfKernel;
                    const pixelY = y + ky - halfKernel;

                    const weight = kernel[ky][kx];

                    r += getPixel(data, width, height, pixelX, pixelY, 0) * weight;
                    g += getPixel(data, width, height, pixelX, pixelY, 1) * weight;
                    b += getPixel(data, width, height, pixelX, pixelY, 2) * weight;
                }
            }

            const index = (y * width + x) * 4;
            newData[index] = clamp(r / divisor + offset);
            newData[index + 1] = clamp(g / divisor + offset);
            newData[index + 2] = clamp(b / divisor + offset);
            newData[index + 3] = 255; // Alpha
        }
    }

    return new ImageData(newData, width, height);
}

/**
 * Filtr wygładzający (uśredniający)
 * Kernel 3x3 z wartościami 1/9
 */
export function filtrWygladzajacy(imageData: ImageData): ImageData {
    const kernel = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
    ];

    return convolve(imageData, kernel, 9);
}

/**
 * Filtr medianowy
 * Wybiera medianę z 9 wartości w oknie 3x3
 */
export function filtrMedianowy(imageData: ImageData): ImageData {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data.length);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const rValues: number[] = [];
            const gValues: number[] = [];
            const bValues: number[] = [];

            // Zbierz wartości z okna 3x3
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    rValues.push(getPixel(data, width, height, x + dx, y + dy, 0));
                    gValues.push(getPixel(data, width, height, x + dx, y + dy, 1));
                    bValues.push(getPixel(data, width, height, x + dx, y + dy, 2));
                }
            }

            // Sortuj i wybierz medianę (środkową wartość)
            rValues.sort((a, b) => a - b);
            gValues.sort((a, b) => a - b);
            bValues.sort((a, b) => a - b);

            const index = (y * width + x) * 4;
            newData[index] = rValues[4];     // Mediana (środkowy element z 9)
            newData[index + 1] = gValues[4];
            newData[index + 2] = bValues[4];
            newData[index + 3] = 255;
        }
    }

    return new ImageData(newData, width, height);
}

/**
 * Filtr wykrywania krawędzi (Sobel)
 * Używa dwóch kerneli (gradient X i Y) i oblicza magnitude
 */
export function filtrWykrywaniaKrawedzi(imageData: ImageData): ImageData {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data.length);

    // Kernele Sobela
    const sobelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];

    const sobelY = [
        [-1, -2, -1],
        [ 0,  0,  0],
        [ 1,  2,  1]
    ];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let gxR = 0, gxG = 0, gxB = 0;
            let gyR = 0, gyG = 0, gyB = 0;

            // Aplikuj oba kernele
            for (let ky = 0; ky < 3; ky++) {
                for (let kx = 0; kx < 3; kx++) {
                    const pixelX = x + kx - 1;
                    const pixelY = y + ky - 1;

                    const r = getPixel(data, width, height, pixelX, pixelY, 0);
                    const g = getPixel(data, width, height, pixelX, pixelY, 1);
                    const b = getPixel(data, width, height, pixelX, pixelY, 2);

                    gxR += r * sobelX[ky][kx];
                    gxG += g * sobelX[ky][kx];
                    gxB += b * sobelX[ky][kx];

                    gyR += r * sobelY[ky][kx];
                    gyG += g * sobelY[ky][kx];
                    gyB += b * sobelY[ky][kx];
                }
            }

            // Oblicz magnitude: sqrt(gx^2 + gy^2)
            const magR = Math.sqrt(gxR * gxR + gyR * gyR);
            const magG = Math.sqrt(gxG * gxG + gyG * gyG);
            const magB = Math.sqrt(gxB * gxB + gyB * gyB);

            const index = (y * width + x) * 4;
            newData[index] = clamp(magR);
            newData[index + 1] = clamp(magG);
            newData[index + 2] = clamp(magB);
            newData[index + 3] = 255;
        }
    }

    return new ImageData(newData, width, height);
}

/**
 * Filtr górnoprzepustowy wyostrzający
 * Podkreśla szczegóły i krawędzie
 */
export function filtrGornoprzepustowyWyostrzajacy(imageData: ImageData): ImageData {
    const kernel = [
        [ 0, -1,  0],
        [-1,  5, -1],
        [ 0, -1,  0]
    ];

    return convolve(imageData, kernel, 1);
}

/**
 * Filtr rozmycie gaussowskie
 * Używa kernela 5x5 z wagami gaussowskimi
 */
export function filtrRozmycieGaussowskie(imageData: ImageData): ImageData {
    const kernel = [
        [1,  4,  6,  4, 1],
        [4, 16, 24, 16, 4],
        [6, 24, 36, 24, 6],
        [4, 16, 24, 16, 4],
        [1,  4,  6,  4, 1]
    ];

    return convolve(imageData, kernel, 256);
}
