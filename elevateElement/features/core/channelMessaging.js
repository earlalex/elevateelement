// elevateElement/features/channelMessaging.js
export function addChannelMessagingFeature(BaseClass) {
  return class addChannelMessagingFeature extends BaseClass {
    constructor(...args) {
      super(...args);

      this._channels = {}; // Map: channelName -> BroadcastChannel
      this._channelHandlers = {}; // Map: channelName -> { '*': [], 'type': [] }
      this._namespace = this.constructor.name; // Default namespace: class name

      const opts = this.constructor.channelMessaging;
      this.channelMessagingAutoEmit = !!(opts && opts.autoEmit);
    }

    /**
     * Open (or join) a BroadcastChannel.
     */
    openChannel(name = 'elevate-element-channel') {
      if (this._channels[name]) return this._channels[name];

      const channel = new BroadcastChannel(name);
      this._channels[name] = channel;
      this._channelHandlers[name] = {};

      channel.addEventListener('message', (event) => {
        this._handleChannelMessage(name, event);
      });

      return channel;
    }

    /**
     * Send a structured message on a channel.
     */
    sendChannelMessage(name, payload, customType = 'generic') {
      const channel = this._channels[name];
      if (!channel) {
        console.warn(`Channel "${name}" is not open. Call openChannel("${name}") first.`);
        return;
      }

      const structuredMessage = {
        type: customType,
        namespace: this._namespace,
        payload: payload,
        timestamp: Date.now()
      };

      channel.postMessage(structuredMessage);
    }

    /**
     * Broadcast partial state to other tabs.
     */
    syncState(partialState, channelName = 'elevate-element-channel') {
      if (!partialState || typeof partialState !== 'object') return;

      this.sendChannelMessage(channelName, partialState, 'sync-state');
    }

    /**
     * Hook for receiving incoming synced state.
     */
    receiveSyncedState(incomingState) {
      if (!incomingState || typeof incomingState !== 'object') return;
      this.setState({ ...incomingState });
    }

    /**
     * Listen for incoming channel messages.
     */
    onChannelMessage(name, typeOrHandler, handler) {
      if (!this._channels[name]) {
        this.openChannel(name);
      }

      let type;
      let callback;
      if (typeof typeOrHandler === 'function') {
        type = '*';
        callback = typeOrHandler;
      } else {
        type = typeOrHandler;
        callback = handler;
      }

      if (typeof callback !== 'function') {
        console.warn('onChannelMessage requires a handler function.');
        return;
      }

      if (!this._channelHandlers[name][type]) {
        this._channelHandlers[name][type] = [];
      }
      this._channelHandlers[name][type].push(callback);
    }

    /**
     * Handle an incoming BroadcastChannel message.
     */
    _handleChannelMessage(name, event) {
      const data = event.data;
      const { type, namespace, payload } = data || {};

      if (!namespace || namespace !== this._namespace) {
        // Ignore messages for other component types
        return;
      }

      const handlersMap = this._channelHandlers[name] || {};

      // Generic handlers
      if (handlersMap['*']) {
        for (const handler of handlersMap['*']) {
          try {
            handler.call(this, data, event);
          } catch (e) {
            console.error(`Error in channel handler (channel "${name}")`, e);
          }
        }
      }

      // Type-specific handlers
      if (type && handlersMap[type]) {
        for (const handler of handlersMap[type]) {
          try {
            handler.call(this, data, event);
          } catch (e) {
            console.error(`Error in channel handler for type "${type}"`, e);
          }
        }
      }

      // Auto emit as event if enabled
      if (this.channelMessagingAutoEmit && type && typeof this.emit === 'function') {
        try {
          this.emit(type, payload);
        } catch (e) {
          console.error(`Error emitting event "${type}" from channel message:`, e);
        }
      }

      // Built-in sync handler
      if (type === 'sync-state') {
        this.receiveSyncedState(payload);
      }
    }

    /**
     * Close a specific channel manually.
     */
    closeChannel(name) {
      const channel = this._channels[name];
      if (!channel) return;
      channel.close();
      delete this._channels[name];
      delete this._channelHandlers[name];
    }

    /**
     * Close all open channels on disconnect.
     */
    closeAllChannels() {
      for (const name of Object.keys(this._channels)) {
        this.closeChannel(name);
      }
    }

    disconnectedCallback() {
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
      this.closeAllChannels();
    }
  };
}