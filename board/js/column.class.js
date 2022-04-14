import { dragOver, dragLeave, drop } from "./dragdrop/mouse.js";

// fully functional on common desktops, iPhone 5s, newer i-devices

class Column {
    constructor(id, headline) {
        this.id = id;
        this.headline = headline;
        this.x = 0;
        this.y = 0;
        this.width = 180;
        this.height = 564;
        this.color = { accent: "rgba(30, 30, 30, 0.2)", background: "white" };
        this.listeners = [
            { evt: "dragover", callback: dragOver },
            { evt: "dragleave", callback: dragLeave },
            { evt: "drop", callback: drop },
        ];
        this.listener = {};
        (this.listeners.length > 0) ? this.listener = this.listeners[this.listeners.length - 1] : this.listener = {};

    }

    /*****************************************
    **       getters and setters            **
    *****************************************/

    // get accent and background color
    get color() {
        return this._color;
    }

    // set accent and background color
    // apply defaults when needed
    set color(c) {
        this._color = { accent: "rgba(30, 30, 30, 0.2)", background: "white" };
        if (typeof c == 'object') {
            if ('accent' in c) {
                this._color.accent = c.accent;
            }
            if ('background' in c) {
                this._color.background = c.background;
            }
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
            (value.length && 'evt' in value[0] && 'callback' in value[0]) ? this._listeners = value : this._listeners = [];
            (this._listeners.length > 0) ? this.listener = this._listeners[this._listeners.length - 1] : this.listener = {};
            if (col) {
                this.listeners.forEach(l => col.addEventListener(l.evt, e => l.callback(e)));
            }
        }
    }

    // get the last added event listener
    get listener() {
        return this._listener;
    }

    // add a single event listener
    set listener(value) {
        this._listener = { evt: "", callback: null };
        if (!document.getElementById(this.id) && typeof value == 'object') {
            if ('evt' in value && 'callback' in value) {
                this._listener = value;
                if (this.listeners.findIndex(li => li.evt == value.evt) < 0) {
                    this.listeners.push(value);
                }
            }
        }
    }
    

    /********************************
    **          methods            **
    *********************************/

    // append column to an element in the DOM
    // attach event listeners if present
    appendTo(parent) {
        const par = document.getElementById(parent);
        if (par) {
            const col = document.createElement("div");
            col.innerHTML = `<h4 style="background-color: ${this.color.accent};">${this.headline}</h4>`;
            col.id = this.id;
            col.classList.add("column");
            col.style.border = "1px solid "+ this.color.accent;
            col.style.backgroundColor = this.color.background;
            par.appendChild(col);
            this.update();
            this.listeners.forEach(l => col.addEventListener(l.evt, e => l.callback(e)));
        }
    }
    // remove column from an element
    // detach event listeners if needed
    removeFrom(parent) {
        const par = document.getElementById(parent);
        const col = document.getElementById(this.id);
        if (par && col && col.parentNode == par) {
            this.listeners.forEach(l => col.removeEventListener(l.evt, e => l.callback(e)));
            par.removeChild(col);
        }
    }
    //store the screen position of the column 
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
        (this.listeners.length > 0) ? this.listener = this.listeners[this.listeners.length - 1] : this.listener = {};
    }
    // remove all event listeners
    // the setter (listeners) will detach them when needed
    removeAllListeners() {
        this.listeners = [];
        this.listener = {};
    }

}


export { Column };