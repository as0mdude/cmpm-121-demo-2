import "./style.css";

const APP_NAME = "My app";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

const title = document.createElement('h1');
title.textContent = 'My Cool App';
document.body.appendChild(title);



// Create a canvas element
const canvas = document.createElement('canvas');
canvas.width = 256;
canvas.height = 256;
canvas.id = 'myCanvas';  // Add an ID to reference in CSS
document.body.appendChild(canvas);
