import { Column } from "./column.class.js";
import { dragOver, dragLeave, drop } from "./dragdrop/mouse.js";
import { findTasksByColumn, moveTaskToColumn } from "./tasks.js";


const navAddColumn = `
<a id="add-column-link" href="#">Liste hinzufügen</a>
<div id="enter-new-column" style="display: none;">
<input id="add-column-input" name="add-column-input" type="text" maxlength="15">
<div>
<button id="add-column-cancel">Abbrechen</button>
<button id="add-column-now">Hinzufügen</button>
</div>
</div>
`.trim();

const defaultColumns = [
    { id: "todo", title: "to-do", color: { accent: "rgba(30, 30, 30, .2)" } },
    { id: "inprogress", title: "in progress", color: { accent: "rgba(255, 0, 0, .2)" } },
    { id: "testing", title: "testing", color: { accent: "rgba(0, 255, 0, .2)" } },
    { id: "completed", title: "complete", color: { accent: "rgba(0, 0, 255, .2)" } },
    { id: "discussing", title: "discussing", color: { accent: "rgba(128, 255, 255, .9)" } },
    { id: "add-column", title: navAddColumn, color: { accent: "#2369a4", title: "white" }, minimized: true },
];

const columns = []; 

const columnListeners = [
    { evt: "dragover", callback: dragOver },
    { evt: "dragleave", callback: dragLeave },
    { evt: "drop", callback: drop },
];


function addColumn(id, title, color, minimized) {
    const col = new Column(id, title, color, minimized);
    col.listeners = columnListeners;
    col.appendTo("board");
    columns.push(col);
    return columns[columns.findIndex(column => column.id == id)] || "";
}


function removeColumn(id) {
    const colIndex = columns.findIndex(column => column.id == id);
    const toRemove = columns[colIndex] || "";
    if (toRemove) {
        toRemove.removeFrom("board");
        getColumnsProperties();
        columns.splice(colIndex, 1);
        findTasksByColumn(id).forEach(task => moveTaskToColumn(task.id, "trash"));
    }
    return findTasksByColumn("trash");
}


function initColumns() {
    defaultColumns.forEach(column => addColumn(column.id, column.title, column.color, column.minimized || false));
    window.addEventListener("resize", resizeViewportListener);
    window.addEventListener("scroll", resizeViewportListener);
}


function getColumnsProperties() {
    columns.forEach(column => column.update());
}


function resizeViewportListener() {
    getColumnsProperties();
}


export { columns, columnListeners, addColumn, removeColumn, initColumns, getColumnsProperties};