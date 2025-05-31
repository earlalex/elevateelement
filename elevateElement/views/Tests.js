// // elevateElement/views/FeatureTestsView.js
// import { TestElementBuilder } from '../components/builders/TestElement.js'; 
// import { ErrorTestElementBuilder } from '../components/tests/ErrorTestElement.js';
// import { ChannelSyncTestElementBuilder } from '../components/tests/ChannelSyncTestElement.js';
// import { PostTestElementBuilder } from '../components/tests/PostTestElement .js';
// import { RetryErrorElementBuilder } from '../components/tests/RetryErrorElement.js';
// import { EventBridgeElementBuilder } from '../components/tests/EventBridgeElement.js';
// import { ManualEventElementBuilder } from '../components/tests/ManualEventElement.js';
// import { LayoutTestElementBuilder } from '../components/tests/LayoutTestElement.js';
import { renderView } from '../utils/index.js';

// Track component initialization status
const initializedComponents = {
  'test-element': false,
  'error-test-element': false,
  'channel-sync-test-element': false,
  'post-test-element': false,
  'retry-error-element': false,
  'event-bridge-element': false,
  'manual-event-element': false,
  'layout-test-element': false
};

// Initialize test components
function initializeTestComponents() {
  console.log('[Tests View] Verifying test components...');
  return verifyComponents();
}

// Keep verification logic
function verifyComponents() {
  const undefinedComponents = [];
  
  Object.keys(initializedComponents).forEach(tag => {
    if (!customElements.get(tag)) {
      undefinedComponents.push(tag);
    }
  });
  
  return undefinedComponents;
}

export const Tests = {
    path: '/tests',
    title: 'Tests',
    contentRendered: false,
    content: `
        <section class="tests-container">
        <h1>ElevateElement Core Feature Tests</h1>

        <div id="test-components-status" class="status-message"></div>
        
        <section class="test-section">
            <h2>Test Element (State + Ajax)</h2>
            <test-element></test-element>
        </section>

        <section class="test-section">
            <h2>Error Test Element (Intentional Error Handling)</h2>
            <error-test-element></error-test-element>
        </section>

        <section class="test-section">
            <h2>Channel Sync Test Element (Multi-Tab Communication)</h2>
            <channel-sync-test-element></channel-sync-test-element>
        </section>

        <section class="test-section">
            <h2>Post Test Element (POST Request Handling)</h2>
            <post-test-element></post-test-element>
        </section>

        <section class="test-section">
            <h2>Retry Error Element (Retry Failed Fetch)</h2>
            <retry-error-element></retry-error-element>
        </section>

        <section class="test-section">
            <h2>Event Bridge Test Element (Internal + Global Events)</h2>
            <event-bridge-element></event-bridge-element>
        </section>

        <section class="test-section">
            <h2>Manual Event Test Element (Programmatic Event Creation)</h2>
            <manual-event-element></manual-event-element>
        </section>

        <section class="test-section">
            <h2>Layout Test Element (CSS Grid and Flex Layouts)</h2>
            <layout-test-element></layout-test-element>
        </section>
        </section>

        <style>
          .tests-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .test-section {
            border: 1px solid #ddd;
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 5px;
            background-color: #f9f9f9;
          }
          
          h1 {
            color: #6200ea;
            margin-bottom: 20px;
          }
          
          h2 {
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
            color: #333;
          }
          
          .status-message {
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
          }
          
          .status-success {
            background-color: #e8f5e9;
            color: #2e7d32;
            border: 1px solid #c8e6c9;
          }
          
          .status-error {
            background-color: #ffebee;
            color: #c62828;
            border: 1px solid #ffcdd2;
          }
        </style>
    `,
    
    // Test component initialization
    initTestComponents() {
      console.log('[Tests View] Initializing test components...');
      
      const testComponents = {
        'test-element': false,
        'error-test-element': false,
        'channel-sync-test-element': false,
        'post-test-element': false,
        'retry-error-element': false,
        'event-bridge-element': false,
        'manual-event-element': false,
        'layout-test-element': false,
      };
      
      // Define custom elements for each test component
      if (customElements) {
        // First make sure all elements are defined
        Object.keys(testComponents).forEach(elementName => {
          testComponents[elementName] = customElements.get(elementName) !== undefined;
        });
      }
      
      console.log('[Tests View] Component initialization complete:', testComponents);
      return testComponents;
    },
    
    load: async (params = {}) => {
      try {
        console.log('[Tests View] Loading tests...');
        
        // Use standardized view rendering first
        const renderResult = await renderView(Tests, 'Tests');
        if (!renderResult) {
          return false;
        }
        
        // Initialize test components if the view was rendered
        const testComponents = Tests.initTestComponents();
        
        // Additional setup actions for the Tests view
        console.log('[Tests View] Tests content rendered');
        
        // Verify all components were properly defined
        setTimeout(() => {
          const allDefined = Object.values(testComponents).every(Boolean);
          console.log('[Tests View] All components defined correctly');
        }, 500);
        
        return true;
      } catch (error) {
        console.error('[Tests View] Error loading tests view:', error);
        return false;
      }
    }
};