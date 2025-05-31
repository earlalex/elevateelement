/**
 * Keyboard Navigation Module for ElevateElement
 */

/**
 * Add keyboard navigation support
 */
export function initKeyboardNavigation() {
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