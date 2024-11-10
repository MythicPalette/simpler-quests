import { constants } from "./global.js";
import { Quest } from "../data/quest.js";
import { QuestDatabase } from "../data/database.js";
import { UIManager } from "../ui/ui-manager.js";
import { Settings } from "./settings.js";

export class SocketHandler {
    identifier = `module.simpler-quests`;

    constructor() {
        this.registerSocketListeners();
    }

    registerSocketListeners() {
        game.socket?.on(this.identifier, (ev) => {
            if (ev.type === "InsertOrUpdate") this.#OnInsertOrUpdate(ev.data);
            if (ev.type === "DeleteQuest") this.#OnDeleteQuest(ev.data);
            else if (ev.type == "UpdateObjective")
                this.#OnUpdateObjective(ev.data);
        });
    }

    emit(type, payload) {
        // Add the user to the data for tracking who sent the data.
        payload.user = game.user;

        const sock = game.socket;
        if (sock)
            return sock.emit(this.identifier, { type: type, data: payload });
    }

    #OnInsertOrUpdate(data) {
        // If the user isn't a GM, ignore.
        if (!game.user.isGM) return;

        // If the quest is a GM quest but players aren't allowed
        // to edit GM quests, don't allow the edit.
        if (data.GMQuest && !Settings.get(Settings.NAMES.PLAYER_EDIT)) return;

        console.log(`User ${data.user.id} has edited quest ${data.questId}`);
        let q = new Quest(data);
        QuestDatabase.InsertOrUpdate(q);
        UIManager.tracker.render();
    }

    #OnDeleteQuest(data) {
        // If the user isn't a GM, ignore.
        if (!game.user.isGM) return;

        // If the quest is a GM quest, players cannot delete it.
        if (data.GMQuest) return;

        console.log(`User ${data.user.id} has deleted quest ${data.questId}`);
        QuestDatabase.removeQuest(data.questId);
    }

    #OnUpdateObjective(data) {
        // If the user isn't a GM, ignore.
        if (!game.user.isGM) return;

        // Get the quest
        var Q = QuestDatabase.getQuest(data.questId);

        // If the quest is a GM quest but players aren't allowed
        // to mark GM quests, don't allow the mark.
        if (Q.GMQuest && !Settings.get(Settings.NAMES.PLAYER_MARK)) return;

        console.log(
            `User ${data.user.id} has marked quest ${data.questId} objective ${data.objId}`
        );
        Quest.updateObjective(data.questId, data.objId, "state");
    }
}
