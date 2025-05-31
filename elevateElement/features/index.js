import { LitElement } from 'lit'; // Import LitElement
import { elevateElementCore } from './core/index.js';
import { elevateElementAI } from './ai/index.js';
import { elevateElementWeb3 } from './web3/index.js';

export function elevateElementFeatures(elementName) {
  // The base for features is now LitElement
  return class extends elevateElementCore(elevateElementAI(elevateElementWeb3(LitElement))) {
    constructor(elementName) {
      super(elementName);
    }
  }
}
