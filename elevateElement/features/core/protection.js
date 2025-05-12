// features/protection.js
export function addProtection(BaseElement) {
  return class extends BaseElement {
    constructor(...args) {
      super(...args);
      this.__Protected__ = this.__Protected__ || {
        Methods: [],
        Properties: [],
      };
      this.__Interface__ = this.__Interface__ || {};
      this.#setupProtection();
    }

    // Modern method to identify protected keys
    #isProtected(key) {
      return typeof key === "string" && key.startsWith("__");
    }

    // Set up protected method/property tracking
    #setupProtection() {
      Object.getOwnPropertyNames(this).forEach((key) => {
        if (this.#isProtected(key)) this.__Protected__.Properties.push(key);
      });

      const proto = Object.getPrototypeOf(this);
      Object.getOwnPropertyNames(proto).forEach((key) => {
        if (this.#isProtected(key) && typeof proto[key] === "function") {
          this.__Protected__.Methods.push(key);
        }
      });
    }

    // Optional: runtime type enforcement (simplified)
    #validateMethodArgs(method, args) {
      const expected = this.__Interface__[method];
      if (!expected || typeof expected !== "object") return true;
      for (let key in expected) {
        const expectedType = expected[key];
        const actualType = typeof args[key];
        if (expectedType !== "any" && actualType !== expectedType) {
          throw new TypeError(
            `Argument "${key}" in ${method} expected to be ${expectedType}, got ${actualType}`
          );
        }
      }
    }

    // Use this in your methods
    __callProtected(methodName, args = {}) {
      if (!this.__Protected__.Methods.includes(methodName)) {
        throw new ReferenceError(
          `Attempt to access protected method: ${methodName}`
        );
      }
      this.#validateMethodArgs(methodName, args);
      return this[methodName](args);
    }
  };
}
