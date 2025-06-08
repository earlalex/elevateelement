// elevateElement/components/tests/TestLitComponent.js
import { LitElement, html, css } from 'lit';

class TestLitComponent extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      border: 1px solid #ccc;
      margin-bottom: 20px;
    }
    h3 {
      color: blue;
    }
    #htmx-target-in-lit {
      margin-top: 15px;
      padding: 10px;
      border: 1px dotted green;
    }
  `;

  render() {
    return html`
      <h3>Test Lit Component</h3>
      <p>This component verifies that Lit is working correctly.</p>

      <h4>HTMX Section within Lit Component</h4>
      <p>The button below will use HTMX to load content into the green dotted box.</p>
      <button hx-get="/htmx-content.html" hx-target="#htmx-target-in-lit" hx-swap="innerHTML">
        Load HTMX Content into Lit Component
      </button>
      <div id="htmx-target-in-lit">
        HTMX content will be loaded here.
      </div>
    `;
  }
}

customElements.define('test-lit-component', TestLitComponent);
