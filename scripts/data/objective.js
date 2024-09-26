import { objectiveState } from "../helpers/constants.js";

export class Objective {
    constructor(data = {}) {
        this.loadData(data);
    }

    static parse(str = "") {
        // Trim the whitespace.
        str = str.trim();

        // Ensure the line isn't empty.
        if (str.length <= 0) return null;

        // Prepare the basic data.
        let data = {
            text: "",
            secret: false,
            state: objectiveState.INCOMPLETE,
        };

        // Check for headers.
        while (
            str.startsWith("-") ||
            str.startsWith("+") ||
            str.startsWith("/")
        ) {
            // Check for State flag
            if (str.startsWith("-")) {
                data.state = objectiveState.FAILED;
                str = str.substring(1);
            } else if (str.startsWith("+")) {
                data.state = objectiveState.COMPLETE;
                str = str.substring(1);
            } else if (str.startsWith("/")) {
                // Mark as secret
                data.secret = true;
                str = str.substring(1);
            }

            // Trim any whitespace that may be created.
            // This is to fix lines like "+ Objective"
            str = str.trim();
        }

        // Check once again for string length. This is
        // to prevent lines with just flags from being
        // parsed as valid.
        if (str.length <= 0) return null;

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

            // Skip any lines that failed to parse.
            if (o) result.push(o);
        });

        // Return the list of objectives.
        return result;
    }

    loadData(data = {}) {
        this.text = data.text || "";
        this.secret = data.secret || false;
        this.state = data.state || objectiveState.INCOMPLETE;
    }
}
