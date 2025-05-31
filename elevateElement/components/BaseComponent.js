import { BaseComponentUtils } from '../utils/baseComponent.js';
import { ComponentState } from '../utils/stateManager.js';

/**
 * Creates the BaseComponent class that all ElevateElement components should extend
 * @param {ElevateElement} ElevateElement - The core ElevateElement class
 * @returns {Class} The BaseComponent class
 */
export function createBaseComponent(ElevateElement) {
  return class BaseComponent extends ElevateElement {
    constructor(elementName, config = {}) {
      super(elementName);
      
      // Basic properties
      this.elementName = elementName;
      this.options = config;
      this.initialized = false;

      // Set up shadow DOM based on config
      this.shadowDOM = config.useShadowDOM !== false;
      
      if (this.shadowDOM && !this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
      }
      
      // Create component state manager
      this._state = new ComponentState({}, this);
    }

    /**
     * Get a value from the component state
     * @param {string} key - The state key
     * @returns {any} The state value
     */
    getState(key) {
      return this._state.get(key);
    }
    
    /**
     * Set a value in the component state
     * @param {string} key - The state key
     * @param {any} value - The state value
     * @returns {any} The state value
     */
    setState(key, value) {
      return this._state.set(key, value);
    }
    
    /**
     * Set multiple values in the component state
     * @param {Object} stateObject - An object with key/value pairs to set
     * @returns {Object} The updated state
     */
    setStateObject(stateObject) {
      return this._state.set(stateObject);
    }
    
    /**
     * Lifecycle: Called when element is connected to the DOM
     */
    connectedCallback() {
      if (this.initialized) return;
      
      // Initialize the component
      this.init();
      
      // Attach event handlers
      if (typeof this.attachEventHandlers === 'function') {
        this.attachEventHandlers();
      }
      
      // Render initial UI
      this.updateUI();
      
      this.initialized = true;
    }

    /**
     * Lifecycle: Called when element is removed from the DOM
     */
    disconnectedCallback() {
      // Clean up event handlers
      if (typeof this.detachEventHandlers === 'function') {
        this.detachEventHandlers();
      }
      
      // Clean up global state subscriptions
      if (typeof this.disconnectFromGlobalState === 'function') {
        this.disconnectFromGlobalState();
      }
    }

    /**
     * Initialize the component (override in components)
     */
    init() {
      // To be implemented by subclasses
    }

    /**
     * Get CSS styles for the component (override in components)
     * @returns {string} CSS styles as a string
     */
    styles() {
      return '';
    }

    /**
     * Get HTML template for the component (override in components)
     * @returns {string} HTML template as a string
     */
    template() {
      return '';
    }

    /**
     * Update the UI of the component
     */
    updateUI() {
      // Get the template and styles
      const template = this.template();
      const styles = this.styles();
      
      // Combine them with the CSS variables from BaseComponentUtils
      const stylesWithVariables = styles ? styles : '';
      const stylesWithCSSVars = BaseComponentUtils.includeCSSVariables(stylesWithVariables);
      
      // Create a temporary container to parse the template
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = template;
      
      // Handle slots
      const defaultSlot = tempContainer.querySelector('slot:not([name])');
      const namedSlots = tempContainer.querySelectorAll('slot[name]');
      
      // Process default slot
      if (defaultSlot) {
        const defaultContent = Array.from(this.childNodes)
          .filter(node => !node.hasAttribute || !node.hasAttribute('slot'));
        defaultSlot.replaceWith(...defaultContent);
      }
      
      // Process named slots
      namedSlots.forEach(slot => {
        const slotName = slot.getAttribute('name');
        const slotContent = this.querySelector(`[slot="${slotName}"]`);
        if (slotContent) {
          slot.replaceWith(slotContent);
        }
      });
      
      // Generate the combined HTML
      const html = `
        <style>
          ${stylesWithCSSVars}
        </style>
        ${tempContainer.innerHTML}
      `;
      
      // Update the shadow DOM or light DOM
      if (this.shadowDOM && this.shadowRoot) {
        this.shadowRoot.innerHTML = html;
      } else {
        this.innerHTML = html;
      }
      
      // Re-attach event listeners
      this.addEventListeners();
    }
    
    /**
     * Helper method to get element by selector in shadow or light DOM
     * @param {string} selector - CSS selector
     * @returns {Element} The found element or null
     */
    $(selector) {
      if (this.shadowDOM && this.shadowRoot) {
        return this.shadowRoot.querySelector(selector);
      }
      return this.querySelector(selector);
    }
    
    /**
     * Helper method to get all elements by selector in shadow or light DOM
     * @param {string} selector - CSS selector
     * @returns {NodeList} The found elements
     */
    $$(selector) {
      if (this.shadowDOM && this.shadowRoot) {
        return this.shadowRoot.querySelectorAll(selector);
      }
      return this.querySelectorAll(selector);
    }

    /**
     * Connect to global state (for component-specific implementation)
     * @param {string} key - Global state key
     * @param {string} localKey - Local state key
     * @param {any} defaultValue - Default value
     */
    connectGlobalState(key, localKey, defaultValue) {
      if (typeof this.connectToGlobalState === 'function') {
        return this.connectToGlobalState(key, localKey, defaultValue);
      }
      console.warn('[BaseComponent] Global state connection not available');
      return null;
    }
  };
}