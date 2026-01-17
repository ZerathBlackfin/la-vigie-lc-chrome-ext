(function(global) {
  'use strict';

  const trackers = new Map();

  global.TrackerRegistry = {
    register(tracker) {
      trackers.set(tracker.id, tracker);
    },

    get(id) {
      return trackers.get(id);
    },

    getAll() {
      return Array.from(trackers.values());
    },

    getIds() {
      return Array.from(trackers.keys());
    },

    async searchAll(title, minSize, maxSize, config = {}) {
      const results = {};
      const searchPromises = [];

      for (const tracker of trackers.values()) {
        const passkey = tracker.passkeyConfigKey ? config[tracker.passkeyConfigKey] : null;

        searchPromises.push(
          tracker.search(title, minSize, maxSize, passkey)
            .then(result => {
              results[tracker.name] = result;
            })
        );
      }

      await Promise.all(searchPromises);
      return results;
    },

    async searchTracker(trackerId, title, minSize, maxSize, passkey) {
      const tracker = trackers.get(trackerId);
      if (!tracker) {
        return { error: `Tracker inconnu: ${trackerId}` };
      }
      return tracker.search(title, minSize, maxSize, passkey);
    }
  };

  global.Trackers = {
    async searchNyaa(title, minSize, maxSize) {
      return TrackerRegistry.searchTracker('nyaa', title, minSize, maxSize);
    },
    async searchYggAPI(title, minSize, maxSize) {
      return TrackerRegistry.searchTracker('yggapi', title, minSize, maxSize);
    },
    async searchSharewood(title, minSize, maxSize, passkey) {
      return TrackerRegistry.searchTracker('sharewood', title, minSize, maxSize, passkey);
    },
    async searchLaCale(title, minSize, maxSize, passkey) {
      return TrackerRegistry.searchTracker('lacale', title, minSize, maxSize, passkey);
    },
    parseSize: (str) => TrackerUtils.parseSize(str),
    formatSize: (bytes) => TrackerUtils.formatSize(bytes)
  };

})(typeof window !== 'undefined' ? window : self);
