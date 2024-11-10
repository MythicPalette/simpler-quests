import { constants } from "./global.js";
import { Quest } from "../data/quest.js";
import { QuestDatabase } from "../data/database.js";
import { UIManager } from "../ui/ui-manager.js";

export class SocketHandler {
    identifier = `module.simpler-quests`;

    constructor() {
        this.registerSocketListeners();
    }

    registerSocketListeners() {
        game.socket?.on(this.identifier, (ev) => {
            if (ev.type === "InsertOrUpdate") this.#OnQuestEdit(ev.data);
        });
    }

    emit(data) {
        console.log(`Emitting: ${data}`);
        const sock = game.socket;
        if (sock) return sock.emit(this.identifier, data);
    }

    #OnQuestEdit(data) {
        if (!game.user.isGM) return;

        console.log(`Received quest data: ${data}`);
        let q = new Quest(data);
        QuestDatabase.InsertOrUpdate(q);
        console.log(q);
        UIManager.tracker.render();
    }
}
