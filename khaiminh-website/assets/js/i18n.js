(function () {
  const supported = ["tw", "vn", "en"];
  const defaultLang = "tw";
  const state = { dict: {}, lang: localStorage.getItem("km-lang") || defaultLang };

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
    const nextLang = supported.includes(lang) ? lang : defaultLang;
    const response = await fetch(`i18n/${nextLang}.json`);
    state.dict = await response.json();
    state.lang = nextLang;
    localStorage.setItem("km-lang", nextLang);
    applyTranslations();
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-lang]");
    if (!button) return;
    loadLanguage(button.dataset.lang).catch(console.error);
  });

  window.KhaiMinhI18n = { loadLanguage };
  loadLanguage(state.lang).catch(() => loadLanguage(defaultLang));
})();
