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
      });
    }

    connectedCallback() {
      super.connectedCallback();
      console.log('[ChannelSyncTestElement] connected');
      
      // Manual event binding instead of using addEvents
      this.updateUI();
      this.addEventListeners();
      
      // Open the BroadcastChannel
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
      // First render the UI to create the elements
      this.updateUI();
      
      // Then attach event listeners using proper binding
      const incrementButton = this.shadowRoot.querySelector('.increment-button');
      const resetButton = this.shadowRoot.querySelector('.reset-button');
      
      if (incrementButton) {
        // Use bound function to maintain context
        this._boundIncrementAndSync = this.incrementAndSync.bind(this);
        incrementButton.addEventListener('click', this._boundIncrementAndSync);
      }
      
      if (resetButton) {
        // Use bound function to maintain context
        this._boundResetAndSync = this.resetAndSync.bind(this);
        resetButton.addEventListener('click', this._boundResetAndSync);
      }
    }
    
    // Remove event listeners
    removeEventListeners() {
      const incrementButton = this.shadowRoot.querySelector('.increment-button');
      const resetButton = this.shadowRoot.querySelector('.reset-button');
      
      if (incrementButton && this._boundIncrementAndSync) {
        incrementButton.removeEventListener('click', this._boundIncrementAndSync);
      }
      
      if (resetButton && this._boundResetAndSync) {
        resetButton.removeEventListener('click', this._boundResetAndSync);
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
      this.shadowRoot.innerHTML = this.render();
      // Re-attach event listeners after shadow DOM update
      this.addEventListeners();
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
            margin-right: 1rem;
            margin-bottom: 1rem;
            background: var(--primary-color, #6200ea);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
          .info {
            background: #f5f5f5;
            padding: 1rem;
            border-radius: 5px;
          }
        </style>

        <div>
          <button class="increment-button">Increment Count</button>
          <button class="reset-button">Reset Count</button>

          <div class="info">
            <p><strong>Tab ID:</strong> ${this.tabId}</p>
            <p><strong>Synced Count:</strong> ${this.globalCount}</p>
          </div>
        </div>
      `;
    }
  }

  customElements.define('channel-sync-test-element', ChannelSyncTestElement);
}