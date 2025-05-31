import { elevateElementConfig } from '../../config/config.js';

export function ConfigDisplayElementBuilder(ElevateElementClass) {
  class ConfigDisplayElement extends ElevateElementClass {
    constructor() {
      super('config-display-element');
      this.state = {
        config: elevateElementConfig
      };
    }

    connectedCallback() {
      super.connectedCallback();
      console.log('[ConfigDisplayElement] connected');
    }

    disconnectedCallback() {
      console.log('[ConfigDisplayElement] disconnected');
      super.disconnectedCallback && super.disconnectedCallback();
    }

    events() {
      return {}; // No dynamic events yet, but standardized
    }

    safe(value) {
      return value ? value : '<i>Not Provided</i>';
    }

    render() {
      const { businessInfo, branding, digitalPresenceGoals, devMode } = this.state.config;

      return `
        <style>
          :host {
            display: block;
            font-family: sans-serif;
            padding: 1rem;
          }
          section {
            margin-bottom: 2rem;
          }
          h2 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
          }
          p, li {
            margin: 0.3rem 0;
          }
        </style>

        <div>
          <section>
            <h2>Dev Mode</h2>
            <p><strong>Status:</strong> ${this.safe(devMode)}</p> 
          </section>
          <section>
            <h2>Business Info</h2>
            <p><strong>Name:</strong> ${this.safe(businessInfo?.name)}</p>
            <p><strong>Phone:</strong> ${this.safe(businessInfo?.phone)}</p>
            <p><strong>Email:</strong> ${this.safe(businessInfo?.email)}</p>
          </section>

          <section>
            <h2>Branding</h2>
            <p><strong>Primary Color:</strong> ${this.safe(branding?.colorPalette?.primary)}</p>
            <p><strong>Primary Font:</strong> ${this.safe(branding?.fonts?.primary)}</p>
          </section>

          <section>
            <h2>Digital Goals</h2>
            <p><strong>Primary Web Goal:</strong> ${this.safe(digitalPresenceGoals?.primaryPurposeWeb)}</p>
            <p><strong>Primary App Goal:</strong> ${this.safe(digitalPresenceGoals?.primaryPurposeApp)}</p>
          </section>
        </div>
      `;
    }
  }

  customElements.define('config-display-element', ConfigDisplayElement);
}