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
    const link = document.getElementById("add-column-link");
    const inputForm = document.getElementById("enter-new-column");
    const input = document.getElementById("add-column-input");
    const cancelBtn = document.getElementById("add-column-cancel");
    const applyBtn = document.getElementById("add-column-now");
    if (link && inputForm && input && cancelBtn && applyBtn) {
        link.parentNode.addEventListener('click', e => addColumnLinkListener(e, link, inputForm, input));
        input.addEventListener("input", e => inputFieldListener(e));
        input.addEventListener("click", e => inputFieldClicked(e));
        input.addEventListener("keyup", e => inputFieldKeyListener(e, link, inputForm, input));
        cancelBtn.addEventListener("click", e => cancelButtonListener(e, link, inputForm, input));
        applyBtn.addEventListener("click", e => applyButtonListener(e, link, inputForm, input));
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
    (columnColors.choice == columnColors.colors.length -1 ) ? columnColors.choice = 0 : columnColors.choice++;
    e.target.style.backgroundColor = columnColors.colors[columnColors.choice].accent;
    e.target.style.color = columnColors.colors[columnColors.choice].title;
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
        if (e.keyCode == 38 || e.key == "ArrowUp") {
            (columnColors.choice > 0) ? columnColors.choice-- : columnColors.choice = columnColors.colors.length - 1;
        }
        if (e.keyCode == 40 || e.key == "ArrowDown") {
            (columnColors.choice < columnColors.colors.length - 1 ) ? columnColors.choice++ : columnColors.choice = 0;
        }
    }
    input.style.backgroundColor = columnColors.colors[columnColors.choice].accent;
    input.style.color = columnColors.colors[columnColors.choice].title;
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