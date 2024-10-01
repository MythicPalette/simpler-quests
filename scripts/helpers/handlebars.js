import { objectiveState } from "./global.js";

export class HandlebarHelper {
    static async init() {
        Handlebars.registerHelper(
            "simplerQuestIsActiveQuest",
            (list, value) => {
                return list.includes(value);
            }
        );
        Handlebars.registerHelper("simplerQuestsEquals", (o1, o2) => {
            return o1 === o2;
        });

        Handlebars.registerHelper("simplerQuestsLastObjective", (list, id) => {
            return list[list.length - 1].id === id;
        });

        await loadTemplates({
            trackerBody: "modules/simpler-quests/templates/tracker-body.hbs",
            trackerObjective:
                "modules/simpler-quests/templates/tracker-objective.hbs",
        });
    }
}
