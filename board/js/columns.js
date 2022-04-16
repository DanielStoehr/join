import { Column } from "./column.class.js";
import { dragOver, dragLeave, drop } from "./dragdrop/mouse.js";
import { findTasksByColumn, moveTaskToColumn } from "./tasks.js";


const defaultColumns = [
    { id: "todo", headline: "to-do", color: { accent: "rgba(30, 30, 30, .2)", background: "white" } },
    { id: "inprogress", headline: "in progress", color: { accent: "rgba(255, 0, 0, .2)", background: "white"} },
    { id: "testing", headline: "testing", color: { accent: "rgba(0, 255, 0, .2)", background: "white" } },
    { id: "completed", headline: "complete", color: { accent: "rgba(0, 0, 255, .2)", background: "white" } },
    { id: "discussing", headline: "discussing", color: { accent: "rgba(128, 255, 255, .9)", background: "white" } },
];

const columns = []; 

const columnListeners = [
    { evt: "dragover", callback: dragOver },
    { evt: "dragleave", callback: dragLeave },
    { evt: "drop", callback: drop },
];


function addColumn(id, headline, color) {
    const col = new Column(id, headline, color);
    columns.push(col);
    col.appendTo("board");
    col.listeners = columnListeners;
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
    defaultColumns.forEach(column => addColumn(column.id, column.headline, column.color));
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