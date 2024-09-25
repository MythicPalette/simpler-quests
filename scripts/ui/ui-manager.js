import { QuestTracker } from "./questtracker.js";
import { QuestEditor } from "./questeditor.js";
import { constants } from "../helpers/constants.js";

export class UIManager {
    // This will hold the QuestTracker object.
    static #tracker;
    static get tracker() {
        return this.#tracker;
    }

    static init() {
        // Create a spot for the quest tracker to render
        const top = document.querySelector("#ui-top");
        if (top) {
            const template = document.createElement("template");
            template.setAttribute("id", constants.trackerName);
            top?.insertAdjacentElement("afterend", template);
        }

        // Create the QuestTracker.
        this.#tracker = new QuestTracker();
    }
}
