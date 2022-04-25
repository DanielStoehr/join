
setURL('http://gruppe-223.developerakademie.net/smallest_backend_ever');

let task = {
    id: '',
    title: '',
    description: '',
    category: '',
    priority: '',
    deadline: new Date().getTime(),
    addedAt: new Date().getTime(),
    inCharge: '',
    columnId: 'backlog',
    assignedTo: ''
};

let user;
let id = 1;

// let taskload = [];

async function init() {
    await downloadFromServer();
    id = JSON.parse(backend.getItem('id'));
    console.log(id);
    // taskload = JSON.parse(backend.getItem('task'+id)) || [];
    // console.log('Geladen', taskload);
}


function addTask() {
    backend.setItem('task'+id, JSON.stringify(task));
    backend.setItem('id', JSON.stringify(id));
    clearInputs();
}


function saveTask(){
    id++;
    task.title = document.getElementById('title').value;
    task.category = document.getElementById('category').value;
    task.description = document.getElementById('description').value;
    task.deadline = new Date(document.getElementById('date').value).getTime();
    task.priority = document.getElementById('urgency').value;
    task.assignedTo = user;
    task.id = id;
    addTask();
}


function clearInputs(){
    document.getElementById('title').value = '';
    document.getElementById('category').value = '';
    document.getElementById('description').value = '';
    document.getElementById('date').value = '';
    document.getElementById('urgency').value  = '';
}

function setUser(number, name){
    clearOpacity();
    document.getElementById('user-' + number).style.opacity = '1';
    user = name;
}

function clearOpacity(){
    document.getElementById('user-1').style.opacity = '0.6';
    document.getElementById('user-2').style.opacity = '0.6';
    document.getElementById('user-3').style.opacity = '0.6';
    document.getElementById('user-4').style.opacity = '0.6';
}
