// elevateElement/features/eventHandling.js

export function addEventHandling(BaseElement) {
  return class extends BaseElement {
    #listeners = {};
    __boundHandlers = new Map();

    constructor() {
      super();
      this.__setupEventListeners();
    }

    /**
     * Setup all declarative event listeners based on events() mapping.
     */
    __setupEventListeners() {
      const handlers = this.events && this.events();

      if (handlers) {
        for (const eventType in handlers) {
          if (!this.__boundHandlers.has(eventType)) {
            const boundHandler = this.__handleEvent.bind(this, eventType);

            const eventOptions = (handlers[eventType]._options)
              ? handlers[eventType]._options
              : { passive: true };

            // ATTACH LISTENERS TO SHADOW ROOT if available, otherwise to this
            const root = this.shadowRoot || this;
            root.addEventListener(eventType, boundHandler, eventOptions);

            this.__boundHandlers.set(eventType, { handler: boundHandler, options: eventOptions });
          }
        }
      }
    }

    /**
     * Dynamically handle delegated events every time they fire.
     * Supports Shadow DOM and Light DOM automatically.
     * @param {string} eventType
     * @param {Event} event
     */
    __handleEvent(eventType, event) {
      const target = event.target;
      const matchRoot = this.shadowRoot || this;
      const handlers = this.events && this.events();

      if (handlers && handlers[eventType]) {
        for (const selector in handlers[eventType]) {
          if (selector === '_options') continue; // Skip options key

          const possibleTarget = matchRoot.querySelector(selector);

          if (possibleTarget && (target.closest(selector) === possibleTarget)) {
            handlers[eventType][selector](event);
          }
        }
      }
    }

    /**
     * Subscribe to a custom internal event.
     * @param {string} eventName
     * @param {function} handler
     */
    on(eventName, handler) {
      if (!this.#listeners[eventName]) {
        this.#listeners[eventName] = [];
      }
      this.#listeners[eventName].push(handler);
    }

    /**
     * Unsubscribe a handler from a custom internal event.
     * @param {string} eventName
     * @param {function} handler
     */
    off(eventName, handler) {
      if (!this.#listeners[eventName]) return;

      this.#listeners[eventName] = this.#listeners[eventName]
        .filter(fn => fn !== handler);
    }

    /**
     * Emit an internal event (if listeners exist) and dispatch a browser CustomEvent.
     * @param {string} eventName
     * @param {any} detail
     * @param {object} [options={}] - Options for bubbling, composed, cancelable
     */
    emit(eventName, detail = {}, options = {}) {
      const hasInternalListeners = !!this.#listeners[eventName]?.length;

      if (hasInternalListeners) {
        this.#listeners[eventName].forEach(fn => fn(detail));
      }

      const event = this.createEvent(eventName, detail, options);
      this.dispatchEvent(event);
    }

    /**
     * Create a CustomEvent manually with full control.
     * @param {string} eventName
     * @param {any} detail
     * @param {object} options - bubbles, composed, cancelable
     * @returns {CustomEvent}
     */
    createEvent(eventName, detail = {}, options = {}) {
      const {
        bubbles = true,
        composed = true,
        cancelable = true
      } = options;

      return new CustomEvent(eventName, {
        detail,
        bubbles,
        composed,
        cancelable
      });
    }
  };
}