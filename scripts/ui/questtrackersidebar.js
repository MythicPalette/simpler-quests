import { QuestTracker } from "./questtracker.js";

export class QuestTrackerSidebar extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.sidebar.AbstractSidebarTab
) {
    static metadata = Object.freeze(
        {
            name: "Mythic's Simpler Quests",
            collection: "mythicsSimplerQuests",
            label: "DOCUMENT.MythicsSimplerQuest",
            labelPlural: "DOCUMENT.MythicsSimplerQuests",
            permissions: {},
            schemaVersion: "13.341",
            sidebarIcon: "fas-solid fas-scroll",
        },
        { inplace: false }
    );

    /** @inheritDoc */
    static DEFAULT_OPTIONS = {
        classes: ["flexcol"],
        window: {
            title: "MythicsSimplerQuests.Title",
        },
        actions: {
            //   deleteMessage: this.#onDeleteMessage,
            //   dismissMessage: this.#onDismissNotification,
            //   expandRoll: this.#onExpandRoll,
            //   export: this.#onExportLog,
            //   flush: this.#onFlushLog,
            //   jumpToBottom: this.#onJumpToBottom,
            //   rollMode: this.#onChangeRollMode
        },
    };

    /** @override */
    static tabName = "Mythics Simpler Quests";

    /** @override */
    static PARTS = {
        tracker: {
            template: "modules/simpler-quests/templates/tracker-sidebar.hbs",
        },
    };

    /**
     * A reference to the Messages collection that the chat log displays.
     * @type {Messages}
     */
    get collection() {
        return game.messages;
    }

    /* -------------------------------------------- */
    /*  Rendering                                   */
    /* -------------------------------------------- */

    /** @inheritDoc */
    _configureRenderOptions(options) {
        super._configureRenderOptions(options);
        // If the log has already been rendered once, prevent it from being re-rendered.
        if (this.rendered)
            options.parts = options.parts.filter(
                (p) => p !== "log" && p !== "input"
            );
    }

    async render(force = false, options = {}) {
        await super.render(force, options);

        // Check if the tracker is docked.
        const displayStyle = Settings.get(Settings.NAMES.TRACKER_DISPLAY_STYLE);
        if (displayStyle === "floating") {
            // The tracker is rendered and not docked.
            // Save the open state and the position.
            Settings.set(Settings.NAMES.TRACKER_OPEN, true);
        }
    }

    /* -------------------------------------------- */

    /* -------------------------------------------- */

    /**
     * Get context menu entries for chat messages in the log.
     * @returns {ContextMenuEntry[]}
     * @protected
     */
    _getEntryContextOptions() {
        return [
            {
                name: "CHAT.PopoutMessage",
                icon: '<i class="fa-solid fa-up-right-from-square fa-rotate-180"></i>',
                condition: (li) => {
                    const message = game.messages.get(li.dataset.messageId);
                    return message.getFlag("core", "canPopout") === true;
                },
                callback: (li) => {
                    const message = game.messages.get(li.dataset.messageId);
                    new CONFIG.ChatMessage.popoutClass({ message }).render({
                        force: true,
                    });
                },
            },
            {
                name: "CHAT.RevealMessage",
                icon: '<i class="fa-solid fa-eye"></i>',
                condition: (li) => {
                    const message = game.messages.get(li.dataset.messageId);
                    const isLimited = message.whisper.length || message.blind;
                    return (
                        isLimited &&
                        (game.user.isGM || message.isAuthor) &&
                        message.isContentVisible
                    );
                },
                callback: (li) => {
                    const message = game.messages.get(li.dataset.messageId);
                    return message.update({ whisper: [], blind: false });
                },
            },
            {
                name: "CHAT.ConcealMessage",
                icon: '<i class="fa-solid fa-eye-slash"></i>',
                condition: (li) => {
                    const message = game.messages.get(li.dataset.messageId);
                    const isLimited = message.whisper.length || message.blind;
                    return (
                        !isLimited &&
                        (game.user.isGM || message.isAuthor) &&
                        message.isContentVisible
                    );
                },
                callback: (li) => {
                    const message = game.messages.get(li.dataset.messageId);
                    return message.update({
                        whisper: ChatMessage$1.getWhisperRecipients("gm").map(
                            (u) => u.id
                        ),
                        blind: false,
                    });
                },
            },
            {
                name: "SIDEBAR.Delete",
                icon: '<i class="fa-solid fa-trash"></i>',
                condition: (li) => {
                    const message = game.messages.get(li.dataset.messageId);
                    return message.canUserModify(game.user, "delete");
                },
                callback: (li) => {
                    const message = game.messages.get(li.dataset.messageId);
                    return message
                        ? message.delete()
                        : this.deleteMessage(li.dataset.messageId);
                },
            },
        ];
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    async _onFirstRender(context, options) {
        await super._onFirstRender(context, options);
        /** @fires {hookEvents:getChatMessageContextOptions} */
        this._createContextMenu(
            this._getEntryContextOptions,
            ".message[data-message-id]",
            {
                hookName: "getChatMessageContextOptions",
                parentClassHooks: false,
            }
        );
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    async _onRender(context, options) {
        await super._onRender(context, options);
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    async _preparePartContext(partId, context, options) {
        context = await super._preparePartContext(partId, context, options);
        switch (partId) {
            case "tracker":
                await this._prepareTrackerContext(context, options);
                break;
        }
        return context;
    }

    /* -------------------------------------------- */

    /**
     * Prepare rendering context for the chat panel's message input component.
     * @param {ApplicationRenderContext} context
     * @param {ApplicationRenderOptions} options
     * @protected
     */
    async _prepareInputContext(context, options) {
        context.isAtBottom = this.isAtBottom;
    }

    async _prepareTrackerContext(context, options) {
        context.isGM = true;
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    async _renderHTML(context, options) {
        const parts = await super._renderHTML(context, options);
        return parts;
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    _preSyncPartState(partId, newElement, priorElement, state) {
        super._preSyncPartState(partId, newElement, priorElement, state);
        switch (partId) {
            case "input":
                this._preSyncInputState(newElement, priorElement, state);
                break;
        }
    }

    /* -------------------------------------------- */

    /**
     * Prepare data used to synchronize the state of the chat input.
     * @param {HTMLElement} newElement    The newly-rendered element.
     * @param {HTMLElement} priorElement  The existing element.
     * @param {object} state              A state object which is used to synchronize after replacement.
     * @protected
     */
    _preSyncInputState(newElement, priorElement, state) {
        const textarea = priorElement.querySelector(".chat-input");
        state.message = textarea?.value;
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    _syncPartState(partId, newElement, priorElement, state) {
        super._syncPartState(partId, newElement, priorElement, state);
        switch (partId) {
            case "input":
                this._syncInputState(newElement, priorElement, state);
                break;
        }
    }

    /* -------------------------------------------- */

    /**
     * Synchronize the state of the chat input.
     * @param {HTMLElement} newElement    The newly-rendered element.
     * @param {HTMLElement} priorElement  The element being replaced.
     * @param {object} state              The state object used to synchronize the pre- and post-render states.
     * @protected
     */
    _syncInputState(newElement, priorElement, state) {
        const textarea = newElement.querySelector(".chat-input");
        if (textarea) textarea.value = state.message;
    }

    /* -------------------------------------------- */
    /*  Event Listeners & Handlers                  */
    /* -------------------------------------------- */

    /** @inheritDoc */
    _attachPartListeners(partId, element, options) {
        super._attachPartListeners(partId, element, options);
        switch (partId) {
            case "log":
                this._attachLogListeners(element, options);
                break;
        }
    }

    /* -------------------------------------------- */

    /**
     * Attach listeners to the chat log.
     * @param {HTMLElement} element  The log element.
     * @param {ApplicationRenderOptions} options
     * @protected
     */
    _attachLogListeners(element, options) {
        //element.addEventListener("scroll", this.#onScrollLog.bind(this), { passive: true });
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    _onActivate() {
        super._onActivate();
    }

    /* -------------------------------------------- */

    /**
     * Handle clicking a chat card notification.
     * Treat action button clicks within the Notifications UI as action clicks on the ChatLog instance itself.
     * @param {PointerEvent} event  The triggering event.
     * @protected
     */
    _onClickNotification(event) {
        const target = event.target.closest("[data-action]");
        if (!target) return;
        const { action } = target.dataset;
        let handler = this.options.actions[action];
        let buttons = [0];
        if (typeof handler === "object") {
            buttons = handler.buttons;
            handler = handler.handler;
        }
        if (buttons.includes(event.button)) handler?.call(this, event, target);
        else this._onClickAction(event, target);
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    _onClose(options) {
        super._onClose(options);
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    _onDeactivate() {
        super._onDeactivate();
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    async _preClose(options) {}

    /* -------------------------------------------- */
}
