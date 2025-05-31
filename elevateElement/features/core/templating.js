// features/templating.js
import { elevateElementConfig } from '../../config/config.js';

export function addTemplating(BaseElement) {
  return class extends BaseElement {
    constructor() {
      super();
      
      // Only create shadow DOM if enabled in config
      const useShadowDOM = elevateElementConfig.framework?.useShadowDOM !== false;
      const shadowDOMMode = elevateElementConfig.framework?.shadowDOMMode || 'open';
      
      if (useShadowDOM) {
        this.attachShadow({ mode: shadowDOMMode });
      }
    }

    template() {
      return ''; // Default empty template
    }

    render() {
      let rawTemplate = this.template();
      if (typeof rawTemplate !== 'string') {
        console.error('template() must return a string.');
        return;
      }

      const evaluatedTemplate = this.#processTemplate(rawTemplate);

      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = evaluatedTemplate;
        this.#processDirectives(this.shadowRoot);
        this.#applyZIndex(this.shadowRoot);
        this.#bindEvents(this.shadowRoot);
      } else {
        this.innerHTML = evaluatedTemplate;
        this.#processDirectives(this);
        this.#applyZIndex(this);
        this.#bindEvents(this);
      }
    }

    /**
     * Process template string and evaluate expressions
     * @private
     */
    #processTemplate(template) {
      if (!template) return '';

      // Replace {{expressions}} with evaluated results
      return template.replace(/\{\{([^{}]+)\}\}/g, (match, expr) => {
        try {
          // Use Function to create a scope with 'this' context
          const evaluator = new Function('self', `with(self) { return ${expr}; }`);
          const result = evaluator(this);
          return result === undefined ? '' : result;
        } catch (error) {
          console.error(`Error evaluating template expression ${match}:`, error);
          return '';
        }
      });
    }

    /**
     * Process directives in the DOM
     * @private
     */
    #processDirectives(root) {
      // example: process conditionals with data-if, loops with data-for, etc.
      // will be expanded in future versions
    }
    
    /**
     * Apply z-index to elements with data-z attribute
     * @private
     */
    #applyZIndex(root) {
      root.querySelectorAll('[data-z]').forEach(elem => {
        const z = parseInt(elem.getAttribute('data-z'), 10);
        if (!isNaN(z)) {
          elem.style.zIndex = z;
        }
      });
    }
    
    /**
     * Bind events from markup
     * @private
     */
    #bindEvents(root) {
      root.querySelectorAll('[data-event]').forEach(elem => {
        const eventData = elem.getAttribute('data-event').split(':');
        if (eventData.length === 2) {
          const [eventName, methodName] = eventData;
          if (this[methodName] && typeof this[methodName] === 'function') {
            elem.addEventListener(eventName, (e) => this[methodName](e));
          }
        }
      });
    }
  };
}