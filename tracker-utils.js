(function(global) {
  'use strict';

  global.TrackerUtils = {
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
    }
  };
})(typeof window !== 'undefined' ? window : self);
