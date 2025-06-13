import { ElevateElement } from '../../elevateElement.js';
import { addChannelMessagingFeature } from '../../features/core/channelMessaging.js';
import { StateManager } from '../../utils/stateManager.js';

// Merge ChannelMessagingFeature into ElevateElement


export function ChannelSyncTestElementBuilder() {
  const ElevateElementWithMessaging = addChannelMessagingFeature(ElevateElement);
  
  class ChannelSyncTestElement extends ElevateElementWithMessaging {
    constructor() {
      super('channel-sync-test-element');

      // Initialize with default values
      this.tabId = Math.random().toString(36).substring(2, 8);
      
      // Create shadow root only if it doesn't exist
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
      }

      this.state = { // Explicitly define a state object for testResult
        testResult: { success: null, message: 'Test not run yet.' }
      };
      
      // Initialize global state if it doesn't exist
      if (StateManager.get('channelCount') === undefined) {
        StateManager.set('channelCount', 0);
      }
      
      // Connect to global state
      this.globalCount = StateManager.get('channelCount');
      
      // Subscribe to state changes
      this._unsubscribe = StateManager.subscribe('channelCount', (newValue) => {
        this.globalCount = newValue;
        this.updateUI();
        this.addEventListeners(); // Re-attach after render
      });
    }

    connectedCallback() {
      super.connectedCallback();
      console.log('[ChannelSyncTestElement] connected');
      this.updateUI(); // Initial render
      this.addEventListeners(); // Attach listeners
      this.openChannel();
    }

    disconnectedCallback() {
      console.log('[ChannelSyncTestElement] disconnected');
      this.removeEventListeners();
      
      // Unsubscribe from state changes
      if (this._unsubscribe) {
        this._unsubscribe();
      }
      
      // Close channels
      if (this.closeAllChannels) {
        this.closeAllChannels();
      }
      
      super.disconnectedCallback && super.disconnectedCallback();
    }
    
    // Add event listeners manually
    addEventListeners() {
      if (!this.shadowRoot) return; // Guard against no shadowRoot
      
      // Then attach event listeners using proper binding
      const incrementButton = this.shadowRoot.querySelector('.increment-button');
      const resetButton = this.shadowRoot.querySelector('.reset-button');
      const runTestButton = this.shadowRoot.querySelector('.run-this-test-button');
      
      if (incrementButton) {
        if (this._boundIncrementAndSync) incrementButton.removeEventListener('click', this._boundIncrementAndSync);
        this._boundIncrementAndSync = this.incrementAndSync.bind(this);
        incrementButton.addEventListener('click', this._boundIncrementAndSync);
      }
      
      if (resetButton) {
        if (this._boundResetAndSync) resetButton.removeEventListener('click', this._boundResetAndSync);
        this._boundResetAndSync = this.resetAndSync.bind(this);
        resetButton.addEventListener('click', this._boundResetAndSync);
      }

      if (runTestButton) {
        if (this._boundHandleRunThisTest) runTestButton.removeEventListener('click', this._boundHandleRunThisTest);
        this._boundHandleRunThisTest = this.handleRunThisTest.bind(this);
        runTestButton.addEventListener('click', this._boundHandleRunThisTest);
      }
    }
    
    // Remove event listeners
    removeEventListeners() {
      const incrementButton = this.shadowRoot.querySelector('.increment-button');
      const resetButton = this.shadowRoot.querySelector('.reset-button');
      const runTestButton = this.shadowRoot.querySelector('.run-this-test-button');
      
      if (incrementButton && this._boundIncrementAndSync) {
        incrementButton.removeEventListener('click', this._boundIncrementAndSync);
      }
      if (resetButton && this._boundResetAndSync) {
        resetButton.removeEventListener('click', this._boundResetAndSync);
      }
      if (runTestButton && this._boundHandleRunThisTest) {
        runTestButton.removeEventListener('click', this._boundHandleRunThisTest);
      }
    }

    async handleRunThisTest() {
      try {
        await this.runTest();
      } catch (e) {
        this.state.testResult = { success: false, message: `Test execution error: ${e.message}` };
        this.updateUI();
        this.addEventListeners(); // Re-attach
        console.error('[ChannelSyncTestElement] Error during runTest from button:', e);
      }
    }

    incrementAndSync() {
      const newCount = this.globalCount + 1;
      console.log(`[ChannelSyncTestElement] Incrementing to ${newCount} and syncing...`);
      
      // Update global state
      StateManager.set('channelCount', newCount);
      
      // Sync across tabs
      this.syncState({ count: newCount });
    }

    resetAndSync() {
      console.log('[ChannelSyncTestElement] Resetting count to 0 and syncing...');
      
      // Update global state
      StateManager.set('channelCount', 0);
      
      // Sync across tabs
      this.syncState({ count: 0 });
    }
    
    // Handle incoming sync state from other tabs
    onSyncMessage(data) {
      if (data && data.count !== undefined) {
        console.log(`[ChannelSyncTestElement] Received synced count: ${data.count}`);
        
        // Update global state without triggering sync
        StateManager.set('channelCount', data.count);
      }
    }
    
    // Update UI method
    updateUI() {
      if (!this.shadowRoot) return; // Guard against no shadowRoot
      this.shadowRoot.innerHTML = this.render();
    }

    render() {
      const tabId = this.tabId || 'N/A';
      const globalCount = (typeof this.globalCount === 'number') ? this.globalCount : (StateManager.get('channelCount') !== undefined ? StateManager.get('channelCount') : 'N/A');
      const testResultStatusClass = this.state.testResult.success === true
        ? 'success'
        : this.state.testResult.success === false
          ? 'failure'
          : 'not-run';

      return `
        <style>
          :host {
            display: block;
            font-family: sans-serif;
            padding: 1rem;
          }
          button { /* General button styling */
            padding: 0.5rem 1rem;
            margin-right: 1rem;
            margin-bottom: 1rem;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
          .increment-button { background: var(--primary-color, #6200ea); }
          .reset-button { background: var(--warning-color, #ffc107); color: black; }
          .run-this-test-button { background: var(--secondary-color, #03dac6); }

          .info {
            background: #f5f5f5;
            padding: 1rem;
            border-radius: 5px;
            border: 1px solid #ddd;
          }
          .test-result { margin-top: 10px; padding: 10px; border: 1px solid #eee; border-radius: 5px;}
          .test-result h4 { margin-top: 0; margin-bottom: 5px; }
          .status-message { padding: 5px; border-radius: 3px; }
          .status-message.success { color: green; background-color: #e6ffe6; border: 1px solid green;}
          .status-message.failure { color: red; background-color: #ffe6e6; border: 1px solid red;}
          .status-message.not-run { color: orange; background-color: #fff0e0; border: 1px solid orange;}
        </style>

        <div>
          <button class="increment-button">Increment Count</button>
          <button class="reset-button">Reset Count</button>
          <button class="run-this-test-button">Run This Test</button>

          <div class="info">
            <p><strong>Tab ID:</strong> ${tabId}</p>
            <p><strong>Synced Count:</strong> ${globalCount}</p>
          </div>

          <div class="test-result">
            <h4>Test Result:</h4>
            <p class="status-message ${testResultStatusClass}">
              ${this.state.testResult.message}
            </p>
          </div>
        </div>
      `;
    }

    async runTest() {
      console.log('[ChannelSyncTestElement] Starting test...');
      let allTestsPassed = true;
      let messages = [];

      // Helper for micro-delay
      const delay = () => new Promise(resolve => setTimeout(resolve, 0));

      // --- Initial State & Increment Test ---
      console.log('[ChannelSyncTestElement] Testing: Initial State & Increment...');
      this.resetAndSync();
      await delay();

      let initialCount = StateManager.get('channelCount');
      if (initialCount === 0 && this.globalCount === 0) {
        messages.push('Initial state (after reset) assertion passed.');
      } else {
        allTestsPassed = false;
        messages.push(`Assertion failed: Initial state. StateManager: ${initialCount}, globalCount: ${this.globalCount}. Expected 0 for both.`);
      }

      this.incrementAndSync();
      await delay();

      let countAfterIncrementSM = StateManager.get('channelCount');
      let countAfterIncrementLocal = this.globalCount;
      if (countAfterIncrementSM === 1 && countAfterIncrementLocal === 1) {
        messages.push('Increment assertion passed.');
      } else {
        allTestsPassed = false;
        messages.push(`Assertion failed: After increment. StateManager: ${countAfterIncrementSM}, globalCount: ${countAfterIncrementLocal}. Expected 1 for both.`);
      }

      // --- Reset Test ---
      console.log('[ChannelSyncTestElement] Testing: Reset...');
      this.resetAndSync();
      await delay();

      let countAfterResetSM = StateManager.get('channelCount');
      let countAfterResetLocal = this.globalCount;
      if (countAfterResetSM === 0 && countAfterResetLocal === 0) {
        messages.push('Reset assertion passed.');
      } else {
        allTestsPassed = false;
        messages.push(`Assertion failed: After reset. StateManager: ${countAfterResetSM}, globalCount: ${countAfterResetLocal}. Expected 0 for both.`);
      }

      // --- Simulated onSyncMessage Test ---
      console.log('[ChannelSyncTestElement] Testing: Simulated onSyncMessage...');
      const simulatedSyncValue = 5;
      this.onSyncMessage({ count: simulatedSyncValue });
      await delay();

      let countAfterSimulatedSyncSM = StateManager.get('channelCount');
      let countAfterSimulatedSyncLocal = this.globalCount;

      if (countAfterSimulatedSyncSM === simulatedSyncValue && countAfterSimulatedSyncLocal === simulatedSyncValue) {
        messages.push(`Simulated onSyncMessage assertion passed (value: ${simulatedSyncValue}).`);
      } else {
        allTestsPassed = false;
        messages.push(`Assertion failed: After simulated onSyncMessage. StateManager: ${countAfterSimulatedSyncSM}, globalCount: ${countAfterSimulatedSyncLocal}. Expected ${simulatedSyncValue} for both.`);
      }

      const result = {
        success: allTestsPassed,
        message: messages.join(' | ')
      };
      this.state.testResult = result;
      this.updateUI();
      this.addEventListeners(); // Re-attach after render

      return result;
    }
  }

  if (!customElements.get('channel-sync-test-element')) {
    customElements.define('channel-sync-test-element', ChannelSyncTestElement);
    console.log('[ChannelSyncTestElement] Custom element defined by ChannelSyncTestElementBuilder.');
  }
  return ChannelSyncTestElement;
}