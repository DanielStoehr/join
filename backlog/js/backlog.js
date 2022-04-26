let tasks = [];
setURL('http://gruppe-223.developerakademie.net/smallest_backend_ever');

let colorsOfUrgency = {
    high: '#EB5A46',
    middle: '#F2D600',
    low: '#61BD4F',
}

async function init() {
    await downloadFromServer();
    id = JSON.parse(backend.getItem('id'));
    console.log(id);
    loadAllTasks(id);
    renderBacklogTasks();
}

function loadAllTasks(id) {
    for (let i = 1; i <= id; i++) {
        let task = JSON.parse(backend.getItem(`task${i}`));
        tasks.push(task);
    }
    console.log('alle heruntergeladenen Tasks: ', tasks)
}


// don't needet at this time 
// function addTask() {
//     tasks.push(username.value);
//     backend.setItem('id', JSON.stringify(tasks));
// }


// taskx --> überschreiben --> task.title --> Änderungen auf Server überschreiben


/**renders all backlog tasks */
function renderBacklogTasks() {
    let backlogTable = document.getElementById('backlog-table');
    let backlogTasks = filterBacklogTasks(); // filters all the tasks that have status backlog from the array
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
    console.log('openTask korrekt aufgerufen mit ID: ', id);
    document.getElementById('backlog-overlay').classList.remove('d-none');
    document.getElementById('backlog-table').classList.add('d-none');
    let task = findTask(id);
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
    document.getElementById('urgency').value = task.priority;
    let deadlineTimeStamp = new Date(task.deadline);;
    let deadlineYear = deadlineTimeStamp.getFullYear();
    let deadlineMonth = deadlineTimeStamp.getMonth();
    let deadlineDay = deadlineTimeStamp.getDate();
    document.getElementById('date').value = `${deadlineYear}-${('0' + deadlineMonth).slice(-2)}-${('0' + deadlineDay).slice(-2)}`;
}


function clearInputs() {
    document.getElementById('title').value = '';
    document.getElementById('category').value = '';
    document.getElementById('description').value = '';
    document.getElementById('date').value = '';
    document.getElementById('urgency').value = '';
}