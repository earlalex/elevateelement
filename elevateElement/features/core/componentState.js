// ============================
// elevateElement/core/StateManagement.js
// ============================

export const GlobalState = (() => {
  const state = {};
  const listeners = {};

  function set(key, value) {
    state[key] = value;
    if (listeners[key]) {
      listeners[key].forEach(fn => fn(value));
    }
  }

  function get(key) {
    return state[key];
  }

  function subscribe(key, callback) {
    if (!listeners[key]) listeners[key] = [];
    listeners[key].push(callback);
  }

  function unsubscribe(key, callback) {
    if (!listeners[key]) return;
    listeners[key] = listeners[key].filter(fn => fn !== callback);
  }

  return {
    set,
    get,
    subscribe,
    unsubscribe
  };
})();