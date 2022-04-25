let task = [];
setURL('http://gruppe-223.developerakademie.net/smallest_backend_ever');

async function init() {
    await downloadFromServer();
    id = JSON.parse(backend.getItem('id')) || [];
    console.log('alle IDs', id);

    //Aufruf zur eigenen Funktion mit forschleife
    task = JSON.parse(backend.getItem('task2')) || [];
    console.log('task 2: ', task);

}


// don't needet at this time 
// function addTask() {
//     tasks.push(username.value);
//     backend.setItem('id', JSON.stringify(tasks));
// }


// bei init() eine for-Schleife 
// außerhalb forschleife id holen und diese in for schleife als Parameter eingeben

// taskx --> überschreiben --> task.title --> Änderungen auf Server überschreiben

function openTask() {
    console.log('openTask wird korrekt aufgerufen');
}

