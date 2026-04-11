document.addEventListener('DOMContentLoaded', () => {
  var JA_SEGMENT = 'ja';
  var ACTIVE_CLASS = 'is-current-locale';
  var SWITCH_SELECTOR = '.locale-switch';
  var LINK_SELECTOR = '.locale-link[href]';

  var firstSegment = (path) => path.split('/').filter(Boolean)[0];

  var switchEl = document.querySelector(SWITCH_SELECTOR);
  if (!switchEl) return;

  var links = switchEl.querySelectorAll(LINK_SELECTOR);
  if (!links.length) return;

  switchEl.addEventListener('click', (ev) => ev.stopPropagation());

  var pageIsJa = firstSegment(window.location.pathname) === JA_SEGMENT;

  links.forEach((link) => {
    var linkIsJa = firstSegment(link.getAttribute('href') || '') === JA_SEGMENT;
    var active = linkIsJa === pageIsJa;
    link.classList.toggle(ACTIVE_CLASS, active);
    active ? link.setAttribute('aria-current', 'true') : link.removeAttribute('aria-current');
  });
});
