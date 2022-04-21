
setURL('http://gruppe-223.developerakademie.net/smallest_backend_ever');

let tasks = {
    id: '',
    title: '',
    description: '',
    category: '',
    priority: '',
    deadline: new Date().getTime(),
    addedAt: new Date().getTime(),
    inCharge: '',
    columnId: '',
};

let id = 1;

//let taskload = [];

async function init() {
    await downloadFromServer();
    id = JSON.parse(backend.getItem('id'));
    //taskload = JSON.parse(backend.getItem('task'+id)) || [];
    //console.log('Geladen', taskload);
}


function addTask() {
    backend.setItem('task'+id, JSON.stringify(tasks));
    backend.setItem('id', JSON.stringify(id));
    clearInputs();
}


function saveTask(){
    id++;
    tasks.title = document.getElementById('title').value;
    tasks.category = document.getElementById('category').value;
    tasks.description = document.getElementById('description').value;
    tasks.deadline = new Date(document.getElementById('date').value).getTime();
    tasks.priority = document.getElementById('urgency').value;
    tasks.id = id;
    addTask();
}


function clearInputs(){
    document.getElementById('title').value = '';
    document.getElementById('category').value = '';
    document.getElementById('description').value = '';
    document.getElementById('date').value = '';
    document.getElementById('urgency').value  = '';
}
