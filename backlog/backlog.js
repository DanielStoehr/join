let users = [];
setURL('http://gruppe-223.developerakademie.net/smallest_backend_ever');

async function init() {
    await downloadFromServer();
    users = JSON.parse(backend.getItem('id')) || [];
}


function addUser() {
    users.push(username.value);
    backend.setItem('id', JSON.stringify(users));
}