// features/styling.js

export function addStyling(BaseElement) {
  return class extends BaseElement {
    constructor() {
      super();
      this.styles = ''; // Static styles (can be string or function)
    }

    /**
     * Injects styles into the component's shadow DOM.
     */
    applyStyles() {
      if (!this.shadowRoot) return;

      const existingStyleTag = this.shadowRoot.querySelector('style[data-elevate-style]');
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

      styleTag.textContent = cssText;
      this.shadowRoot.appendChild(styleTag);
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