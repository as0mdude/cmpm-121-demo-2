import "./style.css";

const APP_NAME = "sketchbox.";
const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;
app.innerHTML = `<h1>${APP_NAME}</h1>`;

// Create a canvas element
const canvas = document.createElement('canvas');
canvas.width = 256;
canvas.height = 256;
canvas.id = 'myCanvas';
app.appendChild(canvas);

const ctx = canvas.getContext('2d');
let isDrawing = false;

// Default line thickness (set to thin by default)
let currentThickness = 2;

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
            ctx.lineWidth = this.thickness;  // Set the thickness based on the line's thickness
            for (let i = 1; i < this.points.length; i++) {
                ctx.lineTo(this.points[i].x, this.points[i].y);
            }
            ctx.stroke();
            ctx.closePath();
        }
    }
}

// Arrays for storing Line objects
let lines: Array<Line> = [];
const undoStack: Array<Line> = [];

if (ctx) {
    ctx.strokeStyle = 'white';
}

function redrawCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lines.forEach(line => line.display(ctx));
}

function drawingChangedEvent() {
    const event = new Event('drawing-changed');
    canvas.dispatchEvent(event);
}

canvas.addEventListener('drawing-changed', () => {
    redrawCanvas();
});

// Event handler for starting drawing
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const newLine = new Line(e.offsetX, e.offsetY, currentThickness);
    lines.push(newLine);  // Add new line to the lines array
    if (lines.length > 0) {
        undoStack.splice(0, undoStack.length);  // Clear undo stack if a new line is added
    }
    drawingChangedEvent();
});

// Event handler for drawing
canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    lines[lines.length - 1].drag(e.offsetX, e.offsetY);
    drawingChangedEvent();
});

// Event handler for stopping drawing
canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

// Add a "clear" button
const clearButton = document.createElement('button');
clearButton.textContent = "clear canvas";
clearButton.id = 'clearButton';
app.appendChild(clearButton);

// Event handler for clearing the canvas
clearButton.addEventListener('click', () => {
    lines = [];
    drawingChangedEvent();
});

const undoButton = document.createElement('button');
undoButton.textContent = "undo";
undoButton.id = 'undoButton';
app.appendChild(undoButton);

// Event handler for undo-ing the last line
undoButton.addEventListener('click', () => {
    if (lines.length > 0) {
        const line = lines.pop();
        if (line) {
            undoStack.push(line);
        }
        drawingChangedEvent();
    }
});

const redoButton = document.createElement('button');
redoButton.textContent = "redo";
redoButton.id = 'redoButton';
app.appendChild(redoButton);

// Event handler for redo-ing the last undone line
redoButton.addEventListener('click', () => {
    if (undoStack.length > 0) {
        const line = undoStack.pop();
        if (line) {
            lines.push(line);
        }
        drawingChangedEvent();
    }
});

// Add "thin" and "thick" buttons for marker tool selection
const thinButton = document.createElement('button');
thinButton.textContent = "thin";
thinButton.id = 'thinButton';
thinButton.classList.add('tool-button', 'selectedTool');  // Default selected
app.appendChild(thinButton);

const thickButton = document.createElement('button');
thickButton.textContent = "thick";
thickButton.id = 'thickButton';
thickButton.classList.add('tool-button');
app.appendChild(thickButton);

// Event handler for switching to thin marker
thinButton.addEventListener('click', () => {
    currentThickness = 2;  // Set thin marker thickness
    thickButton.classList.remove('selectedTool');
    thinButton.classList.add('selectedTool');  // Add selected styling
});

// Event handler for switching to thick marker
thickButton.addEventListener('click', () => {
    currentThickness = 5;  // Set thick marker thickness
    thinButton.classList.remove('selectedTool');
    thickButton.classList.add('selectedTool');  // Add selected styling
});
