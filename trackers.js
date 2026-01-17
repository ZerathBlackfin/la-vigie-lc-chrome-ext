window.Trackers = {
  async searchNyaa(title, minSize, maxSize) {
    try {
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
        
        const title = titleEl.textContent.trim();
        const sizeStr = sizeEl.textContent.trim();
        const sizeBytes = this.parseSize(sizeStr);
        
        if (minSize && sizeBytes < minSize) continue;
        if (maxSize && sizeBytes > maxSize) continue;
        
        results.push({
          title: title,
          size: sizeBytes,
          size_str: sizeStr,
          seeders: parseInt(seedersEl?.textContent || '0'),
          leechers: parseInt(leechersEl?.textContent || '0'),
          category: categoryEl?.getAttribute('title') || 'N/A',
          magnet: magnetEl?.href || '',
          tracker: 'Nyaa'
        });
      }
      
      return results;
    } catch (error) {
      return { error: error.message };
    }
  },

  async searchYggAPI(title, minSize, maxSize) {
    try {
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
            size_str: this.formatSize(sizeBytes),
            seeders: item.seeders || 0,
            leechers: item.leechers || 0,
            category: item.category || 'N/A',
            magnet: item.link || '',
            url: item.link || '',
            tracker: 'YggAPI'
          });
        }
      }
      
      return results;
    } catch (error) {
      return { error: error.message };
    }
  },

  async searchSharewood(title, minSize, maxSize, passkey) {
    if (!passkey) {
      return { error: 'Passkey manquante (voir Config)' };
    }
    
    try {
      const url = `https://www.sharewood.tv/api/${passkey}/search?limit=100&name=${encodeURIComponent(title)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 403) {
          return { error: 'HTTP 403' };
        }
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
          size_str: this.formatSize(sizeBytes),
          seeders: item.seeders || 0,
          leechers: item.leechers || 0,
          category: this.getSharewoodCategory(item.category_id, item.subcategory_id),
          magnet: item.download_url || '',
          url: item.slug && item.id ? `https://www.sharewood.tv/torrents/${item.slug}.${item.id}` : '',
          tracker: 'Sharewood'
        });
      }
      
      return results;
    } catch (error) {
      return { error: error.message };
    }
  },

  async searchLaCale(title, minSize, maxSize, passkey) {
    if (!passkey) {
      return { error: 'Passkey manquante (voir Config)' };
    }

    try {
      const apiUrl = `https://la-cale.space/api/external?passkey=${passkey}&q=${encodeURIComponent(title)}`;
      const apiResponse = await fetch(apiUrl);

      if (!apiResponse.ok) {
        if (apiResponse.status === 403) {
          return { error: 'HTTP 403' };
        }
        return { error: `HTTP ${apiResponse.status}` };
      }

      const data = await apiResponse.json();
      const torrents = Array.isArray(data) ? data : data.torrents || [];
      
      const results = [];
      for (const item of torrents.slice(0, 50)) {
        const sizeValue = item.size || 0;
        const sizeBytes = typeof sizeValue === 'number' ? sizeValue : this.parseSize(sizeValue);
        
        if (minSize && sizeBytes < minSize) continue;
        if (maxSize && sizeBytes > maxSize) continue;
        
        results.push({
          title: item.title || '',
          size: sizeBytes,
          size_str: this.formatSize(sizeBytes),
          seeders: item.seeders || 0,
          leechers: item.leechers || 0,
          category: item.category || 'N/A',
          magnet: item.link || '',
          tracker: 'La Cale'
        });
      }
      
      return results;
    } catch (error) {
      return { error: error.message };
    }
  },

  parseSize(sizeStr) {
    if (!sizeStr) return 0;
    
    sizeStr = sizeStr.toUpperCase().trim();
    const units = {
      'B': 1,
      'KB': 1024, 'KIB': 1024,
      'MB': 1024**2, 'MIB': 1024**2,
      'GB': 1024**3, 'GIB': 1024**3,
      'TB': 1024**4, 'TIB': 1024**4
    };
    
    for (const [unit, multiplier] of Object.entries(units)) {
      if (sizeStr.includes(unit)) {
        const number = parseFloat(sizeStr.replace(unit, '').trim());
        return Math.floor(number * multiplier);
      }
    }
    return 0;
  },

  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let size = parseFloat(bytes);
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  },

  getSharewoodCategory(categoryId, subcategoryId) {
    const subcategories = {
      9: 'Film', 10: 'Série', 11: 'Film Animation', 12: 'Série Animation',
      13: 'Documentaire', 14: 'Emission TV', 15: 'Spectacle/Concert',
      16: 'Sport', 20: 'Musique', 21: 'Podcast', 24: 'BD', 25: 'Comic',
      26: 'Manga', 27: 'Livre', 28: 'Presse'
    };
    
    const categories = {
      1: 'Vidéo', 2: 'Audio', 3: 'Application', 4: 'Ebooks',
      5: 'Jeu-Vidéo', 6: 'Formation', 7: 'XXX'
    };
    
    if (subcategoryId && subcategories[subcategoryId]) {
      return subcategories[subcategoryId];
    }
    
    if (categoryId && categories[categoryId]) {
      return categories[categoryId];
    }
    
    return 'N/A';
  }
};
