let tasks = [];
setURL('http://gruppe-223.developerakademie.net/smallest_backend_ever');

async function init() {
    await downloadFromServer();
    tasks = JSON.parse(backend.getItem('task2')) || [];
    console.log(tasks);
    id = JSON.parse(backend.getItem('id')) || [];
    console.log(id);
}


// don't needet at this time 
// function addTask() {
//     tasks.push(username.value);
//     backend.setItem('id', JSON.stringify(tasks));
// }