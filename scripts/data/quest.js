import { Objective } from "./objective.js";
import { Settings } from "../helpers/settings.js";
import { QuestDatabase } from "./database.js";

export class Quest {
    constructor(data = {}) {
        this.loadData(data);
    }

    loadData(data = {}) {
        // Try to load the data into this Quest if the data exists
        this.id = data.id || null;
        this.title =
            data.title || game.i18n.localize("SimplerQuests.Quest.New");
        this.visible = data.visible || false;
        this.objectives = [];
        this.viewStyle =
            data.viewStyle || Settings.get(Settings.NAMES.QUEST_VIEW_STYLE);

        // Go through the objectives in the data and create them.
        if (data.objectives) {
            data.objectives.forEach((o) => {
                // Create the objective and add it to the list.
                this.objectives.push(new Objective(o));
            });
        }
    }

    static updateObjective(questId, objId, key, value) {
        // This function will be used to recursively search for and update
        // the selected quest objective.
        function findAndUpdate(obj, id) {
            // If the current objective is the correct one, update it.
            if (obj.id === id) {
                if (key === "state") {
                    // If a state was given, set it
                    if (value) obj.state = value;
                    // If a state was not given then progress the state.
                    else obj.state = Objective.getNextState(obj.state);
                } else if (key === "secret") {
                    if (value) obj.secret = value;
                    else obj.secret = !obj.secret;
                } else obj[key] = value;
            } else if (obj.subs) {
                // Iterate through subobjectives and attempt to update.
                obj.subs.forEach((o) => {
                    findAndUpdate(o, id);
                });
            }
        }

        let quest = QuestDatabase.getQuest(questId);
        if (!quest) {
            console.error(`Unable to locate quest "${id}"`);
            return false;
        }

        quest.objectives.forEach((o) => {
            findAndUpdate(o, objId);
        });

        // Update the quest and save.
        QuestDatabase.update(quest);
        QuestDatabase.save();
        return true;
    }

    static stringify(quest) {
        let strings = [];
        quest.objectives.forEach((o) => {
            strings.push(Objective.stringify(o));
        });
        return strings.join("\n");
    }
}
