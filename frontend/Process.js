import { ProcessView } from "./ProcessView.js"

class Process {
    constructor(socket) {
        this._socket = socket;
        this.isNew = true;
        this.eindex = -1;
        this.pindex = -1;
        
        const viewRes = new ProcessView();
        this.view = viewRes.elems;
        this.commandInputElem = viewRes.refs.get("command-input");
        this.startButtonElem = viewRes.refs.get("start-button");
        this.stopButtonElem = viewRes.refs.get("stop-button");
        this.outputAreaElem = viewRes.refs.get("output-area");
        this.setNewState();

        this.commandInputElem.addEventListener("change", ()=>{
            this.setReadyState()
         })

         this.startButtonElem.addEventListener("click", ()=>{
            if (this.isNew) {
                this.isNew = false;
                document.dispatchEvent(new CustomEvent("UsedNewBox"));
            }
            this.sendStartCmd();
         });

         this.stopButtonElem.addEventListener("click", ()=>{
            this.sendStopCmd();
         });
    }

    setIndex(index) {
        this.eindex = index;
    }

    getRootElement() {
        return this.view;
    }

    setNewState() {
        this.commandInputElem.disabled = false;
        this.startButtonElem.disabled = true;
        this.stopButtonElem.disabled = true;
    }

    setReadyState() {
        this.commandInputElem.disabled = false;
        this.startButtonElem.disabled = false;
        this.stopButtonElem.disabled = true;
    }

    setRunningState() {
        this.commandInputElem.disabled = true;
        this.startButtonElem.disabled = true;
        this.stopButtonElem.disabled = false;
    }

    splitCommandStr(command) {
        console.log(command);
        const items = command.split(" ");
        const prog = items[0];
        const args = [];
        for (let n =1; n < items.length; ++n) {
            args.push(items[n]);
        }

        return {
            prog: prog,
            args: args
        };
    }

    sendStartCmd() {
        const fullcmd = this.commandInputElem.value;
        const command = this.splitCommandStr(fullcmd);
        this._socket.send(JSON.stringify({
            type: "start",
            executable: command.prog,
            flags: command.args,
            eindex: this.eindex
        }));
    }

    sendStopCmd() {
        this._socket.send(JSON.stringify({
            type: "stop",
            pindex: this.pindex,
            eindex: this.eindex
        }));
    }

    receiveMessage(message) {
        if (message.type === "textstream")
            this.outputAreaElem.innerText += message.text;
        else if(message.type === "init") {
            this.pindex = message.pindex;
            this.setRunningState();
        }
        else
            this.setReadyState();
    }
}

export { Process }