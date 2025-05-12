// features/eventHandling.js

export function addEventHandling(BaseElement) {
  return class extends BaseElement {
    #listeners = {};

    constructor() {
      super();
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

      // Always dispatch external CustomEvent for outside listeners
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