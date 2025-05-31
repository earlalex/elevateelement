class ComponentRegistry {
  constructor() {
    console.log('[ComponentRegistry] Initializing registry');
    this.components = new Map();
    this.dependencies = new Map();
    this.initialized = new Set();
    this.initPromises = new Map();
    this.inProgress = new Set();
  }

  register(name, initFn, dependencies = []) {
    if (this.components.has(name)) {
      console.warn(`[ComponentRegistry] Component '${name}' already registered`);
      return;
    }

    console.log(`[ComponentRegistry] Registering component: ${name} with dependencies:`, dependencies);
    this.components.set(name, initFn);
    this.dependencies.set(name, dependencies);
    this.initPromises.set(name, null);
  }

  async initialize(name, context = {}) {
    // If already initialized, return immediately
    if (this.initialized.has(name)) {
      return Promise.resolve();
    }

    // If initialization in progress, return existing promise
    if (this.initPromises.get(name)) {
      return this.initPromises.get(name);
    }

    // Detect circular dependencies
    if (this.inProgress.has(name)) {
      console.error(`[ComponentRegistry] Circular dependency detected for: ${name}`);
      return Promise.reject(new Error(`Circular dependency detected for: ${name}`));
    }

    // If component not registered, reject
    if (!this.components.has(name)) {
      console.error(`[ComponentRegistry] Component not registered: ${name}`);
      return Promise.reject(new Error(`Component not registered: ${name}`));
    }

    // Mark as in progress
    this.inProgress.add(name);

    // Create initialization promise
    const initPromise = this._initializeComponent(name, context);
    this.initPromises.set(name, initPromise);

    return initPromise;
  }

  async _initializeComponent(name, context) {
    const MAX_RETRIES = 3;
    let attempts = 0;
    
    while (attempts < MAX_RETRIES) {
      try {
        const initFn = this.components.get(name);
        await initFn(context);
        
        this.initialized.add(name);
        this.inProgress.delete(name);
        
        console.log(`[ComponentRegistry] Component initialized: ${name}`);
        return true;
      } catch (error) {
        attempts++;
        console.warn(`[ComponentRegistry] Attempt ${attempts} failed for ${name}:`, error);
        
        if (attempts === MAX_RETRIES) {
          console.error(`[ComponentRegistry] Failed to initialize ${name} after ${MAX_RETRIES} attempts`);
          this.inProgress.delete(name);
          this.initPromises.set(name, null);
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 100));
      }
    }
  }

  isInitialized(name) {
    return this.initialized.has(name);
  }

  async initializeAll(context = {}) {
    const promises = [];
    
    for (const name of this.components.keys()) {
      promises.push(this.initialize(name, context));
    }

    return Promise.all(promises);
  }
}

// Create singleton instance
const registry = new ComponentRegistry();

export default registry;