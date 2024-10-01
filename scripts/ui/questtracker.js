import { constants } from "../helpers/constants.js";
import { QuestDatabase } from "../data/database.js";
import { QuestEditor } from "./questeditor.js";
import { objectiveState } from "../helpers/constants.js";
import { Settings } from "../helpers/settings.js";
import { Objective } from "../data/objective.js";

export class QuestTracker extends Application {
    #collapsed;
    get collapsed() {
        return this.#collapsed;
    }
    collapse() {
        this.#collapsed = !this.collapsed;
        this.render();
    }

    constructor(options = {}) {
        super(options);
        this.#collapsed = false;
        // Get the previously active quests.
        let active = Settings.get(Settings.NAMES.ACTIVE_QUESTS).active;

        // Remove any quests that don't exist anymore from the active list.
        if (active)
            this.#activeQuests = active.filter(
                (qid) => QuestDatabase.getIndex(qid) > -1
            );
    }

    static get defaultOptions() {
        if (Settings.get(Settings.NAMES.TRACKER_DOCKED))
            return {
                ...super.defaultOptions,
                id: constants.trackerName,
                popOut: false,
                template: "modules/simpler-quests/templates/tracker-dock.hbs",
            };
        else
            return {
                ...super.defaultOptions,
                id: constants.trackerName,
                classes: [constants.moduleName, "tracker"],
                template: "modules/simpler-quests/templates/tracker-body.hbs",
                minimizable: true,
                resizable: true,
                title: game.i18n.localize("SimplerQuests.Tracker.Title"),
            };
    }

    #activeQuests = [];
    get activeQuests() {
        return this.#activeQuests;
    }

    async render(force = false, options = {}) {
        options = {
            ...options,
            ...Settings.get(Settings.NAMES.TRACKER_POS),
        };

        await super.render(force, options);

        // Check if the tracker is docked.
        const docked = Settings.get(Settings.NAMES.TRACKER_DOCKED);
        if (!docked) {
            // The tracker is rendered and not docked.
            // Save the open state and the position.
            Settings.set(Settings.NAMES.TRACKER_OPEN, true);
        }
    }

    async close(options = {}) {
        await super.close(options);
        Settings.set(Settings.NAMES.TRACKER_OPEN, false);
    }

    setPosition(position = {}) {
        super.setPosition(position);
        // Get the current settings.
        let pos = Settings.get(Settings.NAMES.TRACKER_POS);

        // Merge the new position data with the old and save.
        Settings.set(Settings.NAMES.TRACKER_POS, { ...pos, ...position });
    }

    getData(options = {}) {
        return foundry.utils.mergeObject(super.getData(options), {
            title: game.i18n.localize("SimplerQuests.Tracker.Title"),
            collapsed: this.collapsed,
            quests: QuestDatabase.quests,
            isGM: game.user.isGM,
            activeQuests: this.activeQuests,
            offset: `${Settings.get(Settings.NAMES.TRACKER_OFFSET) / 16}rem`,
            docked: Settings.get(Settings.NAMES.TRACKER_DOCKED),
            trackerWidth: Settings.get(Settings.NAMES.TRACKER_WIDTH),
            trackerMaxH: Settings.get(Settings.NAMES.TRACKER_MAX_H),
        });
    }

    activateListeners($html) {
        // Control for the user to minimize/expand the tracker window.
        $html.find(".minimize").on("click", (evt) => {
            evt.stopPropagation();
            this.collapse();
        });

        // Expand/Collapse quest bodies.
        $html.find(".simpler-tracked-quest > .header").on("click", (evt) => {
            evt.stopPropagation();

            // Get the quest id
            const questId =
                evt.target.closest("[data-quest-id]").dataset.questId;

            // Get the multiple expansion setting
            const multi = Settings.get(Settings.NAMES.EXPAND_MULTI);

            // If multi is enabled
            if (multi) {
                // Check if the quest id is in the list and remove it if it is
                // otherwise add it.
                if (this.activeQuests.includes(questId))
                    this.#activeQuests = this.#activeQuests.filter(
                        (s) => s !== questId
                    );
                else this.#activeQuests.push(questId);
            } else {
                // Multi is disabled

                // If the quest id is in the list, clear the entire list
                // This is how we keep the list as a single quest id.
                if (this.activeQuests.includes(questId))
                    this.#activeQuests = [];
                // Flush the list to remove any other quests then
                // add the current quest id.
                else {
                    this.#activeQuests = [];
                    this.#activeQuests.push(questId);
                }
            }

            // Save the active quest data to the local storage.
            Settings.set(Settings.NAMES.ACTIVE_QUESTS, {
                active: this.activeQuests,
            });
            this.render();
        });

        // All of the listeners beyond this point are for the GM only.
        if (!game.user.isGM) return;
        // Progress the state of an objective.
        $html.find(".simpler-quest-objective").on("click", (evt) => {
            evt.stopPropagation();

            // Get the quest and objective ID
            const questId =
                evt.target.closest("[data-quest-id]").dataset.questId;

            // Get the objective index
            const objId = evt.target.dataset.id;

            // Get the index of the quest objective.
            if (!questId || objId === undefined) return;

            // Get the quest.
            let quest = QuestDatabase.getQuest(questId);

            // Ensure the quest is a valid object.
            if (!quest) return;

            // This function will be used to recursively search for and update
            // the selected quest objective.
            function findAndUpdateState(obj, id) {
                // If the current objective is the correct one, update it.
                if (obj.id === id) {
                    obj.state = Objective.getNextState(obj.state);
                } else if (obj.subs) {
                    // Iterate through subobjectives and attempt to update.
                    obj.subs.forEach((o) => {
                        findAndUpdateState(o, id);
                    });
                }
            }

            quest.objectives.forEach((o) => {
                findAndUpdateState(o, objId);
            });

            // Update the quest and save.
            QuestDatabase.update(quest);
            QuestDatabase.save();
        });

        // Toggle the Secret status of an objective.
        $html.find(".simpler-quest-objective").on("contextmenu", (evt) => {
            evt.stopPropagation();
            evt.preventDefault();

            // Get the quest and objective ID
            const questId =
                evt.target.closest("[data-quest-id]").dataset.questId;
            const objId = evt.target.dataset.id;

            // If either ID is invalid, abort.
            if (!questId || objId === undefined) return;

            // Get the quest
            let quest = QuestDatabase.getQuest(questId);

            // This function will be used to recursively search for and update
            // the selected quest objective.
            function findAndUpdateSecret(obj, id) {
                // If the current objective is the correct one, update it.
                if (obj.id === id) {
                    obj.secret = !obj.secret;
                } else if (obj.subs) {
                    // Iterate through subobjectives and attempt to update.
                    obj.subs.forEach((o) => {
                        findAndUpdateSecret(o, id);
                    });
                }
            }

            quest.objectives.forEach((o) => {
                findAndUpdateSecret(o, objId);
            });

            // Update the database and save.
            QuestDatabase.update(quest);
            QuestDatabase.save();
        });

        // Toggle the visibility of quests.
        $html
            .find(".simpler-tracked-quest > .header > .vis-toggle")
            .on("click", (evt) => {
                evt.stopPropagation();

                // Get the quest id
                const questId =
                    evt.target.closest("[data-quest-id]").dataset.questId;

                // Get the quest data.
                const quest = QuestDatabase.getQuest(questId);

                // If the quest data is valid
                if (quest) {
                    // Set the quest visibility and save.
                    QuestDatabase.update({
                        ...quest,
                        visible: !quest.visible,
                    });
                    QuestDatabase.save();
                }
            });

        // Edit a quest's data.
        $html
            .find(".simpler-tracked-quest > .header > .edit")
            .on("click", (evt) => {
                evt.stopPropagation();

                // Get the quest id.
                const questId =
                    evt.target.closest("[data-quest-id]").dataset.questId;

                // Load the QuestEditor with the quest data and render.
                let qe = new QuestEditor({ questId: questId });
                qe.render(true, { focus: true });
            });

        // Create a new quest.
        $html.find(".header > .new-quest").on("click", (evt) => {
            evt.stopPropagation();

            // Load a blank QuestEditor and render.
            let qe = new QuestEditor();
            qe.render(true, { focus: true });
        });

        // Delete a quest.
        $html
            .find(".simpler-tracked-quest > .header > .delete")
            .on("click", async (evt) => {
                evt.stopPropagation();

                // Get the quest id
                const questId =
                    evt.target.closest("[data-quest-id]").dataset.questId;

                // Get the quest data because we need the name for
                // the confirmation dialog.
                const quest = QuestDatabase.getQuest(questId);

                // Verify that a quest was found.
                if (!quest) return;

                // Get the user's confirmation that they want to
                // delete the quest.
                const confirmed = await Dialog.confirm({
                    title: game.i18n.localize(
                        "SimplerQuests.DeleteDialog.Title"
                    ),
                    content: game.i18n.format(
                        "SimplerQuests.DeleteDialog.Message",
                        { title: quest.title }
                    ),
                });

                // If the user confirmed, delete the quest.
                if (confirmed) {
                    QuestDatabase.removeQuest(questId);
                }
            });
    }

    refresh() {
        // Reload the active quests and re-render the tracker.
        this.#activeQuests = Settings.get(Settings.NAMES.ACTIVE_QUESTS).active;
        this.render();
    }
}
