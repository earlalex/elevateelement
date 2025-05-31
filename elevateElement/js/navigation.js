/**
 * Standalone Navigation Module for ElevateElement
 * Provides responsive navigation with hamburger menu functionality
 */

import { Router } from '../features/core/router.js';

/**
 * Initialize the standalone navigation
 */
export function initializeStandaloneNavigation() {
  document.addEventListener('DOMContentLoaded', () => {
    const navElement = document.querySelector('nav[data-elevateElement="navigation"]');
    const hamburgerButton = document.querySelector('.hamburger-button');
    const menu = document.getElementById('main-navigation-menu');
    
    // Check if navigation elements exist
    if (!menu) {
      console.warn('[Navigation] Main navigation menu not found in the DOM');
      return;
    }
    
        // Toggle mobile menu with state management    if (hamburgerButton) {      console.log('[Navigation] Hamburger button found, adding click listener');            hamburgerButton.addEventListener('click', (e) => {        e.preventDefault();        e.stopPropagation();                console.log('[Navigation] Hamburger button clicked');                // Use state management if available        if (window.menuState && typeof window.menuState.toggle === 'function') {          window.menuState.toggle();        } else {          // Fallback to direct DOM manipulation          // Toggle active state on button          hamburgerButton.classList.toggle('active');                    // Toggle active state on menu          menu.classList.toggle('active');                    // Also toggle class on nav element for styling          if (navElement) {            navElement.classList.toggle('nav-open');          }                    // Toggle aria-expanded for accessibility          const expanded = hamburgerButton.classList.contains('active');          hamburgerButton.setAttribute('aria-expanded', expanded);                    // Prevent scrolling when menu is open          document.body.style.overflow = expanded ? 'hidden' : '';                    console.log('[Navigation] Menu toggled:', expanded ? 'open' : 'closed');          console.log('[Navigation] Menu classes:', menu.className);        }      });    } else {      console.warn('[Navigation] Hamburger button not found');    }
    
    // Add click handlers to links
    const links = menu ? menu.querySelectorAll('a') : [];
    if (links && links.length > 0) {
      links.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Update active state
          links.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          
          const path = link.getAttribute('href');
          console.log('[Navigation] Navigating to:', path);
          
                    // Always close mobile menu, regardless of whether we're clicking the current page          // Use state management if available          if (window.menuState && typeof window.menuState.close === 'function') {            window.menuState.close();          } else {            // Fallback to direct DOM manipulation            menu.classList.remove('active');            menu.style.display = 'none !important';            menu.style.opacity = '0 !important';            menu.style.visibility = 'hidden !important';                        if (hamburgerButton) {              hamburgerButton.classList.remove('active');              hamburgerButton.setAttribute('aria-expanded', 'false');            }                        // Reset body overflow            document.body.style.overflow = '';                        // If Router has a closeMenu method, call it for extra thoroughness            if (Router && typeof Router.closeMenu === 'function') {              Router.closeMenu();            }          }
          
          // Reset contentRendered state when navigating to a different path
          if (Router && typeof Router.resetViewState === 'function') {
            Router.resetViewState();
          }
          
          // Use the Router directly
          if (Router && typeof Router.navigate === 'function') {
            Router.navigate(path);
          } else {
            console.error('[Navigation] Router not available');
            // Fallback to regular navigation
            window.location.href = path;
          }
        });
      });
      
      // Update active link based on current path
      if (Router && typeof Router.onRouteChange === 'function') {
        Router.onRouteChange((path) => {
          links.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath === path) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        });
      }
      
      console.log('[Navigation] Navigation initialized with', links.length, 'links');
    } else {
      console.warn('[Navigation] No navigation links found');
    }
    
        // Add click outside to close    document.addEventListener('click', (e) => {      if (menu && menu.classList.contains('active') &&           !menu.contains(e.target) &&           hamburgerButton && !hamburgerButton.contains(e.target)) {                // Use state management if available        if (window.menuState && typeof window.menuState.close === 'function') {          window.menuState.close();        } else {          // Fallback to direct DOM manipulation          hamburgerButton.classList.remove('active');          menu.classList.remove('active');          document.body.style.overflow = '';        }      }    });
  });
}

// Add keyboard navigation support
export function addKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // Close menu on Escape key
    if (e.key === 'Escape') {
      // Use state management if available
      if (window.menuState && typeof window.menuState.close === 'function') {
        window.menuState.close();
      } else {
        // Fallback to direct DOM manipulation
        const menu = document.getElementById('main-navigation-menu');
        const hamburgerButton = document.querySelector('.hamburger-button');
        
        if (menu && menu.classList.contains('active')) {
          if (hamburgerButton) hamburgerButton.classList.remove('active');
          menu.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    }
  });
} 