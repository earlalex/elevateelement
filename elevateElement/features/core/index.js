import {
  addProtection
}
from './protection.js';
import {
  addLifecycleHooks
}
from './lifecycleHooks.js';
import {
  addStateManagement
}
from './stateManagement.js';
import {
  addEventHandling
}
from './eventHandling.js';
import {
  addTemplating
}
from './templating.js';
import {
  addStyling
}
from './styling.js';
import {
  addAjax
}
from './ajax.js';

export class elevateElementCore extends addProtection(addLifecycleHooks(addStateManagement(addEventHandling(addTemplating(addStyling(addAjax(HTMLElement))))))) {
  constructor(elementName) {
    super(elementName);
    
  }
}
