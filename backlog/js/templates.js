function templateBacklogTableHead() {
    return /*html*/ `
    <tr style="border-left: 10px solid transparent">
        <th>ASSIGNED-TO</th>
        <th>CATEGORY</th>
        <th>DETAILS</th>
    </tr>
`;
}

function templateBacklogTask(backlogTask, colorOfUrgency) {
    return /*html*/ `
    <tr class="backlog-item" onclick="openTask(${backlogTask['addedAt']})" style="border-left: 10px solid ${colorOfUrgency}">
        <td class="backlog-item-image-name">
            <div class="name-image-container">
                <img src="../img/user.svg" alt="user-image" class="backlog-user-image">
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