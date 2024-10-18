import "./style.css";

const APP_NAME = "sketch.";
const app = document.querySelector<HTMLDivElement>("#app")!;

// Set the document title
document.title = APP_NAME;

// Add the app name to the app div
app.innerHTML = `<h1>${APP_NAME}</h1>`;

// Create a canvas element
const canvas = document.createElement('canvas');
canvas.width = 256;
canvas.height = 256;
canvas.id = 'myCanvas';  // Add an ID to reference in CSS

// Append the canvas to the app div
app.appendChild(canvas);

const ctx = canvas.getContext('2d');

let lines: Array<Array<{ x: number, y: number }>> = [];
let currentLine: Array<{ x: number, y: number }> = [];

if(ctx){
    ctx.strokeStyle = 'white';
}

let isDrawing = false;

function addPoint(x: number, y: number){
    currentLine.push({x, y});
    drawingChangedEvent();

}

function redrawCanvas(){
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw each line
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
    currentLine = [];
    addPoint(e.offsetX, e.offsetY);
    lines.push(currentLine);  // Save the current line
    drawingChangedEvent(); 
    
});

// Event handler for drawing
canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    addPoint(e.offsetX, e.offsetY);
});

// Event handler for stopping drawing
canvas.addEventListener('mouseup', () => {
    if (isDrawing) {
        isDrawing = false;
        lines.push(currentLine);  // Save the current line
        drawingChangedEvent();  // Trigger the drawing changed event
    }
});

// Add a "clear" button
const clearButton = document.createElement('button');
clearButton.textContent = "Clear Canvas";
clearButton.id = 'clearButton';
app.appendChild(clearButton);

// Event handler for clearing the canvas
clearButton.addEventListener('click', () => {
    lines = [];  // Reset the lines array
    drawingChangedEvent();  // Trigger redraw
});
