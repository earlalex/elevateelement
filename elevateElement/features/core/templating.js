// features/templating.js

export function addTemplating(BaseElement) {
  return class extends BaseElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    template() {
      return `<div>Hello, ElevateElement!</div>`;
    }

    render() {
      let rawTemplate = this.template();
      if (typeof rawTemplate !== 'string') {
        console.error('template() must return a string.');
        return;
      }

      const evaluatedTemplate = this.#processTemplate(rawTemplate);

      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = evaluatedTemplate;
        this.#processDirectives(this.shadowRoot);
        this.#applyZIndex(this.shadowRoot);
        this.#bindEvents(this.shadowRoot);
      } else {
        this.innerHTML = evaluatedTemplate;
        this.#processDirectives(this);
        this.#applyZIndex(this);
        this.#bindEvents(this);
      }
    }

    #processTemplate(templateString) {
      return templateString.replace(/\$\{this\.state\.([^\}]+)\}/g, (_, key) => {
        const value = this.state?.[key];
        return typeof value !== 'undefined' ? value : '';
      });
    }

    #processDirectives(root) {
      this.#processForDirectives(root);
      this.#processIfDirectives(root);
    }

    #processIfDirectives(root) {
      const eIfElements = root.querySelectorAll('[e-if]');
      eIfElements.forEach(el => {
        const condition = el.getAttribute('e-if');
        let shouldShow = false;
        try {
          shouldShow = Function(`return (${condition})`).call(this);
        } catch (error) {
          console.error('Error evaluating e-if condition:', condition, error);
        }
        if (!shouldShow) {
          el.remove();
        }
      });
    }

    #processForDirectives(root) {
      const eForElements = root.querySelectorAll('[e-for]');
      eForElements.forEach(el => {
        const expression = el.getAttribute('e-for');

        // Match either (item, index) in array or item in array
        const match = expression.match(/^\(?\s*(\w+)(?:\s*,\s*(\w+))?\s*\)?\s+in\s+(.+)$/);

        if (!match) {
          console.error('Invalid e-for expression:', expression);
          return;
        }

        const [, itemName, indexName, arrayExpression] = match;

        let items = [];
        try {
          items = Function(`return (${arrayExpression})`).call(this);
        } catch (error) {
          console.error('Error evaluating e-for array:', arrayExpression, error);
        }

        if (!Array.isArray(items)) {
          console.error('e-for target must be an array:', arrayExpression);
          return;
        }

        const parent = el.parentNode;
        items.forEach((item, index) => {
          const clone = el.cloneNode(true);
          clone.removeAttribute('e-for');

          // Replace item and index placeholders
          clone.innerHTML = clone.innerHTML
            .replace(new RegExp(`\\$\\{${itemName}\\}`, 'g'), item)
            .replace(new RegExp(`\\$\\{${indexName}\\}`, 'g'), index);

          parent.insertBefore(clone, el);
        });

        el.remove();
      });
    }

    #bindEvents(root) {
      const elements = root.querySelectorAll('*');
      elements.forEach(el => {
        [...el.attributes].forEach(attr => {
          if (attr.name.startsWith('@')) {
            const eventName = attr.name.slice(1);
            const handlerExpression = attr.value;

            const hasArgs = handlerExpression.includes('(');

            if (!hasArgs) {
              const handlerName = handlerExpression.trim();
              if (typeof this[handlerName] === 'function') {
                el.addEventListener(eventName, this[handlerName].bind(this));
              } else {
                console.error(`Handler "${handlerName}" is not a function on`, this);
              }
            } else {
              const methodMatch = handlerExpression.match(/^(\w+)\((.*)\)$/);
              if (!methodMatch) {
                console.error('Invalid event handler expression:', handlerExpression);
                return;
              }

              const [, methodName, argsString] = methodMatch;

              if (typeof this[methodName] !== 'function') {
                console.error(`Handler "${methodName}" is not a function on`, this);
                return;
              }

              el.addEventListener(eventName, (event) => {
                const parsedArgs = argsString.split(',').map(arg => {
                  arg = arg.trim();
                  if ((arg.startsWith(`'`) && arg.endsWith(`'`)) || (arg.startsWith(`"`) && arg.endsWith(`"`))) {
                    return arg.slice(1, -1);
                  } else if (!isNaN(Number(arg))) {
                    return Number(arg);
                  } else if (arg === 'event') {
                    return event;
                  } else {
                    try {
                      return Function(`return (${arg})`).call(this);
                    } catch {
                      return undefined;
                    }
                  }
                });

                this[methodName](...parsedArgs);
              });
            }
          }
        });
      });
    }

    #applyZIndex(root) {
      if (typeof this.zIndex !== 'undefined' && root.host) {
        root.host.style.zIndex = String(this.zIndex);
        root.host.style.position = 'relative';
      }
    }
  };
}