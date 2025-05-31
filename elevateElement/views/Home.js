import { renderView } from '../utils/index.js';

export const Home = {
    path: '/',
    title: 'Home',
    contentRendered: false,
    content: `
        <div class="home-container">
            <section class="hero-section">
                <h1>ElevateElement Framework</h1>
                <p class="tagline">"Closer to the metal, infinitely flexible, and fully yours."</p>
                <p class="description">A lightweight, modular JavaScript framework built on native Web Components.</p>
            </section>
            
            <section class="feature-section">
                <h2>Core Features</h2>
                <div class="feature-grid">
                    <div class="feature-card">
                        <h3>🧱 Modular Architecture</h3>
                        <p>Add only the features you need with our mixin system</p>
                    </div>
                    <div class="feature-card">
                        <h3>🧩 Web Components</h3>
                        <p>Built on native browser standards for better performance</p>
                    </div>
                    <div class="feature-card">
                        <h3>🛠️ Built-in Routing</h3>
                        <p>Simple but powerful SPA navigation</p>
                    </div>
                    <div class="feature-card">
                        <h3>⚙️ Shadow DOM</h3>
                        <p>True component encapsulation for cleaner code</p>
                    </div>
                    <div class="feature-card">
                        <h3>📡 Channel Messaging</h3>
                        <p>Built-in tab-to-tab communication</p>
                    </div>
                    <div class="feature-card">
                        <h3>📦 Custom Lifecycle</h3>
                        <p>Full control over component initialization and events</p>
                    </div>
                </div>
            </section>
            
            <section class="code-example">
                <h2>Simple Component Example</h2>
                <pre><code>
import { ElevateElement } from '/elevateElement/elevateElement.js';

class CounterElement extends ElevateElement {
  constructor() {
    super('counter-element');
    this.state = { count: 0 };
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot.innerHTML = this.render();
    this.shadowRoot.querySelector('button')
      .addEventListener('click', () => this.increment());
  }

  increment() {
    this.state.count++;
    this.shadowRoot.querySelector('.count').textContent = this.state.count;
  }

  render() {
    return \`
      <style>
        :host { display: block; padding: 20px; }
        .counter { font-size: 2rem; }
        button { padding: 8px 16px; }
      </style>
      <div>
        <div class="count counter">\${this.state.count}</div>
        <button>Increment</button>
      </div>
    \`;
  }
}

customElements.define('counter-element', CounterElement);
                </code></pre>
            </section>
            
            <section class="get-started">
                <h2>Get Started</h2>
                <p>Explore the <a href="/tests">Tests</a> section to see working examples of all core features.</p>
                <p>Check our <a href="/about">About</a> page to learn more about the framework's design philosophy.</p>
            </section>

            <style>
                .home-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }
                
                .hero-section {
                    text-align: center;
                    margin-bottom: 50px;
                    padding: 30px 20px;
                    background: linear-gradient(135deg, #f5f7fa 0%, #e9eef2 100%);
                    border-radius: 8px;
                }
                
                .hero-section h1 {
                    font-size: 2.5rem;
                    margin-bottom: 15px;
                    color: #6200ea;
                }
                
                .tagline {
                    font-style: italic;
                    font-size: 1.2rem;
                    margin-bottom: 20px;
                    color: #555;
                }
                
                .description {
                    font-size: 1.1rem;
                    max-width: 700px;
                    margin: 0 auto;
                }
                
                .feature-section {
                    margin-bottom: 50px;
                }
                
                .feature-section h2 {
                    text-align: center;
                    margin-bottom: 30px;
                    color: #444;
                    font-size: 1.8rem;
                }
                
                .feature-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 25px;
                    margin-top: 30px;
                }
                
                .feature-card {
                    background: #f5f5f5;
                    padding: 25px;
                    border-radius: 8px;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.08);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .feature-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                
                .feature-card h3 {
                    color: #6200ea;
                    margin-top: 0;
                    margin-bottom: 15px;
                    font-size: 1.3rem;
                }
                
                .code-example {
                    margin-bottom: 50px;
                    background: #f8f9fa;
                    padding: 25px;
                    border-radius: 8px;
                    border-left: 5px solid #6200ea;
                }
                
                .code-example h2 {
                    margin-top: 0;
                    color: #444;
                    font-size: 1.8rem;
                    margin-bottom: 20px;
                }
                
                .code-example pre {
                    background: #2d2d2d;
                    color: #f8f8f2;
                    padding: 20px;
                    border-radius: 5px;
                    overflow-x: auto;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                    line-height: 1.5;
                }
                
                .get-started {
                    text-align: center;
                    margin-bottom: 30px;
                    padding: 30px;
                    background: linear-gradient(135deg, #f5f7fa 0%, #e9eef2 100%);
                    border-radius: 8px;
                }
                
                .get-started h2 {
                    color: #444;
                    margin-top: 0;
                    margin-bottom: 20px;
                    font-size: 1.8rem;
                }
                
                .get-started a {
                    color: #6200ea;
                    text-decoration: none;
                    font-weight: bold;
                }
                
                .get-started a:hover {
                    text-decoration: underline;
                }
                
                @media (max-width: 768px) {
                    .feature-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .hero-section h1 {
                        font-size: 2rem;
                    }
                    
                    .code-example pre {
                        font-size: 12px;
                    }
                }
            </style>
        </div>
    `,
    load: async (params = {}) => {
        try {
            // Use the standardized renderView utility
            return await renderView(Home, 'Home');
        } catch (error) {
            console.error('[Home View] Error loading home view:', error);
            return false;
        }
    }
};