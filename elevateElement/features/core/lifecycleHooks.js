// elevateElement/features/lifecycleHooks.js
import { elevateElementConfig } from '../../config/config.js';

export function addLifecycleHooks(BaseElement) {
  return class extends BaseElement {
    #beforeHooks = {};
    #afterHooks = {};

    constructor() {
      super();
      console.log(`[LifecycleHooks] Initializing hooks for ${this.tagName.toLowerCase()}`);

      // Only create shadow DOM if enabled in config and not already created
      const useShadowDOM = elevateElementConfig.framework?.useShadowDOM !== false;
      const shadowDOMMode = elevateElementConfig.framework?.shadowDOMMode || 'open';
      
      if (useShadowDOM && !this.shadowRoot) {
        this.attachShadow({ mode: shadowDOMMode });
      }
      console.log('[LifecycleHooks] Constructor initialized.');
    }

    /**
     * Register a callback to run before a method
     */
    before(methodName, callback) {
      if (!this.#beforeHooks[methodName]) {
        this.#beforeHooks[methodName] = [];
      }
      this.#beforeHooks[methodName].push(callback);
      return this;
    }

    /**
     * Register a callback to run after a method
     */
    after(methodName, callback) {
      if (!this.#afterHooks[methodName]) {
        this.#afterHooks[methodName] = [];
      }
      this.#afterHooks[methodName].push(callback);
      return this;
    }

    /**
     * Default connectedCallback with lifecycle hooks
     * Will be called when element is inserted into the DOM
     */
    connectedCallback() {
      if (super.connectedCallback) {
        const beforeHooks = this.#beforeHooks['connectedCallback'] || [];
        const afterHooks = this.#afterHooks['connectedCallback'] || [];
        
        // Run before hooks
        beforeHooks.forEach(hook => hook.call(this));
        
        // Call parent method
        super.connectedCallback();
        
        // Run after hooks
        afterHooks.forEach(hook => hook.call(this));
      }
    }
    
    /**
     * Default disconnectedCallback with lifecycle hooks
     * Will be called when element is removed from the DOM
     */
    disconnectedCallback() {
      if (super.disconnectedCallback) {
        const beforeHooks = this.#beforeHooks['disconnectedCallback'] || [];
        const afterHooks = this.#afterHooks['disconnectedCallback'] || [];
        
        // Run before hooks
        beforeHooks.forEach(hook => hook.call(this));
        
        // Call parent method
        super.disconnectedCallback();
        
        // Run after hooks
        afterHooks.forEach(hook => hook.call(this));
      }
    }

    /**
     * Default adoptedCallback with lifecycle hooks
     * Will be called when element is moved to a new document
     */
    adoptedCallback() {
      if (super.adoptedCallback) {
        const beforeHooks = this.#beforeHooks['adoptedCallback'] || [];
        const afterHooks = this.#afterHooks['adoptedCallback'] || [];
        
        // Run before hooks
        beforeHooks.forEach(hook => hook.call(this));
        
        // Call parent method
        super.adoptedCallback();
        
        // Run after hooks
        afterHooks.forEach(hook => hook.call(this));
      }
    }
    
    /**
     * Default attributeChangedCallback with lifecycle hooks
     * Will be called when an attribute is added, removed, or updated
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (super.attributeChangedCallback) {
        const beforeHooks = this.#beforeHooks['attributeChangedCallback'] || [];
        const afterHooks = this.#afterHooks['attributeChangedCallback'] || [];
        
        // Run before hooks
        beforeHooks.forEach(hook => hook.call(this, name, oldValue, newValue));
        
        // Call parent method
        super.attributeChangedCallback(name, oldValue, newValue);
        
        // Run after hooks
        afterHooks.forEach(hook => hook.call(this, name, oldValue, newValue));
      }
    }

    /**
     * PRIVATE: Inject the result of render() into the appropriate DOM container.
     */
    __injectRender() {
      try {
        const useShadowDOM = elevateElementConfig.framework?.useShadowDOM !== false;
        const html = this.render();
        
        if (typeof html !== 'string') {
          console.warn('[LifecycleHooks] render() did not return a string.');
          return;
        }
        
        // Check if we should use shadowRoot or light DOM
        if (useShadowDOM && this.shadowRoot && this.shadowRoot.mode === 'open') {
          this.shadowRoot.innerHTML = html;
        } else {
          // Use light DOM
          this.innerHTML = html;
        }
      } catch (error) {
        console.error('Error during __injectRender:', error);
      }
    }

    /**
     * Subscribe to update notifications
     */
    on(event, callback) {
      this.addEventListener(event, (e) => callback(e.detail));
      return this;
    }

    /**
     * Update state and trigger re-render
     */
    setState(newState) {
      if (typeof newState !== 'object' || newState === null) {
        console.error('[LifecycleHooks] setState requires an object argument.');
        return;
      }
      
      if (!this.state) this.state = {};
      
      const oldState = { ...this.state };
      const updatedState = { ...this.state, ...newState };
      this.state = updatedState;
      
      console.log('[LifecycleHooks] State updated:', updatedState);
      
      if (this.shouldUpdate?.(oldState, updatedState) !== false) {
        if (this.render) {
          this.__injectRender();
        }
      
        this.dispatchEvent(new CustomEvent('state-changed', {
          detail: { oldState, newState: updatedState }
        }));
      }
      
      return this;
    }
    
    // Cache hook results
    #hookCache = new Map();
    
    async runHooks(type, methodName, ...args) {
      const cacheKey = `${type}-${methodName}`;
      
      if (!this.#hookCache.has(cacheKey)) {
        const hooks = type === 'before' ? 
          this.#beforeHooks[methodName] || [] : 
          this.#afterHooks[methodName] || [];
          
        this.#hookCache.set(cacheKey, hooks);
      }
      
      const hooks = this.#hookCache.get(cacheKey);
      
      for (const hook of hooks) {
        await hook.call(this, ...args);
      }
    }
    
    // Clear cache when hooks change
    before(methodName, callback) {
      this.#hookCache.delete(`before-${methodName}`);
      return this;
    }
    
    after(methodName, callback) {
      this.#hookCache.delete(`after-${methodName}`);
      return this;
    }
  };
}