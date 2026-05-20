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
    applyQuoteEnglishOverrides();
  }

  function applyQuoteEnglishOverrides() {
    if (document.documentElement.dataset.page !== "quote") return;
    if (state.lang !== "en") return;

    const setText = (selector, text) => {
      const node = document.querySelector(selector);
      if (node) node.textContent = text;
    };

    setText(".quote-kicker", "REQUEST A QUOTE · YÊU CẦU BÁO GIÁ");
    setText(".quote-pro-hero h1", "Submit drawings online, get a reply within 24 hours");
    setText(".quote-pro-hero p:not(.quote-kicker)", "Fill in requirements and attach drawings or site photos for evaluation.");
    setText(".quote-help-card strong", "Prefer not to fill out the form?");
    setText(".quote-help-card a[data-config-href='phoneHrefTel'] span:last-child", "(Chinese)");

    setText(".form-block:nth-of-type(2) .form-heading h2", "Technical Requirements");
    setText(".form-block:nth-of-type(2) .form-heading p", "Please provide process details so we can evaluate feasibility and lead time.");
    setText(".form-block:nth-of-type(3) .form-heading h2", "Drawings / Attachments");
    setText(".form-block:nth-of-type(3) .form-heading p", "Upload engineering drawings (PDF/DWG) or product photos to speed up quotation.");
    setText(".upload-zone strong", "Drag files here or click to select");
    setText(".upload-zone small", "Supports PDF / DWG / JPG / PNG / ZIP. After email draft opens, please attach files manually.");
    setText(".privacy-note", "Your uploaded drawings are only used for quotation and technical evaluation, and will not be shared externally.");

    setText(".form-block:nth-of-type(4) .form-heading h2", "Contact Information");
    setText(".form-block:nth-of-type(4) .form-heading p", "Leave your contact details and preferred method so we can follow up quickly.");

    const labelMap = [
      ["label:has([name='process']) > span", "Process *"],
      ["label:has([name='material']) > span", "Material"],
      ["label[data-material-note-wrap] > span", "Material Note (Optional)"],
      ["label:has([name='part_size']) > span", "Part Size (L × W × H mm)"],
      ["label:has([name='quantity']) > span", "Quantity *"],
      ["label:has([name='frequency']) > span", "Frequency"],
      ["label:has([name='deadline']) > span", "Target Date"],
      ["label:has([name='message']) > span", "Requirement / Notes"],
      ["label:has([name='name']) > span", "Name *"],
      ["label:has([name='title']) > span", "Title"],
      ["label:has([name='company']) > span", "Company *"],
      ["label:has([name='industry']) > span", "Industry"],
      ["label:has([name='phone']) > span", "Phone / Zalo *"],
      ["label:has([name='email']) > span", "Email *"],
      ["label:has([name='location']) > span", "Location / City"],
      ["fieldset.radio-group legend", "Preferred Contact"]
    ];
    labelMap.forEach(([selector, text]) => setText(selector, text));

    setText(".visit-check span", "Need on-site visit / urgent support.");
    setText(".quote-submit", "Send Quote Request by Email");
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
