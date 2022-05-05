import { touchStart, touchMove, touchEnd, touchCancel, } from "./dragdrop/touch.js";
import { startDragging, stopDragging, dragging } from "./dragdrop/mouse.js";
import { backend, setURL, downloadFromServer, jsonFromServer } from "../../smallest_backend_ever/mini_backend_module.js";


const tasks = [];
const currentlyDraggedTask = { id: 0, sourceColumn: "" };

const defaultPriorities = ["niedrig", "mittel", "hoch"];
const priorities = [];
const defaultPersons = ["Max", "Daniel", "Lukas", "wolfgang"];
const inCharge = [];

const taskListeners = [
    { evt: "dragstart", callback: startDragging },
    { evt: "dragend", callback: stopDragging },
    { evt: "touchstart", callback: touchStart },
    { evt: "touchmove", callback: touchMove },
    { evt: "touchend", callback: touchEnd },
    { evt: "touchcancel", callback: touchCancel },
    { evt: "click", callback: taskClicked },
    { evt: "focusout", callback: taskOutOfFocus },
];


/**********************************
**     task's core functions     **
**********************************/


function addTask(columnId, title, description, category, priority, deadline, personInCharge) {
    let addedAt = Date.now();
    let task = {
        id: 't' + Date.now() + String(Math.floor(Math.random() * 1000)),
        title: title,
        description: description,
        category: category,
        priority: priority,
        deadline: new Date(deadline).getTime(),
        addedAt: addedAt,
        inCharge: personInCharge,
        columnId: columnId,
    }
    tasks.push(task);
    writeAllTasksToBackend();
    return task.id;
}


function removeTask(taskId) {
    let i = findTasksIndex(taskId);
    if (i >= 0) {
        const taskExists = document.getElementById(tasks[i].id);
        taskListeners.forEach(tl => taskExists.removeEventListener(tl.evt, e => tl.callback(e, tasks[i].id)));
        document.getElementById(tasks[i].columnId).removeChild(taskExists);
        tasks.splice(i, 1);
        writeAllTasksToBackend();
    }
}


function showTasks() {
    tasks.sort((a, b) => a.deadline - b.deadline);
    tasks.forEach(task => {
        const col = document.getElementById(task.columnId);
        if (col) {
            const taskExists = document.getElementById(task.id);
            (taskExists) ? col.removeChild(taskExists) : false;
            const div = createTaskContainer(task);
            div.style.border = "1px solid " + window.getComputedStyle(col).borderColor;
            col.insertBefore(div, col.lastElementChild);
        }
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
        <h5 class="task-category">${task.category}</h5>
        <span class="task-priority">${priorities[task.priority]}</span>
    </div>
    <div class="task-body">
        <p class="task-title">${task.title}</p>
        <p class="task-description" style="display: none;">${task.description}</p>
    </div>
    <div class="task-footer">
        <span class="task-incharge">${task.inCharge}: </span>
        <span class="task-deadline">${new Date(task.deadline).toLocaleString().slice(0, -10)}</span>
        <span class="task-added-at">${new Date(task.addedAt).toLocaleString()}</span>
    </div>
    `.trim();
}


function moveTaskToColumn(taskId, columnId) {
    tasks[findTasksIndex(taskId)].columnId = columnId;
    writeAllTasksToBackend();
}


function removeTaskFromColumn(task) {
    const taskItem = document.getElementById(task.id);
    const column = document.getElementById(task.columnId);
    taskListeners.forEach(tl => taskItem.removeEventListener(tl.evt, e => tl.callback(e, task.id)));
    column.removeChild(taskItem);
}


/******************************
**     utility functions     **
******************************/


function findTaskById(taskId) {
    return tasks[tasks.findIndex(task => task.id == taskId)] || "";
}


function findTasksByColumn(ColumnId) {
    return tasks.filter(task => task.columnId == ColumnId);
}


function findTasksIndex(taskId) {
    return tasks.findIndex(task => task.id == taskId);
}


function parseEuDate(date) {
    return new Date(date.split(".").map((d, i) => (i == 2) ? (d.length == 1 ? "200" + d : "20" + d).slice(-4) : ("00" + d).slice(-2)).reverse().join("-")).getTime();
}


function euDateToUtc(date) {
    return date.split(".").map((d, i) => (i == 2) ? (d.length == 1 ? "200" + d : "20" + d).slice(-4) : ("00" + d).slice(-2)).reverse().join("-");
}


/************************************
**       event listeners and       **
**       related functions         **
*************************************/


function addTaskListener(e) {
    e.stopPropagation();
    insertUserAddedTask(e);
}


function insertUserAddedTask(e) {
    const col = e.target.parentNode;
    console.log("add task to '" + col.id + "'\n");
    addTask(col.id, "neue Aufgabe", "Beschreibung", "allgemein", 1, euDateToUtc(new Date().toLocaleString().slice(0, -10)), inCharge[3]);
    showTasks();
}


function taskClicked(e, taskId) {
    const te = getTaskElement(taskId);
    (e.target == te.category || e.target == te.title || e.target == te.details) ? taskEditable(e, te) : te.details.style.display = "none";
}


function getTaskElement(taskId) {
    return {
        task: document.querySelector(`#${taskId}`),
        category: document.querySelector(`#${taskId} .task-category`),
        title: document.querySelector(`#${taskId} .task-title`),
        details: document.querySelector(`#${taskId} .task-description`),
    }
}


function taskEditable(e, taskElement) {
    taskElement.task.style.cursor = "text";
    taskElement.details.style.display = "block";
    taskElement.task.draggable = false;
    taskElement.category.contentEditable = true;
    taskElement.title.contentEditable = true;
    taskElement.details.contentEditable = true;
    e.target.focus();
}


function taskOutOfFocus(e, taskId) {
    const taskIndex = findTasksIndex(taskId);
    const taskElement = getTaskElement(taskId);
    if (e.target == taskElement.category || e.target == taskElement.title || e.target == taskElement.details) {
        taskNonEditable(taskElement);
        setEditedTasksValues(taskElement, taskIndex);
    }
}


function taskNonEditable(taskElement) {
    window.getSelection().removeAllRanges();
    taskElement.category.contentEditable = false;
    taskElement.title.contentEditable = false;
    taskElement.details.contentEditable = false;
    taskElement.task.draggable = true;
    taskElement.task.style.cursor = "grab";
}


function setEditedTasksValues(taskElement, taskIndex) {
    tasks[taskIndex].category = taskElement.category.textContent;
    tasks[taskIndex].title = taskElement.title.textContent;
    tasks[taskIndex].description = taskElement.details.textContent;
    writeAllTasksToBackend();
}


/******************************
**       backend stuff       **
******************************/


function readAllTasksFromBackend() {
    readTaskSettingsFromBackend();
    const tasksData = JSON.parse(backend.getItem('tasks')) || [];
    tasksData.forEach(task => {
        const taskData = convertForeignData(task);
        const tasksIndex = findTasksIndex(taskData.id);
        (tasksIndex < 0) ? tasks.push(taskData) : tasks.splice(tasksIndex, 1, taskData);
    });
    console.log("tasks read from backend");
    showTasks();
}

function readTaskSettingsFromBackend() {
    const priorityData = JSON.parse(backend.getItem('priorities')) || (defaultPriorities);
    const personsData = JSON.parse(backend.getItem('inCharge')) || (defaultPersons);
    priorityData.forEach(p => priorities.push(p));
    personsData.forEach(p => inCharge.push(p));
    console.log("tasks settings read from backend");
    writeTaskSettingsToBackend();
}


async function writeAllTasksToBackend() {
    tasks.forEach(task => task.assignedTo = task.inCharge); 
    await backend.setItem('tasks', JSON.stringify(tasks));
    console.log("tasks written to backend");
    writeTaskSettingsToBackend();
}


async function writeTaskSettingsToBackend() {
    await backend.setItem('priorities', JSON.stringify(priorities));
    await backend.setItem('inCharge', JSON.stringify(inCharge));
    console.log("tasks settings written to backend");
}


function convertForeignData(data) {
    data.inCharge = ('assignedTo' in data) ? data.assignedTo : inCharge[0];
    data.assignedTo = data.inCharge;
    data.id = (data.id.startsWith("t")) ? data.id : "t" + data.id;
    data.id = (data.id.length != 17) ? 't' + Date.now() + String(Math.floor(Math.random() * 1000)) : data.id;
    console.log("task data: ", data, "\n");
    return data;
}



export { tasks, priorities, inCharge, currentlyDraggedTask, parseEuDate, euDateToUtc };
export { findTaskById, findTasksIndex, findTasksByColumn, removeTaskFromColumn };
export { moveTaskToColumn, showTasks, addTask, removeTask, taskTemplate, taskClicked };
export { readAllTasksFromBackend, writeAllTasksToBackend };
export { addTaskListener as columnFooterClicked };