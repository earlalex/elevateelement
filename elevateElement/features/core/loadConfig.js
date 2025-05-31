// elevateElement/features/loadConfig.js

import { elevateElementConfig } from '../../config/config.js'; // Adjust path if needed

export function addConfigLoader(BaseElement) {
  return class extends BaseElement {
    constructor() {
      console.log('[ConfigLoader] Initializing config loader');
      super();

      if (
        typeof elevateElementConfig !== 'object' ||
        elevateElementConfig === null ||
        Object.keys(elevateElementConfig).length === 0
      ) {
        console.warn('[ElevateElement] No valid elevateElementConfig found. Setting empty config.');
        this.config = {};
        this.devMode = false; // Default to false if missing
      } else {
        console.log('[ElevateElement] elevateElementConfig loaded successfully.');
        this.config = elevateElementConfig;
        this.devMode = Boolean(elevateElementConfig.devMode); // <-- Pull devMode flag cleanly
      }
    }
  };
}