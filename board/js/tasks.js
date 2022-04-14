import { touchStartMove, touchEnd, touchCancel, } from "./dragdrop/touch.js";
import { startDragging, stopDragging, } from "./dragdrop/mouse.js";


const tasks = [];
const currentlyDraggedTask = { id: 0, sourceColumn: "" };

const priorities = ["hoch", "mittel", "niedrig"];
const inCharge = ["ich", "du", "Müllers Kuh"];

const taskListeners = [
    { evt: "dragstart", callback: startDragging },
    { evt: "dragend", callback: stopDragging },
    { evt: "touchstart", callback: touchStartMove },
    { evt: "touchmove", callback: touchStartMove },
    { evt: "touchend", callback: touchEnd },
    { evt: "touchcancel", callback: touchCancel },
];


function addTask(columnId, description, category, priority, personInCharge) {
    let addedAt = Date.now();
    let task = {
        id: Date.now() + String(Math.floor(Math.random() * 1000)),
        description: description,
        category: category,
        priority: priority,
        addedAt: addedAt,
        inCharge: personInCharge,
        columnId: columnId,
    }
    tasks.push(task);
    tasks.sort((a, b) => a.addedAt - b.addedAt);
    return task.id;
}


function removeTask(taskId) {
    let i = findTasksIndex(taskId);
    if (i >= 0) {
        const taskExists = document.getElementById(tasks[i].id);
        taskListeners.forEach(tl => taskExists.removeEventListener(tl.evt, e => tl.callback(e, tasks[i].id)));
        document.getElementById(tasks[i].columnId).removeChild(taskExists);
        tasks.splice(i, 1);
    }
}


function showTasks() {
    tasks.forEach(task => {
        const col = document.getElementById(task.columnId);
        const taskExists = document.getElementById(task.id);
        if (taskExists) {
            col.removeChild(taskExists);
        }
        const div = createTaskContainer(task);
        div.style.border = "1px solid " + window.getComputedStyle(col).borderColor;
        col.appendChild(div);
    });
}


function createTaskContainer(task) {
    const div = document.createElement("div");
    div.id = task.id;
    div.classList.add("task");
    div.draggable = true;
    div.style.cursor = "grab";
    div.innerHTML = taskTemplate(task);
    taskListeners.forEach(tl => div.addEventListener(tl.evt, e => tl.callback(e, task.id)));
    return div;
}


function taskTemplate(task) {
    return `
    <div class="task-header">
        <h5>${task.category}</h5>
        <span>${priorities[task.priority]}</span>
    </div>
    <div class="task-body">
        <p>${task.description}</p>
    </div>
    <div class="task-footer">
        <span>${new Date(task.addedAt).toLocaleString()}</span>
    </div>
    `.trim();
}


function findTaskById(taskId) {
    return tasks[tasks.findIndex(task => task.id == taskId)] || "";
}


function findTasksIndex(taskId) {
    return tasks.findIndex(task => task.id == taskId);
}


function moveTaskToColumn(taskId, columnId) {
    tasks[findTasksIndex(taskId)].columnId = columnId;
}


function removeTaskFromColumn(task) {
    const taskItem = document.getElementById(task.id);
    const column = document.getElementById(task.columnId);
    taskListeners.forEach(tl => taskItem.removeEventListener(tl.evt, e => tl.callback(e, task.id)));
    column.removeChild(taskItem);
}


export { tasks, priorities, inCharge, currentlyDraggedTask, };
export { findTaskById, findTasksIndex, removeTaskFromColumn, moveTaskToColumn, showTasks, addTask, removeTask, taskTemplate };