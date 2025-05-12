import { elevateElementCore } from './core/index.js';
import { elevateElementAI } from './ai/index.js';
import { elevateElementWeb3 } from './web3/index.js';

export class elevateElementFeatures extends elevateElementCore(elevateElementAI(elevateElementWeb3((HTMLElement)))) {
  constructor(elementName) {
    super(elementName);
    
  }
}

