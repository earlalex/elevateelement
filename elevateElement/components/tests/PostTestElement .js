// elevateElement/components/PostTestElement.js

export function PostTestElementBuilder(ElevateElementClass) {
    class PostTestElement extends ElevateElementClass {
      constructor() {
        super('post-test-element');
  
        this.state = {
          response: null,
          loading: false,
          error: ''
        };
      }
  
      connectedCallback() {
        super.connectedCallback();
        console.log('[PostTestElement] connected');
      }
  
      disconnectedCallback() {
        console.log('[PostTestElement] disconnected');
        super.disconnectedCallback && super.disconnectedCallback();
      }
  
      events() {
        return {
          click: {
            '.post-button': (e) => this.sendPost(e),
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
          this.setState({ response: JSON.stringify(data, null, 2), loading: false });
        } catch (err) {
          console.error('[PostTestElement] POST error:', err);
          this.setState({ error: err.message, loading: false });
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
              margin-bottom: 1rem;
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
            <button class="post-button">Send Test Post</button>
  
            ${this.state.loading
              ? `<p>Loading...</p>`
              : this.state.error
                ? `<p class="error">${this.state.error}</p>`
                : this.state.response
                  ? `<pre>${this.state.response}</pre>`
                  : `<p>No response yet.</p>`}
          </div>
        `;
      }
    }
  
    customElements.define('post-test-element', PostTestElement);
  }