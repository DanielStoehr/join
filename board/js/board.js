'use strict'

import { initColumns, addColumn, removeColumn } from "./columns.js";
import { addTask, removeTask, showTasks, euDateToUtc, tasks } from "./tasks.js";
import { priorities, inCharge } from "./tasks.js";
import { backend, setURL, downloadFromServer } from "../smallest_backend_ever/mini_backend_module.js";


//-----for debugging-----
window.debugMode = true; 
debug();


//-----for educational purpose-----
let data = "", index = 1;
setURL('http://gruppe-223.developerakademie.net/smallest_backend_ever');

async function startBackend() {
    console.log("backend start \n");
    await downloadFromServer();
    while (data = JSON.parse(backend.getItem('task' + index))) {
        data.inCharge = ('assignedTo' in data) ? data.assignedTo : inCharge[0];
        (data.priority == "high") ? data.priority = 0 : false;
        (data.priority == "middle") ? data.priority = 1 : false;
        (isNaN(data.priority)) ? data.priority = 2 : false;
        data.id = "t" + data.id;
        tasks.push(data);
        console.log("data: ", data, "\n");
        index++;
    };
};

startBackend();



//-----for reference-----
// const priorities = ["hoch", "mittel", "niedrig"];
// const inCharge = ["ich", "du", "Müllers Kuh"];


(function main() {
    let task, col;

    col = addColumn("neuespalte", "neue Spalte", { title: "black", accent: "darksalmon", text: "black", background: "white" }, false, "board");

    init();

    addTask("inprogress", "Frontend programmieren", "description Beschreibung details bla bla bla", "Entwicklung", 0, euDateToUtc("30.04.2022"), inCharge[0]);
    showTasks();

    setTimeout(function () {
        addTask("completed", "Überbrückungshilfe beantragen", "Text 2", "Arbeit", 0, euDateToUtc("25.03.2022"), inCharge[0]);
        showTasks();
    }, 5500);

    task = addTask("neuespalte", "Fluggerät testen", "Text 3", "Hobby", 1, euDateToUtc("15.05.2022"), inCharge[0]);
    showTasks();
    //setTimeout(function () {
    //    removeTask(task);
    //}, 7000);

    setTimeout(function () {
        addTask("todo", "Büro Aufräumen", "Text 4", "Hausarbeit", 2, euDateToUtc("31.12.2022"), inCharge[2]);
        showTasks();
    }, 1000);

    setTimeout(function () {
        addTask("completed", "Tanzstunde vorbereiten", "Text 5", "Arbeit", 0, euDateToUtc("15.01.22"), inCharge[0]);
        showTasks();
    }, 1500);

    setTimeout(function () {
        addTask("inprogress", "Tanzstunde vorbereiten", "Text 6", "Arbeit", 0, euDateToUtc("23.04.2022"), inCharge[0]);
        showTasks();
    }, 2000);

    setTimeout(function () {
        addTask("discussing", "Backend programmieren", "Text 7", "Entwicklung", 1, euDateToUtc("15.08.2022"), inCharge[1]);
        showTasks();
    }, 3000);

    setTimeout(function () {
        console.log(removeColumn("neuespalte"));
    }, 10000);

})();


function init() {
    initColumns();
}



// 
//   for debugging 
// 
async function debug() {
    if (!debugMode && 't' in window) {
        delete window.t;
        delete window.c;
        console.log("debug mode: off");
        console.log("t and c removed from window object");
    }
    if (debugMode && !('t' in window)) {
        const t = await import("./tasks.js");
        const c = await import("./columns.js");
        window.t = t;
        window.c = c;
        console.log("prefix t assigned to tasks.js");
        console.log("prefix c assigned to columns.js");
    }
}


//let targetColumns = columns;
//targetColumns.splice(targetColumns.indexOf(tasks[findTasksIndex(currentlyDraggedTaskId)].columnId), 1);
//console.log(targetColumns);
//
//document.addEventListener("DOMContentLoaded", function () { ... });
