function templateBacklogTableHead() {
    return /*html*/ `
    <tr>
        <th>ASSIGNED-TO</th>
        <th>CATEGORY</th>
        <th>DETAILS</th>
    </tr>
`;
}

function templateBacklogTask(i, backlogTask, colorOfUrgency) {
    return /*html*/ `
    <tr class="backlog-item" onclick="openTask(${i})" style="border-left: 10px solid ${colorOfUrgency}">
        <td class="backlog-item-image-name">
            <img src="../img/user.svg" alt="user-image" class="backlog-user-image">
            <div class="name-mail-container">
                <span>${backlogTask['assignedTo']}</span>
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