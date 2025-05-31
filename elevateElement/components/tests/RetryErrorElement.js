// elevateElement/components/RetryErrorElement.js

export function RetryErrorElementBuilder(ElevateElementClass) {
    class RetryErrorElement extends ElevateElementClass {
      constructor() {
        super('retry-error-element');
  
        this.state = {
          data: null,
          error: '',
          loading: false
        };
      }
  
      connectedCallback() {
        super.connectedCallback();
        console.log('[RetryErrorElement] connected');
        this.fetchData(); // Try fetching when mounted
      }
  
      disconnectedCallback() {
        console.log('[RetryErrorElement] disconnected');
        super.disconnectedCallback && super.disconnectedCallback();
      }
  
      events() {
        return {
          click: {
            '.retry-button': (e) => this.fetchData(e),
            _options: { passive: true }
          }
        };
      }
  
      async fetchData(e) {
        console.log('[RetryErrorElement] Fetching data...');
        this.setState({ loading: true, error: '', data: null });
  
        try {
          const response = await fetch('https://jsonplaceholder.typicode.com/invalid-url');
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed: ${response.status}`);
          }
  
          const data = await response.json();
          console.log('[RetryErrorElement] Data fetched:', data);
          this.setState({ data, loading: false });
        } catch (error) {
          console.error('[RetryErrorElement] Fetch error:', error);
          this.setState({ error: 'Failed to load data. Please try again.', loading: false });
        }
      }
  
      render() {
        return `
          <style>
            :host {
              display: block;
              font-family: sans-serif;
              padding: 1rem;
            }
            button {
              padding: 0.5rem 1rem;
              background: var(--primary-color, #6200ea);
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              margin-top: 1rem;
            }
            pre {
              background: #f5f5f5;
              padding: 1rem;
              border-radius: 5px;
              overflow: auto;
            }
            p.error {
              color: red;
            }
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
          </div>
        `;
      }
    }
  
    customElements.define('retry-error-element', RetryErrorElement);
  }