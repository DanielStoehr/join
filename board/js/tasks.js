import { touchStart, touchMove, touchEnd, touchCancel, } from "./dragdrop/touch.js";
import { startDragging, stopDragging, dragging } from "./dragdrop/mouse.js";
import { backend, setURL, downloadFromServer, jsonFromServer } from "../../smallest_backend_ever/mini_backend_module.js";


const tasks = [];
const currentlyDraggedTask = { id: "", sourceColumn: "" };

const defaultPriorities = ["niedrig", "mittel", "hoch"];
const priorities = [];
const defaultPersons = ["Max", "Daniel", "Lukas", "wolfgang"];
const inCharge = [];
const defaultCategories = ["Management", "Marketing", "Frontend", "Backend", "Entwicklung", "Arbeit", "Hobby"];
const categories = [];

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
            console.log("taskExists: ", taskExists, col);
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
    <div class="task-menu"><span class="close-task">&#xeee1;</span></div>
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
        <input class="input-task-deadline" type="date" value="${euDateToUtc(new Date(task.deadline).toLocaleString().slice(0, -10))}">
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
    te.taskMenu.style.display = "";
    te.details.style.display = "none";
    (e.target == te.category || e.target == te.title || e.target == te.details || e.target == te.deadline) ? taskEditable(e, te) : false;
    (e.target == te.priority) ? nextPriority(taskId, te) : false;
    (e.target == te.inCharge) ? nextPersonInCharge(taskId, te) : false;
    if (e.target.classList.contains("close-task")) {
        const task = findTaskById(taskId);
        (task.columnId == "trash") ? removeTask(taskId) : moveTaskToTrash(task);
        showTasks();
    }
}


function moveTaskToTrash(task) {
    removeTaskFromColumn(task);
    moveTaskToColumn(task.id, "trash");
}


function getTaskElement(taskId) {
    return {
        task: document.querySelector(`#${taskId}`),
        category: document.querySelector(`#${taskId} .task-category`),
        priority: document.querySelector(`#${taskId} .task-priority`),
        inCharge: document.querySelector(`#${taskId} .task-incharge`),
        title: document.querySelector(`#${taskId} .task-title`),
        details: document.querySelector(`#${taskId} .task-description`),
        deadline: document.querySelector(`#${taskId} .task-deadline`),
        inputDeadline: document.querySelector(`#${taskId} .input-task-deadline`),
        taskMenu: document.querySelector(`#${taskId} .task-menu`),
        column: document.querySelector(`#${taskId}`).parentElement,
    }
}


function taskEditable(e, taskElement) {
    taskElement.task.style.cursor = "text";
    taskElement.details.style.display = "block";
    taskElement.inputDeadline.style.display = "block";
    taskElement.taskMenu.style.display = "flex";
    taskElement.deadline.style.display = "none";
    taskElement.task.draggable = false;
    taskElement.column.draggable = false;
    taskElement.category.contentEditable = true;
    taskElement.title.contentEditable = true;
    taskElement.details.contentEditable = true;
    (e.target.classList == "task-deadline") ? taskElement.inputDeadline.focus() : e.target.focus();
    //taskElement.column.firstElementChild.style.cursor = "default";
}


function nextPriority(taskId, te) {
    const tasksIndex = findTasksIndex(taskId);
    (tasks[tasksIndex].priority < priorities.length - 1 ) ? tasks[tasksIndex].priority++ : tasks[tasksIndex].priority = 0;
    te.priority.textContent = priorities[tasks[tasksIndex].priority];
    writeAllTasksToBackend();
}


function nextPersonInCharge(taskId, te) {
    const tasksIndex = findTasksIndex(taskId);
    const personsIndex = inCharge.findIndex(person => person == te.inCharge.textContent.slice(0, -1));
    te.inCharge.textContent = (personsIndex < inCharge.length - 1 ) ? inCharge[personsIndex + 1] : inCharge[0];
    tasks[tasksIndex].inCharge = te.inCharge.textContent;
    te.inCharge.textContent += ":";
    writeAllTasksToBackend();
}


function taskOutOfFocus(e, taskId) {
    const taskIndex = findTasksIndex(taskId);
    const taskElement = getTaskElement(taskId);
    console.log(e.target);
    if (e.target == taskElement.category || e.target == taskElement.title || e.target == taskElement.details || e.target == taskElement.inputDeadline) {
        taskNonEditable(taskElement);
        setEditedTasksValues(taskElement, taskIndex);
    }
}


function taskNonEditable(taskElement) {
    window.getSelection().removeAllRanges();
    taskElement.inputDeadline.style.display = "none";
    taskElement.deadline.style.display = "";
    taskElement.category.contentEditable = false;
    taskElement.title.contentEditable = false;
    taskElement.details.contentEditable = false;
    taskElement.task.draggable = true;
    taskElement.column.draggable = true;
    taskElement.task.style.cursor = "grab";
    taskElement.deadline.textContent = new Date(taskElement.inputDeadline.value).toLocaleString().slice(0, -10)
    //taskElement.column.firstElementChild.style.cursor = "grab";
}


function setEditedTasksValues(taskElement, taskIndex) {
    tasks[taskIndex].category = taskElement.category.textContent;
    tasks[taskIndex].title = taskElement.title.textContent;
    tasks[taskIndex].description = taskElement.details.textContent;
    tasks[taskIndex].deadline = new Date(taskElement.inputDeadline.value).getTime();
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


function writeAllTasksToBackend() {
    tasks.forEach(task => task.assignedTo = task.inCharge);
    backend.startTransaction(); 
    backend.setItem('tasks', JSON.stringify(tasks));
    console.log("tasks written to backend");
    writeTaskSettingsToBackend();
}


async function writeTaskSettingsToBackend() {
    backend.setItem('priorities', JSON.stringify(priorities));
    backend.setItem('inCharge', JSON.stringify(inCharge));
    await backend.commit();
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
