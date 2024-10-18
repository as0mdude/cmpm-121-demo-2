import "./style.css";

const APP_NAME = "sketch.";
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

// Creating the arrays for drawing
let lines: Array<Array<{ x: number, y: number }>> = [];
const undoStack: Array<Array<{ x: number, y: number }>> = [];

if (ctx) {
    ctx.strokeStyle = 'white';
}

function addPoint(x: number, y: number) {
    lines[lines.length - 1].push({x, y});
    drawingChangedEvent();
}

function redrawCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    lines.forEach(line => {
        ctx.beginPath();
        if (line.length > 0) {
            ctx.moveTo(line[0].x, line[0].y);
            for (let i = 1; i < line.length; i++) {
                ctx.lineTo(line[i].x, line[i].y);
            }
        }
        ctx.stroke();
        ctx.closePath();
    });
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
    lines.push([]);  // Start a new line
    addPoint(e.offsetX, e.offsetY);
    if (lines.length > 0) {
        undoStack.splice(0, undoStack.length);
    }
});

// Event handler for drawing
canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    addPoint(e.offsetX, e.offsetY);
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
        const line = lines.pop()
        if(line){
            undoStack.push(line)
        }
        drawingChangedEvent();
    }
});

const redoButton = document.createElement('button');
redoButton.textContent = "redo";
redoButton.id = 'redoButton';
app.appendChild(redoButton);

redoButton.addEventListener('click', () => {
    if (undoStack.length > 0) {
        const line = undoStack.pop()
        if(line){
            lines.push(line)
        }
        drawingChangedEvent();
    }
});
