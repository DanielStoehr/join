import { columns } from "../columns.js";
import { currentlyDraggedTask } from "../tasks.js";
import { findTaskById, removeTaskFromColumn, moveTaskToColumn, showTasks } from "../tasks.js";


// drag & drop support

function startDragging(e, taskId) {
    const task = findTaskById(taskId);
    if (task) {
        currentlyDraggedTask.id = taskId;
        currentlyDraggedTask.sourceColumn = task.columnId;
        highlightDraggedTask();
    }
}


function stopDragging(e, taskId) {
    if (findTaskById(currentlyDraggedTask.id)) {
        removeDraggedTaskHighlighting();
    }
}


function dragOver(e) {
    e.preventDefault();
    highlight(e);
}


function drop(e) {
    if (columns.some(c => c.id == e.target.id)) {
        // || colTest.some(c => c.id == e.target.id)) {
        const task = findTaskById(currentlyDraggedTask.id);
        removeTaskFromColumn(task);
        moveTaskToColumn(task.id, e.target.id);
        e.target.style.backgroundColor = "";
        showTasks();
    }
}


function highlight(e) {
    if (columns.some(c => c.id == e.target.id) && e.target.id != currentlyDraggedTask.sourceColumn) {
        e.target.style.backgroundColor = window.getComputedStyle(e.target).borderColor;
    }
    //if (colTest.some(c => c.id == e.target.id) && e.target.id != currentlyDraggedTask.sourceColumn) {
    //    e.target.style.backgroundColor = window.getComputedStyle(e.target).borderColor;
    //}
}


function dragLeave(e) {
    if (columns.some(c => c.id == e.target.id)) {
    // || colTest.some(c => c.id == e.target.id)) {
        e.target.style.backgroundColor = "";
    }
}


function highlightDraggedTask() {
    const task = document.getElementById(currentlyDraggedTask.id);
    task.style.backgroundColor = window.getComputedStyle(task).borderColor;
}


function removeDraggedTaskHighlighting() {
    document.getElementById(currentlyDraggedTask.id).style.backgroundColor = "";
}


export { 
    startDragging, stopDragging, dragOver, drop, dragLeave, 
    highlightDraggedTask, removeDraggedTaskHighlighting, currentlyDraggedTask };