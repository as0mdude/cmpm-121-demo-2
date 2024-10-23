import "./style.css";

const APP_NAME = "sketchbox.";
const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;
app.innerHTML = `<h1>${APP_NAME}</h1>`;

const canvas = document.createElement('canvas');
canvas.width = 256;
canvas.height = 256;
canvas.id = 'myCanvas';
app.appendChild(canvas);

const ctx = canvas.getContext('2d');
let isDrawing = false;
let currentThickness = 2;

let lines = [];
const undoStack = [];
let toolPreview = { x: 0, y: 0, isVisible: false };

if (ctx) {
    ctx.strokeStyle = 'white';
}

function createLine(startX, startY, thickness) {
    return {
        points: [{ x: startX, y: startY }],
        thickness: thickness,
        drag(x, y) {
            this.points.push({ x, y });
        },
        display(ctx) {
            if (!ctx || this.points.length === 0) return;
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            ctx.lineWidth = this.thickness;
            this.points.slice(1).forEach(point => {
                ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
            ctx.closePath();
        }
    };
}

function updateToolPreview(x, y) {
    toolPreview.x = x;
    toolPreview.y = y;
}

function drawToolPreview(ctx) {
    if (toolPreview.isVisible) {
        ctx.beginPath();
        ctx.arc(toolPreview.x, toolPreview.y, currentThickness, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }
}

function redrawCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lines.forEach(line => line.display(ctx));
    drawToolPreview(ctx);
}

function drawingChangedEvent() {
    canvas.dispatchEvent(new Event('drawing-changed'));
}

canvas.addEventListener('drawing-changed', redrawCanvas);

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const newLine = createLine(e.offsetX, e.offsetY, currentThickness);
    lines.push(newLine);
    toolPreview.isVisible = false;
    if (lines.length > 0) {
        undoStack.length = 0;
    }
    drawingChangedEvent();
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        lines[lines.length - 1].drag(e.offsetX, e.offsetY);
        drawingChangedEvent();
    } else {
        updateToolPreview(e.offsetX, e.offsetY);
        toolPreview.isVisible = true;
        redrawCanvas();
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

const clearButton = document.createElement('button');
clearButton.textContent = "clear canvas";
clearButton.id = 'clearButton';
app.appendChild(clearButton);

clearButton.addEventListener('click', () => {
    lines = [];
    drawingChangedEvent();
});

const undoButton = document.createElement('button');
undoButton.textContent = "undo";
undoButton.id = 'undoButton';
app.appendChild(undoButton);

undoButton.addEventListener('click', () => {
    if (lines.length > 0) {
        undoStack.push(lines.pop());
        drawingChangedEvent();
    }
});

const redoButton = document.createElement('button');
redoButton.textContent = "redo";
redoButton.id = 'redoButton';
app.appendChild(redoButton);

redoButton.addEventListener('click', () => {
    if (undoStack.length > 0) {
        lines.push(undoStack.pop());
        drawingChangedEvent();
    }
});

const thinButton = document.createElement('button');
thinButton.textContent = "thin";
thinButton.id = 'thinButton';
thinButton.classList.add('tool-button', 'selectedTool');
app.appendChild(thinButton);

const thickButton = document.createElement('button');
thickButton.textContent = "thick";
thickButton.id = 'thickButton';
thickButton.classList.add('tool-button');
app.appendChild(thickButton);

thinButton.addEventListener('click', () => {
    currentThickness = 2;
    thickButton.classList.remove('selectedTool');
    thinButton.classList.add('selectedTool');
});

thickButton.addEventListener('click', () => {
    currentThickness = 5;
    thinButton.classList.remove('selectedTool');
    thickButton.classList.add('selectedTool');
});