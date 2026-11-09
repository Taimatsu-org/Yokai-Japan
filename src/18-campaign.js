(() => {
  const PREVIEW_HOST_PATTERN = /\.webflow\.io$/;
  if (!PREVIEW_HOST_PATTERN.test(window.location.hostname)) return;

  const CAMPAIGN_ID = 'bf2026';
  const STORAGE_KEY = `yokai-campaign-${CAMPAIGN_ID}-closed`;
  const FORCE_OPEN_HASH = '#black-friday';
  const PENDING_CLASS = 'bf-pending';
  const LOADING_CLASS = 'is-loading';
  const VISIBLE_CLASS = 'is-visible';
  const OPEN_CLASS = 'is-open';
  const CLOSING_CLASS = 'is-closing';
  const DRAGGING_CLASS = 'is-dragging';
  const APPLIED_ATTR = 'data-bf-applied';
  const JA_PATH_PATTERN = /^\/ja(\/|$)/;
  const MOBILE_QUERY = '(max-width: 767px)';
  const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
  const READY_POLL_INTERVAL = 250;
  const READY_POLL_LIMIT = 80;
  const AUTO_OPEN_DELAY = 1200;
  const BUSY_RETRY_DELAY = 1500;
  const RESIZE_DEBOUNCE = 150;
  const SWIPE_CLOSE_DISTANCE = 70;
  const TOP_CHROME_THRESHOLD = 120;
  const BAR_HEIGHT = { desktop: 40, mobile: 36 };
  const Z_INDEX = { bar: 997, popup: 9000 };
  const DURATION = { backdrop: 600, card: 900, close: 520 };
  const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const EASE_IN = 'cubic-bezier(0.7, 0, 0.84, 0)';
  const COLORS = { terra: '#B15A3D', wine: '#7A3036', cream: '#F5EFE1', ink: '#1E1C20', backdrop: 'rgba(20, 16, 18, 0.5)', rule: 'rgba(30, 28, 32, 0.12)' };
  const FONTS = { title: "Optima, 'Palatino Linotype', serif", text: 'ibm-plex-sans-jp, sans-serif' };
  const TRACK_EVENT = 'yokai_campaign';

  const SELECTORS = {
    loader: '.yokai-loader',
    heroWrappers: '.hero--content-container .hero--text-wrapper',
    heroHeading: ':scope > .heading-medium',
    heroTexts: ':scope > .small-text',
    heroButton: ':scope > .secondary--button',
    heroButtonShimmer: '.shimmer-overlay',
    heroButtonText: '.small-text',
    storesLink: '.nav-link[data-section="stores"]',
    storeSection: '#store',
    topChrome: ['.sticky-nav', '.cart-and-locale'],
    busy: '.popup-overlay.is-active, [data-cart-drawer].is-open',
    texture: '.news--lightbox-content',
    focusable: 'button, [href], [tabindex]:not([tabindex="-1"])'
  };

  const IMAGES = {
    visual: 'https://cdn.prod.website-files.com/694de20134d7a4afc6818bdd/6af15cc3e91084289f668130_yokai-bf2026-popup-kv.webp',
    solid: 'https://cdn.prod.website-files.com/694de20134d7a4afc6818bdd/6af15cc3c1534f81549f4953_yokai-bf2026-gift-solid.webp',
    small: 'https://cdn.prod.website-files.com/694de20134d7a4afc6818bdd/6af15cc3eb2678b37635b696_yokai-bf2026-gift-9ml.webp',
    large: 'https://cdn.prod.website-files.com/694de20134d7a4afc6818bdd/6af15cc37a181663661a867d_yokai-bf2026-gift-30ml.webp'
  };

  const COPY = {
    ja: {
      name: 'BLACK FRIDAY',
      dates: '11.11 – 11.30',
      barLine: '香水のご購入で、店舗限定ギフト',
      barMore: '詳しく見る',
      heroDate: '11.11 — 11.30',
      heroLine: '香水のご購入本数に応じて、<br>店舗限定のギフトをお贈りします。',
      heroGifts: 'ギフトを見る',
      heroStores: '店舗を探す',
      lead: '期間中、香水のご購入本数に応じて、店舗限定のギフトをお贈りします。',
      gifts: [
        { buy: '2本ご購入で', name: '練り香水', image: 'solid', compact: true },
        { buy: '3本ご購入で', name: '香水 9mL', image: 'small', compact: false },
        { buy: '5本ご購入で', name: '香水 30mL', image: 'large', compact: false }
      ],
      note: 'サイズを問わず対象・ギフトは重ねてお受け取りいただけます。<br>店舗限定（オンラインストアは対象外）・なくなり次第終了',
      cta: '店舗を探す',
      close: '閉じる'
    },
    en: {
      name: 'BLACK FRIDAY',
      dates: '11.11 – 11.30',
      barLine: 'Gifts with purchase, in store only',
      barMore: 'See the gifts',
      heroDate: '11.11 — 11.30',
      heroLine: 'Gifts with your perfume purchase,<br>in store only.',
      heroGifts: 'See the gifts',
      heroStores: 'Find a store',
      lead: 'Buy perfume at our stores and receive a gift, depending on how many you buy.',
      gifts: [
        { buy: 'Buy 2', name: 'Solid perfume', image: 'solid', compact: true },
        { buy: 'Buy 3', name: '9 mL perfume', image: 'small', compact: false },
        { buy: 'Buy 5', name: '30 mL perfume', image: 'large', compact: false }
      ],
      note: 'Any size counts. Gifts are cumulative.<br>In store only, not online. While supplies last.',
      cta: 'Find a store',
      close: 'Close'
    }
  };

  const copy = COPY[JA_PATH_PATTERN.test(window.location.pathname) ? 'ja' : 'en'];
  const mobile = window.matchMedia(MOBILE_QUERY);
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  const state = { open: false, returnFocus: null, dragStart: null, dragDistance: 0 };
  const refs = {};

  const css = `
    :root{--bf-bar-h:${BAR_HEIGHT.desktop}px}
    @media ${MOBILE_QUERY}{:root{--bf-bar-h:${BAR_HEIGHT.mobile}px}}
    .bf-bar{position:fixed;top:0;left:0;right:0;z-index:${Z_INDEX.bar};height:var(--bf-bar-h);background:${COLORS.wine};color:${COLORS.cream}}
    .bf-bar__inner{all:unset;box-sizing:border-box;width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:16px;padding:0 16px;cursor:pointer;font:400 11.5px/1 ${FONTS.text};letter-spacing:.12em;white-space:nowrap}
    .bf-bar__inner:focus-visible{outline:1px solid ${COLORS.cream};outline-offset:-5px}
    .bf-bar__name{font:400 14px/1 ${FONTS.title};letter-spacing:.2em}
    .bf-bar__sep{opacity:.45}
    .bf-bar__more{border-bottom:1px solid rgba(245,239,225,.55);padding-bottom:2px}
    @media ${MOBILE_QUERY}{.bf-bar__inner{gap:10px;font-size:10.5px}.bf-bar__name{font-size:12.5px}.bf-bar__wide{display:none}}
    html.${PENDING_CLASS} .hero--text-wrapper{visibility:hidden}
    .bf-hero-date{letter-spacing:.24em;margin-bottom:14px}
    .bf-hero-ctas{display:flex;flex-wrap:wrap;gap:24px}
    .bf-pop{position:fixed;inset:0;z-index:${Z_INDEX.popup};display:flex;align-items:center;justify-content:center;visibility:hidden;pointer-events:none}
    .bf-pop.${VISIBLE_CLASS}{visibility:visible}
    .bf-pop.${OPEN_CLASS}{pointer-events:auto}
    .bf-pop__backdrop{position:absolute;inset:0;background:${COLORS.backdrop};opacity:0;transition:opacity ${DURATION.backdrop}ms ${EASE_OUT}}
    .bf-pop.${OPEN_CLASS} .bf-pop__backdrop{opacity:1}
    .bf-pop__card{position:relative;display:grid;grid-template-columns:38% 1fr;width:min(880px,calc(100vw - 64px));max-height:calc(100vh - 64px);overflow:auto;overscroll-behavior:contain;background:${COLORS.cream} var(--bf-texture,none) center/cover;color:${COLORS.ink};opacity:0;transform:translateY(24px);transition:opacity ${DURATION.card}ms ${EASE_OUT},transform ${DURATION.card}ms ${EASE_OUT};outline:none}
    .bf-pop.${OPEN_CLASS} .bf-pop__card{opacity:1;transform:none}
    .bf-pop.${CLOSING_CLASS} .bf-pop__card,.bf-pop.${CLOSING_CLASS} .bf-pop__backdrop{transition-duration:${DURATION.close}ms;transition-timing-function:${EASE_IN}}
    .bf-pop.${DRAGGING_CLASS} .bf-pop__card{transition:none}
    .bf-pop__visual{position:relative;min-height:440px;overflow:hidden}
    .bf-pop__visual img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 46%}
    .bf-pop__body{display:flex;flex-direction:column;padding:52px 48px 44px}
    .bf-pop__date{font:400 11px/1 ${FONTS.text};letter-spacing:.24em;color:${COLORS.terra};margin:0 0 14px}
    .bf-pop__title{font:400 40px/1.05 ${FONTS.title};letter-spacing:.04em;color:${COLORS.terra};margin:0 0 16px}
    .bf-pop__lead{font:400 13px/1.9 ${FONTS.text};letter-spacing:.04em;margin:0 0 26px}
    .bf-pop__gifts{list-style:none;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:0 0 22px;padding:22px 0 0;border-top:1px solid ${COLORS.rule};text-align:center}
    .bf-pop__gift-img{height:88px;display:flex;align-items:flex-end;justify-content:center;margin-bottom:12px}
    .bf-pop__gift-img img{max-width:100%;max-height:100%;object-fit:contain;mix-blend-mode:multiply}
    .bf-pop__gift-img img.is-compact{max-height:58%}
    .bf-pop__gift-buy{display:block;font:400 10.5px/1.4 ${FONTS.text};letter-spacing:.12em;color:${COLORS.terra};margin-bottom:4px}
    .bf-pop__gift-name{display:block;font:400 14px/1.4 ${FONTS.title};color:${COLORS.ink}}
    .bf-pop__note{font:400 11px/1.9 ${FONTS.text};letter-spacing:.04em;opacity:.75;margin:0 0 26px}
    .bf-pop__cta{all:unset;box-sizing:border-box;align-self:flex-start;padding:16px 32px;background:${COLORS.ink};color:${COLORS.cream};font:400 12px/1 ${FONTS.text};letter-spacing:.16em;cursor:pointer;transition:opacity .3s}
    .bf-pop__cta:hover{opacity:.85}
    .bf-pop__cta:focus-visible{outline:1px solid ${COLORS.ink};outline-offset:3px}
    .bf-pop__close{all:unset;position:absolute;top:22px;right:20px;width:44px;height:28px;cursor:pointer;z-index:2}
    .bf-pop__close::before,.bf-pop__close::after{content:'';position:absolute;left:0;right:0;top:50%;height:1px;background:${COLORS.ink}}
    .bf-pop__close::before{transform:rotate(18deg)}
    .bf-pop__close::after{transform:rotate(-18deg)}
    .bf-pop__close:focus-visible{outline:1px solid ${COLORS.ink};outline-offset:4px}
    .bf-pop__handle{display:none}
    @media ${MOBILE_QUERY}{
      .bf-pop{align-items:flex-end}
      .bf-pop__card{grid-template-columns:1fr;width:100%;max-height:88vh;opacity:1;transform:translateY(100%)}
      .bf-pop__visual{min-height:0;height:168px}
      .bf-pop__body{padding:22px 20px 26px}
      .bf-pop__date{margin-bottom:10px}
      .bf-pop__title{font-size:30px;margin-bottom:10px}
      .bf-pop__lead{font-size:12.5px;line-height:1.8;margin-bottom:16px}
      .bf-pop__gifts{gap:8px;padding-top:16px;margin-bottom:16px}
      .bf-pop__gift-img{height:64px;margin-bottom:8px}
      .bf-pop__gift-name{font-size:13px}
      .bf-pop__note{font-size:10.5px;margin-bottom:18px}
      .bf-pop__cta{align-self:stretch;text-align:center}
      .bf-pop__close{top:14px;right:14px;width:36px}
      .bf-pop__close::before,.bf-pop__close::after{background:${COLORS.cream}}
      .bf-pop__close:focus-visible{outline-color:${COLORS.cream}}
      .bf-pop__handle{display:block;position:absolute;top:8px;left:50%;width:36px;height:3px;margin-left:-18px;background:rgba(245,239,225,.85);z-index:2}
    }
    @media ${REDUCED_MOTION_QUERY}{.bf-pop__card{transform:none!important;transition:opacity ${DURATION.backdrop}ms linear!important}}
  `;

  const track = (action, source) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: TRACK_EVENT, campaign: CAMPAIGN_ID, campaign_action: action, campaign_source: source });
  };

  const closedBefore = () => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch (error) {
      return false;
    }
  };

  const rememberClosed = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch (error) {
      return;
    }
  };

  const element = (tag, className, html) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  };

  const injectStyles = () => {
    document.head.appendChild(element('style', '', css));
  };

  const setLabel = (node, text) => {
    const label = node.querySelector(SELECTORS.heroButtonShimmer) || node.querySelector(SELECTORS.heroButtonText) || node;
    label.textContent = text;
  };

  const applyHeroCopy = () => {
    document.querySelectorAll(SELECTORS.heroWrappers).forEach((wrapper) => {
      if (wrapper.hasAttribute(APPLIED_ATTR)) return;
      wrapper.setAttribute(APPLIED_ATTR, '');
      const heading = wrapper.querySelector(SELECTORS.heroHeading);
      const [line, label] = wrapper.querySelectorAll(SELECTORS.heroTexts);
      const button = wrapper.querySelector(SELECTORS.heroButton);
      if (!heading || !line) return;
      const date = element('div', 'small-text bf-hero-date', copy.heroDate);
      heading.before(date);
      heading.textContent = copy.name;
      line.innerHTML = copy.heroLine;
      const primary = button || label;
      if (!primary) return;
      const secondary = primary.cloneNode(true);
      setLabel(primary, copy.heroGifts);
      setLabel(secondary, copy.heroStores);
      if (button) {
        primary.setAttribute('data-bf-open', 'hero');
        primary.removeAttribute('data-section');
        secondary.setAttribute('data-bf-stores', 'hero');
        secondary.removeAttribute('data-section');
      }
      const row = element('div', 'bf-hero-ctas');
      primary.before(row);
      row.append(primary, secondary);
    });
    document.documentElement.classList.remove(PENDING_CLASS);
  };

  const renderBar = () => {
    const bar = element('div', 'bf-bar');
    bar.innerHTML = `<button type="button" class="bf-bar__inner" data-bf-open="bar"><span class="bf-bar__name">${copy.name}</span><span class="bf-bar__sep" aria-hidden="true">|</span><span>${copy.dates}</span><span class="bf-bar__sep bf-bar__wide" aria-hidden="true">|</span><span class="bf-bar__wide">${copy.barLine}</span><span class="bf-bar__more">${copy.barMore}</span></button>`;
    document.body.appendChild(bar);
    refs.bar = bar;
  };

  const renderPopup = () => {
    const gifts = copy.gifts.map((gift) => `<li><div class="bf-pop__gift-img"><img src="${IMAGES[gift.image]}" alt="" decoding="async"${gift.compact ? ' class="is-compact"' : ''}></div><span class="bf-pop__gift-buy">${gift.buy}</span><span class="bf-pop__gift-name">${gift.name}</span></li>`).join('');
    const popup = element('div', 'bf-pop');
    popup.setAttribute('aria-hidden', 'true');
    popup.innerHTML = `<div class="bf-pop__backdrop" data-bf-close="backdrop"></div><div class="bf-pop__card" role="dialog" aria-modal="true" aria-labelledby="bf-pop-title" tabindex="-1" data-lenis-prevent><span class="bf-pop__handle" aria-hidden="true"></span><button type="button" class="bf-pop__close" data-bf-close="button" aria-label="${copy.close}"></button><div class="bf-pop__visual"><img src="${IMAGES.visual}" alt="" decoding="async"></div><div class="bf-pop__body"><p class="bf-pop__date">${copy.dates}</p><h2 class="bf-pop__title" id="bf-pop-title">${copy.name}</h2><p class="bf-pop__lead">${copy.lead}</p><ul class="bf-pop__gifts">${gifts}</ul><p class="bf-pop__note">${copy.note}</p><button type="button" class="bf-pop__cta" data-bf-stores="popup">${copy.cta}</button></div></div>`;
    const texture = document.querySelector(SELECTORS.texture);
    const textureImage = texture ? window.getComputedStyle(texture).backgroundImage : 'none';
    if (textureImage && textureImage !== 'none') popup.style.setProperty('--bf-texture', textureImage);
    document.body.appendChild(popup);
    refs.popup = popup;
    refs.card = popup.querySelector('.bf-pop__card');
  };

  const barHeight = () => (mobile.matches ? BAR_HEIGHT.mobile : BAR_HEIGHT.desktop);

  const offsetTopChrome = () => {
    SELECTORS.topChrome.forEach((selector) => {
      document.querySelectorAll(selector).forEach((node) => {
        node.style.removeProperty('top');
        const top = parseFloat(window.getComputedStyle(node).top);
        if (Number.isFinite(top) && top < TOP_CHROME_THRESHOLD) node.style.setProperty('top', `${top + barHeight()}px`, 'important');
      });
    });
  };

  const lockScroll = (locked) => {
    if (typeof window.SScroll === 'undefined') return;
    if (locked) window.SScroll.stop();
    else window.SScroll.start();
  };

  const focusables = () => [...refs.card.querySelectorAll(SELECTORS.focusable)];

  const open = (source) => {
    if (state.open) return;
    state.open = true;
    state.returnFocus = document.activeElement;
    refs.popup.classList.remove(CLOSING_CLASS);
    refs.popup.classList.add(VISIBLE_CLASS);
    refs.popup.setAttribute('aria-hidden', 'false');
    refs.card.getBoundingClientRect();
    window.requestAnimationFrame(() => refs.popup.classList.add(OPEN_CLASS));
    lockScroll(true);
    refs.card.focus({ preventScroll: true });
    track('popup_open', source);
  };

  const close = (source, after) => {
    if (!state.open) return;
    state.open = false;
    rememberClosed();
    refs.popup.classList.add(CLOSING_CLASS);
    refs.popup.classList.remove(OPEN_CLASS);
    refs.popup.setAttribute('aria-hidden', 'true');
    refs.card.style.removeProperty('transform');
    track('popup_close', source);
    window.setTimeout(() => {
      refs.popup.classList.remove(VISIBLE_CLASS, CLOSING_CLASS);
      lockScroll(false);
      if (state.returnFocus && state.returnFocus.focus) state.returnFocus.focus({ preventScroll: true });
      if (after) after();
    }, reducedMotion.matches ? DURATION.backdrop : DURATION.close);
  };

  const goToStores = (source) => {
    track('find_store', source);
    const link = document.querySelector(SELECTORS.storesLink);
    if (link) {
      link.click();
      return;
    }
    const target = document.querySelector(SELECTORS.storeSection);
    if (!target) return;
    if (typeof window.SScroll !== 'undefined') window.SScroll.scrollTo(target);
    else target.scrollIntoView({ behavior: 'smooth' });
  };

  const onClick = (event) => {
    const opener = event.target.closest('[data-bf-open]');
    const stores = event.target.closest('[data-bf-stores]');
    const closer = event.target.closest('[data-bf-close]');
    if (!opener && !stores && !closer) return;
    event.preventDefault();
    event.stopPropagation();
    if (opener) open(opener.getAttribute('data-bf-open'));
    else if (closer) close(closer.getAttribute('data-bf-close'));
    else if (state.open) close('find_store', () => goToStores(stores.getAttribute('data-bf-stores')));
    else goToStores(stores.getAttribute('data-bf-stores'));
  };

  const onKeydown = (event) => {
    if (!state.open) return;
    if (event.key === 'Escape') {
      close('escape');
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === refs.card)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const onTouchStart = (event) => {
    if (!mobile.matches || !state.open || refs.card.scrollTop > 0) return;
    state.dragStart = event.touches[0].clientY;
    state.dragDistance = 0;
  };

  const onTouchMove = (event) => {
    if (state.dragStart === null) return;
    state.dragDistance = Math.max(0, event.touches[0].clientY - state.dragStart);
    if (!state.dragDistance) return;
    refs.popup.classList.add(DRAGGING_CLASS);
    refs.card.style.setProperty('transform', `translateY(${state.dragDistance}px)`);
  };

  const onTouchEnd = () => {
    if (state.dragStart === null) return;
    const distance = state.dragDistance;
    state.dragStart = null;
    state.dragDistance = 0;
    refs.popup.classList.remove(DRAGGING_CLASS);
    if (distance > SWIPE_CLOSE_DISTANCE) close('swipe');
    else refs.card.style.removeProperty('transform');
  };

  const pageReady = () => {
    const loader = document.querySelector(SELECTORS.loader);
    const loaderDone = !loader || window.getComputedStyle(loader).display === 'none';
    return loaderDone && !document.documentElement.classList.contains(LOADING_CLASS);
  };

  const whenPageReady = (callback, attempt = 0) => {
    if (pageReady() || attempt >= READY_POLL_LIMIT) {
      callback();
      return;
    }
    window.setTimeout(() => whenPageReady(callback, attempt + 1), READY_POLL_INTERVAL);
  };

  const tryAutoOpen = () => {
    if (state.open) return;
    if (document.querySelector(SELECTORS.busy)) {
      window.setTimeout(tryAutoOpen, BUSY_RETRY_DELAY);
      return;
    }
    open(window.location.hash === FORCE_OPEN_HASH ? 'link' : 'auto');
  };

  const preloadImages = () => {
    Object.values(IMAGES).forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  };

  const debounce = (callback, wait) => {
    let timer = null;
    return () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(callback, wait);
    };
  };

  const start = () => {
    injectStyles();
    applyHeroCopy();
    renderBar();
    renderPopup();
    preloadImages();
    offsetTopChrome();
    window.addEventListener('resize', debounce(offsetTopChrome, RESIZE_DEBOUNCE));
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeydown);
    refs.card.addEventListener('touchstart', onTouchStart, { passive: true });
    refs.card.addEventListener('touchmove', onTouchMove, { passive: true });
    refs.card.addEventListener('touchend', onTouchEnd);
    if (window.location.hash === FORCE_OPEN_HASH || !closedBefore()) whenPageReady(() => window.setTimeout(tryAutoOpen, AUTO_OPEN_DELAY));
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
