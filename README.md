# ElevateElement

## What Is ElevateElement?
ElevateElement is a lightweight, custom JavaScript framework built on top of native Web Components. It combines modern modular architecture with minimal runtime overhead, aiming to give developers a simple yet powerful way to build performant, maintainable, and future-proof front-end applications — without relying on heavyweight frameworks like React or Svelte.

### Core Philosophy
> "Closer to the metal, infinitely flexible, and fully yours."

ElevateElement emphasizes ownership, customizability, and performance, keeping your web stack aligned with native browser capabilities (no compile step, no virtual DOM).

## Benefits of ElevateElement

| Feature | Benefit |
|---------|---------|
| 🧱 **Modular features (mixins)** | Add only what you need (state, ajax, events, routing, etc.) |
| 🧩 **Web Component base** | Native browser support, encapsulation, zero dependencies |
| 🧠 **Custom lifecycle hooks** | Introspect + intercept logic at every stage |
| ⚙️ **Shadow DOM templating** | Clean separation of styles and structure |
| 🛠 **Manual + dynamic routing** | Supports SPA behavior with history or hash modes |
| 📡 **Channel messaging** | Enables tab-to-tab sync and app-level events |
| 📦 **Config loader** | Centralizes business config and branding per app |
| 🌐 **AI/Web3 extensibility** | Prepares framework for smart, decentralized features |
| 🧪 **Built-in testing dashboard** | Allows fast visual verification of each core feature |

## Current Capabilities (Already Built)

✅ ElevateElement core with lifecycle, state, event, ajax, styling, and templating  
✅ Modular architecture (mixins can be turned on/off)  
✅ Internal router with error fallback and prefetching  
✅ Navigation builder and responsive layout system  
✅ Channel messaging and cross-tab sync  
✅ Config loader with dev mode and client info  
✅ Test element suite for verifying all features  

## Lit Integration

ElevateElement utilizes [Lit](https://lit.dev/) for building efficient, expressive, and interoperable web components. Core parts of the framework, including the main `elevate-element` custom element, are built using Lit's foundational `LitElement` class. This allows for reactive properties, scoped styles, and a declarative templating system.

**Key Features:**
- **Component-Based Architecture:** Lit promotes a modular approach to UI development.
- **Reactivity:** Components can reactively update when their properties change.
- **Scoped Styles:** CSS styles are encapsulated within components, preventing global conflicts.
- **Templates:** Uses `html` tagged template literals for defining component structure.

**Example:**
A simple Lit component example can be found in `elevateElement/components/tests/TestLitComponent.js`. You can view this component in action by navigating to the `/test-lit` route in the application. This example demonstrates a basic Lit component rendering content and also shows how HTMX can be used within a Lit component.

## HTMX Integration

[HTMX](https://htmx.org/) is integrated into ElevateElement to enhance HTML by providing modern browser features directly in HTML markup, rather than relying heavily on JavaScript. It allows for dynamic content loading, partial page updates, and server interactions with minimal JavaScript.

**Key Features:**
- **HTML-Centric:** Define AJAX requests, SSE connections, WebSockets, etc., directly in your HTML attributes.
- **Partial Updates:** Easily update only specific parts of a page (e.g., using `hx-target` and `hx-swap`).
- **Reduced JavaScript:** Simplifies dynamic interactions, often removing the need for custom JavaScript for common AJAX patterns.

**Examples:**

1.  **Basic HTMX Content Loading:**
    - A demonstration of HTMX fetching an HTML snippet can be seen in `elevateElement/views/HtmxTestView.js`. This view is accessible via the `/test-htmx` route.
    - The HTML snippet loaded is located at `elevateElement/views/partials/htmx-content.html`.
    - The server (`server.js`) is configured to serve this snippet and also provides a dynamic data endpoint (`/htmx-current-time`) which is used within the loaded snippet to show HTMX's capability for nested dynamic updates.

2.  **HTMX within a Lit Component:**
    - As mentioned in the Lit section, `elevateElement/components/tests/TestLitComponent.js` (viewable at `/test-lit`) also demonstrates how an HTMX-powered element can be embedded and function correctly within a Lit component. This allows for Lit to manage the component structure while HTMX handles specific dynamic interactions within it.

To ensure HTMX works correctly, the application server (`server.js`) has been configured with specific endpoints to serve HTML partials and dynamic data required by the HTMX examples.

## Development Roadmap

### 🧱 1. Finalize Core Components
- `<route-link>` functionality and accessibility (now fixed)
- Ensure all registered components (navigation, views, route-links) are upgraded properly
- Add `<slot>` support where needed (for real DOM projection)
- Finalize `<route-menu>` and multi-level navigation builder

### 🌐 2. Service Worker Integration
Add service worker support for:
- Offline access
- Caching pages and routes
- Versioning and update lifecycle

### 📋 3. Accessibility + SEO Helpers
- Enforce role, aria-*, lang, and keyboard nav in templates
- Integrate a lightweight `<seo-manager>` and `<a11y-helper>` class to apply this site-wide

### 🧭 4. Global Bootstrap & Builder
Create a central ElevateBuilder or elevateApp() that:
- Loads config
- Registers all core elements
- Binds views
- Initializes router and service worker
- Ensures components are upgraded before view loading

### 🧪 5. Testing & Final QA
- Verify that all test elements (Manual Event, AJAX, Channel, Error, Config) work independently and together
- Cross-browser test: Chrome, Edge, Firefox, Safari
- Mobile responsive layouts working as intended

### 🧼 6. Cleanup + Documentation
- Remove dev logs (or gate them behind a dev flag)
- Write usage documentation for:
  - Creating a component
  - Routing setup
  - Layout system
  - Adding new features

## Version 1 Goal
A complete, documented, and modular native JavaScript framework capable of powering fully functional SPAs — built entirely on Web Components with optional progressive features.

## Future Roadmap (v1.1-1.5)

| Feature | Purpose |
|---------|---------|
| Web3 Wallet Support | Connect to MetaMask or WalletConnect |
| WASM Bridge | Run high-performance logic in Rust/Assembly |
| AI Integration | Build AI-assisted elements (text completion, smart forms) |
| CLI Tool (Optional) | elevate new, elevate build for scaffolding and bundling |
| Design Tokens | Style system for themes and branding |

## Final Thought
ElevateElement is about creating a platform that's:

- Lightweight
- Native
- Extensible
- Truly yours

You're not just building a framework — you're crafting a new standard for ownership and web intelligence. 