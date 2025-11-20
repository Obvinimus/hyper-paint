import { setColor } from './state';
import * as THREE from 'three';

const CUBE_SIZE = 200; 

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let cube: THREE.Mesh;
let slicePlane: THREE.Mesh | null = null;
let offscreenCanvas: HTMLCanvasElement;
let isInitialized = false;
let isVisible = false;

let rotationX = -Math.PI / 6;
let rotationY = Math.PI / 4;
let isRotating = false;
let mouseDownX = 0;
let mouseDownY = 0;
let autoRotate = false;

let isPanning = false;
let panStartX = 0;
let panStartY = 0;

let sliceEnabled = false;
let sliceAxis: 'x' | 'y' | 'z' = 'y';
let slicePosition = 0.5; // 0 to 1

let cubeWorldX = 0;
let cubeWorldY = 0;

export function setupRGBCube() {
    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = CUBE_SIZE;
    offscreenCanvas.height = CUBE_SIZE;
}

export function toggleRGBCube() {
    if (!isInitialized) {
        initializeThreeJS();
        isInitialized = true;
    }
    isVisible = !isVisible;
}

export function isRGBCubeVisible(): boolean {
    return isVisible;
}

export function setRGBCubePosition(worldX: number, worldY: number) {
    cubeWorldX = worldX;
    cubeWorldY = worldY;
}

export function getRGBCubeWorldPosition(): { x: number, y: number } {
    return { x: cubeWorldX, y: cubeWorldY };
}

export function getRGBCubeSize(): number {
    return CUBE_SIZE;
}

export function setSliceEnabled(enabled: boolean) {
    sliceEnabled = enabled;
    if (!enabled && slicePlane) {
        scene.remove(slicePlane);
        slicePlane.geometry.dispose();
        (slicePlane.material as THREE.Material).dispose();
        slicePlane = null;
    }
}

export function setSliceAxis(axis: 'x' | 'y' | 'z') {
    sliceAxis = axis;
}

export function setSlicePosition(position: number) {
    slicePosition = position; 
}

export function setAutoRotate(enabled: boolean) {
    autoRotate = enabled;
}

export function resetRotation() {
    rotationX = -Math.PI / 6;
    rotationY = Math.PI / 4;
}

function initializeThreeJS() {
    scene = new THREE.Scene();
    scene.background = null;

    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(3, 3, 3);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({
        canvas: offscreenCanvas,
        antialias: true,
        alpha: true, 
        preserveDrawingBuffer: true 
    });
    renderer.setSize(CUBE_SIZE, CUBE_SIZE);
    renderer.setPixelRatio(1);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    createRGBCube();
}

function createRGBCube() {
    const geometry = new THREE.BoxGeometry(2, 2, 2, 64, 64, 64);

    const colors = new Float32Array(geometry.attributes.position.count * 3);
    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
        const x = (positions.getX(i) + 1) / 2;
        const y = (positions.getY(i) + 1) / 2;
        const z = (positions.getZ(i) + 1) / 2;

        colors[i * 3] = x;     
        colors[i * 3 + 1] = y; 
        colors[i * 3 + 2] = z; 
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.FrontSide
    });

    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const wireframeGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(2, 2, 2));
    const wireframeMaterial = new THREE.LineBasicMaterial({
        color: 0x333333,
        opacity: 0.4,
        transparent: true,
        linewidth: 1
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    cube.add(wireframe);
}

function createSlicePlane() {
    if (slicePlane) {
        scene.remove(slicePlane);
        slicePlane.geometry.dispose();
        (slicePlane.material as THREE.Material).dispose();
        slicePlane = null;
    }

    if (!sliceEnabled) return;

    const planeGeometry = new THREE.PlaneGeometry(3, 3, 64, 64);
    const positions = planeGeometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
        let x, y, z;

        if (sliceAxis === 'x') {
            x = slicePosition * 2 - 1;
            y = positions.getY(i);
            z = positions.getX(i);
            positions.setX(i, x);
            positions.setY(i, y);
            positions.setZ(i, z);
        } else if (sliceAxis === 'y') {
            x = positions.getX(i);
            y = slicePosition * 2 - 1;
            z = positions.getY(i);
            positions.setX(i, x);
            positions.setY(i, y);
            positions.setZ(i, z);
        } else {
            x = positions.getX(i);
            y = positions.getY(i);
            z = slicePosition * 2 - 1;
            positions.setZ(i, z);
        }

        colors[i * 3] = (x + 1) / 2;
        colors[i * 3 + 1] = (y + 1) / 2;
        colors[i * 3 + 2] = (z + 1) / 2;
    }

    planeGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    positions.needsUpdate = true;

    const planeMaterial = new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.DoubleSide
    });

    slicePlane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(slicePlane);

    const edgesGeometry = new THREE.EdgesGeometry(planeGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({
        color: 0x000000,
        opacity: 0.6,
        transparent: true,
        linewidth: 2
    });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    slicePlane.add(edges);
}

export function renderRGBCube(): ImageData | null {
    if (!isInitialized || !isVisible) return null;

    if (autoRotate && !isRotating) {
        rotationY += 0.005;
    }

    if (sliceEnabled) {
        createSlicePlane();
    }

    if (cube) {
        cube.rotation.x = rotationX;
        cube.rotation.y = rotationY;
    }

    if (slicePlane) {
        slicePlane.rotation.x = rotationX;
        slicePlane.rotation.y = rotationY;
    }

    renderer.render(scene, camera);

    const gl = renderer.getContext();
    const pixels = new Uint8Array(CUBE_SIZE * CUBE_SIZE * 4);
    gl.readPixels(0, 0, CUBE_SIZE, CUBE_SIZE, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    const imageData = new ImageData(CUBE_SIZE, CUBE_SIZE);

    for (let y = 0; y < CUBE_SIZE; y++) {
        for (let x = 0; x < CUBE_SIZE; x++) {
            const srcIdx = ((CUBE_SIZE - 1 - y) * CUBE_SIZE + x) * 4;
            const dstIdx = (y * CUBE_SIZE + x) * 4;
            imageData.data[dstIdx] = pixels[srcIdx];
            imageData.data[dstIdx + 1] = pixels[srcIdx + 1];
            imageData.data[dstIdx + 2] = pixels[srcIdx + 2];
            imageData.data[dstIdx + 3] = pixels[srcIdx + 3];
        }
    }

    return imageData;
}

export function handleRGBCubeMouseDown(worldX: number, worldY: number): boolean {
    if (!isVisible) return false;

    const halfSize = CUBE_SIZE / 2;
    const dx = worldX - cubeWorldX;
    const dy = worldY - cubeWorldY;

    if (Math.abs(dx) <= halfSize && Math.abs(dy) <= halfSize) {
        isRotating = true;
        mouseDownX = worldX;
        mouseDownY = worldY;
        return true;
    }

    return false;
}

export function handleRGBCubeMouseMove(worldX: number, worldY: number): boolean {
    if (!isRotating) return false;

    const deltaX = worldX - mouseDownX;
    const deltaY = worldY - mouseDownY;

    rotationY += deltaX * 0.01;
    rotationX += deltaY * 0.01;

    rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX));

    mouseDownX = worldX;
    mouseDownY = worldY;

    return true;
}

export function handleRGBCubeMouseUp(): void {
    isRotating = false;
    isPanning = false;
}

export function handleRGBCubePanStart(worldX: number, worldY: number): boolean {
    if (!isVisible) return false;

    const halfSize = CUBE_SIZE / 2;
    const dx = worldX - cubeWorldX;
    const dy = worldY - cubeWorldY;

    if (Math.abs(dx) <= halfSize && Math.abs(dy) <= halfSize) {
        isPanning = true;
        panStartX = worldX;
        panStartY = worldY;
        return true;
    }

    return false;
}

export function handleRGBCubePanMove(worldX: number, worldY: number): boolean {
    if (!isPanning) return false;

    const deltaX = worldX - panStartX;
    const deltaY = worldY - panStartY;

    cubeWorldX += deltaX;
    cubeWorldY += deltaY;

    panStartX = worldX;
    panStartY = worldY;

    return true;
}

export function isRGBCubePanning(): boolean {
    return isPanning;
}

export function handleRGBCubeClick(worldX: number, worldY: number): boolean {
    if (!isVisible) return false;

    const halfSize = CUBE_SIZE / 2;
    const dx = worldX - cubeWorldX;
    const dy = worldY - cubeWorldY;

    if (Math.abs(dx) <= halfSize && Math.abs(dy) <= halfSize) {
        const relX = (dx + halfSize) / CUBE_SIZE;
        const relY = (dy + halfSize) / CUBE_SIZE;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
            (relX * 2) - 1,
            -(relY * 2) + 1
        );
        raycaster.setFromCamera(mouse, camera);

        const objects = slicePlane ? [cube, slicePlane] : [cube];
        const intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            const r = Math.round(Math.max(0, Math.min(255, ((point.x + 1) / 2) * 255)));
            const g = Math.round(Math.max(0, Math.min(255, ((point.y + 1) / 2) * 255)));
            const b = Math.round(Math.max(0, Math.min(255, ((point.z + 1) / 2) * 255)));

            const hex = '#' + [r, g, b].map(v => {
                const h = v.toString(16);
                return h.length === 1 ? '0' + h : h;
            }).join('');

            setColor(hex);

            const colorPickerButton = document.getElementById('colorPickerButton') as HTMLButtonElement;
            if (colorPickerButton) {
                colorPickerButton.style.backgroundColor = hex;
            }

            return true;
        }
    }

    return false;
}