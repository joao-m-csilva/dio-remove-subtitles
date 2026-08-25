(function () {
  'use strict';

  // Prevent multiple injections within the same context
  if (window.__dioSubtitlesInjected) return;
  window.__dioSubtitlesInjected = true;

  let subtitlesDisabled = true;
  let debounceTimeout = null;

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
          // Ignore cross-origin restrictions on restricted frames
        }
      });
    } catch (e) {}
  }

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

  // Restore mouse interactions on overlays with pointer-events: none
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

  function applySubtitleState(disable) {
    try {
      if (document.documentElement) {
        if (disable) {
          document.documentElement.classList.add('dio-subtitles-disabled');
        } else {
          document.documentElement.classList.remove('dio-subtitles-disabled');
        }
      }

      unlockPlayerPointerEvents();
      sendYouTubeCaptionCommand(disable);
      updateHTML5VideoTracks(disable);
    } catch (e) {}
  }

  // Debounce to prevent layout thrashing during React/Next.js hydration
  function debouncedApply() {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      applySubtitleState(subtitlesDisabled);
    }, 200);
  }

  // Retry application across staggered delays to accommodate asynchronous player initialization
  function triggerScheduledApplications() {
    [300, 800, 1800, 3500].forEach((delay) => {
      setTimeout(() => {
        applySubtitleState(subtitlesDisabled);
      }, delay);
    });
  }

  // Observe SPA route transitions and dynamic player mounts
  function initObserver() {
    try {
      const target = document.body || document.documentElement;
      if (!target) return;

      const observer = new MutationObserver((mutations) => {
        let hasPlayerChange = false;
        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === 1) {
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

  document.addEventListener('play', () => debouncedApply(), true);
  document.addEventListener('loadeddata', () => debouncedApply(), true);

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
