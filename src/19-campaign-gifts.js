(() => {
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
  const QUEUE_LIMIT = 8000;
  const CART_REQUEST_PATTERN = /"query":"[^"]*cart/;
  const RETRY = { limit: 3, delay: 3000 };
  const CATALOG_RETRY = { limit: 3, delay: 2000 };
  const CAMPAIGN_END = Date.parse('2026-12-25T23:59:59+09:00');
  const AWAIT_LIMIT = 8000;
  const IDLE = { timeout: 8000, poll: 100 };
  const GUARD_WINDOW = 15000;
  const MUTED = 0.72;
  const HIT_AREA = { bar: 11, link: 10, side: 6 };
  const NOTICE_KEY = 'notice';
  const WAIT_CLASS = 'bfg-wait';
  const OUTCOMES = { clear: 'clear', changed: 'changed', unchecked: 'unchecked' };
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

  const ATTR = { pick: 'data-bfg-pick', choose: 'data-bfg-choose', open: 'data-bfg-open', overview: 'data-bfg-overview', close: 'data-bfg-close', label: 'data-bfg-label', point: 'data-bfg-point' };
  const TITLE_ID = 'bfg-pop-title';
  const HOST_EVENT = 'shopify-products-ready';
  const LOCALE = 'en-US';
  const CURRENCY = '¥';
  const LINE_LIMIT = 50;
  const VARIANT_LIMIT = 10;

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
    focusable: 'button:not([disabled]):not([tabindex="-1"]), [href], [tabindex]:not([tabindex="-1"]):not([disabled])',
    checkout: '.cart-checkout',
    bar: '.bfg-bar',
    note: '.bfg-progress__note',
    action: `[${ATTR.pick}], [${ATTR.choose}], [${ATTR.open}], [${ATTR.overview}], [${ATTR.close}]`,
    trigger: `[role="button"][${ATTR.overview}], [role="button"][${ATTR.close}]`,
    message: '.bfg-progress__msg',
    fill: '.bfg-bar__fill',
    ship: '.bfg-progress__ship',
    point: '.bfg-point',
    card: '.bfg-pop__card',
    body: '.bfg-pop__scroll',
    options: '.bfg-options',
    option: '.bfg-option',
    confirm: `.bfg-pop__cta[${ATTR.choose}]`
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
      lost: 'Your scent sold out. Please choose again.',
      lostGift: 'The solid perfume gift has run out.',
      notices: {
        changed: { title: 'Your gifts have changed', lead: 'We updated the gifts to match your cart. Please check your cart before you continue.' },
        unchecked: { title: "We couldn't check your gifts", lead: 'Please check your connection and try again.' }
      }
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
      lost: 'お選びの香りは完売しました。もう一度お選びください。',
      lostGift: '練り香水のギフトは終了しました。',
      notices: {
        changed: { title: 'ギフトを更新しました', lead: 'カートの内容に合わせてギフトを更新しました。ご確認のうえ、お手続きください。' },
        unchecked: { title: 'ギフトを確認できません', lead: '通信状況をご確認のうえ、もう一度お試しください。' }
      }
    }
  };

  const CART_FIELDS = `id lines(first: ${LINE_LIMIT}) { edges { node { id quantity attributes { key value } cost { totalAmount { amount } } merchandise { ... on ProductVariant { id sku } } } } }`;

  const QUERIES = {
    cart: `query($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`,
    add: `mutation($id: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $id, lines: $lines) { cart { ${CART_FIELDS} } } }`,
    update: `mutation($id: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $id, lines: $lines) { cart { ${CART_FIELDS} } } }`,
    remove: `mutation($id: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $id, lineIds: $lineIds) { cart { ${CART_FIELDS} } } }`,
    gifts: `query($query: String!) { products(first: ${CATALOG_LIMIT}, query: $query) { edges { node { title variants(first: ${VARIANT_LIMIT}) { edges { node { id sku availableForSale price { amount } image { url } } } } } } } }`
  };

  const copy = COPY[JA_PATH_PATTERN.test(window.location.pathname) ? 'ja' : 'en'];
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  const state = { ready: false, busy: false, lines: [], gifts: {}, charged: [], blocked: new Set(), catalog: { solid: null, small: [], large: [] }, signature: '', snapshotPaid: 0, failed: new Set(), loading: '', hostTotal: 0, lastPaid: null, queue: [], popup: null, pick: '', returnFocus: null, scrollLocked: false, resumeScroll: false, messageHtml: '', retries: 0, timer: 0, queueTimer: 0, waiters: [], unsafe: [], checking: false, guard: null, rescue: '', lost: new Set(), queuedAt: {}, refocus: '' };
  const refs = {};

  const css = `
    .shipping-progress.${OFF_CLASS}{position:absolute;visibility:hidden;pointer-events:none}
    .bfg-progress{position:relative;z-index:2}
    .bfg-progress::after{content:'';position:absolute;top:100%;left:0;width:100%;height:1.5rem;background:${COLORS.cream};z-index:1;pointer-events:none}
    .bfg-progress__head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:0 16px}
    .bfg-progress__msg{margin:0;font-size:14px;line-height:20px}
    .bfg-progress__ship{margin:0;font-size:12px;line-height:20px;opacity:${MUTED}}
    .bfg-progress__note{flex-basis:100%;margin:2px 0 0;font-size:12px;line-height:18px;color:${COLORS.terra}}
    .${WAIT_CLASS}{opacity:.6;pointer-events:none}
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
    .bfg-point__label{position:absolute;top:${POINT_SIZE + 6}px;left:50%;transform:translateX(-50%);white-space:nowrap;font:400 12px/1.3 ${FONTS.text};color:${COLORS.ink};opacity:${MUTED};transition:opacity .4s .25s}
    .bfg-point.${DONE_CLASS} .bfg-point__label{opacity:1}
    .bfg-point[hidden]{display:none}
    .bfg-point.${LAST_CLASS} .bfg-point__label{left:auto;right:0;transform:none;text-align:right}
    .cart-line.${LINE_CLASS}{cursor:pointer}
    .${LINE_CLASS} .cart-line-price{white-space:nowrap;padding-left:.75rem}
    .${LINE_CLASS} .bfg-gift-img{min-height:${LINE_IMAGE_HEIGHT}px;object-fit:contain;padding:22px;box-sizing:border-box;background:${COLORS.wash}}
    .${LINE_CLASS}.${BUSY_CLASS}{opacity:.45;pointer-events:none}
    .bfg-was{margin-right:.6em;opacity:${MUTED}}
    .bfg-free{color:${COLORS.terra}}
    .bfg-tag{font-size:14px;opacity:${MUTED}}
    .bfg-options{display:flex;align-items:flex-start;gap:0 ${OPTION_GAP}px;min-height:0;margin:0;padding:0 0 ${FADE_HEIGHT}px;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;-webkit-mask-image:linear-gradient(#000 calc(100% - ${FADE_HEIGHT}px),transparent);mask-image:linear-gradient(#000 calc(100% - ${FADE_HEIGHT}px),transparent)}
    .bfg-options__col{flex:1 1 0;min-width:0;border-top:1px solid ${COLORS.track}}
    .bfg-option{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:14px;width:100%;padding:10px 4px 10px 0;border-bottom:1px solid ${COLORS.track};cursor:pointer}
    .bfg-option:focus-visible{outline:1px solid ${COLORS.ink};outline-offset:-1px}
    .bfg-option img{flex:none;width:${OPTION_IMAGE.width}px;height:${OPTION_IMAGE.height}px;object-fit:cover}
    .bfg-option__text{flex:1;min-width:0}
    .bfg-option__name{display:block;font:400 16px/1.3 ${FONTS.title}}
    .bfg-option__family{display:block;margin-top:2px;font:400 11.5px/1.5 ${FONTS.text};letter-spacing:.06em;opacity:${MUTED}}
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
    .bfg-gift__rule{display:block;margin-top:2px;font:400 12px/1.5 ${FONTS.text};opacity:${MUTED}}
    .bfg-gift__state{flex:none;max-width:46%;font:400 12px/1.5 ${FONTS.text};text-align:right}
    .bfg-gift__state.${MUTED_CLASS}{opacity:${MUTED}}
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
    .bfg-bar::before{content:'';position:absolute;inset:-${HIT_AREA.bar}px 0}
    .bfg-progress__link,.bfg-pop__later,.bfg-gift__action,.${LINE_CLASS} .cart-line-remove{position:relative}
    .bfg-progress__link::after,.bfg-pop__later::after,.bfg-gift__action::after,.${LINE_CLASS} .cart-line-remove::after{content:'';position:absolute;inset:-${HIT_AREA.link}px -${HIT_AREA.side}px}
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

  const yen = (value) => `${CURRENCY}${Math.round(Number(value)).toLocaleString(LOCALE)}`;

  const parseYen = (text) => Number(String(text || '').replace(NON_NUMERIC_PATTERN, '')) || 0;

  const escapeHtml = (text) => String(text).replace(ESCAPE_PATTERN, (char) => ESCAPES[char]);

  const thumb = (url) => (url ? `${url}${url.includes('?') ? '&' : '?'}width=${THUMB_WIDTH}` : '');

  const element = (tag, className, html) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  };

  const nativeFetch = window.fetch.bind(window);
  const queue = { last: Promise.resolve() };

  const serialFetch = (input, init) => {
    const body = init && typeof init.body === 'string' ? init.body : '';
    if (input !== STOREFRONT.endpoint || !CART_REQUEST_PATTERN.test(body)) return nativeFetch(input, init);
    const previous = queue.last;
    const turn = new Promise((resolve) => {
      const timer = window.setTimeout(resolve, QUEUE_LIMIT);
      previous.then(() => {
        window.clearTimeout(timer);
        resolve();
      });
    });
    const run = turn.then(() => nativeFetch(input, init));
    queue.last = run.then(() => {}, () => {});
    return run;
  };

  window.fetch = serialFetch;

  const request = (query, variables, keepalive = false) => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    return window.fetch(STOREFRONT.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': STOREFRONT.token },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
      keepalive
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
    const kept = new Set();
    state.unsafe = gifts.filter((gift) => {
      const tier = tierOf(gift.key);
      const fine = Boolean(tier) && tier.skuPattern.test(gift.sku) && gift.quantity === 1 && !gift.charged && !kept.has(gift.key) && state.snapshotPaid >= tier.buy && !ended();
      if (fine) kept.add(gift.key);
      return !fine;
    }).map((gift) => gift.lineId);
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
    return Boolean(state.catalog.solid) && state.catalog.solid.available;
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
        actions.push({ type: 'remove', lineId: current.id, lost: tier.key });
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
      cart = ((await request(QUERIES.remove, { id, lineIds: removals }, true)).cartLinesRemove || {}).cart || null;
      if (!cart) return null;
    }
    if (updates.length) {
      cart = ((await request(QUERIES.update, { id, lines: updates }, true)).cartLinesUpdate || {}).cart || null;
      if (!cart) return null;
    }
    if (additions.length) cart = ((await request(QUERIES.add, { id, lines: additions }, true)).cartLinesAdd || {}).cart || null;
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
    state.guard = { id: cartId() || '', until: Date.now() + GUARD_WINDOW };
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
    if (open) return `<button type="button" class="bfg-progress__link" tabindex="0" ${ATTR.open}="${open.key}">${copy.choose[open.key]}</button>`;
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
    const lost = TIERS.some((tier) => !tier.choice && state.lost.has(tier.key));
    refs.note.textContent = lost ? copy.lostGift : '';
    refs.note.hidden = !lost;
    const html = message(paid);
    if (state.messageHtml === html) return;
    state.messageHtml = html;
    refs.message.innerHTML = html;
  };

  const priceHtml = (price) => `${price ? `<s class="bfg-was">${yen(price)}</s>` : ''}<span class="bfg-free">${copy.free}</span>`;

  const controls = (tier, label) => `<span class="bfg-tag">${copy.gift}</span>${tier.choice ? `<button type="button" class="cart-line-remove" tabindex="0" ${ATTR.open}="${tier.key}">${label}</button>` : ''}`;

  const decorate = (line, tier) => {
    const node = line.el;
    node.innerHTML = line.html;
    node.className = `${line.className} ${LINE_CLASS}`;
    node.setAttribute(ATTR.overview, SOURCES.line);
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
    const sample = options(tier)[0];
    const detail = `<p class="cart-line-purfume-style">${copy.style}</p><p class="cart-line-variant"><span>${state.lost.has(tier.key) ? copy.lost : copy.pending}</span></p>`;
    const node = element('div', `${NODE_CLASS} cart-line ${LINE_CLASS}`, `<img class="cart-line-img bfg-gift-img" src="${GIFT_IMAGES[tier.key]}" alt=""><div class="cart-line-info"><div class="cart-line-info-wrapper"><div class="cart-line-title-and-price"><p class="cart-line-title">${copy.names[tier.key]}</p><p class="cart-line-price">${priceHtml(sample ? sample.price : 0)}</p></div>${detail}</div><div class="cart-line-qty">${controls(tier, copy.pick)}</div></div>`);
    node.setAttribute(ATTR.overview, SOURCES.line);
    if (state.loading === tier.key) node.classList.add(BUSY_CLASS);
    return node;
  };

  const pending = () => state.busy || Boolean(state.timer);

  const expose = (line) => {
    line.el.innerHTML = line.html;
    line.el.className = line.className;
    line.el.removeAttribute(ATTR.overview);
    refs.list.appendChild(line.el);
  };

  const paintLines = (paid) => {
    refs.list.querySelectorAll(`.${NODE_CLASS}`).forEach((node) => node.remove());
    const live = TIERS.filter((tier) => paid >= tier.buy && !state.blocked.has(tier.key) && !ended());
    const kept = live.map((tier) => giftLines(tier.key)[0]).filter(Boolean);
    state.lines.filter((line) => state.gifts[line.id] && !kept.includes(line)).forEach((line) => {
      if (pending()) line.el.remove();
      else expose(line);
    });
    live.forEach((tier) => {
      const line = giftLines(tier.key)[0];
      if (line) refs.list.appendChild(decorate(line, tier));
      else if (tier.choice && offered(tier)) refs.list.appendChild(placeholder(tier));
    });
  };

  const observe = () => {
    refs.observer.observe(refs.list, { childList: true });
    if (refs.goal) refs.observer.observe(refs.goal, { childList: true, characterData: true, subtree: true });
  };

  const refocus = () => {
    if (!state.refocus || state.popup) return;
    const active = document.activeElement;
    const lost = !active || active === document.body || !active.isConnected;
    const target = lost ? refs.list.querySelector(`[${ATTR.open}="${state.refocus}"]`) || refs.bar : null;
    if (target) target.focus({ preventScroll: true });
    if (!state.loading) state.refocus = '';
  };

  const paint = () => {
    if (!state.ready) return;
    const paid = paidCount();
    refs.observer.disconnect();
    paintLines(paid);
    paintProgress(paid);
    observe();
    refocus();
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
    return `<h2 class="bfg-pop__title" id="${TITLE_ID}">${copy.unlocked[tier.key]}</h2><div class="bfg-pop__gift"><img src="${GIFT_IMAGES[tier.key]}" alt=""><p class="bfg-pop__lead">${copy.added}${nudge ? `<br>${nudge}` : ''}</p></div><div class="bfg-pop__actions"><button type="button" class="bfg-pop__cta" tabindex="0" ${ATTR.close}="proceed">${copy.proceed}</button></div>`;
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
      return `<button type="button" role="radio" aria-checked="${picked ? 'true' : 'false'}" tabindex="${picked || (!state.pick && index === 0) ? 0 : -1}" class="bfg-option${picked ? ` ${CURRENT_CLASS}` : ''}" ${ATTR.pick}="${escapeHtml(item.variantId)}"><img src="${escapeHtml(thumb(item.image))}" alt="" decoding="async"><span class="bfg-option__text"><span class="bfg-option__name">${escapeHtml(item.name)}</span>${family ? `<span class="bfg-option__family">${escapeHtml(family)}</span>` : ''}</span><span class="bfg-option__mark" aria-hidden="true"></span></button>`;
    });
    const split = Math.ceil(rows.length / OPTION_COLUMNS);
    const columns = [rows.slice(0, split), rows.slice(split)].filter((part) => part.length).map((part) => `<div class="bfg-options__col" role="presentation">${part.join('')}</div>`).join('');
    return `<h2 class="bfg-pop__title" id="${TITLE_ID}">${title}</h2><div class="bfg-options" role="radiogroup" aria-label="${copy.choose[tier.key]}">${columns}</div><div class="bfg-pop__actions"><button type="button" class="bfg-pop__cta" tabindex="0" ${ATTR.choose}="${tier.key}" ${ATTR.label}="${label}"${state.pick ? '' : ' disabled'}>${state.pick ? label : copy.pending}</button><button type="button" class="bfg-pop__later" tabindex="0" ${ATTR.close}="later">${line ? copy.close : copy.later}</button></div>`;
  };

  const messageBody = (notice) => `<h2 class="bfg-pop__title" id="${TITLE_ID}">${notice.title}</h2><p class="bfg-pop__lead">${notice.lead}</p><div class="bfg-pop__actions"><button type="button" class="bfg-pop__cta" tabindex="0" ${ATTR.close}="proceed">${copy.close}</button></div>`;

  const giftState = (tier, paid) => {
    if (paid < tier.buy) return `<span class="bfg-gift__state ${MUTED_CLASS}">${copy.remaining(tier.buy - paid)}</span>`;
    const line = giftLines(tier.key)[0];
    if (!tier.choice) return line ? `<span class="bfg-gift__state">${copy.inCart}</span>` : '';
    const action = `<button type="button" class="bfg-gift__action" tabindex="0" ${ATTR.open}="${tier.key}">${line ? copy.change : copy.pick}</button>`;
    return `<span class="bfg-gift__state">${line ? `<span class="bfg-gift__value">${escapeHtml(line.name)}</span>` : ''}${action}</span>`;
  };

  const overviewBody = () => {
    const paid = paidCount();
    const rows = TIERS.filter((tier) => offered(tier) || giftLines(tier.key).length).map((tier) => `<li class="bfg-gift"><img class="bfg-gift__img" src="${GIFT_IMAGES[tier.key]}" alt=""><span class="bfg-gift__text"><span class="bfg-gift__name">${copy.names[tier.key]}</span><span class="bfg-gift__rule">${copy.rule(tier.buy)}</span></span>${giftState(tier, paid)}</li>`).join('');
    return `<h2 class="bfg-pop__title" id="${TITLE_ID}">${copy.overview}</h2><ul class="bfg-gifts">${rows}</ul><p class="bfg-pop__note">${copy.terms}</p><div class="bfg-pop__actions"><button type="button" class="bfg-pop__cta" tabindex="0" ${ATTR.close}="proceed">${copy.close}</button></div>`;
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

  const awaited = (tier) => !tier.choice && offered(tier) && paidCount() >= tier.buy && !giftLines(tier.key).length;

  const openNext = () => {
    while (!state.popup && state.queue.length) {
      const tier = tierOf(state.queue[0]);
      const missing = !tier.choice && !giftLines(tier.key).length;
      if (awaited(tier) && Date.now() - state.queuedAt[tier.key] < AWAIT_LIMIT) {
        if (!state.queueTimer) state.queueTimer = window.setTimeout(() => {
          state.queueTimer = 0;
          openNext();
        }, AWAIT_LIMIT);
        return;
      }
      state.queue.shift();
      if (!missing && paidCount() >= tier.buy && openGift(tier, MODES.unlock)) {
        markSeen(tier.key);
        track(TRACK_ACTIONS.unlock, tier.key);
      }
    }
  };

  const focusBack = () => {
    const target = state.returnFocus && state.returnFocus.isConnected ? state.returnFocus : refs.bar;
    if (target && target.focus) target.focus({ preventScroll: true });
  };

  const closePopup = () => {
    if (!state.popup) return;
    state.popup = null;
    focusBack();
    refs.popup.classList.remove(OPEN_CLASS);
    refs.popup.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => {
      if (state.popup) return;
      refs.popup.classList.remove(VISIBLE_CLASS);
      lockScroll(false);
      openNext();
    }, reducedMotion.matches ? DURATION.backdrop : DURATION.close);
  };

  const announce = (from, to) => {
    const seen = readStore().seen;
    TIERS.filter((tier) => from < tier.buy && to >= tier.buy && !seen.includes(tier.key)).forEach((tier) => {
      state.queuedAt[tier.key] = Date.now();
      state.queue.push(tier.key);
    });
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
    if (state.timer || state.retries >= RETRY.limit) return;
    state.retries += 1;
    state.timer = window.setTimeout(() => {
      state.timer = 0;
      reconcile();
    }, RETRY.delay * state.retries);
  };

  const rescue = async () => {
    const id = state.rescue;
    if (!id || cartId()) {
      state.rescue = '';
      return;
    }
    const data = await request(QUERIES.cart, { id });
    state.rescue = '';
    if (!data.cart) return;
    window.localStorage.setItem(CART_KEY, id);
    adopt(data.cart);
    block();
    await refreshHost();
  };

  const reconcile = async () => {
    if (!state.ready || state.busy) return;
    state.busy = true;
    let settled = false;
    try {
      for (let round = 0; round < MAX_ROUNDS && !settled; round += 1) {
        await rescue();
        if (await sync()) {
          const actions = plan();
          if (actions.length) {
            const cart = await apply(actions);
            if (!cart) break;
            actions.filter((action) => action.lost).forEach((action) => state.lost.add(action.lost));
            adopt(cart);
            verify(actions, cart);
            block();
            await refreshHost();
          } else {
            settled = true;
          }
        }
      }
    } catch (error) {
      window.console.warn(LOG_LABEL, error);
    } finally {
      state.busy = false;
      state.loading = '';
      if (settled) state.retries = 0;
      else retry();
      paint();
    }
  };

  const giftSku = (sku) => TIERS.some((tier) => tier.skuPattern.test(sku));

  const hasGifts = () => Object.keys(state.gifts).length > 0 || state.lines.some((line) => giftSku(line.sku));

  const idle = () => new Promise((resolve) => {
    const started = Date.now();
    const poll = () => {
      if ((state.ready && !state.busy) || Date.now() - started > IDLE.timeout) resolve();
      else window.setTimeout(poll, IDLE.poll);
    };
    poll();
  });

  const inspect = async () => {
    try {
      adopt(await loadCart());
      block();
      if (!state.unsafe.length) return OUTCOMES.clear;
      const cart = ((await request(QUERIES.remove, { id: cartId(), lineIds: state.unsafe }, true)).cartLinesRemove || {}).cart || null;
      if (!cart) return OUTCOMES.unchecked;
      adopt(cart);
      block();
      return OUTCOMES.changed;
    } catch (error) {
      window.console.warn(LOG_LABEL, error);
      return inSync() && !state.unsafe.length ? OUTCOMES.clear : OUTCOMES.unchecked;
    }
  };

  const guard = async (proceed) => {
    if (state.checking) return;
    if (state.ready && !hasGifts()) {
      proceed();
      return;
    }
    state.checking = true;
    refs.checkout.forEach((node) => node.classList.add(WAIT_CLASS));
    await idle();
    state.busy = true;
    const outcome = state.ready && hasGifts() ? await inspect() : OUTCOMES.clear;
    state.busy = false;
    state.checking = false;
    refs.checkout.forEach((node) => node.classList.remove(WAIT_CLASS));
    if (outcome === OUTCOMES.clear) {
      proceed();
      return;
    }
    if (outcome === OUTCOMES.changed) await refreshHost();
    present(NOTICE_KEY, messageBody(copy.notices[outcome]), false);
    reconcile();
  };

  const wake = () => {
    if (document.visibilityState !== 'visible') return;
    state.retries = 0;
    reconcile();
  };

  const pick = (variantId) => {
    state.pick = variantId;
    refs.popupBody.querySelectorAll(SELECTORS.option).forEach((option) => {
      const picked = option.getAttribute(ATTR.pick) === variantId;
      option.classList.toggle(CURRENT_CLASS, picked);
      option.setAttribute('aria-checked', picked ? 'true' : 'false');
      option.tabIndex = picked ? 0 : -1;
    });
    const confirm = refs.popupBody.querySelector(SELECTORS.confirm);
    if (!confirm) return;
    confirm.disabled = false;
    confirm.textContent = confirm.getAttribute(ATTR.label);
  };

  const choose = (key) => {
    if (!state.pick) return;
    setChoice(key, state.pick);
    track(TRACK_ACTIONS.choose, key);
    state.lost.delete(key);
    state.refocus = key;
    state.loading = key;
    closePopup();
    paint();
    reconcile();
  };

  const onHostRender = () => {
    state.lines = readLines();
    const total = document.querySelector(SELECTORS.total);
    state.hostTotal = parseYen(total && total.textContent);
    if (state.guard && Date.now() >= state.guard.until) state.guard = null;
    if (state.guard && state.guard.id && !cartId()) {
      state.rescue = state.guard.id;
      state.guard = null;
    }
    const paid = paidCount();
    state.waiters.splice(0).forEach((resolve) => resolve());
    reconcile();
    paint();
    if (state.lastPaid !== null && paid > state.lastPaid) announce(state.lastPaid, paid);
    else openNext();
    state.lastPaid = paid;
  };

  const onClick = (event) => {
    const target = event.target.closest(SELECTORS.action);
    if (!target) return;
    event.preventDefault();
    if (target.hasAttribute(ATTR.pick)) pick(target.getAttribute(ATTR.pick));
    else if (target.hasAttribute(ATTR.choose)) choose(target.getAttribute(ATTR.choose));
    else if (target.hasAttribute(ATTR.open)) openGift(tierOf(target.getAttribute(ATTR.open)), MODES.choose);
    else if (target.hasAttribute(ATTR.overview)) openOverview(target.getAttribute(ATTR.overview));
    else closePopup();
  };

  const onKeydown = (event) => {
    const trigger = event.target.closest && event.target.closest(SELECTORS.trigger);
    if (trigger && ACTIVATE_KEYS.includes(event.key)) {
      event.preventDefault();
      if (trigger.hasAttribute(ATTR.overview)) openOverview(trigger.getAttribute(ATTR.overview));
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
      pick(next.getAttribute(ATTR.pick));
      next.focus();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = [...refs.popupCard.querySelectorAll(SELECTORS.focusable)];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    const outside = !items.includes(active);
    if (event.shiftKey && (outside || active === first)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || (outside && active !== refs.popupCard))) {
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
    const points = TIERS.map((tier) => `<li class="bfg-point" ${ATTR.point}="${tier.key}">${GIFT_ICON}<span class="bfg-point__label">${railLabel(tier.key)}</span></li>`).join('');
    const node = element('div', 'bfg-progress', `<div class="bfg-progress__head"><p class="bfg-progress__msg" aria-live="polite"></p><p class="bfg-progress__ship"></p><p class="bfg-progress__note" hidden></p></div><div class="bfg-bar" role="button" tabindex="0" ${ATTR.overview}="${SOURCES.bar}" aria-label="${copy.see}"><span class="bfg-bar__track" aria-hidden="true"></span><span class="bfg-bar__fill" aria-hidden="true"></span><ol class="bfg-points">${points}</ol></div>`);
    refs.shipping.insertAdjacentElement('afterend', node);
    refs.progress = node;
    refs.message = node.querySelector(SELECTORS.message);
    refs.fill = node.querySelector(SELECTORS.fill);
    refs.ship = node.querySelector(SELECTORS.ship);
    refs.note = node.querySelector(SELECTORS.note);
    refs.bar = node.querySelector(SELECTORS.bar);
    refs.points = {};
    node.querySelectorAll(SELECTORS.point).forEach((point) => {
      refs.points[point.getAttribute(ATTR.point)] = point;
    });
  };

  const buildPopup = () => {
    const node = element('div', 'bfg-pop', `<div class="bfg-pop__backdrop" ${ATTR.close}="backdrop"></div><div class="bfg-pop__card" role="dialog" aria-modal="true" aria-labelledby="${TITLE_ID}" tabindex="-1"><div class="${SITE_CLOSE_CLASS} bfg-pop__close" role="button" tabindex="0" ${ATTR.close}="button" aria-label="${copy.close}"><div class="${SITE_CLOSE_ICON_CLASS}" aria-hidden="true"><div></div><div></div></div></div><div class="bfg-pop__scroll" data-lenis-prevent></div></div>`);
    node.setAttribute('aria-hidden', 'true');
    const texture = document.querySelector(SELECTORS.texture);
    const textureImage = texture ? window.getComputedStyle(texture).backgroundImage : 'none';
    if (textureImage && textureImage !== 'none') node.style.setProperty('--bfg-texture', textureImage);
    document.body.appendChild(node);
    refs.popup = node;
    refs.popupCard = node.querySelector(SELECTORS.card);
    refs.popupBody = node.querySelector(SELECTORS.body);
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
    window.addEventListener(HOST_EVENT, onProductsReady);
    window.addEventListener('online', wake);
    document.addEventListener('visibilitychange', wake);
    refs.checkout = [...document.querySelectorAll(SELECTORS.checkout)];
    const proceed = window.Cart.checkout.bind(window.Cart);
    window.Cart.checkout = () => guard(proceed);
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
