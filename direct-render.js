// Simple direct renderer for debugging
console.log('Direct renderer loaded');

import { Home } from './elevateElement/views/Home.js';
import { About } from './elevateElement/views/About.js';

document.addEventListener('DOMContentLoaded', function() {
  const main = document.querySelector('main[data-elevateElement="view"]');
  if (!main) {
    console.error('Main element not found');
    return;
  }
  
  console.log('Setting up direct renderer');
  
  // Map paths to content
  const routes = {
    '/': Home.content,
    '/about': About.content,
    '/index.html': Home.content
  };
  
  // Insert content directly
  function renderPath(path) {
    console.log('Direct render for path:', path);
    const content = routes[path];
    
    if (content) {
      main.innerHTML = content;
      console.log('Content rendered directly');
      return true;
    } else {
      console.warn('No content for path:', path);
      main.innerHTML = '<div style="padding:20px;"><h2>Page not found</h2><p>Path: ' + path + '</p></div>';
      return false;
    }
  }
  
  // Initial render
  const currentPath = window.location.pathname;
  renderPath(currentPath);
  
  // Handle navigation
  document.querySelectorAll('#standalone-menu a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const path = this.getAttribute('href');
      
      // Update URL but don't reload
      history.pushState({}, '', path);
      
      // Update active class
      document.querySelectorAll('#standalone-menu a').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      
      // Render content
      renderPath(path);
    });
  });
  
  // Handle back/forward
  window.addEventListener('popstate', function() {
    const currentPath = window.location.pathname;
    renderPath(currentPath);
  });
  
  console.log('Direct renderer setup complete');
}); 