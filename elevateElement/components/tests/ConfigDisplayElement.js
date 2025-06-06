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

    async runTest() {
      console.log('[ConfigDisplayElement] Starting test...');
      let testResult = { success: false, message: '' };
      let assertionsPassed = true;
      let assertionMessages = [];

      // 1. Check if config state exists and is an object
      if (this.state.config !== null && typeof this.state.config === 'object') {
        assertionMessages.push('Config object exists in state.');
      } else {
        assertionsPassed = false;
        assertionMessages.push(`Assertion failed: this.state.config is null or not an object. Value: ${this.state.config}`);
      }

      // 2. Compare a top-level value (e.g., devMode)
      // Ensure elevateElementConfig is accessible here or passed if runTest is isolated.
      // Since runTest is part of the class, elevateElementConfig imported in the module is accessible.
      if (assertionsPassed && this.state.config.devMode === elevateElementConfig.devMode) {
        assertionMessages.push(`devMode matches (Value: ${this.state.config.devMode}).`);
      } else if (assertionsPassed) { // only if previous check didn't already fail this part
        assertionsPassed = false;
        assertionMessages.push(`Assertion failed: devMode mismatch. State: ${this.state.config.devMode}, Source: ${elevateElementConfig.devMode}`);
      }

      // 3. Compare a nested value (e.g., branding.colorPalette.primary)
      const statePrimaryColor = this.state.config?.branding?.colorPalette?.primary;
      const sourcePrimaryColor = elevateElementConfig?.branding?.colorPalette?.primary;
      if (assertionsPassed && statePrimaryColor === sourcePrimaryColor) {
        assertionMessages.push(`Primary color matches (Value: ${statePrimaryColor}).`);
      } else if (assertionsPassed) {
        assertionsPassed = false;
        assertionMessages.push(`Assertion failed: Primary color mismatch. State: ${statePrimaryColor}, Source: ${sourcePrimaryColor}`);
      }

      // 4. Compare another nested value (e.g., businessInfo.name)
      const stateBusinessName = this.state.config?.businessInfo?.name;
      const sourceBusinessName = elevateElementConfig?.businessInfo?.name;
      if (assertionsPassed && stateBusinessName === sourceBusinessName) {
        assertionMessages.push(`Business name matches (Value: ${stateBusinessName}).`);
      } else if (assertionsPassed) {
        assertionsPassed = false;
        assertionMessages.push(`Assertion failed: Business name mismatch. State: ${stateBusinessName}, Source: ${sourceBusinessName}`);
      }


      if (assertionsPassed) {
        testResult.success = true;
        testResult.message = 'ConfigDisplayElement test passed. ' + assertionMessages.join('; ');
        console.log('[ConfigDisplayElement] Assertions Passed:', testResult.message);
      } else {
        testResult.message = 'ConfigDisplayElement test failed: ' + assertionMessages.join('; ');
        console.error('[ConfigDisplayElement] Assertions Failed:', testResult.message);
      }

      // UI update if necessary (though this component is mostly static display)
      if (this.update) this.update(); else if (this.requestUpdate) this.requestUpdate();

      return testResult;
    }
  }

  if (!customElements.get('config-display-element')) {
    customElements.define('config-display-element', ConfigDisplayElement);
    console.log('[ConfigDisplayElement] Custom element defined by ConfigDisplayElementBuilder.');
  }
  return ConfigDisplayElement;
}