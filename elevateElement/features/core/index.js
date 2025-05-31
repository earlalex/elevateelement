import { runElevateAudit } from './auditor.js';
import { addChannelMessagingFeature } from './channelMessaging.js';
import { addProtection } from './protection.js';
import { addLifecycleHooks } from './lifecycleHooks.js';
import { addStateManagement } from './stateManagement.js';
import { addEventHandling } from './eventHandling.js';
import { addTemplating } from './templating.js';
import { addStyling } from './styling.js';
import { addAjax } from './ajax.js';
export function elevateElementCore (elementName) {
  return class extends addProtection(addLifecycleHooks(addStateManagement(addEventHandling(addChannelMessagingFeature(addTemplating(addStyling(addAjax(HTMLElement)))))))) {
    constructor(elementName) {
      super(elementName);
      
    }
  }
}