(function(global) {
  'use strict';

  const tracker = createTracker({
    name: 'Nyaa',
    id: 'nyaa',
    requiresPasskey: false,

    async search(title, minSize, maxSize) {
      const limit = 100;
      const url = `https://nyaa.si/?f=0&c=0_0&q=${encodeURIComponent(title)}&s=seeders&o=desc`;

      const response = await fetch(url);
      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const rows = doc.querySelectorAll('.torrent-list tbody tr');

      const results = [];
      for (const row of rows) {
        if (results.length >= limit) break;

        const titleEl = row.querySelector('td:nth-child(2) a:not(.comments)');
        const sizeEl = row.querySelector('td:nth-child(4)');
        const seedersEl = row.querySelector('td:nth-child(6)');
        const leechersEl = row.querySelector('td:nth-child(7)');
        const categoryEl = row.querySelector('td:nth-child(1) a');
        const magnetEl = row.querySelector('a[href^="magnet:"]');

        if (!titleEl || !sizeEl) continue;

        const torrentTitle = titleEl.textContent.trim();
        const sizeStr = sizeEl.textContent.trim();
        const sizeBytes = TrackerUtils.parseSize(sizeStr);

        if (minSize && sizeBytes < minSize) continue;
        if (maxSize && sizeBytes > maxSize) continue;

        results.push({
          title: torrentTitle,
          size: sizeBytes,
          size_str: sizeStr,
          seeders: parseInt(seedersEl?.textContent || '0'),
          leechers: parseInt(leechersEl?.textContent || '0'),
          category: categoryEl?.getAttribute('title') || 'N/A',
          magnet: magnetEl?.href || '',
          tracker: this.name
        });
      }

      return results;
    }
  });

  TrackerRegistry.register(tracker);
})(typeof window !== 'undefined' ? window : self);
