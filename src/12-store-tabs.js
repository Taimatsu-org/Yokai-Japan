document.addEventListener('DOMContentLoaded', () => {
  var FADE_DUR = 0.3;
  var FADE_EASE = 'power2.out';
  var HEIGHT_DUR = 0.5;
  var INACTIVE_OPACITY = 0.35;

  var tabParent = document.querySelector('.store--title-grid');
  var listWrap = document.querySelector('.store--list-wrapper');
  var tabs = Array.from(document.querySelectorAll('.store--title-grid .title-block[data-region]'));
  var stores = document.querySelectorAll('.store--list-wrapper .store--list-info[data-region]');
  if (!tabs.length || !stores.length || !listWrap) return;

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

    var currentStores = Array.from(stores).filter(s => s.style.display !== 'none' && s.dataset.region !== region);
    var nextStores = Array.from(stores).filter(s => s.dataset.region === region);

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
