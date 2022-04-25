let tasks = [];
setURL('http://gruppe-223.developerakademie.net/smallest_backend_ever');

async function init() {
    await downloadFromServer();
    id = JSON.parse(backend.getItem('id'));
    loadAllTasks(id);
    renderBacklogTasks();
}

function loadAllTasks(id) {
    for (let i = 1; i <= id; i++) {
        let task = JSON.parse(backend.getItem(`task${i}`));
        console.log(`task${i}`, task);
        tasks.push(task);
    }
}



// don't needet at this time 
// function addTask() {
//     tasks.push(username.value);
//     backend.setItem('id', JSON.stringify(tasks));
// }


// taskx --> überschreiben --> task.title --> Änderungen auf Server überschreiben


function renderBacklogTasks() {
    let backlogTable = document.getElementById('backlog-table');
    backlogTable.innerHTML = /*html*/ `
        <tr>
            <th>ASSIGNED-TO</th>
            <th>CATEGORY</th>
            <th>DETAILS</th>
        </tr>
    `;

    let backlogTasks = filterBacklogTasks();

    for (let i = 0; i < backlogTasks.length; i++) {
        const backlogTask = backlogTasks[i];

        backlogTable.innerHTML += /*html*/ `
            <tr class="backlog-item" onclick="openTask()">
                <td class="backlog-item-image-name">
                    <img src="../img/user.svg" alt="user-image" class="backlog-user-image">
                    <div class="name-mail-container">
                        <span>Darrin S. Jones</span>
                        <span class="email">darrin@gmail.com</span>
                    </div>
                </td>
                <td>
                    <span class="category">
                        ${backlogTask['category']}
                    </span>
                </td>
                <td>
                    <p class="details">
                        ${backlogTask['description']}
                    </p>
                </td>
            </tr>
        `;
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

