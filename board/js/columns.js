import { Column } from "./column.class.js";
import { dragOver, dragLeave, drop } from "./dragdrop/mouse.js";
import { findTasksByColumn, moveTaskToColumn } from "./tasks.js";


const defaultColumns = [
    { id: "todo", headline: "to-do", accent: "rgba(30, 30, 30, .2)", background: "white" },
    { id: "inprogress", headline: "in progress", accent: "rgba(255, 0, 0, .2)", background: "white" },
    { id: "testing", headline: "testing", accent: "rgba(0, 255, 0, .2)", background: "white" },
    { id: "completed", headline: "complete", accent: "rgba(0, 0, 255, .2)", background: "white" },
    { id: "discussing", headline: "discussing", accent: "rgba(128, 255, 255, .9)", background: "white" },
];

const columns = []; 

const columnListeners = [
    { evt: "dragover", callback: dragOver },
    { evt: "dragleave", callback: dragLeave },
    { evt: "drop", callback: drop },
];


function addColumn(id, headline, color) {
    const col = new Column(id, headline);
    col.color = color;
    columns.push(col);
    col.appendTo("board");
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
    defaultColumns.forEach(column => {
        const col = new Column(column.id, column.headline);
        col.color.accent = column.accent;
        col.color.background = column.background;
        col.appendTo("board");
        columns.push(col);
    });
    window.addEventListener("resize", resizeViewportListener);
    window.addEventListener("scroll", resizeViewportListener);
}


function getColumnsProperties() {
    columns.forEach(column => {
        column.update();
    });
}


function resizeViewportListener() {
    getColumnsProperties();
}


export { columns, columnListeners, addColumn, removeColumn, initColumns, getColumnsProperties};