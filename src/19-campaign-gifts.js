(() => {
  const PREVIEW_HOST_PATTERN = /\.webflow\.io$/;
  const PREVIEW = PREVIEW_HOST_PATTERN.test(window.location.hostname);

  const STOREFRONT = { endpoint: 'https://yokai-sake.myshopify.com/api/2025-01/graphql.json', token: '1432a4269f2a938b1e58ab4c6b49138a' };
  const CART_KEY = 'yokai_cart_id';
  const STORE_KEY = 'yokai_bf2026_gifts';
  const GIFT_ATTRIBUTE = '_yokai_gift';
  const OVERVIEW_KEY = 'overview';
  const PAID_SKU_PATTERN = /^PF\d+/;
  const TITLE_PREFIX_PATTERN = /^YOKAI Perfume\s*-\s*/i;
  const LINE_ID_PATTERN = /Cart\.remove\('([^']+)'\)/;
  const JA_PATH_PATTERN = /^\/ja(\/|$)/;
  const NON_NUMERIC_PATTERN = /[^\d.-]/g;
  const ESCAPE_PATTERN = /[&<>"']/g;
  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const GIFT_TAG = 'bf2026-gift';
  const GIFT_SKU_PREFIX = 'GIFT-';
  const GIFT_TITLE_PATTERN = /\s*\(Gift\)\s*$/i;
  const DEFAULT_VARIANT_TITLE = 'Default Title';
  const CATALOG_LIMIT = 30;
  const MAX_ROUNDS = 6;
  const HOST_POLL_INTERVAL = 250;
  const HOST_POLL_LIMIT = 80;
  const HOST_RENDER_TIMEOUT = 5000;
  const REQUEST_TIMEOUT = 10000;
  const RETRY = { limit: 3, delay: 3000 };
  const CATALOG_RETRY = { limit: 3, delay: 2000 };
  const CAMPAIGN_END = Date.parse('2026-12-25T23:59:59+09:00');
  const THUMB_WIDTH = 240;
  const CLOSE_CLEARANCE = 72;
  const POINT_SIZE = 22;
  const TRACK_HEIGHT = 3;
  const LABEL_WIDTH = 60;
  const ICON_SIZE = 12;
  const MARK_SIZE = 16;
  const OPTION_IMAGE = { width: 44, height: 55 };
  const OPTION_COLUMNS = 2;
  const OPTION_GAP = 32;
  const FADE_HEIGHT = 32;
  const LINE_IMAGE_HEIGHT = 160;
  const MOBILE_QUERY = '(max-width: 767px)';
  const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
  const Z_INDEX = { popup: 10010 };
  const CARD_WIDTH = { notice: 520, choice: 760 };
  const TRACK_ACTIONS = { unlock: 'gift_unlock', choose: 'gift_choose', view: 'gift_view' };
  const DURATION = { backdrop: 600, card: 700, close: 420 };
  const NODE_CLASS = 'bfg-node';
  const LINE_CLASS = 'bfg-line';
  const OFF_CLASS = 'bfg-off';
  const DONE_CLASS = 'is-done';
  const BUSY_CLASS = 'is-busy';
  const CURRENT_CLASS = 'is-current';
  const LAST_CLASS = 'is-last';
  const MUTED_CLASS = 'is-muted';
  const VISIBLE_CLASS = 'is-visible';
  const OPEN_CLASS = 'is-open';
  const CHOICE_CLASS = 'bfg-pop--choice';
  const SITE_CLOSE_CLASS = 'close-svg';
  const SITE_CLOSE_ICON_CLASS = 'close-x';
  const ACTIVATE_KEYS = ['Enter', ' '];
  const ARROW_STEPS = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
  const MODES = { unlock: 'unlock', choose: 'choose' };
  const SOURCES = { bar: 'bar', line: 'line' };
  const LOG_LABEL = '[yokai-gifts]';
  const REQUEST_ERROR = 'storefront request failed';
  const CATALOG_ERROR = 'gift catalog is empty';
  const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const EASE_IN = 'cubic-bezier(0.7, 0, 0.84, 0)';
  const COLORS = { terra: '#A5512F', ink: '#1F1D21', cream: '#F5EFE1', track: 'rgba(31, 29, 33, 0.15)', hover: 'rgba(31, 29, 33, 0.35)', wash: 'rgba(31, 29, 33, 0.05)', backdrop: 'rgba(20, 16, 18, 0.5)' };
  const FONTS = { title: "Optima, 'Palatino Linotype', sans-serif", text: 'ibm-plex-sans-jp, sans-serif' };
  const GIFT_IMAGES = {
    solid: 'https://cdn.prod.website-files.com/694de20134d7a4afc6818bdd/6af16afa84e7ff9e17c2e41b_yokai-bf2026-gift-solid-alpha.webp',
    small: 'https://cdn.prod.website-files.com/694de20134d7a4afc6818bdd/6af16afa434edee758053e8e_yokai-bf2026-gift-9ml-alpha.webp',
    large: 'https://cdn.prod.website-files.com/694de20134d7a4afc6818bdd/6af16afa84e7ff9e17c2e3fe_yokai-bf2026-gift-30ml-alpha.webp'
  };
  const GIFT_ICON = `<svg class="bfg-point__icon" viewBox="0 0 12 12" width="${ICON_SIZE}" height="${ICON_SIZE}" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.6 5.4h8.8v5H1.6zM1 3.6h10v1.8H1zM6 3.6v6.8M6 3.6C5.4 1.9 3.5 1.6 3.3 2.6 3.1 3.5 4.6 3.7 6 3.6ZM6 3.6c.6-1.7 2.5-2 2.7-1 .2.9-1.3 1.1-2.7 1Z"/></svg>`;

  const TIERS = [
    { key: 'solid', buy: 2, skuPattern: /^SP001$/, choice: false },
    { key: 'small', buy: 3, skuPattern: /^GIFT-PF\d+-9$/, choice: true },
    { key: 'large', buy: 5, skuPattern: /^GIFT-PF\d+-30$/, choice: true }
  ];

  const SELECTORS = {
    shipping: '.shipping-progress',
    shippingGoal: '[data-shipping-goal]',
    list: '[data-cart-lines]',
    total: '[data-cart-total]',
    line: '.cart-line',
    lineTitle: '.cart-line-title',
    lineStyle: '.cart-line-purfume-style',
    lineImage: '.cart-line-img',
    lineVariant: '.cart-line-variant',
    lineSeparator: '.cart-line-variant-sep',
    lineRemove: '.cart-line-remove',
    lineQuantity: '.cart-line-qty-selector span',
    lineSku: '.cart-line-variant span:last-child',
    linePrice: '.cart-line-price',
    lineControls: '.cart-line-qty',
    product: '[data-shopify-handle]',
    texture: '.news--lightbox-content',
    focusable: 'button:not([disabled]):not([tabindex="-1"]), [href], [tabindex]:not([tabindex="-1"])',
    action: '[data-bfg-pick], [data-bfg-choose], [data-bfg-open], [data-bfg-overview], [data-bfg-close]',
    options: '.bfg-options',
    option: '.bfg-option',
    confirm: '.bfg-pop__cta[data-bfg-choose]'
  };

  const COPY = {
    en: {
      begin: (count, gift) => `Buy ${count} perfumes for a free ${gift}`,
      more: (count, gift) => `${count} more ${count === 1 ? 'perfume' : 'perfumes'} for a free ${gift}`,
      complete: "You've got all the gifts",
      rail: { solid: ['Solid', 'perfume'], small: ['9 mL', 'perfume'], large: ['30 mL', 'perfume'] },
      names: { solid: 'Solid perfume', small: '9 mL perfume', large: '30 mL perfume' },
      inline: { solid: 'solid perfume', small: '9 mL perfume', large: '30 mL perfume' },
      choose: { small: 'Choose your free 9 mL perfume', large: 'Choose your free 30 mL perfume' },
      unlocked: { solid: "You've unlocked a free solid perfume", small: "You've unlocked a free 9 mL perfume", large: "You've unlocked a free 30 mL perfume" },
      added: "We've added it to your cart",
      pending: 'Choose your scent',
      style: 'EAU DE PARFUM',
      gift: 'Gift',
      free: 'Free',
      pick: 'CHOOSE SCENT',
      change: 'CHANGE',
      confirm: 'Add to cart',
      update: 'Update gift',
      later: 'Choose later',
      proceed: 'Continue',
      close: 'Close',
      overview: 'Black Friday gifts',
      rule: (buy) => `Free when you buy ${buy} perfumes`,
      remaining: (count) => `${count} more ${count === 1 ? 'perfume' : 'perfumes'}`,
      inCart: 'In your cart',
      terms: 'Any size counts. Gifts are cumulative. One set of gifts per order, while supplies last.',
      solidDetail: 'Sandalwood, 8 g',
      see: 'See the gifts',
      solidNote: 'Preview: no stock at the online shipping location yet.'
    },
    ja: {
      begin: (count, gift) => `香水${count}本で、${gift}をプレゼント`,
      more: (count, gift) => `あと${count}本で、${gift}をプレゼント`,
      complete: 'すべてのギフトをお贈りします',
      rail: { solid: ['練り香水'], small: ['香水 9mL'], large: ['香水 30mL'] },
      names: { solid: '練り香水', small: '香水 9mL', large: '香水 30mL' },
      inline: { solid: '練り香水', small: '香水 9mL', large: '香水 30mL' },
      choose: { small: 'ギフトの香水 9mLを選ぶ', large: 'ギフトの香水 30mLを選ぶ' },
      unlocked: { solid: '練り香水をプレゼント', small: '香水 9mLをプレゼント', large: '香水 30mLをプレゼント' },
      added: 'カートに追加しました',
      pending: '香りをお選びください',
      style: 'EAU DE PARFUM',
      gift: 'ギフト',
      free: '無料',
      pick: '香りを選ぶ',
      change: '変更',
      confirm: 'カートに入れる',
      update: 'ギフトを変更',
      later: 'あとで選ぶ',
      proceed: 'お買い物を続ける',
      close: '閉じる',
      overview: 'ブラックフライデー ギフト',
      rule: (buy) => `香水${buy}本のご購入でプレゼント`,
      remaining: (count) => `香水あと${count}本`,
      inCart: 'カートに追加済み',
      terms: 'サイズを問わず対象です。ギフトは重ねてお受け取りいただけます。1回のご注文につき1セット、なくなり次第終了です。',
      solidDetail: '白檀 8g',
      see: 'ギフトを見る',
      solidNote: 'プレビュー：オンライン出荷拠点に在庫がありません。'
    }
  };

  const CART_FIELDS = 'id lines(first: 50) { edges { node { id quantity attributes { key value } cost { totalAmount { amount } } merchandise { ... on ProductVariant { id sku } } } } }';

  const QUERIES = {
    cart: `query($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`,
    add: `mutation($id: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $id, lines: $lines) { cart { ${CART_FIELDS} } } }`,
    update: `mutation($id: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $id, lines: $lines) { cart { ${CART_FIELDS} } } }`,
    remove: `mutation($id: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $id, lineIds: $lineIds) { cart { ${CART_FIELDS} } } }`,
    gifts: `query($query: String!) { products(first: ${CATALOG_LIMIT}, query: $query) { edges { node { title variants(first: 10) { edges { node { id sku availableForSale price { amount } image { url } } } } } } } }`
  };

  const copy = COPY[JA_PATH_PATTERN.test(window.location.pathname) ? 'ja' : 'en'];
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  const state = { ready: false, busy: false, lines: [], gifts: {}, charged: [], blocked: new Set(), catalog: { solid: null, small: [], large: [] }, signature: '', snapshotPaid: 0, failed: new Set(), loading: '', hostTotal: 0, lastPaid: null, queue: [], popup: null, pick: '', returnFocus: null, scrollLocked: false, resumeScroll: false, messageHtml: '', retries: 0, waiters: [] };
  const refs = {};

  const css = `
    .shipping-progress.${OFF_CLASS}{position:absolute;visibility:hidden;pointer-events:none}
    .bfg-progress{position:relative;z-index:2}
    .bfg-progress::after{content:'';position:absolute;top:100%;left:0;width:100%;height:1.5rem;background:${COLORS.cream};z-index:1;pointer-events:none}
    .bfg-progress__head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:0 16px}
    .bfg-progress__msg{margin:0;font-size:14px;line-height:20px}
    .bfg-progress__ship{margin:0;font-size:12px;line-height:20px;opacity:.6}
    .bfg-progress__link{all:unset;cursor:pointer;color:${COLORS.terra};border-bottom:1px solid currentColor}
    .bfg-progress__link:focus-visible{outline:1px solid ${COLORS.ink};outline-offset:3px}
    .bfg-bar{position:relative;height:${POINT_SIZE}px;margin:10px ${POINT_SIZE / 2}px 26px 0;cursor:pointer;outline:none}
    .bfg-bar:focus-visible{outline:1px solid ${COLORS.ink};outline-offset:6px}
    .bfg-points{margin:0;padding:0;list-style:none}
    .bfg-bar__track,.bfg-bar__fill{position:absolute;top:50%;left:0;height:${TRACK_HEIGHT}px;margin-top:-${TRACK_HEIGHT / 2}px}
    .bfg-bar__track{right:0;background:${COLORS.track}}
    .bfg-bar__fill{width:0;background:${COLORS.ink};transition:width .7s ${EASE_OUT}}
    .bfg-point{position:absolute;top:0;box-sizing:border-box;display:flex;align-items:center;justify-content:center;width:${POINT_SIZE}px;height:${POINT_SIZE}px;margin:0 0 0 -${POINT_SIZE / 2}px;padding:0;border:1px solid ${COLORS.hover};border-radius:50%;background:${COLORS.cream};color:${COLORS.ink};transition:background-color .4s .25s,border-color .4s .25s,color .4s .25s}
    .bfg-point.${DONE_CLASS}{border-color:${COLORS.ink};background:${COLORS.ink};color:${COLORS.cream}}
    .bfg-point__icon{display:block;flex:none;opacity:.6;transition:opacity .4s .25s}
    .bfg-point.${DONE_CLASS} .bfg-point__icon{opacity:1}
    .bfg-point__label{position:absolute;top:${POINT_SIZE + 6}px;left:50%;transform:translateX(-50%);white-space:nowrap;font:400 12px/1.3 ${FONTS.text};color:${COLORS.ink};opacity:.55;transition:opacity .4s .25s}
    .bfg-point.${DONE_CLASS} .bfg-point__label{opacity:1}
    .bfg-point[hidden]{display:none}
    .bfg-point.${LAST_CLASS} .bfg-point__label{left:auto;right:0;transform:none;text-align:right}
    .cart-line.${LINE_CLASS}{cursor:pointer}
    .${LINE_CLASS} .cart-line-price{white-space:nowrap;padding-left:.75rem}
    .${LINE_CLASS} .bfg-gift-img{min-height:${LINE_IMAGE_HEIGHT}px;object-fit:contain;padding:22px;box-sizing:border-box;background:${COLORS.wash}}
    .${LINE_CLASS}.${BUSY_CLASS}{opacity:.45;pointer-events:none}
    .bfg-was{margin-right:.6em;opacity:.5}
    .bfg-free{color:${COLORS.terra}}
    .bfg-tag{font-size:14px;opacity:.6}
    .bfg-options{display:flex;align-items:flex-start;gap:0 ${OPTION_GAP}px;min-height:0;margin:0;padding:0 0 ${FADE_HEIGHT}px;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;-webkit-mask-image:linear-gradient(#000 calc(100% - ${FADE_HEIGHT}px),transparent);mask-image:linear-gradient(#000 calc(100% - ${FADE_HEIGHT}px),transparent)}
    .bfg-options__col{flex:1 1 0;min-width:0;border-top:1px solid ${COLORS.track}}
    .bfg-option{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:14px;width:100%;padding:10px 4px 10px 0;border-bottom:1px solid ${COLORS.track};cursor:pointer}
    .bfg-option:focus-visible{outline:1px solid ${COLORS.ink};outline-offset:-1px}
    .bfg-option img{flex:none;width:${OPTION_IMAGE.width}px;height:${OPTION_IMAGE.height}px;object-fit:cover}
    .bfg-option__text{flex:1;min-width:0}
    .bfg-option__name{display:block;font:400 16px/1.3 ${FONTS.title}}
    .bfg-option__family{display:block;margin-top:2px;font:400 11.5px/1.5 ${FONTS.text};letter-spacing:.06em;opacity:.6}
    .bfg-option__mark{flex:none;position:relative;box-sizing:border-box;width:${MARK_SIZE}px;height:${MARK_SIZE}px;border:1px solid ${COLORS.hover};border-radius:50%;transition:border-color .3s}
    .bfg-option__mark::after{content:'';position:absolute;inset:3px;border-radius:50%;background:${COLORS.ink};transform:scale(0);transition:transform .3s ${EASE_OUT}}
    .bfg-option:hover .bfg-option__mark,.bfg-option.${CURRENT_CLASS} .bfg-option__mark{border-color:${COLORS.ink}}
    .bfg-option.${CURRENT_CLASS} .bfg-option__mark::after{transform:scale(1)}
    .bfg-pop.${CHOICE_CLASS} .bfg-pop__scroll{display:flex;flex-direction:column;overflow:hidden}
    .bfg-pop.${CHOICE_CLASS} .bfg-pop__title,.bfg-pop.${CHOICE_CLASS} .bfg-pop__actions{flex:none}
    .bfg-gifts{list-style:none;margin:0 0 18px;padding:0;border-top:1px solid ${COLORS.track}}
    .bfg-gift{display:flex;align-items:center;gap:16px;margin:0;padding:14px 0;border-bottom:1px solid ${COLORS.track}}
    .bfg-gift__img{flex:none;width:56px;height:56px;object-fit:contain}
    .bfg-gift__text{flex:1;min-width:0}
    .bfg-gift__name{display:block;font:400 16px/1.3 ${FONTS.title}}
    .bfg-gift__rule{display:block;margin-top:2px;font:400 12px/1.5 ${FONTS.text};opacity:.6}
    .bfg-gift__state{flex:none;max-width:46%;font:400 12px/1.5 ${FONTS.text};text-align:right}
    .bfg-gift__state.${MUTED_CLASS}{opacity:.6}
    .bfg-gift__value{margin-right:10px}
    .bfg-gift__action{all:unset;border-bottom:1px solid currentColor;color:${COLORS.terra};font:400 12px/1.4 ${FONTS.text};letter-spacing:.08em;cursor:pointer}
    .bfg-gift__action:focus-visible{outline:1px solid ${COLORS.ink};outline-offset:3px}
    .bfg-pop__note{margin:0 0 22px;font:400 11px/1.8 ${FONTS.text};letter-spacing:.04em;opacity:.7}
    .bfg-pop{--bfg-card-width:${CARD_WIDTH.notice}px;position:fixed;inset:0;z-index:${Z_INDEX.popup};display:flex;align-items:center;justify-content:center;visibility:hidden;pointer-events:none}
    .bfg-pop.${VISIBLE_CLASS}{visibility:visible}
    .bfg-pop.${OPEN_CLASS}{pointer-events:auto}
    .bfg-pop__backdrop{position:absolute;inset:0;background:${COLORS.backdrop};opacity:0;touch-action:none;transition:opacity ${DURATION.backdrop}ms ${EASE_OUT}}
    .bfg-pop.${OPEN_CLASS} .bfg-pop__backdrop{opacity:1}
    .bfg-pop__card{position:relative;display:flex;width:min(var(--bfg-card-width),calc(100vw - 48px));max-height:calc(100vh - 64px);max-height:calc(100dvh - 64px);background:${COLORS.cream} var(--bfg-texture,none) center/cover;color:${COLORS.ink};opacity:0;transform:translateY(24px);transition:opacity ${DURATION.card}ms ${EASE_OUT},transform ${DURATION.card}ms ${EASE_OUT};outline:none}
    .bfg-pop.${CHOICE_CLASS}{--bfg-card-width:${CARD_WIDTH.choice}px}
    .bfg-pop.${OPEN_CLASS} .bfg-pop__card{opacity:1;transform:none}
    .bfg-pop:not(.${OPEN_CLASS}) .bfg-pop__card,.bfg-pop:not(.${OPEN_CLASS}) .bfg-pop__backdrop{transition-duration:${DURATION.close}ms;transition-timing-function:${EASE_IN}}
    .bfg-pop__scroll{box-sizing:border-box;width:100%;padding:44px 40px 36px;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
    .bfg-pop__title{margin:0 0 14px;padding-right:${CLOSE_CLEARANCE}px;font:400 26px/1.2 ${FONTS.title};letter-spacing:.02em;color:${COLORS.ink}}
    .bfg-pop__title,.bfg-pop__lead,.bfg-pop__note{word-break:keep-all;overflow-wrap:anywhere}
    .bfg-pop__lead{margin:0 0 20px;font:400 13px/1.8 ${FONTS.text};letter-spacing:.04em}
    .bfg-pop__gift{display:flex;align-items:center;gap:20px;margin:0 0 26px}
    .bfg-pop__gift img{flex:none;width:88px;height:88px;object-fit:contain}
    .bfg-pop__gift .bfg-pop__lead{margin:0}
    .bfg-pop__actions{display:flex;align-items:center;gap:24px}
    .bfg-pop__cta{all:unset;box-sizing:border-box;padding:16px 32px;background:${COLORS.ink};color:${COLORS.cream};font:400 12px/1 ${FONTS.text};letter-spacing:.16em;text-align:center;cursor:pointer;transition:opacity .3s}
    .bfg-pop__cta:hover{opacity:.85}
    .bfg-pop__cta[disabled]{opacity:.3;cursor:default}
    .bfg-pop__later{all:unset;padding-bottom:3px;border-bottom:1px solid currentColor;font:400 12px/1 ${FONTS.text};letter-spacing:.12em;opacity:.7;cursor:pointer}
    .bfg-pop__cta:focus-visible,.bfg-pop__later:focus-visible{outline:1px solid ${COLORS.ink};outline-offset:3px}
    .bfg-pop__close:focus-visible{outline:1px solid ${COLORS.ink};outline-offset:-8px}
    @media ${MOBILE_QUERY}{
      .bfg-bar{margin-bottom:38px}
      .bfg-point__label{width:${LABEL_WIDTH}px;white-space:normal;font-size:11px;text-align:center}
      .bfg-point__wrap{display:block}
      .bfg-options{display:block;margin:0 -20px;padding-left:20px;padding-right:20px}
      .bfg-options__col + .bfg-options__col{border-top:0}
      .bfg-pop.${CHOICE_CLASS} .bfg-pop__actions{flex-direction:column;align-items:stretch;gap:6px}
      .bfg-pop.${CHOICE_CLASS} .bfg-pop__cta{flex:none}
      .bfg-pop.${CHOICE_CLASS} .bfg-pop__later{align-self:center;padding:10px 4px 3px}
      .bfg-pop{align-items:flex-end}
      .bfg-pop .bfg-pop__card{width:100%;max-height:90vh;max-height:90dvh;opacity:1;transform:translateY(100%)}
      .bfg-pop.${OPEN_CLASS} .bfg-pop__card{transform:none}
      .bfg-pop__scroll{padding:28px 20px calc(22px + env(safe-area-inset-bottom))}
      .bfg-pop__title{margin-bottom:10px;font-size:22px}
      .bfg-pop__lead{margin-bottom:14px}
      .bfg-pop__gift img{width:72px;height:72px}
      .bfg-pop__actions{gap:20px}
      .bfg-pop__cta{flex:1}
      .bfg-gift{gap:12px}
      .bfg-gift__img{width:48px;height:48px}
    }
    @media ${REDUCED_MOTION_QUERY}{.bfg-pop__card{transform:none!important;transition:opacity ${DURATION.backdrop}ms linear!important}}
  `;

  const yen = (value) => `¥${Math.round(Number(value)).toLocaleString('en-US')}`;

  const parseYen = (text) => Number(String(text || '').replace(NON_NUMERIC_PATTERN, '')) || 0;

  const escapeHtml = (text) => String(text).replace(ESCAPE_PATTERN, (char) => ESCAPES[char]);

  const thumb = (url) => (url ? `${url}${url.includes('?') ? '&' : '?'}width=${THUMB_WIDTH}` : '');

  const element = (tag, className, html) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  };

  const request = (query, variables) => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    return window.fetch(STOREFRONT.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': STOREFRONT.token },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal
    }).then((response) => response.json()).then((payload) => {
      if (!payload.data) throw new Error(REQUEST_ERROR);
      return payload.data;
    }).finally(() => window.clearTimeout(timer));
  };

  const cartId = () => window.localStorage.getItem(CART_KEY);

  const readStore = () => {
    const fresh = { cart: cartId() || '', choices: {}, seen: [] };
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORE_KEY));
      return saved && saved.cart === fresh.cart ? { ...fresh, ...saved } : fresh;
    } catch (error) {
      return fresh;
    }
  };

  const writeStore = (patch) => {
    window.localStorage.setItem(STORE_KEY, JSON.stringify({ ...readStore(), ...patch }));
  };

  const setChoice = (key, variantId) => {
    const choices = { ...readStore().choices };
    if (variantId) choices[key] = variantId;
    else delete choices[key];
    writeStore({ choices });
  };

  const markSeen = (key) => {
    writeStore({ seen: [...new Set([...readStore().seen, key])] });
  };

  const tierOf = (key) => TIERS.find((tier) => tier.key === key);

  const track = (action, source) => {
    if (window.YokaiCampaign && window.YokaiCampaign.track) window.YokaiCampaign.track(action, source);
  };

  const giftAttributes = (key) => [{ key: GIFT_ATTRIBUTE, value: key }];

  const signatureOf = (items) => items.map((item) => `${item.id}:${item.quantity}`).sort().join('|');

  const snapshotGifts = (cart) => {
    const gifts = [];
    if (!cart) return gifts;
    cart.lines.edges.forEach(({ node }) => {
      const attribute = node.attributes.find((item) => item.key === GIFT_ATTRIBUTE);
      if (attribute) gifts.push({ lineId: node.id, key: attribute.value, variantId: node.merchandise.id, sku: node.merchandise.sku || '', quantity: node.quantity, charged: Number(node.cost.totalAmount.amount) > 0 });
    });
    return gifts;
  };

  const adopt = (cart) => {
    const nodes = cart ? cart.lines.edges.map(({ node }) => node) : [];
    const gifts = snapshotGifts(cart);
    const units = {};
    gifts.forEach((gift) => {
      units[gift.key] = (units[gift.key] || 0) + gift.quantity;
    });
    state.gifts = {};
    state.charged = [];
    gifts.forEach((gift) => {
      state.gifts[gift.lineId] = gift.key;
      const tier = tierOf(gift.key);
      if (gift.charged && tier && tier.skuPattern.test(gift.sku) && units[gift.key] === 1) state.charged.push(gift.key);
    });
    state.signature = signatureOf(nodes);
    state.snapshotPaid = nodes.filter((node) => !state.gifts[node.id] && PAID_SKU_PATTERN.test(node.merchandise.sku || '')).reduce((sum, node) => sum + node.quantity, 0);
  };

  const block = () => {
    state.charged.filter((key) => tierOf(key) && state.snapshotPaid >= tierOf(key).buy).forEach((key) => state.blocked.add(key));
  };

  const readLines = () => [...refs.list.querySelectorAll(SELECTORS.line)].map((node) => {
    const remove = node.querySelector(SELECTORS.lineRemove);
    const match = LINE_ID_PATTERN.exec((remove && remove.getAttribute('onclick')) || '');
    const title = node.querySelector(SELECTORS.lineTitle);
    const quantity = node.querySelector(SELECTORS.lineQuantity);
    const sku = node.querySelector(SELECTORS.lineSku);
    const price = node.querySelector(SELECTORS.linePrice);
    return {
      el: node,
      html: node.innerHTML,
      className: node.className,
      id: match ? match[1] : '',
      name: title ? title.textContent.replace(TITLE_PREFIX_PATTERN, '').replace(GIFT_TITLE_PATTERN, '').trim() : '',
      quantity: Number(quantity && quantity.textContent) || 1,
      sku: sku ? sku.textContent.trim() : '',
      price: parseYen(price && price.textContent)
    };
  }).filter((line) => line.id);

  const paidCount = () => state.lines.filter((line) => !state.gifts[line.id] && PAID_SKU_PATTERN.test(line.sku)).reduce((sum, line) => sum + line.quantity, 0);

  const validGift = (line) => {
    const tier = tierOf(state.gifts[line.id]);
    return Boolean(tier) && tier.skuPattern.test(line.sku);
  };

  const giftLines = (key) => state.lines.filter((line) => state.gifts[line.id] === key && validGift(line));


  const subtotal = () => (state.lines.length ? state.hostTotal : 0);

  const shelf = () => {
    const stock = {};
    if (typeof window.getProduct !== 'function') return stock;
    const cards = {};
    document.querySelectorAll(SELECTORS.product).forEach((node) => {
      const handle = node.dataset.shopifyHandle;
      if (handle && !cards[handle]) cards[handle] = node;
    });
    Object.keys(cards).forEach((handle, order) => {
      const product = window.getProduct(handle);
      if (product) product.variants.forEach((variant) => {
        stock[variant.sku] = { available: variant.available, order, family: cards[handle].dataset.fragranceType || '' };
      });
    });
    return stock;
  };

  const options = (tier) => {
    if (!tier.choice) return [];
    const stock = shelf();
    return state.catalog[tier.key].filter((item) => item.available && !state.failed.has(item.variantId) && stock[item.base] && stock[item.base].available).sort((a, b) => stock[a.base].order - stock[b.base].order);
  };

  const ended = () => Date.now() > CAMPAIGN_END;

  const offered = (tier) => {
    if (ended() || state.blocked.has(tier.key)) return false;
    if (tier.choice) return options(tier).length > 0;
    return Boolean(state.catalog.solid) && (state.catalog.solid.available || PREVIEW);
  };

  const wanted = (tier) => {
    if (!tier.choice) return state.catalog.solid && state.catalog.solid.available ? state.catalog.solid : null;
    const choice = readStore().choices[tier.key];
    return options(tier).find((option) => option.variantId === choice) || null;
  };

  const gone = (tier, line) => {
    if (!tier.choice) return Boolean(state.catalog.solid) && !state.catalog.solid.available;
    const item = state.catalog[tier.key].find((entry) => entry.sku === line.sku);
    const stock = shelf();
    return Boolean(item) && (!item.available || Boolean(stock[item.base] && !stock[item.base].available));
  };

  const plan = () => {
    const paid = paidCount();
    const actions = [];
    state.lines.filter((line) => state.gifts[line.id] && !validGift(line)).forEach((line) => actions.push({ type: 'remove', lineId: line.id }));
    TIERS.forEach((tier) => {
      const lines = giftLines(tier.key);
      if (paid < tier.buy || state.blocked.has(tier.key) || ended()) {
        lines.forEach((line) => actions.push({ type: 'remove', lineId: line.id }));
        return;
      }
      lines.slice(1).forEach((line) => actions.push({ type: 'remove', lineId: line.id }));
      const current = lines[0];
      if (current && gone(tier, current)) {
        actions.push({ type: 'remove', lineId: current.id });
        return;
      }
      const target = wanted(tier);
      if (!current) {
        if (target) actions.push({ type: 'add', tier, variantId: target.variantId });
        return;
      }
      if (target && target.sku !== current.sku) actions.push({ type: 'update', tier, lineId: current.id, variantId: target.variantId });
      else if (current.quantity !== 1) actions.push({ type: 'update', tier, lineId: current.id, variantId: '' });
    });
    return actions;
  };

  const apply = async (actions) => {
    const id = cartId();
    if (!id) return null;
    const removals = actions.filter((action) => action.type === 'remove').map((action) => action.lineId);
    const updates = actions.filter((action) => action.type === 'update').map((action) => (action.variantId ? { id: action.lineId, quantity: 1, merchandiseId: action.variantId, attributes: giftAttributes(action.tier.key) } : { id: action.lineId, quantity: 1 }));
    const additions = actions.filter((action) => action.type === 'add').map((action) => ({ merchandiseId: action.variantId, quantity: 1, attributes: giftAttributes(action.tier.key) }));
    let cart = null;
    if (removals.length) {
      cart = ((await request(QUERIES.remove, { id, lineIds: removals })).cartLinesRemove || {}).cart || null;
      if (!cart) return null;
    }
    if (updates.length) {
      cart = ((await request(QUERIES.update, { id, lines: updates })).cartLinesUpdate || {}).cart || null;
      if (!cart) return null;
    }
    if (additions.length) cart = ((await request(QUERIES.add, { id, lines: additions })).cartLinesAdd || {}).cart || null;
    return cart;
  };

  const verify = (actions, cart) => {
    const gifts = snapshotGifts(cart);
    actions.filter((action) => action.variantId).forEach((action) => {
      if (gifts.some((gift) => gift.key === action.tier.key && gift.variantId === action.variantId)) return;
      if (action.tier.choice) {
        state.failed.add(action.variantId);
        setChoice(action.tier.key, '');
      } else if (state.catalog.solid) {
        state.catalog.solid.available = false;
      }
    });
  };

  const refreshHost = () => new Promise((resolve) => {
    const timer = window.setTimeout(resolve, HOST_RENDER_TIMEOUT);
    state.waiters.push(() => {
      window.clearTimeout(timer);
      resolve();
    });
    window.Cart.init();
  });

  const shippingMessage = () => {
    const goalNode = document.querySelector(SELECTORS.shippingGoal);
    const goal = parseYen(goalNode && goalNode.textContent);
    const i18n = window.YokaiI18n;
    if (!goal || !i18n) return '';
    const remain = Math.max(0, goal - subtotal());
    return remain ? i18n.freeShipRemain(remain) : i18n.freeShipDone;
  };

  const activeTiers = () => TIERS.filter(offered);

  const openChoice = (paid) => activeTiers().find((tier) => tier.choice && paid >= tier.buy && !giftLines(tier.key).length);

  const nextMessage = (paid) => {
    const next = activeTiers().find((tier) => paid < tier.buy);
    if (!next) return '';
    return paid ? copy.more(next.buy - paid, copy.inline[next.key]) : copy.begin(next.buy, copy.inline[next.key]);
  };

  const message = (paid) => {
    const open = openChoice(paid);
    if (open) return `<button type="button" class="bfg-progress__link" data-bfg-open="${open.key}">${copy.choose[open.key]}</button>`;
    return nextMessage(paid) || copy.complete;
  };

  const paintProgress = (paid) => {
    const tiers = activeTiers();
    refs.progress.hidden = !tiers.length;
    refs.shipping.classList.toggle(OFF_CLASS, tiers.length > 0);
    if (!tiers.length) return;
    const last = tiers[tiers.length - 1];
    refs.fill.style.width = `${Math.min(1, paid / last.buy) * 100}%`;
    TIERS.forEach((tier) => {
      const point = refs.points[tier.key];
      point.hidden = !tiers.includes(tier);
      point.style.left = `${Math.min(1, tier.buy / last.buy) * 100}%`;
      point.classList.toggle(LAST_CLASS, tier === last);
      point.classList.toggle(DONE_CLASS, paid >= tier.buy);
    });
    refs.ship.textContent = shippingMessage();
    const html = message(paid);
    if (state.messageHtml === html) return;
    state.messageHtml = html;
    refs.message.innerHTML = html;
  };

  const priceHtml = (price) => `${price ? `<s class="bfg-was">${yen(price)}</s>` : ''}<span class="bfg-free">${copy.free}</span>`;

  const controls = (tier, label) => `<span class="bfg-tag">${copy.gift}</span>${tier.choice ? `<button type="button" class="cart-line-remove" data-bfg-open="${tier.key}">${label}</button>` : ''}`;

  const decorate = (line, tier) => {
    const node = line.el;
    node.innerHTML = line.html;
    node.className = `${line.className} ${LINE_CLASS}`;
    node.setAttribute('data-bfg-overview', SOURCES.line);
    const title = node.querySelector(SELECTORS.lineTitle);
    if (title) title.textContent = tier.choice ? title.textContent.replace(GIFT_TITLE_PATTERN, '') : copy.names[tier.key];
    const style = node.querySelector(SELECTORS.lineStyle);
    if (style && !tier.choice) style.textContent = copy.solidDetail;
    const variant = node.querySelector(SELECTORS.lineVariant);
    [...(variant ? variant.children : [])].filter((part) => part.textContent.trim() === DEFAULT_VARIANT_TITLE).forEach((part) => {
      const next = part.nextElementSibling;
      if (next && next.matches(SELECTORS.lineSeparator)) next.remove();
      part.remove();
    });
    if (!node.querySelector(SELECTORS.lineImage)) node.insertAdjacentHTML('afterbegin', `<img class="cart-line-img bfg-gift-img" src="${GIFT_IMAGES[tier.key]}" alt="">`);
    const price = node.querySelector(SELECTORS.linePrice);
    if (price) price.innerHTML = priceHtml(line.price);
    const slot = node.querySelector(SELECTORS.lineControls);
    if (slot) slot.innerHTML = controls(tier, copy.change);
    if (state.loading === tier.key) node.classList.add(BUSY_CLASS);
    return node;
  };

  const placeholder = (tier) => {
    const sample = tier.choice ? options(tier)[0] : state.catalog.solid;
    const detail = tier.choice ? `<p class="cart-line-purfume-style">${copy.style}</p><p class="cart-line-variant"><span>${copy.pending}</span></p>` : `<p class="cart-line-purfume-style">${copy.solidNote}</p>`;
    const node = element('div', `${NODE_CLASS} cart-line ${LINE_CLASS}`, `<img class="cart-line-img bfg-gift-img" src="${GIFT_IMAGES[tier.key]}" alt=""><div class="cart-line-info"><div class="cart-line-info-wrapper"><div class="cart-line-title-and-price"><p class="cart-line-title">${copy.names[tier.key]}</p><p class="cart-line-price">${priceHtml(sample ? sample.price : 0)}</p></div>${detail}</div><div class="cart-line-qty">${controls(tier, copy.pick)}</div></div>`);
    node.setAttribute('data-bfg-overview', SOURCES.line);
    if (state.loading === tier.key) node.classList.add(BUSY_CLASS);
    return node;
  };

  const pendingStock = (tier) => PREVIEW && !tier.choice && offered(tier) && !state.catalog.solid.available;

  const paintLines = (paid) => {
    refs.list.querySelectorAll(`.${NODE_CLASS}`).forEach((node) => node.remove());
    state.lines.filter((line) => state.gifts[line.id]).forEach((line) => line.el.remove());
    TIERS.filter((tier) => paid >= tier.buy).forEach((tier) => {
      const line = giftLines(tier.key)[0];
      if (line) refs.list.appendChild(decorate(line, tier));
      else if (tier.choice ? offered(tier) : pendingStock(tier)) refs.list.appendChild(placeholder(tier));
    });
  };


  const observe = () => {
    refs.observer.observe(refs.list, { childList: true });
    if (refs.goal) refs.observer.observe(refs.goal, { childList: true, characterData: true, subtree: true });
  };

  const paint = () => {
    if (!state.ready) return;
    const paid = paidCount();
    refs.observer.disconnect();
    paintLines(paid);
    paintProgress(paid);
    observe();
  };

  const lockScroll = (locked) => {
    const scroller = window.SScroll;
    if (!scroller) return;
    if (locked === state.scrollLocked) return;
    state.scrollLocked = locked;
    if (locked) {
      state.resumeScroll = !scroller.isStopped;
      scroller.stop();
    } else if (state.resumeScroll) {
      scroller.start();
    }
  };

  const noticeBody = (tier) => {
    const nudge = nextMessage(paidCount());
    return `<h2 class="bfg-pop__title" id="bfg-pop-title">${copy.unlocked[tier.key]}</h2><div class="bfg-pop__gift"><img src="${GIFT_IMAGES[tier.key]}" alt=""><p class="bfg-pop__lead">${copy.added}${nudge ? `<br>${nudge}` : ''}</p></div><div class="bfg-pop__actions"><button type="button" class="bfg-pop__cta" data-bfg-close="proceed">${copy.proceed}</button></div>`;
  };

  const pickerBody = (tier, mode) => {
    const line = giftLines(tier.key)[0];
    const items = options(tier);
    const stock = shelf();
    const current = line ? items.find((item) => item.sku === line.sku) : null;
    state.pick = current ? current.variantId : '';
    const title = mode === MODES.unlock ? copy.unlocked[tier.key] : copy.choose[tier.key];
    const label = line ? copy.update : copy.confirm;
    const rows = items.map((item, index) => {
      const picked = item.variantId === state.pick;
      const family = (stock[item.base] || {}).family;
      return `<button type="button" role="radio" aria-checked="${picked ? 'true' : 'false'}" tabindex="${picked || (!state.pick && index === 0) ? 0 : -1}" class="bfg-option${picked ? ` ${CURRENT_CLASS}` : ''}" data-bfg-pick="${escapeHtml(item.variantId)}"><img src="${escapeHtml(thumb(item.image))}" alt="" decoding="async"><span class="bfg-option__text"><span class="bfg-option__name">${escapeHtml(item.name)}</span>${family ? `<span class="bfg-option__family">${escapeHtml(family)}</span>` : ''}</span><span class="bfg-option__mark" aria-hidden="true"></span></button>`;
    });
    const split = Math.ceil(rows.length / OPTION_COLUMNS);
    const columns = [rows.slice(0, split), rows.slice(split)].filter((part) => part.length).map((part) => `<div class="bfg-options__col" role="presentation">${part.join('')}</div>`).join('');
    return `<h2 class="bfg-pop__title" id="bfg-pop-title">${title}</h2><div class="bfg-options" role="radiogroup" aria-label="${copy.choose[tier.key]}">${columns}</div><div class="bfg-pop__actions"><button type="button" class="bfg-pop__cta" data-bfg-choose="${tier.key}" data-bfg-label="${label}"${state.pick ? '' : ' disabled'}>${state.pick ? label : copy.pending}</button><button type="button" class="bfg-pop__later" data-bfg-close="later">${line ? copy.close : copy.later}</button></div>`;
  };

  const giftState = (tier, paid) => {
    if (paid < tier.buy) return `<span class="bfg-gift__state ${MUTED_CLASS}">${copy.remaining(tier.buy - paid)}</span>`;
    const line = giftLines(tier.key)[0];
    if (!tier.choice) return line ? `<span class="bfg-gift__state">${copy.inCart}</span>` : '';
    const action = `<button type="button" class="bfg-gift__action" data-bfg-open="${tier.key}">${line ? copy.change : copy.pick}</button>`;
    return `<span class="bfg-gift__state">${line ? `<span class="bfg-gift__value">${escapeHtml(line.name)}</span>` : ''}${action}</span>`;
  };

  const overviewBody = () => {
    const paid = paidCount();
    const rows = TIERS.filter((tier) => offered(tier) || giftLines(tier.key).length).map((tier) => `<li class="bfg-gift"><img class="bfg-gift__img" src="${GIFT_IMAGES[tier.key]}" alt=""><span class="bfg-gift__text"><span class="bfg-gift__name">${copy.names[tier.key]}</span><span class="bfg-gift__rule">${copy.rule(tier.buy)}</span></span>${giftState(tier, paid)}</li>`).join('');
    return `<h2 class="bfg-pop__title" id="bfg-pop-title">${copy.overview}</h2><ul class="bfg-gifts">${rows}</ul><p class="bfg-pop__note">${copy.terms}</p><div class="bfg-pop__actions"><button type="button" class="bfg-pop__cta" data-bfg-close="proceed">${copy.close}</button></div>`;
  };

  const present = (key, html, choice) => {
    const switching = Boolean(state.popup);
    state.popup = key;
    refs.popupBody.innerHTML = html;
    refs.popupBody.scrollTop = 0;
    refs.popup.classList.toggle(CHOICE_CLASS, choice);
    const current = refs.popupBody.querySelector(`${SELECTORS.option}.${CURRENT_CLASS}`);
    const list = current && current.closest(SELECTORS.options);
    if (list) list.scrollTop = current.offsetTop - list.offsetTop - (list.clientHeight - current.offsetHeight) / 2;
    if (!switching) {
      state.returnFocus = document.activeElement;
      refs.popup.classList.add(VISIBLE_CLASS);
      refs.popup.setAttribute('aria-hidden', 'false');
      refs.popupCard.getBoundingClientRect();
      window.requestAnimationFrame(() => refs.popup.classList.add(OPEN_CLASS));
      lockScroll(true);
    }
    refs.popupCard.focus({ preventScroll: true });
  };

  const openGift = (tier, mode) => {
    if (!tier || !offered(tier)) return false;
    present(tier.key, tier.choice ? pickerBody(tier, mode) : noticeBody(tier), tier.choice);
    return true;
  };

  const openOverview = (source) => {
    present(OVERVIEW_KEY, overviewBody(), false);
    track(TRACK_ACTIONS.view, source);
  };

  const openNext = () => {
    while (!state.popup && state.queue.length) {
      const tier = tierOf(state.queue.shift());
      if (paidCount() >= tier.buy && openGift(tier, MODES.unlock)) {
        markSeen(tier.key);
        track(TRACK_ACTIONS.unlock, tier.key);
      }
    }
  };

  const closePopup = () => {
    if (!state.popup) return;
    state.popup = null;
    refs.popup.classList.remove(OPEN_CLASS);
    refs.popup.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => {
      if (state.popup) return;
      refs.popup.classList.remove(VISIBLE_CLASS);
      lockScroll(false);
      if (state.returnFocus && state.returnFocus.isConnected && state.returnFocus.focus) state.returnFocus.focus({ preventScroll: true });
      openNext();
    }, reducedMotion.matches ? DURATION.backdrop : DURATION.close);
  };

  const announce = (from, to) => {
    const seen = readStore().seen;
    TIERS.filter((tier) => from < tier.buy && to >= tier.buy && !seen.includes(tier.key)).forEach((tier) => state.queue.push(tier.key));
    openNext();
  };

  const inSync = () => state.signature === signatureOf(state.lines);

  const sync = async () => {
    if (inSync()) return true;
    adopt(await loadCart());
    block();
    if (inSync()) return true;
    await refreshHost();
    return inSync();
  };

  const retry = () => {
    if (state.retries >= RETRY.limit) return;
    state.retries += 1;
    window.setTimeout(() => window.Cart.init(), RETRY.delay * state.retries);
  };

  const reconcile = async () => {
    if (!state.ready || state.busy) return;
    state.busy = true;
    try {
      for (let round = 0; round < MAX_ROUNDS; round += 1) {
        if (!(await sync())) {
          retry();
          break;
        }
        const actions = plan();
        if (!actions.length) {
          state.retries = 0;
          break;
        }
        const cart = await apply(actions);
        if (!cart) {
          retry();
          break;
        }
        adopt(cart);
        verify(actions, cart);
        block();
        await refreshHost();
      }
    } catch (error) {
      window.console.warn(LOG_LABEL, error);
      retry();
    } finally {
      state.busy = false;
      state.loading = '';
      paint();
    }
  };

  const pick = (variantId) => {
    state.pick = variantId;
    refs.popupBody.querySelectorAll(SELECTORS.option).forEach((option) => {
      const picked = option.getAttribute('data-bfg-pick') === variantId;
      option.classList.toggle(CURRENT_CLASS, picked);
      option.setAttribute('aria-checked', picked ? 'true' : 'false');
      option.tabIndex = picked ? 0 : -1;
    });
    const confirm = refs.popupBody.querySelector(SELECTORS.confirm);
    if (!confirm) return;
    confirm.disabled = false;
    confirm.textContent = confirm.getAttribute('data-bfg-label');
  };

  const choose = (key) => {
    if (!state.pick) return;
    setChoice(key, state.pick);
    track(TRACK_ACTIONS.choose, key);
    state.loading = key;
    closePopup();
    paint();
    reconcile();
  };

  const onHostRender = () => {
    state.lines = readLines();
    const total = document.querySelector(SELECTORS.total);
    state.hostTotal = parseYen(total && total.textContent);
    const paid = paidCount();
    paint();
    state.waiters.splice(0).forEach((resolve) => resolve());
    if (state.lastPaid !== null && paid > state.lastPaid) announce(state.lastPaid, paid);
    state.lastPaid = paid;
    reconcile();
  };

  const onClick = (event) => {
    const target = event.target.closest(SELECTORS.action);
    if (!target) return;
    event.preventDefault();
    if (target.hasAttribute('data-bfg-pick')) pick(target.getAttribute('data-bfg-pick'));
    else if (target.hasAttribute('data-bfg-choose')) choose(target.getAttribute('data-bfg-choose'));
    else if (target.hasAttribute('data-bfg-open')) openGift(tierOf(target.getAttribute('data-bfg-open')), MODES.choose);
    else if (target.hasAttribute('data-bfg-overview')) openOverview(target.getAttribute('data-bfg-overview'));
    else closePopup();
  };

  const onKeydown = (event) => {
    const trigger = event.target.closest && event.target.closest('[role="button"][data-bfg-overview], [role="button"][data-bfg-close]');
    if (trigger && ACTIVATE_KEYS.includes(event.key)) {
      event.preventDefault();
      if (trigger.hasAttribute('data-bfg-overview')) openOverview(trigger.getAttribute('data-bfg-overview'));
      else closePopup();
      return;
    }
    if (!state.popup) return;
    if (event.key === 'Escape') {
      event.stopPropagation();
      closePopup();
      return;
    }
    const radio = event.target.closest && event.target.closest(SELECTORS.option);
    if (radio && ARROW_STEPS[event.key]) {
      event.preventDefault();
      const radios = [...refs.popupBody.querySelectorAll(SELECTORS.option)];
      const next = radios[(radios.indexOf(radio) + ARROW_STEPS[event.key] + radios.length) % radios.length];
      pick(next.getAttribute('data-bfg-pick'));
      next.focus();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = [...refs.popupCard.querySelectorAll(SELECTORS.focusable)];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === refs.popupCard)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const onProductsReady = () => {
    paint();
    reconcile();
  };

  const railLabel = (key) => {
    const [lead, rest] = copy.rail[key];
    return rest ? `${lead} <span class="bfg-point__wrap">${rest}</span>` : lead;
  };

  const buildProgress = () => {
    const points = TIERS.map((tier) => `<li class="bfg-point" data-bfg-point="${tier.key}">${GIFT_ICON}<span class="bfg-point__label">${railLabel(tier.key)}</span></li>`).join('');
    const node = element('div', 'bfg-progress', `<div class="bfg-progress__head"><p class="bfg-progress__msg" aria-live="polite"></p><p class="bfg-progress__ship"></p></div><div class="bfg-bar" role="button" tabindex="0" data-bfg-overview="${SOURCES.bar}" aria-label="${copy.see}"><span class="bfg-bar__track" aria-hidden="true"></span><span class="bfg-bar__fill" aria-hidden="true"></span><ol class="bfg-points">${points}</ol></div>`);
    refs.shipping.insertAdjacentElement('afterend', node);
    refs.progress = node;
    refs.message = node.querySelector('.bfg-progress__msg');
    refs.fill = node.querySelector('.bfg-bar__fill');
    refs.ship = node.querySelector('.bfg-progress__ship');
    refs.points = {};
    node.querySelectorAll('.bfg-point').forEach((point) => {
      refs.points[point.getAttribute('data-bfg-point')] = point;
    });
  };

  const buildPopup = () => {
    const node = element('div', 'bfg-pop', `<div class="bfg-pop__backdrop" data-bfg-close="backdrop"></div><div class="bfg-pop__card" role="dialog" aria-modal="true" aria-labelledby="bfg-pop-title" tabindex="-1"><div class="${SITE_CLOSE_CLASS} bfg-pop__close" role="button" tabindex="0" data-bfg-close="button" aria-label="${copy.close}"><div class="${SITE_CLOSE_ICON_CLASS}" aria-hidden="true"><div></div><div></div></div></div><div class="bfg-pop__scroll" data-lenis-prevent></div></div>`);
    node.setAttribute('aria-hidden', 'true');
    const texture = document.querySelector(SELECTORS.texture);
    const textureImage = texture ? window.getComputedStyle(texture).backgroundImage : 'none';
    if (textureImage && textureImage !== 'none') node.style.setProperty('--bfg-texture', textureImage);
    document.body.appendChild(node);
    refs.popup = node;
    refs.popupCard = node.querySelector('.bfg-pop__card');
    refs.popupBody = node.querySelector('.bfg-pop__scroll');
  };

  const loadCart = () => {
    const id = cartId();
    return id ? request(QUERIES.cart, { id }).then((data) => data.cart || null) : Promise.resolve(null);
  };

  const loadCatalog = () => request(QUERIES.gifts, { query: `tag:${GIFT_TAG}` }).then((data) => {
    const catalog = { solid: null, small: [], large: [] };
    ((data.products || {}).edges || []).forEach(({ node }) => {
      node.variants.edges.forEach(({ node: variant }) => {
        const tier = TIERS.find((item) => item.skuPattern.test(variant.sku || ''));
        if (!tier) return;
        const item = { variantId: variant.id, sku: variant.sku, base: variant.sku.replace(GIFT_SKU_PREFIX, ''), price: Number(variant.price.amount) || 0, available: variant.availableForSale, name: node.title.replace(TITLE_PREFIX_PATTERN, '').replace(GIFT_TITLE_PATTERN, ''), image: variant.image ? variant.image.url : '' };
        if (tier.choice) catalog[tier.key].push(item);
        else catalog[tier.key] = item;
      });
    });
    if (!catalog.solid && !catalog.small.length && !catalog.large.length) throw new Error(CATALOG_ERROR);
    return catalog;
  });

  const retryCatalog = (attempt) => {
    if (attempt > CATALOG_RETRY.limit || ended()) return;
    window.setTimeout(() => loadCatalog().then((catalog) => {
      state.catalog = catalog;
      paint();
      reconcile();
    }).catch(() => retryCatalog(attempt + 1)), CATALOG_RETRY.delay * attempt);
  };

  const start = async () => {
    refs.list = document.querySelector(SELECTORS.list);
    refs.shipping = document.querySelector(SELECTORS.shipping);
    refs.goal = document.querySelector(SELECTORS.shippingGoal);
    if (!refs.list || !refs.shipping) return;
    document.head.appendChild(element('style', '', css));
    buildProgress();
    buildPopup();
    Object.values(GIFT_IMAGES).forEach((src) => {
      new Image().src = src;
    });
    refs.observer = new MutationObserver(onHostRender);
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeydown, true);
    window.addEventListener('shopify-products-ready', onProductsReady);
    const [cart, catalog] = await Promise.all([loadCart().catch(() => null), loadCatalog().catch(() => null)]);
    adopt(cart);
    block();
    if (catalog) state.catalog = catalog;
    state.ready = true;
    onHostRender();
    if (!catalog) retryCatalog(1);
  };

  const whenHostReady = (callback, attempt = 0) => {
    if ((window.Cart && document.querySelector(SELECTORS.list)) || attempt >= HOST_POLL_LIMIT) {
      if (window.Cart) callback();
      return;
    }
    window.setTimeout(() => whenHostReady(callback, attempt + 1), HOST_POLL_INTERVAL);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => whenHostReady(start));
  else whenHostReady(start);
})();
