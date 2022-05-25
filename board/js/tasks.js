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


/**
 * create a task, push it to the tasks array
 * and write it to the backend
 * 
 * @param { string } columnId   - the ID of the column the task will be added to
 * @param { string } title      - the title of the task
 * @param { string } description - a description of the task
 * @param { string } category   - the task's categoy
 * @param { number } priority   - the number of the task's priority
 * @param { string } deadline   - the date when the task need to be finished (UTC date string) 
 * @param { number } personInCharge - the number of the person the task is assigned to 
 * @returns { string } - the ID of the just created task
 */
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


/**
 * remove a task from the DOM, tasks array and backend
 * 
 * @param { string } taskId - the ID of the task to remove
 */
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


/**
 * render all the tasks from the tasks array
 */
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


/**
 * create and setup a task's DOM element
 * 
 * @param { object } task - a task's object from the tasks array 
 * @returns { object } - a reference to the task's object in the DOM
 */
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


/**
 * create a template string from a task's object
 * 
 * @param { object } task - a task's object from the tasks array
 * @returns { string } - the task's template string
 */
function taskTemplate(task) {
    return `
    <div class="task-menu">
        <span class="delete-task">&#xf2ed;</span>
        <span class="close-task">&#xeee1;</span>
    </div>
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


/**
 * moves a task from one column to the other
 * 
 * @param { string } taskId     - the ID of the task to move
 * @param { string } columnId   - the ID of the column the task will be moved to
 */
function moveTaskToColumn(taskId, columnId) {
    tasks[findTasksIndex(taskId)].columnId = columnId;
    writeAllTasksToBackend();
}


/**
 * removes a task from the DOM
 * 
 * @param { object } task - the task's object from the tasks array
 */
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


/**
 * listenes for clicks on the
 * add-task button of a column
 * @param { object } e - the event object
 */ 
function addTaskListener(e) {
    e.stopPropagation();
    insertUserAddedTask(e);
}


/**
 * adds a new task's template to the
 * column targeted by the event object 
 * @param { object } e - the event object
 */ 
function insertUserAddedTask(e) {
    const col = e.target.parentNode;
    console.log("add task to '" + col.id + "'\n");
    addTask(col.id, "neue Aufgabe", "Beschreibung", "allgemein", 1, euDateToUtc(new Date().toLocaleString().slice(0, -10)), inCharge[3]);
    showTasks();
}


/**
 * listens for clicks on a task and 
 * performs specific action on that task
 * 
 * @param { object } e - the event object
 * @param { string } taskId - the ID of the task 
 */
function taskClicked(e, taskId) {
    const te = getTaskElement(taskId);
    te.taskMenu.style.display = "flex";     // show task's action menu bar
    te.details.style.display = "block";     // and details
    (e.target == te.category || e.target == te.title || e.target == te.details || e.target == te.deadline) ? taskEditable(e, te) : false; // enter edit mode?
    (e.target == te.priority) ? nextPriority(taskId, te) : false;       // switch to next priority
    (e.target == te.inCharge) ? nextPersonInCharge(taskId, te) : false; // switch to the next team member
    if (e.target.classList.contains("close-task")) {        // close icon has been clicked
        te.details.style.display = "none";                  // hide task's details 
        te.taskMenu.style.display = "";                     // and action menu bar
    }
    if (e.target.classList.contains("delete-task")) {       // delete icon has been clicked
        const task = findTaskById(taskId);                                          // either move task to the trash column
        (task.columnId == "trash") ? removeTask(taskId) : moveTaskToTrash(task);    // or remove it entirely if it was already there
        showTasks();
    }
}


/**
 * does what the functions's name implies
 * 
 * @param { object } task - the task object to perform the action on
 */
function moveTaskToTrash(task) {
    removeTaskFromColumn(task);
    moveTaskToColumn(task.id, "trash");
}


/**
 * get a task's DOM elements
 * 
 * @param { string } taskId - the ID of the task 
 * @returns { object } - references to the task and it's children
 */
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


/**
 * make a task editalble by the user
 * 
 * @param { object } e - event object
 * @param { object} taskElement - an object containing references to a task and it's children
 */
function taskEditable(e, taskElement) {
    taskElement.details.style.display = "block";    // show task's details
    taskElement.taskMenu.style.display = "flex";    // and menue
    taskElement.task.style.cursor = "text";
    taskElement.inputDeadline.style.display = "block";  // show date input field
    taskElement.deadline.style.display = "none";        // hide date display field
    taskElement.task.draggable = false;     // do not drag the task
    taskElement.column.draggable = false;   // while in edit mode 
    taskElement.category.contentEditable = true;    // make the task's children
    taskElement.title.contentEditable = true;       // elements editable
    taskElement.details.contentEditable = true;
    (e.target.classList == "task-deadline") ? taskElement.inputDeadline.focus() : e.target.focus(); // set focus to the clicked element
    //taskElement.column.firstElementChild.style.cursor = "default";
}


/**
 * switch a task to the next priority option
 * 
 * @param { string } taskId - the ID of the task
 * @param { object } te - an object containing references to a task and it's children
 */
function nextPriority(taskId, te) {
    const tasksIndex = findTasksIndex(taskId);
    (tasks[tasksIndex].priority < priorities.length - 1 ) ? tasks[tasksIndex].priority++ : tasks[tasksIndex].priority = 0;
    te.priority.textContent = priorities[tasks[tasksIndex].priority];
    writeAllTasksToBackend();
}


/**
 * assign a task to the next person in charge option
 * 
 * @param { string } taskId - the ID of the task
 * @param { object } te - an object containing references to a task and it's children
 */
function nextPersonInCharge(taskId, te) {
    const tasksIndex = findTasksIndex(taskId);
    const personsIndex = inCharge.findIndex(person => person == te.inCharge.textContent.slice(0, -1));
    te.inCharge.textContent = (personsIndex < inCharge.length - 1 ) ? inCharge[personsIndex + 1] : inCharge[0];
    tasks[tasksIndex].inCharge = te.inCharge.textContent;
    te.inCharge.textContent += ":";
    writeAllTasksToBackend();
}


/**
 * listens for a task's element going out of focus
 * resets editable state + initiates furter processing
 * 
 * @param { object } e - the event object
 * @param { string } taskId - the ID of the task
 */
function taskOutOfFocus(e, taskId) {
    const taskElement = getTaskElement(taskId);
    if (e.target == taskElement.category || e.target == taskElement.title || e.target == taskElement.details || e.target == taskElement.inputDeadline) {
        taskNonEditable(taskElement);
        setEditedTasksValues(taskElement, findTasksIndex(taskId));
    }
}


/**
 * resets a task's editable state 
 * 
 * @param { object } taskElement - an object containing references to a task and it's children
 */
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


/**
 * move edited task values to the tasks array
 * and write it to the backend
 * 
 * @param { object } taskElement - an object containing references to a task and it's children
 * @param { number } taskIndex - the index of the task inside the tasks array
 */
function setEditedTasksValues(taskElement, taskIndex) {
    tasks[taskIndex].category = taskElement.category.textContent;
    tasks[taskIndex].title = taskElement.title.textContent;
    tasks[taskIndex].description = taskElement.details.textContent;
    tasks[taskIndex].deadline = new Date(taskElement.inputDeadline.value).getTime();
    writeAllTasksToBackend();
}


/*********************************
**  backend stuff               **
**  if not commented otherwise, **
**  the functions do what the   **
**  function's names implies    **
*********************************/


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
    tasks.forEach(task => task.assignedTo = task.inCharge); // match different field name used somewhere outside
    backend.startTransaction(); 
    backend.setItem('tasks', JSON.stringify(tasks));
    console.log("tasks queued for write");
    writeTaskSettingsToBackend();
}


async function writeTaskSettingsToBackend() {
    backend.setItem('priorities', JSON.stringify(priorities));
    backend.setItem('inCharge', JSON.stringify(inCharge));
    console.log("tasks settings queued for write");
    await backend.commit();
    console.log("changes written to backend");
}


// convert foreign data to match our data structure
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
