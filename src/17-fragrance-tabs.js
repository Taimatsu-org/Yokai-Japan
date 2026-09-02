document.addEventListener('DOMContentLoaded', () => {
  var FADE_DUR = 0.7;
  var FADE_EASE = 'cubic-bezier(0.25,0.1,0.25,1)';

  var tabsEl = document.querySelector('.w-tabs');
  if (!tabsEl) return;
  var tabLinks = Array.from(tabsEl.querySelectorAll('.w-tab-menu .w-tab-link'));
  var tabPanes = Array.from(tabsEl.querySelectorAll('.w-tab-content .w-tab-pane'));
  if (!tabLinks.length || !tabPanes.length) return;

  var switching = false;

  function activate(link) {
    var targetId = (link.getAttribute('href') || '').slice(1);
    var targetPane = tabPanes.find(function (p) { return p.id === targetId; });
    var currentPane = tabPanes.find(function (p) { return p.classList.contains('w--tab-active'); });
    if (!targetPane || switching || targetPane === currentPane) return;
    switching = true;

    tabLinks.forEach(function (l) {
      var active = l === link;
      l.classList.toggle('w--current', active);
      l.setAttribute('aria-selected', active ? 'true' : 'false');
      l.tabIndex = active ? 0 : -1;
    });

    function showTarget() {
      tabPanes.forEach(function (p) {
        var active = p === targetPane;
        p.classList.toggle('w--tab-active', active);
        p.style.display = active ? '' : 'none';
      });
      gsap.killTweensOf(targetPane);
      gsap.fromTo(
        targetPane,
        { opacity: 0 },
        {
          opacity: 1,
          duration: FADE_DUR,
          ease: FADE_EASE,
          onComplete: function () {
            switching = false;
          },
        },
      );
    }

    if (currentPane) {
      gsap.killTweensOf(currentPane);
      gsap.to(currentPane, {
        opacity: 0,
        duration: FADE_DUR,
        ease: FADE_EASE,
        onComplete: showTarget,
      });
    } else {
      showTarget();
    }
  }

  tabsEl.addEventListener(
    'click',
    function (ev) {
      var link = ev.target.closest('.w-tab-link');
      if (!link || !tabLinks.includes(link)) return;
      ev.preventDefault();
      ev.stopPropagation();
      activate(link);
    },
    true,
  );
});
