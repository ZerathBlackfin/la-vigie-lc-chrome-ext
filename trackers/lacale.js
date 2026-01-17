(function(global) {
  'use strict';

  const tracker = createTracker({
    name: 'La Cale',
    id: 'lacale',
    requiresPasskey: true,
    passkeyConfigKey: 'lacalePasskey',

    async search(title, minSize, maxSize, passkey) {
      const apiUrl = `https://la-cale.space/api/external?passkey=${passkey}&q=${encodeURIComponent(title)}`;
      const apiResponse = await fetch(apiUrl);

      if (!apiResponse.ok) {
        return { error: `HTTP ${apiResponse.status}` };
      }

      const data = await apiResponse.json();
      const torrents = Array.isArray(data) ? data : data.torrents || [];

      const results = [];
      for (const item of torrents.slice(0, 50)) {
        const sizeValue = item.size || 0;
        const sizeBytes = typeof sizeValue === 'number' ? sizeValue : TrackerUtils.parseSize(sizeValue);

        if (minSize && sizeBytes < minSize) continue;
        if (maxSize && sizeBytes > maxSize) continue;

        results.push({
          title: item.title || '',
          size: sizeBytes,
          size_str: TrackerUtils.formatSize(sizeBytes),
          seeders: item.seeders || 0,
          leechers: item.leechers || 0,
          category: item.category || 'N/A',
          magnet: item.link || '',
          tracker: this.name
        });
      }

      return results;
    }
  });

  TrackerRegistry.register(tracker);
})(typeof window !== 'undefined' ? window : self);
