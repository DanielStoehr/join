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
    high: '#EB5A46',
    middle: '#F2D600',
    low: '#61BD4F',
}

async function init() {
    await downloadFromServer();
    tasks = JSON.parse(backend.getItem('tasks'));
    console.log('heruntergeladene tasks: ' + tasks)
    // loadAllTasks(id);
    renderBacklogTasks();
}


// function loadAllTasks(id) {
//     for (let i = 1; i <= id; i++) {
//         task = JSON.parse(backend.getItem(`task${i}`));
//         tasks.push(task);
//     }
//     console.log('alle heruntergeladenen Tasks: ', tasks)
// }


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


function openTask(id) {
    document.getElementById('backlog-overlay').classList.remove('d-none');
    document.getElementById('backlog-table').classList.add('d-none');
    task = findTask(id);
    fillTaskWithPresets(task);
}


function closeTask() {
    document.getElementById('backlog-table').classList.remove('d-none');
    document.getElementById('backlog-overlay').classList.add('d-none');
    clearInputs();
}


function findTask(id) {
    let foundTask = tasks.find(task => task['id'] === id);
    return foundTask;
}


function fillTaskWithPresets(task) {
    document.getElementById('title').value = task.title;
    document.getElementById('category').value = task.category;
    document.getElementById('description').value = task.description;
    document.getElementById('urgency').value = findUrgencyString(task.priority);
    
    let deadlineTimeStamp = new Date(task.deadline);;
    let deadlineYear = deadlineTimeStamp.getFullYear();
    let deadlineMonth = deadlineTimeStamp.getMonth();
    let deadlineDay = deadlineTimeStamp.getDate();
    document.getElementById('date').value = `${deadlineYear}-${('0' + deadlineMonth).slice(-2)}-${('0' + deadlineDay).slice(-2)}`;
    
    let name = task.assignedTo;
    let number = findUserNumber(name);
    setUser(number, name);
}


function findUrgencyString(urgencyValue) {
    switch(urgencyValue) {
        case '0':
            return 'Low';
            break;
        case '1':
            return 'Middle';
            break;
        case '2':
            return 'High';
            break;
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
    task.title = document.getElementById('title').value;
    task.description = document.getElementById('description').value;
    task.deadline = new Date(document.getElementById('date').value).getTime();
    task.category = document.getElementById('category').value;
    task.priority = document.getElementById('urgency').value;
    task.assignedTo = user;
    await pushTaskToBackend();
    closeTask();
    init();
}


/**changes the data of the task in backlog */
async function pushTaskToBackend() {
    await backend.setItem('task' + task.id, JSON.stringify(task));
}


/**changes the columnId of the task - so it won't be rendered anymore in backlog */
async function sendToBoard() {
    task.columnId = 'todo';
    await saveChangedTask();
    clearInputs();
}


