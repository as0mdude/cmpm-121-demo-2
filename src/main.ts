import "./style.css";

const APP_NAME = "This is a small change.";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;
