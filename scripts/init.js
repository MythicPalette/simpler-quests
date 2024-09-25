import { QuestDatabase } from "./data/database.js";
import { UIManager } from "./ui/ui-manager.js";
import { Settings } from "./helpers/settings.js";
import { HandlebarHelper } from "./helpers/handlebars.js";

Hooks.once("init", (opts) => {
    // Start by registering the module settings.
    Settings.registerSettings();

    // Load the quest database.
    QuestDatabase.init();

    // Prepare the quest tracker.
    UIManager.init();

    // Register the Handlebar extensions.
    HandlebarHelper.init();
});

Hooks.on("ready", () => {
    // Once the game is ready, add the tracker
    // to the screen.
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
