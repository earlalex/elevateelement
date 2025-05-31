// features/styling.js
import { elevateElementConfig } from '../../config/config.js';

export function addStyling(BaseElement) {
  return class extends BaseElement {
    constructor() {
      super();
      this.styles = ''; // Static styles (can be string or function)
    }

    /**
     * Injects styles into the component's DOM container (shadow DOM or light DOM).
     */
    applyStyles() {
      const useShadowDOM = elevateElementConfig.framework?.useShadowDOM !== false;
      
      // Determine where to inject styles - shadowRoot or light DOM
      const root = useShadowDOM ? this.shadowRoot : this;
      
      // Don't continue if we have nowhere to inject
      if (!root) return;

      const existingStyleTag = root.querySelector('style[data-elevate-style]');
      if (existingStyleTag) {
        existingStyleTag.remove(); // Remove old style if exists
      }

      const styleTag = document.createElement('style');
      styleTag.setAttribute('data-elevate-style', 'true');

      let cssText = '';

      if (typeof this.styles === 'function') {
        try {
          cssText = this.styles(this.state || {});
        } catch (error) {
          console.error('Error generating dynamic styles:', error);
        }
      } else if (typeof this.styles === 'string') {
        cssText = this.styles;
      }
      
      // If this is Light DOM, scope the styles by adding element selector
      if (!useShadowDOM) {
        // Convert the CSS to be scoped to this element
        cssText = this.#scopeCSS(cssText);
      }

      styleTag.textContent = cssText;
      root.appendChild(styleTag);
    }
    
    /**
     * Scopes CSS to the current element when not using Shadow DOM
     * @private
     */
    #scopeCSS(cssText) {
      if (!cssText) return '';
      
      try {
        // Get element tag name for scoping
        const tag = this.tagName.toLowerCase();
        
        // Simple CSS parser to scope all selectors
        return cssText.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, (match, selector, delimiter) => {
          // Skip already scoped selectors and keyframes
          if (selector.includes('@keyframes') || 
              selector.startsWith('@media') || 
              selector.includes(tag)) {
            return match;
          }
          
          // Scope the selector with the element tag
          const scopedSelector = `${tag} ${selector}`;
          return `${scopedSelector}${delimiter}`;
        });
      } catch (error) {
        console.error('Error scoping CSS:', error);
        return cssText; // Return original on error
      }
    }

    /**
     * Auto-apply styles after rendering if styles exist.
     */
    render() {
      if (super.render) {
        super.render();
      }
      this.applyStyles();
    }
  };
}