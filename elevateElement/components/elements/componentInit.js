/**
 * Component Initialization - Registers and initializes custom elements
 * Integrates with ComponentRegistry for proper dependency management
 */

import registry from '../../features/core/componentRegistry.js';
import { RouteLinkElementBuilder } from '../RouteLinkElement.js';

/**
 * Initialize the RouteLinkElement component
 * @param {Object} context - Initialization context with ElevateElement
 * @returns {Promise<void>}
 */
async function initializeRouteLinkElement(context) {
  console.log('[ComponentInit] Initializing RouteLinkElement');
  
  if (!context.ElevateElement) {
    console.error('[ComponentInit] ElevateElement not provided in context');
    throw new Error('ElevateElement not provided in context');
  }
  
  // Register the route-link element
  RouteLinkElementBuilder(context.ElevateElement);
  
  // Wait for custom element to be defined
  await customElements.whenDefined('route-link');
  
  console.log('[ComponentInit] RouteLinkElement initialized');
}

/**
 * Initialize all built-in custom elements
 * @param {Object} context - Initialization context
 * @returns {Promise<void>}
 */
async function initializeElements(context) {
  console.log('[ComponentInit] Initializing all custom elements');
  
  // Add other elements here as needed
  await registry.initialize('route-link', context);
  
  console.log('[ComponentInit] All custom elements initialized');
  return true;
}

// Register components with registry
registry.register('route-link', initializeRouteLinkElement, ['router']);
registry.register('elements', initializeElements, ['route-link']);

export { initializeElements }; 