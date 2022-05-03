import { columns, addColumn, removeColumn, findRemovedColumnById, findRemovedColumnsIndex, restoreColumn } from "./columns.js";
import { writeAllColumnsToBackend, readAllColumnsFromBackend } from "./columns.js";
import { showTasks } from "./tasks.js";


const columnColors = {
    choice: 0,
    colors: [
        { accent: "rgba(30, 30, 30, .2)", background: "white", text: "black", title: "black" },
        { accent: "rgba(255, 0, 0, .2)", background: "white", text: "black", title: "black" },
        { accent: "rgba(0, 255, 0, .2)", background: "white", text: "black", title: "black" },
        { accent: "rgba(0, 0, 255, .2)", background: "white", text: "black", title: "black" },
        { accent: "rgba(128, 255, 255, .9)", background: "white", text: "black", title: "black" },
        { accent: "darksalmon", background: "white", text: "black", title: "black" },
    ]
};


function insertUserAddedColumn(newColumnId, newColumnTitle) {
    if (!document.getElementById(newColumnId)) {
        const column = columns[columns.length - 1];
        addColumn(newColumnId, newColumnTitle, columnColors.colors[columnColors.choice], false, column.board, "add-column"); 
        writeAllColumnsToBackend();
        showTasks();
    }
}


function attachAddColumnListeners() {
    const v = validateAddColumnListenerTargets();
    if (v.valid) {
        v.link.parentNode.addEventListener('click', e => addColumnLinkListener(e, v.link, v.inputForm, v.input));
        v.input.addEventListener("input", e => inputFieldListener(e));
        v.input.addEventListener("click", e => inputFieldClicked(e));
        v.input.addEventListener("keyup", e => inputFieldKeyListener(e, v.link, v.inputForm, v.input));
        v.cancelBtn.addEventListener("click", e => cancelButtonListener(e, v.link, v.inputForm, v.input));
        v.applyBtn.addEventListener("click", e => applyButtonListener(e, v.link, v.inputForm, v.input));
    }
}


function validateAddColumnListenerTargets() {
    const link = document.getElementById("add-column-link");
    const inputForm = document.getElementById("enter-new-column");
    const input = document.getElementById("add-column-input");
    const cancelBtn = document.getElementById("add-column-cancel");
    const applyBtn = document.getElementById("add-column-now");
    return { 
        valid: link && inputForm && input && cancelBtn && applyBtn,
        link: link, inputForm: inputForm, input: input, cancelBtn: cancelBtn, applyBtn: applyBtn
    }
}


function addColumnLinkListener(e, link, inputForm, input) {
    e.stopPropagation();
    inputForm.style.display = "";
    input.focus();
    link.style.display = "none";
    columnColors.choice = 0;
    input.style.backgroundColor = columnColors.colors[columnColors.choice].accent;
    input.style.color = columnColors.colors[columnColors.choice].title;
}


function inputFieldListener(e) {
    const pattern = /[a-z 0-9äöüß+-.()\/]/gi;
    e.target.value = (e.target.value.match(pattern) || []).toString().replaceAll(",", "");
}


function inputFieldClicked(e) {
    e.stopPropagation();
    nextColumnColor();
    e.target.style.backgroundColor = columnColors.colors[columnColors.choice].accent;
    e.target.style.color = columnColors.colors[columnColors.choice].title;
}


function inputFieldKeyListener(e, link, inputForm, input) {
    const keyCodeActions = setKeyCodeActions();
    const modifier = e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || e.key == "AltGraph";
    if (!modifier) {
        keyCodeActions.forEach(k => (e.keyCode == k.keyCode || e.key == k.key) ? k.callback(link, inputForm, input) : false);
    } 
    input.style.backgroundColor = columnColors.colors[columnColors.choice].accent;
    input.style.color = columnColors.colors[columnColors.choice].title;
}


function setKeyCodeActions() {
    return [
        { keyCode: 13, key: "Enter", callback: applyButtonHit },
        { keyCode: 27, key: "Escape", callback: cancelButtonHit },
        { keyCode: 38, key: "ArrowUp", callback: previousColumnColor },
        { keyCode: 40, key: "ArrowDown", callback: nextColumnColor },
    ];
}


function previousColumnColor() {
    (columnColors.choice > 0) ? columnColors.choice-- : columnColors.choice = columnColors.colors.length - 1;
}


function nextColumnColor() {
    (columnColors.choice < columnColors.colors.length - 1 ) ? columnColors.choice++ : columnColors.choice = 0;
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
    const newColumnId = (input.value.match(pattern) || []).join("").replaceAll("-", "").toLowerCase();
    inputForm.style.display = "none";
    link.style.display = "";
    input.value = "";
    if (newColumnId) {
        const index = findRemovedColumnsIndex(newColumnId);
        (index < 0) ? insertUserAddedColumn(newColumnId, newColumnTitle) : restoreColumn({}, index);
    }
}


export { attachAddColumnListeners };