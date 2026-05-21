/* ============================================
   KHAI MINH GROUP — 互動邏輯
   ============================================
   * 行動選單展開
   * 詢價單 stepper 隨捲動高亮
   * 拖曳上傳 + 檔案列表 + 大小驗證
   * 表單欄位驗證
   * Formspree 送出 (通知 Email: khaiminhgroup11668@gmail.com)
   ============================================ */

(function () {
  'use strict';

  /* ============== 設定 ============== */
  // ⚠ 上線前換成你的 Formspree endpoint
  // 取得方式：https://formspree.io → New Form → 拿到 https://formspree.io/f/xxxxxxxx
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mvzyklbp';

  /* ============== 共用：i18n 文字取用 ============== */
  function t(key, fallback) {
    if (!window.KM_i18n) return fallback || key;
    const dict = window.KM_i18n.getDict();
    const val = key.split('.').reduce((a, k) => (a == null ? a : a[k]), dict);
    return (typeof val === 'string') ? val : (fallback || key);
  }

  /* ============== 1. 行動選單 ============== */
  function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    // 點選單項目後自動收起
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ============== 2. 詢價單 stepper 隨捲動高亮 ============== */
  function initFormStepper() {
    const sections = document.querySelectorAll('.form-section[data-section]');
    const steps = document.querySelectorAll('.fs-step[data-step]');
    if (!sections.length || !steps.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionNum = entry.target.getAttribute('data-section');
          steps.forEach(s => {
            s.classList.toggle('active', s.getAttribute('data-step') === sectionNum);
          });
        }
      });
    }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });

    sections.forEach(sec => observer.observe(sec));

    // 點 stepper 跳轉到對應 section
    steps.forEach(step => {
      step.style.cursor = 'pointer';
      step.addEventListener('click', () => {
        const n = step.getAttribute('data-step');
        const target = document.querySelector(`.form-section[data-section="${n}"]`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ============== 3. 共用工具 ============== */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function buildMailtoUrl(fd, services) {
    const recipient = 'khaiminhgroup11668@gmail.com';
    const subject = 'Khai Minh Quote Request';
    const fieldLabels = {
      name: 'Name',
      company: 'Company',
      phone: 'Phone',
      email: 'Email',
      material: 'Material',
      quantity: 'Quantity',
      deadline: 'Deadline',
      note: 'Notes',
      channel_note: 'Channel Note',
      message: 'Message'
    };
    const lines = [
      'Khai Minh Website Quote Request',
      '',
      `Services: ${services || '-'}`,
    ];

    for (const [key, value] of fd.entries()) {
      if (key.startsWith('_') || key === 'services[]') continue;
      const text = String(value || '').trim();
      if (!text) continue;
      lines.push(`${fieldLabels[key] || key}: ${text}`);
    }

    lines.push('', `Source: ${window.location.href}`);
    return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  }

  /* ============== 4. 表單驗證 + Formspree 送出 ============== */
  function initQuoteForm() {
    const form = document.getElementById('quoteForm');
    if (!form) return;

    const submitBtn = document.getElementById('submitBtn');
    const success = document.getElementById('formSuccess');

    function setFieldError(field, hasError) {
      const wrap = field.closest('.form-field');
      if (wrap) wrap.classList.toggle('has-error', !!hasError);
    }

    function validateEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }

    function validatePhone(v) {
      // 允許 +、數字、空白、橫線、括號；至少 7 個數字
      const digits = (v.match(/\d/g) || []).length;
      return digits >= 7 && /^[+\d\s\-().]+$/.test(v);
    }

    function validate() {
      let ok = true;

      // 服務至少選 1 項
      const services = form.querySelectorAll('input[name="services[]"]:checked');
      const servicesError = document.getElementById('services-error');
      if (services.length === 0) {
        if (servicesError) servicesError.style.display = 'block';
        ok = false;
      } else {
        if (servicesError) servicesError.style.display = 'none';
      }

      // 必填欄位
      ['name', 'company'].forEach(n => {
        const f = form.querySelector(`[name="${n}"]`);
        if (!f) return;
        const empty = !f.value.trim();
        setFieldError(f, empty);
        if (empty) ok = false;
      });

      // Email 格式
      const emailF = form.querySelector('[name="email"]');
      if (emailF) {
        const bad = !validateEmail(emailF.value.trim());
        setFieldError(emailF, bad);
        if (bad) ok = false;
      }

      // 電話格式
      const phoneF = form.querySelector('[name="phone"]');
      if (phoneF) {
        const bad = !validatePhone(phoneF.value.trim());
        setFieldError(phoneF, bad);
        if (bad) ok = false;
      }

      return ok;
    }

    // 即時清除錯誤狀態
    form.querySelectorAll('input, select, textarea').forEach(el => {
      el.addEventListener('input', () => setFieldError(el, false));
      el.addEventListener('change', () => setFieldError(el, false));
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate()) {
        // 捲動到第一個錯誤
        const firstErr = form.querySelector('.has-error, #services-error[style*="block"]');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // 準備送出
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>${escapeHtml(t('validation.sending', '傳送中...'))}</span>`;

      const fd = new FormData(form);

      // 把多選 services 合併成可讀字串（方便 Email 通知顯示）
      const services = Array.from(form.querySelectorAll('input[name="services[]"]:checked'))
        .map(c => c.value).join(', ');
      fd.append('_services_summary', services);

      // 加上來源資訊
      fd.append('_subject', '【開明集團】新詢價單 / New Quote Request');
      fd.append('_language', (window.KM_i18n && window.KM_i18n.getLang()) || 'tw');
      fd.append('_source_url', window.location.href);
      fd.append('_submitted_at', new Date().toISOString());

      if (FORMSPREE_ENDPOINT.includes('YOUR_FORM_ID')) {
        window.location.href = buildMailtoUrl(fd, services);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        return;
      }

      try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          body: fd,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          form.style.display = 'none';
          document.querySelector('.submit-row').style.display = 'none';
          if (success) {
            success.classList.add('show');
            success.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          const data = await res.json().catch(() => ({}));
          const msg = data.error || data.errors?.[0]?.message || t('validation.send_failed', '送出失敗，請稍後再試');
          alert(msg);
        }
      } catch (err) {
        console.error(err);
        alert(t('validation.send_failed', '送出失敗，請稍後再試或直接致電 0908 421 410'));
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  /* ============== 5. 平滑捲動到錨點 ============== */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(link => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        // 同頁面錨點才接管
        if (id.length > 1) {
          const target = document.querySelector(id);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  /* ============== 啟動 ============== */
  function initProjectPhotoGrids() {
    const grids = document.querySelectorAll('.project-photo-grid[data-case-category]');
    if (!grids.length) return;

    fetch('assets/case-manifest.json?v=20260521-3', { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : null))
      .then(manifest => {
        if (!manifest || typeof manifest !== 'object') return;

        grids.forEach(grid => {
          const category = grid.getAttribute('data-case-category');
          const images = manifest[category] && Array.isArray(manifest[category].images)
            ? manifest[category].images.slice(0, 4)
            : [];
          if (!images.length) return;

          grid.innerHTML = '';
          grid.classList.toggle('project-photo-grid--placeholder', images.length < 4);

          images.forEach((src, idx) => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = `${category} project photo ${idx + 1}`;
            img.loading = 'lazy';
            grid.appendChild(img);
          });

          for (let i = images.length; i < 4; i += 1) {
            const fallback = document.createElement('div');
            fallback.className = 'project-photo-fallback';
            grid.appendChild(fallback);
          }
        });
      })
      .catch(err => {
        console.warn('[cases] failed to load case manifest:', err);
      });
  }

  function init() {
    initMobileMenu();
    initFormStepper();
    initQuoteForm();
    initSmoothScroll();
    initProjectPhotoGrids();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
