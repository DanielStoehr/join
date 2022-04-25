import { Column } from "./column.class.js";
import { dragOver, dragLeave, drop } from "./dragdrop/mouse.js";
import { findTasksByColumn, moveTaskToColumn, showTasks } from "./tasks.js";
import { attachAddColumnListeners, detachAddColumnListeners, removeColumnRequestedByUser } from "./column-user-func.js";



const userAddedColumn = `
<div id="add-column-link">Liste hinzufügen</div>
<div id="enter-new-column" style="display: none;">
    <div id="add-column-input-bg"></div>
    <input id="add-column-input" name="add-column-input" type="text" maxlength="20" placeholder="click to change color">
    <div id="add-column-buttons">
        <button id="add-column-cancel">Abbrechen</button>
        <button id="add-column-now">Hinzufügen</button>
    </div>
</div>
`.trim();

const defaultColumns = [
    { id: "todo", title: "to-do", color: { accent: "rgba(30, 30, 30, .2)" }, },
    { id: "inprogress", title: "in progress", color: { accent: "rgba(255, 0, 0, .2)" }, },
    { id: "testing", title: "testing", color: { accent: "rgba(0, 255, 0, .2)" }, },
    { id: "completed", title: "complete", color: { accent: "rgba(0, 0, 255, .2)" }, },
    { id: "discussing", title: "discussing", color: { accent: "rgba(128, 255, 255, .9)" }, },
    { id: "add-column", title: userAddedColumn, color: { accent: "#2369a4", title: "white" }, minimized: true,  board: "board" },
];

const columns = [];
const removedColumns = [];

const columnListeners = [
    { evt: "dragover", callback: dragOver },
    { evt: "dragleave", callback: dragLeave },
    { evt: "drop", callback: drop },
];



function addColumn(colId, title, color, minimized, boardId) {
    const col = new Column(colId, title, color, minimized);
    col.listeners = columnListeners;
    col.appendTo(boardId || "board");
    columns.push(col);
    return columns[columns.findIndex(column => column.id == colId)] || "";
}


function removeColumn(colId) {
    const colIndex = findColumnsIndex(colId);
    const toRemove = columns[colIndex] || "";
    if (toRemove) {
        backupRemovedColumn(toRemove, colIndex);
        toRemove.removeFrom(toRemove.board);
        getColumnsProperties();
        columns.splice(colIndex, 1);
        //findTasksByColumn(colId).forEach(task => moveTaskToColumn(task.id, "trash"));
    }
    return findTasksByColumn(colId);
}


function backupRemovedColumn(column, index) {
    removedColumns.push({index: index, column: column});
    console.log(column.id, index);
    console.log(removedColumns);
}


function restoreColumn() {
    if (removedColumns.length) {
        detachAddColumnListeners();
        let toRestore = removedColumns.pop();
        columns.forEach(column => column.removeFrom(column.board));
        columns.splice(toRestore.index, 0, toRestore.column);
        columns.forEach(column => column.appendTo(column.board));
        attachAddColumnListeners();
        showTasks();
        getColumnsProperties();
    }
}


function initColumns() {
    defaultColumns.forEach(column => addColumn(column.id, column.title, column.color, column.minimized || false, column.board || "board"));
    window.addEventListener("resize", resizeViewportListener);
    window.addEventListener("scroll", resizeViewportListener);
    attachAddColumnListeners();
    setupUndoIcon();
}


function setupUndoIcon() {
    const parent = document.getElementById("board-container");
    const undo = document.createElement("div");
    undo.id = "undo";
    undo.innerHTML = "&#xee0b;"
    parent.appendChild(undo);
    undo.addEventListener("click", restoreColumn);
}


function getColumnsProperties() {
    columns.forEach(column => column.update());
}


function resizeViewportListener() {
    getColumnsProperties();
}


function findColumnById(colId) {
    return columns[columns.findIndex(column => column.id == colId)] || "";
}


function findColumnsIndex(colId) {
    return columns.findIndex(column => column.id == colId);
}


function removeColumnListener(e, colId) {
    removeColumnRequestedByUser(e, colId);
}

export { columns, columnListeners, addColumn, removeColumn, restoreColumn, initColumns, getColumnsProperties, findColumnById };
export { removeColumnListener as closeColumnClicked };