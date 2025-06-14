// elevateElement/components/tests/ErrorTestElement.js
import { BaseComponentUtils } from '../../utils/baseComponent.js';
import { createBaseComponent } from '../BaseComponent.js';

export function ErrorTestElementBuilder(ElevateElement) {
  // Create a BaseComponent specific to this test
  const BaseComponent = createBaseComponent(ElevateElement);
  
  class ErrorTestElement extends BaseComponent {
    constructor() {
      super('error-test-element');
      
      this.state = {
        error: '',
        loading: false,
        attempts: 0,
        testResult: { success: null, message: 'Test not run yet.' } // Initial state for test result
      };
    }

    connectedCallback() {
      super.connectedCallback();
      console.log('[ErrorTestElement] connected');
      // Ensure event handlers are attached if not using a declarative event system from BaseComponent
      if (!this.eventSubscriptions || Object.keys(this.eventSubscriptions).length === 0) {
        this.attachEventHandlers();
      }
    }

    attachEventHandlers() {
      // It's crucial that this method can be called multiple times without duplicating listeners,
      // or is called only once. BaseComponentUtils.attachEventHandlers should ideally handle this.
      // If not, manual .removeEventListener before .addEventListener might be needed if called multiple times.
      BaseComponentUtils.attachEventHandlers(this, {
        '.trigger-error-button': this.triggerError,
        '.run-this-test-button': async () => { // Make the handler async to await runTest
          try {
            await this.runTest(); // runTest updates state internally
          } catch (e) {
            console.error('[ErrorTestElement] Error running test from button:', e);
            // Optionally update UI to show this specific error
            this.setState({
              testResult: { success: false, message: `Test execution error: ${e.message}` }
            });
          }
        }
      });
    }

    disconnectedCallback() {
      console.log('[ErrorTestElement] disconnected');
      super.disconnectedCallback();
    }

    async triggerError() {
      console.log('[ErrorTestElement] Intentionally triggering fetch error...');
      this.state.loading = true;
      this.state.error = '';
      this.state.attempts++;
      // No updateUI() here, runTest will manage UI after assertions

      try {
        // This will fail - intentionally using a bad URL
        const response = await fetch('https://jsonplaceholder.typicode.com/invalid-endpoint');
        // We shouldn't get here if the fetch fails as expected
        const data = await response.json();
        this.state.error = 'Unexpectedly succeeded! Fetch should have failed.';
        this.state.loading = false;
        this.updateUI(); // Update UI to show unexpected success
        return { success: false, message: 'Assertion failed: Fetch unexpectedly succeeded.' };
      } catch (error) {
        console.error('[ErrorTestElement] Expected error caught:', error);
        this.state.error = `Fetch failed as expected (Attempt #${this.state.attempts})`;
        this.state.loading = false;
        // Assertions are now part of runTest, but we set state here
      }
      // No updateUI() here, runTest will manage UI after assertions
      // This method's return value is not directly used by runTest for assertions,
      // but runTest will check the state set by this method.
      return { success: true, message: 'Error triggered successfully, state updated for assertion.' };
    }

    async runTest() {
      console.log('[ErrorTestElement] Starting test...');
      await this.triggerError(); // Call triggerError and wait for it to complete

      // Assertions
      let result = { success: false, message: '' }; // Renamed to avoid conflict with this.state.testResult

      if (this.state.error && this.state.error.includes('Fetch failed as expected')) {
        if (this.state.loading === false) {
          result.success = true;
          result.message = 'Error test passed: Error message is correct and loading is false.';
          console.log('[ErrorTestElement] Assertion Passed:', result.message);
        } else {
          result.message = 'Assertion failed: loading state is true after error.';
          console.error('[ErrorTestElement] Assertion Failed:', result.message);
        }
      } else {
        result.message = `Assertion failed: error message is "${this.state.error}", expected it to include "Fetch failed as expected".`;
        console.error('[ErrorTestElement] Assertion Failed:', result.message);
      }
      
      this.setState({ testResult: result }); // Update state with the test result
      // updateUI will be called by setState if it's part of the BaseComponent logic,
      // otherwise, if BaseComponent.setState doesn't trigger re-render, uncomment below.
      // this.updateUI();
      return result; // Still return the result for programmatic use
    }

    template() {
      const testResultStatusClass = this.state.testResult.success === true
        ? 'success'
        : this.state.testResult.success === false
          ? 'failure'
          : 'not-run';

      return `
        <div class="error-test-container">
          <h3>Error Test</h3>
          <p>This component tests error handling by making an invalid request.</p>
          
          <button class="trigger-error-button" type="button">Trigger Fetch Error</button>
          <button class="run-this-test-button" type="button">Run This Test</button>

          <div class="status ${this.state.loading ? 'loading' : this.state.error ? 'error' : ''}">
            ${this.state.loading
              ? `<p>Loading...</p>`
              : this.state.error
                ? `<p>${this.state.error}</p>`
                : `<p>No errors triggered yet. Click the button to test error handling.</p>`
            }
          </div>

          <div class="test-result">
            <h4>Test Result:</h4>
            <p class="status-message ${testResultStatusClass}">
              ${this.state.testResult.message}
            </p>
          </div>
        </div>
      `;
    }

    styles() {
      // Keeping original styles, adding new ones for test results
      const originalStyles = `
        .error-test-container {
          padding: var(--space-lg);
          margin: var(--space-md) 0;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--elevation-1);
          transition: transform var(--duration-medium) var(--easing-standard),
                    box-shadow var(--duration-medium) var(--easing-standard);
        }
        
        h3, h4 { /* Apply to h4 as well */
          color: var(--color-on-surface-high);
          margin-top: 0;
          margin-bottom: var(--space-sm);
          font-weight: var(--weight-medium);
          letter-spacing: var(--letter-spacing-tight);
          font-family: var(--font-display);
        }
        
        p {
          margin-bottom: var(--space-md);
          color: var(--color-on-surface-medium);
        }
        
        .trigger-error-button, .run-this-test-button { /* Apply to new button */
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-xs) var(--space-md);
          border: none;
          border-radius: var(--radius-md);
          font-family: var(--font-sans);
          font-size: var(--font-sm);
          font-weight: var(--weight-medium);
          cursor: pointer;
          pointer-events: auto !important;
          transition: background-color var(--duration-short) var(--easing-standard),
                      box-shadow var(--duration-short) var(--easing-standard),
                      transform var(--duration-short) var(--easing-standard);
          box-shadow: var(--elevation-1);
          margin-bottom: var(--space-md);
          margin-right: var(--space-sm); /* Add some margin between buttons */
          min-height: 44px;
          z-index: 1;
        }

        .trigger-error-button {
          background-color: var(--color-error);
          color: var(--color-on-error);
        }

        .run-this-test-button {
          background-color: var(--color-secondary); /* Example color */
          color: var(--color-on-secondary);
        }
        
        .trigger-error-button:hover {
          background-color: var(--color-error-light);
          box-shadow: var(--elevation-2);
          transform: translateY(-2px);
        }

        .run-this-test-button:hover {
          background-color: var(--color-secondary-dark); /* Example hover color */
          box-shadow: var(--elevation-2);
          transform: translateY(-2px);
        }
        
        .trigger-error-button:active, .run-this-test-button:active {
          transform: translateY(0);
          box-shadow: var(--elevation-1);
        }
        
        .status {
          margin: var(--space-md) 0;
          padding: var(--space-md);
          border-radius: var(--radius-sm);
          background-color: var(--color-surface-variant);
        }
        
        .status.loading {
          background-color: rgba(10, 132, 255, 0.1);
          color: var(--color-info);
          border: 1px solid rgba(10, 132, 255, 0.2);
        }
        
        .status.error {
          background-color: rgba(255, 59, 48, 0.1);
          color: var(--color-error);
          border: 1px solid rgba(255, 59, 48, 0.2);
        }

        .test-result {
          margin-top: var(--space-lg);
          padding: var(--space-md);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
        }

        .test-result h4 {
          margin-bottom: var(--space-xs);
        }

        .status-message {
          padding: var(--space-sm);
          border-radius: var(--radius-xs);
        }

        .status-message.success {
          background-color: rgba(40, 167, 69, 0.1); /* Light green */
          color: var(--color-success, #198754);
          border: 1px solid rgba(40, 167, 69, 0.2);
        }

        .status-message.failure {
          background-color: rgba(220, 53, 69, 0.1); /* Light red */
          color: var(--color-error, #dc3545);
          border: 1px solid rgba(220, 53, 69, 0.2);
        }

        .status-message.not-run {
          background-color: rgba(108, 117, 125, 0.1); /* Light gray */
          color: var(--color-on-surface-medium, #6c757d);
          border: 1px solid rgba(108, 117, 125, 0.2);
        }
      `;
      return originalStyles;
    }
  }

  // Define the element if it doesn't exist
  if (!customElements.get('error-test-element')) {
    customElements.define('error-test-element', ErrorTestElement);
    console.log('[ErrorTestElement] Custom element defined by ErrorTestElementBuilder.');
  }
  // The builder's responsibility is now just to define the element and return the class.
  // Test execution will be handled externally (e.g., by Tests.js).
  return ErrorTestElement;
}