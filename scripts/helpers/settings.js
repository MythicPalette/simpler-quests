import { UIManager } from "../ui/ui-manager.js";
import { constants } from "./global.js";

export class Settings {
    static NAMES = Object.freeze({
        QUEST_DB: "questDB",
        EXPAND_MULTI: "expandMultiple",
        ACTIVE_QUESTS: "activeQuests",
        QUEST_VIEW_STYLE: "objectiveListStyle",
        EDITOR_POS: "trackerWindowPosition",
        TRACKER_OFFSET: "offset",
        TRACKER_DOCKED: "docked",
        TRACKER_DISPLAY_STYLE: "trackerDisplayStyle",
        TRACKER_TAB: "dockedTab",
        TRACKER_WIDTH: "width",
        TRACKER_MAX_H: "maxHeight",
        TRACKER_POS: "trackerWindowPosition",
        TRACKER_OPEN: "trackerWindowOpen",
        TRACKER_HIDE: "trackerHideFromPlayers",
        PLAYER_EDIT: "playersEditQuest",
        PLAYER_CREATE: "playersCreateQuest",
        PLAYER_MARK: "playersMarkObjectives",
    });

    static registerSettings() {
        game.settings.register(constants.moduleName, this.NAMES.QUEST_DB, {
            name: "Quest Database",
            scope: "world",
            type: Object,
            default: { quests: [] },
            config: false,
        });

        game.settings.register(constants.moduleName, this.NAMES.TRACKER_HIDE, {
            name: "MythicsSimplerQuests.Settings.TrackerHidden.Name",
            hint: "MythicsSimplerQuests.Settings.TrackerHidden.Hint",
            scope: "world",
            type: Boolean,
            default: false,
            config: true,
            requiresReload: true,
        });

        game.settings.register(constants.moduleName, this.NAMES.PLAYER_CREATE, {
            name: "MythicsSimplerQuests.Settings.PlayerCreate.Name",
            hint: "MythicsSimplerQuests.Settings.PlayerCreate.Hint",
            scope: "world",
            type: Boolean,
            default: false,
            config: true,
            requiresReload: true,
        });

        game.settings.register(constants.moduleName, this.NAMES.PLAYER_EDIT, {
            name: "MythicsSimplerQuests.Settings.PlayerEdit.Name",
            hint: "MythicsSimplerQuests.Settings.PlayerEdit.Hint",
            scope: "world",
            type: Boolean,
            default: false,
            config: true,
            requiresReload: true,
        });

        game.settings.register(constants.moduleName, this.NAMES.PLAYER_MARK, {
            name: "MythicsSimplerQuests.Settings.PlayersMark.Name",
            hint: "MythicsSimplerQuests.Settings.PlayersMark.Hint",
            scope: "world",
            type: Boolean,
            default: false,
            config: true,
            requiresReload: true,
        });

        game.settings.register(
            constants.moduleName,
            this.NAMES.QUEST_VIEW_STYLE,
            {
                name: "MythicsSimplerQuests.Settings.ViewStyle.Name",
                hint: "MythicsSimplerQuests.Settings.ViewStyle.Hint",
                scope: "world",
                type: String,
                defaut: "all",
                config: true,
                choices: {
                    all: "MythicsSimplerQuests.Settings.ViewStyle.All",
                    next: "MythicsSimplerQuests.Settings.ViewStyle.Next",
                    complete:
                        "MythicsSimplerQuests.Settings.ViewStyle.Complete",
                },
            }
        );

        game.settings.register(constants.moduleName, this.NAMES.EXPAND_MULTI, {
            name: "MythicsSimplerQuests.Settings.ExpandMultiple.Name",
            hint: "MythicsSimplerQuests.Settings.ExpandMultiple.Hint",
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

        game.settings.register(constants.moduleName, this.NAMES.EDITOR_POS, {
            name: "Editor Position",
            scope: "local",
            type: Object,
            default: {},
            config: false,
        });

        game.settings.register(
            constants.moduleName,
            this.NAMES.TRACKER_DISPLAY_STYLE,
            {
                name: "MythicsSimplerQuests.Settings.TrackerDisplayStyle.Name",
                hint: "MythicsSimplerQuests.Settings.TrackerDisplayStyle.Hint",
                scope: "local",
                type: String,
                default: "sidebar",
                config: true,
                requiresReload: true,
                choices: {
                    // sidebar:
                    //     "MythicsSimplerQuests.Settings.TrackerDisplayStyle.Sidebar",
                    docked: "MythicsSimplerQuests.Settings.TrackerDisplayStyle.Docked",
                    floating:
                        "MythicsSimplerQuests.Settings.TrackerDisplayStyle.Floating",
                },
            }
        );

        game.settings.register(
            constants.moduleName,
            this.NAMES.TRACKER_OFFSET,
            {
                name: "MythicsSimplerQuests.Settings.TrackerOffset.Name",
                hint: "MythicsSimplerQuests.Settings.TrackerOffset.Hint",
                scope: "local",
                type: Number,
                default: 16,
                config: true,
                onChange: () => {
                    UIManager.tracker.render();
                },
            }
        );

        game.settings.register(constants.moduleName, this.NAMES.TRACKER_WIDTH, {
            name: "MythicsSimplerQuests.Settings.TrackerWidth.Name",
            hint: "MythicsSimplerQuests.Settings.TrackerWidth.Hint",
            scope: "local",
            type: Number,
            default: 300,
            config: true,
            onChange: () => {
                UIManager.tracker.render();
            },
        });

        game.settings.register(constants.moduleName, this.NAMES.TRACKER_MAX_H, {
            name: "MythicsSimplerQuests.Settings.TrackerMaxHeight.Name",
            hint: "MythicsSimplerQuests.Settings.TrackerMaxHeight.Hint",
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
            name: "Tracker Open",
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
