/* Khai Minh Group language switcher */
(function () {
  'use strict';

  const SUPPORTED = ['tw', 'vn', 'en'];
  const STORAGE_KEY = 'km_lang';
  const HTML_LANG = { tw: 'zh-Hant', vn: 'vi', en: 'en' };
  const cache = {};
  let activeRequest = 0;

  function detectDefaultLang() {
    const requested = new URLSearchParams(window.location.search).get('lang');
    if (requested && SUPPORTED.includes(requested)) return requested;

    let stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      stored = null;
    }
    if (stored && SUPPORTED.includes(stored)) return stored;

    const nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    if (nav.startsWith('zh')) return 'tw';
    if (nav.startsWith('vi')) return 'vn';
    return 'tw';
  }

  function getByPath(obj, path) {
    return String(path).split('.').reduce((acc, key) => {
      if (acc == null || typeof acc !== 'object') return undefined;
      return acc[key];
    }, obj);
  }

  async function loadDict(lang) {
    if (cache[lang]) return cache[lang];

    const response = await fetch(`i18n/${lang}.json?v=20260521-1`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load ${lang}: HTTP ${response.status}`);
    const dict = await response.json();
    cache[lang] = dict;
    return dict;
  }

  function setText(el, value) {
    if (typeof value === 'string') el.textContent = value;
  }

  function applyDict(dict) {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      setText(el, getByPath(dict, el.getAttribute('data-i18n')));
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const value = getByPath(dict, el.getAttribute('data-i18n-placeholder'));
      if (typeof value === 'string') el.setAttribute('placeholder', value);
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const value = getByPath(dict, el.getAttribute('data-i18n-aria'));
      if (typeof value === 'string') el.setAttribute('aria-label', value);
    });

    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const value = getByPath(dict, el.getAttribute('data-i18n-title'));
      if (typeof value === 'string') el.setAttribute('title', value);
    });
  }

  function updateSwitcher(lang, isLoading) {
    document.querySelectorAll('.lang-switch button[data-lang]').forEach((btn) => {
      const active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('active', active);
      btn.disabled = !!isLoading;
      btn.setAttribute('aria-pressed', String(active));
    });
    document.documentElement.classList.toggle('is-lang-loading', !!isLoading);
  }

  async function setLang(lang) {
    const targetLang = SUPPORTED.includes(lang) ? lang : 'tw';
    const requestId = ++activeRequest;

    updateSwitcher(targetLang, true);

    try {
      const dict = await loadDict(targetLang);
      if (requestId !== activeRequest) return;

      try {
        localStorage.setItem(STORAGE_KEY, targetLang);
      } catch (_) {
        // Private browsing or file previews can block storage.
      }

      applyDict(dict);
      document.documentElement.setAttribute('lang', HTML_LANG[targetLang] || 'zh-Hant');
      updateSwitcher(targetLang, false);
      window.dispatchEvent(new CustomEvent('langChanged', { detail: { lang: targetLang, dict } }));
    } catch (err) {
      console.error('[i18n] language switch failed:', err);
      if (targetLang !== 'tw') {
        await setLang('tw');
        return;
      }
      updateSwitcher(targetLang, false);
    }
  }

  function getLang() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.includes(stored)) return stored;
    } catch (_) {
      // Ignore storage errors.
    }
    return detectDefaultLang();
  }

  function getDict() {
    return cache[getLang()] || {};
  }

  function bindSwitcher() {
    document.querySelectorAll('.lang-switch button[data-lang]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-lang');
        if (target && target !== getLang()) setLang(target);
      });
    });
  }

  function init() {
    bindSwitcher();
    setLang(detectDefaultLang());
  }

  window.KM_i18n = { setLang, getDict, getLang };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
