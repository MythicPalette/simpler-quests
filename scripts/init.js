import { QuestDatabase } from "./data/database.js";
import { UIManager } from "./ui/ui-manager.js";
import { Settings } from "./helpers/settings.js";
import { HandlebarHelper } from "./helpers/handlebars.js";
import { SimplerQuestsAPI } from "./api.js";

Hooks.once("init", (opts) => {
    // Start by registering the module settings.
    Settings.registerSettings();

    // Load the quest database.
    QuestDatabase.init();

    // Prepare the quest tracker.
    UIManager.init();

    // Register the API
    window.simplerQuests = new SimplerQuestsAPI();
});

Hooks.on("ready", async () => {
    // Register the Handlebar extensions.
    await HandlebarHelper.init();

    const docked = Settings.get(Settings.NAMES.TRACKER_DOCKED);
    if (!docked) {
        Hooks.on("getSceneControlButtons", UIManager.getSceneControlButtons);
        Hooks.on(
            "getApplicationHeaderButtons",
            UIManager.getApplicationHeaderButtons
        );
    }
    // Once the game is ready, add the tracker
    // to the screen.
    else UIManager.tracker.render(true);

    if (!docked && Settings.get(Settings.NAMES.TRACKER_OPEN))
        UIManager.tracker.render(true);
});

Hooks.on("updateSetting", (setting) => {
    // On setting updates, refresh the quest database.
    // This is important to do first so players
    // refresh their tracker with the latest quest data.
    QuestDatabase.refresh();

    // Redraw the tracker to ensure that it displays the
    // latest data to the users.
    UIManager.tracker.refresh();
});
