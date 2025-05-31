// features/protection.js
export function addProtection(BaseElement) {
  return class extends BaseElement {
    constructor(...args) {
      super(...args);
      this.__Protected__ = this.__Protected__ || {
        Methods: [],
        Properties: [],
      };
      this.__Interface__ = this.__Interface__ || {};
      this.#setupProtection();
    }

    // Modern method to identify protected keys
    #isProtected(key) {
      return typeof key === "string" && key.startsWith("__");
    }

    // Set up protected method/property tracking
    #setupProtection() {
      Object.getOwnPropertyNames(this).forEach((key) => {
        if (this.#isProtected(key)) this.__Protected__.Properties.push(key);
      });

      const proto = Object.getPrototypeOf(this);
      Object.getOwnPropertyNames(proto).forEach((key) => {
        if (this.#isProtected(key) && typeof proto[key] === "function") {
          this.__Protected__.Methods.push(key);
        }
      });
    }

    // Optional: runtime type enforcement (simplified)
    #validateMethodArgs(method, args) {
      const expected = this.__Interface__[method];
      if (!expected || typeof expected !== "object") return true;
      for (let key in expected) {
        const expectedType = expected[key];
        const actualType = typeof args[key];
        if (expectedType !== "any" && actualType !== expectedType) {
          throw new TypeError(
            `Argument "${key}" in ${method} expected to be ${expectedType}, got ${actualType}`
          );
        }
      }
    }

    // Use this in your methods
    __callProtected(methodName, args = {}) {
      if (!this.__Protected__.Methods.includes(methodName)) {
        throw new ReferenceError(
          `Attempt to access protected method: ${methodName}`
        );
      }
      this.#validateMethodArgs(methodName, args);
      return this[methodName](args);
    }
  };
}

/**
 * Protection Feature - Provides error boundaries and fallback mechanisms
 */

import registry from './componentRegistry.js';
import { Router } from './router.js';
import { allViews } from '../../views/index.js';

/**
 * Creates a view rendering error boundary/protection system
 */
function createViewProtection() {
  console.log('[Protection] Setting up view rendering protection');
  
  // Add global error handler for uncaught errors
  window.addEventListener('error', function(event) {
    const error = event.error;
    
    // Check if error is related to view rendering
    if (error && (
      error.message.includes('view') || 
      error.message.includes('render') || 
      error.stack?.includes('views/')
    )) {
      console.error('[Protection] View rendering error caught:', error);
      handleViewRenderingError(error);
      
      // Prevent default error handling
      event.preventDefault();
      return false;
    }
  });
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    const error = event.reason;
    
    // Check if error is related to view rendering
    if (error && (
      error.message?.includes('view') ||
      error.message?.includes('render') ||
      error.stack?.includes('views/')
    )) {
      console.error('[Protection] Async view rendering error caught:', error);
      handleViewRenderingError(error);
      
      // Prevent default error handling
      event.preventDefault();
      return false;
    }
  });
  
  // Set up recovery for specific view errors
  const originalSetupRoutes = Router.setupRoutes;
  Router.setupRoutes = function(views) {
    // Wrap each view's load method with error handling
    views.forEach(view => {
      if (view.path && typeof view.load === 'function') {
        const originalLoad = view.load;
        view.load = async function(params) {
          try {
            return await originalLoad.call(view, params);
          } catch (error) {
            console.error(`[Protection] Error in ${view.path} view:`, error);
            handleViewRenderingError(error, view.path);
            return false;
          }
        };
      }
    });
    
    return originalSetupRoutes.call(Router, views);
  };
  
  console.log('[Protection] View protection initialized');
  return true;
}

/**
 * Handle view rendering errors with fallback content
 */
function handleViewRenderingError(error, path = null) {
  const main = document.querySelector('main[data-elevateElement="view"]');
  if (!main) {
    console.error('[Protection] Cannot find main element to display error');
    return;
  }
  
  // Get current path if not provided
  if (!path) {
    path = Router.parsePath();
  }
  
  // Create error message
  const errorMessage = error?.message || 'Unknown error occurred';
  const errorStack = error?.stack || '';
  
  // Create error UI
  const errorContainer = document.createElement('div');
  errorContainer.className = 'view-error-container';
  errorContainer.style.padding = '20px';
  errorContainer.style.margin = '20px';
  errorContainer.style.backgroundColor = '#ffebee';
  errorContainer.style.border = '1px solid #ffcdd2';
  errorContainer.style.borderRadius = '4px';
  errorContainer.style.color = '#c62828';
  
  // Generate content based on path
  let errorContent = `
    <h2>Error Rendering View: ${path}</h2>
    <p>${errorMessage}</p>
    <div style="margin: 20px 0;">
      <button onclick="window.location.reload()" style="margin-right: 10px; padding: 8px 16px;">
        Reload Page
      </button>
      <a href="/" style="padding: 8px 16px;">
        Go to Home
      </a>
    </div>
  `;
  
  // Add debugging info in development mode
  if (process.env.NODE_ENV !== 'production') {
    errorContent += `
      <details>
        <summary>Error Details (Development Only)</summary>
        <pre style="margin-top: 10px; background: #f8f8f8; padding: 10px; overflow: auto; max-height: 300px;">
          ${errorStack}
        </pre>
      </details>
    `;
  }
  
  errorContainer.innerHTML = errorContent;
  
  // Make sure to remove any loading indicators or previous error states
  const existingError = main.querySelector('.view-error-container');
  if (existingError) {
    existingError.remove();
  }
  
  // Clear and append error
  main.appendChild(errorContainer);
  
  // Ensure it's visible
  main.style.display = 'block';
  main.style.visibility = 'visible';
  main.style.opacity = '1';
  
  // Log to console for debugging
  console.error(`[Protection] View error handled for path: ${path}`, error);
}

// Register with component registry
registry.register('protection', createViewProtection, ['router']);

export { createViewProtection };
