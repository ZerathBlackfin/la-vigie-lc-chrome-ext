(function(global) {
  'use strict';

  global.createTracker = function(config) {
    return {
      name: config.name,
      id: config.id,
      requiresPasskey: config.requiresPasskey || false,
      passkeyConfigKey: config.passkeyConfigKey || null,

      async search(title, minSize, maxSize, passkey) {
        if (this.requiresPasskey && !passkey) {
          return { error: 'Passkey manquante' };
        }

        try {
          return await config.search.call(this, title, minSize, maxSize, passkey);
        } catch (error) {
          return { error: error.message };
        }
      }
    };
  };
})(typeof window !== 'undefined' ? window : self);
