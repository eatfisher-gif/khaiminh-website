(function () {
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const floating = document.querySelector("[data-floating-contact]");
  const form = document.querySelector("[data-quote-form]");
  const status = document.querySelector("[data-form-status]");
  const config = window.KHAI_MINH_CONFIG || {};
  if (config.phoneHref && !config.phoneHrefTel) config.phoneHrefTel = `tel:${config.phoneHref}`;
  if (config.email && !config.emailMailto) config.emailMailto = `mailto:${config.email}`;

  function applyConfig() {
    document.querySelectorAll("[data-config]").forEach((node) => {
      const key = node.dataset.config;
      const value = config[key];
      if (typeof value === "string") node.textContent = value;
    });

    document.querySelectorAll("[data-config-href]").forEach((node) => {
      const key = node.dataset.configHref;
      const value = config[key];
      if (typeof value === "string") node.setAttribute("href", value);
    });

    document.querySelectorAll("[data-config-value]").forEach((node) => {
      const key = node.dataset.configValue;
      const value = config[key];
      if (typeof value === "string") node.setAttribute("value", value);
    });

    document.querySelectorAll("[data-config-recipient]").forEach((node) => {
      if (config.email) node.dataset.recipient = config.email;
    });
  }

  applyConfig();

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => nav.classList.toggle("open"));
  }

  function updateFloatingContact() {
    if (!floating) return;
    const scrolled = window.scrollY > 280;
    const nearBottom = window.innerHeight + window.scrollY > document.body.offsetHeight - 520;
    floating.classList.toggle("visible", scrolled || nearBottom);
  }

  window.addEventListener("scroll", updateFloatingContact, { passive: true });
  window.addEventListener("resize", updateFloatingContact);
  updateFloatingContact();

  function initCaseCarousels() {
    const carousels = document.querySelectorAll("[data-case-carousel]");
    carousels.forEach(async (node) => {
      const images = (node.dataset.caseImages || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (!images.length) return;

      const prefix = node.dataset.caseAltPrefix || "Case photo";
      let index = 0;
      const imageSet = new Set(images);

      function parseImagePath(path) {
        const match = path.match(/^(.*\/)(\d+)(\.[a-zA-Z0-9]+)$/);
        if (!match) return null;
        return { dir: match[1], number: Number(match[2]), ext: match[3] };
      }

      function canLoadImage(path) {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = `${path}?v=${Date.now()}`;
        });
      }

      async function discoverSequentialImages() {
        const last = parseImagePath(images[images.length - 1]);
        if (!last) return;
        for (let step = 1; step <= 20; step += 1) {
          const candidate = `${last.dir}${last.number + step}${last.ext}`;
          if (imageSet.has(candidate)) continue;
          const ok = await canLoadImage(candidate);
          if (!ok) break;
          imageSet.add(candidate);
          images.push(candidate);
        }
      }

      function render() {
        const imagePath = images[index];
        node.style.backgroundImage = `linear-gradient(180deg, rgba(21, 56, 82, .08), rgba(21, 56, 82, .28)), url("${imagePath}")`;
        node.setAttribute("aria-label", `${prefix} ${index + 1}`);
      }

      const prevBtn = node.querySelector("[data-case-prev]");
      const nextBtn = node.querySelector("[data-case-next]");

      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          index = (index - 1 + images.length) % images.length;
          render();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          index = (index + 1) % images.length;
          render();
        });
      }

      render();
      await discoverSequentialImages();
    });
  }

  initCaseCarousels();

  function initMaterialNoteField() {
    if (!form) return;
    const materialSelect = form.querySelector('select[name="material"]');
    const materialNoteWrap = form.querySelector("[data-material-note-wrap]");
    const materialNoteInput = form.querySelector('[name="material_note"]');
    if (!materialSelect || !materialNoteWrap || !materialNoteInput) return;

    function toggleMaterialNote() {
      const selectedOption = materialSelect.options[materialSelect.selectedIndex];
      const selectedValue = (materialSelect.value || "").toLowerCase();
      const selectedText = selectedOption ? selectedOption.textContent.trim() : "";
      const isOtherOrUnsure =
        selectedValue === "other_unsure" ||
        selectedText.includes("其他") ||
        selectedText.includes("不確定");
      const shouldShow = materialSelect.value !== "";

      materialNoteWrap.hidden = !shouldShow;
      materialNoteInput.required = false;
      if (isOtherOrUnsure && shouldShow) materialNoteInput.focus();
    }

    materialSelect.addEventListener("change", toggleMaterialNote);
    toggleMaterialNote();
  }

  initMaterialNoteField();

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const required = Array.from(form.querySelectorAll("[required]"));
      const missing = required.find((field) => !String(field.value).trim());
      const serviceChecked = form.querySelectorAll('input[name="services"]:checked').length > 0;
      status.className = "form-status";

      if (!serviceChecked) {
        status.textContent = "請至少選擇一項服務。";
        form.querySelector('[name="services"]').focus();
        return;
      }

      if (missing) {
        status.textContent = "請先填寫必填欄位。";
        missing.focus();
        return;
      }

      const data = new FormData(form);
      const recipient = form.dataset.recipient || config.email || "khaiminhgroup11668@gmail.com";
      const subject = `Khai Minh Quote Request - ${data.get("name") || ""}`;
      const attachments = data.getAll("attachment")
        .filter((file) => file && file.name)
        .map((file) => file.name);
      const services = data.getAll("services").join(", ");
      const preferred = data.get("preferred_contact") || "-";
      const siteVisit = data.get("site_visit") || "不需要";
      const body = [
        "Khai Minh Website Quote Request",
        "",
        "[Service]",
        `Selected services: ${services}`,
        `Process: ${data.get("process") || "-"}`,
        `Material: ${data.get("material") || "-"}`,
        `Material note: ${data.get("material_note") || "-"}`,
        `Part size: ${data.get("part_size") || "-"}`,
        `Quantity: ${data.get("quantity") || "-"} ${data.get("quantity_unit") || ""}`,
        `Frequency: ${data.get("frequency") || "-"}`,
        `Deadline: ${data.get("deadline") || "-"}`,
        "",
        "[Specification]",
        data.get("message") || "",
        "",
        "[Attachment]",
        `File names: ${attachments.length ? attachments.join(", ") : "-"}`,
        "Please attach drawings/photos to this email before sending if needed.",
        "",
        "[Contact]",
        `Name: ${data.get("name") || ""}`,
        `Title: ${data.get("title") || "-"}`,
        `Company: ${data.get("company") || ""}`,
        `Industry: ${data.get("industry") || "-"}`,
        `Phone / Zalo: ${data.get("phone") || ""}`,
        `Email: ${data.get("email") || ""}`,
        `Location: ${data.get("location") || "-"}`,
        `Preferred contact: ${preferred}`,
        `Factory visit: ${siteVisit}`
      ].join("\n");

      const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      try {
        window.location.href = mailtoUrl;
      } catch (_) {
        try {
          const tempLink = document.createElement("a");
          tempLink.href = mailtoUrl;
          tempLink.style.display = "none";
          document.body.appendChild(tempLink);
          tempLink.click();
          tempLink.remove();
        } catch (_) {
          // Keep manual link fallback below.
        }
      }
      try {
        window.open(gmailUrl, "_blank", "noopener");
      } catch (_) {
        // Keep manual links fallback below.
      }

      status.classList.add("success");
      status.textContent = "已嘗試開啟 Email 與 Gmail 草稿。若沒有反應，請使用下方按鈕：";

      const mailtoLink = document.createElement("a");
      mailtoLink.href = mailtoUrl;
      mailtoLink.textContent = "手動開啟 Email";
      mailtoLink.style.marginLeft = "8px";
      mailtoLink.style.textDecoration = "underline";

      const gmailLink = document.createElement("a");
      gmailLink.href = gmailUrl;
      gmailLink.target = "_blank";
      gmailLink.rel = "noopener";
      gmailLink.textContent = "開 Gmail 草稿";
      gmailLink.style.marginLeft = "12px";
      gmailLink.style.textDecoration = "underline";

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.textContent = "複製詢價內容";
      copyButton.style.marginLeft = "12px";
      copyButton.style.border = "1px solid #bfa87a";
      copyButton.style.background = "#fff";
      copyButton.style.padding = "4px 8px";
      copyButton.style.cursor = "pointer";
      copyButton.addEventListener("click", async () => {
        const text = `To: ${recipient}\nSubject: ${subject}\n\n${body}`;
        try {
          await navigator.clipboard.writeText(text);
          copyButton.textContent = "已複製";
        } catch (_) {
          copyButton.textContent = "複製失敗";
        }
      });

      status.appendChild(mailtoLink);
      status.appendChild(gmailLink);
      status.appendChild(copyButton);
    });
  }
})();
