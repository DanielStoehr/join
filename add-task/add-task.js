
setURL('http://gruppe-223.developerakademie.net/smallest_backend_ever');

let users = [];

async function init() {
    await downloadFromServer();
    users = JSON.parse(backend.getItem('users')) || [];
}
function addUser() {
    users.push(username.value);
    backend.setItem('users', JSON.stringify(users));
}





// let tasks = [{
//     id: Date.now() + String(Math.floor(Math.random() * 1000)),
//     title: '',
//     description: '',
//     category: '',
//     priority: '',
//     deadline: new Date().getTime(),
//     addedAt: new Date().getTime(),
//     inCharge: '',
//     columnId: '',
// }];

// let title = document.getElementById('title');
// let category = document.getElementById('category');
// let description = document.getElementById('description');
// let date = document.getElementById('date');
// let urgency = document.getElementById('urgency');


// async function addTask() {
//     await backend.setItem('tasks1', JSON.stringify(tasks));
// }

// function deleteValue(){
//     // title.value = '';
//     // category.value = '';
//     // description.value = '';
//     // date.value = '';
//     // urgency.value = '';
// }

// function saveTask(){
//     tasks.title = title.value;
//     tasks.category = category.value;
//     tasks.description = description.value;
//     tasks.deadline = new Date().getTime();
//     tasks.priority = urgency.value;
//     console.log(tasks);
//     //addTask();
// }

// let loadTask = [];


// async function init() {
//     await downloadFromServer();
//     loadTask = JSON.parse(backend.getItem('tasks1')) || [];
//     console.log(loadTask);
//     console.log(tasks);
// }
