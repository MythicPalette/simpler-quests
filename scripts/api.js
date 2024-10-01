import { Settings } from "./helpers/settings.js";
import { UIManager } from "./ui/ui-manager.js";

export class SimplerQuestsAPI {
    // Expands the tracker dock or opens the tracker window.
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

    // Minimizes the tracker dock or closes the tracker window.
    close() {
        if (Settings.get(Settings.NAMES.TRACKER_DOCKED)) {
            // If the tracker is docked, uncollapse it.
            UIManager.tracker.collapse(true);
        } else {
            UIManager.tracker.close();
        }
    }

    // Toggles the state of the tracker dock or window.
    toggle() {
        if (Settings.get(Settings.NAMES.TRACKER_DOCKED)) {
            UIManager.tracker.collapse();
            return UIManager.tracker.collapsed;
        } else {
            // If the state is greater than zero the window is
            // rendering or rendered.
            if (UIManager.tracker.rendered) UIManager.tracker.close();
            else UIManager.tracker.render(true, { focus: true });
        }
    }
}
