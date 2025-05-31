// elevateElement/components/RouteLinkElementBuilder.js

export function RouteLinkElementBuilder(ElevateElement) {
  class RouteLinkElement extends ElevateElement {
    constructor() {
      super();
      console.log("[RouteLink] Constructor called");
      this._routeChangeHandler = null;
      
      // No shadow DOM - direct DOM manipulation instead
      this.style.display = 'block';
      this.style.cursor = 'pointer';
      this.style.padding = '8px 16px';
      this.style.color = '#333333';
      this.style.backgroundColor = 'transparent';
      this.style.fontSize = '16px';
      this.style.minHeight = '20px';
      this.style.minWidth = '80px';
      this.style.transition = 'background-color 150ms ease';
      this.style.border = '1px solid #ddd';
      this.style.borderRadius = '4px';
      this.style.textAlign = 'center';
      
      // Important: Element must have dimensions
      this.style.height = 'auto';
      this.style.boxSizing = 'border-box';
    }

    connectedCallback() {
      console.log("[RouteLink] Connected to DOM");

      if (super.connectedCallback) {
        super.connectedCallback();
      }

      // Set default attributes
      this.setAttribute("tabindex", "0");
      this.setAttribute("role", "link");

      // Set initial text if none provided
      if (!this.textContent) {
        const path = this.getAttribute("path") || '/';
        this.textContent = path;
      }

      // Subscribe to route changes
      if (window.ElevateRouter) {
        this._routeChangeHandler = window.ElevateRouter.onRouteChange(() => {
          this.checkActive();
        });
      }

      // Add click handler
      this.addEventListener('click', this.onClick.bind(this));
      
      // Force visibility check after connection
      setTimeout(() => {
        console.log('[RouteLink] Visibility check:', {
          element: this.tagName,
          width: this.offsetWidth,
          height: this.offsetHeight,
          display: window.getComputedStyle(this).display,
          visibility: window.getComputedStyle(this).visibility,
          zIndex: window.getComputedStyle(this).zIndex,
          parentNode: this.parentNode ? this.parentNode.tagName : 'none',
          parentVisible: this.parentNode ? window.getComputedStyle(this.parentNode).display : 'none'
        });
        
        // Force repaint
        this.style.backgroundColor = this.style.backgroundColor;
      }, 100);
      
      // Initial check
      this.checkActive();
    }

    disconnectedCallback() {
      console.log("[RouteLink] Disconnected from DOM");

      if (this._routeChangeHandler) {
        this._routeChangeHandler();
        this._routeChangeHandler = null;
      }

      // Remove click handler
      this.removeEventListener('click', this.onClick.bind(this));

      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
    }

    onClick(event) {
      console.log("[RouteLink] Click event fired");

      if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.button !== 0
      ) {
        console.log("[RouteLink] Modified click detected, ignoring SPA navigation");
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const path = this.getAttribute("path");
      console.log("[RouteLink] Path to navigate:", path);

      if (!path) {
        console.warn('[RouteLink] No "path" attribute found');
        return;
      }

      // Add check for Router initialization
      if (!window.ElevateRouter) {
        console.error("[RouteLink] ElevateRouter not initialized");
        window.location.href = path; // Fallback to regular navigation
        return;
      }

      if (typeof window.ElevateRouter.navigate === "function") {
        console.log("[RouteLink] Navigating internally");
        window.ElevateRouter.navigate(path);
      } else {
        console.error("[RouteLink] ElevateRouter.navigate missing");
        window.location.href = path; // Fallback to regular navigation
      }
    }

    checkActive() {
      const path = this.getAttribute("path");
      const currentPath = window.location.pathname || "/";
      console.log(`[RouteLink] checkActive: current=${currentPath}, link=${path}`);

      if (currentPath === path) {
        this.classList.add("active");
        this.style.fontWeight = 'bold';
        this.style.backgroundColor = '#6200ea';
        this.style.color = '#ffffff';
      } else {
        this.classList.remove("active");
        this.style.fontWeight = 'normal';
        this.style.backgroundColor = '#efefef';
        this.style.color = '#333333';
      }
    }

    static get observedAttributes() {
      return ['path', 'target'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) {
        console.log(`[RouteLink] attributeChangedCallback: ${name} updated`);
        if (name === 'path' && !this.textContent) {
          // Update text if empty
          this.textContent = newValue || 'Link';
        }
        this.checkActive();
      }
    }
  }

  if (!customElements.get('route-link')) {
    customElements.define('route-link', RouteLinkElement);
  }
}