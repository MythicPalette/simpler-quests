import { objectiveState, gmCheck, newId } from "../helpers/global.js";
import { Settings } from "../helpers/settings.js";
import { Quest } from "./quest.js";

export class QuestDatabase extends Collection {
    static #quests;
    static get quests() {
        // Collect all quests.
        let q = this.#quests.map((q) => {
            // Get all of the objectives with index.
            let objs = q.objectives?.map((o, i) =>
                QuestDatabase.nestedObjectives(o, i, 0)
            );

            // If the user is not a GM, completely remove
            // all secret objectives from the list.
            if (!game.user.isGM) {
                objs = objs.filter((o) => !o.secret);
                function filterObjectives(arr) {
                    return arr.filter((o) => {
                        // If the current object is a secret, filter it out.
                        if (o.secret) return false;

                        // If the object is not a secret, check each sub objective.
                        if (o.subs) o.subs = filterObjectives(o.subs);
                        return true;
                    });
                }
                filterObjectives(objs);

                // If the view mode is next only, strip extra objectives
                if (q.viewStyle === "next") {
                    for (let i = 0; i < objs.length; i++) {
                        // Find the first objective that is incomplete.
                        if (objs[i].state === objectiveState.INCOMPLETE) {
                            objs = objs.slice(0, i + 1);
                            break;
                        }
                    }
                } else if (q.viewStyle === "complete") {
                    for (let i = 0; i < objs.length; i++) {
                        if (objs[i].state === objectiveState.INCOMPLETE) {
                            if (i === 0) {
                                objs = [];
                            } else {
                                objs = objs.slice(0, i);
                            }
                        }
                    }
                }
            }

            q.canEdit =
                game.user.isGM ||
                Settings.get(Settings.NAMES.PLAYER_EDIT) ||
                !q.GMQuest;

            // Players can never delete GM quests.
            q.canDelete = game.user.isGM || !q.GMQuest;

            // Return the quest with modified data.
            return {
                ...q,
                objectives: objs,
            };
        });

        // Only show quests that are visible unless the user is
        // a GM.
        return q.filter((q) => q.visible || game.user.isGM);
    }

    static getIndex(id) {
        // Get the index of the quest
        for (let i = 0; i < this.quests.length; i++) {
            if (this.quests[i].id === id) {
                return i;
            }
        }
        return -1;
    }

    static questExists(id) {
        // Get the index of the quest
        for (let i = 0; i < this.#quests.length; i++) {
            if (this.#quests[i].id === id) {
                return true;
            }
        }
        return false;
    }

    static getQuest(id) {
        // Find the quest with the correct id.
        let quest = this.quests.filter((q) => {
            return q.id === id;
        });

        // If at least one quest is found, return
        // the first one.
        if (quest.length > 0) return quest[0];
        // If none were found, return null.
        else return null;
    }

    static removeQuest(id) {
        if (!gmCheck()) return false;

        // This flag will be used to state that a quest
        // has been filtered out.
        let filtered = false;

        // Filter out the removed quest.
        this.#quests = this.#quests.filter((q) => {
            filtered |= q.id === id;
            return q.id !== id;
        });
        this.save();
        return filtered;
    }

    static init() {
        //Initialize by running the refresh function.
        this.refresh();
    }

    static InsertOrUpdate(data = {}) {
        // If the data comes with an id try to update
        // an existing quest.
        if (data.id) this.update(data);
        // If there is no quest id this is probably new
        // so create a new one.
        else this.insert(data);
    }

    static insert(data = {}) {
        if (!gmCheck()) return null;
        // index will be used to check for
        // existing copies of the created ID.
        let index = -1;
        if (!data.id) {
            do {
                // Create a new id
                data.id = newId();

                // Try to find any quests with the id
                // index will be -1 if none were found.
                index = this.getIndex(data.id);
            } while (index > -1);
        } else {
            // The data id is predefined. This is usually
            // the result of someone using the API to create
            // a quest. Verify that the ID is unique.
            if (this.getIndex(data.id) > -1) {
                console.error("Quest ID already in use.");
                return null;
            }
        }

        // Create a new quest with the default data.
        let quest = new Quest(data);

        // The quest is unique. Push and save.
        this.#quests.push(quest);
        this.save();
        return quest;
    }

    static update(data = {}) {
        if (!gmCheck()) return false;
        // If there is no id, this won't work.
        if (!data.id) {
            console.error("data does not contain id");
            return false;
        }

        // Get the index. If it's invalid, abort.
        let index = this.getIndex(data.id);
        if (index < 0 || index >= this.#quests.length) {
            console.error(`quest with id "${data.id}" does not exist.`);
            return false;
        }

        // Get the quest to be updated.
        let q = this.#quests[index];

        // Update the quest list
        this.#quests[index] = { ...q, ...data };
        this.save();
        return true;
    }

    static save() {
        Settings.set(Settings.NAMES.QUEST_DB, {
            quests: this.#quests,
        });
    }

    static refresh() {
        this.#quests = Settings.get(Settings.NAMES.QUEST_DB).quests;

        // Validate all quest data.
        this.#quests.forEach((q, i) => {
            // For backwards compatability, if a quest
            // does not have the GMQuest flag, add it.
            if (!("GMQuest" in q)) {
                q.GMQuest = true;
                console.log(q);
            }

            //  Ensure that all quest objectives have an id
            if (q.objectives)
                this.#quests[i] = {
                    ...q,
                    objectives: q.objectives?.map((o) =>
                        QuestDatabase.nestedObjectives(o, 0)
                    ),
                };
        });
    }

    static nestedObjectives(objective) {
        return {
            ...objective,
            id: objective.id || newId(),
            subs: objective.subs
                ? objective.subs.map((o) => QuestDatabase.nestedObjectives(o))
                : null,
        };
    }
}
