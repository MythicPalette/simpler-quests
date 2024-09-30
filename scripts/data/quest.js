import { Objective } from "./objective.js";
import { Settings } from "../helpers/settings.js";

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

    static stringify(quest) {
        let strings = [];
        quest.objectives.forEach((o) => {
            strings.push(Objective.stringify(o));
        });
        return strings.join("\n");
    }
}
