// features/globalStore.js

export const globalStore = (() => {
    const stores = {};
  
    function createStore(initialState = {}, options = {}) {
      const storeKey = options.key || Symbol('store');
      let state = structuredClone(initialState);
      const subscribers = new Set();
  
      function getState() {
        return structuredClone(state);
      }
  
      function setState(partialState) {
        const nextState = { ...state, ...partialState };
        if (JSON.stringify(state) !== JSON.stringify(nextState)) {
          state = nextState;
          publish();
        }
      }
  
      function replaceState(newState) {
        state = structuredClone(newState);
        publish();
      }
  
      function subscribe(handler) {
        if (typeof handler === 'function') {
          subscribers.add(handler);
          // Immediately fire with current state if needed
          handler(getState());
          return () => unsubscribe(handler);
        }
        return () => {};
      }
  
      function unsubscribe(handler) {
        subscribers.delete(handler);
      }
  
      function publish() {
        const snapshot = getState();
        subscribers.forEach((handler) => {
          try {
            handler(snapshot);
          } catch (error) {
            console.error('Error in store subscriber:', error);
          }
        });
      }
  
      // Save in internal registry if keyed
      stores[storeKey] = {
        getState,
        setState,
        replaceState,
        subscribe,
        unsubscribe
      };
  
      return stores[storeKey];
    }
  
    function getStore(key) {
      return stores[key] || null;
    }
  
    return {
      createStore,
      getStore
    };
  })();
  
  