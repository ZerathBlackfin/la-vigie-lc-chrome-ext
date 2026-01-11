chrome.storage.sync.get(['sharewoodPasskey', 'lacalePasskey', 'flaresolverrUrl'], (items) => {
  if (items.sharewoodPasskey) {
    document.getElementById('sharewoodPasskey').value = items.sharewoodPasskey;
  }
  if (items.lacalePasskey) {
    document.getElementById('lacalePasskey').value = items.lacalePasskey;
  }
  if (items.flaresolverrUrl) {
    document.getElementById('flaresolverrUrl').value = items.flaresolverrUrl;
  }
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const sharewoodPasskey = document.getElementById('sharewoodPasskey').value.trim();
  const lacalePasskey = document.getElementById('lacalePasskey').value.trim();
  const flaresolverrUrl = document.getElementById('flaresolverrUrl').value.trim() || 'http://localhost:8191/v1';
  
  chrome.storage.sync.set({
    sharewoodPasskey: sharewoodPasskey,
    lacalePasskey: lacalePasskey,
    flaresolverrUrl: flaresolverrUrl
  }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Configuration enregistrée';
    status.className = 'status success';
    status.style.display = 'block';
    
    setTimeout(() => {
      status.style.display = 'none';
    }, 2000);
  });
});
