document.addEventListener('DOMContentLoaded', () => {
  const toggleSwitch = document.getElementById('toggle-switch');
  const statusBox = document.getElementById('status-box');
  const statusText = document.getElementById('status-text');

  function updateUI(disabled) {
    toggleSwitch.checked = disabled;
    if (disabled) {
      statusBox.className = 'status-box status-active';
      statusText.textContent = 'Legendas Desativadas (Ocultas)';
    } else {
      statusBox.className = 'status-box status-inactive';
      statusText.textContent = 'Legendas Habilitadas (Padrão)';
    }
  }

  function notifyActiveTab(disabled) {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { subtitlesDisabled: disabled }, () => {
            if (chrome.runtime.lastError) {
              // Target tab is not a match or script is not yet injected
            }
          });
        }
      });
    }
  }

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get({ subtitlesDisabled: true }, (items) => {
      updateUI(items.subtitlesDisabled);
    });
  }

  toggleSwitch.addEventListener('change', () => {
    const isChecked = toggleSwitch.checked;
    updateUI(isChecked);

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ subtitlesDisabled: isChecked }, () => {
        notifyActiveTab(isChecked);
      });
    }
  });
});
