import { Column } from "./column.class.js";
import { dragOver, dragLeave, drop } from "./dragdrop/mouse.js";
import { findTasksByColumn, moveTaskToColumn } from "./tasks.js";


const userAddedColumn = `
<a id="add-column-link" href="#">Liste hinzufügen</a>
<div id="enter-new-column" style="display: none;">
<input id="add-column-input" name="add-column-input" type="text" maxlength="20">
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
    { id: "add-column", title: userAddedColumn, color: { accent: "#2369a4", title: "white" }, minimized: true },
];

const columns = [];

const columnListeners = [
    { evt: "dragover", callback: dragOver },
    { evt: "dragleave", callback: dragLeave },
    { evt: "drop", callback: drop },
];


function addColumn(colId, title, color, minimized) {
    const col = new Column(colId, title, color, minimized);
    col.listeners = columnListeners;
    col.appendTo("board");
    columns.push(col);
    return columns[columns.findIndex(column => column.id == colId)] || "";
}


function removeColumn(colId) {
    const colIndex = findColumnsIndex(colId);
    const toRemove = columns[colIndex] || "";
    if (toRemove) {
        toRemove.removeFrom("board");
        getColumnsProperties();
        columns.splice(colIndex, 1);
        findTasksByColumn(colId).forEach(task => moveTaskToColumn(task.id, "trash"));
    }
    return findTasksByColumn("trash");
}


function initColumns() {
    defaultColumns.forEach(column => addColumn(column.id, column.title, column.color, column.minimized || false));
    window.addEventListener("resize", resizeViewportListener);
    window.addEventListener("scroll", resizeViewportListener);
    attachAddColumnListeners();
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


function insertUserAddedColumn(newColumnId, newColumnTitle) {
    if (!document.getElementById(newColumnId)) {
        const column = columns[columns.length - 1];
        detachAddColumnListeners();
        removeColumn(column.id);
        addColumn(newColumnId, newColumnTitle, defaultColumns[0].color, false);
        addColumn(column.id, column.title, column.color, column.minimized || false);
        attachAddColumnListeners();
    }
    console.log("id: " + newColumnId + " title: " + newColumnTitle + "\n");
}


function attachAddColumnListeners() {
    const link = document.getElementById("add-column-link");
    const inputForm = document.getElementById("enter-new-column");
    const input = document.getElementById("add-column-input");
    const cancelBtn = document.getElementById("add-column-cancel");
    const applyBtn = document.getElementById("add-column-now");
    if (link && inputForm && input && cancelBtn && applyBtn) {
        link.addEventListener('click', e => addColumnLinkListener(e, link, inputForm, input));
        input.addEventListener("input", e => inputFieldListener(e));
        input.addEventListener("keyup", e => inputFieldKeyListener(e, link, inputForm, input));
        cancelBtn.addEventListener("click", e => cancelButtonListener(e, link, inputForm, input));
        applyBtn.addEventListener("click", e => applyButtonListener(e, link, inputForm, input));
    }
}

function detachAddColumnListeners() {
    const link = document.getElementById("add-column-link");
    const inputForm = document.getElementById("enter-new-column");
    const input = document.getElementById("add-column-input");
    const cancelBtn = document.getElementById("add-column-cancel");
    const applyBtn = document.getElementById("add-column-now");
    if (link && inputForm && input && cancelBtn && applyBtn) {
        link.removeEventListener('click', e => addColumnLinkListener(e, link, inputForm, input));
        input.removeEventListener("input", e => inputFieldListener(e));
        input.removeEventListener("keyup", e => inputFieldKeyListener(e, link, inputForm, input));
        cancelBtn.removeEventListener("click", e => cancelButtonListener(e, link, inputForm, input));
        applyBtn.removeEventListener("click", e => applyButtonListener(e, link, inputForm, input));
    }
}


function addColumnLinkListener(e, link, inputForm, input) {
    e.stopPropagation();
    inputForm.style.display = "";
    input.focus();
    link.style.display = "none";
}


function inputFieldListener(e) {
    const pattern = /[a-z 0-9äöüß+-.()\/]/gi;
    e.target.value = (e.target.value.match(pattern) || []).toString().replaceAll(",", "");
}


function inputFieldKeyListener(e, link, inputForm, input) {
    const modifier = e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || e.key == "AltGraph";
    if (!modifier) {
        if (e.keyCode == 13 || e.key == "Enter") {
            applyButtonHit(link, inputForm, input);
        }
        if (e.keyCode == 27 || e.key == "Escape") {
            cancelButtonHit(link, inputForm, input);
        }
    }
    //console.log("key: " + e.key + " keyCode: " + e.keyCode);
    //console.log("shift: ", e.shiftKey, " alt: ", e.altKey, " ctrl: ", e.ctrlKey, " cmd: ", e.metaKey, " altGr: ", e.key == "AltGraph");
    //console.log("modifier: ", modifier);
}


function cancelButtonListener(e, link, inputForm, input) {
    e.stopPropagation();
    cancelButtonHit(link, inputForm, input);
}


function applyButtonListener(e, link, inputForm, input) {
    e.stopPropagation();
    applyButtonHit(link, inputForm, input);
}


function cancelButtonHit(link, inputForm, input) {
    input.value = "";
    inputForm.style.display = "none";
    link.style.display = "";
}


function applyButtonHit(link, inputForm, input) {
    const pattern = /[a-z0-9-]/gi;
    const newColumnTitle = (input.value) ? input.value : "";
    const newColumnId = (input.value.match(pattern) || []).toString().replaceAll(",", "");
    inputForm.style.display = "none";
    link.style.display = "";
    input.value = "";
    if (newColumnId) {
        insertUserAddedColumn(newColumnId, newColumnTitle);
    }
}


export { columns, columnListeners, addColumn, removeColumn, initColumns, getColumnsProperties, findColumnById };