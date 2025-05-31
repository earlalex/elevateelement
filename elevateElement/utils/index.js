import { StateManager, withGlobalState, ComponentState } from './stateManager.js';
import { BaseComponentUtils } from './baseComponent.js';

// Export the utilities
export {
  StateManager,
  withGlobalState,
  ComponentState,
  BaseComponentUtils
};

// Export renderView directly from the enhanced version
export { renderViewEnhanced as renderView };

/**
 * Creates an observable property
 * @param {Object} target - The target object
 * @param {string} key - The property name
 * @param {any} initialValue - The initial value
 * @param {Function} [callback] - Optional callback when value changes
 */
export function makeObservable(target, key, initialValue, callback) {
  let value = initialValue;
  
  Object.defineProperty(target, key, {
    get() {
      return value;
    },
    set(newValue) {
      const oldValue = value;
      value = newValue;
      
      if (callback && typeof callback === 'function') {
        callback(newValue, oldValue);
      }
      
      return true;
    },
    enumerable: true,
    configurable: true
  });
  
  return target;
}

// This is a special utility function that adds all utilities to a class
export function elevateElementUtils(BaseClass) {
  return class extends BaseClass {
    constructor(...args) {
      super(...args);
    }
    
    // Add any general utility methods here that should be available to all components
    
    /**
     * Creates an observable property on the instance
     * @param {string} key - The property name
     * @param {any} initialValue - The initial value
     * @param {Function} [callback] - Optional callback when value changes
     */
    makeObservable(key, initialValue, callback) {
      return makeObservable(this, key, initialValue, callback);
    }
    
    /**
     * Connect this component to the global state
     * @param {string} key - The global state key
     * @param {string} stateProperty - The property on this component to bind
     * @param {any} defaultValue - Default value if not set
     * @returns {Object} - Object with get/set methods
     */
    connectToGlobalState(key, stateProperty, defaultValue) {
      // Add withGlobalState mixin functionality
      if (!this._stateSubscriptions) {
        this._stateSubscriptions = [];
      }
      
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
        get: () => StateManager.get(key),
        set: (value) => {
          StateManager.set(key, value);
          return value;
        }
      };
    }
    
    /**
     * Disconnect from global state
     */
    disconnectFromGlobalState() {
      if (this._stateSubscriptions) {
        this._stateSubscriptions.forEach(unsubscribe => {
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        });
        this._stateSubscriptions = [];
      }
    }
    
    /**
     * Create a component state manager
     * @param {Object} initialState - The initial state
     * @returns {ComponentState} - The component state manager
     */
    createComponentState(initialState = {}) {
      return new ComponentState(initialState, this);
    }
  };
}

/**
 * Utility functions for ElevateElement framework
 */

/**
 * Safe HTML rendering function for views
 * This function handles all common view rendering tasks:
 * - Gets the main content element
 * - Ensures content is visible
 * - Shows loading state first
 * - Handles errors gracefully
 * - Enforces visibility of rendered content
 * 
 * @param {Object} view - View object with content property 
 * @param {String} viewName - Name of the view for logging
 * @returns {Promise<boolean>} - Whether rendering succeeded
 */
export const renderViewEnhanced = async (view, viewName) => {
  try {
    console.log(`[${viewName}] Loading view...`);
    const main = document.querySelector('main[data-elevateElement="view"]');
    
    if (!main) {
      console.error(`[${viewName}] Could not find main view element`);
      return false;
    }
    
    // Skip if already rendered to prevent duplicate rendering
    if (view.contentRendered) {
      console.log(`[${viewName}] Content already rendered, skipping`);
      
      // Still ensure main is visible
      main.style.display = 'block';
      main.style.visibility = 'visible';
      main.style.opacity = '1';
      
      return true;
    }
    
    // Create a dedicated content container with forced visibility
    const contentContainer = document.createElement('div');
    contentContainer.id = `${viewName.toLowerCase()}-view-content`;
    contentContainer.setAttribute('data-view', viewName.toLowerCase());
    
    // Apply strong visibility styles
    contentContainer.style.cssText = `
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    `;
    
    // Show loading indicator immediately
    contentContainer.innerHTML = `<div style="text-align:center;padding:20px;"><p>Loading ${viewName} content...</p></div>`;
    
    // Clear main and append container
    main.innerHTML = '';
    main.appendChild(contentContainer);
    
    // Ensure main itself is visible
    main.style.display = 'block';
    main.style.visibility = 'visible';
    main.style.opacity = '1';
    
    // Small delay to ensure DOM updates
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Set content
    contentContainer.innerHTML = view.content;
    
    // Mark view as rendered to prevent duplicate renders
    view.contentRendered = true;
    
    console.log(`[${viewName}] Content rendered to DOM`);
    
    // Create mutation observer to detect if our content gets removed
    const observer = new MutationObserver((mutations) => {
      // Check if our container was removed
      if (!main.contains(contentContainer) && view.contentRendered) {
        console.warn(`[${viewName}] Content container was unexpectedly removed, restoring...`);
        
        // Restore container
        main.appendChild(contentContainer);
        
        // Ensure visibility
        contentContainer.style.display = 'block !important';
        contentContainer.style.visibility = 'visible !important';
        contentContainer.style.opacity = '1 !important';
      }
    });
    
    // Start observing
    observer.observe(main, { childList: true });
    
    return true;
  } catch (error) {
    console.error(`[${viewName}] Error rendering view:`, error);
    
    // Show error in main view
    const main = document.querySelector('main[data-elevateElement="view"]');
    if (main) {
      const errorContainer = document.createElement('div');
      errorContainer.style.padding = '20px';
      errorContainer.style.backgroundColor = '#ffebee';
      errorContainer.style.color = '#c62828'; 
      errorContainer.style.border = '1px solid #ffcdd2';
      errorContainer.style.borderRadius = '4px';
      errorContainer.style.margin = '20px';
      
      errorContainer.innerHTML = `
        <h2>Error Loading ${viewName} View</h2>
        <p>${error.message || 'Unknown error'}</p>
      `;
      
      main.innerHTML = '';
      main.appendChild(errorContainer);
    }
    
    return false;
  }
};

/**
 * Helper function to safely parse JSON
 * @param {string} jsonString - JSON string to parse
 * @param {*} fallback - Default value if parsing fails
 * @returns {*} Parsed object or fallback value
 */
export function parseJSON(jsonString, fallback = {}) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return fallback;
  }
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Add additional utility functions as needed