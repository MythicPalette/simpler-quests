import { QuestTracker } from "./questtracker.js";
import { QuestEditor } from "./questeditor.js";
import { constants } from "../helpers/constants.js";
import { Settings } from "../helpers/settings.js";

export class UIManager {
    // This will hold the QuestTracker object.
    static #tracker;
    static get tracker() {
        return this.#tracker;
    }

    static get controls() {
        return [
            {
                name: constants.moduleName,
                title: "SimplerQuests.Controls.Tracker",
                icon: "fas fa-scroll",
                visible: true,
                onClick: () =>
                    UIManager.tracker.render(true, {
                        focus: true,
                    }),
                button: true,
            },
        ];
    }

    static get headerButtons() {
        return [
            {
                class: "add-quest",
                icon: "fa-solid fa-plus",
                tooltip: game.i18n.localize("SimplerQuests.Tracker.AddQuest"),
                onclick: () => {
                    // Load a blank QuestEditor and render.
                    let qe = new QuestEditor();
                    qe.render(true, { focus: true });
                },
            },
        ];
    }

    static init() {
        // Create a spot for the quest tracker to render
        if (Settings.get(Settings.NAMES.TRACKER_DOCKED)) {
            const top = document.querySelector("#ui-top");
            if (top) {
                const template = document.createElement("template");
                template.setAttribute("id", constants.trackerName);
                top?.insertAdjacentElement("afterend", template);
            }
        }

        // Create the QuestTracker.
        this.#tracker = new QuestTracker();
    }

    static getSceneControlButtons(controls) {
        const notes = controls.find((c) => c.name === "notes");
        if (notes) notes.tools.push(...UIManager.controls);
    }

    static getApplicationHeaderButtons(application, buttons) {
        if (application === UIManager.tracker) {
            console.log(buttons);

            // Move "Close" to a tooltip.
            buttons[0].tooltip = buttons[0].label;
            buttons[0].label = null;

            if (game.user.isGM) buttons.unshift(...UIManager.headerButtons);
        }
    }
}
