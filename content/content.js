/**
 * DIO - Controle de Legendas
 * content.js - Gerencia a desativação/ativação de legendas via YouTube API (postMessage) e HTML5 tracks
 */

(function () {
  'use strict';

  // Estado atual do bloqueio de legendas (padrão: ativado / legendas ocultas)
  let subtitlesDisabled = true;

  // Carrega a preferência salva no chrome.storage
  function loadPreference() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get({ subtitlesDisabled: true }, (items) => {
        subtitlesDisabled = items.subtitlesDisabled;
        applySubtitleState(subtitlesDisabled);
      });
    } else {
      applySubtitleState(subtitlesDisabled);
    }
  }

  // Envia comando para todos os iframes do YouTube encontrados
  function sendYouTubeCaptionCommand(disable) {
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
        // Ignora erros de cross-origin em iframes restritos
      }
    });
  }

  // Desativa/ativa trilhas em elementos HTML5 <video>
  function updateHTML5VideoTracks(disable) {
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      if (video.textTracks) {
        for (let i = 0; i < video.textTracks.length; i++) {
          video.textTracks[i].mode = disable ? 'disabled' : 'showing';
        }
      }
    });
  }

  // Desbloqueia pointer-events no wrapper da DIO (caso esteja com pointer-events: none)
  function unlockPlayerPointerEvents() {
    const wrappers = document.querySelectorAll('.clappr-youtube-plugin, [data-player] > div, div[data-player] div');
    wrappers.forEach((el) => {
      if (el.style && el.style.pointerEvents === 'none') {
        el.style.pointerEvents = 'auto';
      }
    });
  }

  // Aplica o estado de legendas atual
  function applySubtitleState(disable) {
    // 1. Atualiza a classe no elemento root para controle visual via CSS
    if (disable) {
      document.documentElement.classList.add('dio-subtitles-disabled');
      if (document.body) document.body.classList.add('dio-subtitles-disabled');
    } else {
      document.documentElement.classList.remove('dio-subtitles-disabled');
      if (document.body) document.body.classList.remove('dio-subtitles-disabled');
    }

    // 2. Desbloqueia interações no player
    unlockPlayerPointerEvents();

    // 3. Envia comando para YouTube Iframes
    sendYouTubeCaptionCommand(disable);

    // 4. Atualiza tracks em HTML5 videos
    updateHTML5VideoTracks(disable);
  }

  // Dispara a aplicação repetidamente em intervalos escalonados
  // Útil para quando novos iframes/aulas são carregados dinamicamente e a API do YouTube demora a responder
  function triggerScheduledApplications() {
    const delays = [100, 400, 800, 1500, 3000];
    delays.forEach((delay) => {
      setTimeout(() => {
        applySubtitleState(subtitlesDisabled);
      }, delay);
    });
  }

  // Observa mutações no DOM para detectar transições de aulas (SPA) e novos players
  function initObserver() {
    const target = document.documentElement || document.body;
    if (!target) return;

    const observer = new MutationObserver((mutations) => {
      let hasRelevantChanges = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          hasRelevantChanges = true;
          break;
        }
      }

      if (hasRelevantChanges) {
        applySubtitleState(subtitlesDisabled);
      }
    });

    observer.observe(target, {
      childList: true,
      subtree: true
    });
  }

  // Ouve mudanças diretas nas preferências do usuário via storage
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes.subtitlesDisabled) {
        subtitlesDisabled = changes.subtitlesDisabled.newValue;
        applySubtitleState(subtitlesDisabled);
        triggerScheduledApplications();
      }
    });
  }

  // Ouve mensagens diretas do popup
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

  // Escuta eventos de reprodução
  document.addEventListener('play', () => triggerScheduledApplications(), true);
  document.addEventListener('loadeddata', () => triggerScheduledApplications(), true);

  // Inicialização
  loadPreference();
  initObserver();
  triggerScheduledApplications();

  // Garante execução após o carregamento completo do DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applySubtitleState(subtitlesDisabled);
      triggerScheduledApplications();
    });
  }
})();
