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

        // Save the hamburger button if it exists    const hamburgerButton = navRoot.querySelector('.hamburger-button');    const navContainer = navRoot.querySelector('.nav-container');        // Clear existing navigation but preserve container structure if present    if (navContainer && hamburgerButton) {      console.log('[NavigationBuilder] Found hamburger button, preserving it');      // Just clear the menu, not the whole navigation      const menu = navContainer.querySelector('#main-navigation-menu');      if (menu) {        menu.innerHTML = '';      } else {        // Clear everything except hamburger button        const hamburgerHTML = hamburgerButton.outerHTML;        navContainer.innerHTML = hamburgerHTML;      }    } else {      // Standard clear if no hamburger button exists      navRoot.innerHTML = '';    }        // Ensure visibility    navRoot.style.display = 'block';    navRoot.style.visibility = 'visible';    navRoot.style.opacity = '1';
    
    console.log('[NavigationBuilder] Building navigation in:', navRoot);

    // Force visible dimensions on nav container
    navRoot.style.width = '100%';
    navRoot.style.minHeight = '70px'; 
    navRoot.style.height = 'auto';
    navRoot.style.backgroundColor = '#f0f0f0';
    navRoot.style.border = '2px solid #ddd';
    navRoot.style.padding = '10px';
    navRoot.style.margin = '20px 0';
    navRoot.style.overflow = 'visible';
    
    const orientation = navRoot.getAttribute('orientation') || 'horizontal';
    const justify = navRoot.getAttribute('justify') || 'left';
    
    // Completely different approach: Build HTML string and insert it all at once
    // This avoids DOM manipulation issues with custom elements
    let menuHtml = `
      <menu role="menubar" id="main-navigation-menu" class="main-menu" style="
        display: flex;
        flex-direction: ${orientation === 'vertical' ? 'column' : 'row'};
        justify-content: ${justify === 'right' ? 'flex-end' : 'flex-start'};
        flex-wrap: wrap;
        gap: 10px;
        padding: 15px;
        margin: 0;
        width: 100%;
        min-height: 60px;
        background-color: #f5f5f5;
        list-style: none;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
      ">
    `;
    
    // Build regular links first - we'll convert them to route-link elements later
    allViews.forEach(view => {
      if (!view.title) return; // Skip views without titles
      
      const isActive = (Router.parsePath() === view.path);
      const activeClass = isActive ? 'active' : '';
      const activeStyle = isActive ? 
        'font-weight: bold; background-color: #6200ea; color: #ffffff;' : 
        'background-color: #efefef; color: #333333;';
      
      menuHtml += `
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
               font-family: Arial, sans-serif;
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
    
    menuHtml += '</menu>';
    
    // Insert the menu HTML depending on container structure
    const navContainer = navRoot.querySelector('.nav-container');
    if (navContainer && navContainer.querySelector('.hamburger-button')) {
      console.log('[NavigationBuilder] Inserting menu into existing nav container with hamburger');
      navContainer.insertAdjacentHTML('beforeend', menuHtml);
    } else {
      // Standard insertion if no container or hamburger
      navRoot.innerHTML = menuHtml;
    }
    // Find all links and convert to route-link elements if needed
    const menuElement = navRoot.querySelector('#main-navigation-menu');
    
    if (menuElement) {
      // Add click handlers to links
      const navLinks = menuElement.querySelectorAll('.nav-link');
      const hamburgerButton = navRoot.querySelector('.hamburger-button');
      
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
    }
    
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