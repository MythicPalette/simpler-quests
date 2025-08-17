const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { constants, getSocket } from "../helpers/global.js";
import { QuestDatabase } from "../data/database.js";
import { QuestEditor } from "./questeditor.js";
import { Settings } from "../helpers/settings.js";
import { Quest } from "../data/quest.js";

export class QuestTracker extends HandlebarsApplicationMixin(ApplicationV2) {
    #collapsed;
    activeQuests = [];
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
            this.activeQuests = active.filter((qid) =>
                QuestDatabase.questExists(qid)
            );
    }

    static get DEFAULT_OPTIONS() {
        let displayStyle = Settings.get(Settings.NAMES.TRACKER_DISPLAY_STYLE);
        const result = {
            id: constants.trackerName,
            actions: {
                minimize: QuestTracker.#minimizeAction,
                collapseHeader: QuestTracker.#collapseHeaderAction,
                addQuest: QuestTracker.#addQuestAction,
                editQuest: QuestTracker.#editQuestAction,
                deleteQuest: QuestTracker.#deleteQuestAction,
                visToggle: QuestTracker.#visToggleAction,
                objective: QuestTracker.#objectiveAction,
            },
        };

        switch (displayStyle) {
            case "docked":
                result.window = { frame: false };
                break;

            default:
                const pos = Settings.get(Settings.NAMES.TRACKER_POS);
                result.position = {
                    top: pos.top,
                    left: pos.left,
                    width: pos.width,
                    height: pos.height,
                };
                result.window = {
                    icon: "fas fa-scroll",
                    controls: [
                        {
                            icon: `fa-solid fa-plus`,
                            label: "Add Quest",
                            action: "addQuest",
                        },
                    ],
                    positioned: true,
                    minimizable: true,
                    resizable: true,
                };
        }

        return result;
    }

    static get PARTS() {
        let displayStyle = Settings.get(Settings.NAMES.TRACKER_DISPLAY_STYLE);
        switch (displayStyle) {
            case "docked":
                return {
                    dock: {
                        template:
                            "modules/simpler-quests/templates/tracker-dock.hbs",
                    },
                };

            default:
                return {
                    dock: {
                        template:
                            "modules/simpler-quests/templates/tracker-body.hbs",
                    },
                };
        }
    }

    get title() {
        return game.i18n.localize("MythicsSimplerQuests.Tracker.Title");
    }

    get activeQuests() {
        return this.activeQuests;
    }

    async render(force = false, options = {}) {
        options = {
            ...options,
            ...Settings.get(Settings.NAMES.TRACKER_POS),
        };

        await super.render(force, options);

        // Check if the tracker is docked.
        const displayStyle = Settings.get(Settings.NAMES.TRACKER_DISPLAY_STYLE);
        if (displayStyle === "floating") {
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

    _prepareContext(options = {}) {
        return {
            title: game.i18n.localize("MythicsSimplerQuests.Tracker.Title"),
            collapsed: this.collapsed,
            quests: QuestDatabase.quests,
            isGM: game.user.isGM,
            canEdit: game.user.isGM || Settings.get(Settings.NAMES.PLAYER_EDIT),
            canCreate:
                game.user.isGM || Settings.get(Settings.NAMES.PLAYER_CREATE),
            activeQuests: this.activeQuests,
            offsetx: `${Settings.get(Settings.NAMES.TRACKER_OFFSET_X) / 16}rem`,
            offsety: `${Settings.get(Settings.NAMES.TRACKER_OFFSET_Y) / 16}rem`,
            docked:
                Settings.get(Settings.NAMES.TRACKER_DISPLAY_STYLE) ===
                "sidebar",
            trackerWidth: Settings.get(Settings.NAMES.TRACKER_WIDTH),
            trackerMaxH: Settings.get(Settings.NAMES.TRACKER_MAX_H),
        };
    }

    _onRender(context, options) {
        //const $html = $(this.element);

        // All of the listeners beyond this point require permission.
        if (!game.user.isGM && !Settings.get(Settings.NAMES.PLAYER_EDIT))
            return;

        // Listeners beyond this point are GM Only.
        if (!game.user.isGM) return;

        // Toggle the Secret status of an objective.

        this.element
            .querySelector(".mythics-simpler-quest-objective")
            .addEventListener("contextmenu", (evt) => {
                evt.stopPropagation();
                evt.preventDefault();

                // Get the object ID.
                const objId = QuestTracker.#getObjectiveId(evt.target);
                if (!objId) return;

                // Update the objective secret
                const questId =
                    evt.target.closest("[data-quest-id]").dataset.questId;
                Quest.updateObjective(questId, objId, "secret");
            });

        let draggingItem = null;
        let isOverList = false;

        this.element.addEventListener("dragstart", (e) => {
            draggingItem = e.target;
            e.target.classList.add("dragging");
        });

        this.element.addEventListener("dragend", (e) => {
            e.target.classList.remove("dragging");
            const dragOverItem = this.element.querySelector(
                ".mythics-simpler-tracked-quest.sortable.over"
            );

            this.element
                .querySelectorAll(".mythics-simpler-tracked-quest.sortable")
                .forEach((el) => el.classList.remove("over", "under"));

            const dragId = draggingItem?.dataset.questId;

            if (dragOverItem) {
                dragOverItem.classList.remove("over");

                // Reorder the list
                const overIndex = QuestDatabase.getIndex(
                    dragOverItem.dataset.questId
                );

                QuestDatabase.moveQuest(dragId, overIndex);
            } else if (isOverList) {
                QuestDatabase.moveQuestToEnd(dragId);
            }
            draggingItem = null;
        });

        this.element.addEventListener("dragleave", (e) => {
            isOverList =
                !e.relatedTarget || !this.element.contains(e.relatedTarget);
        });

        this.element.addEventListener("dragover", (e) => {
            e.preventDefault();
            if (!draggingItem) return;

            isOverList = true;

            const draggingOverItem = getDragAfterElement(
                this.element,
                e.clientY
            );

            document
                .querySelectorAll(".mythics-simpler-tracked-quest.sortable")
                .forEach((el) => el.classList.remove("over", "under"));

            if (draggingOverItem?.element) {
                draggingOverItem.element.classList.add("over");
            } else {
                // add the under class here
                const sortableElements = this.element.querySelectorAll(
                    ".mythics-simpler-tracked-quest.sortable"
                );

                if (sortableElements.length > 0) {
                    const lastElement =
                        sortableElements[sortableElements.length - 1];
                    if (lastElement !== draggingItem)
                        lastElement.classList.add("under");
                }
            }
        });

        function getDragAfterElement(container, y) {
            const draggableElements = [
                ...container.querySelectorAll(".sortable:not(.dragging)"),
            ];

            if (draggableElements.length === 0) return null;
            return draggableElements.reduce(
                (closest, element) => {
                    const box = element.getBoundingClientRect();
                    const offset = y - box.top - box.height / 2;
                    if (offset < 0 && offset > closest.offset) {
                        return { offset, element };
                    } else {
                        return closest;
                    }
                },
                { offset: Number.NEGATIVE_INFINITY, element: null }
            );
        }
    }

    refresh() {
        // Reload the active quests and re-render the tracker.
        this.activeQuests = Settings.get(Settings.NAMES.ACTIVE_QUESTS).active;
        this.render();
    }

    _getHeaderButtons() {
        const buttons = super._getHeaderButtons();

        buttons.unshift({
            class: "add-quest",
            icon: "fa-solid fa-plus",
            label: game.i18n.localize("MythicsSimplerQuests.Tracker.AddQuest"),
            tooltip: game.i18n.localize(
                "MythicsSimplerQuests.Tracker.AddQuest"
            ),
            onclick: QuestTracker.#addQuestAction,
        });

        return buttons;
    }

    static #getQuestData(target) {
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
            console.error(`Failed to get quest with id "${result.questId}".`);
            return null;
        }

        return result;
    }

    static #getObjectiveId(target) {
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
    }

    /*
        The following are all callbacks for actions
    */
    static #minimizeAction(ev, target) {
        ev.stopPropagation();
        this.collapse();
    }

    static #collapseHeaderAction(ev, target) {
        ev.stopPropagation();

        // Get the quest id
        const questId = target.closest("[data-quest-id]").dataset.questId;

        // Get the multiple expansion setting
        const multi = Settings.get(Settings.NAMES.EXPAND_MULTI);

        // If multi is enabled
        if (multi) {
            // Check if the quest id is in the list and remove it if it is
            // otherwise add it.
            if (this.activeQuests.includes(questId))
                this.activeQuests = this.activeQuests.filter(
                    (s) => s !== questId
                );
            else this.activeQuests.push(questId);
        } else {
            // Multi is disabled

            // If the quest id is in the list, clear the entire list
            // This is how we keep the list as a single quest id.
            if (this.activeQuests.includes(questId)) this.activeQuests = [];
            // Flush the list to remove any other quests then
            // add the current quest id.
            else {
                this.activeQuests = [];
                this.activeQuests.push(questId);
            }
        }

        // Save the active quest data to the local storage.
        Settings.set(Settings.NAMES.ACTIVE_QUESTS, {
            active: this.activeQuests,
        });
        this.render();
    }

    static #addQuestAction(ev, target) {
        // Load a blank QuestEditor and render.
        let qe = new QuestEditor();
        qe.render(true, { focus: true });
    }

    static #editQuestAction(ev, target) {
        ev.stopPropagation();

        // Get the quest id.
        const questId = target.closest("[data-quest-id]").dataset.questId;

        // Load the QuestEditor with the quest data and render.
        let qe = new QuestEditor({ questId: questId });
        qe.render(true, { focus: true });
    }

    static async #deleteQuestAction(ev, target) {
        ev.stopPropagation();

        const data = QuestTracker.#getQuestData(target);
        if (!data) return;

        // Get the user's confirmation that they want to
        // delete the quest.
        const confirmed = await Dialog.confirm({
            title: game.i18n.localize(
                "MythicsSimplerQuests.DeleteDialog.Title"
            ),
            content: game.i18n.format(
                "MythicsSimplerQuests.DeleteDialog.Message",
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
    }

    static #visToggleAction(ev, target) {
        ev.stopPropagation();

        // Get the quest data.
        const data = QuestTracker.#getQuestData(target);

        // If the quest data is valid
        if (data.quest) {
            // Set the quest visibility and save.
            QuestDatabase.update({
                ...data.quest,
                visible: !data.quest.visible,
            });
            QuestDatabase.save();
        }
    }

    static #objectiveAction(ev, target) {
        ev.stopPropagation();

        // Get the quest data.
        const data = QuestTracker.#getQuestData(target);
        if (!data) return;

        // Get the object ID.
        const objId = QuestTracker.#getObjectiveId(target);
        if (!objId) return;

        // Update the objective state
        const questId = target.closest("[data-quest-id]").dataset.questId;

        if (game.user.isGM) Quest.updateObjective(questId, objId, "state");
        else {
            getSocket().emit("UpdateObjective", {
                questId: questId,
                objId: objId,
                key: "state",
            });
        }
    }
}
