import { renderView } from '../utils/index.js';

// Initialize a global store to hold site configuration
if (typeof window !== 'undefined' && !window.ElevateStore) {
  window.ElevateStore = {
    initialized: false,
    config: {
      framework: {
        useShadowDOM: true,
        router: {
          type: "history",
          root: "/"
        },
        debug: true
      },
      components: {
        autoRegister: true,
        templateEngine: "native"
      },
      performance: {
        lazyLoadViews: true,
        cacheViews: true,
        cacheDuration: 3600
      },
      site: {
        name: "",
        title: "",
        description: "",
        primaryColor: "#6200ea",
        logo: "",
        contactEmail: ""
      }
    }
  };
  
  // Attempt to load saved config from localStorage
  try {
    const savedConfig = localStorage.getItem('elevateElementConfig');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      window.ElevateStore.config = { ...window.ElevateStore.config, ...parsedConfig };
      
      // Check if site info is complete to determine initialization status
      const siteInfo = window.ElevateStore.config.site;
      window.ElevateStore.initialized = Boolean(
        siteInfo.name && siteInfo.title && siteInfo.description && siteInfo.contactEmail
      );
      
      console.log('[Config] Loaded configuration from storage, initialization status:', 
        window.ElevateStore.initialized ? 'Complete' : 'Incomplete');
    } else {
      console.log('[Config] No saved configuration found, initialization required');
    }
  } catch (error) {
    console.error('[Config] Error loading saved configuration:', error);
  }
}

export const Config = {
    path: '/config',
    title: 'Config',
    content: `
      <section>
        <h1>ElevateElement Configuration</h1>
        
        <div id="config-status" class="config-status">
          <div class="status-indicator ${window.ElevateStore?.initialized ? 'complete' : 'incomplete'}">
            <span class="status-icon">${window.ElevateStore?.initialized ? '✓' : '!'}</span>
            <span class="status-text">${window.ElevateStore?.initialized ? 'Configuration Complete' : 'Configuration Required'}</span>
          </div>
          <p class="status-message">${window.ElevateStore?.initialized 
            ? 'Your application is properly configured and ready to use.' 
            : 'Please complete the site information below to initialize your application.'}</p>
        </div>
        
        <div class="config-panel">
          <h2>Framework Configuration</h2>
          
          <div class="config-group">
            <h3>Framework Settings</h3>
            <div class="config-item">
              <div class="config-label">Shadow DOM</div>
              <div class="config-control">
                <label class="toggle">
                  <input type="checkbox" id="shadow-dom-toggle" checked>
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">Enabled</span>
                </label>
              </div>
            </div>
            <div class="config-item">
              <div class="config-label">Router Type</div>
              <div class="config-control">
                <select id="router-type">
                  <option value="history" selected>History API</option>
                  <option value="hash">Hash-based</option>
                </select>
              </div>
            </div>
            <div class="config-item">
              <div class="config-label">Debug Mode</div>
              <div class="config-control">
                <label class="toggle">
                  <input type="checkbox" id="debug-mode-toggle" checked>
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">Enabled</span>
                </label>
              </div>
            </div>
          </div>
          
          <div class="config-group">
            <h3>Component Settings</h3>
            <div class="config-item">
              <div class="config-label">Auto Register Components</div>
              <div class="config-control">
                <label class="toggle">
                  <input type="checkbox" id="auto-register-toggle" checked>
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">Enabled</span>
                </label>
              </div>
            </div>
            <div class="config-item">
              <div class="config-label">Default Template Engine</div>
              <div class="config-control">
                <select id="template-engine">
                  <option value="native" selected>Native Template Literals</option>
                  <option value="handlebars">Handlebars</option>
                  <option value="lit-html">lit-html</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div class="config-panel required-panel">
          <h2>Site Information <span class="required-indicator">*</span></h2>
          <p class="required-message">Required for initialization</p>
          
          <div class="config-group">
            <div class="config-item">
              <div class="config-label">Site Name <span class="required-indicator">*</span></div>
              <div class="config-control">
                <input type="text" id="site-name" placeholder="My Awesome Site" value="${window.ElevateStore?.config?.site?.name || ''}">
              </div>
            </div>
            <div class="config-item">
              <div class="config-label">Site Title <span class="required-indicator">*</span></div>
              <div class="config-control">
                <input type="text" id="site-title" placeholder="My Awesome Site - A Web Application" value="${window.ElevateStore?.config?.site?.title || ''}">
              </div>
            </div>
            <div class="config-item">
              <div class="config-label">Site Description <span class="required-indicator">*</span></div>
              <div class="config-control">
                <textarea id="site-description" placeholder="A brief description of your site">${window.ElevateStore?.config?.site?.description || ''}</textarea>
              </div>
            </div>
            <div class="config-item">
              <div class="config-label">Primary Color</div>
              <div class="config-control color-control">
                <input type="color" id="primary-color" value="${window.ElevateStore?.config?.site?.primaryColor || '#6200ea'}">
                <input type="text" id="color-text" value="${window.ElevateStore?.config?.site?.primaryColor || '#6200ea'}" class="color-text">
              </div>
            </div>
            <div class="config-item">
              <div class="config-label">Logo URL</div>
              <div class="config-control">
                <input type="text" id="logo-url" placeholder="/assets/images/logo.png" value="${window.ElevateStore?.config?.site?.logo || ''}">
              </div>
            </div>
            <div class="config-item">
              <div class="config-label">Contact Email <span class="required-indicator">*</span></div>
              <div class="config-control">
                <input type="email" id="contact-email" placeholder="contact@example.com" value="${window.ElevateStore?.config?.site?.contactEmail || ''}">
              </div>
            </div>
          </div>
        </div>
        
        <div class="config-actions">
          <button id="reset-config" class="action-button secondary">Reset</button>
          <button id="save-config" class="action-button primary">Save Configuration</button>
        </div>
        
        <div id="config-preview" class="config-panel">
          <h2>Configuration Preview</h2>
          <div class="json-display">
            <pre><code id="config-json">Loading...</code></pre>
          </div>
        </div>
      </section>
      
      <style>
        section {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }
        
        h1 {
          color: #6200ea;
          margin-bottom: 25px;
        }
        
        h2 {
          color: #333;
          margin: 30px 0 15px;
          font-size: 1.6rem;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
          display: flex;
          align-items: center;
        }
        
        h3 {
          color: #555;
          margin: 20px 0 10px;
          font-size: 1.2rem;
        }
        
        /* Status Indicator */
        .config-status {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          border-left: 5px solid #ccc;
        }
        
        .config-status.initialized {
          border-left-color: #4caf50;
        }
        
        .config-status.not-initialized {
          border-left-color: #ff9800;
        }
        
        .status-indicator {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .status-indicator.complete {
          color: #2e7d32;
        }
        
        .status-indicator.incomplete {
          color: #e65100;
        }
        
        .status-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          margin-right: 10px;
          font-weight: bold;
        }
        
        .status-indicator.complete .status-icon {
          background-color: rgba(76, 175, 80, 0.2);
        }
        
        .status-indicator.incomplete .status-icon {
          background-color: rgba(255, 152, 0, 0.2);
        }
        
        .status-text {
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        .status-message {
          margin: 0;
          color: #555;
        }
        
        /* Required indicator */
        .required-indicator {
          color: #f44336;
          margin-left: 4px;
        }
        
        .required-message {
          color: #f44336;
          font-style: italic;
          font-size: 0.9rem;
          margin-top: -10px;
          margin-bottom: 20px;
        }
        
        .required-panel {
          border: 1px solid #ffcdd2;
          background-color: #fff;
        }
        
        .required-panel h2 {
          color: #d32f2f;
        }
        
        .config-panel {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        
        .config-group {
          margin-bottom: 25px;
          border-bottom: 1px solid #eee;
          padding-bottom: 15px;
        }
        
        .config-group:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        .config-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px dashed #f0f0f0;
        }
        
        .config-item:last-child {
          border-bottom: none;
        }
        
        .config-label {
          font-weight: 500;
          color: #444;
          flex: 0 0 35%;
        }
        
        .config-control {
          flex: 0 0 60%;
        }
        
        /* Toggle switch */
        .toggle {
          position: relative;
          display: inline-flex;
          align-items: center;
          cursor: pointer;
        }
        
        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
          background-color: #ccc;
          border-radius: 24px;
          transition: .4s;
          margin-right: 10px;
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          border-radius: 50%;
          transition: .4s;
        }
        
        input:checked + .toggle-slider {
          background-color: #6200ea;
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }
        
        .toggle-text {
          font-size: 0.9rem;
          color: #555;
        }
        
        /* Inputs */
        input[type="text"],
        input[type="email"],
        select,
        textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
          font-family: inherit;
        }
        
        input[type="text"]:focus,
        input[type="email"]:focus,
        select:focus,
        textarea:focus {
          border-color: #6200ea;
          outline: none;
          box-shadow: 0 0 0 3px rgba(98, 0, 234, 0.1);
        }
        
        textarea {
          min-height: 80px;
          resize: vertical;
        }
        
        .color-control {
          display: flex;
          align-items: center;
        }
        
        input[type="color"] {
          width: 40px;
          height: 30px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 10px;
        }
        
        .color-text {
          width: 80px;
        }
        
        /* JSON display */
        .json-display {
          margin: 20px 0 0;
          background: #272822;
          border-radius: 6px;
          padding: 15px;
          overflow-x: auto;
        }
        
        .json-display pre {
          margin: 0;
        }
        
        .json-display code {
          color: #f8f8f2;
          font-family: monospace;
          font-size: 14px;
          line-height: 1.5;
        }
        
        /* Buttons */
        .config-actions {
          margin-top: 30px;
          display: flex;
          justify-content: flex-end;
          gap: 15px;
        }
        
        .action-button {
          padding: 12px 20px;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .action-button.primary {
          background-color: #6200ea;
          color: white;
          border: none;
        }
        
        .action-button.primary:hover {
          background-color: #5000ca;
        }
        
        .action-button.secondary {
          background-color: white;
          color: #6200ea;
          border: 1px solid #6200ea;
        }
        
        .action-button.secondary:hover {
          background-color: #f5f0ff;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .config-item {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .config-label, .config-control {
            flex: 0 0 100%;
          }
          
          .config-control {
            margin-top: 8px;
          }
          
          .config-actions {
            flex-direction: column;
          }
          
          .action-button {
            width: 100%;
          }
        }
      </style>
      
      <script>
        // Initialize configuration functionality when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
          // Get references to form elements
          const configForm = {
            shadowDOM: document.getElementById('shadow-dom-toggle'),
            routerType: document.getElementById('router-type'),
            debugMode: document.getElementById('debug-mode-toggle'),
            autoRegister: document.getElementById('auto-register-toggle'),
            templateEngine: document.getElementById('template-engine'),
            siteName: document.getElementById('site-name'),
            siteTitle: document.getElementById('site-title'),
            siteDescription: document.getElementById('site-description'),
            primaryColor: document.getElementById('primary-color'),
            colorText: document.getElementById('color-text'),
            logoUrl: document.getElementById('logo-url'),
            contactEmail: document.getElementById('contact-email'),
            saveButton: document.getElementById('save-config'),
            resetButton: document.getElementById('reset-config'),
            configJson: document.getElementById('config-json')
          };
          
          // Sync color picker with text input
          if (configForm.primaryColor && configForm.colorText) {
            configForm.primaryColor.addEventListener('input', function() {
              configForm.colorText.value = this.value;
              updateConfigPreview();
            });
            
            configForm.colorText.addEventListener('input', function() {
              configForm.primaryColor.value = this.value;
              updateConfigPreview();
            });
          }
          
          // Toggle text updates
          const toggles = document.querySelectorAll('.toggle input[type="checkbox"]');
          toggles.forEach(toggle => {
            toggle.addEventListener('change', function() {
              const toggleText = this.parentNode.querySelector('.toggle-text');
              if (toggleText) {
                toggleText.textContent = this.checked ? 'Enabled' : 'Disabled';
              }
              updateConfigPreview();
            });
          });
          
          // Update JSON preview on any input change
          const allInputs = document.querySelectorAll('input, select, textarea');
          allInputs.forEach(input => {
            input.addEventListener('input', updateConfigPreview);
            input.addEventListener('change', updateConfigPreview);
          });
          
          // Save configuration
          if (configForm.saveButton) {
            configForm.saveButton.addEventListener('click', saveConfiguration);
          }
          
          // Reset configuration
          if (configForm.resetButton) {
            configForm.resetButton.addEventListener('click', function() {
              if (confirm('Are you sure you want to reset all configuration settings? This cannot be undone.')) {
                resetConfiguration();
              }
            });
          }
          
          // Initialize with current values
          loadSavedConfiguration();
          updateConfigPreview();
          
          // Function to update the configuration preview
          function updateConfigPreview() {
            if (!configForm.configJson) return;
            
            const currentConfig = getCurrentConfig();
            configForm.configJson.textContent = JSON.stringify(currentConfig, null, 2);
            
            // Apply syntax highlighting if available
            if (window.hljs) {
              window.hljs.highlightElement(configForm.configJson);
            }
          }
          
          // Function to get current configuration from form values
          function getCurrentConfig() {
            return {
              framework: {
                useShadowDOM: configForm.shadowDOM ? configForm.shadowDOM.checked : true,
                router: {
                  type: configForm.routerType ? configForm.routerType.value : "history",
                  root: "/"
                },
                debug: configForm.debugMode ? configForm.debugMode.checked : true
              },
              components: {
                autoRegister: configForm.autoRegister ? configForm.autoRegister.checked : true,
                templateEngine: configForm.templateEngine ? configForm.templateEngine.value : "native"
              },
              performance: {
                lazyLoadViews: true,
                cacheViews: true,
                cacheDuration: 3600
              },
              site: {
                name: configForm.siteName ? configForm.siteName.value : "",
                title: configForm.siteTitle ? configForm.siteTitle.value : "",
                description: configForm.siteDescription ? configForm.siteDescription.value : "",
                primaryColor: configForm.primaryColor ? configForm.primaryColor.value : "#6200ea",
                logo: configForm.logoUrl ? configForm.logoUrl.value : "",
                contactEmail: configForm.contactEmail ? configForm.contactEmail.value : ""
              }
            };
          }
          
          // Function to save the configuration
          function saveConfiguration() {
            const currentConfig = getCurrentConfig();
            
            // Validate required fields
            const { name, title, description, contactEmail } = currentConfig.site;
            if (!name || !title || !description || !contactEmail) {
              alert('Please fill out all required fields marked with *');
              return;
            }
            
            try {
              // Save to global store
              if (window.ElevateStore) {
                window.ElevateStore.config = currentConfig;
                window.ElevateStore.initialized = true;
                
                // Save to localStorage
                localStorage.setItem('elevateElementConfig', JSON.stringify(currentConfig));
                
                // Update status display
                updateInitializationStatus(true);
                
                alert('Configuration saved successfully!');
                
                // Publish configuration changed event
                const event = new CustomEvent('elevate:config-changed', {
                  detail: { config: currentConfig }
                });
                document.dispatchEvent(event);
              } else {
                throw new Error('Global store not available');
              }
            } catch (error) {
              console.error('[Config] Error saving configuration:', error);
              alert('Error saving configuration: ' + error.message);
            }
          }
          
          // Function to reset the configuration
          function resetConfiguration() {
            const defaultConfig = {
              framework: {
                useShadowDOM: true,
                router: {
                  type: "history",
                  root: "/"
                },
                debug: true
              },
              components: {
                autoRegister: true,
                templateEngine: "native"
              },
              performance: {
                lazyLoadViews: true,
                cacheViews: true,
                cacheDuration: 3600
              },
              site: {
                name: "",
                title: "",
                description: "",
                primaryColor: "#6200ea",
                logo: "",
                contactEmail: ""
              }
            };
            
            // Apply default values to form
            if (configForm.shadowDOM) configForm.shadowDOM.checked = defaultConfig.framework.useShadowDOM;
            if (configForm.routerType) configForm.routerType.value = defaultConfig.framework.router.type;
            if (configForm.debugMode) configForm.debugMode.checked = defaultConfig.framework.debug;
            if (configForm.autoRegister) configForm.autoRegister.checked = defaultConfig.components.autoRegister;
            if (configForm.templateEngine) configForm.templateEngine.value = defaultConfig.components.templateEngine;
            if (configForm.siteName) configForm.siteName.value = defaultConfig.site.name;
            if (configForm.siteTitle) configForm.siteTitle.value = defaultConfig.site.title;
            if (configForm.siteDescription) configForm.siteDescription.value = defaultConfig.site.description;
            if (configForm.primaryColor) configForm.primaryColor.value = defaultConfig.site.primaryColor;
            if (configForm.colorText) configForm.colorText.value = defaultConfig.site.primaryColor;
            if (configForm.logoUrl) configForm.logoUrl.value = defaultConfig.site.logo;
            if (configForm.contactEmail) configForm.contactEmail.value = defaultConfig.site.contactEmail;
            
            // Update toggle texts
            toggles.forEach(toggle => {
              const toggleText = toggle.parentNode.querySelector('.toggle-text');
              if (toggleText) {
                toggleText.textContent = toggle.checked ? 'Enabled' : 'Disabled';
              }
            });
            
            // Reset global store
            if (window.ElevateStore) {
              window.ElevateStore.config = defaultConfig;
              window.ElevateStore.initialized = false;
            }
            
            // Clear localStorage
            localStorage.removeItem('elevateElementConfig');
            
            // Update status
            updateInitializationStatus(false);
            
            // Update preview
            updateConfigPreview();
          }
          
          // Function to load configuration from global store
          function loadSavedConfiguration() {
            if (!window.ElevateStore || !window.ElevateStore.config) return;
            
            const config = window.ElevateStore.config;
            
            // Apply values to form
            if (configForm.shadowDOM) configForm.shadowDOM.checked = config.framework.useShadowDOM;
            if (configForm.routerType) configForm.routerType.value = config.framework.router.type;
            if (configForm.debugMode) configForm.debugMode.checked = config.framework.debug;
            if (configForm.autoRegister) configForm.autoRegister.checked = config.components.autoRegister;
            if (configForm.templateEngine) configForm.templateEngine.value = config.components.templateEngine;
            if (configForm.siteName) configForm.siteName.value = config.site.name || '';
            if (configForm.siteTitle) configForm.siteTitle.value = config.site.title || '';
            if (configForm.siteDescription) configForm.siteDescription.value = config.site.description || '';
            if (configForm.primaryColor) configForm.primaryColor.value = config.site.primaryColor || '#6200ea';
            if (configForm.colorText) configForm.colorText.value = config.site.primaryColor || '#6200ea';
            if (configForm.logoUrl) configForm.logoUrl.value = config.site.logo || '';
            if (configForm.contactEmail) configForm.contactEmail.value = config.site.contactEmail || '';
            
            // Update toggle texts
            toggles.forEach(toggle => {
              const toggleText = toggle.parentNode.querySelector('.toggle-text');
              if (toggleText) {
                toggleText.textContent = toggle.checked ? 'Enabled' : 'Disabled';
              }
            });
            
            // Update initialization status
            updateInitializationStatus(window.ElevateStore.initialized);
          }
          
          // Function to update the initialization status display
          function updateInitializationStatus(isInitialized) {
            const statusContainer = document.getElementById('config-status');
            if (!statusContainer) return;
            
            const statusIndicator = statusContainer.querySelector('.status-indicator');
            const statusIcon = statusContainer.querySelector('.status-icon');
            const statusText = statusContainer.querySelector('.status-text');
            const statusMessage = statusContainer.querySelector('.status-message');
            
            if (isInitialized) {
              statusContainer.classList.add('initialized');
              statusContainer.classList.remove('not-initialized');
              
              if (statusIndicator) {
                statusIndicator.classList.add('complete');
                statusIndicator.classList.remove('incomplete');
              }
              
              if (statusIcon) statusIcon.textContent = '✓';
              if (statusText) statusText.textContent = 'Configuration Complete';
              if (statusMessage) statusMessage.textContent = 'Your application is properly configured and ready to use.';
            } else {
              statusContainer.classList.remove('initialized');
              statusContainer.classList.add('not-initialized');
              
              if (statusIndicator) {
                statusIndicator.classList.remove('complete');
                statusIndicator.classList.add('incomplete');
              }
              
              if (statusIcon) statusIcon.textContent = '!';
              if (statusText) statusText.textContent = 'Configuration Required';
              if (statusMessage) statusMessage.textContent = 'Please complete the site information below to initialize your application.';
            }
          }
        });
      </script>
    `,
    load: async (params = {}) => {
        try {
            // Check if app is initialized before allowing navigation
            if (typeof window !== 'undefined' && 
                window.location.pathname !== '/config' && 
                (!window.ElevateStore || !window.ElevateStore.initialized)) {
                
                console.warn('[Config] Application not initialized, redirecting to config page');
                
                // Don't use router here to avoid dependency issues during initialization
                window.location.href = '/config';
                return false;
            }
            
            // Use the standardized renderView utility 
            return await renderView(Config, 'Config');
        } catch (error) {
            console.error('[Config] Error loading config view:', error);
            return false;
        }
    },
    // Add initialization check method for use by other components
    isInitialized: () => {
        return typeof window !== 'undefined' && 
               window.ElevateStore && 
               window.ElevateStore.initialized === true;
    },
    // Method to get current configuration
    getConfig: () => {
        return (typeof window !== 'undefined' && window.ElevateStore) ? 
               window.ElevateStore.config : null;
    }
};
