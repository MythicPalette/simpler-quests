import { Settings } from "./helpers/settings.js";
import { UIManager } from "./ui/ui-manager.js";

export class SimplerQuestsAPI {
    open() {
        if (Settings.get(Settings.NAMES.TRACKER_DOCKED)) {
            // If the tracker is docked, uncollapse it.
            UIManager.tracker.collapse(false);
        } else {
            UIManager.tracker.render(true, {
                focus: true,
            });
        }
    }
    close() {
        if (Settings.get(Settings.NAMES.TRACKER_DOCKED)) {
            // If the tracker is docked, uncollapse it.
            UIManager.tracker.collapse(true);
        } else {
            UIManager.tracker.close();
        }
    }
}
