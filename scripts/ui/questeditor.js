import { constants, getSocket, objectiveState } from "../helpers/global.js";
import { QuestDatabase } from "../data/database.js";
import { Quest } from "../data/quest.js";
import { Objective } from "../data/objective.js";
import { UIManager } from "./ui-manager.js";
import { Settings } from "../helpers/settings.js";
import { Select } from "../controls/select.js";

export class QuestEditor extends Application {
    // This dictionary makes it easier to load the options for the view styles.
    #viewStyles = Object.freeze({
        all: game.i18n.localize("SimplerQuests.Settings.ViewStyle.All"),
        next: game.i18n.localize("SimplerQuests.Settings.ViewStyle.Next"),
        complete: game.i18n.localize(
            "SimplerQuests.Settings.ViewStyle.Complete"
        ),
    });

    // Holds the base quest info. This is most important for editing quests.
    #quest;
    get quest() {
        return this.#quest;
    }

    constructor(options = {}) {
        super(options);

        // If the quest ID is given, load the quest info.
        if (options.questId) {
            this.#quest = QuestDatabase.getQuest(options.questId);
            if (!this.#quest) {
                throw `Unable to locate quest "${id}"`;
            }
        } else {
            this.#quest = new Quest();
            if (!game.user.isGM) this.#quest.visible = true;
        }
    }

    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            id: constants.editorName,
            classes: [constants.moduleName, constants.editorName],
            template: "modules/simpler-quests/templates/editor.hbs",
            width: 300,
            height: 300,
            minimizable: false,
            resizable: true,
            title: game.i18n.localize("SimplerQuests.Editor.Title"),
        };
    }

    _getHeaderButtons() {
        return super._getHeaderButtons();
    }

    async render(force = false, options = {}) {
        options = {
            ...options,
            ...Settings.get(Settings.NAMES.TRACKER_POS),
        };
        await super.render(force, options);
    }

    setPosition(position = {}) {
        super.setPosition(position);
        // Get the current settings.
        let pos = Settings.get(Settings.NAMES.EDITOR_POS);

        // Merge the new position data with the old and save.
        Settings.set(Settings.NAMES.EDITOR_POS, { ...pos, ...position });
    }

    activateListeners($html) {
        super.activateListeners($html);

        // Create the listener for the save button.
        $html.find("button.save-quest").on("click", (evt) => {
            evt.preventDefault();

            // Get the title from the input
            let title = $html.find("#quest-title-input");
            if (title) title = title[0].value;

            // Get the quest objectives from the text.
            let text = $html.find("#quest-objective-input");
            if (text) text = text[0].value;

            // Parse the objectives into usable objects.
            const objs = Objective.parseMulti(text);

            // Get the display mode
            const selectBody = $html
                .find("#objective-display-select > .selection-bar > .body")
                .data("value");

            // Prepare the quest data
            let qData = {
                id: this.quest.id,
                title: title,
                objectives: objs,
                viewStyle: selectBody,
                visible: this.quest.visible,
            };

            // If the user is the GM then save the quest
            // TODO Flip this by removing the !
            if (game.user.isGM) {
                let q = new Quest(qData);

                QuestDatabase.InsertOrUpdate(q);
                console.log(q);
                UIManager.tracker.render();
                this.close();
            } else {
                getSocket().emit({
                    type: "InsertOrUpdate",
                    data: qData,
                });
                UIManager.tracker.render();
                this.close();
            }
        });

        // Quest visibility toggle.
        $html.find(".quest-visibility").on("click", (evt) => {
            this.#quest.visible = !this.quest.visible;
            this.render();
        });

        // Creates a usable dropdown menu.
        Select.setup($html);
    }

    async getData(options = {}) {
        const viewStyle =
            this.quest.viewStyle ||
            Settings.get(Settings.NAMES.QUEST_VIEW_STYLE);

        return foundry.utils.mergeObject(super.getData(), {
            isGM: game.user.isGM,
            title: "Quest Editor Test",
            questTitle: this.quest.title,
            objectives: Quest.stringify(this.quest),
            visible: this.quest.visible,
            viewStyle: viewStyle,
            viewStyleHint: this.#viewStyles[viewStyle],
            showObjectiveOptions: true,
            /*[
                {id: 0, name: "Quest 1", objectives: "Do things\nNew Stuff" },
                {id: 1, name: "Quest 2", objectives: [] },
                {id: 2, name: "Quest 3", objectives: [] },
            ]*/
        });
    }

    async close(options) {
        return super.close(options);
    }

    async _render(force = false, options = {}) {
        await super._render(force, options);
    }
}
