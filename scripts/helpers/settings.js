import { UIManager } from "../ui/ui-manager.js";
import { constants } from "./global.js";

export class Settings {
    static NAMES = Object.freeze({
        QUEST_DB: "questDB",
        EXPAND_MULTI: "expandMultiple",
        ACTIVE_QUESTS: "activeQuests",
        QUEST_VIEW_STYLE: "objectiveListStyle",
        TRACKER_OFFSET: "offset",
        TRACKER_DOCKED: "docked",
        TRACKER_WIDTH: "width",
        TRACKER_MAX_H: "maxHeight",
        TRACKER_POS: "trackerWindowPosition",
        TRACKER_OPEN: "trackerWindowOpen",
    });

    static registerSettings() {
        game.settings.register(constants.moduleName, this.NAMES.QUEST_DB, {
            name: "Quest Database",
            scope: "world",
            type: Object,
            default: { quests: [] },
            config: false,
        });

        game.settings.register(
            constants.moduleName,
            this.NAMES.QUEST_VIEW_STYLE,
            {
                name: "SimplerQuests.Settings.ViewStyle.Name",
                hint: "SimplerQuests.Settings.ViewStyle.Hint",
                scope: "world",
                type: String,
                defaut: "all",
                config: true,
                choices: {
                    all: "SimplerQuests.Settings.ViewStyle.All",
                    next: "SimplerQuests.Settings.ViewStyle.Next",
                    complete: "SimplerQuests.Settings.ViewStyle.Complete",
                },
            }
        );

        game.settings.register(constants.moduleName, this.NAMES.EXPAND_MULTI, {
            name: "SimplerQuests.Settings.ExpandMultiple.Name",
            hint: "SimplerQuests.Settings.ExpandMultiple.Hint",
            scope: "local",
            type: Boolean,
            default: false,
            config: true,
            requiresReload: true,
        });

        game.settings.register(constants.moduleName, this.NAMES.ACTIVE_QUESTS, {
            name: "Expanded Quests",
            scope: "local",
            type: Object,
            default: { active: [] },
            config: false,
        });

        game.settings.register(
            constants.moduleName,
            this.NAMES.TRACKER_DOCKED,
            {
                name: "SimplerQuests.Settings.TrackerDocked.Name",
                hint: "SimplerQuests.Settings.TrackerDocked.Hint",
                scope: "local",
                type: Boolean,
                default: true,
                config: true,
                requiresReload: true,
            }
        );

        game.settings.register(
            constants.moduleName,
            this.NAMES.TRACKER_OFFSET,
            {
                name: "SimplerQuests.Settings.TrackerOffset.Name",
                hint: "SimplerQuests.Settings.TrackerOffset.Hint",
                scope: "local",
                type: Number,
                default: 10,
                config: true,
                onChange: () => {
                    UIManager.tracker.render();
                },
            }
        );

        game.settings.register(constants.moduleName, this.NAMES.TRACKER_WIDTH, {
            name: "SimplerQuests.Settings.TrackerWidth.Name",
            hint: "SimplerQuests.Settings.TrackerWidth.Hint",
            scope: "local",
            type: Number,
            default: 300,
            config: true,
            onChange: () => {
                UIManager.tracker.render();
            },
        });

        game.settings.register(constants.moduleName, this.NAMES.TRACKER_MAX_H, {
            name: "SimplerQuests.Settings.TrackerMaxHeight.Name",
            hint: "SimplerQuests.Settings.TrackerMaxHeight.Hint",
            scope: "local",
            type: Number,
            default: 500,
            config: true,
            onChange: () => {
                UIManager.tracker.render();
            },
        });

        game.settings.register(constants.moduleName, this.NAMES.TRACKER_POS, {
            name: "Tracker Position",
            scope: "local",
            type: Object,
            default: {},
            config: false,
        });

        game.settings.register(constants.moduleName, this.NAMES.TRACKER_OPEN, {
            NAME: "Tracker Open",
            scope: "local",
            type: Boolean,
            default: true,
            config: false,
        });
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
