import { Objective } from "./objective.js";
import { Settings } from "../helpers/settings.js";

export class Quest {
    // assigned id of the quest
    id;

    // title given by the GM
    title;

    // This allows players to see the quest
    // in the quest tracker.
    visible;

    // List of objectives assigned by the GM.
    objectives;

    // Determines how the objectives are displayed to players.
    viewStyle;

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
            data.viewStyle ||
            Settings.get(Settings.settingNames.objectiveListStyle);

        // Go through the objectives in the data and create them.
        if (data.objectives) {
            data.objectives.forEach((o) => {
                // Create the objective and add it to the list.
                this.objectives.push(new Objective(o));
            });
        }
    }
}
