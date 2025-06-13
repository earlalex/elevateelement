// elevateElement/components/tests/TestElement.js

import { BaseComponentUtils } from '../../utils/baseComponent.js';
import { createBaseComponent } from '../BaseComponent.js';

export function TestElementBuilder(ElevateElement) {
  // Create a BaseComponent specific to this test
  const BaseComponent = createBaseComponent(ElevateElement);
  
  class TestElement extends BaseComponent {
    constructor() {
      super('test-element');
      this.state = {
        currentStatus: 'OK',
        testResult: { success: null, message: 'Test not run yet.' }
      };

      this._boundRunTest = this.runTest.bind(this);
      this._boundTestAction = this.testAction.bind(this);
    }

    connectedCallback() {
      super.connectedCallback();
      console.log('[TestElement] connected');
      // Initial render
      if (typeof this.updateUI === 'function') {
        this.updateUI();
      } else if (typeof this.render === 'function' && this.shadowRoot) { // Assuming render is the template method name
        this.shadowRoot.innerHTML = this.render();
      } else if (typeof this.template === 'function' && this.shadowRoot) { // Fallback if template is used
        this.shadowRoot.innerHTML = this.template();
      }
      this.attachEventHandlers();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      console.log('[TestElement] disconnected');
      this.removeEventListeners();
    }

    attachEventHandlers() {
      if (!this.shadowRoot) return;

      const testButton = this.shadowRoot.querySelector('.test-button');
      if (testButton) {
        testButton.removeEventListener('click', this._boundTestAction);
        testButton.addEventListener('click', this._boundTestAction);
      }

      const runTestButton = this.shadowRoot.querySelector('.run-this-test-button');
      if (runTestButton) {
        runTestButton.removeEventListener('click', this._boundRunTest);
        runTestButton.addEventListener('click', this._boundRunTest);
      }
    }

    removeEventListeners() {
      if (!this.shadowRoot) return;
      const testButton = this.shadowRoot.querySelector('.test-button');
      if (testButton) {
        testButton.removeEventListener('click', this._boundTestAction);
      }
      const runTestButton = this.shadowRoot.querySelector('.run-this-test-button');
      if (runTestButton) {
        runTestButton.removeEventListener('click', this._boundRunTest);
      }
    }

    testAction() {
      this.state.currentStatus = this.state.currentStatus === 'OK' ? 'TESTING' : 'OK';
      if (typeof this.updateUI === 'function') {
        this.updateUI();
      } else if (typeof this.render === 'function' && this.shadowRoot) { // Assuming render is the template method name
        this.shadowRoot.innerHTML = this.render();
      } else if (typeof this.template === 'function' && this.shadowRoot) { // Fallback if template is used
        this.shadowRoot.innerHTML = this.template();
      }
      this.attachEventHandlers(); // Re-attach listeners
    }

    async runTest() {
      console.log('[TestElement] Starting test...');
      const initialStatus = this.state.currentStatus;
      this.testAction(); // Call the existing action to change status

      await new Promise(resolve => setTimeout(resolve, 0));

      if (this.state.currentStatus !== initialStatus) {
        this.state.testResult = { success: true, message: `Test action successfully changed status from ${initialStatus} to ${this.state.currentStatus}.` };
      } else {
        this.state.testResult = { success: false, message: `Test action failed to change status from ${initialStatus}.` };
      }

      console.log(`[TestElement] Test result: ${this.state.testResult.message}`);

      if (typeof this.updateUI === 'function') {
        this.updateUI();
      } else if (typeof this.render === 'function' && this.shadowRoot) { // Assuming render is the template method name
        this.shadowRoot.innerHTML = this.render();
      } else if (typeof this.template === 'function' && this.shadowRoot) { // Fallback if template is used
        this.shadowRoot.innerHTML = this.template();
      }
      this.attachEventHandlers(); // Re-attach listeners

      return this.state.testResult;
    }

    // Assuming the main render method is `template` as per original code, renaming to `render` for consistency with MinimalBaseClass
    render() {
      const testResultStatusClass = this.state.testResult.success === true
        ? 'success'
        : this.state.testResult.success === false
          ? 'failure'
          : 'not-run';
      const currentStatusClass = this.getStatusClass(); // Use currentStatus for the main status display

      return `
        <div class="test-element-container">
          <div class="header">
            <slot name="header">
              <h2>Default Test Element</h2>
            </slot>
          </div>
          <div class="content">
            <p>Current Status: <span class="status ${currentStatusClass}">${this.state.currentStatus}</span></p>
            <slot></slot>
          </div>
          <div class="footer">
            <slot name="footer">
              <button class="test-button">Toggle Status</button>
              <button class="run-this-test-button" type="button">Run This Test</button>
            </slot>
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
      // CSS variables are now included by BaseComponentUtils
      // Added test-result styles
      return `
        .test-element-container {
          padding: var(--space-lg);
          margin: var(--space-md) 0;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--elevation-1);
          transition: transform var(--duration-medium) var(--easing-standard),
                     box-shadow var(--duration-medium) var(--easing-standard);
        }
        
        .test-element-container:hover {
          transform: translateY(-3px);
          box-shadow: var(--elevation-2);
        }
        
        h2 {
          color: var(--color-on-surface-high);
          margin-top: 0;
          margin-bottom: var(--space-sm);
          font-weight: var(--weight-medium);
          letter-spacing: var(--letter-spacing-tight);
        }
        
        p {
          margin-bottom: var(--space-md);
          color: var(--color-on-surface-medium);
        }
        
        strong {
          color: var(--color-primary);
          font-weight: var(--weight-medium);
        }
        
        .status {
          /* margin: var(--space-md) 0; */ /* Adjusted to be inline */
          padding: 0.2rem 0.5rem; /* Smaller padding for inline status */
          border-radius: var(--radius-sm);
          font-weight: var(--weight-medium);
          display: inline-block; /* For inline display with background */
        }
        
        .status.ok {
          background-color: rgba(48, 209, 88, 0.1);
          color: var(--color-success);
          border: 1px solid rgba(48, 209, 88, 0.2);
        }
        
        .status.warning {
          background-color: rgba(255, 149, 0, 0.1);
          color: var(--color-warning);
          border: 1px solid rgba(255, 149, 0, 0.2);
        }
        
        .status.error {
          background-color: rgba(255, 59, 48, 0.1);
          color: var(--color-error);
          border: 1px solid rgba(255, 59, 48, 0.2);
        }
        
        .status.testing {
          background-color: rgba(10, 132, 255, 0.1);
          color: var(--color-info);
          border: 1px solid rgba(10, 132, 255, 0.2);
        }
        
        .test-button, .run-this-test-button { /* Shared style for buttons */
          position: relative;
          display: inline-block;
          padding: var(--space-xs) var(--space-md);
          color: var(--color-on-primary);
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
          margin-top: var(--space-md);
          margin-right: var(--space-sm); /* Space between buttons */
          z-index: 1;
        }

        .test-button { /* Specific color for original button */
          background-color: var(--color-primary);
        }
        .run-this-test-button { /* Specific color for new test button */
           background-color: var(--color-secondary, #03dac6); /* Default if secondary is not set */
           color: var(--color-on-secondary, white); /* Default if on-secondary is not set */
        }
        
        .test-button:hover {
          background-color: var(--color-primary-dark);
          box-shadow: var(--elevation-2);
          transform: translateY(-2px);
        }
        .run-this-test-button:hover {
          background-color: var(--color-secondary-dark, #018786); /* Default if secondary-dark is not set */
          box-shadow: var(--elevation-2);
          transform: translateY(-2px);
        }
        
        .test-button:active, .run-this-test-button:active {
          transform: translateY(0);
          box-shadow: var(--elevation-1);
        }

        .test-result { margin-top: 10px; padding: 10px; border: 1px solid #eee; border-radius: 5px;}
        .test-result h4 { margin-top: 0; margin-bottom: 5px; }
        .status-message { padding: 5px; border-radius: 3px; }
        .status-message.success { color: green; background-color: #e6ffe6; border: 1px solid green;}
        .status-message.failure { color: red; background-color: #ffe6e6; border: 1px solid red;}
        .status-message.not-run { color: orange; background-color: #fff0e0; border: 1px solid orange;}
      `;
    }
    
    // Helper methods
    getStatusClass() {
      switch(this.state.currentStatus) { // Use this.state.currentStatus
        case 'OK': return 'ok';
        case 'TESTING': return 'testing';
        case 'WARNING': return 'warning';
        case 'ERROR': return 'error';
        default: return 'ok';
      }
    }
  }
  
  // Define the element if it doesn't exist
  if (!customElements.get('test-element')) {
    customElements.define('test-element', TestElement);
    console.log('[TestElement] Custom element defined');
  }
  
  return TestElement;
}