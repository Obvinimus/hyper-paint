// Przekształcenia punktowe - samodzielna implementacja bez użycia bibliotek

/**
 * Pomocnicza funkcja do ograniczania wartości do zakresu 0-255
 */
function clamp(value: number): number {
    return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * Dodawanie wartości do wszystkich kanałów RGB
 */
export function addValue(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i] = clamp(result.data[i] + value);         // R
        result.data[i + 1] = clamp(result.data[i + 1] + value); // G
        result.data[i + 2] = clamp(result.data[i + 2] + value); // B
    }

    return result;
}

/**
 * Odejmowanie wartości od wszystkich kanałów RGB
 */
export function subtractValue(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i] = clamp(result.data[i] - value);         // R
        result.data[i + 1] = clamp(result.data[i + 1] - value); // G
        result.data[i + 2] = clamp(result.data[i + 2] - value); // B
    }

    return result;
}

/**
 * Mnożenie wszystkich kanałów RGB przez wartość
 */
export function multiplyValue(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i] = clamp(result.data[i] * value);         // R
        result.data[i + 1] = clamp(result.data[i + 1] * value); // G
        result.data[i + 2] = clamp(result.data[i + 2] * value); // B
    }

    return result;
}

/**
 * Dzielenie wszystkich kanałów RGB przez wartość
 */
export function divideValue(imageData: ImageData, value: number): ImageData {
    if (value === 0) {
        throw new Error("Nie można dzielić przez zero");
    }

    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i] = clamp(result.data[i] / value);         // R
        result.data[i + 1] = clamp(result.data[i + 1] / value); // G
        result.data[i + 2] = clamp(result.data[i + 2] / value); // B
    }

    return result;
}

/**
 * Zmiana jasności obrazu
 * Wartość dodatnia zwiększa jasność, ujemna zmniejsza
 */
export function changeBrightness(imageData: ImageData, brightness: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i] = clamp(result.data[i] + brightness);         // R
        result.data[i + 1] = clamp(result.data[i + 1] + brightness); // G
        result.data[i + 2] = clamp(result.data[i + 2] + brightness); // B
    }

    return result;
}

// ============= OPERACJE NA POSZCZEGÓLNYCH KANAŁACH =============

/**
 * Dodawanie wartości tylko do kanału czerwonego (R)
 */
export function addValueR(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i] = clamp(result.data[i] + value);
    }

    return result;
}

/**
 * Dodawanie wartości tylko do kanału zielonego (G)
 */
export function addValueG(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i + 1] = clamp(result.data[i + 1] + value);
    }

    return result;
}

/**
 * Dodawanie wartości tylko do kanału niebieskiego (B)
 */
export function addValueB(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i + 2] = clamp(result.data[i + 2] + value);
    }

    return result;
}

/**
 * Odejmowanie wartości tylko od kanału czerwonego (R)
 */
export function subtractValueR(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i] = clamp(result.data[i] - value);
    }

    return result;
}

/**
 * Odejmowanie wartości tylko od kanału zielonego (G)
 */
export function subtractValueG(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i + 1] = clamp(result.data[i + 1] - value);
    }

    return result;
}

/**
 * Odejmowanie wartości tylko od kanału niebieskiego (B)
 */
export function subtractValueB(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i + 2] = clamp(result.data[i + 2] - value);
    }

    return result;
}

/**
 * Mnożenie tylko kanału czerwonego (R) przez wartość
 */
export function multiplyValueR(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i] = clamp(result.data[i] * value);
    }

    return result;
}

/**
 * Mnożenie tylko kanału zielonego (G) przez wartość
 */
export function multiplyValueG(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i + 1] = clamp(result.data[i + 1] * value);
    }

    return result;
}

/**
 * Mnożenie tylko kanału niebieskiego (B) przez wartość
 */
export function multiplyValueB(imageData: ImageData, value: number): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        result.data[i + 2] = clamp(result.data[i + 2] * value);
    }

    return result;
}

/**
 * Dzielenie tylko kanału czerwonego (R) przez wartość
 */
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

/**
 * Dzielenie tylko kanału zielonego (G) przez wartość
 */
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

/**
 * Dzielenie tylko kanału niebieskiego (B) przez wartość
 */
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

// ============= SKALA SZAROŚCI =============

/**
 * Konwersja do skali szarości - metoda średniej arytmetycznej
 * Gray = (R + G + B) / 3
 */
export function toGrayscaleAverage(imageData: ImageData): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        const r = result.data[i];
        const g = result.data[i + 1];
        const b = result.data[i + 2];

        const gray = Math.round((r + g + b) / 3);

        result.data[i] = gray;     // R
        result.data[i + 1] = gray; // G
        result.data[i + 2] = gray; // B
    }

    return result;
}

/**
 * Konwersja do skali szarości - metoda ważona (luminance)
 * Gray = 0.299*R + 0.587*G + 0.114*B
 * Ta metoda lepiej odzwierciedla sposób, w jaki ludzkie oko postrzega jasność
 */
export function toGrayscaleLuminance(imageData: ImageData): ImageData {
    const newData = imageData.data.slice();
    const result = new ImageData(newData, imageData.width, imageData.height);

    for (let i = 0; i < result.data.length; i += 4) {
        const r = result.data[i];
        const g = result.data[i + 1];
        const b = result.data[i + 2];

        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

        result.data[i] = gray;     // R
        result.data[i + 1] = gray; // G
        result.data[i + 2] = gray; // B
    }

    return result;
}
