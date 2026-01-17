(function(global) {
  'use strict';

  const categories = {
    1: 'Vidéo', 2: 'Audio', 3: 'Application', 4: 'Ebooks',
    5: 'Jeu-Vidéo', 6: 'Formation', 7: 'XXX'
  };

  const subcategories = {
    9: 'Film', 10: 'Série', 11: 'Film Animation', 12: 'Série Animation',
    13: 'Documentaire', 14: 'Emission TV', 15: 'Spectacle/Concert',
    16: 'Sport', 20: 'Musique', 21: 'Podcast', 24: 'BD', 25: 'Comic',
    26: 'Manga', 27: 'Livre', 28: 'Presse'
  };

  function getCategory(categoryId, subcategoryId) {
    if (subcategoryId && subcategories[subcategoryId]) {
      return subcategories[subcategoryId];
    }
    if (categoryId && categories[categoryId]) {
      return categories[categoryId];
    }
    return 'N/A';
  }

  const tracker = createTracker({
    name: 'Sharewood',
    id: 'sharewood',
    requiresPasskey: true,
    passkeyConfigKey: 'sharewoodPasskey',

    async search(title, minSize, maxSize, passkey) {
      const url = `https://www.sharewood.tv/api/${passkey}/search?limit=100&name=${encodeURIComponent(title)}`;

      const response = await fetch(url);

      if (!response.ok) {
        return { error: `HTTP ${response.status}` };
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        return { error: 'Format réponse invalide' };
      }

      const results = [];
      for (const item of data) {
        const sizeBytes = item.size || 0;

        if (minSize && sizeBytes < minSize) continue;
        if (maxSize && sizeBytes > maxSize) continue;

        results.push({
          title: item.name || 'N/A',
          size: sizeBytes,
          size_str: TrackerUtils.formatSize(sizeBytes),
          seeders: item.seeders || 0,
          leechers: item.leechers || 0,
          category: getCategory(item.category_id, item.subcategory_id),
          magnet: item.download_url || '',
          url: item.slug && item.id ? `https://www.sharewood.tv/torrents/${item.slug}.${item.id}` : '',
          tracker: this.name
        });
      }

      return results;
    }
  });

  TrackerRegistry.register(tracker);
})(typeof window !== 'undefined' ? window : self);
