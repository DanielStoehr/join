import { dragOver, dragLeave, drop } from "./dragdrop/mouse.js";
import { columnFooterClicked } from "./tasks.js";
import { closeColumnClicked } from "./columns.js";


// fully functional on common desktops, iPhone 5s, newer i-devices

class Column {
    id;
    title;
    board;
    color;
    minimized;
    x = 0;
    y = 0;
    width = 180;
    height = 564;

    constructor(id, title, color, minimized) {
        this.id = id;
        this.title = title;
        this._color = color;
        this.minimized = (minimized) ? minimized : false;
        this.listeners = [
            { evt: "dragover", callback: dragOver },    // default event listeners
            { evt: "dragleave", callback: dragLeave },
            { evt: "drop", callback: drop },
        ];
        this._listener = (this.listeners.length > 0) ? this.listeners[this.listeners.length - 1] : {};
        this._footerListener = (!this.minimized) ? { evt: "click", callback: columnFooterClicked } : {};
        this._closeListener = (!this.minimized) ? { evt: "click", callback: closeColumnClicked } : {};
    }

    /*****************************************
    **       getters and setters            **
    *****************************************/

    // get accent and background color
    get _color() {
        return this.color;
    }

    // set accent and background color
    // apply defaults when needed
    set _color(c) {
        this.color = { title: "black", text: "black", accent: "rgba(30, 30, 30, 0.2)", background: "white" };
        if (typeof c == 'object') {
            this.color.title = ('title' in c) ? c.title : this.color.title;
            this.color.text = ('text' in c) ? c.text : this.color.text;
            this.color.accent = ('accent' in c) ? c.accent : this.color.accent;
            this.color.background = ('background' in c) ? c.background : this.color.background;
         }       
    }

    // get event listeners
    get listeners() {  
        return this._listeners;
    }

    // set event listeners, if column is present in DOM: 
    // detach whats removed, attach whats new
    set listeners(value) {
        if (typeof value == 'object' && Array.isArray(value) ) {
            const col = document.getElementById(this.id);
            if (col && this._listeners.length) {
                this._listeners.forEach(l => {
                    ('evt' in l && 'callback' in l) ? col.removeEventListener(l.evt, e => l.callback(e)) : false;
                });
            }
            if (value.length) {
                this._listeners = [];
                value.forEach(v => ('evt' in v && 'callback' in v) ? this._listeners.push(v) : false);
            }
            if (col) {
                this._listeners.forEach(l => col.addEventListener(l.evt, e => l.callback(e)));
            }
            this.listener = (this._listeners.length) ? this._listeners[this._listeners.length - 1] : {};
        }
    }

    // get the last added event listener
    get _listener() {
        return this.listener;
    }

    // add a single event listener
    set _listener(value) {
        this.listener = { evt: "", callback: null };
        if (!document.getElementById(this.id) && typeof value == 'object') {
            if ('evt' in value && 'callback' in value) {
                this.listener = value;
                if (this.listeners.findIndex(li => li.evt == value.evt) < 0) {
                    this.listeners.push(value);
                }
            }
        }
    }

    // get the event listener for the column's footer 
    get _footerListener() {
        return (!this.minimized) ? this.footerListener : {};
    }

    // set the event listener for the column's footer
    set _footerListener(value) {
        const col = document.getElementById(this.id);
        if (!this.minimized && col && Object.keys(this.footerListener).length) {
            col.lastElementChild.removeEventListener(this.footerListener.evt, e => this.footerListener.callback(e));
        }
        this.footerListener = (typeof value == 'object' && 'evt' in value && 'callback' in value) ? value : {};
        if (!this.minimized && col && Object.keys(this.footerListener).length) {
            col.lastElementChild.addEventListener(this.footerListener.evt, e => this.footerListener.callback(e));
        }
    }

    // get the event listener for the column's close icon 
    get _closeListener() {
        return (!this.minimized) ? this.closeListener : {};
    }

    // set the event listener for the column's close icon
    set _closeListener(value) {
        const closeCol = document.getElementById(this.id + "-close");
        if (!this.minimized && closeCol && Object.keys(this.closeListener).length) {
            closeCol.removeEventListener(this.closeListener.evt, e => this.closeListener.callback(e, this.id));
        }
        this.closeListener = (typeof value == 'object' && 'evt' in value && 'callback' in value) ? value : {};
        if (!this.minimized && closeCol && Object.keys(this.closeListener).length) {
            closeCol.addEventListener(this.closeListener.evt, e => this.closeListener.callback(e, this.id));
        }
    }    
    /********************************
    **          methods            **
    *********************************/

    // append column to an element in the DOM
    // attach event listeners if present
    appendTo(parent, beforeCol) {
        const par = document.getElementById(parent);
        const before = document.getElementById(beforeCol);
        if (par) {
            this.board = parent;
            const col = Column.columnsContainerSetup(this.id, this.title, this.color, this.minimized);
            (before) ? par.insertBefore(col, before) : par.appendChild(col);
            this.update();
            this.listeners.forEach(l => col.addEventListener(l.evt, e => l.callback(e)));
            if (!this.minimized) {
                if (Object.keys(this.footerListener).length) {
                    col.lastElementChild.addEventListener(this.footerListener.evt, e => this.footerListener.callback(e));
                }
                if (Object.keys(this.closeListener).length) {
                    const colClose = document.getElementById(this.id + "-close");
                    colClose.addEventListener(this.closeListener.evt, e => this.closeListener.callback(e, this.id));
                }
            }
        }
    }
    // remove column from an element
    // detach event listeners if needed
    removeFrom(parent) {
        const par = document.getElementById(parent);
        const col = document.getElementById(this.id);
        if (par && col && col.parentNode == par) {
            this.listeners.forEach(l => col.removeEventListener(l.evt, e => l.callback(e)));
            if (!this.minimized) {
                if (Object.keys(this.footerListener).length) {
                    col.lastElementChild.removeEventListener(this.footerListener.evt, e => this.footerListener.callback(e));
                }
                if (Object.keys(this.closeListener).length) {
                    const colClose = document.getElementById(this.id + "-close");
                    colClose.removeEventListener(this.closeListener.evt, e => this.closeListener.callback(e, this.id));
                }
            }
            par.removeChild(col);
        }
    }
    //store the screen position of the column
    //inside the Column's object's properties 
    update() {
        const col = document.getElementById(this.id);
        if (col) {
            const pos = col.getBoundingClientRect();
            this.x = Math.floor(pos.left);
            this.y = Math.floor(pos.top);
            this.width = Math.floor(pos.width);
            this.height = Math.floor(pos.height);
        }
    }
    // remove a single event listener,
    // detach it if it was attached before
    removeListener(value) {
        const col = document.getElementById(this.id);
        let i = this.listeners.findIndex(l => l.evt == value);
        let listenerToRemove = this.listeners[i] || "";
        (listenerToRemove) ? this.listeners.splice(i, 1) : this.listeners;
        if (col && listenerToRemove) {
            col.removeEventListener(listenerToRemove.evt, e => listenerToRemove.callback(e));
        }
        this.listener = (this.listeners.length > 0) ? this.listeners[this.listeners.length - 1] : {};
    }
    // remove all event listeners
    // the setters (listeners && footerListerner && closeListener) will detach them when needed
    removeAllListeners() {
        this.listeners = [];
        this.listener = {};
        this.footerListener = {};
        this.closeListener = {};
    }

    /********************************
    **    static helper methods    **
    *********************************/

    // create and setup the column's 
    // container element
    static columnsContainerSetup(id, title, color, minimized) {
        const col = document.createElement("div");
        col.innerHTML = (minimized) ? this.minimizedColumnsTemplate(id, title, color) : this.regularColumnsTemplate(id, title, color);
        col.id = id;
        col.classList.add("column");
        col.style.border = "1px solid "+ color.accent;
        col.style.backgroundColor = color.background;
        col.style.color = color.text;
        col.style.height = (minimized) ? "fit-content" : "";
        col.style.minHeight = (minimized) ? "fit-content" : "";
        return col;
    }
    // template function for 
    // the column's title
    static regularColumnsTemplate(id, title, color) {
        return `
        <h4 class="title title-regular" style="color: ${color.title}; background-color: ${color.accent};">
            <span class="title-left"></span>
            <span>${title}</span>
            <span id="${id}-close" class="title-right icon close">&#xeee1;</span>
        </h4>
        <div id="${id}-new-task" class="new-task" style="margin-top: auto; background-color: ${color.accent};">
            Karte hinzufügen
        </div>
        `.trim();
    }
    // template function for 
    // the column's footer
    static minimizedColumnsTemplate(id, title, color) {
        return `
        <h4 class="title title-minimized" style="color: ${color.title}; background-color: ${color.accent};">
            ${title}
        </h4>
        `.trim();
    }
}


export { Column };