import { allViews } from '../../views/index.js';

// Generate menu config dynamically from nav element
export function generateMenuFromNav() {
  const nav = document.querySelector('nav[data-elevateElement="navigation"]');
  if (!nav) return [];
  
  const menuItems = Array.from(nav.querySelectorAll('a')).map(link => ({
    path: link.getAttribute('href'),
    label: link.textContent.trim(),
    isActive: window.location.pathname === link.getAttribute('href')
  }));
  
  return menuItems;
}

export const menuConfig = {
  main: [] // Will be populated dynamically
};

export function generateMenu(menuId) {
  const menuElement = document.querySelector(`[data-elevate-menu="${menuId}"]`);
  if (!menuElement) return;

  // Get menu items dynamically from nav
  menuConfig[menuId] = generateMenuFromNav();
  const menuItems = menuConfig[menuId];
  if (!menuItems || !menuItems.length) return;

  menuElement.innerHTML = menuItems.map(item => `
    <li>
      <a 
        href="${item.path}" 
        ${item.isActive ? 'class="active"' : ''} 
        onclick="handleNavigation('${item.path}', window.location.pathname === '${item.path}', event);"
      >
        ${item.label}
      </a>
    </li>
  `).join('');
}