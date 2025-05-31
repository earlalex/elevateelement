// ==========================================
// elevateElement/features/stateManagement.js
// ==========================================

export function addStateManagement(BaseElement) {
  return class extends BaseElement {
    constructor() {
      super();
      this.state = {}; // In-memory fast state
      this.__previousState = {};
      this.__storageKey = this.constructor.storageKey || this.tagName.toLowerCase();
      this.__useIndexedDB = false; // Will switch dynamically
    }

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

    async setState(newState) {
      if (typeof newState !== 'object' || newState === null) {
        console.error('setState: newState must be a non-null object.');
        return;
      }

      const mergedState = this.#deepMerge(this.state, newState);
      const hasChanged = JSON.stringify(this.state) !== JSON.stringify(mergedState);

      if (!hasChanged) return;

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

      await this.#persistState();

      if (typeof this.afterStateChange === 'function') {
        try {
          this.afterStateChange(this.__previousState, this.state);
        } catch (error) {
          console.error('Error in afterStateChange:', error);
        }
      }
    }

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

    async #persistState() {
      try {
        const serialized = JSON.stringify(this.state);
        const byteLength = new TextEncoder().encode(serialized).length;

        if (byteLength < 2500000 && !this.__useIndexedDB) {
          localStorage.setItem(this.__storageKey, serialized);
        } else {
          this.__useIndexedDB = true;
          await this.#saveToIndexedDB(this.__storageKey, this.state);
        }
      } catch (error) {
        console.error('Error persisting state:', error);
      }
    }

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