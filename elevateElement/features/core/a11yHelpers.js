// features/a11yHelpers.js

export function addA11yHelpers(BaseElement) {
    return class extends BaseElement {
      constructor() {
        super();
        this.a11y = {
          setRole: this.#setRole.bind(this),
          focusTrap: this.#focusTrap.bind(this),
          skipLink: this.#createSkipLink.bind(this),
          announce: this.#announce.bind(this)
        };
      }
  
      #setRole(element, role) {
        if (element && typeof role === 'string') {
          element.setAttribute('role', role);
        }
      }
  
      #focusTrap(container) {
        if (!container) return;
  
        const focusableSelectors = [
          'a[href]', 'area[href]', 'input:not([disabled])',
          'select:not([disabled])', 'textarea:not([disabled])',
          'button:not([disabled])', 'iframe', 'object', 'embed',
          '[tabindex]:not([tabindex="-1"])', '[contenteditable]'
        ];
  
        const focusable = Array.from(container.querySelectorAll(focusableSelectors.join(',')));
  
        if (!focusable.length) return;
  
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
  
        container.addEventListener('keydown', (e) => {
          if (e.key !== 'Tab') return;
  
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        });
      }
  
      #createSkipLink(targetId) {
        const skip = document.createElement('a');
        skip.href = `#${targetId}`;
        skip.className = 'skip-link';
        skip.textContent = 'Skip to Main Content';
        skip.style.position = 'absolute';
        skip.style.top = '-40px';
        skip.style.left = '0';
        skip.style.background = 'black';
        skip.style.color = 'white';
        skip.style.padding = '8px';
        skip.style.zIndex = '1000';
        skip.addEventListener('focus', () => {
          skip.style.top = '0';
        });
        skip.addEventListener('blur', () => {
          skip.style.top = '-40px';
        });
  
        document.body.prepend(skip);
      }
  
      #announce(message) {
        let liveRegion = document.getElementById('elevate-live-region');
        if (!liveRegion) {
          liveRegion = document.createElement('div');
          liveRegion.id = 'elevate-live-region';
          liveRegion.setAttribute('aria-live', 'polite');
          liveRegion.style.position = 'absolute';
          liveRegion.style.left = '-9999px';
          liveRegion.style.width = '1px';
          liveRegion.style.height = '1px';
          document.body.appendChild(liveRegion);
        }
        liveRegion.textContent = '';
        setTimeout(() => {
          liveRegion.textContent = message;
        }, 100);
      }
    };
  }