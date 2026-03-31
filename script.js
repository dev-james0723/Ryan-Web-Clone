(() => {
  'use strict';

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
