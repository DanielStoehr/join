import { columns } from "../columns.js";
import { currentlyDraggedTask, taskTemplate } from "../tasks.js";
import { findTaskById, moveTaskToColumn, removeTaskFromColumn, showTasks } from "../tasks.js";
import { highlightDraggedTask, removeDraggedTaskHighlighting, } from "./mouse.js";
//import { colTest } from "../script.js";

// support for mobile touch devices

const touch = {
    x: 0,
    y: 0,
    active: false,
}

const placeholder = { task: "" };


function touchStartMove(e, taskId) {
    e.preventDefault();
    currentlyDraggedTask.id = taskId;
    currentlyDraggedTask.sourceColumn = findTaskById(taskId).columnId;
    touch.x = parseInt(e.changedTouches[0].clientX);
    touch.y = parseInt(e.changedTouches[0].clientY);
    addPlaceholderToColumn();
    highlightDraggedTask();
    highlightTouchedColumn();
    positionTouchedTaskFreely();
}


function touchEnd(e, taskId) {
    e.preventDefault();
    removeTouchHighlighting();
    removeDraggedTaskHighlighting();
    const colId = getTouchTargetColumn() || currentlyDraggedTask.sourceColumn;
    let task = findTaskById(taskId);
    removeTaskFromColumn(task);
    moveTaskToColumn(taskId, colId);
    removePlaceholderFromColumn();
    showTasks();
}


function touchCancel(e, taskId) {
    e.preventDefault();
    removeTouchHighlighting();
    removeDraggedTaskHighlighting();
    document.getElementById(currentlyDraggedTask.id).style.position = "";
    removePlaceholderFromColumn();
    showTasks();
}


function getTouchTargetColumn() {
    let col = "";
    columns.forEach(c => {
        if (touch.x >= c.x && touch.x <= c.x + c.width && touch.y >= c.y && touch.y <= c.y + c.height) {
            col = c.id;
        }
    });
    return col;
}


function highlightTouchedColumn() {
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
    task.style.position = "absolute";
    task.style.left = touch.x - (pos.width / 2) + "px";
    task.style.top = touch.y - (pos.height / 2) + "px";
}


function addPlaceholderToColumn() {
    if (!touch.active) {
        touch.active = true;
        let task = findTaskById(currentlyDraggedTask.id);
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
    touch.active = false;
    const column = document.getElementById(currentlyDraggedTask.sourceColumn);
    const placeholder = document.getElementById("touched");
    column.removeChild(placeholder);
}


export { touch, touchStartMove, touchEnd, touchCancel };