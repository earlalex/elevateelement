/**
 * Router Initialization - Ensures Router is properly initialized and integrated with ComponentRegistry
 */

import registry from './componentRegistry.js';
import { Router } from './router.js';

// View refresher that checks content periodically to ensure it stays
let contentCheckInterval = null;
let missingContentFixAttempts = 0;
const MAX_FIX_ATTEMPTS = 3;

// Function to make sure content stays visible
function checkAndFixViewContent() {
  const mainElement = document.querySelector('main[data-elevateElement="view"]');
  
  if (!mainElement) {
    console.warn('[RouterInit] Main element not found in DOM');
    return;
  }
  
  // Check if main is visible
  const mainStyle = window.getComputedStyle(mainElement);
  const isMainVisible = mainStyle.display !== 'none' && 
                        mainStyle.visibility !== 'hidden' && 
                        mainStyle.opacity !== '0';
  
  if (!isMainVisible) {
    console.warn('[RouterInit] Main element not visible, fixing...');
    mainElement.style.display = 'block !important';
    mainElement.style.visibility = 'visible !important';
    mainElement.style.opacity = '1 !important';
  }
  
  // Check if content exists
  const hasContent = mainElement.children.length > 0 && 
                     mainElement.innerHTML.trim() !== '';
  
  if (!hasContent) {
    console.warn('[RouterInit] Main content is empty, attempting to restore from current path');
    
    // Only try a few times to avoid infinite loops
    if (missingContentFixAttempts < MAX_FIX_ATTEMPTS) {
      missingContentFixAttempts++;
      
      // Re-navigate to current path to restore content
      const currentPath = Router.parsePath();
      console.log(`[RouterInit] Re-navigating to ${currentPath} to restore content`);
      Router.navigate(currentPath);
      
      // If still failing after max attempts, show fallback
      if (missingContentFixAttempts === MAX_FIX_ATTEMPTS) {
        mainElement.innerHTML = `
          <div style="padding:20px; margin:20px;">
            <h2 style="color:#6200ea;">Content Could Not Be Restored</h2>
            <p>There was an issue displaying the page content. Please try:</p>
            <ul style="margin-top:10px;">
              <li><a href="/" style="color:#6200ea;">Going to the home page</a></li>
              <li><button onclick="window.location.reload()">Reloading the page</button></li>
            </ul>
          </div>
        `;
      }
    }
  } else {
    // Content exists, reset the counter
    missingContentFixAttempts = 0;
  }
  
  // Add mutation observer to track content changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && !mainElement.children.length) {
        console.warn('[RouterInit] Content was removed, attempting restoration');
        const currentPath = Router.parsePath();
        Router.navigate(currentPath, { force: true });
      }
    });
  });
  
  observer.observe(mainElement, { 
    childList: true,
    subtree: true
  });
  
  // Enhanced visibility check
  if (!isMainVisible) {
    mainElement.setAttribute('style', `
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      position: relative !important;
      z-index: 1 !important;
    `);
  }
}

async function initializeRouter(context) {
  console.log('[RouterInit] Initializing router...');
  
  // Add MutationObserver to monitor content changes
  const mainElement = document.querySelector('main[data-elevateElement="view"]');
  if (mainElement) {
    console.log('[RouterInit] Setting up MutationObserver on main view element');
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          console.log('[RouterInit] View content changed:', {
            addedNodes: mutation.addedNodes.length,
            removedNodes: mutation.removedNodes.length,
            currentContent: mainElement.innerHTML.substring(0, 100) + '...'
          });
        }
      });
    });
    
    observer.observe(mainElement, { 
      childList: true,
      subtree: true,
      attributes: true
    });
  }
  
  // Initialize Router with allViews
  try {
    // First make sure our routes are set up
    if (!Router.initialized) {
      // Import views dynamically to ensure they're loaded
      const { allViews } = await import('../../views/index.js');
      
      // Setup routes from allViews
      console.log('[RouterInit] Setting up routes from allViews:', Array.isArray(allViews) ? allViews.length : 'not an array');
      Router.setupRoutes(Array.isArray(allViews) ? allViews : [allViews]);
      
      // Initialize the router
      Router.initialize();
      
      // Create a global reference for debugging
      if (typeof window !== 'undefined') {
        window.ElevateRouter = Router;
      }
      
      console.log('[RouterInit] Router initialized with routes:', Object.keys(Router.routes));
    } else {
      console.log('[RouterInit] Router already initialized');
    }
    
    // Listen for route changes to trigger content rendering
    Router.onRouteChange((path, params) => {
      console.log(`[RouterInit] Route changed to: ${path}`);
      
      // Check main content after navigation
      setTimeout(() => {
        const main = document.querySelector('main[data-elevateElement="view"]');
        if (main) {
          const contentLength = main.innerHTML.length;
          const hasContent = contentLength > 0;
          console.log(`[RouterInit] Main content after navigation: ${contentLength} chars, hasContent: ${hasContent}`);
          
          // Force display if empty
          if (!hasContent) {
            console.warn('[RouterInit] Main content is empty, attempting to restore default content');
            main.innerHTML = `<h2>Content missing for route: ${path}</h2><p>Please check the route handler for this path.</p>`;
          }
        }
      }, 100);
    });
    
    // Set up interval to periodically check and fix content issues
    if (contentCheckInterval) {
      clearInterval(contentCheckInterval);
    }
    
    contentCheckInterval = setInterval(checkAndFixViewContent, 2000);
    
    // Initial navigation to current path
    const currentPath = Router.parsePath();
    console.log(`[RouterInit] Current path is: ${currentPath}`);
    
    // If not at the root path, navigate to ensure content is loaded
    if (currentPath !== '/' && currentPath !== '') {
      Router.navigate(currentPath);
    }
    
    return true;
  } catch (error) {
    console.error('[RouterInit] Error initializing router:', error);
    throw error;
  }
}

// Register with component registry - no dependencies
registry.register('router', initializeRouter, []);

export { initializeRouter };