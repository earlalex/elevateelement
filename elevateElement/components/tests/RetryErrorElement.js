// elevateElement/components/RetryErrorElement.js

export function RetryErrorElementBuilder(ElevateElementClass) {
    class RetryErrorElement extends ElevateElementClass {
      constructor() {
        super('retry-error-element');
  
        this.state = {
          data: null,
          error: '',
          loading: false,
          testResult: { success: null, message: 'Test not run yet.' }
        };

        this._boundFetchData = (e) => this.fetchData(e);
        this._boundHandleRunThisTest = this.handleRunThisTest.bind(this);
      }
  
      async connectedCallback() { // Make async to await fetchData
        super.connectedCallback();
        console.log('[RetryErrorElement] connected');
        await this.fetchData(); // Wait for initial fetch to complete and state to set
        if (this.shadowRoot && typeof this.render === 'function') {
          this.shadowRoot.innerHTML = this.render();
        }
        this.attachEventHandlers();
      }
  
      disconnectedCallback() {
        console.log('[RetryErrorElement] disconnected');
        this.removeEventListeners();
        super.disconnectedCallback && super.disconnectedCallback();
      }

      attachEventHandlers() {
        if (!this.shadowRoot) return;
        const retryButton = this.shadowRoot.querySelector('.retry-button');
        const runTestButton = this.shadowRoot.querySelector('.run-this-test-button');

        if (retryButton) {
          retryButton.removeEventListener('click', this._boundFetchData);
          retryButton.addEventListener('click', this._boundFetchData);
        }
        if (runTestButton) {
          runTestButton.removeEventListener('click', this._boundHandleRunThisTest);
          runTestButton.addEventListener('click', this._boundHandleRunThisTest);
        }
      }

      removeEventListeners() {
        if (!this.shadowRoot) return;
        const retryButton = this.shadowRoot.querySelector('.retry-button');
        const runTestButton = this.shadowRoot.querySelector('.run-this-test-button');

        if (retryButton) {
          retryButton.removeEventListener('click', this._boundFetchData);
        }
        if (runTestButton) {
          runTestButton.removeEventListener('click', this._boundHandleRunThisTest);
        }
      }

      async handleRunThisTest() {
        try {
          await this.runTest();
        } catch (e) {
          this.setState({ testResult: { success: false, message: `Test execution error: ${e.message}` }});
          this.attachEventHandlers(); // Re-attach listeners
          console.error('[RetryErrorElement] Error during runTest from button:', e);
        }
      }
  
      async fetchData(e) {
        console.log('[RetryErrorElement] Fetching data...');
        this.setState({ loading: true, error: '', data: null });
        // No direct DOM manipulation here that would require immediate re-attach before try/catch
        // attachEventHandlers will be called after setState in success/error paths.
  
        try {
          const response = await fetch('https://jsonplaceholder.typicode.com/invalid-url');
          if (!response.ok) {
            // const errorText = await response.text(); // Not using errorText directly
            throw new Error(`Request failed: ${response.status}`);
          }
  
          const data = await response.json();
          console.log('[RetryErrorElement] Data fetched:', data);
          this.setState({ data, loading: false });
          this.attachEventHandlers();
        } catch (error) {
          console.error('[RetryErrorElement] Fetch error:', error);
          this.setState({ error: 'Failed to load data. Please try again.', loading: false });
          this.attachEventHandlers();
        }
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
              border: none;
              border-radius: 5px;
              cursor: pointer;
              margin-top: 1rem; /* Original margin-top for retry button */
              margin-right: 0.5rem; /* Space between buttons */
              color: white;
            }
            .retry-button {
              background: var(--primary-color, #6200ea);
            }
            .run-this-test-button {
              background: var(--secondary-color, #03dac6); /* Example color */
               /* margin-top: 1rem; Ensure alignment if needed */
            }
            pre {
              background: #f5f5f5;
              padding: 1rem;
              border-radius: 5px;
              overflow: auto;
              border: 1px solid #ddd;
            }
            p.error {
              color: var(--error-color, red);
            }
            .test-result {
              margin-top: 10px;
              padding: 10px;
              border: 1px solid #eee;
              border-radius: 5px;
            }
            .test-result h4 { margin-top: 0; margin-bottom: 5px; }
            .status-message { padding: 5px; border-radius: 3px; }
            .status-message.success { color: green; background-color: #e6ffe6; border: 1px solid green; }
            .status-message.failure { color: red; background-color: #ffe6e6; border: 1px solid red;}
            .status-message.not-run { color: orange; background-color: #fff0e0; border: 1px solid orange;}
          </style>
  
          <div>
            ${this.state.loading
              ? `<p>Loading...</p>`
              : this.state.error
                ? `
                  <p class="error">${this.state.error}</p>
                  <button class="retry-button">Retry</button>
                `
                : this.state.data
                  ? `<pre>${JSON.stringify(this.state.data, null, 2)}</pre>`
                  : `<p>No data loaded yet.</p>`
            }
            <button class="run-this-test-button">Run This Test</button>

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
        console.log('[RetryErrorElement] Starting test (error path)...');
        await this.fetchData();
  
        let testResultObj = { success: false, message: '' };
        let assertionsPassed = true;
        let assertionMessages = [];

        if (this.state.error !== 'Failed to load data. Please try again.') {
          assertionsPassed = false;
          assertionMessages.push(`Error message mismatch. Expected: "Failed to load data. Please try again.", Got: "${this.state.error}"`);
        }
        if (this.state.loading !== false) {
          assertionsPassed = false;
          assertionMessages.push(`Loading state incorrect. Expected: false, Got: ${this.state.loading}`);
        }
        if (this.state.data !== null) {
          assertionsPassed = false;
          assertionMessages.push(`Data state incorrect. Expected: null, Got: ${JSON.stringify(this.state.data)}`);
        }

        if (assertionsPassed) {
          testResultObj.success = true;
          testResultObj.message = 'RetryErrorElement test (error path) passed.';
          console.log('[RetryErrorElement] Assertions Passed:', testResultObj.message);
        } else {
          testResultObj.message = 'RetryErrorElement test (error path) failed: ' + assertionMessages.join('; ');
          console.error('[RetryErrorElement] Assertions Failed:', testResultObj.message);
        }

        this.setState({ testResult: testResultObj });
        this.attachEventHandlers();
        return testResultObj;
      }
    } // End of RetryErrorElement class definition

    // Builder function continues here
    if (!customElements.get('retry-error-element')) {
      customElements.define('retry-error-element', RetryErrorElement);
      console.log('[RetryErrorElement] Custom element defined by RetryErrorElementBuilder.');
    }
    return RetryErrorElement;
  }
// Removed the misplaced runTest and render methods from here