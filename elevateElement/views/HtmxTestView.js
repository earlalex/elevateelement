// elevateElement/views/HtmxTestView.js
export const HtmxTestView = {
  content: `
    <div id="htmx-test-container">
      <h2>HTMX Integration Test</h2>
      <p>This page tests if HTMX can fetch and display content.</p>
      <button hx-get="/htmx-content.html" hx-target="#htmx-result" hx-swap="innerHTML">
        Load Content via HTMX
      </button>
      <div id="htmx-result" style="margin-top: 20px; padding:10px; border:1px dashed #999;">
        Content will be loaded here.
      </div>
    </div>
  `,
  meta: {
    title: 'HTMX Test',
    description: 'Page for testing HTMX integration.'
  }
};
