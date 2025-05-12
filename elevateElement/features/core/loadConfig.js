// features/loadConfig.js

import { ElevateConfig } from '../config/index.js'; // Assumes fixed location for now

export function addConfigLoader(BaseElement) {
  return class extends BaseElement {
    constructor() {
      super();
      this.config = ElevateConfig || {};
    }
  };
}