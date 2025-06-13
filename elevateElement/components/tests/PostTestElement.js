// elevateElement/components/PostTestElement.js

export function PostTestElementBuilder(ElevateElementClass) {
    class PostTestElement extends ElevateElementClass {
      constructor() {
        super('post-test-element');

        this.state = {
          response: null,
          loading: false,
          error: '',
          testResult: { success: null, message: 'Test not run yet.' }
        };

        this._boundSendPost = (e) => this.sendPost(e);
        this._boundHandleRunThisTest = this.handleRunThisTest.bind(this);
      }

      connectedCallback() {
        super.connectedCallback();
        console.log('[PostTestElement] connected');
        if (this.shadowRoot && typeof this.render === 'function') {
          this.shadowRoot.innerHTML = this.render();
        }
        this.attachEventHandlers();
      }

      disconnectedCallback() {
        console.log('[PostTestElement] disconnected');
        this.removeEventListeners();
        super.disconnectedCallback && super.disconnectedCallback();
      }

      attachEventHandlers() {
        if (!this.shadowRoot) return;
        const postButton = this.shadowRoot.querySelector('.post-button');
        const runTestButton = this.shadowRoot.querySelector('.run-this-test-button');

        if (postButton) {
          postButton.removeEventListener('click', this._boundSendPost);
          postButton.addEventListener('click', this._boundSendPost);
        }
        if (runTestButton) {
          runTestButton.removeEventListener('click', this._boundHandleRunThisTest);
          runTestButton.addEventListener('click', this._boundHandleRunThisTest);
        }
      }

      removeEventListeners() {
        if (!this.shadowRoot) return;
        const postButton = this.shadowRoot.querySelector('.post-button');
        const runTestButton = this.shadowRoot.querySelector('.run-this-test-button');

        if (postButton) {
          postButton.removeEventListener('click', this._boundSendPost);
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
          this.attachEventHandlers(); // Re-attach listeners
          console.error('[PostTestElement] Error during runTest from button:', e);
        }
      }

      async sendPost(e) {
        console.log('[PostTestElement] Sending POST request...');
        this.setState({ loading: true, error: '', response: null });
        this.attachEventHandlers(); // Re-attach as DOM might change (e.g. loading indicator)

        try {
          const payload = {
            title: 'foo',
            body: 'bar',
            userId: 1
          };

          const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed: ${response.status} ${response.statusText}\n${errorText}`);
          }

          const data = await response.json();
          console.log('[PostTestElement] POST response:', data);
          // Store raw data object for easier assertion, and stringify for display
          this.rawResponse = data; // Store for assertion
          this.setState({ response: JSON.stringify(data, null, 2), loading: false, error: '' });
          this.attachEventHandlers();
        } catch (err) {
          console.error('[PostTestElement] POST error:', err);
          this.rawResponse = null; // Clear previous response on error
          this.setState({ error: err.message, loading: false, response: null });
          this.attachEventHandlers();
        }
      }

      async runTest() {
        console.log('[PostTestElement] Starting test...');
        // Resetting testResult before running the test to clear previous results from UI
        this.setState({ testResult: { success: null, message: 'Test running...' } });
        this.attachEventHandlers();
        await new Promise(resolve => setTimeout(resolve, 0)); // Allow DOM to update if setState is async

        await this.sendPost(); // Call sendPost and wait for it to complete

        let testResult = { success: false, message: '' };

        if (this.state.loading) {
          testResult.message = 'Assertion failed: loading is still true after sendPost.';
          console.error('[PostTestElement] Assertion Failed:', testResult.message);
          // No need for this.update or this.requestUpdate if setState handles rendering
          // and attachEventHandlers is called after setState.
          this.setState({ testResult: testResult });
          this.attachEventHandlers();
          return testResult;
        }

        if (this.state.error) {
          testResult.message = `Assertion failed: Post operation resulted in an error: ${this.state.error}`;
          console.error('[PostTestElement] Assertion Failed:', testResult.message);
        } else if (this.rawResponse) {
          const responseData = this.rawResponse;

          if (responseData.title === 'foo' && responseData.hasOwnProperty('id')) {
            if (!this.state.error && !this.state.loading) {
              testResult.success = true;
              testResult.message = 'Post test passed: Response data is correct, error is empty, and loading is false.';
              console.log('[PostTestElement] Assertion Passed:', testResult.message);
            } else {
              testResult.message = `Assertion failed: Post conditions not met. Error: "${this.state.error}", Loading: ${this.state.loading}`;
              console.error('[PostTestElement] Assertion Failed:', testResult.message);
            }
          } else {
            testResult.message = `Assertion failed: Response data incorrect. Title: "${responseData.title}", ID present: ${responseData.hasOwnProperty('id')}`;
            console.error('[PostTestElement] Assertion Failed:', testResult.message);
          }
        } else {
          testResult.message = 'Assertion failed: No response data found after post operation and no error reported.';
          console.error('[PostTestElement] Assertion Failed:', testResult.message);
        }

        this.setState({ testResult: testResult });
        this.attachEventHandlers();
        return testResult;
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
              margin-bottom: 1rem;
              margin-right: 0.5rem; /* Space between buttons */
              color: white; /* Default text color for buttons */
            }
            .post-button {
              background: var(--primary-color, #6200ea);
            }
            .run-this-test-button {
              background: var(--secondary-color, #03dac6); /* Example color */
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
            <button class="post-button">Send Test Post</button>
            <button class="run-this-test-button">Run This Test</button>

            ${this.state.loading
              ? `<p>Loading...</p>`
              : this.state.error
                ? `<p class="error">${this.state.error}</p>`
                : this.state.response
                  ? `<pre>${this.state.response}</pre>`
                  : `<p>No response yet.</p>`}

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

    if (!customElements.get('post-test-element')) {
      customElements.define('post-test-element', PostTestElement);
      console.log('[PostTestElement] Custom element defined by PostTestElementBuilder.');
    }
    return PostTestElement;
  }
