// features/ajax.js

export function addAjax(BaseElement) {
  return class extends BaseElement {
    /**
     * Perform an AJAX request using Fetch API.
     * Supports Promise chaining or async/await.
     * 
     * @param {string} url - The URL to request.
     * @param {object} [options={}] - Options for the request (method, headers, body, etc.).
     * @returns {Promise<object>} Resolves with JSON or text depending on response.
     */
    ajax(url, options = {}) {
      const {
        method = 'GET',
        headers = { 'Content-Type': 'application/json' },
        body = null,
        then = null,
        catchError = null,
        asText = false
      } = options;

      const fetchOptions = {
        method,
        headers,
      };

      if (body) {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      const promise = fetch(url, fetchOptions)
        .then(async response => {
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed: ${response.status} ${response.statusText}\n${errorText}`);
          }
          return asText ? response.text() : response.json();
        });

      // If developer provides .then and/or .catch handlers in options, attach them
      if (typeof then === 'function') {
        promise.then(then);
      }

      if (typeof catchError === 'function') {
        promise.catch(catchError);
      }

      return promise;
    }

    /**
     * Async/Await version of ajax for simpler use in async functions.
     * 
     * @param {string} url - The URL to request.
     * @param {object} [options={}] - Same options as ajax().
     * @returns {object} Response JSON or text.
     */
    async ajaxAsync(url, options = {}) {
      try {
        const {
          method = 'GET',
          headers = { 'Content-Type': 'application/json' },
          body = null,
          asText = false
        } = options;

        const fetchOptions = {
          method,
          headers,
        };

        if (body) {
          fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed: ${response.status} ${response.statusText}\n${errorText}`);
        }

        return asText ? await response.text() : await response.json();
      } catch (error) {
        console.error('AJAX async error:', error);
        throw error;
      }
    }
  };
}