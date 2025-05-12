// features/stateManagement.js

export function addStateManagement(BaseElement) {
  return class extends BaseElement {
    constructor() {
      super();
      this.state = {}; // In-memory fast state
      this.__previousState = {};
      this.__storageKey = this.constructor.storageKey || this.tagName.toLowerCase();
      this.__useIndexedDB = false; // Will switch dynamically
    }

    /**
     * Deep merge two objects.
     * @private
     */
    #deepMerge(target, source) {
      if (typeof target !== 'object' || typeof source !== 'object' || !target || !source) {
        return source;
      }
      const output = { ...target };
      for (const key of Object.keys(source)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          output[key] = this.#deepMerge(target[key] || {}, source[key]);
        } else {
          output[key] = source[key];
        }
      }
      return output;
    }

    /**
     * Updates the component's state and triggers render + storage save if necessary.
     * @param {object} newState 
     */
    async setState(newState) {
      if (typeof newState !== 'object' || newState === null) {
        console.error('setState: newState must be a non-null object.');
        return;
      }

      const mergedState = this.#deepMerge(this.state, newState);
      const hasChanged = JSON.stringify(this.state) !== JSON.stringify(mergedState);

      if (!hasChanged) {
        return; // No change detected
      }

      if (typeof this.beforeStateChange === 'function') {
        try {
          this.beforeStateChange(this.state, newState);
        } catch (error) {
          console.error('Error in beforeStateChange:', error);
        }
      }

      this.__previousState = this.state;
      this.state = mergedState;

      if (typeof this.render === 'function') {
        this.render();
      }

      // Save updated static parts to storage
      await this.#persistState();

      if (typeof this.afterStateChange === 'function') {
        try {
          this.afterStateChange(this.__previousState, this.state);
        } catch (error) {
          console.error('Error in afterStateChange:', error);
        }
      }
    }

    /**
     * Completely replace state (wipe old state).
     * @param {object} newState 
     */
    async replaceState(newState) {
      if (typeof newState !== 'object' || newState === null) {
        console.error('replaceState: newState must be a non-null object.');
        return;
      }

      if (typeof this.beforeStateChange === 'function') {
        try {
          this.beforeStateChange(this.state, newState);
        } catch (error) {
          console.error('Error in beforeStateChange:', error);
        }
      }

      this.__previousState = this.state;
      this.state = { ...newState };

      if (typeof this.render === 'function') {
        this.render();
      }

      await this.#persistState();

      if (typeof this.afterStateChange === 'function') {
        try {
          this.afterStateChange(this.__previousState, this.state);
        } catch (error) {
          console.error('Error in afterStateChange:', error);
        }
      }
    }

    /**
     * PRIVATE: Persist static parts of state to LocalStorage or IndexedDB.
     */
    async #persistState() {
      try {
        const serialized = JSON.stringify(this.state);
        const byteLength = new TextEncoder().encode(serialized).length;

        if (byteLength < 2500000 && !this.__useIndexedDB) { // ~2.5MB safe limit
          localStorage.setItem(this.__storageKey, serialized);
        } else {
          this.__useIndexedDB = true;
          await this.#saveToIndexedDB(this.__storageKey, this.state);
        }
      } catch (error) {
        console.error('Error persisting state:', error);
      }
    }

    /**
     * PRIVATE: Load static state during component initialization.
     */
    async loadStaticState() {
      try {
        const localData = localStorage.getItem(this.__storageKey);
        if (localData) {
          this.state = JSON.parse(localData);
          return;
        }

        const indexedData = await this.#loadFromIndexedDB(this.__storageKey);
        if (indexedData) {
          this.state = indexedData;
          this.__useIndexedDB = true;
        }
      } catch (error) {
        console.error('Error loading static state:', error);
      }
    }

    /**
     * PRIVATE: Save state object into IndexedDB.
     */
    #saveToIndexedDB(key, value) {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('ElevateElementDB', 1);

        request.onupgradeneeded = function (e) {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('state')) {
            db.createObjectStore('state');
          }
        };

        request.onsuccess = function (e) {
          const db = e.target.result;
          const tx = db.transaction('state', 'readwrite');
          const store = tx.objectStore('state');
          store.put(value, key);
          tx.oncomplete = () => resolve(true);
          tx.onerror = (err) => reject(err);
        };

        request.onerror = (e) => reject(e.target.error);
      });
    }

    /**
     * PRIVATE: Load state object from IndexedDB.
     */
    #loadFromIndexedDB(key) {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('ElevateElementDB', 1);

        request.onsuccess = function (e) {
          const db = e.target.result;
          const tx = db.transaction('state', 'readonly');
          const store = tx.objectStore('state');
          const getRequest = store.get(key);

          getRequest.onsuccess = () => resolve(getRequest.result || null);
          getRequest.onerror = (err) => reject(err);
        };

        request.onerror = (e) => reject(e.target.error);
      });
    }
  };
}

// features/serviceWorker.js

export function addServiceWorker(BaseElement) {
  return class extends BaseElement {
    constructor() {
      super();
      this.serviceWorkerRegistration = null;
      this.__serviceWorkerMessageHandlers = [];
    }

    /**
     * Register a service worker script.
     * @param {string} scriptURL - Path to the service worker script
     * @param {object} [options] - Optional registration options (scope, type)
     */
    async registerServiceWorker(scriptURL, options = {}) {
      if (!('serviceWorker' in navigator)) {
        console.warn('Service workers are not supported in this browser.');
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register(scriptURL, options);
        this.serviceWorkerRegistration = registration;

        console.log('[ServiceWorker] Registered:', registration);

        // Setup listener for messages
        navigator.serviceWorker.addEventListener('message', this.#handleServiceWorkerMessage.bind(this));
      } catch (error) {
        console.error('[ServiceWorker] Registration failed:', error);
      }
    }

    /**
     * Unregister the currently active service worker.
     */
    async unregisterServiceWorker() {
      if (this.serviceWorkerRegistration) {
        try {
          await this.serviceWorkerRegistration.unregister();
          console.log('[ServiceWorker] Unregistered.');
          this.serviceWorkerRegistration = null;
        } catch (error) {
          console.error('[ServiceWorker] Unregistration failed:', error);
        }
      }
    }

    /**
     * Send a message to the service worker (active or waiting worker).
     * @param {any} message - The message payload to send
     */
    sendMessageToServiceWorker(message) {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(message);
      } else {
        console.warn('[ServiceWorker] No active controller to send message to.');
      }
    }

    /**
     * Register a handler for incoming messages from the service worker.
     * @param {function} handler - A callback function that receives the event.data
     */
    onServiceWorkerMessage(handler) {
      if (typeof handler === 'function') {
        this.__serviceWorkerMessageHandlers.push(handler);
      }
    }

    /**
     * PRIVATE: Internal handler for messages from service workers.
     */
    #handleServiceWorkerMessage(event) {
      this.__serviceWorkerMessageHandlers.forEach(handler => {
        try {
          handler.call(this, event.data);
        } catch (error) {
          console.error('Error in service worker message handler:', error);
        }
      });
    }

    /**
     * Cleanup when component is removed
     */
    disconnectedCallback() {
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }

      navigator.serviceWorker.removeEventListener('message', this.#handleServiceWorkerMessage.bind(this));
      this.__serviceWorkerMessageHandlers = [];
    }
  };
}

