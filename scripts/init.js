import { QuestDatabase } from "./data/database.js";
import { UIManager } from "./ui/ui-manager.js";
import { Settings } from "./helpers/settings.js";
import { HandlebarHelper } from "./helpers/handlebars.js";
import { SimplerQuestsAPI } from "./api.js";
import { setSocket } from "./helpers/global.js";
import { SocketHandler } from "./helpers/SocketHandler.js";
import { QuestTracker } from "./ui/questtracker.js";
import { QuestTrackerSidebar } from "./ui/questtrackersidebar.js";

// CONFIG.ui.MythicsSimplerQuests = QuestTrackerSidebar;
// CONFIG.ui.sidebar.TABS.MythicsSimplerQuests = {
//     //QuestTrackerSidebar
//     documentName: "MythicsSimplerQuests",
//     tooltip: "Mythic Quest",
//     icon: "fas-solid fas-scroll",
// };
// CONFIG.ui.sidebar.PARTS.MythicsSimplerQuests = QuestTrackerSidebar;

Hooks.once("init", (opts) => {
    // Register the Handlebar extensions.
    HandlebarHelper.init();
    // Start by registering the module settings.
    Settings.registerSettings();

    // Load the quest database.
    QuestDatabase.init();

    setSocket(new SocketHandler());
});

Hooks.on("ready", async () => {
    // Prepare the quest tracker.
    UIManager.init();

    // Check if the quest tracker is hidden from
    // the current user. If it is, stop initializing.
    if (Settings.get(Settings.NAMES.TRACKER_HIDE) && !game.user.isGM) return;

    const displayStyle = Settings.get(Settings.NAMES.TRACKER_DISPLAY_STYLE);

    if (displayStyle === "sidebar")
        CONFIG.ui.MythicsSimplerQuests.render({ force: true });
    else if (
        displayStyle !== "floating" ||
        Settings.get(Settings.NAMES.TRACKER_OPEN)
    )
        UIManager.tracker.render(true);

    //UIManager.buildTab();
    // Register the API
    window.simplerQuests = new SimplerQuestsAPI();
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
Hooks.on("getSceneControlButtons", UIManager.getSceneControlButtons);
