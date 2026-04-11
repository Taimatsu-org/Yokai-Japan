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
  var animating = false;

  var notify = () => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    window.dispatchEvent(new Event('layout-change'));
  };

  var showRegion = (region, animate) => {
    if (region === activeRegion || animating) return;
    animating = true;

    tabs.forEach(tab => {
      gsap.to(tab, { opacity: tab.dataset.region === region ? 1 : INACTIVE_OPACITY, duration: FADE_DUR, ease: FADE_EASE });
    });

    var currentStores = activeRegion ? Array.from(stores).filter(s => s.dataset.region === activeRegion) : [];
    var nextStores = Array.from(stores).filter(s => s.dataset.region === region);

    var reveal = () => {
      var oldH = listWrap.offsetHeight;
      stores.forEach(s => s.style.display = s.dataset.region === region ? '' : 'none');
      var newH = listWrap.offsetHeight;
      if (animate && oldH !== newH) {
        gsap.fromTo(listWrap, { height: oldH }, {
          height: newH, duration: HEIGHT_DUR, ease: 'expo.out',
          onUpdate: notify,
          onComplete: () => { listWrap.style.height = ''; notify(); }
        });
      }
      gsap.fromTo(nextStores, { opacity: 0 }, {
        opacity: 1, duration: FADE_DUR, ease: FADE_EASE,
        onComplete: () => { animating = false; activeRegion = region; }
      });
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
