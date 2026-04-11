document.addEventListener('DOMContentLoaded', () => {
  const WHITE = 'rgb(245,239,225)';
  const BLACK = 'rgb(31,29,33)';
  const WHITE_SHIMMER = 'rgba(245,239,225,0.8)';
  const BLACK_SHIMMER = 'rgba(31,29,33,0.8)';
  const FADE_DUR = 0.4;
  const FADE_EASE = 'power2.out';

  const links = document.querySelectorAll('.nav-link');
  const bgSections = document.querySelectorAll('[data-bg]');
  const logo = document.querySelector('.yokai--nav-logo');
  const stickyNav = document.querySelector('.sticky-nav');
  const footerImg = document.querySelector('.footer--bg-wrapper');
  if (!links.length || !bgSections.length) return;

  let sections = [];
  let navYPositions = [];
  let logoY = 0;
  let navHidden = false;
  const lastBg = new Map();

  const computeSections = () => {
    sections = Array.from(bgSections)
      .map((sec) => ({ bg: sec.getAttribute('data-bg'), top: sec.offsetTop, bottom: sec.offsetTop + sec.offsetHeight }))
      .sort((a, b) => a.top - b.top);
    if (logo) {
      const r = logo.getBoundingClientRect();
      logoY = r.top + r.height / 2;
    }
    navYPositions = Array.from(links).map((l) => {
      const r = l.getBoundingClientRect();
      return r.top + r.height / 2;
    });
  };

  const getBgAt = (y) => {
    const len = sections.length;
    if (len === 0) return null;
    if (y < sections[0].top) return sections[0].bg;
    if (y >= sections[len - 1].bottom) return sections[len - 1].bg;
    for (let i = 0; i < len; i++) {
      if (y >= sections[i].top && y < sections[i].bottom) return sections[i].bg;
      if (y < sections[i].top) return sections[i - 1].bg;
    }
    return sections[len - 1].bg;
  };

  const updateElement = (el, bg) => {
    if (!bg) bg = lastBg.get(el);
    if (!bg || lastBg.get(el) === bg) return;
    lastBg.set(el, bg);
    const addClass = bg === 'light' ? 'is-dark' : 'is-light';
    const removeClass = bg === 'light' ? 'is-light' : 'is-dark';
    el.classList.remove(removeClass);
    el.classList.add(addClass);
    const text = el.querySelector?.('.small-text');
    if (text) {
      const baseColor = addClass === 'is-light' ? WHITE : BLACK;
      const shimmerColor = addClass === 'is-light' ? BLACK_SHIMMER : WHITE_SHIMMER;
      text._baseColor = baseColor;
      text._shimmerColor = shimmerColor;
      text.style.color = baseColor;
      const overlay = text.querySelector('.shimmer-overlay');
      if (overlay) overlay.style.color = shimmerColor;
    }
  };

  const updateNav = () => {
    const sy = window.scrollY;
    if (logo) updateElement(logo, getBgAt(sy + logoY));
    for (let i = 0; i < links.length; i++) updateElement(links[i], getBgAt(sy + navYPositions[i]));
    if (stickyNav && footerImg) {
      const shouldHide = footerImg.getBoundingClientRect().bottom <= window.innerHeight;
      if (shouldHide && !navHidden) {
        navHidden = true;
        gsap.to(stickyNav, { opacity: 0, duration: FADE_DUR, ease: FADE_EASE, onComplete: () => { stickyNav.style.pointerEvents = 'none'; } });
      } else if (!shouldHide && navHidden) {
        navHidden = false;
        stickyNav.style.pointerEvents = '';
        gsap.to(stickyNav, { opacity: 1, duration: FADE_DUR, ease: FADE_EASE });
      }
    }
  };

  links.forEach((link) => {
    const text = link.querySelector('.small-text');
    if (text) window.YokaiShimmer.setup(text);
    link.addEventListener('mouseenter', () => {
      if (text) gsap.timeline().add(window.YokaiShimmer.play(text, 1.2), 0);
    });
  });

  computeSections();
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });
  window.addEventListener('resize', () => { computeSections(); updateNav(); });
  window.addEventListener('layout-change', () => { computeSections(); updateNav(); });
});
