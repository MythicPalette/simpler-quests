import { objectiveState } from "./constants.js";

export class HandlebarHelper {
    static init() {
        Handlebars.registerHelper(
            "simplerQuestIsActiveQuest",
            (list, value) => {
                return list.includes(value);
            }
        );
        Handlebars.registerHelper("simplerQuestsEquals", (o1, o2) => {
            return o1 === o2;
        });
    }
}
