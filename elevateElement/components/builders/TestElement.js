// elevateElement/components/tests/TestElement.js

import { BaseComponentUtils } from '../../utils/baseComponent.js';
import { createBaseComponent } from '../BaseComponent.js';

export function TestElementBuilder(ElevateElement) {
  // Create a BaseComponent specific to this test
  const BaseComponent = createBaseComponent(ElevateElement);
  
  class TestElement extends BaseComponent {
    constructor() {
      super('test-element');
      this.status = 'OK';
    }

    attachEventHandlers() {
      BaseComponentUtils.attachEventHandlers(this, {
        '.test-button': this.testAction
      });
    }

    testAction() {
      this.status = this.status === 'OK' ? 'TESTING' : 'OK';
      this.updateUI();
    }

    template() {
      return `
        <div class="test-element-container">
          <div class="header">
            <slot name="header">
              <h2>Default Test Element</h2>
            </slot>
          </div>
          <div class="content">
            <slot></slot>
          </div>
          <div class="footer">
            <slot name="footer">
              <button class="test-button">Run Test</button>
            </slot>
          </div>
        </div>
      `;
    }

    styles() {
      // CSS variables are now included by BaseComponentUtils
      return `
        .test-element-container {
          padding: var(--space-lg);
          margin: var(--space-md) 0;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--elevation-1);
          transition: transform var(--duration-medium) var(--easing-standard),
                     box-shadow var(--duration-medium) var(--easing-standard);
        }
        
        .test-element-container:hover {
          transform: translateY(-3px);
          box-shadow: var(--elevation-2);
        }
        
        h2 {
          color: var(--color-on-surface-high);
          margin-top: 0;
          margin-bottom: var(--space-sm);
          font-weight: var(--weight-medium);
          letter-spacing: var(--letter-spacing-tight);
        }
        
        p {
          margin-bottom: var(--space-md);
          color: var(--color-on-surface-medium);
        }
        
        strong {
          color: var(--color-primary);
          font-weight: var(--weight-medium);
        }
        
        .status {
          margin: var(--space-md) 0;
          padding: var(--space-md);
          border-radius: var(--radius-sm);
          font-weight: var(--weight-medium);
        }
        
        .status.ok {
          background-color: rgba(48, 209, 88, 0.1);
          color: var(--color-success);
          border: 1px solid rgba(48, 209, 88, 0.2);
        }
        
        .status.warning {
          background-color: rgba(255, 149, 0, 0.1);
          color: var(--color-warning);
          border: 1px solid rgba(255, 149, 0, 0.2);
        }
        
        .status.error {
          background-color: rgba(255, 59, 48, 0.1);
          color: var(--color-error);
          border: 1px solid rgba(255, 59, 48, 0.2);
        }
        
        .status.testing {
          background-color: rgba(10, 132, 255, 0.1);
          color: var(--color-info);
          border: 1px solid rgba(10, 132, 255, 0.2);
        }
        
        .test-button {
          position: relative;
          display: inline-block;
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
          margin-top: var(--space-md);
          z-index: 1;
        }
        
        .test-button:hover {
          background-color: var(--color-primary-dark);
          box-shadow: var(--elevation-2);
          transform: translateY(-2px);
        }
        
        .test-button:active {
          transform: translateY(0);
          box-shadow: var(--elevation-1);
        }
      `;
    }
    
    // Helper methods
    getStatusClass() {
      switch(this.status) {
        case 'OK': return 'ok';
        case 'TESTING': return 'testing';
        case 'WARNING': return 'warning';
        case 'ERROR': return 'error';
        default: return 'ok';
      }
    }
  }
  
  // Define the element if it doesn't exist
  if (!customElements.get('test-element')) {
    customElements.define('test-element', TestElement);
    console.log('[TestElement] Custom element defined');
  }
  
  return TestElement;
}