/**
 * Navigation Initialization - Responsible for building the navigation
 * Integrates with ComponentRegistry for proper dependency management
 */

import registry from '../../features/core/componentRegistry.js';
import { buildDynamicNavigation } from './navigationBuilder.js';

/**
 * Initialize the navigation component
 * @param {Object} context - Initialization context with ElevateElement
 * @returns {Promise<void>}
 */
async function initializeNavigation(context) {
  console.log('[NavigationInit] Initializing navigation');
  
  if (!context.ElevateElement) {
    console.error('[NavigationInit] ElevateElement not provided in context');
    throw new Error('ElevateElement not provided in context');
  }
  
  // Make sure the route-link element is defined first
  if (!customElements.get('route-link')) {
    console.log('[NavigationInit] Waiting for route-link to be defined');
    await customElements.whenDefined('route-link');
  }
  
  // Build the navigation
  try {
    await buildDynamicNavigation(context.ElevateElement);
    console.log('[NavigationInit] Navigation built successfully');
  } catch (error) {
    console.error('[NavigationInit] Error building navigation:', error);
    throw error;
  }
}

// Register with component registry - depends on router and route-link
registry.register('navigation', initializeNavigation, ['router', 'route-link']);

export { initializeNavigation }; 