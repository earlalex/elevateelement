/**
 * ElevateElement Feature: channelMessaging.js
 * Enables managing multiple BroadcastChannels in a component with message handling and optional event emission.
 */
export default function ChannelMessagingFeature(BaseClass) {
    return class ChannelMessagingFeature extends BaseClass {
      constructor(...args) {
        super(...args);
        // Internal registry of channels and handlers
        this._channels = {};          // Map channelName -> BroadcastChannel instance
        this._channelHandlers = {};   // Map channelName -> { '*': [handlers], 'type': [handlers] }
  
        // Config: auto-emit events for incoming messages (disabled by default)
        const opts = this.constructor.channelMessaging;
        /** @type {boolean} */
        this.channelMessagingAutoEmit = !!(opts && opts.autoEmit);
      }
  
      /**
       * Open (or join) a BroadcastChannel with the given name.
       * If already open, returns the existing channel instance.
       * @param {string} name - The channel name.
       * @return {BroadcastChannel} The BroadcastChannel instance for the name.
       */
      openChannel(name) {
        // If channel already exists, return it
        if (this._channels[name]) {
          return this._channels[name];
        }
        // Create new BroadcastChannel and store it
        const channel = new BroadcastChannel(name);
        this._channels[name] = channel;
        this._channelHandlers[name] = {};
  
        // Listen for incoming messages on this channel
        channel.addEventListener('message', (event) => {
          this._handleChannelMessage(name, event);
        });
        return channel;
      }
  
      /**
       * Send a message on a specific channel.
       * @param {string} name - The channel name to send the message on.
       * @param {*} data - The data to send (must be serializable via structured clone).
       */
      sendChannelMessage(name, data) {
        const channel = this._channels[name];
        if (!channel) {
          console.warn(`Channel "${name}" is not open. Call openChannel("${name}") first.`);
          return;
        }
        channel.postMessage(data);
      }
  
      /**
       * Register a message handler for a channel, with optional type filtering.
       * @param {string} name - The channel name to listen on.
       * @param {string|Function} typeOrHandler - If a string, treat as message type to filter; if a function, it's the handler for all messages.
       * @param {Function} [handler] - The handler function (if a type string was provided as second argument).
       */
      onChannelMessage(name, typeOrHandler, handler) {
        // Ensure channel is open
        if (!this._channels[name]) {
          this.openChannel(name);
        }
        // Determine if a type filter is provided
        let type;
        let callback;
        if (typeof typeOrHandler === 'function') {
          // Only handler provided, no filtering
          type = '*';
          callback = typeOrHandler;
        } else {
          // typeOrHandler is a string (message type), and handler is the callback
          type = typeOrHandler;
          callback = handler;
        }
        if (typeof callback !== 'function') {
          console.warn('onChannelMessage requires a handler function.');
          return;
        }
        // Initialize handler array for this type if not exist
        if (!this._channelHandlers[name][type]) {
          this._channelHandlers[name][type] = [];
        }
        // Store the handler
        this._channelHandlers[name][type].push(callback);
      }
  
      /**
       * Internal handler for incoming BroadcastChannel messages.
       * Dispatches to any registered handlers and triggers auto-emit events if enabled.
       * @param {string} name - The channel name on which the message was received.
       * @param {MessageEvent} event - The message event from BroadcastChannel.
       */
      _handleChannelMessage(name, event) {
        const data = event.data;
        // Determine message type if available (expecting e.g. {type: "...", ...})
        const messageType = (data && typeof data === 'object' && 'type' in data) ? data.type : undefined;
        const handlersMap = this._channelHandlers[name] || {};
  
        // Invoke general handlers (no type filter)
        if (handlersMap['*']) {
          for (const handler of handlersMap['*']) {
            try {
              handler.call(this, data, event);
            } catch (e) {
              console.error(`Error in BroadcastChannel handler (channel "${name}"):`, e);
            }
          }
        }
        // Invoke handlers for specific messageType
        if (messageType && handlersMap[messageType]) {
          for (const handler of handlersMap[messageType]) {
            try {
              handler.call(this, data, event);
            } catch (e) {
              console.error(`Error in BroadcastChannel handler for type "${messageType}" (channel "${name}"):`, e);
            }
          }
        }
        // Auto-emit a component event if enabled and messageType is present
        if (this.channelMessagingAutoEmit && messageType && typeof this.emit === 'function') {
          try {
            this.emit(messageType, data);
          } catch (e) {
            console.error(`Error emitting event "${messageType}" from channel message:`, e);
          }
        }
      }
  
      /**
       * Close a specific channel and remove all its handlers.
       * @param {string} name - The channel name to close.
       */
      closeChannel(name) {
        const channel = this._channels[name];
        if (!channel) return;
        // Remove event listeners and close the channel
        // (BroadcastChannel doesn't require manual removal of listeners before closing, 
        //  but we clear our references for safety.)
        channel.close();
        delete this._channels[name];
        delete this._channelHandlers[name];
      }
  
      /**
       * Close all open channels and remove their handlers.
       * This is automatically called when the component disconnects.
       */
      closeAllChannels() {
        for (const name of Object.keys(this._channels)) {
          this.closeChannel(name);
        }
      }
  
      /**
       * Lifecycle callback (if ElevateElement components use connected/disconnected).
       * Ensures channels are cleaned up when component is removed.
       */
      disconnectedCallback() {
        if (super.disconnectedCallback) {
          super.disconnectedCallback();
        }
        this.closeAllChannels();
      }
    };
  }