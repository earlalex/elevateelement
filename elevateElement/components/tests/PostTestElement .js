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
      }
  
      connectedCallback() {
        super.connectedCallback();
        console.log('[PostTestElement] connected');
        // Assuming ElevateElementClass base handles event delegation setup from events()
        // or requires manual setup if not. If events() is standard, this should be fine.
      }
  
      disconnectedCallback() {
        console.log('[PostTestElement] disconnected');
        super.disconnectedCallback && super.disconnectedCallback();
      }
  
      async handleRunThisTest() {
        try {
          await this.runTest();
        } catch (e) {
          this.setState({ testResult: { success: false, message: `Test execution error: ${e.message}` } });
          console.error('[PostTestElement] Error during runTest from button:', e);
        }
      }

      events() {
        return {
          click: {
            '.post-button': (e) => this.sendPost(e),
            '.run-this-test-button': () => this.handleRunThisTest(),
            _options: { passive: true }
          }
        };
      }
  
      async sendPost(e) {
        console.log('[PostTestElement] Sending POST request...');
        this.setState({ loading: true, error: '', response: null });
  
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
        } catch (err) {
          console.error('[PostTestElement] POST error:', err);
          this.rawResponse = null; // Clear previous response on error
          this.setState({ error: err.message, loading: false, response: null });
        }
      }

      async runTest() {
        console.log('[PostTestElement] Starting test...');
        await this.sendPost(); // Call sendPost and wait for it to complete

        let testResult = { success: false, message: '' };

        if (this.state.loading) {
          testResult.message = 'Assertion failed: loading is still true after sendPost.';
          console.error('[PostTestElement] Assertion Failed:', testResult.message);
          // Update UI to reflect this unexpected state if necessary
          this.update ? this.update() : this.requestUpdate ? this.requestUpdate() : null;
          return testResult;
        }

        if (this.state.error) {
          // This path is for unexpected errors during the post request itself.
          // A specific test for error *handling* would be different.
          testResult.message = `Assertion failed: Post operation resulted in an error: ${this.state.error}`;
          console.error('[PostTestElement] Assertion Failed:', testResult.message);
        } else if (this.rawResponse) {
          const responseData = this.rawResponse; // Use the stored raw object

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

        const result = testResult; // Use a different name to avoid confusion if runTest is called again
        this.setState({ testResult: result });
        // Assuming this.setState triggers a re-render (e.g., via requestUpdate in LitElement based classes)
        // If not, uncomment: this.update ? this.update() : this.requestUpdate ? this.requestUpdate() : null;
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