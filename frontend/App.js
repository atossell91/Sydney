import { Process } from "./Process.js";

class App {
    #processObjects = [];
    constructor() {
        this.processAreaElem =
            document.getElementById("process-area");

        this.socket = new WebSocket("ws://127.0.0.1:5001")
        this.socket.addEventListener("open", ()=>{
            this.createNewProcess();
        });

        document.addEventListener("UsedNewBox", ()=>{ this.createNewProcess(); });

        this.socket.addEventListener("message", (ev)=>{ this.handleMessage(ev); });
    }

    createNewProcess() {
        const p = new Process(this.socket);
        p.setIndex(this.#processObjects.length);
        this.#processObjects.push(p);
        this.processAreaElem.appendChild(p.getRootElement());
    }

    handleMessage(ev) {
        const data = JSON.parse(ev.data);
        console.log(data);
        if (
            data.type === "textstream" ||
            data.type === "processcomplete" ||
            data.type === "init"
        ) {
            const targetElem = this.#processObjects[data.eindex];
            targetElem.receiveMessage(data);
        }
    }
}

export { App }
