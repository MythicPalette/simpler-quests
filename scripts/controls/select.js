export class Select {
    // Creates a custom Select control.
    static setup($html) {
        // Find the select in the page and create the focus event handler
        $html.find("div.select").on("focus", (e) => {
            // When focus is gained, unhide the options.
            $(e.target).find(".options").removeClass("hidden");

            // Bind the click on all of the options.
            $(e.target)
                .find(".option")
                .on("click", (evt) => {
                    // Remove select and the click event handler from siblings.
                    $(evt.target).siblings().removeClass("selected");
                    $(evt.target).siblings().unbind("click");

                    // Hide the options again
                    $(evt.target).parent().addClass("hidden");

                    // Unbind click and add the selected class to the
                    // selected option.
                    $(evt.target).unbind("click");
                    $(evt.target).addClass("selected");

                    // Copy the text and value to the selection bar.
                    $(e.target)
                        .find(".selection-bar > .body")
                        .text($(evt.target).text());
                    $(e.target)
                        .find(".selection-bar > .body")
                        .data("value", $(evt.target).data("value"));

                    $html.find("*[tabindex != '-1']:visible").focus();
                });

            // Create the "blur" callback.
            $(e.target).on("blur", (evt) => {
                // Hide the options and remove the blur callback.
                $(evt.target).find(".options").addClass("hidden");
                $(evt.target).unbind("blur");
            });
        });
    }
}
