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
if(ctx){
    ctx.strokeStyle = 'white';
}


let isDrawing = false;

// Event handler for starting drawing
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    ctx?.beginPath();
    ctx?.moveTo(e.offsetX, e.offsetY);
});

// Event handler for drawing
canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        ctx?.lineTo(e.offsetX, e.offsetY);
        ctx?.stroke();
    }
});

// Event handler for stopping drawing
canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    ctx?.closePath();
});

// Add a "clear" button
const clearButton = document.createElement('button');
clearButton.textContent = "Clear Canvas";
clearButton.id = 'clearButton';
app.appendChild(clearButton);

// Event handler for clearing the canvas
clearButton.addEventListener('click', () => {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
});
