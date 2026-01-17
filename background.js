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
});

function extractPageInfo() {
  const title = document.title;
  const sizeMatch = document.body.innerText.match(/(\d+\.?\d*)\s*(Go|GB|GiB)/i);
  const size = sizeMatch ? sizeMatch[0] : null;

  return { title, size };
}
