// elevateElement/components/tests/EventBridgeElement.js
import { BaseComponentUtils } from '../../utils/baseComponent.js';
import { createBaseComponent } from '../BaseComponent.js';

export function EventBridgeElementBuilder(ElevateElement) {
  // Create a BaseComponent specific to this test
  const BaseComponent = createBaseComponent(ElevateElement);
  
  class EventBridgeElement extends BaseComponent {
    constructor() {
      super('event-bridge-element');

      this.state = {
        internalMessage: '',
        globalMessage: '',
        eventCount: 0
      };

      // Bind global event handler early
      this._onGlobalEvent = this._onGlobalEvent.bind(this);
    }

    connectedCallback() {
      super.connectedCallback();
      console.log('[EventBridgeElement] connected');

      // Attach internal event listener
      this.on('bridge-event', (detail) => {
        console.log('[EventBridgeElement] Internal event caught:', detail);
        this.state.internalMessage = detail.message;
        this.updateUI();
      });

      // Attach global event listener
      window.addEventListener('bridge-event', this._onGlobalEvent);
    }

    attachEventHandlers() {
      BaseComponentUtils.attachEventHandlers(this, {
        '.emit-button': this.sendEvent
      });
    }

    disconnectedCallback() {
      window.removeEventListener('bridge-event', this._onGlobalEvent);
      super.disconnectedCallback();
    }

    _onGlobalEvent(event) {
      console.log('[EventBridgeElement] Global event caught:', event.detail);
      this.state.globalMessage = event.detail.message;
      this.updateUI();
    }

    sendEvent() {
      this.state.eventCount++;
      const detail = { 
        message: `Hello from Bridge Event! (${this.state.eventCount})`, 
        timestamp: new Date().toISOString() 
      };
      
      console.log('[EventBridgeElement] Emitting bridge-event:', detail);

      // Internal ElevateElement event
      this.emit('bridge-event', detail);

      // Native DOM CustomEvent
      const nativeEvent = new CustomEvent('bridge-event', {
        detail,
        bubbles: true,
        composed: true
      });
      window.dispatchEvent(nativeEvent);
      // No updateUI() here, runTest will call it after assertions if needed
    }

    async runTest() {
      console.log('[EventBridgeElement] Starting test...');
      let allTestsPassed = true;
      let messages = [];

      this.sendEvent(); // This will increment eventCount and set messages via listeners

      const currentEventCount = this.state.eventCount;
      const expectedMessage = `Hello from Bridge Event! (${currentEventCount})`;

      // Wait for event propagation and setState calls within listeners
      await new Promise(resolve => setTimeout(resolve, 0));

      // Assertion for internalMessage
      if (this.state.internalMessage === expectedMessage) {
        messages.push('Internal message assertion passed.');
        console.log('[EventBridgeElement] Assertion Passed: Internal message is correct.');
      } else {
        allTestsPassed = false;
        messages.push(`Assertion failed: Internal message is "${this.state.internalMessage}", expected "${expectedMessage}".`);
        console.error('[EventBridgeElement] Assertion Failed:', messages[messages.length - 1]);
      }

      // Assertion for globalMessage
      if (this.state.globalMessage === expectedMessage) {
        messages.push('Global message assertion passed.');
        console.log('[EventBridgeElement] Assertion Passed: Global message is correct.');
      } else {
        allTestsPassed = false;
        messages.push(`Assertion failed: Global message is "${this.state.globalMessage}", expected "${expectedMessage}".`);
        console.error('[EventBridgeElement] Assertion Failed:', messages[messages.length - 1]);
      }

      // Assertion for eventCount
      if (this.state.eventCount === currentEventCount && currentEventCount > 0) {
        messages.push(`Event count assertion passed (count: ${currentEventCount}).`);
        console.log('[EventBridgeElement] Assertion Passed: Event count is correct.');
      } else {
        allTestsPassed = false;
        messages.push(`Assertion failed: Event count is ${this.state.eventCount}, expected ${currentEventCount} (and > 0).`);
        console.error('[EventBridgeElement] Assertion Failed:', messages[messages.length - 1]);
      }

      this.updateUI(); // Update UI with final state after assertions

      return {
        success: allTestsPassed,
        message: messages.join(' ')
      };
    }

    template() {
      return `
        <div class="event-bridge-container">
          <h3>Event Bridge Test</h3>
          <p>This component tests the event system by emitting and listening to events.</p>
          
          <button class="emit-button" type="button">Emit Event</button>
          
          <div class="event-results">
            <div class="result-item ${this.state.internalMessage ? 'active' : ''}">
              <h4>Internal Handler</h4>
              <div class="message">${this.state.internalMessage || '(No events received yet)'}</div>
            </div>
            
            <div class="result-item ${this.state.globalMessage ? 'active' : ''}">
              <h4>Global Handler</h4>
              <div class="message">${this.state.globalMessage || '(No events received yet)'}</div>
            </div>
          </div>
        </div>
      `;
    }

    styles() {
      return `
        .event-bridge-container {
          padding: var(--space-lg);
          margin: var(--space-md) 0;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--elevation-1);
          transition: transform var(--duration-medium) var(--easing-standard),
                    box-shadow var(--duration-medium) var(--easing-standard);
        }
        
        .event-bridge-container:hover {
          transform: translateY(-3px);
          box-shadow: var(--elevation-2);
        }
        
        h3 {
          color: var(--color-on-surface-high);
          margin-top: 0;
          margin-bottom: var(--space-sm);
          font-weight: var(--weight-medium);
          letter-spacing: var(--letter-spacing-tight);
          font-family: var(--font-display);
        }
        
        h4 {
          color: var(--color-on-surface-high);
          margin-top: 0;
          margin-bottom: var(--space-xs);
          font-size: var(--font-md);
          font-weight: var(--weight-medium);
        }
        
        p {
          margin-bottom: var(--space-md);
          color: var(--color-on-surface-medium);
        }
        
        .emit-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-xs) var(--space-md);
          background-color: var(--color-primary);
          color: var(--color-on-primary);
          border: none;
          border-radius: var(--radius-md);
          font-family: var(--font-sans);
          font-size: var(--font-sm);
          font-weight: var(--weight-medium);
          cursor: pointer;
          pointer-events: auto !important;
          transition: background-color var(--duration-short) var(--easing-standard),
                      box-shadow var(--duration-short) var(--easing-standard),
                      transform var(--duration-short) var(--easing-standard);
          box-shadow: var(--elevation-1);
          margin-bottom: var(--space-lg);
          min-height: 44px;
          z-index: 1;
        }
        
        .emit-button:hover {
          background-color: var(--color-primary-dark);
          box-shadow: var(--elevation-2);
          transform: translateY(-2px);
        }
        
        .emit-button:active {
          transform: translateY(0);
          box-shadow: var(--elevation-1);
        }
        
        .event-results {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-md);
        }
        
        .result-item {
          padding: var(--space-md);
          background-color: var(--color-surface-variant);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          transition: all var(--duration-short) var(--easing-standard);
        }
        
        .result-item.active {
          border-color: var(--color-primary-light);
          background-color: rgba(0, 102, 204, 0.05);
        }
        
        .message {
          padding: var(--space-sm);
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: var(--radius-sm);
          font-family: var(--font-mono);
          font-size: var(--font-sm);
        }
      `;
    }
  }

  // Define the element if it doesn't exist
  if (!customElements.get('event-bridge-element')) {
    customElements.define('event-bridge-element', EventBridgeElement);
    console.log('[EventBridgeElement] Custom element defined by EventBridgeElementBuilder.');
  }
  return EventBridgeElement;
}