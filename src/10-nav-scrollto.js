document.addEventListener('DOMContentLoaded', () => {
  var ACTIVE_DUR = 0.6;
  var ACTIVE_EASE = 'power2.out';
  var SCROLL_THRESHOLD = 0.4;
  var MIN_SCROLL_DUR = 0.6;
  var MAX_SCROLL_DUR = 1.8;
  var LENIS_POLL_INTERVAL = 50;

  var SECTION_MAP = { top: 'hero', concept: 'concept', products: 'product', fragrances: 'product', location: 'store', stores: 'store', 'view stores': 'store', news: 'news', contact: 'contact' };
  var SECTION_IDS = Object.values(SECTION_MAP);

  var desktopLinks = document.querySelectorAll('.nav-container .nav-link');
  var mobileLinks = document.querySelectorAll('.mob-nav-link');
  if (!desktopLinks.length) return;

  var allLinks = [...desktopLinks, ...mobileLinks];
  var currentSection = null;
  var isScrolling = false;

  var scrollEase = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  var getSectionId = (link) => {
    var key = link.dataset.section;
    if (!key) {
      key = link.querySelector('.small-text')?.textContent.trim().toLowerCase();
      if (key && key.length % 2 === 0 && key.slice(0, key.length / 2) === key.slice(key.length / 2)) key = key.slice(0, key.length / 2);
    }
    return SECTION_MAP[key] || key;
  };

  var calcScrollDuration = (distance) => Math.min(Math.max(MIN_SCROLL_DUR + Math.sqrt(distance) / 50, MIN_SCROLL_DUR), MAX_SCROLL_DUR);

  var setActive = (id) => {
    if (id === currentSection) return;
    currentSection = id;
    allLinks.forEach((link) => {
      var sectionId = getSectionId(link);
      var icon = link.querySelector('.nav--active-icon');
      if (!icon) return;
      if (sectionId === id) {
        link.classList.add('is-active');
        gsap.fromTo(icon, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(100% at 50% 50%)', duration: ACTIVE_DUR, ease: ACTIVE_EASE });
      } else {
        link.classList.remove('is-active');
        gsap.to(icon, { clipPath: 'circle(0% at 50% 50%)', duration: ACTIVE_DUR, ease: ACTIVE_EASE });
      }
    });
  };

  var checkActiveSection = () => {
    var vh = window.innerHeight;
    var active = SECTION_IDS[0];
    for (var i = 0; i < SECTION_IDS.length; i++) {
      var el = document.getElementById(SECTION_IDS[i]);
      if (el && el.getBoundingClientRect().top <= vh * SCROLL_THRESHOLD) active = SECTION_IDS[i];
    }
    setActive(active);
  };

  var pollTimer = setInterval(() => {
    if (typeof SScroll !== 'undefined') {
      clearInterval(pollTimer);
      SScroll.on('scroll', checkActiveSection);
      checkActiveSection();
    }
  }, LENIS_POLL_INTERVAL);

  var scrollToSection = (link) => {
    if (isScrolling) return;
    isScrolling = true;
    var id = getSectionId(link);
    var target = id === 'hero' ? 0 : document.getElementById(id);
    if (target === 0 || target) {
      var dist = Math.abs((target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY) - window.scrollY);
      var dur = calcScrollDuration(dist);
      SScroll.scrollTo(target, { duration: dur, easing: scrollEase });
      setTimeout(() => { isScrolling = false; }, dur * 1000 + 100);
    } else {
      isScrolling = false;
    }
  };

  desktopLinks.forEach((link) => { link.addEventListener('click', (ev) => { ev.preventDefault(); scrollToSection(link); }); });

  document.querySelectorAll('.footer--link-wrapper .secondary--button, .footer-content .secondary--button').forEach((link) => {
    var id = getSectionId(link);
    if (!(id in SECTION_MAP) && !SECTION_IDS.includes(id)) return;
    link.addEventListener('click', (ev) => { ev.preventDefault(); scrollToSection(link); });
  });

  var heroBtn = document.querySelector('.hero-section .secondary--button');
  if (heroBtn) heroBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    if (isScrolling) return;
    isScrolling = true;
    var target = document.getElementById('product');
    if (target) {
      var dur = calcScrollDuration(Math.abs(target.getBoundingClientRect().top + window.scrollY - window.scrollY));
      SScroll.scrollTo(target, { duration: dur, easing: scrollEase });
      setTimeout(() => { isScrolling = false; }, dur * 1000 + 100);
    } else {
      isScrolling = false;
    }
  });

  var scrollTopBtn = document.querySelector('[data-scroll-top]');
  if (scrollTopBtn) scrollTopBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    if (isScrolling) return;
    isScrolling = true;
    var dur = calcScrollDuration(window.scrollY);
    SScroll.scrollTo(0, { duration: dur, easing: scrollEase });
    setTimeout(() => { isScrolling = false; }, dur * 1000 + 100);
  });
});
