# 🎨 Custom Raster Graphics Editor

A sophisticated browser-based vector graphics editor built from the ground up in TypeScript.

Unlike typical HTML5 Canvas applications, this project **does not use** native canvas drawing functions (`ctx.lineTo`, `ctx.arc`, etc.). Instead, it features a **custom rasterization engine** that manipulates the `imageData` buffer directly, pixel by pixel, using algorithms like Bresenham's (for lines) and Midpoint (for circles).

---

## ✨ Core Features

A comprehensive suite of tools for creating and editing graphics, wrapped in a modern UI built with Tailwind CSS.

### 🔧 Drawing & Editing Tools
* **Basic Tools:** Draw Lines, Rectangles, Circles, and a freehand Pencil tool.
* **Live Preview (Rubber-banding):** See a live preview of your shape as you draw it, before committing the final point.
* **Advanced Editing:**
    * **Select Tool:** Click on any object's edge to select it.
    * **Move Tool:** Drag any selected object anywhere on the canvas.
    * **Resize Tool:** Selecting an object reveals interactive **handles** that allow you to intuitively resize and reshape it.
* **Custom Hit Test:** A precise, from-scratch hit-testing algorithm detects clicks on the edge of any shape.

### 🎛️ Dynamic Properties Panel
* **Create from Parameters:** Select a tool (e.g., "Line"), and a side panel allows you to enter precise coordinates (`x1`, `y1`, `x2`, `y2`) and create the shape with a button.
* **Edit Parameters:** Select an existing object, and the panel automatically populates with its current data (position, size, color). Modify the values and hit "Update" to see immediate changes.
* **Context-Aware:** The panel intelligently shows only the fields relevant to the currently selected tool or object.

### 💾 Save & Load
* **Serialization:** Save your entire canvas to a `.json` file. All drawn objects, their positions, and colors are exported.
* **Deserialization:** Load a `.json` file to fully restore the canvas state. The application re-hydrates the plain objects back into class instances, retaining their full editability.

### 🎨 User Interface
* **Modern UI:** A clean, minimal UI built with **Tailwind CSS**.
* **Floating Toolbar:** A central "glassmorphism" toolbar hovers over the canvas.
* **Interactive Buttons:** Tool icons are minimal by default; on hover or selection, they "bloom" by changing their background, shape, and rotation, providing clear visual feedback.
* **Animated Background:** A subtle, animated gradient background.

---

## 🛠️ How It Works (Architecture)

The key to the editor's functionality is its unique hybrid architecture.

### 1. Custom Rasterization Engine
The application operates by manipulating pixels directly. Instead of telling the canvas "draw a line," we manually calculate the position of every pixel along that line using computer graphics algorithms (like **Bresenham's line algorithm**) and write those pixels directly into the `imageData` buffer.

### 2. "Retained Mode" Architecture
Despite being a raster editor at its core, the application uses a vector-like "retained mode" logic. Every object drawn (line, circle, etc.) is stored as a class instance in a global list.

The main application loop (`draw()` in `main.ts`) does the following on every single frame:
1.  **Clears** the entire `imageData` buffer (filling it with white).
2.  **Iterates** through the master list of all shape objects.
3.  **Rasterizes** (re-draws pixel-by-pixel) every single object based on its current properties (position, size, color).
4.  **Renders** the final `imageData` to the canvas.

This "retained mode" approach is what makes editing, moving, and resizing objects possible, as we *always* have access to their source data.

---

## 🚀 Getting Started

This project is built using **Vite** + **TypeScript**.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/your-repo.git](https://github.com/your-username/your-repo.git)
    cd your-repo
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:5173` (or another port specified by Vite).

---

## 🥞 Tech Stack

* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **HTML5 Canvas** (direct `imageData` manipulation)
