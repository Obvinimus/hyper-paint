export interface Histogram {
    r: number[];
    g: number[];
    b: number[];
    gray: number[];
}

export function calculateHistogram(imageData: ImageData): Histogram {
    const histogram: Histogram = {
        r: new Array(256).fill(0),
        g: new Array(256).fill(0),
        b: new Array(256).fill(0),
        gray: new Array(256).fill(0)
    };

    const { data } = imageData;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        histogram.r[r]++;
        histogram.g[g]++;
        histogram.b[b]++;

        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        histogram.gray[gray]++;
    }

    return histogram;
}

export function histogramStretch(imageData: ImageData): ImageData {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data.length);

    let minR = 255, maxR = 0;
    let minG = 255, maxG = 0;
    let minB = 255, maxB = 0;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (g < minG) minG = g;
        if (g > maxG) maxG = g;
        if (b < minB) minB = b;
        if (b > maxB) maxB = b;
    }

    console.log(`Rozciąganie histogramu - zakres przed: R[${minR}-${maxR}] G[${minG}-${maxG}] B[${minB}-${maxB}]`);

    const rangeR = maxR - minR || 1;
    const rangeG = maxG - minG || 1;
    const rangeB = maxB - minB || 1;

    for (let i = 0; i < data.length; i += 4) {
        newData[i] = Math.round(((data[i] - minR) / rangeR) * 255);
        newData[i + 1] = Math.round(((data[i + 1] - minG) / rangeG) * 255);
        newData[i + 2] = Math.round(((data[i + 2] - minB) / rangeB) * 255);
        newData[i + 3] = 255;
    }

    console.log(`Rozciąganie histogramu - zakres po: R[0-255] G[0-255] B[0-255]`);

    return new ImageData(newData, width, height);
}

export function histogramEqualize(imageData: ImageData): ImageData {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data.length);

    const histogram = calculateHistogram(imageData);
    const totalPixels = width * height;

    const cdfR = new Array(256).fill(0);
    const cdfG = new Array(256).fill(0);
    const cdfB = new Array(256).fill(0);

    cdfR[0] = histogram.r[0];
    cdfG[0] = histogram.g[0];
    cdfB[0] = histogram.b[0];

    for (let i = 1; i < 256; i++) {
        cdfR[i] = cdfR[i - 1] + histogram.r[i];
        cdfG[i] = cdfG[i - 1] + histogram.g[i];
        cdfB[i] = cdfB[i - 1] + histogram.b[i];
    }

    const cdfMinR = cdfR.find(v => v > 0) || 0;
    const cdfMinG = cdfG.find(v => v > 0) || 0;
    const cdfMinB = cdfB.find(v => v > 0) || 0;

    const lookupR = new Array(256);
    const lookupG = new Array(256);
    const lookupB = new Array(256);

    for (let i = 0; i < 256; i++) {
        lookupR[i] = Math.round(((cdfR[i] - cdfMinR) / (totalPixels - cdfMinR)) * 255);
        lookupG[i] = Math.round(((cdfG[i] - cdfMinG) / (totalPixels - cdfMinG)) * 255);
        lookupB[i] = Math.round(((cdfB[i] - cdfMinB) / (totalPixels - cdfMinB)) * 255);
    }

    for (let i = 0; i < data.length; i += 4) {
        newData[i] = lookupR[data[i]];
        newData[i + 1] = lookupG[data[i + 1]];
        newData[i + 2] = lookupB[data[i + 2]];
        newData[i + 3] = 255;
    }

    return new ImageData(newData, width, height);
}

export function drawHistogram(
    canvas: HTMLCanvasElement,
    histogram: Histogram,
    channel: 'r' | 'g' | 'b' | 'gray' = 'gray'
): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    const data = histogram[channel];

    const sortedData = [...data].sort((a, b) => b - a);
    const percentile95Index = Math.floor(sortedData.length * 0.05);
    const maxValue = sortedData[percentile95Index] || Math.max(...data);

    if (maxValue === 0) return;

    const barWidth = width / 256;

    let color: string;
    switch (channel) {
        case 'r':
            color = 'rgba(255, 100, 100, 0.8)';
            break;
        case 'g':
            color = 'rgba(100, 255, 100, 0.8)';
            break;
        case 'b':
            color = 'rgba(100, 100, 255, 0.8)';
            break;
        case 'gray':
        default:
            color = 'rgba(200, 200, 200, 0.8)';
            break;
    }

    ctx.fillStyle = color;

    for (let i = 0; i < 256; i++) {
        const normalizedValue = Math.min(data[i], maxValue);
        const barHeight = (normalizedValue / maxValue) * (height - 10);
        const x = i * barWidth;
        const y = height - barHeight;

        ctx.fillRect(x, y, barWidth, barHeight);
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - 1);
    ctx.lineTo(width, height - 1);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px monospace';
    ctx.fillText(`Skala: 95% percentyl (max: ${Math.max(...data).toLocaleString()})`, 5, 12);
}
