/**
 * Global State Manager for ElevateElement
 * Provides centralized state management with subscription capabilities
 */

// Initialize the global state store if it doesn't exist
if (typeof window !== 'undefined' && !window.ElevateGlobalState) {
  window.ElevateGlobalState = {
    // Store state data
    store: {},
    
    // Store subscribers
    subscribers: {},
    
    // Get state by key
    get: function(key) {
      return key ? this.store[key] : this.store;
    },
    
    // Set state by key
    set: function(key, value) {
      const oldValue = this.store[key];
      this.store[key] = value;
      
      // Notify subscribers
      this.notify(key, value, oldValue);
      
      return value;
    },
    
    // Subscribe to state changes
    subscribe: function(key, callback) {
      if (!this.subscribers[key]) {
        this.subscribers[key] = [];
      }
      this.subscribers[key].push(callback);
      
      // Return unsubscribe function
      return () => {
        this.subscribers[key] = this.subscribers[key].filter(cb => cb !== callback);
      };
    },
    
    // Notify subscribers of state changes
    notify: function(key, newValue, oldValue) {
      if (this.subscribers[key]) {
        this.subscribers[key].forEach(callback => {
          try {
            callback(newValue, oldValue);
          } catch (error) {
            console.error('[ElevateGlobalState] Error in subscriber callback:', error);
          }
        });
      }
    },
    
    // Initialize state with default values
    init: function(initialState = {}) {
      this.store = { ...this.store, ...initialState };
      return this.store;
    },
    
    // Reset state for a specific key
    reset: function(key) {
      if (key && this.store[key] !== undefined) {
        const oldValue = this.store[key];
        delete this.store[key];
        this.notify(key, undefined, oldValue);
      }
    },
    
    // Reset all state
    resetAll: function() {
      const oldStore = { ...this.store };
      this.store = {};
      
      // Notify all subscribers
      Object.keys(oldStore).forEach(key => {
        this.notify(key, undefined, oldStore[key]);
      });
    },
    
    // Persist state to localStorage
    persist: function(key) {
      try {
        if (typeof localStorage !== 'undefined') {
          const value = this.store[key];
          localStorage.setItem(`elevate_state_${key}`, JSON.stringify(value));
        }
      } catch (error) {
        console.error('[ElevateGlobalState] Error persisting state:', error);
      }
    },
    
    // Load persisted state from localStorage
    load: function(key) {
      try {
        if (typeof localStorage !== 'undefined') {
          const value = localStorage.getItem(`elevate_state_${key}`);
          if (value) {
            const parsedValue = JSON.parse(value);
            this.set(key, parsedValue);
            return parsedValue;
          }
        }
      } catch (error) {
        console.error('[ElevateGlobalState] Error loading persisted state:', error);
      }
      return null;
    }
  };
  
  console.log('[ElevateGlobalState] Global state manager initialized');
}

// Export functions for the state manager
export const StateManager = {
  // Get a value from the global state
  get: function(key) {
    return window.ElevateGlobalState.get(key);
  },
  
  // Set a value in the global state
  set: function(key, value) {
    return window.ElevateGlobalState.set(key, value);
  },
  
  // Subscribe to changes in the global state
  subscribe: function(key, callback) {
    return window.ElevateGlobalState.subscribe(key, callback);
  },
  
  // Initialize the global state with default values
  init: function(initialState = {}) {
    return window.ElevateGlobalState.init(initialState);
  },
  
  // Reset a specific key in the global state
  reset: function(key) {
    window.ElevateGlobalState.reset(key);
  },
  
  // Reset the entire global state
  resetAll: function() {
    window.ElevateGlobalState.resetAll();
  },
  
  // Persist a value to localStorage
  persist: function(key) {
    window.ElevateGlobalState.persist(key);
  },
  
  // Load a persisted value from localStorage
  load: function(key) {
    return window.ElevateGlobalState.load(key);
  }
};

// Mixin for components to use global state
export function withGlobalState(BaseClass) {
  return class extends BaseClass {
    constructor(...args) {
      super(...args);
      this._stateSubscriptions = [];
    }
    
    // Connect to global state
    connectToGlobalState(key, stateProperty, defaultValue) {
      // Set default value if not exists
      if (StateManager.get(key) === undefined && defaultValue !== undefined) {
        StateManager.set(key, defaultValue);
      }
      
      // Set initial value from global state
      const initialValue = StateManager.get(key);
      if (initialValue !== undefined) {
        this[stateProperty] = initialValue;
      }
      
      // Subscribe to changes
      const unsubscribe = StateManager.subscribe(key, (newValue) => {
        this[stateProperty] = newValue;
        if (typeof this.updateUI === 'function') {
          this.updateUI();
        }
      });
      
      this._stateSubscriptions.push(unsubscribe);
      
      return {
        // Get value from global state
        get: () => StateManager.get(key),
        
        // Set value in global state
        set: (value) => {
          StateManager.set(key, value);
          return value;
        }
      };
    }
    
    // Disconnect from global state
    disconnectFromGlobalState() {
      // Unsubscribe from all subscriptions
      this._stateSubscriptions.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      this._stateSubscriptions = [];
    }
    
    disconnectedCallback() {
      this.disconnectFromGlobalState();
      super.disconnectedCallback && super.disconnectedCallback();
    }
  };
}

// Component state binding for non-global component state
export class ComponentState {
  constructor(initialState = {}, component) {
    this.state = { ...initialState };
    this.component = component;
    this.subscribers = [];
  }
  
  get(key) {
    return key ? this.state[key] : this.state;
  }
  
  set(key, value) {
    // Allow setting multiple properties at once with an object
    if (typeof key === 'object' && value === undefined) {
      const newState = { ...this.state, ...key };
      const changed = Object.keys(key).some(k => this.state[k] !== key[k]);
      
      this.state = newState;
      
      if (changed) {
        this.notify(this.state);
      }
      
      return this.state;
    }
    
    // Setting a single property
    const oldValue = this.state[key];
    this.state[key] = value;
    
    if (oldValue !== value) {
      this.notify(this.state);
    }
    
    return value;
  }
  
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  notify(newState) {
    this.subscribers.forEach(callback => {
      try {
        callback(newState);
      } catch (error) {
        console.error('[ComponentState] Error in subscriber callback:', error);
      }
    });
    
    // Trigger component update if available
    if (this.component && typeof this.component.updateUI === 'function') {
      this.component.updateUI();
    }
  }
}

// Hook up to global store for initialization
if (typeof window !== 'undefined' && window.ElevateStore) {
  // Initialize the global state with configuration from ElevateStore
  StateManager.init({
    config: window.ElevateStore.config,
    initialized: window.ElevateStore.initialized
  });
  
  // Subscribe to config changes to keep ElevateStore in sync
  StateManager.subscribe('config', (newConfig) => {
    if (window.ElevateStore) {
      window.ElevateStore.config = newConfig;
    }
  });
  
  // Subscribe to initialization changes
  StateManager.subscribe('initialized', (newValue) => {
    if (window.ElevateStore) {
      window.ElevateStore.initialized = newValue;
    }
  });
} 