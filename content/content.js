/**
 * DIO - Controle de Legendas
 * content.js - Gerencia a desativação/ativação de legendas de forma segura e não-bloqueante
 */

(function () {
  'use strict';

  // Evita múltiplas inicializações no mesmo contexto
  if (window.__dioSubtitlesInjected) return;
  window.__dioSubtitlesInjected = true;

  let subtitlesDisabled = true;
  let debounceTimeout = null;

  // Carrega a preferência salva no chrome.storage
  function loadPreference() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get({ subtitlesDisabled: true }, (items) => {
          if (chrome.runtime.lastError) {
            applySubtitleState(true);
            return;
          }
          subtitlesDisabled = items.subtitlesDisabled;
          applySubtitleState(subtitlesDisabled);
        });
      } else {
        applySubtitleState(subtitlesDisabled);
      }
    } catch (e) {
      applySubtitleState(true);
    }
  }

  // Envia comando para os iframes do YouTube encontrados
  function sendYouTubeCaptionCommand(disable) {
    try {
      const iframes = document.querySelectorAll('iframe[src*="youtube.com"], iframe[id*="yt"], .clappr-youtube-plugin iframe');

      iframes.forEach((iframe) => {
        try {
          if (iframe.contentWindow) {
            const trackArg = disable ? {} : { languageCode: 'pt' };
            const message = JSON.stringify({
              event: 'command',
              func: 'setOption',
              args: ['captions', 'track', trackArg]
            });

            iframe.contentWindow.postMessage(message, '*');
          }
        } catch (err) {
          // Silencioso em caso de restrições de cross-origin
        }
      });
    } catch (e) {
      // Silencioso
    }
  }

  // Desativa/ativa trilhas em elementos HTML5 <video>
  function updateHTML5VideoTracks(disable) {
    try {
      const videos = document.querySelectorAll('video');
      videos.forEach((video) => {
        if (video.textTracks) {
          for (let i = 0; i < video.textTracks.length; i++) {
            try {
              video.textTracks[i].mode = disable ? 'disabled' : 'showing';
            } catch (err) {}
          }
        }
      });
    } catch (e) {}
  }

  // Desbloqueia pointer-events no wrapper da DIO caso esteja bloqueado
  function unlockPlayerPointerEvents() {
    try {
      const wrappers = document.querySelectorAll('.clappr-youtube-plugin[data-youtube-plugin], [data-player] div[style*="pointer-events"]');
      wrappers.forEach((el) => {
        if (el.style && el.style.pointerEvents === 'none') {
          el.style.pointerEvents = 'auto';
        }
      });
    } catch (e) {}
  }

  // Aplica o estado de legendas atual de forma segura
  function applySubtitleState(disable) {
    try {
      // 1. Atualiza classe no root para controle via CSS
      if (document.documentElement) {
        if (disable) {
          document.documentElement.classList.add('dio-subtitles-disabled');
        } else {
          document.documentElement.classList.remove('dio-subtitles-disabled');
        }
      }

      // 2. Desbloqueia interações no player
      unlockPlayerPointerEvents();

      // 3. Envia comando para YouTube Iframes
      sendYouTubeCaptionCommand(disable);

      // 4. Atualiza tracks em HTML5 videos
      updateHTML5VideoTracks(disable);
    } catch (e) {
      // Silencioso
    }
  }

  // Executa com debounce para não impactar a renderização da página
  function debouncedApply() {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      applySubtitleState(subtitlesDisabled);
    }, 200);
  }

  // Agenda tentativas escalonadas para dar tempo ao iframe do YouTube inicializar
  function triggerScheduledApplications() {
    [300, 800, 1800, 3500].forEach((delay) => {
      setTimeout(() => {
        applySubtitleState(subtitlesDisabled);
      }, delay);
    });
  }

  // Observa mutações no DOM para detectar navegação entre aulas (SPA)
  function initObserver() {
    try {
      const target = document.body || document.documentElement;
      if (!target) return;

      const observer = new MutationObserver((mutations) => {
        let hasPlayerChange = false;
        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === 1) { // ELEMENT_NODE
                if (
                  node.tagName === 'IFRAME' ||
                  node.tagName === 'VIDEO' ||
                  (node.querySelector && node.querySelector('iframe, video, [data-player]'))
                ) {
                  hasPlayerChange = true;
                  break;
                }
              }
            }
          }
          if (hasPlayerChange) break;
        }

        if (hasPlayerChange) {
          debouncedApply();
          triggerScheduledApplications();
        }
      });

      observer.observe(target, {
        childList: true,
        subtree: true
      });
    } catch (e) {}
  }

  // Ouve mudanças diretas nas preferências via storage
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync' && changes.subtitlesDisabled) {
          subtitlesDisabled = changes.subtitlesDisabled.newValue;
          applySubtitleState(subtitlesDisabled);
          triggerScheduledApplications();
        }
      });
    }
  } catch (e) {}

  // Ouve mensagens diretas do popup
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message && typeof message.subtitlesDisabled !== 'undefined') {
          subtitlesDisabled = message.subtitlesDisabled;
          applySubtitleState(subtitlesDisabled);
          triggerScheduledApplications();
          sendResponse({ success: true });
        }
      });
    }
  } catch (e) {}

  // Escuta eventos de reprodução
  document.addEventListener('play', () => debouncedApply(), true);
  document.addEventListener('loadeddata', () => debouncedApply(), true);

  // Inicializa quando a página estiver pronta
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadPreference();
      initObserver();
      triggerScheduledApplications();
    });
  } else {
    loadPreference();
    initObserver();
    triggerScheduledApplications();
  }
})();
