document.getElementById('settingsLink').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: extractPageInfo
  }, (results) => {
    if (results && results[0] && results[0].result) {
      const data = results[0].result;
      if (data.title || data.size) {
        document.getElementById('pageInfo').style.display = 'block';
        document.getElementById('infoTitle').value = data.title || '';
        document.getElementById('infoSize').value = data.size || '';
        window.pageOriginalTitle = data.originalTitle || '';
      }
    }
  });
});

document.getElementById('checkBtn').addEventListener('click', async () => {
  const title = document.getElementById('infoTitle').value.trim();
  const sizeStr = document.getElementById('infoSize').value.trim();
  
  if (!title || !sizeStr) {
    showStatus('Titre et taille requis', 'error');
    return;
  }
  
  const btn = document.getElementById('checkBtn');
  btn.disabled = true;
  document.getElementById('loading').style.display = 'block';
  document.getElementById('results').style.display = 'none';
  document.getElementById('status').style.display = 'none';
  
  const sizeGb = parseFloat(sizeStr);
  const sizeBytes = Math.floor(sizeGb * 1024 * 1024 * 1024);
  const tolerance = 10 * 1024 * 1024;
  const minSize = Math.max(0, sizeBytes - tolerance);
  const maxSize = sizeBytes + tolerance;
  
  const config = await chrome.storage.sync.get(['sharewoodPasskey', 'lacalePasskey']);

  const searches = [
    Trackers.searchYggAPI(title, minSize, maxSize),
    Trackers.searchSharewood(title, minSize, maxSize, config.sharewoodPasskey),
    Trackers.searchLaCale(title, minSize, maxSize, config.lacalePasskey),
    Trackers.searchNyaa(title, minSize, maxSize)
  ];
  
  try {
    const results = await Promise.all(searches);
    
    const data = {
      'YggAPI': results[0],
      'Sharewood': results[1],
      'La Cale': results[2],
      'Nyaa': results[3]
    };
    
    displayResults(data);
  } catch (error) {
    showStatus('Erreur: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    document.getElementById('loading').style.display = 'none';
  }
});

function displayResults(data) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  resultsDiv.style.display = 'block';
  
  let totalResults = 0;
  
  if (window.pageOriginalTitle) {
    resultsDiv.innerHTML += `<div style="background: #152F46; padding: 8px 10px; border-radius: 6px; margin-bottom: 12px; border: 1px solid #152F46; font-size: 11px;">
      <span style="color: #9A968E; font-weight: 600;">Titre original:</span> 
      <span style="color: #CFCBC3;">${window.pageOriginalTitle}</span>
    </div>`;
  }
  
  for (const [tracker, torrents] of Object.entries(data)) {
    if (torrents.error) {
      resultsDiv.innerHTML += `<div class="tracker-section">
        <div class="tracker-header">
          <span>${tracker}</span>
          <span style="color: #dc3545; font-size: 11px;">${torrents.error}</span>
        </div>
      </div>`;
    } else if (Array.isArray(torrents) && torrents.length > 0) {
      totalResults += torrents.length;
      let items = '';
      torrents.forEach(t => {
        const hasUrl = t.url && t.url !== '';
        items += `<div class="torrent-item">
          <div class="torrent-info">
            <div class="torrent-title">${t.title}</div>
            <div class="torrent-meta">${t.size_str} | S:${t.seeders} L:${t.leechers} | ${t.category}</div>
          </div>
          ${hasUrl ? `<a class="torrent-btn" href="${t.url}" target="_blank" title="Ouvrir sur le tracker">↗</a>` : ''}
        </div>`;
      });
      resultsDiv.innerHTML += `<div class="tracker-section">
        <div class="tracker-header">
          <span>${tracker}</span><span>${torrents.length} résultat(s)</span>
        </div>
        ${items}
      </div>`;
    } else {
      resultsDiv.innerHTML += `<div class="tracker-section">
        <div class="tracker-header">
          <span>${tracker}</span>
          <span style="color: #999; font-size: 11px;">Aucun résultat</span>
        </div>
      </div>`;
    }
  }
  
  if (totalResults === 0) {
    resultsDiv.innerHTML = '<div class="no-results">Aucun doublon trouvé</div>';
  }
}

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';
}

function extractPageInfo() {
  let originalTitle = document.querySelector('h1')?.textContent.trim() || '';
  let title = originalTitle;
  const yearPattern = /[\s\.\(]\d{4}[\)\s\.]?/;
  const match = title.match(yearPattern);
  if (match) {
    title = title.substring(0, match.index).trim();
  }

  title = title.replace(/\./g, ' ');
  
  const sizeSpan = document.querySelector('span.text-text-primary-medium.font-mono');
  let size = '';
  
  if (sizeSpan) {
    const text = sizeSpan.textContent.trim();
    const match = text.match(/(\d+[\.,]?\d*)/);
    size = match ? match[1].replace(',', '.') : '';
  }
  
  return { originalTitle, title, size };
}
