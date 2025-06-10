// elevateElement/features/core/router.js
import { About } from '../../views/About.js';
import { Config } from '../../views/Config.js';
import { Contact } from '../../views/Contact.js';
import { Home } from '../../views/Home.js';
import { Tests } from '../../views/Tests.js';
const allViews = [Home,About,Contact,Tests,Config]

function getBasePath() {
  const mainScriptTag = document.querySelector('script[src*="elevateElement.js"][type="module"]');
  let basePath = '/';

  if (mainScriptTag && mainScriptTag.src) {
    const mainScriptUrl = new URL(mainScriptTag.src, window.location.href); // Ensure it's absolute
    const pathName = mainScriptUrl.pathname;
    const scriptNamePart = 'elevateElement/elevateElement.js';

    if (pathName.includes(scriptNamePart)) { // Use includes for flexibility if path has params
      basePath = pathName.substring(0, pathName.indexOf(scriptNamePart));
    }
  } else {
    console.warn('[Router-BasePath] Could not reliably determine base path from script tag. Falling back to root "/". Configure manually if in a subfolder and experiencing issues.');
  }

  // Ensure basePath always starts and ends with a slash if it's not just "/"
  if (!basePath.startsWith('/')) basePath = '/' + basePath;
  if (basePath.length > 1 && !basePath.endsWith('/')) basePath += '/';

  // console.log('[Router-BasePath] Using base path:', basePath);
  return basePath;
}

class InternalRouter {
  constructor() {
    this.basePath = getBasePath();
    this.routes = {};
    this.subscribers = new Set();
    this.cache = new Map();
    this.useHistory = typeof window !== 'undefined' && !!(window.history && window.history.pushState);
    this.initialized = false;
    this.currentPath = '/';
    this.isNavigating = false;
    
    // Add event listeners for navigation
    this.handleRouteChangeBound = () => this.handleRouteChange();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', this.handleRouteChangeBound);
      window.addEventListener('hashchange', this.handleRouteChangeBound);
    }
    
    // Add link click handler
    if (typeof window !== 'undefined') {
        document.addEventListener('click', (e) => {
            // Find closest anchor tag
            const link = e.target.closest('a');
            if (!link) return;
            
            // Check if it's an internal link
            const href = link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:')) {
                return;
            }
            
            // Prevent default navigation
            e.preventDefault();
            
            // Use internal router
            this.navigate(href);
        });
        
        window.addEventListener('popstate', this.handleRouteChangeBound);
        window.addEventListener('hashchange', this.handleRouteChangeBound);
    }
  }

  // Add destructor method
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('popstate', this.handleRouteChangeBound);
      window.removeEventListener('hashchange', this.handleRouteChangeBound);
    }
    this.subscribers.clear();
    this.cache.clear();
  }

  async initialize() {
    if (this.initialized) return;
    
    // Remove direct Views reference
    // await loadViews();
    
    // Initial route handling
    this.handleRouteChange();
    
    // Setup global error handler
    window.addEventListener('error', (event) => {
      if (event.error && event.error.message.includes('router')) {
        this.showErrorModal('Navigation error occurred. Please try again.');
      }
    });

    this.initialized = true;
  }

  parsePath() {
    let fullPath;
    if (this.useHistory) {
      fullPath = decodeURI(window.location.pathname);
    } else {
      fullPath = decodeURI(window.location.hash.replace(/^#/, '')) || '/';
      if (!fullPath.startsWith('/')) {
        fullPath = '/' + fullPath;
      }
    }

    if (fullPath.startsWith(this.basePath)) {
      let appPath = fullPath.substring(this.basePath.length);
      if (!appPath.startsWith('/')) {
        appPath = '/' + appPath;
      }
      // console.log(`[Router] parsePath: fullPath="${fullPath}", basePath="${this.basePath}", appPath="${appPath}"`);
      return appPath;
    } else {
      // This case should ideally not happen if basePath is derived correctly from the entry point.
      // It might indicate user navigated outside the app's known base.
      // For robustness, return the full path, but log a warning.
      console.warn(`[Router] parsePath: Current path "${fullPath}" does not start with base path "${this.basePath}". Using full path.`);
      return fullPath;
    }
  }

  matchRoute(path) {
    const routeKeys = Object.keys(this.routes);

    for (const pattern of routeKeys) {
      const paramNames = [];
      const regexPattern = pattern
        .replace(/\/:([^\/]+)/g, (_, key) => {
          paramNames.push(key);
          return '/([^/]+)';
        })
        .replace(/\//g, '\\/');

      const regex = new RegExp(`^${regexPattern}$`);
      const match = path.match(regex);

      if (match) {
        const params = {};
        paramNames.forEach((name, index) => {
          params[name] = decodeURIComponent(match[index + 1]);
        });
        return { handler: this.routes[pattern], params };
      }
    }

    return null;
  }

  notifySubscribers(path, params = {}) {
    // Only notify if path actually changed
    if (path === this.currentPath) return;
    
    this.currentPath = path;
    this.subscribers.forEach(handler => {
      try {
        handler(path, params);
      } catch (error) {
        console.error('Router subscriber error:', error);
      }
    });
  }

  async executeRouteHandler(handler, params) {
      try {
          return await handler(params);
      } catch (error) {
          console.error('Route handler execution failed:', error);
          throw new Error(`Failed to execute route handler: ${error.message}`);
      }
  }
  
  handleRouteChange() {
    if (this.isNavigating) {
      console.log('Router: Navigation already in progress, skipping');
      return;
    }
    
    this.isNavigating = true;
    
    // Ensure isNavigating is reset even if an error occurs
    const resetNavigationState = () => {
      this.isNavigating = false;
    };

    // Path variable declared here to be accessible in catch block
    let path;
    try {
      path = this.parsePath(); // Use the new base-path aware parsePath
      const match = this.matchRoute(path);
      const main = document.querySelector('main') || document.getElementById('main');
      
      if (!main) {
        console.error('Router: No main element found');
        this.isNavigating = false; // Reset flag if main isn't found
        return;
      }

      if (match && typeof match.handler === 'function') {
        const result = this.executeRouteHandler(match.handler, match.params);
        
        if (result instanceof Promise) {
          result
            .then(success => {
              const loadingIndicator = main.querySelector('.route-loading-indicator');
              if (loadingIndicator) loadingIndicator.remove();
              setTimeout(() => {
                if (main.children.length === 0) {
                  console.warn('Router: No content rendered after route handler completed');
                  main.innerHTML = `<div style="padding:20px;"><h2 style="color:#6200ea;">Content Not Rendered</h2><p>The view handler succeeded but did not render any content.</p></div>`;
                }
                Array.from(main.children).forEach(child => {
                  child.style.display = 'block';
                  child.style.visibility = 'visible';
                  child.style.opacity = '1';
                });
              }, 100);
            })
            .catch(error => {
              console.error(`Router: Error loading route ${path}:`, error);
              main.innerHTML = `<div style="padding: 20px; background-color: #ffebee; color: #c62828; border: 1px solid #ffcdd2; border-radius: 4px; margin: 20px;"><h2>Error Loading Route</h2><p>${error.message || 'Unknown error'}</p><button onclick="window.location.reload()">Reload Page</button></div>`;
            })
            .finally(resetNavigationState);
        } else {
          const loadingIndicator = main.querySelector('.route-loading-indicator');
          if (loadingIndicator) loadingIndicator.remove();
          setTimeout(() => {
            Array.from(main.children).forEach(child => {
              child.style.display = 'block';
              child.style.visibility = 'visible';
              child.style.opacity = '1';
            });
          }, 100);
          this.isNavigating = false;
        }
        this.notifySubscribers(path, match.params);
      } else {
        console.warn(`Router: No route matched for ${path}`);
        this.notifySubscribers(path, {}); // Notify with empty params for 404 listeners
        this.showErrorModal(`Page not found: ${path}`);
        this.isNavigating = false;
      }
    } catch (error) {
      console.error(`Router: Error handling route ${path !== undefined ? path : '(unknown path)'}:`, error);
      this.isNavigating = false;
    }
}

    updateURL(internalPath) {
      // internalPath is app-relative, e.g., '/', '/about'
      let displayPath;
      if (this.basePath === '/') {
        displayPath = internalPath;
      } else {
        // Ensure basePath ends with / (it should from getBasePath)
        // Ensure internalPath starts with / (it should)
        if (internalPath === '/') {
          // If internal path is root, display path is just the base path (e.g., /myrepo/)
          displayPath = this.basePath;
        } else {
          // If internal path is /about, display path is /myrepo/about
          // this.basePath already ends with a slash. internalPath starts with one.
          displayPath = this.basePath + internalPath.substring(1);
        }
      }

      // Normalize: remove trailing slash if not root, ensure leading slash
      if (!displayPath.startsWith('/')) displayPath = '/' + displayPath;
      if (displayPath !== '/' && displayPath.endsWith('/')) {
        displayPath = displayPath.slice(0, -1);
      }
      // If displayPath became empty (e.g. basePath was '/' and internalPath was '/'), set to '/'
      if (displayPath === '') displayPath = '/';

      const currentBrowserPath = this.useHistory
                                  ? decodeURI(window.location.pathname)
                                  : (decodeURI(window.location.hash.replace(/^#/, '')) || '/');

      // Normalize currentBrowserPath for comparison, especially for root hash
      let normalizedCurrentBrowserPath = currentBrowserPath;
      if (!this.useHistory && (currentBrowserPath === '' || currentBrowserPath === '/')) {
         // Default hash path is often just "#" or "#/", representing app's root
         // If internalPath is also root, then displayPath (after hash logic) should match this.
      } else if (!currentBrowserPath.startsWith('/')) {
        normalizedCurrentBrowserPath = '/' + normalizedCurrentBrowserPath;
      }


      if (normalizedCurrentBrowserPath === displayPath && this.currentPath === internalPath) {
         // console.log(`[Router] updateURL: Path ${displayPath} already matches browser and internal state.`);
         return;
      }

      if (this.useHistory) {
        window.history.pushState({ path: internalPath }, '', displayPath);
      } else {
        // For hash mode, the path after # should be the internalPath, typically without leading slash
        // unless it's just the root.
        let hashPath = internalPath.startsWith('/') ? internalPath.substring(1) : internalPath;
        if (internalPath === '/') hashPath = '/'; // For root, often represented as #/ or just #

        // If basePath is not '/', and we want hashes like #/subfolder/about, then:
        // hashPath = displayPath.startsWith('/') ? displayPath.substring(1) : displayPath;
        // However, simpler hashes like #/about are more common.
        // The current logic makes hash paths relative to the application's logical root.

        const newHash = `#${hashPath}`;
        if (window.location.hash !== newHash) {
            window.location.hash = newHash;
        }
      }
      // console.log(`[Router] Browser URL update attempted for display: ${displayPath} (internal: ${internalPath})`);
    }

  navigate(path) {
    try {
      if (!this.initialized) {
        console.warn('Router not initialized. Call router.initialize() first.');
        return;
      }

      // Normalize path first
      path = path.startsWith('/') ? path : `/${path}`;
      
      // Add additional checks
      if (this.isNavigating || path === this.currentPath) {
        console.log('Router: Navigation blocked - already navigating or on current path');
        return;
      }

      // Set flag and clear after timeout
      this.isNavigating = true;
      const navigationTimeout = setTimeout(() => {
        this.isNavigating = false;
      }, 5000); // 5 second safety timeout

      // Try internal routing
      const match = this.matchRoute(path);
      if (match && typeof match.handler === 'function') {
        try {
          const result = this.executeRouteHandler(match.handler, match.params);
          
          if (result instanceof Promise) {
            result
              .then(() => {
                this.updateURL(path);
                this.closeMenu();
                this.notifySubscribers(path, match.params);
              })
              .catch(error => {
                console.error('Router: Failed to render content:', error);
                this.showErrorModal('Failed to load page content. Please try again.');
              })
              .finally(() => {
                clearTimeout(navigationTimeout);
                this.isNavigating = false;
              });
          } else {
            this.updateURL(path);
            this.closeMenu();
            this.notifySubscribers(path, match.params);
            clearTimeout(navigationTimeout);
            this.isNavigating = false;
          }
        } catch (error) {
          console.error('Router: Error in route handler:', error);
          this.showErrorModal('Navigation failed. Please try again.');
          clearTimeout(navigationTimeout);
          this.isNavigating = false;
        }
      } else {
        this.handle404(path);
        clearTimeout(navigationTimeout);
        this.isNavigating = false;
      }
    } catch (error) {
      console.error('Router navigation error:', error);
      this.isNavigating = false;
      this.showErrorModal('Navigation failed. Please try again.');
    }
  }

  prefetch(path) {
    if (this.cache.has(path)) return;

    const match = this.matchRoute(path);
    if (match && typeof match.handler === 'function') {
      try {
        const result = match.handler();
        if (result instanceof Promise) {
          result.then(() => {
            this.cache.set(path, true);
          }).catch(error => console.error('Router prefetch error:', error));
        } else {
          this.cache.set(path, true);
        }
      } catch (error) {
        console.error('Router prefetch error:', error);
      }
    }
  }

  onRouteChange(handler) {
    if (typeof handler === 'function') {
      this.subscribers.add(handler);
      return () => this.subscribers.delete(handler);
    }
    return () => {};
  }

  setupRoutes(views = []) {
    views.forEach(view => {
      if (view.path && typeof view.load === 'function') {
        this.routes[view.path] = view.load;
      }
      if (Array.isArray(view.children)) {
        this.setupRoutes(view.children); // Recursively setup nested routes
      }
    });
  }

  showErrorModal(message) {
    if (document.querySelector('#router-error-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'router-error-modal';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.background = 'white';
    modal.style.color = 'black';
    modal.style.padding = '2rem';
    modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
    modal.style.zIndex = '9999';
    modal.style.borderRadius = '8px';
    modal.style.textAlign = 'center';
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.5s ease';

    modal.innerHTML = `
      <p style="margin-bottom:1rem;">${message}</p>
      <div style="display:flex; flex-direction:column; gap:0.5rem;">
        <button id="router-error-close" style="padding:0.5rem 1rem;">Close</button>
        <button id="router-go-home" style="padding:0.5rem 1rem;">Go Home</button>
      </div>
    `;

    document.body.appendChild(modal);

    requestAnimationFrame(() => {
      modal.style.opacity = '1';
    });

    const closeBtn = document.getElementById('router-error-close');
    const homeBtn = document.getElementById('router-go-home');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.opacity = '0';
        setTimeout(() => {
          if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
          }
        }, 500);
      });
    }

    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        if (window.ElevateRouter && typeof window.ElevateRouter.navigate === 'function') {
          window.ElevateRouter.navigate('/');
        } else {
          window.location.href = '/';
        }

        modal.style.opacity = '0';
        setTimeout(() => {
          if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
          }
        }, 500);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (modal) {
          modal.style.opacity = '0';
          setTimeout(() => {
            if (modal.parentNode) {
              modal.parentNode.removeChild(modal);
            }
          }, 500);
        }
      }
    }, { once: true });
  }

  // Reset content rendered flags for all views
  resetViewState() {
    // Modify to avoid direct Views reference
    if (this.routes) {
      Object.values(this.routes).forEach(route => {
        if (route.contentRendered !== undefined) {
          route.contentRendered = false;
        }
      });
    }
  }

  /**
   * Force close the mobile menu
   * This is a utility function called after navigation
   */
  closeMenu() {
    console.log('[Router] Closing mobile menu');
    
    // Use the state management if available
    if (typeof window !== 'undefined' && window.menuState && typeof window.menuState.close === 'function') {
      window.menuState.close();
      return;
    }
    
    // Fallback to direct DOM manipulation if state management is not available
    // Try each possible menu selector
    const menuSelectors = [
      '#main-navigation-menu',
      '.main-menu',
      'menu.main-menu',
      'ul.main-menu',
      '[id^="main-navigation"]'
    ];
    
    // Try each possible button selector
    const buttonSelectors = [
      '.hamburger-button',
      '[aria-label="Toggle navigation menu"]',
      '[class*="hamburger"]'
    ];
    
    // Close all possible menus - more thorough approach
    menuSelectors.forEach(selector => {
      const menuElements = document.querySelectorAll(selector);
      menuElements.forEach(menu => {
        if (menu) {
          // Remove active class - this should trigger CSS to hide the menu
          menu.classList.remove('active');
          // Remove other potential active classes
          menu.classList.remove('nav-open');
          // Avoid direct style manipulation for display:none here
        }
      });
    });
    
    // Reset all possible buttons
    buttonSelectors.forEach(selector => {
      const buttonElements = document.querySelectorAll(selector);
      buttonElements.forEach(button => {
        if (button) {
          button.classList.remove('active');
          button.setAttribute('aria-expanded', 'false');
        }
      });
    });
    
    // Also find any nav elements with nav-open class
    const navElements = document.querySelectorAll('nav[data-elevateElement="navigation"], nav.nav-open');
    navElements.forEach(nav => {
      if (nav) {
        nav.classList.remove('nav-open');
      }
    });
    
    // Reset body overflow
    document.body.style.overflow = '';
    
    // Force CSS to be recomputed
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        // Double-check menus are closed after layout by ensuring classes are removed
        // No direct style manipulation here, rely on CSS rules via classes
        menuSelectors.forEach(selector => {
          const menuElements = document.querySelectorAll(selector);
          menuElements.forEach(menu => {
            if (menu && !menu.classList.contains('active')) {
              // If it's still not hidden by CSS, this is a deeper issue
              // but we avoid forcing display:none from JS here.
              // console.log('[Router] Fallback closeMenu: menu still visible after class removal in rAF for selector:', selector);
            }
          });
        });
      });
    }
    
    // Dispatch a custom event that other components can listen for
    document.dispatchEvent(new CustomEvent('menuClosed'));
  }
}

// Export Singleton Router
const Router = new InternalRouter();
Router.setupRoutes(allViews);

// Make Router globally accessible
if (typeof window !== 'undefined') {
  window.ElevateRouter = Router;
}

// Export Feature Mixin
export function addRouting(BaseElement) {
  return class extends BaseElement {
    constructor() {
      super();
      this.router = {
        navigate: Router.navigate.bind(Router),
        prefetch: Router.prefetch.bind(Router),
        onRouteChange: Router.onRouteChange.bind(Router),
      };
    }
  };
}

export { Router };