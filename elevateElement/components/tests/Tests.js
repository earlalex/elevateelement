import {ChannelSyncTestElementBuilder} from './ChannelSyncTestElement.js';
import {ConfigDisplayElementBuilder} from './ConfigDisplayElement.js';
import {ErrorTestElementBuilder} from './ErrorTestElement.js';
import {EventBridgeElementBuilder} from './EventBridgeElement.js';
import {LayoutTestElementBuilder} from './LayoutTestElement.js';
import {ManualEventElementBuilder} from './ManualEventElement.js';
import {PostTestElementBuilder} from './PostTestElement .js';
import {RetryErrorElementBuilder} from './RetryErrorElement.js';
import {TestElementBuilder} from '../builders/TestElement.js';

// Initialize components immediately
// ChannelSyncTestElementBuilder();
// ConfigDisplayElementBuilder();
// ErrorTestElementBuilder();
// EventBridgeElementBuilder();
// LayoutTestElementBuilder();
// ManualEventElementBuilder();
// PostTestElementBuilder();
// RetryErrorElementBuilder();
// TestElementBuilder();

// Call necessary builders here to define custom elements before tests are run.
// We pass ElevateElement if the builder expects the base class for extension.
// This needs to be done carefully if ElevateElement is not globally available here
// and is only passed to testElevateElement.
// For now, we will call the builder inside testElevateElement, assuming ElevateElement is passed.

export async function testElevateElement(ElevateElement) {
    console.log('[Test Runner] Starting test execution...');
    let totalTests = 0;
    let passedCount = 0;

    // Define all test elements by calling their builders
    // The ElevateElement parameter is passed to each builder.
    ErrorTestElementBuilder(ElevateElement);
    PostTestElementBuilder(ElevateElement);
    ManualEventElementBuilder(ElevateElement);
    EventBridgeElementBuilder(ElevateElement);
    ChannelSyncTestElementBuilder(ElevateElement); // Assuming ElevateElement is the base for this too
    RetryErrorElementBuilder(ElevateElement);
    ConfigDisplayElementBuilder(ElevateElement);
    // LayoutTestElementBuilder(ElevateElement); // Not part of this refactor iteration
    // TestElementBuilder(ElevateElement); // Generic test element, not part of this refactor

    const testsToRun = [
        { name: 'Error Test', tag: 'error-test-element' },
        { name: 'Post Test', tag: 'post-test-element' }, // Uses 'PostTestElement .js'
        { name: 'Manual Event Test', tag: 'manual-event-element' },
        { name: 'Event Bridge Test', tag: 'event-bridge-element' },
        { name: 'Channel Sync Test', tag: 'channel-sync-test-element' },
        { name: 'Retry Error Test', tag: 'retry-error-element' },
        { name: 'Config Display Test', tag: 'config-display-element' }
    ];

    for (const test of testsToRun) {
        console.log(`\n[Test Runner] Starting: ${test.name} (using <${test.tag}>)...`);
        totalTests++;
        const testInstance = document.createElement(test.tag);
        document.body.appendChild(testInstance);

        try {
            // Optional: wait for connectedCallback if it does async work before runTest is valid.
            // Most runTest methods are async and handle their own necessary waits.
            // await new Promise(resolve => setTimeout(resolve, 0));

            if (typeof testInstance.runTest === 'function') {
                const result = await testInstance.runTest();
                console.log(`[Test Runner] ${test.name} Result:`, result);
                if (result && result.success) {
                    passedCount++;
                    console.log(`[Test Runner] ${test.name}: PASSED`);
                } else {
                    console.error(`[Test Runner] ${test.name}: FAILED (Result: ${JSON.stringify(result)})`);
                }
            } else {
                console.error(`[Test Runner] ${test.name}: FAILED (runTest method not found on <${test.tag}> instance).`);
            }
        } catch (err) {
            console.error(`[Test Runner] ${test.name}: FAILED (Error during test execution):`, err);
        } finally {
            if (testInstance.parentElement) {
                document.body.removeChild(testInstance);
                // console.log(`[Test Runner] ${test.name} instance removed from DOM.`);
            }
        }
    }

    // --- Summary ---
    console.log(`\n[Test Runner] Test Execution Summary: ${passedCount} / ${totalTests} passed.`);
}
