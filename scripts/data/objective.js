import { newId, objectiveState } from "../helpers/global.js";

export class Objective {
    constructor(data = {}) {
        this.loadData(data);
    }

    static parse(str = "") {
        // Trim the whitespace.
        str = str.trim();

        // Check string length. This is to prevent empty lines
        // and lines with just flags from being parsed as valid.
        if (str.length <= 0) {
            console.log(
                `Failed to parse string. Length must be greater than zero.`
            );
            return null;
        }

        // Prepare the basic data.
        let data = {
            id: newId(),
            text: "",
            secret: false,
            state: objectiveState.INCOMPLETE,
            sublevel: 0,
            subs: [],
        };

        // Check for headers.
        while (
            str.startsWith("-") ||
            str.startsWith("+") ||
            str.startsWith("/") ||
            str.startsWith("*")
        ) {
            // Check for State flag
            if (str.startsWith("-")) {
                data.state = objectiveState.FAILED;
            } else if (str.startsWith("+")) {
                data.state = objectiveState.COMPLETE;
            } else if (str.startsWith("/")) {
                // Mark as secret
                data.secret = true;
            } else if (str.startsWith("*")) {
                data.sublevel++;
            }

            // Trim any whitespace that may be created.
            // This is to fix lines like "+ Objective"
            str = str.substring(1);
            str = str.trim();
        }

        // Check string length. This is to prevent empty lines
        // and lines with just flags from being parsed as valid.
        if (str.length <= 0) {
            console.log(
                `Failed to parse string. Objective must contain more than just flags.`
            );
            return null;
        }

        // All remaining string is the objective.
        data.text = str;

        return new Objective(data);
    }

    static parseMulti(str = "") {
        // Prepare a return result
        let result = [];

        // Get each, individual line.
        let lines = str.split("\n");

        // Parse each line individually
        lines.forEach((l) => {
            // Try to parse the line.
            let o = Objective.parse(l);

            // If the line fails to parse then skip it.
            if (!o) return;

            // If there are no sublevels, the objective is not a subobjective
            if (!o.sublevel) {
                result.push(o);
                return;
            }

            // If the sublevel is greater than zero
            // Get the last item.
            let parent = result[result.length - 1];

            // For each sub level, move a layer deeper
            for (let i = 1; i < o.sublevel; i++) {
                // While there are more sublevels, iterate through the subobjectives
                parent = parent.subs[parent.subs.length - 1];
            }

            // Parent should now be the parent of the current objective.
            parent.subs.push(o);
        });

        // Return the list of objectives.
        return result;
    }

    loadData(data = {}) {
        this.id = data.id || newId();
        this.text = data.text || "NO_TEXT";
        this.secret = data.secret || false;
        this.state = data.state || objectiveState.INCOMPLETE;
        this.sublevel = data.sublevel || 0;
        this.subs = data.subs || [];
    }

    static stringify(objective) {
        let line = "";
        // First, start by marking the quest as complete or failed if necessary.
        if (objective.state === objectiveState.COMPLETE) line += "+";
        else if (objective.state === objectiveState.FAILED) line += "-";

        // Mark the quest as a secret if needed.
        if (objective.secret) line += "/";

        // Add any subquest indentation
        line += "*".repeat(objective.sublevel);

        // Add the text.
        line += objective.text;

        // For each subobjective
        // stringify the subobjective
        // Add it to the line as a new line
        if (objective.subs)
            objective.subs.forEach((sub) => {
                line += "\n" + Objective.stringify(sub);
            });

        // Push the completed line to the stack.
        return line;
    }

    static getNextState(state) {
        if (state === objectiveState.INCOMPLETE) return objectiveState.COMPLETE;
        else if (state === objectiveState.COMPLETE)
            return objectiveState.FAILED;
        else return objectiveState.INCOMPLETE;
    }
}
