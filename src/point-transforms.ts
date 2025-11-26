function clamp(value: number): number {
    return Math.max(0, Math.min(255, Math.round(value)));
}

export function addValue(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i] = clamp(result.data[i] + value);
        result.data[i + 1] = clamp(result.data[i + 1] + value);
        result.data[i + 2] = clamp(result.data[i + 2] + value);
    }

    return result;
}

export function subtractValue(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i] = clamp(result.data[i] - value);
        result.data[i + 1] = clamp(result.data[i + 1] - value);
        result.data[i + 2] = clamp(result.data[i + 2] - value);
    }

    return result;
}

export function multiplyValue(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i] = clamp(result.data[i] * value);
        result.data[i + 1] = clamp(result.data[i + 1] * value);
        result.data[i + 2] = clamp(result.data[i + 2] * value);
    }

    return result;
}

export function divideValue(imageData: ImageData, value: number): ImageData {
    if (value === 0) {
        throw new Error("Nie można dzielić przez zero");
    }

    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i] = clamp(result.data[i] / value);
        result.data[i + 1] = clamp(result.data[i + 1] / value);
        result.data[i + 2] = clamp(result.data[i + 2] / value);
    }

    return result;
}

export function changeBrightness(imageData: ImageData, brightness: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i] = clamp(result.data[i] + brightness);
        result.data[i + 1] = clamp(result.data[i + 1] + brightness);
        result.data[i + 2] = clamp(result.data[i + 2] + brightness);
    }

    return result;
}

export function addValueR(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i] = clamp(result.data[i] + value);
    }

    return result;
}

export function addValueG(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i + 1] = clamp(result.data[i + 1] + value);
    }

    return result;
}

export function addValueB(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i + 2] = clamp(result.data[i + 2] + value);
    }

    return result;
}

export function subtractValueR(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i] = clamp(result.data[i] - value);
    }

    return result;
}

export function subtractValueG(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i + 1] = clamp(result.data[i + 1] - value);
    }

    return result;
}

export function subtractValueB(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i + 2] = clamp(result.data[i + 2] - value);
    }

    return result;
}

export function multiplyValueR(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i] = clamp(result.data[i] * value);
    }

    return result;
}

export function multiplyValueG(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i + 1] = clamp(result.data[i + 1] * value);
    }

    return result;
}

export function multiplyValueB(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i + 2] = clamp(result.data[i + 2] * value);
    }

    return result;
}

export function divideValueR(imageData: ImageData, value: number): ImageData {
    if (value === 0) {
        throw new Error("Nie można dzielić przez zero");
    }

    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i] = clamp(result.data[i] / value);
    }

    return result;
}

export function divideValueG(imageData: ImageData, value: number): ImageData {
    if (value === 0) {
        throw new Error("Nie można dzielić przez zero");
    }

    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i + 1] = clamp(result.data[i + 1] / value);
    }

    return result;
}

export function divideValueB(imageData: ImageData, value: number): ImageData {
    if (value === 0) {
        throw new Error("Nie można dzielić przez zero");
    }

    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i + 2] = clamp(result.data[i + 2] / value);
    }

    return result;
}

export function toGrayscaleAverage(imageData: ImageData): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        const r = result.data[i];
        const g = result.data[i + 1];
        const b = result.data[i + 2];

        const gray = Math.round((r + g + b) / 3);

        result.data[i] = gray;
        result.data[i + 1] = gray;
        result.data[i + 2] = gray;
    }

    return result;
}

export function toGrayscaleLuminance(imageData: ImageData): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        const r = result.data[i];
        const g = result.data[i + 1];
        const b = result.data[i + 2];

        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

        result.data[i] = gray;
        result.data[i + 1] = gray;
        result.data[i + 2] = gray;
    }

    return result;
}
