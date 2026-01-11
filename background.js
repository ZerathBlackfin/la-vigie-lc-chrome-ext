chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageInfo') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: extractPageInfo
        }, (results) => {
          sendResponse(results[0]?.result || {});
        });
      }
    });
    return true;
  }
  
  if (request.action === 'search') {
    performSearch(request.title, request.size).then(results => {
      sendResponse(results);
    });
    return true;
  }
});

function extractPageInfo() {
  const title = document.title;
  const sizeMatch = document.body.innerText.match(/(\d+\.?\d*)\s*(Go|GB|GiB)/i);
  const size = sizeMatch ? sizeMatch[0] : null;
  
  return { title, size };
}

async function performSearch(title, size) {
  const trackers = await import('./trackers.js');
  
  const config = await chrome.storage.sync.get([
    'yggPasskey',
    'sharewoodPasskey',
    'lacalePasskey',
    'flaresolverrUrl'
  ]);
  
  const results = {};
  
  try {
    results.Nyaa = {
      results: await searchNyaa(title, size)
    };
  } catch (error) {
    results.Nyaa = { error: error.message };
  }
  
  if (config.yggPasskey) {
    try {
      results.YggAPI = {
        results: await searchYggAPI(title, size, config.yggPasskey)
      };
    } catch (error) {
      results.YggAPI = { error: error.message };
    }
  }
  
  if (config.sharewoodPasskey) {
    try {
      results.Sharewood = {
        results: await searchSharewood(title, size, config.sharewoodPasskey)
      };
    } catch (error) {
      results.Sharewood = { error: error.message };
    }
  }
  
  if (config.lacalePasskey && config.flaresolverrUrl) {
    try {
      results['La Cale'] = {
        results: await searchLaCale(title, size, config.lacalePasskey, config.flaresolverrUrl)
      };
    } catch (error) {
      results['La Cale'] = { error: error.message };
    }
  }
  
  return results;
}
