import { QuestDatabase } from "./data/database.js";
import { Settings } from "./helpers/settings.js";
import { UIManager } from "./ui/ui-manager.js";

export class SimplerQuestsAPI {
    /*
        The API functions are created in the constructor
        rather than as built-in functions. This is to ensure
        that GM-only functions are not exposed to players.
    */
    constructor() {
        // Expands the tracker dock or opens the tracker window.
        this.open = () => {
            if (Settings.get(Settings.NAMES.TRACKER_DOCKED)) {
                // If the tracker is docked, uncollapse it.
                UIManager.tracker.collapse(false);
            } else {
                UIManager.tracker.render(true, {
                    focus: true,
                });
            }
        };
        // Minimizes the tracker dock or closes the tracker window.
        this.close = () => {
            if (Settings.get(Settings.NAMES.TRACKER_DOCKED)) {
                // If the tracker is docked, uncollapse it.
                UIManager.tracker.collapse(true);
            } else {
                UIManager.tracker.close();
            }
        };

        // Toggles the state of the tracker dock or window.
        this.toggle = () => {
            if (Settings.get(Settings.NAMES.TRACKER_DOCKED)) {
                UIManager.tracker.collapse();
                return UIManager.tracker.collapsed;
            } else {
                // If the state is greater than zero the window is
                // rendering or rendered.
                if (UIManager.tracker.rendered) UIManager.tracker.close();
                else UIManager.tracker.render(true, { focus: true });
            }
        };

        if (!game.user.isGM) return;
        // Everything from this point forward is meant for the GM only

        this.createQuest = (data = {}) => {
            QuestDatabase.insert(data);
        };

        this.removeQuest = (id) => {
            if (!id) return false;
            QuestDatabase.removeQuest(id);
        };
    }
}
