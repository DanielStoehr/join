let tasks = [];

let task = {
    id: '',
    title: '',
    description: '',
    category: '',
    priority: '',
    deadline: '',
    addedAt: '',
    inCharge: '',
    columnId: '',
    assignedTo: ''
};

setURL('http://gruppe-223.developerakademie.net/smallest_backend_ever');

let colorsOfUrgency = {
    0: '#61BD4F',
    1: '#F2D600',
    2: '#EB5A46',
}

async function init() {
    await downloadFromServer();
    tasks = JSON.parse(backend.getItem('tasks'));
    console.log('heruntergeladene tasks: ' + tasks)
    renderBacklogTasks();
}

/**renders all backlog tasks */
function renderBacklogTasks() {
    let backlogTable = document.getElementById('backlog-table');
    let backlogTasks = filterBacklogTasks(); // filters all the tasks that have status backlog from the array
    backlogTable.innerHTML = '';
    backlogTable.innerHTML = templateBacklogTableHead();

    for (let i = 0; i < backlogTasks.length; i++) {
        const backlogTask = backlogTasks[i];
        const colorOfUrgency = colorsOfUrgency[backlogTask['priority']];
        backlogTable.innerHTML += templateBacklogTask(backlogTask, colorOfUrgency);
    }
}


/**
 * filter function: searchs in all loadet tasks only the tasks for our backlog
 * 
 * @returns array with all backlog tasks
 */
function filterBacklogTasks() {
    let backlogTasks = tasks.filter(tasks => tasks['columnId'].includes('backlog'));
    return backlogTasks;
}


/**
 * opens a task in a detail view
 * 
 * @param {integer} addedAt includes the unix time stamp from first saving the task
 */
function openTask(addedAt) {
    document.getElementById('backlog-overlay').classList.remove('d-none');
    document.getElementById('backlog-table').classList.add('d-none');
    task = findTaskByAddTime(addedAt);
    fillTaskWithPresets();
}


/**
 * finds a task by the add-time-stamp
 * 
 * @param {integer} addedAt includes the unix time stamp from first saving the task
 * @returns {object} returns the task which was created at the input time
 */
function findTaskByAddTime(addedAt) {
    let foundTask = tasks.find((task) => task.addedAt === addedAt);
    return foundTask;
}


function closeTask() {
    document.getElementById('backlog-table').classList.remove('d-none');
    document.getElementById('backlog-overlay').classList.add('d-none');
    clearInputs();
}


/**fills the tasks with the values received from the backend */
function fillTaskWithPresets() {
    document.getElementById('title').value = task.title;
    document.getElementById('category').value = task.category;
    document.getElementById('description').value = task.description;
    document.getElementById('urgency').value = task.priority;

    fillDateInput();

    let name = task.assignedTo;
    let number = findUserNumber(name);
    if (name) { // only if user is given -> set user
        setUser(number, name);
    }
    else {
        user = ''
    }
}


function findUserNumber(user) {
    switch (user) {
        case 'Max':
            return 1;
            break;
        case 'Daniel':
            return 2;
            break;
        case 'Lukas':
            return 3;
            break;
        case 'Wolfgang':
            return 4;
            break;
    }
}


function fillDateInput() {
    let deadlineTimeStamp = new Date(task.deadline);;
    let deadlineYear = deadlineTimeStamp.getFullYear();
    let deadlineMonth = deadlineTimeStamp.getMonth() + 1; // january gives 0!
    let deadlineDay = deadlineTimeStamp.getDate();
    document.getElementById('date').value = `${deadlineYear}-${('0' + deadlineMonth).slice(-2)}-${('0' + deadlineDay).slice(-2)}`;
}


function clearInputs() {
    document.getElementById('title').value = '';
    document.getElementById('category').value = '';
    document.getElementById('description').value = '';
    document.getElementById('date').value = '';
    document.getElementById('urgency').value = '';
    clearOpacity();
}


/**
 * 
 * 
 * @param {integer} number every user has a personal number, for example Daniel is number 2
 * @param {string} name of the user that the task is assigned to
 */
function setUser(number, name) {
    clearOpacity();
    document.getElementById('user-' + number).style.opacity = '1';
    user = name;
}


function clearOpacity() {
    document.getElementById('user-1').style.opacity = '0.6';
    document.getElementById('user-2').style.opacity = '0.6';
    document.getElementById('user-3').style.opacity = '0.6';
    document.getElementById('user-4').style.opacity = '0.6';
}


/**saves all input-values in the task */
async function saveChangedTask() {
    updateTaskVariable();

    let indexOfTask = findIndexOfTask(task);
    tasks.splice(indexOfTask, 1, task); // removes old task from the array and gives in the new saved task

    await backend.setItem('tasks', JSON.stringify(tasks));
    closeTask();
    init();
}


function findIndexOfTask(task) {
    let index = tasks.indexOf(task);
    return index;
}


/**updates the task-variable by values of input-fields */
function updateTaskVariable() {
    task.title = document.getElementById('title').value;
    task.category = document.getElementById('category').value;
    task.description = document.getElementById('description').value;
    task.deadline = new Date(document.getElementById('date').value).getTime();
    task.priority = document.getElementById('urgency').value;
    task.assignedTo = user;
    task.id = 15; // number >0 and <16
}


/**changes the columnId of the task - so it won't be rendered anymore in backlog */
async function sendToBoard() {
    task.columnId = 'todo';
    await saveChangedTask();
    clearInputs();
}

