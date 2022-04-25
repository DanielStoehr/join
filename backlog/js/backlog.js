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
        const colorUrgency = colorsOfUrgency[backlogTask['priority']];
        console.log(colorUrgency);
        backlogTable.innerHTML += templateBacklogTask(backlogTask);
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


function openTask() {
    console.log('openTask wird korrekt aufgerufen');
}

