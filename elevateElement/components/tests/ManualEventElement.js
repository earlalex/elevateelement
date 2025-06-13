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

      // Bind methods for event handlers
      this._boundDispatchNativeEvent = this.dispatchNativeEvent.bind(this);
      this._boundEmitInternalEvent = this.emitInternalEvent.bind(this);
      this._boundHandleRunThisTest = this.handleRunThisTest.bind(this);
    }

    connectedCallback() {
      super.connectedCallback();
      console.log('[ManualEventElement] connected');

      this._boundNativeEventListener = (e) => {
        console.log('[ManualEventElement] Native event caught:', e);
        this.setState({ nativeStatus: 'Native event received!' });
        this.attachEventHandlers(); // Re-attach button listeners
      };
      this.addEventListener('manual-native', this._boundNativeEventListener);

      if (typeof this.on === 'function') {
        this._boundInternalEventListener = (detail) => {
          console.log('[ManualEventElement] Internal event caught:', detail);
          this.setState({ internalStatus: 'Internal event received!' });
          this.attachEventHandlers(); // Re-attach button listeners
        };
        this.on('manual-internal', this._boundInternalEventListener);
      } else {
        console.warn('[ManualEventElement] this.on() is not a function. Internal event listening disabled.');
      }
      this.attachEventHandlers(); // Attach button listeners
    }

    disconnectedCallback() {
      console.log('[ManualEventElement] disconnected');
      if (this._boundNativeEventListener) {
        this.removeEventListener('manual-native', this._boundNativeEventListener);
      }
      if (typeof this.off === 'function' && this._boundInternalEventListener) {
        this.off('manual-internal', this._boundInternalEventListener);
      }
      this.removeEventListeners(); // Remove button listeners
      super.disconnectedCallback && super.disconnectedCallback();
    }

    attachEventHandlers() {
      if (!this.shadowRoot) return;
      const nativeButton = this.shadowRoot.querySelector('.native-button');
      const internalButton = this.shadowRoot.querySelector('.internal-button');
      const runTestButton = this.shadowRoot.querySelector('.run-this-test-button');

      if (nativeButton) {
        nativeButton.removeEventListener('click', this._boundDispatchNativeEvent);
        nativeButton.addEventListener('click', this._boundDispatchNativeEvent);
      }
      if (internalButton) {
        internalButton.removeEventListener('click', this._boundEmitInternalEvent);
        internalButton.addEventListener('click', this._boundEmitInternalEvent);
      }
      if (runTestButton) {
        runTestButton.removeEventListener('click', this._boundHandleRunThisTest);
        runTestButton.addEventListener('click', this._boundHandleRunThisTest);
      }
    }

    removeEventListeners() {
      if (!this.shadowRoot) return;
      const nativeButton = this.shadowRoot.querySelector('.native-button');
      const internalButton = this.shadowRoot.querySelector('.internal-button');
      const runTestButton = this.shadowRoot.querySelector('.run-this-test-button');

      if (nativeButton) {
        nativeButton.removeEventListener('click', this._boundDispatchNativeEvent);
      }
      if (internalButton) {
        internalButton.removeEventListener('click', this._boundEmitInternalEvent);
      }
      if (runTestButton) {
        runTestButton.removeEventListener('click', this._boundHandleRunThisTest);
      }
    }

    async handleRunThisTest() {
        try {
            await this.runTest();
        } catch (e) {
            this.setState({ testResult: { success: false, message: `Test execution error: ${e.message}` } });
            this.attachEventHandlers(); // Re-attach button listeners
            console.error('[ManualEventElement] Error during runTest from button:', e);
        }
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
      if (typeof this.emit === 'function') {
        this.emit('manual-internal', { source: 'internal' });
      } else {
        console.warn('[ManualEventElement] this.emit() is not a function. Cannot emit internal event.');
        // Optionally update state to reflect this if the test needs to show it
        this.setState({ internalStatus: 'Internal event emit skipped (no this.emit)' });
        this.attachEventHandlers();
      }
    }

    async runTest() {
      console.log('[ManualEventElement] Starting test...');
      let allTestsPassed = true;
      let messages = [];

      // Reset statuses
      this.setState({ nativeStatus: '', internalStatus: '', testResult: { success: null, message: 'Test running...' } });
      this.attachEventHandlers(); // Re-attach as setState would have re-rendered.
      await new Promise(resolve => setTimeout(resolve, 0));


      // Test Native Event
      this.dispatchNativeEvent();
      await new Promise(resolve => setTimeout(resolve, 50)); // Wait for event propagation and setState

      if (this.state.nativeStatus === 'Native event received!') {
        messages.push('Native event assertion passed.');
        console.log('[ManualEventElement] Assertion Passed: Native event status is correct.');
      } else {
        allTestsPassed = false;
        messages.push(`Assertion failed: Native event status is "${this.state.nativeStatus}", expected "Native event received!".`);
        console.error('[ManualEventElement] Assertion Failed:', messages[messages.length - 1]);
      }

      // Test Internal Event
      if (typeof this.on === 'function' && typeof this.emit === 'function') {
        this.emitInternalEvent();
        await new Promise(resolve => setTimeout(resolve, 50)); // Wait for event propagation and setState

        if (this.state.internalStatus === 'Internal event received!') {
          messages.push('Internal event assertion passed.');
          console.log('[ManualEventElement] Assertion Passed: Internal event status is correct.');
        } else {
          allTestsPassed = false;
          messages.push(`Assertion failed: Internal event status is "${this.state.internalStatus}", expected "Internal event received!".`);
          console.error('[ManualEventElement] Assertion Failed:', messages[messages.length - 1]);
        }
      } else {
        messages.push('Internal event test skipped (this.on or this.emit not available).');
        console.warn('[ManualEventElement] Skipping internal event test as this.on or this.emit is not available.');
        // Not failing the test, but noting it was skipped.
      }

      const result = {
        success: allTestsPassed,
        message: messages.join(' ')
      };
      this.setState({ testResult: result });
      this.attachEventHandlers(); // Re-attach button listeners
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