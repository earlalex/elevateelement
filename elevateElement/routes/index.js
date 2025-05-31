/**
 * Routes Module - Entry point for routes and navigation initialization
 * Integrates with ComponentRegistry for proper dependency management
 */

import registry from '../features/core/componentRegistry.js';

// Import initialization modules
import '../features/core/routerInit.js';
import '../components/elements/componentInit.js';
import '../components/builders/navigationInit.js';

let initialized = false;

/**
 * Initialize all routes, elements, and navigation
 * @param {Object} ElevateElement - The ElevateElement class
 * @returns {Promise<void>}
 */
export async function elevateElementRoutes(ElevateElement) {
  if (initialized) {
    console.warn('[Routes] Already initialized. Skipping duplicate initialization.');
    return;
  }

  console.log('[Routes] Initializing routes and components...');
  
  try {
    // Create context with ElevateElement
    const context = { ElevateElement };
    
    // Initialize router first
    await registry.initialize('router', context);
    
    // Initialize elements
    await registry.initialize('elements', context);
    
    // Initialize navigation last (depends on router and elements)
    await registry.initialize('navigation', context);
    
    initialized = true;
    console.log('[Routes] Initialization complete');
  } catch (error) {
    console.error('[Routes] Initialization error:', error);
    throw error;
  }
}
