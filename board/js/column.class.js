import { dragOver, dragLeave, drop } from "./dragdrop/mouse.js";
import { columnFooterClicked } from "./tasks.js";

// fully functional on common desktops, iPhone 5s, newer i-devices

class Column {
    constructor(id, title, color, minimized) {
        this.id = id;
        this.title = title;
        this.x = 0;
        this.y = 0;
        this.width = 180;
        this.height = 564;
        this.color = color;
        this.minimized = (minimized) ? minimized : false;
        this.listeners = [
            { evt: "dragover", callback: dragOver },    // default event listeners
            { evt: "dragleave", callback: dragLeave },
            { evt: "drop", callback: drop },
        ];
        this.listener = {};
        (this.listeners.length > 0) ? this.listener = this.listeners[this.listeners.length - 1] : this.listener = {};
        this.footerListener = (!this.minimized) ? { evt: "click", callback: columnFooterClicked } : {};
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
        this._color = { title: "black", text: "black", accent: "rgba(30, 30, 30, 0.2)", background: "white" };
        if (typeof c == 'object') {
            if ('title' in c) {
                this._color.title = c.title;
            }
            if ('text' in c) {
                this._color.text = c.text;
            }
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
            if (value.length) {
                this._listeners = [];
                value.forEach(v => { 
                    ('evt' in v && 'callback' in v) ? this._listeners.push(v) : false;
                });
            }
            if (col) {
                this._listeners.forEach(l => col.addEventListener(l.evt, e => l.callback(e)));
            }
            (this._listeners.length) ? this.listener = this._listeners[this._listeners.length - 1] : this.listener = {};
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

    // get the event listener for the column's footer 
    get footerListener() {
        return (!this.minimized) ? this._footerListener : {};
    }

    // set the event listener for the column's footer
    set footerListener(value) {
        const col = document.getElementById(this.id);
        if (!this.minimized && col && 'evt' in this._footerListener && 'callback' in this._footerListener) {
            col.lastElementChild.removeEventListener(this._footerListener.evt, e => this._footerListener.callback(e));
        }
        (typeof value == 'object' && 'evt' in value && 'callback' in value) ? this._footerListener = value : this._footerListener = {};
        if (!this.minimized && col && 'evt' in this._footerListener && 'callback' in this._footerListener) {
            col.lastElementChild.addEventListener(this._footerListener.evt, e => this._footerListener.callback(e));
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
            const col = Column.columnsContainerSetup(this.id, this.title, this.color, this.minimized);
            par.appendChild(col);
            this.update();
            this.listeners.forEach(l => col.addEventListener(l.evt, e => l.callback(e)));
            if (!this.minimized && 'evt' in this.footerListener && 'callback' in this.footerListener) {
                col.lastElementChild.addEventListener(this.footerListener.evt, e => this.footerListener.callback(e));
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
            if (!this.minimized && 'evt' in this.footerListener && 'callback' in this.footerListener) {
                col.lastElementChild.removeEventListener(this.footerListener.evt, e => this.footerListener.callback(e));
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
        (this.listeners.length > 0) ? this.listener = this.listeners[this.listeners.length - 1] : this.listener = {};
    }
    // remove all event listeners
    // the setters (listeners && footerListerner) will detach them when needed
    removeAllListeners() {
        this.listeners = [];
        this.listener = {};
        this.footerListener = {};
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
            <span class="title-right icon close">&#xeee1;</span>
        </h4>
        <div class="new-task" style="margin-top: auto; background-color: ${color.accent};">
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