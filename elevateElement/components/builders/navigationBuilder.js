// elevateElement/features/navigationBuilder.js

// import { allViews } from '../../views/index.js';
import { Router } from '../../features/core/router.js';
import { About } from '../../views/About.js';
import { Config } from '../../views/Config.js';
import { Contact } from '../../views/Contact.js';
import { Home } from '../../views/Home.js';
import { Tests } from '../../views/Tests.js';
const allViews = [Home,About,Contact,Tests,Config]
let routesAlreadySetup = false;
let navigationBuilt = false;
let isBuilding = false;

// Allow resetting navigation state
export function resetNavigationState() {
  navigationBuilt = false;
  isBuilding = false;
  console.log('[NavigationBuilder] Navigation state reset');
}

function setupRoutes() {
  if (routesAlreadySetup) {
    console.warn('[NavigationBuilder] Routes already set up. Skipping duplicate.');
    return;
  }

  console.log('[NavigationBuilder] Setting up routes...');

  allViews.forEach(view => {
    if (view.path && typeof view.load === 'function') {
      Router.routes[view.path] = async (params = {}) => {
        console.log(`[NavigationBuilder] Loading view: ${view.path}`);
        try {
          const result = await view.load(params);
          return result;
        } catch (error) {
          console.error(`[NavigationBuilder] Error loading view ${view.path}:`, error);
          return false;
        }
      };
    }

    if (Array.isArray(view.children)) {
      view.children.forEach(child => {
        if (child.path && typeof child.load === 'function') {
          Router.routes[child.path] = async (params = {}) => {
            try {
              const result = await child.load(params);
              return result;
            } catch (error) {
              console.error(`[NavigationBuilder] Error loading view ${child.path}:`, error);
              return false;
            }
          };
        }
      });
    }
  });

  // Add fallback route
  Router.routes['*'] = () => {
    console.warn('[NavigationBuilder] Fallback route triggered.');
    Router.showErrorModal('404 - Page Not Found.');
    return false;
  };

  routesAlreadySetup = true;
  console.log('[NavigationBuilder] Routes setup complete');
}

/**
 * Build the navigation menu
 * @param {Object} ElevateElement - The ElevateElement class
 * @returns {Promise<boolean>} - Promise resolving to true when navigation is built
 */
export async function buildDynamicNavigation(ElevateElement) {
  console.log('[NavigationBuilder] buildDynamicNavigation called', { navigationBuilt, routesAlreadySetup, isBuilding });
  
  // Prevent concurrent builds but allow rebuilds if needed
  if (isBuilding) {
    console.warn('[NavigationBuilder] Navigation build in progress. Skipping.');
    return Promise.reject(new Error('Navigation build in progress'));
  }

  isBuilding = true;

  try {
    // Setup routes if needed
    if (!routesAlreadySetup) {
      setupRoutes();
    }

    // First try the navigation root in the header
    let navRoot = document.querySelector('header [data-elevateElement="navigation"]');
    if (!navRoot) {
      // Fall back to any element with the data-elevateElement="navigation" attribute
      navRoot = document.querySelector('[data-elevateElement="navigation"]');
    }
    
    if (!navRoot) {
      console.error('[NavigationBuilder] No navigation root element found with [data-elevateElement="navigation"]');
      return Promise.reject(new Error('No navigation root element found'));
    }
    
    console.log('[NavigationBuilder] Building navigation in:', navRoot);

    // Ensure navRoot has some forced visible dimensions for debugging if needed.
    // These might be overridden by actual CSS.
    navRoot.style.width = navRoot.style.width || '100%'; // Keep if already set
    navRoot.style.minHeight = navRoot.style.minHeight || '50px';
    navRoot.style.border = navRoot.style.border || '1px dashed #ccc'; // Visual aid for debugging
    navRoot.style.padding = navRoot.style.padding || '5px';
    navRoot.style.boxSizing = 'border-box';


    // Get or create Hamburger Button
    let hamburgerButton = navRoot.querySelector('.hamburger-button');
    if (!hamburgerButton) {
        console.log('[NavigationBuilder] Creating .hamburger-button.');
        hamburgerButton = document.createElement('button');
        hamburgerButton.className = 'hamburger-button';
        hamburgerButton.setAttribute('aria-label', 'Toggle navigation menu');
        hamburgerButton.setAttribute('aria-expanded', 'false');
        hamburgerButton.innerHTML = '<span></span><span></span><span></span>';
        // Prepend hamburger so it usually appears before the menu list
        navRoot.prepend(hamburgerButton);
    }

    // Get or create Main Menu Element
    let menuElement = navRoot.querySelector('#main-navigation-menu');
    if (!menuElement) {
        console.log('[NavigationBuilder] Creating #main-navigation-menu.');
        menuElement = document.createElement('menu'); // Use 'menu' tag
        menuElement.id = 'main-navigation-menu';
        menuElement.className = 'main-menu'; // Add class for styling
        menuElement.setAttribute('role', 'menubar');
        navRoot.appendChild(menuElement); // Append menu after hamburger (or as last child if no hamburger initially)
    }
    
    // Clear only previous items from menuElement before adding new ones
    menuElement.innerHTML = '';

    const orientation = navRoot.getAttribute('orientation') || 'horizontal';
    const justify = navRoot.getAttribute('justify') || 'left';

    // Apply base styles that were in menuHtml string - this is important
    // These styles should ideally be in navigation.css but are applied here for self-containment if CSS is missing/not loaded.
    menuElement.style.cssText = `
      display: flex; /* This will be controlled by .active class via CSS for mobile */
      flex-direction: ${orientation === 'vertical' ? 'column' : 'row'};
      justify-content: ${justify === 'right' ? 'flex-end' : 'flex-start'};
      flex-wrap: wrap;
      gap: 10px;
      padding: 15px;
      margin: 0;
      width: 100%;
      min-height: 60px; /* Or adjust as needed */
      background-color: #f5f5f5; /* Example, use CSS vars if possible */
      list-style: none;
      border: 1px solid #e0e0e0; /* Example */
      border-radius: 4px; /* Example */
    `;
    
    let menuItemsHtml = ''; // Initialize empty string for list items

    allViews.forEach(view => {
      if (!view.title) return;
      
      const isActive = (Router.parsePath() === view.path);
      const activeClass = isActive ? 'active' : '';
      // Inline styles for active/inactive states are kept for now, but could be moved to CSS
      const activeStyle = isActive ? 
        'font-weight: bold; background-color: #6200ea; color: #ffffff;' : 
        'background-color: #efefef; color: #333333;';
      
      menuItemsHtml += `
        <li style="
          display: ${orientation === 'vertical' ? 'block' : 'inline-block'};
          margin: 0;
          padding: 0;
          min-width: 100px;
          min-height: 40px;
          visibility: visible;
        ">
          <a href="${view.path}" 
             class="nav-link ${activeClass}" 
             data-path="${view.path}"
             style="
               display: block;
               padding: 10px 16px;
               ${activeStyle}
               text-decoration: none;
               border: 1px solid #ddd;
               border-radius: 4px;
               text-align: center;
               font-family: Arial, sans-serif; /* Consider using CSS variables */
               min-height: 20px;
               cursor: pointer;
               visibility: visible;
               opacity: 1;
             ">
            ${view.title || view.path}
          </a>
        </li>
      `;
    });
    
    menuElement.innerHTML = menuItemsHtml; // Populate the menu element
    // At this point, menuElement and hamburgerButton are guaranteed to exist in navRoot.
    // The subsequent logic for attaching event listeners should use these variables directly.
    // The existing code re-queries for hamburgerButton and menuElement.querySelectorAll('.nav-link'),
    // which is fine since they are now confirmed to be in the DOM.

    // Add click handlers to links (using the guaranteed menuElement)
    const navLinks = menuElement.querySelectorAll('.nav-link');
    // hamburgerButton variable is already defined and guaranteed
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const path = link.getAttribute('data-path');
          if (path) {
            // Update active state
            navLinks.forEach(l => {
              l.classList.remove('active');
              l.style.fontWeight = 'normal';
              l.style.backgroundColor = '#efefef';
              l.style.color = '#333333';
            });
            link.classList.add('active');
            link.style.fontWeight = 'bold';
            link.style.backgroundColor = '#6200ea';
            link.style.color = '#ffffff';
            
            // Close mobile menu if it's open
            if (window.innerWidth <= 768 && menuElement.classList.contains('active')) {
              console.log('[NavigationBuilder] Closing mobile menu after link click');
              menuElement.classList.remove('active');
              
              // Reset hamburger button state if it exists
              if (hamburgerButton) {
                hamburgerButton.classList.remove('active');
                hamburgerButton.setAttribute('aria-expanded', 'false');
              }
              
              // Reset body overflow
              document.body.style.overflow = '';
            }
            
            // Navigate
            console.log('[NavigationBuilder] Link clicked, navigating to:', path);
            Router.navigate(path);
          }
        });
      });
      
      console.log(`[NavigationBuilder] Added ${navLinks.length} navigation links`);
      
      // Add accessibility attributes
      menuElement.setAttribute('aria-label', 'Main navigation');
      navLinks.forEach((link, index) => {
        link.setAttribute('role', 'menuitem');
        link.setAttribute('tabindex', '0');
        link.setAttribute('aria-label', `Navigate to ${link.textContent.trim()}`);
      });
    // REMOVED MISPLACED BRACE from here: }
    
    // Force repaint to ensure elements are rendered
    navRoot.style.opacity = '0.99';
    setTimeout(() => { navRoot.style.opacity = '1'; }, 10);
    
        // Print debug info    console.log('[NavigationBuilder] Navigation built:', {       menuElement,      menuElementHeight: menuElement ? menuElement.offsetHeight : 0,      navRootHeight: navRoot.offsetHeight,      navRootHTML: navRoot.innerHTML.substring(0, 100) + '...'    });        // Setup hamburger button functionality if it exists    const hamburgerButton = navRoot.querySelector('.hamburger-button');    if (hamburgerButton && menuElement) {      console.log('[NavigationBuilder] Setting up hamburger button');      hamburgerButton.addEventListener('click', (e) => {        e.preventDefault();        e.stopPropagation();                hamburgerButton.classList.toggle('active');        menuElement.classList.toggle('active');                // Toggle aria-expanded for accessibility        const expanded = hamburgerButton.classList.contains('active');        hamburgerButton.setAttribute('aria-expanded', expanded);                // Prevent scrolling when menu is open        document.body.style.overflow = expanded ? 'hidden' : '';                console.log('[NavigationBuilder] Menu toggled via hamburger:', expanded ? 'open' : 'closed');      });    }

        // Set up route change listener    Router.onRouteChange((path) => {      console.log('[NavigationBuilder] Route changed to:', path);      const navLinks = navRoot.querySelectorAll('.nav-link');            // Update active states for links      navLinks.forEach(link => {        const linkPath = link.getAttribute('data-path');        if (linkPath === path) {          link.classList.add('active');          link.style.fontWeight = 'bold';          link.style.backgroundColor = '#6200ea';          link.style.color = '#ffffff';        } else {          link.classList.remove('active');          link.style.fontWeight = 'normal';          link.style.backgroundColor = '#efefef';          link.style.color = '#333333';        }      });            // Also close mobile menu if it's open after route change      if (window.innerWidth <= 768) {        const menuElement = navRoot.querySelector('#main-navigation-menu');        const hamburgerButton = navRoot.querySelector('.hamburger-button');                if (menuElement && menuElement.classList.contains('active')) {          console.log('[NavigationBuilder] Closing mobile menu after route change');          menuElement.classList.remove('active');                    // Reset hamburger button state if it exists          if (hamburgerButton) {            hamburgerButton.classList.remove('active');            hamburgerButton.setAttribute('aria-expanded', 'false');          }                    // Reset body overflow          document.body.style.overflow = '';        }      }    });

    navigationBuilt = true;
    console.log('[NavigationBuilder] Navigation built successfully');
    return true;
  } catch (error) {
    console.error('[NavigationBuilder] Error building navigation:', error);
    navigationBuilt = false; // Reset on error to allow rebuild
    return Promise.reject(error);
  } finally {
    isBuilding = false;
  }
}