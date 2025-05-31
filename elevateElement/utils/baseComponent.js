import { elevateElementConfig } from '../config/config.js';

/**
 * Base component utility to standardize component rendering approach
 * for both Shadow DOM and Light DOM components
 */
export const BaseComponentUtils = {
  /**
   * Renders the component template based on the current Shadow DOM configuration
   * @param {HTMLElement} component - The component instance
   * @param {Function} templateFn - Function that returns the component's template string
   * @param {Function} stylesFn - Function that returns the component's CSS styles
   */
  render(component, templateFn, stylesFn) {
    const shadowDOM = component.shadowDOM !== undefined 
      ? component.shadowDOM 
      : elevateElementConfig.framework?.useShadowDOM !== false;
    
    // CSS variables fallback - this ensures variables are available inside components
    const cssVars = `
      /* CSS Variables fallback */
      :host, :root {
        /* Color system */
        --color-primary: #0066cc;
        --color-primary-light: #3a90e5;
        --color-primary-dark: #004c99;
        --color-on-primary: #ffffff;
        --color-surface: #ffffff;
        --color-surface-variant: #f5f5f7;
        --color-background: #fbfbfd;
        --color-on-surface: #1d1d1f;
        --color-on-surface-medium: #515154;
        --color-on-surface-high: #000000;
        --color-error: #ff3b30;
        --color-error-light: #ff6b6b;
        --color-on-error: #ffffff;
        --color-success: #30d158;
        --color-warning: #ff9500;
        --color-info: #0a84ff;
        --color-border: #e6e6e6;
        
        /* Typography */
        --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        --font-mono: 'JetBrains Mono', monospace;
        --font-display: 'Outfit', sans-serif;
        --font-xs: 0.75rem;
        --font-sm: 0.875rem;
        --font-base: 1rem;
        --font-md: 1.125rem;
        --font-lg: 1.25rem;
        
        /* Font weights */
        --weight-light: 300;
        --weight-regular: 400;
        --weight-medium: 500;
        --weight-semi-bold: 600;
        
        /* Spacing */
        --space-xs: 0.5rem;
        --space-sm: 0.875rem;
        --space-md: 1.25rem;
        --space-lg: 2rem;
        --space-xl: 3rem;
        
        /* Borders & Radius */
        --radius-sm: 6px;
        --radius-md: 8px;
        --radius-lg: 12px;
        
        /* Elevation (Shadows) */
        --elevation-1: 0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px rgba(0, 0, 0, 0.05);
        --elevation-2: 0 3px 8px rgba(0, 0, 0, 0.08);
        
        /* Transitions */
        --duration-short: 240ms;
        --duration-medium: 300ms;
        --easing-standard: cubic-bezier(0.42, 0.0, 0.58, 1.0);
        
        /* Typography extras */
        --letter-spacing-tight: -0.02em;
        --line-height-tight: 1.2;
        --line-height-normal: 1.6;
      }
    `;
    
    if (shadowDOM && component.shadowRoot) {
      component.shadowRoot.innerHTML = templateFn.call(component);
      const styleEl = document.createElement('style');
      styleEl.textContent = cssVars + stylesFn.call(component);
      component.shadowRoot.prepend(styleEl);
    } else {
      component.innerHTML = templateFn.call(component);
      const styleEl = document.createElement('style');
      styleEl.textContent = cssVars + stylesFn.call(component);
      component.prepend(styleEl);
    }
  },
  
  /**
   * Attaches event listeners to elements within the component
   * @param {HTMLElement} component - The component instance
   * @param {Object} handlers - Map of selectors to event handlers
   * @param {string} eventType - The event type (default: 'click')
   */
  attachEventHandlers(component, handlers, eventType = 'click') {
    // Ensure handlers are bound to the component
    const boundHandlers = {};
    for (const [selector, handler] of Object.entries(handlers)) {
      boundHandlers[selector] = handler.bind(component);
    }
    
    // Use requestAnimationFrame to ensure DOM is fully rendered before attaching events
    requestAnimationFrame(() => {
      const shadowDOM = component.shadowDOM !== undefined 
        ? component.shadowDOM 
        : elevateElementConfig.framework?.useShadowDOM !== false;
      
      Object.entries(boundHandlers).forEach(([selector, boundHandler]) => {
        const element = shadowDOM
          ? component.shadowRoot.querySelector(selector)
          : component.querySelector(selector);
        
        if (element) {
          // Remove any existing event listeners to prevent duplicates on re-render
          const oldHandler = element._cachedHandler;
          if (oldHandler) {
            element.removeEventListener(eventType, oldHandler);
          }
          
          // Add new event listener and cache it
          element.addEventListener(eventType, boundHandler);
          element._cachedHandler = boundHandler;
          
          // Make sure the element has proper pointer events
          element.style.pointerEvents = 'auto';
        } else {
          console.warn(`[BaseComponentUtils] Element not found for selector: ${selector}`);
        }
      });
    });
  },
  
  /**
   * Gets an element within the component, respecting Shadow DOM setting
   * @param {HTMLElement} component - The component instance
   * @param {string} selector - CSS selector for the element
   * @returns {Element|null} - The found element or null
   */
  getElement(component, selector) {
    const shadowDOM = component.shadowDOM !== undefined 
      ? component.shadowDOM 
      : elevateElementConfig.framework?.useShadowDOM !== false;
    
    return shadowDOM
      ? component.shadowRoot.querySelector(selector)
      : component.querySelector(selector);
  }
}; 