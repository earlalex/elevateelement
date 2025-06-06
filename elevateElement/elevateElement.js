// core/ElevateElement.js
import { LitElement, html, css } from 'lit'; // Import Lit
import { addConfigLoader } from './features/core/loadConfig.js';
import { elevateElementUtils } from './utils/index.js';
import { elevateElementFeatures } from './features/index.js';
import { elevateElementRoutes } from './routes/index.js';
import { testElevateElement } from './components/tests/Tests.js';
import { Router } from './features/core/router.js';
import { allViews } from './views/index.js';
import { initializeStandaloneNavigation } from './js/navigation.js';
import { initKeyboardNavigation } from './js/keyboardNav.js';
import { elevateElementConfig } from './config/config.js';

// Global variables
let elementInitialized = false;

/**
 * Builds the ElevateElement class after all mixins and features are loaded.
 * Guarantees ElevateElement is fully composed before export.
 */
function buildElevateElement() {
  // The order of mixin application might need adjustment based on dependencies.
  // Here, features are applied to LitElement first.
  class LitBase extends elevateElementFeatures(LitElement) {}
  class UtilApplied extends elevateElementUtils(LitBase) {}
  class ConfigApplied extends addConfigLoader(UtilApplied) {}

  class BaseElement extends ConfigApplied {
    
    // Lit's way of defining properties that trigger re-renders when changed.
    // Replaces manual `observedAttributes` and `attributeChangedCallback` for these.
    static properties = {
      elementName: { type: String },
      config: { type: Object, reflect: true }, // reflect: true keeps attribute in sync
      mode: { type: String, reflect: true }
      // Add other reactive properties your element might need
    };

    constructor(elementNameFromConstructor) {
      super();
      // elementName can be set via attribute or property.
      // Lit handles attribute-to-property mapping for declared properties.
      this.elementName = elementNameFromConstructor || this.getAttribute('elementName') || this.tagName.toLowerCase();
      this.initialized = false;
      this.config = {}; // Initialize config property
      console.log(`[BaseElement (Lit)] Constructing ${this.elementName}`);
    }

    // Lit's connectedCallback
    async connectedCallback() {
      super.connectedCallback(); // Important to call super for Lit's lifecycle
      console.log(`[BaseElement (Lit)] Connected: ${this.elementName}`);
      if (this.initialized) return;
      
      // Initialize framework only once
      if (!elementInitialized) {
        try {
          console.log('[BaseElement (Lit)] First element initialization - setting up framework');
          // elevateElementRoutes might need to be adapted if it directly manipulates
          // a non-Lit BaseElement. It might now pass `this.constructor` (the Lit component class)
          await elevateElementRoutes(this.constructor);
          elementInitialized = true;
          console.log('[BaseElement (Lit)] Framework initialization complete');
        } catch (error) {
          console.error('[BaseElement (Lit)] Initialization error:', error);
        }
      }
      this.initialized = true;
      // Request an update if you need to re-render based on initial setup.
      // Often, Lit handles this automatically if properties change.
      // this.requestUpdate(); 
    }

    // attributeChangedCallback is still available in LitElement, but for properties
    // defined in `static properties`, Lit handles the synchronization.
    // You'd use this for attributes NOT managed as reactive properties.
    // For 'config' and 'mode', Lit's property system handles updates.
    // If 'config' attribute is set as a JSON string, you might need custom handling
    // if Lit's default parsing isn't sufficient, or ensure it's set as an object property.

    // Lit's render method. This is where you define your component's HTML structure.
    render() {
      return html`
        <slot></slot> <!-- Allows content projection like the original <elevate-element> -->
      `;
    }
  }
  return BaseElement;
}

/**
 * Sets up the main application element, which will now be a Lit component.
 */
function setupMainElement() {
  // This function might need to ensure the <elevate-element> is in the DOM
  // or that its definition is ready.
  // With Lit, defining the element (customElements.define) is key.
  // The instance in index.html will then be upgraded.
  console.log('[ElevateElement] Main element setup initiated.');
}

/**
 * Initialize the application
 */
function initializeApplication() {
  // Setup main view element first
  setupMainElement();
  
  // Import and initialize views
  // Views themselves might become Lit components or use htmx for content.
  import('./views/index.js').then(({ allViews }) => {
    // Make Router globally accessible
    if (typeof window !== 'undefined') {
      window.ElevateRouter = Router;
    }
    
    // Initialize router with views
    // The router will now be rendering Lit components or HTML partials managed by htmx.
    if (Router && !Router.initialized) {
      Router.setupRoutes(allViews); // `allViews` might now be a collection of Lit component tags or htmx endpoints
      Router.initialize();
    }
    
    // Initialize other components/modules
    // initializeStandaloneNavigation and initKeyboardNavigation might need updates
    // to work with Lit components and htmx interactions.
    initializeStandaloneNavigation();
    initKeyboardNavigation();
  }).catch(error => {
    console.error('[ElevateElement] Failed to load views:', error);
  });
}

// Build and export the fully prepared ElevateElement
const ElevateElement = buildElevateElement();

// Initialize test components
// testElevateElement might need to be adapted to test Lit components.
testElevateElement(ElevateElement);

// Register the base element
if (!customElements.get('elevate-element')) {
  customElements.define('elevate-element', ElevateElement);
}

// Initialize the application
initializeApplication();

export { ElevateElement };