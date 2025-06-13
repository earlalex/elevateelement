// elevateElement/components/tests/RouterTestElement.js

// Assuming MinimalBaseClass will be passed from Tests.js for now
// It needs connectedCallback, disconnectedCallback, setState, render, shadowRoot

export function RouterTestElementBuilder(ElevateElementClass) {
  class RouterTestElement extends ElevateElementClass {
    constructor() {
      super('router-test-element'); // Call super if ElevateElementClass expects it

      this.state = {
        currentPathDisplay: '', // To show path from router's perspective
        lastNavigationPath: '', // Path received from onRouteChange
        lastNavigationParams: {}, // Params received from onRouteChange
        testResult: { success: null, message: 'Test not run yet.' }
      };

      this._routerSubscription = null;
      this._boundHandleRunTest = this.runTest.bind(this);
      this._boundNavigateToHome = () => this.navigateToPath('/');
      this._boundNavigateToTests = () => this.navigateToPath('/tests');
      // Add a test route that might not exist to test 404 or specific handling if desired
      this._boundNavigateToNonExistent = () => this.navigateToPath('/non-existent-test-route');
    }

    connectedCallback() {
      super.connectedCallback && super.connectedCallback(); // Call if base class has it
      console.log('[RouterTestElement] connected');

      if (window.ElevateRouter && typeof window.ElevateRouter.onRouteChange === 'function') {
        this._routerSubscription = window.ElevateRouter.onRouteChange((path, params) => {
          console.log('[RouterTestElement] onRouteChange:', path, params);
          this.setState({
            lastNavigationPath: path,
            lastNavigationParams: params || {}
          });
          this.updateCurrentPathDisplay(); // Update display on route change
          this.attachEventHandlers(); // Re-attach as setState might re-render
        });
      } else {
        console.error('[RouterTestElement] ElevateRouter not found or onRouteChange is not available.');
        this.setState({ testResult: { success: false, message: 'ElevateRouter not available for testing.' } });
      }

      this.updateCurrentPathDisplay(); // Initial path display

      // Initial render and event attachment
      if (this.shadowRoot && typeof this.render === 'function') {
        this.shadowRoot.innerHTML = this.render();
      }
      this.attachEventHandlers();
    }

    disconnectedCallback() {
      if (this._routerSubscription && typeof this._routerSubscription === 'function') {
        this._routerSubscription(); // Unsubscribe
      }
      this.removeEventListeners && this.removeEventListeners();
      super.disconnectedCallback && super.disconnectedCallback();
      console.log('[RouterTestElement] disconnected');
    }

    updateCurrentPathDisplay() {
      if (window.ElevateRouter && typeof window.ElevateRouter.parsePath === 'function') {
        this.setState({ currentPathDisplay: window.ElevateRouter.parsePath() });
        // No attachEventHandlers here as this is often called from within other handlers or connectedCallback
        // which already manage re-attachment. Avoid potential loops if setState itself doesn't re-render.
        // If setState *does* re-render, the caller of updateCurrentPathDisplay should handle re-attaching.
      }
    }

    navigateToPath(path) {
      if (window.ElevateRouter && typeof window.ElevateRouter.navigate === 'function') {
        console.log(`[RouterTestElement] Navigating to: ${path}`);
        window.ElevateRouter.navigate(path);
        // onRouteChange will update the state.currentPathDisplay via its own call to updateCurrentPathDisplay
      } else {
        this.setState({ testResult: { success: false, message: 'ElevateRouter.navigate not available.' } });
        this.attachEventHandlers(); // Re-attach if state change causes re-render
      }
    }

    attachEventHandlers() {
      if (!this.shadowRoot) return;

      const homeBtn = this.shadowRoot.querySelector('.navigate-home-btn');
      if (homeBtn) {
        homeBtn.removeEventListener('click', this._boundNavigateToHome);
        homeBtn.addEventListener('click', this._boundNavigateToHome);
      }

      const testsBtn = this.shadowRoot.querySelector('.navigate-tests-btn');
      if (testsBtn) {
        testsBtn.removeEventListener('click', this._boundNavigateToTests);
        testsBtn.addEventListener('click', this._boundNavigateToTests);
      }

      const nonExistentBtn = this.shadowRoot.querySelector('.navigate-non-existent-btn');
      if(nonExistentBtn) {
        nonExistentBtn.removeEventListener('click', this._boundNavigateToNonExistent);
        nonExistentBtn.addEventListener('click', this._boundNavigateToNonExistent);
      }

      const runTestBtn = this.shadowRoot.querySelector('.run-this-test-button');
      if (runTestBtn) {
        runTestBtn.removeEventListener('click', this._boundHandleRunTest);
        runTestBtn.addEventListener('click', this._boundHandleRunTest);
      }
    }

    removeEventListeners() {
      if (!this.shadowRoot) return;
      const homeBtn = this.shadowRoot.querySelector('.navigate-home-btn');
      if (homeBtn) homeBtn.removeEventListener('click', this._boundNavigateToHome);
      const testsBtn = this.shadowRoot.querySelector('.navigate-tests-btn');
      if (testsBtn) testsBtn.removeEventListener('click', this._boundNavigateToTests);
      const nonExistentBtn = this.shadowRoot.querySelector('.navigate-non-existent-btn');
      if(nonExistentBtn) nonExistentBtn.removeEventListener('click', this._boundNavigateToNonExistent);
      const runTestBtn = this.shadowRoot.querySelector('.run-this-test-button');
      if (runTestBtn) runTestBtn.removeEventListener('click', this._boundHandleRunTest);
    }

    async runTest() {
      console.log('[RouterTestElement] Starting test...');
      if (!window.ElevateRouter || typeof window.ElevateRouter.navigate !== 'function' || typeof window.ElevateRouter.parsePath !== 'function') {
        this.setState({ testResult: { success: false, message: 'ElevateRouter or its methods not available.' } });
        if (typeof this.render === 'function' && this.shadowRoot) this.shadowRoot.innerHTML = this.render();
        this.attachEventHandlers();
        return;
      }

      let allTestsPassed = true;
      let messages = [];
      const originalPath = window.ElevateRouter.parsePath();

      // Test 1: Navigate to / (Home)
      this.navigateToPath('/');
      await new Promise(resolve => setTimeout(resolve, 100));
      if (this.state.lastNavigationPath === '/' && window.ElevateRouter.parsePath() === '/') {
        messages.push('Navigate to /: OK');
      } else {
        allTestsPassed = false;
        messages.push(`Navigate to /: FAIL (lastNav: ${this.state.lastNavigationPath}, currentPath: ${window.ElevateRouter.parsePath()})`);
      }

      // Test 2: Navigate to /tests
      this.navigateToPath('/tests');
      await new Promise(resolve => setTimeout(resolve, 100));
      if (this.state.lastNavigationPath === '/tests' && window.ElevateRouter.parsePath() === '/tests') {
        messages.push('Navigate to /tests: OK');
      } else {
        allTestsPassed = false;
        messages.push(`Navigate to /tests: FAIL (lastNav: ${this.state.lastNavigationPath}, currentPath: ${window.ElevateRouter.parsePath()})`);
      }

      const nonExistentPath = '/non-existent-test-route';
      this.navigateToPath(nonExistentPath);
      await new Promise(resolve => setTimeout(resolve, 100));
      if (this.state.lastNavigationPath === nonExistentPath) {
        messages.push(`Attempt to navigate to ${nonExistentPath}: OK (event fired)`);
      } else {
        allTestsPassed = false;
        messages.push(`Attempt to navigate to ${nonExistentPath}: FAIL (event not fired for this path, lastNav: ${this.state.lastNavigationPath})`);
      }

      if (originalPath !== window.ElevateRouter.parsePath()) {
         console.log(`[RouterTestElement] Restoring original path to: ${originalPath}`);
         this.navigateToPath(originalPath);
         await new Promise(resolve => setTimeout(resolve, 100));
      }

      this.setState({
        testResult: { success: allTestsPassed, message: messages.join('; ') }
      });
      // setState with MinimalBaseClass calls render, so DOM is new.
      this.attachEventHandlers(); // Re-attach to new DOM.
      return this.state.testResult;
    }

    render() {
      const testResultStatusClass = this.state.testResult.success === true ? 'success'
                                  : this.state.testResult.success === false ? 'failure'
                                  : 'not-run';
      return \`
        <style>
          :host { display: block; padding: 10px; border: 1px solid #eee; margin-bottom:10px; font-family: sans-serif; }
          button { margin: 5px; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; background-color: #007bff; color: white; }
          button:hover { background-color: #0056b3; }
          .run-this-test-button { background-color: #28a745; }
          .run-this-test-button:hover { background-color: #1e7e34; }
          .path-display { margin-top:10px; padding:10px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; }
          .path-display p { margin: 5px 0; }
          .test-result { margin-top: 10px; padding: 10px; border: 1px solid #dee2e6; border-radius: 5px;}
          .test-result h4 { margin-top: 0; margin-bottom: 5px; color: #343a40; }
          .status-message { padding: 8px; border-radius: 4px; font-weight: bold; }
          .status-message.success { color: #155724; background-color: #d4edda; border: 1px solid #c3e6cb;}
          .status-message.failure { color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb;}
          .status-message.not-run { color: #856404; background-color: #fff3cd; border: 1px solid #ffeeba;}
        </style>
        <div>
          <h4>Router Test</h4>
          <button class="navigate-home-btn">Navigate to Home (/)</button>
          <button class="navigate-tests-btn">Navigate to Tests (/tests)</button>
          <button class="navigate-non-existent-btn">Navigate to /non-existent-test-route</button>
          <button class="run-this-test-button">Run This Test</button>
          <div class="path-display">
            <p>Current Path (from Router.parsePath()): <strong>\${this.state.currentPathDisplay}</strong></p>
            <p>Last Navigated Path (from event): <strong>\${this.state.lastNavigationPath}</strong></p>
            <p>Last Nav Params: <strong>\${JSON.stringify(this.state.lastNavigationParams)}</strong></p>
          </div>
          <div class="test-result">
            <h4>Test Result:</h4>
            <p class="status-message \${testResultStatusClass}">
              \${this.state.testResult.message}
            </p>
          </div>
        </div>
      \`;
    }
  }

  if (!customElements.get('router-test-element')) {
    customElements.define('router-test-element', RouterTestElement);
    console.log('[RouterTestElement] Custom element defined by RouterTestElementBuilder.');
  }
  return RouterTestElement;
}
