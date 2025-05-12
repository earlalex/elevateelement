// core/ElevateElement.js
import {
  elevateElementConfig
}
from './config/config.js';

import {
  elevateElementUtils
}
from './utils/index.js';

import {
  elevateElementFeatures
}
from './features/index.js';
import {
  elevateElementRoutes
}
from './routes/index.js';

export class ElevateElement extends elevateElementConfig(elevateElementFeatures(HTMLElement)) {
  constructor(elementName) {
    super(elementName);
    
  }
}

