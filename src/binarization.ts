function toGrayscale(imageData: ImageData): Uint8ClampedArray {
    const { data } = imageData;
    const grayData = new Uint8ClampedArray(data.length / 4);

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        grayData[i / 4] = gray;
    }

    return grayData;
}

function applyThreshold(imageData: ImageData, threshold: number): ImageData {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data.length);
    const grayData = toGrayscale(imageData);

    for (let i = 0; i < grayData.length; i++) {
        const value = grayData[i] >= threshold ? 255 : 0;
        newData[i * 4] = value;
        newData[i * 4 + 1] = value;
        newData[i * 4 + 2] = value;
        newData[i * 4 + 3] = 255;
    }

    return new ImageData(newData, width, height);
}

export function binarizeManual(imageData: ImageData, threshold: number): ImageData {
    if (threshold < 0 || threshold > 255) {
        throw new Error('Próg musi być w zakresie 0-255');
    }
    return applyThreshold(imageData, threshold);
}

export function binarizePercentBlack(imageData: ImageData, percent: number): ImageData {
    if (percent < 0 || percent > 100) {
        throw new Error('Procent musi być w zakresie 0-100');
    }

    const grayData = toGrayscale(imageData);
    const histogram = new Array(256).fill(0);

    for (let i = 0; i < grayData.length; i++) {
        histogram[grayData[i]]++;
    }

    const totalPixels = grayData.length;
    const targetBlackPixels = Math.floor((percent / 100) * totalPixels);

    let blackPixelCount = 0;
    let threshold = 0;

    for (let i = 0; i < 256; i++) {
        blackPixelCount += histogram[i];
        if (blackPixelCount >= targetBlackPixels) {
            threshold = i;
            break;
        }
    }

    return applyThreshold(imageData, threshold);
}

export function binarizeMeanIterative(imageData: ImageData): ImageData {
    const grayData = toGrayscale(imageData);

    let minVal = 255;
    let maxVal = 0;
    for (let i = 0; i < grayData.length; i++) {
        if (grayData[i] < minVal) minVal = grayData[i];
        if (grayData[i] > maxVal) maxVal = grayData[i];
    }

    let threshold = Math.floor((minVal + maxVal) / 2);
    let prevThreshold = -1;
    const maxIterations = 100;
    let iterations = 0;

    while (threshold !== prevThreshold && iterations < maxIterations) {
        prevThreshold = threshold;

        let sumBelow = 0, countBelow = 0;
        let sumAbove = 0, countAbove = 0;

        for (let i = 0; i < grayData.length; i++) {
            if (grayData[i] <= threshold) {
                sumBelow += grayData[i];
                countBelow++;
            } else {
                sumAbove += grayData[i];
                countAbove++;
            }
        }

        const meanBelow = countBelow > 0 ? sumBelow / countBelow : 0;
        const meanAbove = countAbove > 0 ? sumAbove / countAbove : 255;

        threshold = Math.floor((meanBelow + meanAbove) / 2);
        iterations++;
    }

    return applyThreshold(imageData, threshold);
}

export function getThresholdValue(imageData: ImageData, method: 'percentBlack' | 'meanIterative', param?: number): number {
    const grayData = toGrayscale(imageData);

    if (method === 'percentBlack') {
        const percent = param || 50;
        const histogram = new Array(256).fill(0);

        for (let i = 0; i < grayData.length; i++) {
            histogram[grayData[i]]++;
        }

        const totalPixels = grayData.length;
        const targetBlackPixels = Math.floor((percent / 100) * totalPixels);

        let blackPixelCount = 0;
        let threshold = 0;

        for (let i = 0; i < 256; i++) {
            blackPixelCount += histogram[i];
            if (blackPixelCount >= targetBlackPixels) {
                threshold = i;
                break;
            }
        }

        return threshold;
    } else if (method === 'meanIterative') {
        let minVal = 255;
        let maxVal = 0;
        for (let i = 0; i < grayData.length; i++) {
            if (grayData[i] < minVal) minVal = grayData[i];
            if (grayData[i] > maxVal) maxVal = grayData[i];
        }

        let threshold = Math.floor((minVal + maxVal) / 2);
        let prevThreshold = -1;
        const maxIterations = 100;
        let iterations = 0;

        while (threshold !== prevThreshold && iterations < maxIterations) {
            prevThreshold = threshold;

            let sumBelow = 0, countBelow = 0;
            let sumAbove = 0, countAbove = 0;

            for (let i = 0; i < grayData.length; i++) {
                if (grayData[i] <= threshold) {
                    sumBelow += grayData[i];
                    countBelow++;
                } else {
                    sumAbove += grayData[i];
                    countAbove++;
                }
            }

            const meanBelow = countBelow > 0 ? sumBelow / countBelow : 0;
            const meanAbove = countAbove > 0 ? sumAbove / countAbove : 255;

            threshold = Math.floor((meanBelow + meanAbove) / 2);
            iterations++;
        }

        return threshold;
    }

    return 127;
}
