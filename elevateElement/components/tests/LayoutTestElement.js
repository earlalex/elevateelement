// elevateElement/components/tests/LayoutTestElement.js

import { ElevateElement } from '../../elevateElement.js';

export function LayoutTestElementBuilder() {
  class LayoutTestElement extends ElevateElement {
    constructor() {
      super('layout-test-element');
      
      this.state = {
        activeTab: 'grid'
      };
      
      // Create shadow root only if it doesn't exist
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
      }
    }

    connectedCallback() {
      super.connectedCallback();
      console.log('[LayoutTestElement] connected');
      
      // Initial render
      this.shadowRoot.innerHTML = this.render();
      
      // Add event listeners
      this.addEventListeners();
    }

    disconnectedCallback() {
      // Remove event listeners
      this.removeEventListeners();
      
      super.disconnectedCallback && super.disconnectedCallback();
    }
    
    addEventListeners() {
      const gridTab = this.shadowRoot.querySelector('#grid-tab');
      const flexTab = this.shadowRoot.querySelector('#flex-tab');
      
      if (gridTab) {
        gridTab.addEventListener('click', () => this.setActiveTab('grid'));
      }
      
      if (flexTab) {
        flexTab.addEventListener('click', () => this.setActiveTab('flex'));
      }
    }
    
    removeEventListeners() {
      const gridTab = this.shadowRoot.querySelector('#grid-tab');
      const flexTab = this.shadowRoot.querySelector('#flex-tab');
      
      if (gridTab) {
        gridTab.removeEventListener('click', () => this.setActiveTab('grid'));
      }
      
      if (flexTab) {
        flexTab.removeEventListener('click', () => this.setActiveTab('flex'));
      }
    }
    
    setActiveTab(tab) {
      this.state.activeTab = tab;
      this.shadowRoot.innerHTML = this.render();
      this.addEventListeners();
    }

    renderGridLayout() {
      return `
        <div class="grid-container">
          <div class="grid-item header">Header</div>
          <div class="grid-item sidebar">Sidebar</div>
          <div class="grid-item content">Content Area</div>
          <div class="grid-item footer">Footer</div>
        </div>
      `;
    }
    
    renderFlexLayout() {
      return `
        <div class="flex-container">
          <div class="flex-header">Header</div>
          <div class="flex-main">
            <div class="flex-sidebar">Sidebar</div>
            <div class="flex-content">Content Area</div>
          </div>
          <div class="flex-footer">Footer</div>
        </div>
      `;
    }

    render() {
      return `
        <style>
          :host {
            display: block;
            font-family: sans-serif;
            padding: 1rem;
            color: #333;
          }
          
          .tabs {
            display: flex;
            margin-bottom: 1rem;
            border-bottom: 1px solid #ddd;
          }
          
          .tab {
            padding: 0.5rem 1rem;
            cursor: pointer;
            margin-right: 0.5rem;
            border: 1px solid #ddd;
            border-bottom: none;
            border-radius: 4px 4px 0 0;
            background: #f5f5f5;
          }
          
          .tab.active {
            background: #6200ea;
            color: white;
          }
          
          /* Grid Layout Styles */
          .grid-container {
            display: grid;
            grid-template-areas:
              "header header header"
              "sidebar content content"
              "footer footer footer";
            grid-template-columns: 200px 1fr 1fr;
            grid-template-rows: auto 1fr auto;
            grid-gap: 10px;
            height: 300px;
          }
          
          .grid-item {
            padding: 1rem;
            border-radius: 4px;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .header { grid-area: header; background: #ddd; }
          .sidebar { grid-area: sidebar; background: #eee; }
          .content { grid-area: content; background: #f9f9f9; }
          .footer { grid-area: footer; background: #ddd; }
          
          /* Flex Layout Styles */
          .flex-container {
            display: flex;
            flex-direction: column;
            height: 300px;
          }
          
          .flex-header, .flex-footer {
            background: #ddd;
            padding: 1rem;
            text-align: center;
          }
          
          .flex-main {
            display: flex;
            flex: 1;
          }
          
          .flex-sidebar {
            background: #eee;
            width: 200px;
            padding: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .flex-content {
            background: #f9f9f9;
            flex: 1;
            padding: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        </style>

        <div class="layout-test-container">
          <div class="tabs">
            <div id="grid-tab" class="tab ${this.state.activeTab === 'grid' ? 'active' : ''}">CSS Grid</div>
            <div id="flex-tab" class="tab ${this.state.activeTab === 'flex' ? 'active' : ''}">Flexbox</div>
          </div>
          
          <div class="layout-content">
            ${this.state.activeTab === 'grid' ? this.renderGridLayout() : this.renderFlexLayout()}
          </div>
          
          <div class="layout-info" style="margin-top: 1rem; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
            <p><strong>Current Layout:</strong> ${this.state.activeTab === 'grid' ? 'CSS Grid' : 'Flexbox'}</p>
            <p>Click the tabs above to switch between different layout techniques.</p>
          </div>
        </div>
      `;
    }
  }

  customElements.define('layout-test-element', LayoutTestElement);
}