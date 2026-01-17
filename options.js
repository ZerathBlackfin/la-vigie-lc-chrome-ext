chrome.storage.sync.get(['sharewoodPasskey', 'lacalePasskey', 'abnormalUsername', 'abnormalPassword'], (items) => {
  if (items.sharewoodPasskey) {
    document.getElementById('sharewoodPasskey').value = items.sharewoodPasskey;
  }
  if (items.lacalePasskey) {
    document.getElementById('lacalePasskey').value = items.lacalePasskey;
  }
  if (items.abnormalUsername) {
    document.getElementById('abnormalUsername').value = items.abnormalUsername;
  }
  if (items.abnormalPassword) {
    document.getElementById('abnormalPassword').value = items.abnormalPassword;
  }
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const sharewoodPasskey = document.getElementById('sharewoodPasskey').value.trim();
  const lacalePasskey = document.getElementById('lacalePasskey').value.trim();
  const abnormalUsername = document.getElementById('abnormalUsername').value.trim();
  const abnormalPassword = document.getElementById('abnormalPassword').value.trim();

  chrome.storage.sync.set({
    sharewoodPasskey: sharewoodPasskey,
    lacalePasskey: lacalePasskey,
    abnormalUsername: abnormalUsername,
    abnormalPassword: abnormalPassword
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
