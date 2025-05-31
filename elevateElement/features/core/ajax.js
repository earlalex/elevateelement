// elevateElement/features/ajax.js

export function addAjax(BaseElement) {
  return class extends BaseElement {
    /**
     * Perform a flexible AJAX request using Fetch API.
     * Supports Promise chaining or async/await.
     *
     * @param {string} url - The URL to request.
     * @param {object} [options={}] - Options for the request (method, headers, body, then, catchError, asText).
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

      const fetchOptions = { method, headers };

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

      if (typeof then === 'function') {
        promise.then(then);
      }
      if (typeof catchError === 'function') {
        promise.catch(catchError);
      }

      return promise;
    }

    /**
     * Async/Await version of AJAX for simpler use inside async functions.
     * @param {string} url
     * @param {object} [options={}]
     * @returns {Promise<object|string>}
     */
    async ajaxAsync(url, options = {}) {
      try {
        const {
          method = 'GET',
          headers = { 'Content-Type': 'application/json' },
          body = null,
          asText = false
        } = options;

        const fetchOptions = { method, headers };

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

    /**
     * GET JSON convenience method.
     * @param {string} url
     * @param {object} [options={}]
     * @returns {Promise<object>}
     */
    async getJSON(url, options = {}) {
      return this.ajaxAsync(url, {
        ...options,
        method: 'GET',
      });
    }

    /**
     * POST JSON convenience method.
     * @param {string} url
     * @param {object} body
     * @param {object} [options={}]
     * @returns {Promise<object>}
     */
    async postJSON(url, body = {}, options = {}) {
      return this.ajaxAsync(url, {
        ...options,
        method: 'POST',
        body,
      });
    }

    /**
     * PUT JSON convenience method.
     * @param {string} url
     * @param {object} body
     * @param {object} [options={}]
     * @returns {Promise<object>}
     */
    async putJSON(url, body = {}, options = {}) {
      return this.ajaxAsync(url, {
        ...options,
        method: 'PUT',
        body,
      });
    }

    /**
     * DELETE JSON convenience method.
     * @param {string} url
     * @param {object} [options={}]
     * @returns {Promise<object>}
     */
    async deleteJSON(url, options = {}) {
      return this.ajaxAsync(url, {
        ...options,
        method: 'DELETE',
      });
    }
  };
}