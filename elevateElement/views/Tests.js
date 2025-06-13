// elevateElement/views/FeatureTestsView.js
import { TestElementBuilder } from '../components/builders/TestElement.js';
import { ErrorTestElementBuilder } from '../components/tests/ErrorTestElement.js';
import { ChannelSyncTestElementBuilder } from '../components/tests/ChannelSyncTestElement.js';
import { PostTestElementBuilder } from '../components/tests/PostTestElement.js';
import { RetryErrorElementBuilder } from '../components/tests/RetryErrorElement.js';
import { EventBridgeElementBuilder } from '../components/tests/EventBridgeElement.js';
import { ManualEventElementBuilder } from '../components/tests/ManualEventElement.js';
import { LayoutTestElementBuilder } from '../components/tests/LayoutTestElement.js';
import { ConfigDisplayElementBuilder } from '../components/tests/ConfigDisplayElement.js';
import { RouterTestElementBuilder } from '../components/tests/RouterTestElement.js';
import { renderView } from '../utils/index.js';

// Define a minimal base class for test elements
class MinimalBaseClass { constructor(name) { this.name = name; } connectedCallback() {} disconnectedCallback() {} setState(newState) { this.state = {...this.state, ...newState}; if (this.render && this.shadowRoot) { this.shadowRoot.innerHTML = this.render(); } else if (this.template && this.shadowRoot) { this.shadowRoot.innerHTML = this.template(); } } }

console.log('[Tests View] Defining custom test elements...');
TestElementBuilder(MinimalBaseClass);
ErrorTestElementBuilder(MinimalBaseClass);
ChannelSyncTestElementBuilder(MinimalBaseClass);
PostTestElementBuilder(MinimalBaseClass);
RetryErrorElementBuilder(MinimalBaseClass);
EventBridgeElementBuilder(MinimalBaseClass);
ManualEventElementBuilder(MinimalBaseClass);
LayoutTestElementBuilder(MinimalBaseClass);
ConfigDisplayElementBuilder(MinimalBaseClass);
RouterTestElementBuilder(MinimalBaseClass);
console.log('[Tests View] Custom test elements defined.');

// Track component initialization status
const initializedComponents = {
  'test-element': false,
  'error-test-element': false,
  'channel-sync-test-element': false,
  'post-test-element': false,
  'retry-error-element': false,
  'event-bridge-element': false,
  'manual-event-element': false,
  'layout-test-element': false,
  'config-display-element': false,
  'router-test-element': false
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
        <button id="run-all-tests-button" type="button" style="padding: 10px 15px; margin-bottom: 20px; background-color: #6200ea; color: white; border: none; border-radius: 5px; cursor: pointer;">Run All Tests</button>
        <div id="all-tests-summary" style="margin-bottom: 20px; padding: 10px; border: 1px solid transparent;"></div>

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

        <section class="test-section">
            <h2>Config Display Test Element (Configuration Data Verification)</h2>
            <config-display-element></config-display-element>
        </section>

        <section class="test-section">
            <h2>Router Test Element</h2>
            <router-test-element></router-test-element>
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
  'config-display-element': false, // This was the missing part in the previous attempt's search block
  'router-test-element': false
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
        const testComponents = Tests.initTestComponents(); // This already populates testComponents status for defined elements

        // Display component registration status
        const undefinedComponents = initializeTestComponents(); // This calls verifyComponents
        const statusDiv = document.getElementById('test-components-status');
        if (statusDiv) {
          if (undefinedComponents.length === 0) {
            statusDiv.textContent = 'All test components registered successfully.';
            statusDiv.className = 'status-message status-success';
          } else {
            statusDiv.textContent = `Warning: The following test components failed to register: ${undefinedComponents.join(', ')}`;
            statusDiv.className = 'status-message status-error';
          }
        }
        
        // Additional setup actions for the Tests view
        console.log('[Tests View] Tests content rendered');
        
        const runAllButton = document.getElementById('run-all-tests-button');
        const allTestsSummaryDiv = document.getElementById('all-tests-summary');

        if (runAllButton && allTestsSummaryDiv) {
            runAllButton.addEventListener('click', async () => {
                allTestsSummaryDiv.textContent = 'Running all tests... Please wait.';
                allTestsSummaryDiv.style.borderColor = '#ccc'; // Indicate activity
                allTestsSummaryDiv.style.color = '#333';
                allTestsSummaryDiv.style.backgroundColor = '#f0f0f0';

                console.log('[RunAllTests] Clicked - Starting all tests.');
                // These are the tags for the components that have runTest and UI updates
                const testElementTags = [
                    'test-element',
                    'error-test-element',
                    'post-test-element',
                    'manual-event-element',
                    'event-bridge-element',
                    'channel-sync-test-element',
                    'retry-error-element',
                    'config-display-element',
                    'layout-test-element',
                    'router-test-element'
                ];

                let testsFoundAndRunnable = 0;
                const testPromises = [];

                for (const tag of testElementTags) {
                    const element = document.querySelector(tag);
                    if (element) {
                        try {
                            await customElements.whenDefined(tag);
                            console.log(`[RunAllTests] ${tag} is defined.`);

                            if (typeof element.runTest === 'function') {
                                testsFoundAndRunnable++;
                                console.log(`[RunAllTests] Attempting to run test for ${tag}`);
                                testPromises.push(
                                  element.runTest().catch(err => {
                                    console.error(`[RunAllTests] Test ${tag} threw an unhandled error:`, err);
                                    return { success: false, message: `Test ${tag} threw error: ${err.message || 'Unknown error'}` };
                                  })
                                );
                            } else {
                                console.warn(`[RunAllTests] Test element ${tag} found and defined, but runTest method is STILL missing.`);
                            }
                        } catch (e) {
                            console.error(`[RunAllTests] Error during setup for ${tag}:`, e);
                        }
                    } else {
                        console.warn(`[RunAllTests] Test element ${tag} not found in the DOM.`);
                    }
                }

                const testOutcomes = await Promise.allSettled(testPromises);
                let passedCount = 0;
                let failedCount = 0;

                testOutcomes.forEach(outcome => {
                  if (outcome.status === 'fulfilled' && outcome.value && outcome.value.success === true) {
                    passedCount++;
                  } else {
                    failedCount++;
                    if (outcome.status === 'rejected') {
                      console.error('[RunAllTests] A test promise was rejected:', outcome.reason);
                    } else if (outcome.value) {
                      console.log('[RunAllTests] A test failed or had an error:', outcome.value.message);
                    }
                  }
                });

                let summaryMessage = `Found ${testsFoundAndRunnable} runnable tests. Executed ${testOutcomes.length}. Passed: ${passedCount}, Failed: ${failedCount}.`;
                summaryMessage += ` Check individual components for detailed messages.`;

                allTestsSummaryDiv.textContent = summaryMessage;

                if (testsFoundAndRunnable === 0) {
                    allTestsSummaryDiv.style.borderColor = '#ccc';
                    allTestsSummaryDiv.style.backgroundColor = '#f0f0f0';
                } else if (failedCount === 0 && passedCount === testsFoundAndRunnable) {
                    allTestsSummaryDiv.style.borderColor = 'green';
                    allTestsSummaryDiv.style.backgroundColor = '#e6ffe6';
                } else if (failedCount > 0) {
                    allTestsSummaryDiv.style.borderColor = 'red';
                    allTestsSummaryDiv.style.backgroundColor = '#ffe6e6';
                } else { // Some passed, none failed explicitly, but not all runnable tests passed (e.g. some missing runTest)
                    allTestsSummaryDiv.style.borderColor = 'orange';
                    allTestsSummaryDiv.style.backgroundColor = '#fff0e0';
                }
                console.log(`[RunAllTests] Summary: ${summaryMessage}`);
            });
        } else {
            if (!runAllButton) console.error('[Tests View] "Run All Tests" button (id: run-all-tests-button) not found.');
            if (!allTestsSummaryDiv) console.error('[Tests View] "All Tests Summary" div (id: all-tests-summary) not found.');
        }

        // Verify all components were properly defined (existing logic)
        setTimeout(() => {
          const allDefined = Object.values(testComponents).every(Boolean);
          console.log('[Tests View] All components defined correctly status:', allDefined);
        }, 500);
        
        return true;
      } catch (error) {
        console.error('[Tests View] Error loading tests view:', error);
        return false;
      }
    }
};