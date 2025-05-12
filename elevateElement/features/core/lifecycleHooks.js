// features/lifecycleHooks.js

export function addLifecycleHooks(BaseElement) {
  return class extends BaseElement {
    #beforeHooks = {};
    #afterHooks = {};

    constructor() {
      super();
    }

    /**
     * Register a before hook for a lifecycle event.
     * @param {string} lifecycle - The lifecycle event name (e.g., 'connected', 'disconnected')
     * @param {function} fn - The function to run before the event
     * @param {object} [options] - { priority: number }
     */
    addBeforeHook(lifecycle, fn, options = {}) {
      this.#addHook(this.#beforeHooks, lifecycle, fn, options.priority);
    }

    /**
     * Register an after hook for a lifecycle event.
     * @param {string} lifecycle - The lifecycle event name (e.g., 'connected', 'disconnected')
     * @param {function} fn - The function to run after the event
     * @param {object} [options] - { priority: number }
     */
    addAfterHook(lifecycle, fn, options = {}) {
      this.#addHook(this.#afterHooks, lifecycle, fn, options.priority);
    }

    /**
     * connectedCallback - Fires when element is inserted into the DOM.
     */
    connectedCallback() {
      try {
        this.#runLifecycleHooks('beforeConnected');

        if (super.connectedCallback) super.connectedCallback();

        if (typeof this.render === 'function') {
          this.render(); // Auto-render if render method exists
        }

        this.#runLifecycleHooks('afterConnected');
      } catch (error) {
        console.error('Error in connectedCallback:', error);
      }
    }

    /**
     * disconnectedCallback - Fires when element is removed from the DOM.
     */
    disconnectedCallback() {
      try {
        this.#runLifecycleHooks('beforeDisconnected');

        if (super.disconnectedCallback) super.disconnectedCallback();

        this.#runLifecycleHooks('afterDisconnected');
      } catch (error) {
        console.error('Error in disconnectedCallback:', error);
      }
    }

    /**
     * adoptedCallback - Fires when element is moved to a new document.
     */
    adoptedCallback() {
      try {
        this.#runLifecycleHooks('beforeAdopted');

        if (super.adoptedCallback) super.adoptedCallback();

        this.#runLifecycleHooks('afterAdopted');
      } catch (error) {
        console.error('Error in adoptedCallback:', error);
      }
    }

    /**
     * attributeChangedCallback - Fires when observed attributes change.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      try {
        this.#runLifecycleHooks('beforeAttributeChanged', { name, oldValue, newValue });

        if (super.attributeChangedCallback) {
          super.attributeChangedCallback(name, oldValue, newValue);
        }

        this.#runLifecycleHooks('afterAttributeChanged', { name, oldValue, newValue });
      } catch (error) {
        console.error('Error in attributeChangedCallback:', error);
      }
    }

    /**
     * PRIVATE: Add a hook into the internal registry.
     */
    #addHook(hooksCollection, lifecycle, fn, priority = 10) {
      const lc = lifecycle.toLowerCase();
      if (!hooksCollection[lc]) hooksCollection[lc] = [];
      hooksCollection[lc].push({ fn, priority });

      // Sort hooks by ascending priority
      hooksCollection[lc].sort((a, b) => a.priority - b.priority);
    }

    /**
     * PRIVATE: Run all registered lifecycle hooks for a given type.
     */
    #runLifecycleHooks(type, args) {
      const hooks = type.startsWith('before') ? this.#beforeHooks : this.#afterHooks;
      const shortType = type.replace(/^before|^after/, '').toLowerCase();

      const registeredHooks = hooks[shortType];
      if (Array.isArray(registeredHooks)) {
        for (const { fn } of registeredHooks) {
          if (typeof fn === 'function') {
            fn.call(this, args);
          }
        }
      }

      // Also allow simple `__beforeConnected()` / `__afterConnected()` fallback methods
      const methodName = `__${type.charAt(0).toLowerCase()}${type.slice(1)}`;
      if (typeof this[methodName] === 'function') {
        this[methodName](args);
      }
    }
  };
}