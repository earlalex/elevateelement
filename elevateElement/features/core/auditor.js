// elevateElement/features/auditor.js

export function runElevateAudit() {
    console.group('%cElevate Audit Results', 'color: purple; font-weight: bold;');
  
    // --- PERFORMANCE
    console.groupCollapsed('Performance');
    if (performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        console.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
      });
    }
  
    const totalNodes = document.getElementsByTagName('*').length;
    console.log(`Total DOM nodes: ${totalNodes}`);
    console.groupEnd();
  
    // --- ACCESSIBILITY
    console.groupCollapsed('Accessibility');
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      console.warn(`Missing alt attributes on ${images.length} images`);
    } else {
      console.log('All images have alt attributes.');
    }
  
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      console.warn('No headings (h1-h6) found on page.');
    } else {
      console.log(`Headings present: ${headings.length}`);
    }
    console.groupEnd();
  
    // --- SEO
    console.groupCollapsed('SEO');
    const title = document.querySelector('title');
    const description = document.querySelector('meta[name="description"]');
    const canonical = document.querySelector('link[rel="canonical"]');
  
    if (!title) console.warn('Missing <title> tag.');
    else console.log('Title tag present.');
  
    if (!description) console.warn('Missing meta description.');
    else console.log('Meta description present.');
  
    if (!canonical) console.warn('Missing canonical link.');
    else console.log('Canonical link present.');
    console.groupEnd();
  
    // --- BEST PRACTICES
    console.groupCollapsed('Best Practices');
    if (location.protocol !== 'https:') {
      console.warn('Site is not running over HTTPS.');
    } else {
      console.log('HTTPS confirmed.');
    }
  
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      console.warn('Missing viewport meta tag.');
    } else {
      console.log('Viewport meta tag present.');
    }
    console.groupEnd();
  
    console.groupEnd();
  }