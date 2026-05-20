/* ============================================
   KHAI MINH GROUP — i18n 語系切換引擎
   ============================================
   原理：
   1. 讀取 localStorage.km_lang，否則用瀏覽器語言推斷預設語系
   2. fetch() 對應的 i18n/{lang}.json
   3. 掃描所有 [data-i18n]、[data-i18n-placeholder]、[data-i18n-aria] 替換文字
   4. <html lang> 屬性同步更新（SEO 與 a11y）
   ============================================ */

(function () {
  'use strict';

  const SUPPORTED = ['tw', 'vn', 'en'];
  const STORAGE_KEY = 'km_lang';
  const HTML_LANG = { tw: 'zh-Hant', vn: 'vi', en: 'en' };

  // 語系字典快取
  const cache = {};

  /**
   * 由瀏覽器語言推斷預設語系
   */
  function detectDefaultLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;

    const nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    if (nav.startsWith('zh')) return 'tw';
    if (nav.startsWith('vi')) return 'vn';
    return 'en';
  }

  /**
   * 由 dot-path 取值，例如 "home.service_1_name"
   */
  function getByPath(obj, path) {
    return path.split('.').reduce((acc, key) => {
      if (acc == null) return undefined;
      return acc[key];
    }, obj);
  }

  /**
   * 載入指定語系 JSON
   */
  async function loadDict(lang) {
    if (cache[lang]) return cache[lang];
    try {
      const res = await fetch(`i18n/${lang}.json`, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      cache[lang] = await res.json();
      return cache[lang];
    } catch (err) {
      console.error('[i18n] 載入失敗:', lang, err);
      // fallback 到 tw
      if (lang !== 'tw') return loadDict('tw');
      return {};
    }
  }

  /**
   * 套用字典到 DOM
   */
  function apply(dict) {
    // 一般文字
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = getByPath(dict, key);
      if (typeof val === 'string') {
        el.textContent = val;
      }
    });

    // placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = getByPath(dict, key);
      if (typeof val === 'string') {
        el.setAttribute('placeholder', val);
      }
    });

    // aria-label
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      const val = getByPath(dict, key);
      if (typeof val === 'string') {
        el.setAttribute('aria-label', val);
      }
    });

    // title 屬性
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const val = getByPath(dict, key);
      if (typeof val === 'string') {
        el.setAttribute('title', val);
      }
    });
  }

  /**
   * 切換到指定語系
   */
  async function setLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = 'tw';
    localStorage.setItem(STORAGE_KEY, lang);

    const dict = await loadDict(lang);
    apply(dict);

    // 更新 <html lang>
    document.documentElement.setAttribute('lang', HTML_LANG[lang] || 'en');

    // 更新切換按鈕狀態
    document.querySelectorAll('.lang-switch button[data-lang]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // 廣播事件供 main.js 使用
    window.dispatchEvent(new CustomEvent('langChanged', { detail: { lang, dict } }));
  }

  /**
   * 取得當前字典（供其他 JS 模組讀取）
   */
  function getDict() {
    const lang = localStorage.getItem(STORAGE_KEY) || detectDefaultLang();
    return cache[lang] || {};
  }

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || detectDefaultLang();
  }

  /**
   * 綁定切換按鈕
   */
  function bindSwitcher() {
    document.querySelectorAll('.lang-switch button[data-lang]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-lang');
        setLang(target);
      });
    });
  }

  /**
   * 初始化
   */
  function init() {
    bindSwitcher();
    setLang(detectDefaultLang());
  }

  // 暴露給其他模組
  window.KM_i18n = { setLang, getDict, getLang };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
