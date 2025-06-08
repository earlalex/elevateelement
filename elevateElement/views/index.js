// Create Views registry first
// Import views individually
import { Home } from './Home.js';
import { About } from './About.js';
import { Config } from './Config.js';
import { Contact } from './Contact.js';
import { Tests } from './Tests.js';
import '../components/tests/TestLitComponent.js'; // Ensure the component is defined
import { HtmxTestView } from './HtmxTestView.js';

// Initialize views array
const views = [
  Home,
  About,
  Config,
  Contact,
  Tests,
  {
    path: '/test-lit',
    name: 'Test Lit',
    component: 'test-lit-component', // The custom element tag name
    meta: { title: 'Lit Test Page', description: 'Page for testing Lit component.' }
  },
  {
    path: '/test-htmx',
    name: 'Test HTMX',
    component: null, // Or a generic component that renders raw HTML
    content: HtmxTestView.content, // Pass HTML content directly
    meta: HtmxTestView.meta
  }
];

// Export views
export const allViews = views;

// Registration function
export function registerView(view) {
    if (!views.find(v => v.path === view.path)) {
        views.push(view);
    }
}