chrome.storage.sync.get(['sharewoodPasskey', 'lacalePasskey'], (items) => {
  if (items.sharewoodPasskey) {
    document.getElementById('sharewoodPasskey').value = items.sharewoodPasskey;
  }
  if (items.lacalePasskey) {
    document.getElementById('lacalePasskey').value = items.lacalePasskey;
  }
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const sharewoodPasskey = document.getElementById('sharewoodPasskey').value.trim();
  const lacalePasskey = document.getElementById('lacalePasskey').value.trim();

  chrome.storage.sync.set({
    sharewoodPasskey: sharewoodPasskey,
    lacalePasskey: lacalePasskey
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
