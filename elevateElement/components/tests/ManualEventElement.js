// elevateElement/components/ManualEventElement.js

export function ManualEventElementBuilder(ElevateElementClass) {
  class ManualEventElement extends ElevateElementClass {
    constructor() {
      super('manual-event-element');

      this.state = {
        nativeStatus: '',
        internalStatus: ''
      };
    }

    connectedCallback() {
      super.connectedCallback();
      console.log('[ManualEventElement] connected');

      // Listen for native dispatched event
      this.addEventListener('manual-native', (e) => {
        console.log('[ManualEventElement] Native event caught:', e);
        this.setState({ nativeStatus: 'Native event received!' });
      });

      // Listen for internal event
      this.on('manual-internal', (detail) => {
        console.log('[ManualEventElement] Internal event caught:', detail);
        this.setState({ internalStatus: 'Internal event received!' });
      });
    }

    disconnectedCallback() {
      console.log('[ManualEventElement] disconnected');
      super.disconnectedCallback && super.disconnectedCallback();
    }

    events() {
      return {
        click: {
          '.native-button': (e) => this.dispatchNativeEvent(e),
          '.internal-button': (e) => this.emitInternalEvent(e),
          _options: { passive: true }
        }
      };
    }

    dispatchNativeEvent(e) {
      console.log('[ManualEventElement] Dispatching native CustomEvent.');
      const event = new CustomEvent('manual-native', {
        bubbles: true,
        composed: true,
        detail: { source: 'native' }
      });
      this.dispatchEvent(event);
    }

    emitInternalEvent(e) {
      console.log('[ManualEventElement] Emitting internal event.');
      this.emit('manual-internal', { source: 'internal' });
    }

    render() {
      return `
        <style>
          :host {
            display: block;
            font-family: sans-serif;
            padding: 1rem;
          }
          button {
            padding: 0.5rem 1rem;
            margin-right: 1rem;
            margin-bottom: 1rem;
            background: var(--primary-color, #6200ea);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
          p {
            margin: 0.5rem 0;
          }
        </style>

        <div>
          <button class="native-button">Dispatch Native Event</button>
          <button class="internal-button">Emit Internal Event</button>
          <p><strong>Native Event Status:</strong> ${this.state.nativeStatus || '(none)'}</p>
          <p><strong>Internal Event Status:</strong> ${this.state.internalStatus || '(none)'}</p>
        </div>
      `;
    }
  }

  customElements.define('manual-event-element', ManualEventElement);
}