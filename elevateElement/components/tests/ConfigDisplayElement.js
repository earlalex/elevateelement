import { elevateElementConfig } from '../../config/config.js';

export function ConfigDisplayElementBuilder(ElevateElementClass) {
  class ConfigDisplayElement extends ElevateElementClass {
    constructor() {
      super('config-display-element');
      this.state = {
        config: elevateElementConfig,
        testResult: { success: null, message: 'Test not run yet.' }
      };
    }

    connectedCallback() {
      super.connectedCallback();
      console.log('[ConfigDisplayElement] connected');
      if (this.render && typeof this.render === 'function' && this.shadowRoot) {
         this.shadowRoot.innerHTML = this.render(); // Initial render
      }
      this.attachEventHandlers();
    }

    disconnectedCallback() {
      console.log('[ConfigDisplayElement] disconnected');
      this.removeEventListeners();
      super.disconnectedCallback && super.disconnectedCallback();
    }

    attachEventHandlers() {
      if (!this.shadowRoot) return;
      const runTestButton = this.shadowRoot.querySelector('.run-this-test-button');
      if (runTestButton) {
        if (this._boundHandleRunThisTest) {
            runTestButton.removeEventListener('click', this._boundHandleRunThisTest);
        }
        this._boundHandleRunThisTest = this.handleRunThisTest.bind(this);
        runTestButton.addEventListener('click', this._boundHandleRunThisTest);
      } else {
        console.warn('[ConfigDisplayElement] "Run This Test" button not found for event attachment.');
      }
    }

    removeEventListeners() {
      if (!this.shadowRoot) return;
      const runTestButton = this.shadowRoot.querySelector('.run-this-test-button');
      if (runTestButton && this._boundHandleRunThisTest) {
        runTestButton.removeEventListener('click', this._boundHandleRunThisTest);
      }
    }

    async handleRunThisTest() {
        try {
            await this.runTest();
        } catch (e) {
            this.setState({ testResult: { success: false, message: `Test execution error: ${e.message}` } });
            if (this.render && typeof this.render === 'function' && this.shadowRoot) {
                // No need to call this.render() again if setState did it.
            }
            this.attachEventHandlers(); // Re-attach listeners
            console.error('[ConfigDisplayElement] Error during runTest from button:', e);
        }
    }

    safe(value) {
      return value ? value : '<i>Not Provided</i>';
    }

    render() {
      const { businessInfo, branding, digitalPresenceGoals, devMode } = this.state.config;
      const testResultStatusClass = this.state.testResult.success === true
        ? 'success'
        : this.state.testResult.success === false
          ? 'failure'
          : 'not-run';

      return `
        <style>
          :host {
            display: block;
            font-family: sans-serif;
            padding: 1rem;
          }
          button {
            padding: 0.5rem 1rem;
            margin-bottom: 1rem;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            background-color: var(--secondary-color, #03dac6);
            color: var(--on-secondary-color, white);
          }
          section {
            margin-bottom: 2rem;
            padding: 1rem;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          h2 {
            font-size: 1.5rem;
            margin-top:0;
            margin-bottom: 0.5rem;
          }
          p, li {
            margin: 0.3rem 0;
          }
          .test-result { margin-top: 10px; padding: 10px; border: 1px solid #eee; border-radius: 5px;}
          .test-result h4 { margin-top: 0; margin-bottom: 5px; }
          .status-message { padding: 5px; border-radius: 3px; }
          .status-message.success { color: green; background-color: #e6ffe6; border: 1px solid green;}
          .status-message.failure { color: red; background-color: #ffe6e6; border: 1px solid red;}
          .status-message.not-run { color: orange; background-color: #fff0e0; border: 1px solid orange;}
        </style>

        <div>
          <button class="run-this-test-button">Run This Test</button>
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

          <div class="test-result">
            <h4>Test Result:</h4>
            <p class="status-message ${testResultStatusClass}">
              ${this.state.testResult.message}
            </p>
          </div>
        </div>
      `;
    }

    async runTest() {
      console.log('[ConfigDisplayElement] Starting test...');
      let result = { success: false, message: '' }; // Renamed to avoid conflict
      let assertionsPassed = true;
      let assertionMessages = [];

      if (this.state.config !== null && typeof this.state.config === 'object') {
        assertionMessages.push('Config object exists in state.');
      } else {
        assertionsPassed = false;
        assertionMessages.push(`Assertion failed: this.state.config is null or not an object. Value: ${this.state.config}`);
      }

      if (assertionsPassed && this.state.config.devMode === elevateElementConfig.devMode) {
        assertionMessages.push(`devMode matches (Value: ${this.state.config.devMode}).`);
      } else if (assertionsPassed) {
        assertionsPassed = false;
        assertionMessages.push(`Assertion failed: devMode mismatch. State: ${this.state.config.devMode}, Source: ${elevateElementConfig.devMode}`);
      }

      const statePrimaryColor = this.state.config?.branding?.colorPalette?.primary;
      const sourcePrimaryColor = elevateElementConfig?.branding?.colorPalette?.primary;
      if (assertionsPassed && statePrimaryColor === sourcePrimaryColor) {
        assertionMessages.push(`Primary color matches (Value: ${statePrimaryColor}).`);
      } else if (assertionsPassed) {
        assertionsPassed = false;
        assertionMessages.push(`Assertion failed: Primary color mismatch. State: ${statePrimaryColor}, Source: ${sourcePrimaryColor}`);
      }

      const stateBusinessName = this.state.config?.businessInfo?.name;
      const sourceBusinessName = elevateElementConfig?.businessInfo?.name;
      if (assertionsPassed && stateBusinessName === sourceBusinessName) {
        assertionMessages.push(`Business name matches (Value: ${stateBusinessName}).`);
      } else if (assertionsPassed) {
        assertionsPassed = false;
        assertionMessages.push(`Assertion failed: Business name mismatch. State: ${stateBusinessName}, Source: ${sourceBusinessName}`);
      }

      if (assertionsPassed) {
        result.success = true;
        result.message = 'ConfigDisplayElement test passed. ' + assertionMessages.join('; ');
        console.log('[ConfigDisplayElement] Assertions Passed:', result.message);
      } else {
        result.message = 'ConfigDisplayElement test failed: ' + assertionMessages.join('; ');
        console.error('[ConfigDisplayElement] Assertions Failed:', result.message);
      }

      this.setState({ testResult: result });
      if (this.render && typeof this.render === 'function' && this.shadowRoot) {
        // No need to call this.render() again if setState did it.
      }
      this.attachEventHandlers(); // Re-attach listeners
      return result;
    }
  }

  if (!customElements.get('config-display-element')) {
    customElements.define('config-display-element', ConfigDisplayElement);
    console.log('[ConfigDisplayElement] Custom element defined by ConfigDisplayElementBuilder.');
  }
  return ConfigDisplayElement;
}