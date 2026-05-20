(function () {
  const supported = ["tw", "vn", "en"];
  const defaultLang = "tw";
  function getStoredLang() {
    try {
      return localStorage.getItem("km-lang") || defaultLang;
    } catch (_) {
      return defaultLang;
    }
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem("km-lang", lang);
    } catch (_) {
      // Ignore storage errors (private mode / blocked storage).
    }
  }

  const state = { dict: {}, lang: getStoredLang() };

  function getValue(path) {
    return path.split(".").reduce((value, key) => value && value[key], state.dict);
  }

  function applyTranslations() {
    document.documentElement.lang = state.lang === "tw" ? "zh-Hant" : state.lang === "vn" ? "vi" : "en";
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const text = getValue(node.dataset.i18n);
      if (typeof text === "string") node.textContent = text;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      const text = getValue(node.dataset.i18nPlaceholder);
      if (typeof text === "string") node.setAttribute("placeholder", text);
    });
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === state.lang);
    });
  }

  async function loadLanguage(lang) {
    if (window.location.protocol === "file:") {
      throw new Error("Language switching requires HTTP/HTTPS. Please run a local server instead of opening file:// directly.");
    }
    const nextLang = supported.includes(lang) ? lang : defaultLang;
    try {
      const response = await fetch(`i18n/${nextLang}.json`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Failed to load language file: ${nextLang}`);
      state.dict = await response.json();
      state.lang = nextLang;
      setStoredLang(nextLang);
      applyTranslations();
    } catch (error) {
      if (nextLang !== defaultLang) return loadLanguage(defaultLang);
      throw error;
    }
  }

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      loadLanguage(button.dataset.lang).catch((error) => {
        console.error(error);
        alert("語言切換需透過 http/https 開啟網站，請不要直接雙擊 index.html。");
      });
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest("[data-lang]");
    if (!button) return;
    loadLanguage(button.dataset.lang).catch(console.error);
  });

  window.KhaiMinhI18n = { loadLanguage };
  loadLanguage(state.lang).catch(() => {
    if (window.location.protocol !== "file:") loadLanguage(defaultLang).catch(console.error);
  });
})();
