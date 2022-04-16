'use strict'

import { initColumns, addColumn, removeColumn } from "./columns.js";
import { addTask, removeTask, showTasks } from "./tasks.js";
import { priorities, inCharge } from "./tasks.js";


//-----for debugging-----
window.debugMode = false; 
window.addEventListener("contextmenu", debug);

//-----for reference-----
// const priorities = ["hoch", "mittel", "niedrig"];
// const inCharge = ["ich", "du", "Müllers Kuh"];



(function main() {
    let task, task1, col;

    col = addColumn("spalte", "neue Spalte", { accent: "darksalmon", background: "white"});

    init();
    addTask("inprogress", "Frontend programmieren", "Entwicklung", 0, inCharge[0]);
    showTasks();

    task = addTask("completed", "Überbrückungshilfe beantragen", "Arbeit", 0, inCharge[0]);
    showTasks();
    setTimeout(function () {
        removeTask(task);
    }, 5500);

    task1 = addTask("spalte", "Fluggerät testen", "Hobby", 1, inCharge[0]);
    showTasks();
    //setTimeout(function () {
    //    removeTask(task1);
    //}, 7000);

    setTimeout(function () {
        addTask("todo", "Büro Aufräumen", "Hausarbeit", 2, inCharge[2]);
        showTasks();
    }, 1000);

    setTimeout(function () {
        addTask("completed", "Tanzstunde vorbereiten", "Arbeit", 0, inCharge[0]);
        showTasks();
    }, 2000);

    setTimeout(function () {
        addTask("inprogress", "Backend programmieren", "Entwicklung", 0, inCharge[1]);
        showTasks();
    }, 3000);

    setTimeout(function () {
        console.log(removeColumn("spalte"));
    }, 10000);

})();


function init() {
    initColumns();
}



// 
//   for debugging 
// 
async function debug(e) {
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