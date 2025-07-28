import { QuestTracker } from "./questtracker.js";
import { QuestEditor } from "./questeditor.js";
import { constants } from "../helpers/global.js";
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
                title: "MythicsSimplerQuests.Controls.Tracker",
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

    static init() {
        // Create a spot for the quest tracker to render
        if (Settings.get(Settings.NAMES.TRACKER_DISPLAY_STYLE) === "sidebar") {
            // Create the sidebar button
            // const sidebarTabs = document.querySelector("#sidebar-tabs");
            // if (sidebarTabs) {
            //     const menu = sidebarTabs.getElementsByTagName("menu")[0];
            //     if (menu) {
            //         renderTemplate(
            //             "modules/simpler-quests/templates/tracker-sidebar-button.hbs",
            //             {}
            //         ).then((html) => {
            //             menu.lastElementChild.insertAdjacentHTML(
            //                 "beforeBegin",
            //                 html
            //             );
            //         });
            //     }
            // }
            // // Create the sidebar content placeholder.
            // const sidebarContent = document.querySelector("#sidebar-content");
            // if (sidebarContent) {
            //     const content = document.createElement("section");
            //     const template = document.createElement("template");
            //     template.setAttribute("id", constants.trackerName);
            //     content.appendChild(template);
            //     content.dataset.tab = "mythics-simpler-quests";
            //     content.dataset.group = "primary";
            //     content.classList.add(
            //         "tab",
            //         "sidebar-tab",
            //         "flexcol",
            //         "mythic-simpler-quests-sidebar"
            //     );
            //     sidebarContent?.insertAdjacentElement("beforeend", content);
            //}
            return;
        } else if (
            Settings.get(Settings.NAMES.TRACKER_DISPLAY_STYLE) === "docked"
        ) {
            const sidebar = document.querySelector("#sidebar");
            if (sidebar) {
                const template = document.createElement("template");
                template.setAttribute("id", constants.trackerName);
                sidebar.insertAdjacentElement("afterbegin", template);
            }
        }

        // Create the QuestTracker.
        this.#tracker = new QuestTracker();
    }

    // static buildSidebar() {
    //     // Create the sidebar button
    //     const sidebarTabs = document.querySelector("#sidebar-tabs");
    //     if (sidebarTabs) {
    //         const menu = sidebarTabs.getElementsByTagName("menu")[0];
    //         if (menu) {
    //             renderTemplate(
    //                 "modules/simpler-quests/templates/tracker-sidebar-button.hbs",
    //                 {}
    //             ).then((html) => {
    //                 menu.lastElementChild.insertAdjacentHTML(
    //                     "beforeBegin",
    //                     html
    //                 );
    //             });
    //         }
    //     }

    //     // Create the sidebar content.
    //     const templateFile =
    //         "modules/simpler-quests/templates/tracker-sidebar.hbs";
    //     renderTemplate(templateFile, { canCreate: game.user.isGM }).then(
    //         (html) => {
    //             const sidebarContent =
    //                 document.querySelector("#sidebar-content");
    //             if (sidebarContent) {
    //                 var div = document.createElement("div");
    //                 div.innerHTML = html;

    //                 const el = div.firstElementChild;
    //                 el.querySelector(
    //                     "#mythic-simpler-quests-new"
    //                 )?.addEventListener("click", (ev) => {
    //                     console.log("New Quest clicked", ev);
    //                 });

    //                 sidebarContent.append(el);
    //                 this.#tracker.activateListeners($(el));
    //             }
    //         }
    //     );
    // }

    // static getSceneControlButtons(controls) {
    //     const notes = controls.find((c) => c.name === "notes");
    //     if (notes) notes.tools.push(...UIManager.controls);
    // }

    // static getApplicationHeaderButtons(application, buttons) {
    //     if (application === UIManager.tracker) {
    //         console.log(buttons);

    //         // Move "Close" to a tooltip.
    //         buttons[0].tooltip = buttons[0].label;
    //         buttons[0].label = null;

    //         if (game.user.isGM || Settings.get(Settings.NAMES.PLAYER_CREATE))
    //             buttons.unshift(...UIManager.headerButtons);
    //     }
    // }

    static getSceneControlButtons(controls) {
        if (Settings.get(Settings.NAMES.TRACKER_DISPLAY_STYLE) !== "floating")
            return;

        const noteControls = controls["notes"];
        if (!noteControls) return;

        if (noteControls.tools["mythics-simpler-quests-control"]) return;

        noteControls.tools["mythics-simpler-quests-control"] = {
            icon: "fas fa-scroll",
            name: "mythics-simpler-quests-control",
            title: game.i18n.localize("MythicsSimplerQuests.Tracker.Title"),
            button: true,
            onChange: () =>
                UIManager.tracker.render(true, {
                    focus: true,
                }),
            visible: true,
        };
    }
}
