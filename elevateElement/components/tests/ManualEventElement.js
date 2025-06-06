// elevateElement/components/ManualEventElement.js

export function ManualEventElementBuilder(ElevateElementClass) {
  class ManualEventElement extends ElevateElementClass {
    constructor() {
      super('manual-event-element');

      this.state = {
        nativeStatus: '',
        internalStatus: '',
        testResult: { success: null, message: 'Test not run yet.' }
      };
    }

    connectedCallback() {
      super.connectedCallback();
      console.log('[ManualEventElement] connected');

      // Listen for native dispatched event
      // Ensure these listeners are idempotent or cleaned up if connectedCallback can be called multiple times.
      // For typical custom element lifecycle, connectedCallback is called once when element is added to DOM.
      this.addEventListener('manual-native', (e) => {
        console.log('[ManualEventElement] Native event caught:', e);
        this.setState({ nativeStatus: 'Native event received!' });
      });

      // Listen for internal event
      this.on('manual-internal', (detail) => {
        console.log('[ManualEventElement] Internal event caught:', detail);
        this.setState({ internalStatus: 'Internal event received!' });
      });
    }

    disconnectedCallback() {
      console.log('[ManualEventElement] disconnected');
      // Event listeners added with this.addEventListener should be removed here if necessary.
      // Listeners added with this.on (if it's a framework method) might be auto-cleaned.
      super.disconnectedCallback && super.disconnectedCallback();
    }

    async handleRunThisTest() {
        try {
            await this.runTest();
        } catch (e) {
            this.setState({ testResult: { success: false, message: `Test execution error: ${e.message}` } });
            console.error('[ManualEventElement] Error during runTest from button:', e);
        }
    }

    events() {
      return {
        click: {
          '.native-button': (e) => this.dispatchNativeEvent(e),
          '.internal-button': (e) => this.emitInternalEvent(e),
          '.run-this-test-button': () => this.handleRunThisTest(),
          _options: { passive: true }
        }
      };
    }

    dispatchNativeEvent(e) {
      console.log('[ManualEventElement] Dispatching native CustomEvent.');
      const event = new CustomEvent('manual-native', {
        bubbles: true,
        composed: true,
        detail: { source: 'native' }
      });
      this.dispatchEvent(event);
    }

    emitInternalEvent(e) {
      console.log('[ManualEventElement] Emitting internal event.');
      this.emit('manual-internal', { source: 'internal' });
    }

    async runTest() {
      console.log('[ManualEventElement] Starting test...');
      let allTestsPassed = true;
      let messages = [];

      // Test Native Event
      this.dispatchNativeEvent();
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for event propagation and setState

      if (this.state.nativeStatus === 'Native event received!') {
        messages.push('Native event assertion passed.');
        console.log('[ManualEventElement] Assertion Passed: Native event status is correct.');
      } else {
        allTestsPassed = false;
        messages.push(`Assertion failed: Native event status is "${this.state.nativeStatus}", expected "Native event received!".`);
        console.error('[ManualEventElement] Assertion Failed:', messages[messages.length - 1]);
      }

      // Test Internal Event
      this.emitInternalEvent();
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for event propagation and setState

      if (this.state.internalStatus === 'Internal event received!') {
        messages.push('Internal event assertion passed.');
        console.log('[ManualEventElement] Assertion Passed: Internal event status is correct.');
      } else {
        allTestsPassed = false;
        messages.push(`Assertion failed: Internal event status is "${this.state.internalStatus}", expected "Internal event received!".`);
        console.error('[ManualEventElement] Assertion Failed:', messages[messages.length - 1]);
      }

      const result = {
        success: allTestsPassed,
        message: messages.join(' ')
      };
      this.setState({ testResult: result });
      // Assuming this.setState triggers a re-render
      // this.update ? this.update() : this.requestUpdate ? this.requestUpdate() : null;
      return result;
    }

    render() {
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
          button { /* General button styling */
            padding: 0.5rem 1rem;
            margin-right: 1rem;
            margin-bottom: 1rem;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            color: white; /* Default text color */
          }
          .native-button { background: var(--primary-color, #6200ea); }
          .internal-button { background: var(--info-color, #17a2b8); } /* Example color */
          .run-this-test-button { background: var(--secondary-color, #03dac6); } /* Example color */

          p { margin: 0.5rem 0; }

          .test-result { margin-top: 10px; padding: 10px; border: 1px solid #eee; border-radius: 5px;}
          .test-result h4 { margin-top: 0; margin-bottom: 5px; }
          .status-message { padding: 5px; border-radius: 3px; }
          .status-message.success { color: green; background-color: #e6ffe6; border: 1px solid green;}
          .status-message.failure { color: red; background-color: #ffe6e6; border: 1px solid red;}
          .status-message.not-run { color: orange; background-color: #fff0e0; border: 1px solid orange;}
        </style>

        <div>
          <button class="native-button">Dispatch Native Event</button>
          <button class="internal-button">Emit Internal Event</button>
          <button class="run-this-test-button">Run This Test</button>
          <p><strong>Native Event Status:</strong> ${this.state.nativeStatus || '(none)'}</p>
          <p><strong>Internal Event Status:</strong> ${this.state.internalStatus || '(none)'}</p>

          <div class="test-result">
            <h4>Test Result:</h4>
            <p class="status-message ${testResultStatusClass}">
              ${this.state.testResult.message}
            </p>
          </div>
        </div>
      `;
    }
  }

  if (!customElements.get('manual-event-element')) {
    customElements.define('manual-event-element', ManualEventElement);
    console.log('[ManualEventElement] Custom element defined by ManualEventElementBuilder.');
  }
  return ManualEventElement;
}