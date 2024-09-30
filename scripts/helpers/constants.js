export const constants = {
    moduleName: "simpler-quests",

    editorName: "simpler-quest-editor",

    trackerButtonTitle: "Quest Tracker",
    trackerName: "simpler-quest-tracker",
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
