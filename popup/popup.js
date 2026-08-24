/**
 * DIO - Controle de Legendas
 * popup.js - Gerencia o switch de ativação/desativação e sincroniza com chrome.storage
 */

document.addEventListener('DOMContentLoaded', () => {
  const toggleSwitch = document.getElementById('toggle-switch');
  const statusBox = document.getElementById('status-box');
  const statusText = document.getElementById('status-text');

  // Atualiza os elementos visuais de status
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

  // Envia mensagem direta para a aba ativa (para efeito imediato sem delay)
  function notifyActiveTab(disabled) {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { subtitlesDisabled: disabled }, () => {
            // Ignora erro se a aba atual não for dio.me ou não tiver o content script
            if (chrome.runtime.lastError) {
              // Silencioso
            }
          });
        }
      });
    }
  }

  // Carrega estado inicial do storage
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get({ subtitlesDisabled: true }, (items) => {
      updateUI(items.subtitlesDisabled);
    });
  }

  // Event listener para mudança no switch
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
