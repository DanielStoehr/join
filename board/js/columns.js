import { dragOver, dragLeave, drop } from "./dragdrop/mouse.js";

// first static design
// will be changed soon

const columns = [
    { id: "todo", x: 0, y: 0, width: 180, height: 564 },
    { id: "inprogress", x: 200, y: 0, width: 180, height: 564 },
    { id: "testing", x: 400, y: 0, width: 180, height: 564 },
    { id: "completed", x: 600, y: 0, width: 180, height: 564 },
    { id: "discussing", x: 800, y: 0, width: 180, height: 564 },
];

const columnListeners = [
    { evt: "dragover", callback: dragOver },
    { evt: "dragleave", callback: dragLeave },
    { evt: "drop", callback: drop },
];


function initColumns() {
    columns.forEach(column => {
        const col = getColumnsProperties(column);
        columnListeners.forEach(cl => col.addEventListener(cl.evt, e => cl.callback(e)));
    });
    window.addEventListener("resize", resizeViewportListener);
    window.addEventListener("scroll", resizeViewportListener);

}


function getColumnsProperties(column) {
    const col = document.getElementById(column.id);
    const pos = col.getBoundingClientRect();
    column.x = Math.floor(pos.left);
    column.y = Math.floor(pos.top);
    column.width = Math.floor(pos.width);
    column.height = Math.floor(pos.height);
    return col;
}


function resizeViewportListener() {
    columns.forEach(column => {
        const col = getColumnsProperties(column);
    })
}


export { columns, columnListeners, initColumns };