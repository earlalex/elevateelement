// Global menu state management
export const menuState = {
  isOpen: false,
  
  // Open the menu
  open() {
    this.isOpen = true;
    this.updateDOM();
  },
  
  // Close the menu
  close() {
    this.isOpen = false;
    this.updateDOM();
  },
  
  // Toggle menu state
  toggle() {
    this.isOpen = !this.isOpen;
    this.updateDOM();
  },
  
  // Update the DOM based on state
  updateDOM() {
    const menu = document.getElementById('main-navigation-menu');
    const hamburger = document.querySelector('.hamburger-button');
    const nav = document.querySelector('nav[data-elevateElement="navigation"]');
    
    if (!menu || !hamburger) {
      console.error('[MenuState] Required elements not found');
      return;
    }
    
    // Clear any existing inline styles first
    menu.removeAttribute('style');
    
    if (this.isOpen) {
      menu.classList.add('active');
      hamburger.classList.add('active');
      if (nav) nav.classList.add('nav-open');
      document.body.style.overflow = 'hidden';
      hamburger.setAttribute('aria-expanded', 'true');
      
      // Use a single style application
      requestAnimationFrame(() => {
        menu.style.cssText = `
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 9998 !important;
        `;
      });
    } else {
      menu.classList.remove('active');
      hamburger.classList.remove('active');
      if (nav) nav.classList.remove('nav-open');
      document.body.style.overflow = '';
      hamburger.setAttribute('aria-expanded', 'false');
      
      // Force menu closed with a single style application
      requestAnimationFrame(() => {
        menu.style.cssText = 'display: none !important;';
      });
    }
    
    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('menuStateChanged', { 
      detail: { isOpen: this.isOpen } 
    }));
}
};

// Initialize menu state functionality
import { generateMenu } from './menuConfig.js';

export function initializeMenuState() {
  // Generate the menu
  generateMenu('main');
  
  // Setup menu toggle functionality
  const hamburgerButton = document.querySelector('.hamburger-button');
  const menu = document.getElementById('main-navigation-menu');
  
  if (hamburgerButton && menu) {
    hamburgerButton.addEventListener('click', () => {
      menuState.toggle(); // Use menuState.toggle() instead of direct class manipulation
    });
  }

  // Close on outside click
  document.addEventListener('click', function(e) {
    const menu = document.getElementById('main-navigation-menu');
    const hamburger = document.querySelector('.hamburger-button');
    
    if (menuState.isOpen && 
        menu && !menu.contains(e.target) && 
        hamburger && !hamburger.contains(e.target)) {
      menuState.close();
    }
  });

  // Close on ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menuState.isOpen) {
      menuState.close();
    }
  });

  // Close menu on route change
  window.addEventListener('popstate', function() {
    menuState.close();
  });

  window.addEventListener('hashchange', function() {
    menuState.close();
  });
} // This closing brace was in the wrong place

// Navigation handler function
export function handleNavigation(path, isCurrentPage, event) {      
  // Get the event object which could be passed or from window
  event = event || window.event;
  
  // Always close menu, even if clicking the current page      
  menuState.close();            
  
  // Don't navigate if we're already on that page      
  if (isCurrentPage) {        
    console.log('[Navigation] Already on page:', path);        
    return;      
  }            
  
  // Prevent default browser navigation      
  if (event) event.preventDefault();            
  
  // Use Router for SPA navigation      
  if (window.ElevateRouter && typeof window.ElevateRouter.navigate === 'function') {        
    console.log('[Navigation] Using ElevateRouter to navigate to:', path);        
    window.ElevateRouter.navigate(path);      
  } else {        
    console.log('[Navigation] Router not available, using direct navigation');        
    window.location.href = path;      
  }    
}