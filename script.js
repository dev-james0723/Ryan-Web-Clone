(() => {
  'use strict';

  const STRINGS = {
    en: {
      subtitle: 'portfolio 2022-2026',
      sec_ny: 'Selected Works from New York & MSM - 2025-26',
      sec_port: 'Selected Portraits',
      sec_land: 'Selected Landscapes & Cityscapes',
      sec_wild: 'Select Wildlife',
      nav_label: 'Jump to section',
      nav_placeholder: 'Choose a section…',
      nav_hint: 'Opens the chosen part of this page.',
      nav_hero: 'Cover',
      nav_ny: 'New York & MSM',
      nav_port: 'Portraits',
      nav_land: 'Landscapes & Cityscapes',
      nav_wild: 'Wildlife',
      lang_label: 'Language',
      footer_tag: 'Photography portfolio',
      footer_copy: '© 2022–2026 Keys & Shutters. All images by the artist.',
      theme_use_dark: 'Dark mode',
      theme_use_light: 'Day mode',
      lightbox_close: 'Close',
      lightbox_prev: 'Previous image',
      lightbox_next: 'Next image',
      lightbox_dialog: 'Image preview',
    },
    'zh-Hant': {
      subtitle: '作品集 2022–2026',
      sec_ny: '紐約及 MSM 精選作品 – 2025–26',
      sec_port: '人像精選',
      sec_land: '風景與城市精選',
      sec_wild: '野生動物精選',
      nav_label: '跳轉章節',
      nav_placeholder: '選擇章節…',
      nav_hint: '前往頁面中選取的區塊。',
      nav_hero: '封面',
      nav_ny: '紐約及 MSM',
      nav_port: '人像',
      nav_land: '風景與城市',
      nav_wild: '野生動物',
      lang_label: '語言',
      footer_tag: '攝影作品集',
      footer_copy: '© 2022–2026 Keys & Shutters。照片均由創作者拍攝。',
      theme_use_dark: '深色模式',
      theme_use_light: '日間模式',
      lightbox_close: '關閉',
      lightbox_prev: '上一張',
      lightbox_next: '下一張',
      lightbox_dialog: '圖片預覽',
    },
  };

  function applyLang(lang) {
    const pack = STRINGS[lang] || STRINGS.en;
    document.documentElement.lang = lang === 'zh-Hant' ? 'zh-Hant' : 'en';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key && pack[key] != null) el.textContent = pack[key];
    });

    const lightbox = document.getElementById('lightbox');
    const closeBtn = lightbox?.querySelector('.lightbox-close');
    const prevBtn = lightbox?.querySelector('.lightbox-prev');
    const nextBtn = lightbox?.querySelector('.lightbox-next');
    if (lightbox) lightbox.setAttribute('aria-label', pack.lightbox_dialog);
    if (closeBtn) closeBtn.setAttribute('aria-label', pack.lightbox_close);
    if (prevBtn) prevBtn.setAttribute('aria-label', pack.lightbox_prev);
    if (nextBtn) nextBtn.setAttribute('aria-label', pack.lightbox_next);

    syncThemeToggleLabel(lang);
  }

  function getStoredLang() {
    try {
      const v = localStorage.getItem('ks-lang');
      return v === 'zh-Hant' ? 'zh-Hant' : 'en';
    } catch {
      return 'en';
    }
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem('ks-lang', lang);
    } catch { /* ignore */ }
  }

  const langSelect = document.getElementById('footer-lang');
  if (langSelect) {
    langSelect.value = getStoredLang();
    applyLang(langSelect.value);
    langSelect.addEventListener('change', () => {
      setStoredLang(langSelect.value);
      applyLang(langSelect.value);
    });
  } else {
    applyLang('en');
  }

  function syncThemeToggleLabel(lang) {
    const pack = STRINGS[lang] || STRINGS.en;
    const btn = document.getElementById('theme-toggle');
    const label = btn?.querySelector('.theme-toggle__label');
    if (!btn || !label) return;
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    label.textContent = dark ? pack.theme_use_light : pack.theme_use_dark;
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn.title = dark ? pack.theme_use_light : pack.theme_use_dark;
  }

  function setTheme(mode) {
    const next = mode === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    const metaColor = document.getElementById('meta-theme-color');
    if (metaColor) metaColor.setAttribute('content', next === 'dark' ? '#121212' : '#ffffff');
    try {
      localStorage.setItem('ks-theme', next);
    } catch { /* ignore */ }
    syncThemeToggleLabel(getStoredLang());
  }

  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    const metaColor = document.getElementById('meta-theme-color');
    if (metaColor && document.documentElement.getAttribute('data-theme') === 'dark') {
      metaColor.setAttribute('content', '#121212');
    }
    syncThemeToggleLabel(getStoredLang());
    themeBtn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      setTheme(cur === 'dark' ? 'light' : 'dark');
    });
  }

  const sectionNav = document.getElementById('footer-section-nav');
  if (sectionNav) {
    sectionNav.addEventListener('change', () => {
      const v = sectionNav.value;
      if (!v) return;
      const target = document.querySelector(v);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      try {
        history.replaceState(null, '', v);
      } catch { /* ignore */ }
      sectionNav.value = '';
    });
  }

  // Scroll-triggered fade-in using Intersection Observer
  const faders = document.querySelectorAll('.fade-in');
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  faders.forEach((el) => fadeObserver.observe(el));

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  const allPhotos = Array.from(document.querySelectorAll('.photo img'));
  let currentIdx = 0;

  function openLightbox(idx) {
    currentIdx = idx;
    lbImg.src = allPhotos[idx].dataset.full || allPhotos[idx].src;
    lbImg.alt = allPhotos[idx].alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function navigate(dir) {
    currentIdx = (currentIdx + dir + allPhotos.length) % allPhotos.length;
    lbImg.style.animation = 'none';
    lbImg.offsetHeight; // reflow
    lbImg.style.animation = '';
    lbImg.src = allPhotos[currentIdx].dataset.full || allPhotos[currentIdx].src;
    lbImg.alt = allPhotos[currentIdx].alt;
  }

  allPhotos.forEach((img, i) => {
    img.closest('.photo').addEventListener('click', () => openLightbox(i));
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content')) {
      closeLightbox();
    }
  });

  // Touch swipe on the image area: left → next, right → previous
  const lbContent = lightbox.querySelector('.lightbox-content');
  const SWIPE_MIN_PX = 48;
  const SWIPE_HORIZONTAL_RATIO = 1.15;
  let touchStartX = 0;
  let touchStartY = 0;

  function onLbTouchStart(e) {
    if (!lightbox.classList.contains('active') || e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }

  function onLbTouchEnd(e) {
    if (!lightbox.classList.contains('active') || e.changedTouches.length !== 1) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) < SWIPE_MIN_PX) return;
    if (Math.abs(dx) < Math.abs(dy) * SWIPE_HORIZONTAL_RATIO) return;
    if (dx < 0) navigate(1);
    else navigate(-1);
  }

  if (lbContent) {
    lbContent.addEventListener('touchstart', onLbTouchStart, { passive: true });
    lbContent.addEventListener('touchend', onLbTouchEnd, { passive: true });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  // Parallax hero on scroll
  const hero = document.querySelector('.hero-bg img');
  if (hero) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scroll = window.scrollY;
          if (scroll < window.innerHeight) {
            hero.style.transform = `translateY(${scroll * 0.3}px) scale(1.05)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // Hide scroll hint on scroll
  const scrollHint = document.querySelector('.scroll-hint');
  if (scrollHint) {
    window.addEventListener('scroll', () => {
      scrollHint.style.opacity = Math.max(0, 1 - window.scrollY / 200);
    }, { passive: true });
  }
})();
