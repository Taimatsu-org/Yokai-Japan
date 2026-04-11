document.addEventListener('DOMContentLoaded', () => {
  var WIPE_DUR = 0.9;
  var CONTENT_DUR = 0.8;
  var LINK_STAGGER = 0.09;
  var SLOGAN_DUR = 1.6;
  var EASE_IN = 'expo.out';
  var EASE_WIPE = 'circ.inOut';
  var SECTION_MAP = { top: 'hero', concept: 'concept', products: 'product', fragrances: 'product', location: 'store', stores: 'store', 'view stores': 'store', news: 'news', contact: 'contact' };

  var menuBtn = document.querySelector('[data-mob-menu]');
  var navContainer = document.querySelector('.mob--nav-container');
  var links = document.querySelectorAll('.mob-nav-link');
  var bgSections = document.querySelectorAll('[data-bg]');
  var mobileLogo = navContainer?.querySelector('.nav--logo-wrapper.mobile');
  var slogan = navContainer?.querySelector('.extra--small-text.slogan-align.nav');
  if (!menuBtn || !navContainer) return;
  if (menuBtn.querySelectorAll('div').length < 2) return;

  var isOpen = false;
  var isAnimating = false;
  var openTimeline = null;
  var sections = [];
  var menuY = 0;
  var lastBg = null;
  var wipe = { v: 100 };

  var setWipe = () => { navContainer.style.clipPath = 'inset(' + wipe.v + '% 0 0 0)'; };

  gsap.set(navContainer, { opacity: 1, visibility: 'visible', pointerEvents: 'none' });
  setWipe();
  gsap.set(links, { opacity: 0, y: 20 });
  if (mobileLogo) gsap.set(mobileLogo, { opacity: 0, y: 20 });
  if (slogan) gsap.set(slogan, { opacity: 0, y: 20 });

  var computeSections = () => {
    sections = Array.from(bgSections).map(el => ({ bg: el.getAttribute('data-bg'), top: el.offsetTop, bottom: el.offsetTop + el.offsetHeight })).sort((a, b) => a.top - b.top);
    var r = menuBtn.getBoundingClientRect();
    menuY = r.top + r.height / 2;
  };

  var getBgAt = (y) => {
    var len = sections.length;
    if (len === 0) return null;
    if (y < sections[0].top) return sections[0].bg;
    if (y >= sections[len - 1].bottom) return sections[len - 1].bg;
    for (var i = 0; i < len; i++) {
      if (y >= sections[i].top && y < sections[i].bottom) return sections[i].bg;
      if (y < sections[i].top) return sections[i - 1].bg;
    }
    return sections[len - 1].bg;
  };

  var updateColors = () => {
    if (isOpen || isAnimating) return;
    var bg = getBgAt(window.scrollY + menuY);
    if (!bg || bg === lastBg) return;
    lastBg = bg;
    menuBtn.classList.remove(bg === 'light' ? 'is-light' : 'is-dark');
    menuBtn.classList.add(bg === 'light' ? 'is-dark' : 'is-light');
  };

  var scrollEase = (x) => x < 0.5 ? 4 * x * x * x : (1 - Math.pow(-2 * x + 2, 3) / 2);

  var doScroll = (target) => {
    if (window.SScroll) window.SScroll.start();
    var dist = Math.abs((target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY) - window.scrollY);
    var dur = Math.min(Math.max(0.6 + Math.sqrt(dist) / 50, 0.6), 1.8);
    SScroll.scrollTo(target, { duration: dur, easing: scrollEase });
  };

  var openMenu = () => {
    if (isAnimating || isOpen) return;
    isAnimating = true;
    if (window.SScroll) window.SScroll.stop();
    menuBtn.classList.add('is-active');
    openTimeline = gsap.timeline({ onComplete: () => { isAnimating = false; isOpen = true; openTimeline = null; } });
    navContainer.style.pointerEvents = 'auto';
    openTimeline.to(wipe, { v: 0, duration: WIPE_DUR, ease: EASE_WIPE, onUpdate: setWipe }, 0);
    var contentStart = WIPE_DUR * 0.4;
    if (mobileLogo) openTimeline.to(mobileLogo, { opacity: 1, y: 0, duration: CONTENT_DUR, ease: EASE_IN }, contentStart);
    links.forEach((link, i) => {
      var opacity = link.classList.contains('is-active') ? 1 : 0.5;
      openTimeline.to(link, { opacity: opacity, y: 0, duration: CONTENT_DUR, ease: EASE_IN }, contentStart + (i + (mobileLogo ? 1 : 0)) * LINK_STAGGER);
    });
    var sloganStart = contentStart + (links.length + (mobileLogo ? 1 : 0)) * LINK_STAGGER;
    if (slogan) openTimeline.to(slogan, { opacity: 1, y: 0, duration: SLOGAN_DUR, ease: EASE_IN }, sloganStart);
  };

  var closeMenu = (scrollTarget) => {
    if (openTimeline) { openTimeline.kill(); openTimeline = null; }
    isAnimating = true;
    isOpen = false;
    menuBtn.classList.remove('is-active');
    lastBg = null;
    updateColors();
    if (scrollTarget === 0 || scrollTarget) doScroll(scrollTarget);
    var tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
        isOpen = false;
        wipe.v = 100;
        setWipe();
        navContainer.style.pointerEvents = 'none';
        gsap.set(links, { opacity: 0, y: 20 });
        if (mobileLogo) gsap.set(mobileLogo, { opacity: 0, y: 20 });
        if (slogan) gsap.set(slogan, { opacity: 0, y: 20 });
        if (!(scrollTarget === 0 || scrollTarget) && window.SScroll) window.SScroll.start();
      }
    });
    tl.to(links, { opacity: 0, duration: CONTENT_DUR, ease: EASE_IN }, 0);
    if (mobileLogo) tl.to(mobileLogo, { opacity: 0, duration: CONTENT_DUR, ease: EASE_IN }, 0);
    if (slogan) tl.to(slogan, { opacity: 0, duration: CONTENT_DUR, ease: EASE_IN }, 0);
    var closeWipe = { v: 0 };
    tl.to(closeWipe, { v: 100, duration: WIPE_DUR, ease: EASE_WIPE, onUpdate: () => { navContainer.style.clipPath = 'inset(0 0 ' + closeWipe.v + '% 0)'; } }, 0);
  };

  menuBtn.addEventListener('click', () => (isOpen || openTimeline) ? closeMenu() : openMenu());

  var getLinkText = (el) => {
    if (el.dataset.section) return el.dataset.section;
    var t = el.querySelector('.small-text')?.textContent.trim().toLowerCase();
    if (t && t.length % 2 === 0 && t.slice(0, t.length / 2) === t.slice(t.length / 2)) t = t.slice(0, t.length / 2);
    return t;
  };

  links.forEach(link => {
    link.addEventListener('click', ev => {
      ev.preventDefault();
      var text = getLinkText(link);
      var id = SECTION_MAP[text] || text;
      var target = text === 'top' ? 0 : document.getElementById(id);
      (target === 0 || target) ? closeMenu(target) : closeMenu();
    });
  });

  computeSections();
  updateColors();
  window.addEventListener('scroll', updateColors, { passive: true });
  window.addEventListener('resize', () => { computeSections(); updateColors(); });
  window.addEventListener('layout-change', () => { computeSections(); updateColors(); });
});
