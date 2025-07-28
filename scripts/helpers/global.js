export const constants = {
    moduleName: "simpler-quests",

    moduleClassName: "mythics-simpler-quests",
    editorName: "simpler-quest-editor",

    trackerButtonTitle: "Quest Tracker",
    trackerName: "simpler-quest-tracker",
    trackerTabName: "simpler-quest-tracker-tab",
};

export const objectiveState = Object.freeze({
    INCOMPLETE: 0,
    COMPLETE: 1,
    FAILED: -1,
});

export const questViewStyle = Object.freeze({
    VIEW_ALL: 0,
    VIEW_NEXT: 1,
    VIEW_COMPLETE: 2,
});

export function newId() {
    return "id" + Math.random().toString(16).slice(2);
}

export function gmCheck() {
    if (!game.user.isGM) {
        console.error("User is not GM");
        return false;
    }
    return true;
}

var _sock;
export function getSocket() {
    return _sock;
}
export function setSocket(socket) {
    _sock = socket;
}
