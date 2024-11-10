import { constants } from "./global.js";

export class SocketHandler {
    identifier = `module.simpler-quests`;

    constructor() {
        this.registerSocketListeners();
    }

    registerSocketListeners() {
        game.socket?.on(this.identifier, (data) => {
            console.log(data);
        });
    }

    emit(data) {
        console.log(`Emitting: ${data}`);
        const sock = game.socket;
        if (sock) return sock.emit(this.identifier, data);
    }
}
