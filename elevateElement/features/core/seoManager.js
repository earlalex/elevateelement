// features/seoManager.js

export function addSEOManager(BaseElement) {
    return class extends BaseElement {
      constructor() {
        super();
        this.seo = {
          setTitle: this.#setTitle.bind(this),
          setDescription: this.#setDescription.bind(this),
          setMeta: this.#setMeta.bind(this),
          setOpenGraph: this.#setOpenGraph.bind(this)
        };
      }
  
      #setTitle(title) {
        if (typeof title === 'string') {
          document.title = title;
        }
      }
  
      #setDescription(description) {
        if (typeof description === 'string') {
          let descTag = document.querySelector('meta[name="description"]');
          if (!descTag) {
            descTag = document.createElement('meta');
            descTag.name = 'description';
            document.head.appendChild(descTag);
          }
          descTag.content = description;
        }
      }
  
      #setMeta(name, content) {
        if (typeof name === 'string' && typeof content === 'string') {
          let metaTag = document.querySelector(`meta[name="${name}"]`);
          if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.name = name;
            document.head.appendChild(metaTag);
          }
          metaTag.content = content;
        }
      }
  
      #setOpenGraph({ title, description, image }) {
        this.#setMeta('og:title', title || '');
        this.#setMeta('og:description', description || '');
        this.#setMeta('og:image', image || '');
      }
    };
  }