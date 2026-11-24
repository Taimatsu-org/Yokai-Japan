document.addEventListener('DOMContentLoaded', () => {
  var FADE_DUR = 0.3;
  var FADE_EASE = 'power2.out';
  var HEIGHT_DUR = 0.5;
  var INACTIVE_OPACITY = 0.35;
  var PARTNER_PREFIX = 'MUSASHI JAPAN';
  var STORE_NAME_SELECTOR = '.small-text';
  var PARTNER_CAPTION = { en: 'Also available at MUSASHI JAPAN stores', ja: 'MUSASHI JAPAN の店舗でもお取り扱いしております' };
  var DEFAULT_LOCALE = 'en';
  var CAPTION_CLASS = 'extra--small-text';
  var CAPTION_COLOR = 'rgba(31, 29, 33, 0.5)';
  var CAPTION_DIVIDER = '1px solid rgba(31, 29, 33, 0.12)';
  var CAPTION_DIVIDER_GAP = '0.75rem';

  var tabParent = document.querySelector('.store--title-grid');
  var listWrap = document.querySelector('.store--list-wrapper');
  var tabs = Array.from(document.querySelectorAll('.store--title-grid .title-block[data-region]'));
  var stores = Array.from(document.querySelectorAll('.store--list-wrapper .store--list-info[data-region]'));
  if (!tabs.length || !stores.length || !listWrap) return;

  var isPartner = (store) => (store.querySelector(STORE_NAME_SELECTOR)?.textContent.trim() || '').startsWith(PARTNER_PREFIX);
  var partners = stores.filter(isPartner);
  var locale = document.documentElement.lang.slice(0, 2);
  var captionText = PARTNER_CAPTION[locale] || PARTNER_CAPTION[DEFAULT_LOCALE];

  partners.forEach(store => store.parentElement.appendChild(store));
  Array.from(new Set(partners.map(store => store.dataset.region))).forEach(region => {
    var first = partners.find(store => store.dataset.region === region);
    var caption = document.createElement('div');
    caption.className = CAPTION_CLASS;
    caption.dataset.region = region;
    caption.textContent = captionText;
    caption.style.gridColumn = '1 / -1';
    caption.style.color = CAPTION_COLOR;
    if (stores.some(store => store.dataset.region === region && !isPartner(store))) {
      caption.style.borderTop = CAPTION_DIVIDER;
      caption.style.paddingTop = CAPTION_DIVIDER_GAP;
    }
    first.before(caption);
    stores.push(caption);
  });

  tabs.sort((a, b) => (parseInt(a.dataset.order) || 0) - (parseInt(b.dataset.order) || 0));
  tabs.forEach(t => tabParent.appendChild(t));

  var activeRegion = null;
  var showId = 0;

  var notify = () => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    window.dispatchEvent(new Event('layout-change'));
  };

  var showRegion = (region, animate) => {
    if (region === activeRegion) return;
    var id = ++showId;

    gsap.killTweensOf(tabs);
    stores.forEach(s => gsap.killTweensOf(s));
    gsap.killTweensOf(listWrap);
    listWrap.style.height = '';

    activeRegion = region;

    tabs.forEach(tab => {
      gsap.to(tab, { opacity: tab.dataset.region === region ? 1 : INACTIVE_OPACITY, duration: FADE_DUR, ease: FADE_EASE });
    });

    var currentStores = stores.filter(s => s.style.display !== 'none' && s.dataset.region !== region);
    var nextStores = stores.filter(s => s.dataset.region === region);

    var reveal = () => {
      if (id !== showId) return;
      var oldH = listWrap.offsetHeight;
      var alreadyVisible = nextStores.every(s => s.style.display !== 'none');
      stores.forEach(s => s.style.display = s.dataset.region === region ? '' : 'none');
      var newH = listWrap.offsetHeight;
      if (animate && oldH !== newH) {
        gsap.fromTo(listWrap, { height: oldH }, {
          height: newH, duration: HEIGHT_DUR, ease: 'expo.out',
          onUpdate: notify,
          onComplete: () => { listWrap.style.height = ''; notify(); }
        });
      }
      if (alreadyVisible) {
        gsap.to(nextStores, { opacity: 1, duration: FADE_DUR, ease: FADE_EASE, onComplete: notify });
      } else {
        gsap.fromTo(nextStores, { opacity: 0 }, { opacity: 1, duration: FADE_DUR, ease: FADE_EASE, onComplete: notify });
      }
    };

    if (animate && currentStores.length) {
      gsap.to(currentStores, { opacity: 0, duration: FADE_DUR, ease: FADE_EASE, onComplete: reveal });
    } else {
      reveal();
    }
  };

  stores.forEach(s => s.style.display = 'none');
  var firstRegion = tabs[0]?.dataset.region;
  if (firstRegion) {
    showRegion(firstRegion, false);
    requestAnimationFrame(() => { notify(); });
  }

  tabs.forEach(tab => {
    tab.style.cursor = 'pointer';
    tab.addEventListener('click', () => showRegion(tab.dataset.region, true));
  });
});
