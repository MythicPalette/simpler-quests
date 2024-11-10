import { constants, getSocket } from "../helpers/global.js";
import { QuestDatabase } from "../data/database.js";
import { QuestEditor } from "./questeditor.js";
import { objectiveState } from "../helpers/global.js";
import { Settings } from "../helpers/settings.js";
import { Objective } from "../data/objective.js";
import { Quest } from "../data/quest.js";

export class QuestTracker extends Application {
    #collapsed;
    get collapsed() {
        return this.#collapsed;
    }
    collapse(state = null) {
        if (state === null) this.#collapsed = !this.collapsed;
        else this.#collapsed = state;
        this.render();
    }

    constructor(options = {}) {
        super(options);
        this.#collapsed = false;
        // Get the previously active quests.
        let active = Settings.get(Settings.NAMES.ACTIVE_QUESTS).active;

        // Remove any quests that don't exist anymore from the active list.
        if (active)
            this.#activeQuests = active.filter((qid) =>
                QuestDatabase.questExists(qid)
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
            canEdit: game.user.isGM || Settings.get(Settings.NAMES.PLAYER_EDIT),
            canCreate:
                game.user.isGM || Settings.get(Settings.NAMES.PLAYER_CREATE),
            activeQuests: this.activeQuests,
            offset: `${Settings.get(Settings.NAMES.TRACKER_OFFSET) / 16}rem`,
            docked: Settings.get(Settings.NAMES.TRACKER_DOCKED),
            trackerWidth: Settings.get(Settings.NAMES.TRACKER_WIDTH),
            trackerMaxH: Settings.get(Settings.NAMES.TRACKER_MAX_H),
        });
    }

    activateListeners($html) {
        const getQuestData = (target) => {
            let result = {};

            // Get the quest and objective ID
            result.questId = target.closest("[data-quest-id]").dataset.questId;

            // Validate the quest id.
            if (!result.questId) {
                console.error("Failed to get quest id.");
                return null;
            }
            // Get the quest.
            result.quest = QuestDatabase.getQuest(result.questId);

            // Ensure the quest is a valid object.
            if (!result.quest) {
                console.error(
                    `Failed to get quest with id "${result.questId}".`
                );
                return null;
            }

            return result;
        };

        // Get the ID.
        const getObjectiveId = (target) => {
            // Get the objective id
            const objId = target.dataset.id;

            // validate the objective id.
            if (objId === undefined) {
                // On failure to get the id, log an error
                // and return null.
                console.error("Failed to get objective id.");
                return null;
            }

            return objId;
        };

        // Control for the user to minimize/expand the tracker window.
        $html.find(".minimize").on("click", (evt) => {
            evt.stopPropagation();
            this.collapse();
            console.log(result);
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

        // Progress the state of an objective.
        $html.find(".simpler-quest-objective").on("click", (evt) => {
            evt.stopPropagation();

            // Get the quest data.
            const data = getQuestData(evt.target);
            if (!data) return;

            // Get the object ID.
            const objId = getObjectiveId(evt.target);
            if (!objId) return;

            // Update the objective state
            const questId =
                evt.target.closest("[data-quest-id]").dataset.questId;

            if (game.user.isGM) Quest.updateObjective(questId, objId, "state");
            else {
                getSocket().emit("UpdateObjective", {
                    questId: questId,
                    objId: objId,
                    key: "state",
                });
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

        // All of the listeners beyond this point require permission.
        if (!game.user.isGM && !Settings.get(Settings.NAMES.PLAYER_EDIT))
            return;

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

                const data = getQuestData(evt.target);
                if (!data) return;

                // Get the user's confirmation that they want to
                // delete the quest.
                const confirmed = await Dialog.confirm({
                    title: game.i18n.localize(
                        "SimplerQuests.DeleteDialog.Title"
                    ),
                    content: game.i18n.format(
                        "SimplerQuests.DeleteDialog.Message",
                        { title: data.quest.title }
                    ),
                });

                // If the user confirmed, delete the quest.
                if (confirmed) {
                    if (game.user.isGM) QuestDatabase.removeQuest(data.questId);
                    else {
                        getSocket().emit("DeleteQuest", { questId: questId });
                    }
                }
            });

        // Listeners beyond this point are GM Only.
        if (!game.user.isGM) return;

        // Toggle the visibility of quests.
        $html
            .find(".simpler-tracked-quest > .header > .vis-toggle")
            .on("click", (evt) => {
                evt.stopPropagation();

                // Get the quest data.
                const data = getQuestData(evt.target);

                // If the quest data is valid
                if (data.quest) {
                    // Set the quest visibility and save.
                    QuestDatabase.update({
                        ...data.quest,
                        visible: !data.quest.visible,
                    });
                    QuestDatabase.save();
                }
            });

        // Toggle the Secret status of an objective.
        $html.find(".simpler-quest-objective").on("contextmenu", (evt) => {
            evt.stopPropagation();
            evt.preventDefault();

            // Get the object ID.
            const objId = getObjectiveId(evt.target);
            if (!objId) return;

            // Update the objective secret
            const questId =
                evt.target.closest("[data-quest-id]").dataset.questId;
            Quest.updateObjective(questId, objId, "secret");
        });
    }

    refresh() {
        // Reload the active quests and re-render the tracker.
        this.#activeQuests = Settings.get(Settings.NAMES.ACTIVE_QUESTS).active;
        this.render();
    }
}
