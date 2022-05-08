import { columns, currentlyDraggedColumn, moveColumn } from "../columns.js";
import { findColumnById, findColumnsIndex } from "../columns.js";
import { currentlyDraggedTask } from "../tasks.js";
import { findTaskById, removeTaskFromColumn, moveTaskToColumn, showTasks } from "../tasks.js";


// drag & drop support


function startDragging(e, id) {
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    e.dataTransfer.setData('text/plain', 'hello');
    e.target.classList.contains("task") ? startDraggingTask(id) : startDraggingColumn(id);
}


function startDraggingTask(id) {
    const task = findTaskById(id);
    if (task) {
        currentlyDraggedTask.id = task.id;
        currentlyDraggedTask.sourceColumn = task.columnId;
        highlightDraggedTask();
    }
    currentlyDraggedColumn.id = "";
}


function startDraggingColumn(id) {
    currentlyDraggedTask.id = "";
    currentlyDraggedColumn.id = id;
}


function stopDragging(e, taskId) {
    if (findTaskById(currentlyDraggedTask.id)) {
        removeDraggedTaskHighlighting();
        currentlyDraggedTask.id = "";
        currentlyDraggedColumn.id = "";
    }
}


function dragging(e, taskId) {
    //console.log("drag");
}


function dragOver(e, colId) {
    e.preventDefault();
    // e.dataTransfer.dropEffect = 'copy';
    highlight(e, colId);
}


function drop(e, colId) {
    e.preventDefault();
    if (columns.some(c => c.id == colId && !c.minimized)) {
        if (currentlyDraggedTask.id) {
            const task = findTaskById(currentlyDraggedTask.id);
            removeTaskFromColumn(task);
            moveTaskToColumn(task.id, colId);
        }
        moveColumn(currentlyDraggedColumn.id, colId);
        document.getElementById(colId).style.backgroundColor = "";
        currentlyDraggedTask.id = "";
        currentlyDraggedColumn.id = "";
        showTasks();
    }
}


function highlight(e, colId) {
    if (columns.some(c => c.id == colId && !c.minimized) && colId != currentlyDraggedTask.sourceColumn) {
        e.dataTransfer.dropEffect = 'copy';
        const col = document.getElementById(colId);
        col.style.backgroundColor = window.getComputedStyle(col).borderColor;
    }
}


function dragLeave(e, colId) {
    if (columns.some(c => c.id == colId)) {
        document.getElementById(colId).style.backgroundColor = "";
    }
}


function highlightDraggedTask() {
    const task = document.getElementById(currentlyDraggedTask.id);
    task.style.backgroundColor = window.getComputedStyle(task).borderColor;
}


function removeDraggedTaskHighlighting() {
    document.getElementById(currentlyDraggedTask.id).style.backgroundColor = "";
}


// for debugging
/*
function logDragEvent(dragEvent) {
    const col = document.getElementById("testing") || "";
    const test = document.getElementById("test") || "";
    if (col) {
        (test) ? col.removeChild(test) : false;
        col.innerHTML += '<div id="test">' + dragEvent + '</div>';
    }
}
*/


export {
    startDragging, stopDragging, dragOver, drop, dragLeave, dragging,
    highlightDraggedTask, removeDraggedTaskHighlighting,
};