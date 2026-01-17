(function(global) {
  'use strict';

  const tracker = createTracker({
    name: 'YggAPI',
    id: 'yggapi',
    requiresPasskey: false,

    async search(title, minSize, maxSize) {
      const results = [];
      const perPage = 100;
      const maxPages = 5;

      for (let page = 1; page <= maxPages; page++) {
        const url = `https://yggapi.eu/torrents?page=${page}&per_page=${perPage}&q=${encodeURIComponent(title)}`;

        const response = await fetch(url);
        if (!response.ok) break;

        const data = await response.json();
        if (!data || data.length === 0) break;

        for (const item of data) {
          const sizeBytes = item.size || 0;

          if (minSize && sizeBytes < minSize) continue;
          if (maxSize && sizeBytes > maxSize) continue;

          results.push({
            title: item.title || 'N/A',
            size: sizeBytes,
            size_str: TrackerUtils.formatSize(sizeBytes),
            seeders: item.seeders || 0,
            leechers: item.leechers || 0,
            category: item.category || 'N/A',
            magnet: item.link || '',
            url: item.link || '',
            tracker: this.name
          });
        }
      }

      return results;
    }
  });

  TrackerRegistry.register(tracker);
})(typeof window !== 'undefined' ? window : self);
