import { constants } from "./constants.js";

export class Settings {
    static settingNames = Object.freeze({
        questDB: "questDB",
        expandMulti: "expandMultiple",
        activeQuests: "activeQuests",
        objectiveListStyle: "objectiveListStyle",
    });

    static registerSettings() {
        game.settings.register(
            constants.moduleName,
            this.settingNames.questDB,
            {
                name: "Quest Database",
                scope: "world",
                type: Object,
                default: { quests: [] },
                config: false,
            }
        );

        game.settings.register(
            constants.moduleName,
            this.settingNames.objectiveListStyle,
            {
                name: "SimplerQuests.Settings.ObjectiveStyle.Name", //"Objective List Style",
                hint: "SimplerQuests.Settings.ObjectiveStyle.Hint",
                scope: "world",
                type: String,
                defaut: "all",
                config: true,
                choices: {
                    all: "SimplerQuests.Settings.ObjectiveStyle.All",
                    next: "SimplerQuests.Settings.ObjectiveStyle.Next",
                    complete: "SimplerQuests.Settings.ObjectiveStyle.Complete",
                },
            }
        );

        game.settings.register(
            constants.moduleName,
            this.settingNames.expandMulti,
            {
                name: "SimplerQuests.Settings.ExpandMultiple.Name",
                hint: "SimplerQuests.Settings.ExpandMultiple.Hint",
                scope: "local",
                type: Boolean,
                default: false,
                config: true,
                requiresReload: true,
            }
        );

        game.settings.register(
            constants.moduleName,
            this.settingNames.activeQuests,
            {
                name: "Active Quests",
                scope: "local",
                type: Object,
                default: { active: [] },
                config: false,
            }
        );
    }

    static get(name) {
        // To make debugging easier, load the result into a variable.
        let result = game.settings.get(constants.moduleName, name);
        return result;
    }

    static set(name, value) {
        return game.settings.set(constants.moduleName, name, value);
    }
}
