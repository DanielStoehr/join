import { columns, addColumn, removeColumn } from "./columns.js";
import { showTasks } from "./tasks.js";


const colors = [
    { color: { accent: "rgba(30, 30, 30, .2)", background: "white", text: "black", title: "black" } },
    { color: { accent: "rgba(255, 0, 0, .2)", background: "white", text: "black", title: "black" } },
    { color: { accent: "rgba(0, 255, 0, .2)", background: "white", text: "black", title: "black" } },
    { color: { accent: "rgba(0, 0, 255, .2)", background: "white", text: "black", title: "black" } },
    { color: { accent: "rgba(128, 255, 255, .9)", background: "white", text: "black", title: "black" } },
    { color: { accent: "darksalmon", background: "white", text: "black", title: "black" }, },
];


function insertUserAddedColumn(newColumnId, newColumnTitle) {
    if (!document.getElementById(newColumnId)) {
        const column = columns[columns.length - 1];
        detachAddColumnListeners();
        removeColumn(column.id);
        addColumn(newColumnId, newColumnTitle, colors[Math.floor(Math.random() * colors.length)].color, false); 
        addColumn(column.id, column.title, column.color, column.minimized || false);
        attachAddColumnListeners();
        showTasks();
    }
    console.log("id: " + newColumnId + " title: " + newColumnTitle + "\n");
}


function attachAddColumnListeners() {
    const link = document.getElementById("add-column-link");
    const inputForm = document.getElementById("enter-new-column");
    const input = document.getElementById("add-column-input");
    const cancelBtn = document.getElementById("add-column-cancel");
    const applyBtn = document.getElementById("add-column-now");
    if (link && inputForm && input && cancelBtn && applyBtn) {
        link.parentNode.addEventListener('click', e => addColumnLinkListener(e, link, inputForm, input));
        input.addEventListener("input", e => inputFieldListener(e));
        input.addEventListener("keyup", e => inputFieldKeyListener(e, link, inputForm, input));
        cancelBtn.addEventListener("click", e => cancelButtonListener(e, link, inputForm, input));
        applyBtn.addEventListener("click", e => applyButtonListener(e, link, inputForm, input));
    }
}


function detachAddColumnListeners() {
    const link = document.getElementById("add-column-link");
    const inputForm = document.getElementById("enter-new-column");
    const input = document.getElementById("add-column-input");
    const cancelBtn = document.getElementById("add-column-cancel");
    const applyBtn = document.getElementById("add-column-now");
    if (link && inputForm && input && cancelBtn && applyBtn) {
        link.parentNode.removeEventListener('click', e => addColumnLinkListener(e, link, inputForm, input));
        input.removeEventListener("input", e => inputFieldListener(e));
        input.removeEventListener("keyup", e => inputFieldKeyListener(e, link, inputForm, input));
        cancelBtn.removeEventListener("click", e => cancelButtonListener(e, link, inputForm, input));
        applyBtn.removeEventListener("click", e => applyButtonListener(e, link, inputForm, input));
    }
}


function addColumnLinkListener(e, link, inputForm, input) {
    e.stopPropagation();
    inputForm.style.display = "";
    input.focus();
    link.style.display = "none";
}


function inputFieldListener(e) {
    const pattern = /[a-z 0-9äöüß+-.()\/]/gi;
    e.target.value = (e.target.value.match(pattern) || []).toString().replaceAll(",", "");
}


function inputFieldKeyListener(e, link, inputForm, input) {
    const modifier = e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || e.key == "AltGraph";
    if (!modifier) {
        if (e.keyCode == 13 || e.key == "Enter") {
            applyButtonHit(link, inputForm, input);
        }
        if (e.keyCode == 27 || e.key == "Escape") {
            cancelButtonHit(link, inputForm, input);
        }
    }
    //console.log("key: " + e.key + " keyCode: " + e.keyCode);
    //console.log("shift: ", e.shiftKey, " alt: ", e.altKey, " ctrl: ", e.ctrlKey, " cmd: ", e.metaKey, " altGr: ", e.key == "AltGraph");
    //console.log("modifier: ", modifier);
}


function cancelButtonListener(e, link, inputForm, input) {
    e.stopPropagation();
    cancelButtonHit(link, inputForm, input);
}


function applyButtonListener(e, link, inputForm, input) {
    e.stopPropagation();
    applyButtonHit(link, inputForm, input);
}


function cancelButtonHit(link, inputForm, input) {
    input.value = "";
    inputForm.style.display = "none";
    link.style.display = "";
}


function applyButtonHit(link, inputForm, input) {
    const pattern = /[a-z0-9-]/gi;
    const newColumnTitle = (input.value) ? input.value : "";
    const newColumnId = (input.value.match(pattern) || []).toString().replaceAll(",", "");
    inputForm.style.display = "none";
    link.style.display = "";
    input.value = "";
    if (newColumnId) {
        insertUserAddedColumn(newColumnId, newColumnTitle);
    }
}

export { attachAddColumnListeners };