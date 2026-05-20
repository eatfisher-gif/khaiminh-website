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

      window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.classList.add("success");
      status.textContent = "已開啟 Email 草稿；請確認內容與附件後寄出。";
    });
  }
})();
