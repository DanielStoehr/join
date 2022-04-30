import { Column } from "./column.class.js";
import { dragOver, dragLeave, drop } from "./dragdrop/mouse.js";
import { findTasksByColumn, moveTaskToColumn, showTasks } from "./tasks.js";
import { attachAddColumnListeners } from "./column-user-func.js";



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
    { id: "complete", title: "complete", color: { accent: "rgba(0, 0, 255, .2)" }, },
    { id: "discussing", title: "discussing", color: { accent: "rgba(128, 255, 255, .9)" }, },
    { id: "add-column", title: userAddedColumn, color: { accent: "#2369a4", title: "white" }, minimized: true, board: "board" },
];

const columns = [];
const removedColumns = [];

const columnListeners = [
    { evt: "dragover", callback: dragOver },
    { evt: "dragleave", callback: dragLeave },
    { evt: "drop", callback: drop },
];


function addColumn(colId, title, color, minimized, boardId, beforeCol) {
    const col = new Column(colId, title, color, minimized);
    col.listeners = columnListeners;
    col.appendTo(boardId || "board", beforeCol);
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
    return (column.id != "add-column") ? removedColumns.push({ index: index, column: column }) : false;
}


function restoreColumn(e, index) {
    if (removedColumns.length) {
        const toRestore = (index < 0) ? removedColumns.pop() : removedColumns.splice(index, 1)[0];
        if (!document.getElementById(toRestore.id)) {
            const beforeColumn = columns[(toRestore.index < columns.length) ? toRestore.index : columns.length - 1].id;
            toRestore.column.appendTo(toRestore.column.board, beforeColumn);
            columns.splice(toRestore.index, 0, toRestore.column);
            showTasks();
            getColumnsProperties();
        }
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
    undo.addEventListener("click", e => restoreColumn(e, -1));
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


function findRemovedColumnById(colId) {
    const rc = removedColumns.find(rc => rc.column.id == colId) || "";
    return (rc) ? rc.column.id : "";
}


function findRemovedColumnsIndex(colId) {
    return removedColumns.findIndex(rc => rc.column.id == colId);
}


function removeColumnListener(e, colId) {
    e.stopPropagation();
    const tasks = removeColumn(colId);
    console.log("requested remove col: '" + colId + "'\n");
    console.log("tasks in removed col: '", tasks, "'\n");
}

export { columns, columnListeners, addColumn, removeColumn, restoreColumn };
export { initColumns, getColumnsProperties, findColumnById, findRemovedColumnById, findRemovedColumnsIndex };
export { removeColumnListener as closeColumnClicked };