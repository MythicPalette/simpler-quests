import { QuestDatabase } from "./data/database.js";
import { Objective } from "./data/objective.js";
import { Quest } from "./data/quest.js";
import { objectiveState } from "./helpers/global.js";
import { Settings } from "./helpers/settings.js";
import { UIManager } from "./ui/ui-manager.js";

export class SimplerQuestsAPI {
    /*
        The API functions are created in the constructor
        rather than as built-in functions. This is to ensure
        that GM-only functions are not exposed to players.
    */
    constructor() {
        this.tracker = {
            // Expands the tracker dock or opens the tracker window.
            open: () => {
                if (Settings.get(Settings.NAMES.TRACKER_DOCKED)) {
                    // If the tracker is docked, uncollapse it.
                    UIManager.tracker.collapse(false);
                } else {
                    UIManager.tracker.render(true, {
                        focus: true,
                    });
                }
            },
            // Minimizes the tracker dock or closes the tracker window.
            close: () => {
                if (Settings.get(Settings.NAMES.TRACKER_DOCKED)) {
                    // If the tracker is docked, uncollapse it.
                    UIManager.tracker.collapse(true);
                } else {
                    UIManager.tracker.close();
                }
            },

            // Toggles the state of the tracker dock or window.
            toggle: () => {
                if (Settings.get(Settings.NAMES.TRACKER_DOCKED)) {
                    UIManager.tracker.collapse();
                    return UIManager.tracker.collapsed;
                } else {
                    // If the state is greater than zero the window is
                    // rendering or rendered.
                    if (UIManager.tracker.rendered) UIManager.tracker.close();
                    else UIManager.tracker.render(true, { focus: true });
                }
            },
        };

        this.quests = {
            // Returns a specific quest. This is a post-filter quest search
            // meaning that users will not be able to access hidden quests.
            get: (id) => {
                if (!id) return false;
                return QuestDatabase.getQuest(id);
            },

            // Returns a filtered list of quests.
            getAll: () => {
                return QuestDatabase.quests;
            },

            // Returns the index of a specific quest. This is a post-filter
            // search meaning that users will not be able to get the index
            // of a hidden quest.
            getQuestIndex: (id) => {
                if (!id) return false;
                // Get the index of the quest
                return QuestDatabase.getIndex(id);
            },
        };

        if (!game.user.isGM) return;
        // Everything from this point forward is meant for the GM only

        this.quests.create = (data = {}) => {
            return QuestDatabase.insert(data);
        };

        this.quests.remove = (id) => {
            if (!id) return false;
            return QuestDatabase.removeQuest(id);
        };

        this.quests.update = (data) => {
            return QuestDatabase.update(data);
        };

        this.quests.createObjective = (questId, data) => {
            if (!data) throw `Required argument "data" cannot be null.`;
            let o = new Objective(data);
            let q = this.quests.get(questId);
            if (!q) throw `Unable to get quest "${questId}"`;

            return QuestDatabase.update({
                ...q,
                objectives: [...q.objectives, o],
            });
        };

        this.quests.removeObjective = (questId, objId) => {
            let q = this.quests.get(questId);
            if (!q) throw `Unable to get quest "${questId}"`;

            return QuestDatabase.update({
                ...q,
                objectives: [...q.objectives.filter((o) => o.id !== objId)],
            });
        };

        this.quests.updateObjective = (questId, objId, key, value) =>
            Quest.updateObjective(questId, objId, key, value);
    }
}
