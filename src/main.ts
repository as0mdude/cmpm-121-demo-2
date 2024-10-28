import "./style.css";

const APP_NAME = "sketchbox.";
const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;
app.innerHTML = `<h1>${APP_NAME}</h1>`;

// Create a canvas element
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "myCanvas";
app.appendChild(canvas);

const ctx = canvas.getContext("2d");
let isDrawing = false;

// Default line thickness (set to thin by default)
let currentThickness = 2;
let currentSticker: Sticker | null = null; // Track the current sticker preview

class Line {
    private points: Array<{ x: number, y: number }> = [];
    private thickness: number;

    constructor(startX: number, startY: number, thickness: number) {
        this.points.push({ x: startX, y: startY });
        this.thickness = thickness;
    }

    drag(x: number, y: number) {
        this.points.push({ x, y });
    }

    display(ctx: CanvasRenderingContext2D) {
        if (this.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            ctx.lineWidth = this.thickness;
            for (let i = 1; i < this.points.length; i++) {
                ctx.lineTo(this.points[i].x, this.points[i].y);
            }
            ctx.stroke();
            ctx.closePath();
        }
    }
}

class Sticker {
    private emoji: string;
    private x: number;
    private y: number;

    constructor(emoji: string, x: number, y: number) {
        this.emoji = emoji;
        this.x = x;
        this.y = y;
    }

    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    display(ctx: CanvasRenderingContext2D) {
        ctx.font = "24px Arial";
        ctx.fillText(this.emoji, this.x, this.y);
    }
}

// Tool preview class for showing marker size
class ToolPreview {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    updatePosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentThickness / 2, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.closePath();
    }
}

const lines: Array<Line> = [];
const stickers: Array<Sticker> = [];
const linesAndStickers: Array<Line | Sticker> = [];
const undoStack: Array<Line | Sticker> = [];
let toolPreview: ToolPreview | null = null;

if (ctx) {
    ctx.strokeStyle = "white";
}

function redrawCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lines.forEach(line => line.display(ctx));
    stickers.forEach(sticker => sticker.display(ctx));

    // Draw tool preview or sticker preview
    if (toolPreview && !isDrawing && !currentSticker) {
        toolPreview.draw(ctx);
    }

    if (currentSticker) {
        currentSticker.display(ctx);
    }
}

function drawingChangedEvent() {
    const event = new Event("drawing-changed");
    canvas.dispatchEvent(event);
}

canvas.addEventListener("drawing-changed", () => {
    redrawCanvas();
});

// Event handler for starting drawing
canvas.addEventListener("mousedown", (e) => {
    if (currentSticker) {
        currentSticker.setPosition(e.offsetX, e.offsetY);
        stickers.push(currentSticker);
        linesAndStickers.push(currentSticker); // Add sticker to unified array
        currentSticker = null;
    } else {
        isDrawing = true;
        const newLine = new Line(e.offsetX, e.offsetY, currentThickness);
        lines.push(newLine);
        linesAndStickers.push(newLine); // Add line to unified array
        toolPreview = null;
    }
    drawingChangedEvent();
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
        lines[lines.length - 1].drag(e.offsetX, e.offsetY);
        drawingChangedEvent();
    } else {
        // Update tool preview or sticker preview position
        if (currentSticker) {
            currentSticker.setPosition(e.offsetX, e.offsetY);
            redrawCanvas();
        } else {
            if (!toolPreview) {
                toolPreview = new ToolPreview(e.offsetX, e.offsetY);
            } else {
                toolPreview.updatePosition(e.offsetX, e.offsetY);
            }
            redrawCanvas();
        }
    }
});

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
});

// Add Clear, Undo, and Redo buttons
const clearButton = document.createElement("button");
clearButton.textContent = "clear canvas";
clearButton.id = "clearButton";
app.appendChild(clearButton);

clearButton.addEventListener("click", () => {
    lines.length = 0;
    stickers.length = 0;
    drawingChangedEvent();
});

const undoButton = document.createElement("button");
undoButton.textContent = "undo";
undoButton.id = "undoButton";
app.appendChild(undoButton);

undoButton.addEventListener("click", () => {
    if (linesAndStickers.length > 0) {
        const item = linesAndStickers.pop(); // Remove the last added item
        if (item instanceof Line) {
            lines.pop(); // Remove from lines if it's a line
        } else if (item instanceof Sticker) {
            stickers.pop(); // Remove from stickers if it's a sticker
        }
        undoStack.push(item!); // Add the item to undo stack
        drawingChangedEvent();
    }
});
const redoButton = document.createElement("button");
redoButton.textContent = "redo";
redoButton.id = "redoButton";
app.appendChild(redoButton);

redoButton.addEventListener("click", () => {
    const item = undoStack.pop();
    if (item) {
        if (item instanceof Line) lines.push(item);
        else stickers.push(item);
    }
    drawingChangedEvent();
});

// Thin and Thick Marker Tool Selection
const thinButton = document.createElement("button");
thinButton.textContent = "thin";
thinButton.id = "thinButton";
thinButton.classList.add("tool-button", "selectedTool");
app.appendChild(thinButton);

const thickButton = document.createElement("button");
thickButton.textContent = "thick";
thickButton.id = "thickButton";
thickButton.classList.add("tool-button");
app.appendChild(thickButton);

thinButton.addEventListener("click", () => {
    currentThickness = 2;
    thickButton.classList.remove("selectedTool");
    thinButton.classList.add("selectedTool");
});

thickButton.addEventListener("click", () => {
    currentThickness = 5;
    thinButton.classList.remove("selectedTool");
    thickButton.classList.add("selectedTool");
});

// Initial stickers data array
let stickersData = [
    { emoji: "😀", label: "Smile" },
    { emoji: "🌟", label: "Star" },
    { emoji: "🔥", label: "Fire" }
];





// Add a custom sticker button
const customStickerButton = document.createElement("button");
customStickerButton.textContent = "Add Custom Sticker";
app.appendChild(customStickerButton);

function addStickerButtons() {
    stickersData.forEach((sticker) => {
        const button = document.createElement("button");
        button.textContent = sticker.emoji;
        button.classList.add("sticker-button");
        button.addEventListener("click", () => {
            currentSticker = new Sticker(sticker.emoji, canvas.width / 2, canvas.height / 2);
            const event = new Event("tool-moved");
            canvas.dispatchEvent(event);
            redrawCanvas();
        });
        app.appendChild(button);
    });
}
addStickerButtons();

function clearStickerButtons() {
    const stickerButtons = document.querySelectorAll(".sticker-button");
    stickerButtons.forEach((button) => button.remove());
}


customStickerButton.addEventListener("click", () => {
    const userEmoji = prompt("Enter an emoji for your custom sticker:", "😊");
    if (userEmoji) {
        stickersData.push({ emoji: userEmoji, label: "Custom" });
        clearStickerButtons(); // Clear existing sticker buttons
        addStickerButtons(); // Re-render the sticker buttons
        currentSticker = new Sticker(userEmoji, canvas.width / 2, canvas.height / 2);
        redrawCanvas();
    }
});

