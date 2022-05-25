import { Column } from "../column.class.js";
import { columns, currentlyDraggedColumn } from "../columns.js";
import { getColumnsProperties, findColumnById, moveColumn } from "../columns.js";
import { currentlyDraggedTask, taskTemplate } from "../tasks.js";
import { findTaskById, moveTaskToColumn, removeTaskFromColumn, showTasks } from "../tasks.js";
import { highlightDraggedTask, removeDraggedTaskHighlighting, } from "./mouse.js";


// support for mobile touch devices

const touch = {
    x: 0,
    y: 0,
    active: false,
}


function touchStart(e, id) {
    //e.preventDefault();
    e.stopPropagation();
    currentlyDraggedTask.id = "";
    currentlyDraggedColumn.id = "";
    touch.x = parseInt(e.changedTouches[0].clientX);
    touch.y = parseInt(e.changedTouches[0].clientY);
}


function touchMove(e, id) {
    e.preventDefault();
    e.stopPropagation();
    touch.x = parseInt(e.changedTouches[0].clientX);
    touch.y = parseInt(e.changedTouches[0].clientY);
    const touchedElement = document.getElementById(id);
    (touchedElement.classList.contains("task")) ? touchMoveTask(e, id) : touchMoveColumn(e, id);
}


function touchMoveTask(e, id) {
    currentlyDraggedTask.id = id;
    currentlyDraggedColumn.id = "";
    currentlyDraggedTask.sourceColumn = findTaskById(id).columnId;
    addPlaceholderToColumn();
    highlightDraggedTask();
    highlightTouchedColumn();
    positionTouchedTaskFreely();
}


function touchMoveColumn(e, id) {
    if (id != "add-column") {
        currentlyDraggedTask.id = "";
        currentlyDraggedColumn.id = id;
        addPlaceholderColumn();
        highlightTouchedColumn();
        positionTouchedColumnFreely();
    }
}


function touchEnd(e, id) {
    e.stopPropagation();
    if (currentlyDraggedTask.id) {
        removeTouchHighlighting();
        removeDraggedTaskHighlighting();
        const colId = getTouchTargetColumn() || currentlyDraggedTask.sourceColumn;
        let task = findTaskById(currentlyDraggedTask.id);
        removeTaskFromColumn(task);
        moveTaskToColumn(currentlyDraggedTask.id, colId);
        removePlaceholderFromColumn();
    }
    if (currentlyDraggedColumn.id) {
        removeTouchHighlighting();
        document.getElementById(currentlyDraggedColumn.id).style.position = "";
        removePlaceholderColumn();
        moveColumn(currentlyDraggedColumn.id, getTouchTargetColumn());
    }
    showTasks();
    getColumnsProperties();
}


function touchCancel(e, id) {
    e.stopPropagation();
    removeTouchHighlighting();
    if (currentlyDraggedTask.id) {
        removeDraggedTaskHighlighting();
        document.getElementById(currentlyDraggedTask.id).style.position = "";
        removePlaceholderFromColumn();
    }
    if (currentlyDraggedColumn.id) {
        document.getElementById(currentlyDraggedColumn.id).style.position = "";
        removePlaceholderColumn();
    }
    showTasks();
}


function getTouchTargetColumn() {
    let col = "";
    getColumnsProperties();
    columns.forEach(c => {
        if (touch.x >= c.x && touch.x <= c.x + c.width && touch.y >= c.y && touch.y <= c.y + c.height) {
            col = (c.minimized) ? "" : c.id;
        }
    });
    return col;
}


function highlightTouchedColumn() {
    getColumnsProperties();
    columns.forEach(c => {
        if (c.id != currentlyDraggedTask.sourceColumn) {
            const col = document.getElementById(c.id);
            switch (touch.x >= c.x && touch.x <= c.x + c.width && touch.y >= c.y && touch.y <= c.y + c.height) {
                case true:
                    col.style.backgroundColor = window.getComputedStyle(col).borderColor;
                    break;
                case false:
                    col.style.backgroundColor = "";
            }
        }
    });
}


function removeTouchHighlighting() {
    columns.forEach(column => {
        const col = document.getElementById(column.id);
        col.style.backgroundColor = "";
    });
}


function positionTouchedTaskFreely() {
    const task = document.getElementById(currentlyDraggedTask.id);
    const pos = task.getBoundingClientRect();
    task.style.position = "fixed";
    task.style.left = touch.x - (pos.width / 2) + "px";
    task.style.top = touch.y - (pos.height / 2) + "px";
}


function positionTouchedColumnFreely() {
    const col = document.getElementById(currentlyDraggedColumn.id);
    col.style.position = "fixed";
    getColumnsProperties();
    const pos = col.getBoundingClientRect();
    col.style.left = touch.x - (pos.width / 2) + "px";
    col.style.top = touch.y - (pos.height / 2) + "px";
}


function addPlaceholderToColumn() {
    if (!touch.active) {
        touch.active = true;
        const task = findTaskById(currentlyDraggedTask.id);
        const taskItem = document.getElementById(task.id);
        const column = document.getElementById(currentlyDraggedTask.sourceColumn);
        const div = document.createElement("div");
        const html = taskTemplate(task);
        div.innerHTML = html;
        div.id = "touched";
        div.classList.add("task");
        column.insertBefore(div, taskItem);
        div.style.backgroundColor = window.getComputedStyle(taskItem).borderColor;
        div.style.border = window.getComputedStyle(taskItem).border;
    }
}


function removePlaceholderFromColumn() {
    if (touch.active) {
        touch.active = false;
        const column = document.getElementById(currentlyDraggedTask.sourceColumn);
        const placeholder = document.getElementById("touched");
        column.removeChild(placeholder);
    }
}


function addPlaceholderColumn() {
    if (!touch.active) {
        touch.active = true;
        const column = findColumnById(currentlyDraggedColumn.id);
        const placeholder = new Column("touched-col", column.title, column.color, false);
        currentlyDraggedColumn.placeholder = placeholder;
        placeholder.listeners = [];
        placeholder.footerListener = {};
        placeholder.closeListener = {};
        placeholder.color.background = column.color.accent;
        placeholder.appendTo(column.board || "board", currentlyDraggedColumn.id);
    }
}


function removePlaceholderColumn() {
    if (touch.active) {
        touch.active = false;
        currentlyDraggedColumn.placeholder.removeFrom(currentlyDraggedColumn.placeholder.board);
        currentlyDraggedColumn.placeholder = {};
    }
}



export { touch, touchStart, touchMove, touchEnd, touchCancel };