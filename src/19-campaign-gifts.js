(() => {
  const PREVIEW_HOST_PATTERN = /\.webflow\.io$/;
  if (!PREVIEW_HOST_PATTERN.test(window.location.hostname)) return;

  const STOREFRONT = { endpoint: 'https://yokai-sake.myshopify.com/api/2025-01/graphql.json', token: '1432a4269f2a938b1e58ab4c6b49138a' };
  const CART_KEY = 'yokai_cart_id';
  const STORE_KEY = 'yokai_bf2026_gifts';
  const GIFT_ATTRIBUTE = '_yokai_gift';
  const PAID_SKU_PATTERN = /^PF\d+/;
  const TITLE_PREFIX_PATTERN = /^YOKAI Perfume\s*-\s*/i;
  const LINE_ID_PATTERN = /Cart\.remove\('([^']+)'\)/;
  const JA_PATH_PATTERN = /^\/ja(\/|$)/;
  const NON_NUMERIC_PATTERN = /[^\d.-]/g;
  const ESCAPE_PATTERN = /[&<>"']/g;
  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const PREVIEW_ASSUMES_FREE = true;
  const MAX_ROUNDS = 6;
  const HOST_POLL_INTERVAL = 250;
  const HOST_POLL_LIMIT = 80;
  const HOST_RENDER_TIMEOUT = 5000;
  const THUMB_WIDTH = 160;
  const CLOSE_CLEARANCE = 72;
  const POINT_SIZE = 22;
  const TRACK_HEIGHT = 3;
  const LABEL_WIDTH = 60;
  const MOBILE_QUERY = '(max-width: 767px)';
  const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
  const Z_INDEX = { popup: 10010 };
  const CARD_WIDTH = { notice: 520, choice: 680 };
  const TRACK_ACTIONS = { unlock: 'gift_unlock', choose: 'gift_choose' };
  const DURATION = { backdrop: 600, card: 700, close: 420 };
  const NODE_CLASS = 'bfg-node';
  const LINE_CLASS = 'bfg-line';
  const OFF_CLASS = 'bfg-off';
  const DONE_CLASS = 'is-done';
  const BUSY_CLASS = 'is-busy';
  const CURRENT_CLASS = 'is-current';
  const VISIBLE_CLASS = 'is-visible';
  const OPEN_CLASS = 'is-open';
  const CHOICE_CLASS = 'bfg-pop--choice';
  const SITE_CLOSE_CLASS = 'close-svg';
  const SITE_CLOSE_ICON_CLASS = 'close-x';
  const ACTIVATE_KEYS = ['Enter', ' '];
  const MODES = { unlock: 'unlock', choose: 'choose' };
  const LOG_LABEL = '[yokai-gifts]';
  const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const EASE_IN = 'cubic-bezier(0.7, 0, 0.84, 0)';
  const COLORS = { terra: '#A5512F', ink: '#1F1D21', cream: '#F5EFE1', track: 'rgba(31, 29, 33, 0.15)', hover: 'rgba(31, 29, 33, 0.35)', wash: 'rgba(31, 29, 33, 0.05)', backdrop: 'rgba(20, 16, 18, 0.5)' };
  const FONTS = { title: "Optima, 'Palatino Linotype', sans-serif", text: 'ibm-plex-sans-jp, sans-serif' };
  const GIFT_IMAGES = {
    solid: 'https://cdn.prod.website-files.com/694de20134d7a4afc6818bdd/6af16afa84e7ff9e17c2e41b_yokai-bf2026-gift-solid-alpha.webp',
    small: 'https://cdn.prod.website-files.com/694de20134d7a4afc6818bdd/6af16afa434edee758053e8e_yokai-bf2026-gift-9ml-alpha.webp',
    large: 'https://cdn.prod.website-files.com/694de20134d7a4afc6818bdd/6af16afa84e7ff9e17c2e3fe_yokai-bf2026-gift-30ml-alpha.webp'
  };

  const TIERS = [
    { key: 'solid', buy: 2, sku: 'SP001', choice: false },
    { key: 'small', buy: 3, skuPattern: /-9$/, choice: true },
    { key: 'large', buy: 5, skuPattern: /-30$/, choice: true }
  ];

  const SELECTORS = {
    shipping: '.shipping-progress',
    shippingGoal: '[data-shipping-goal]',
    list: '[data-cart-lines]',
    total: '[data-cart-total]',
    line: '.cart-line',
    lineRemove: '.cart-line-remove',
    lineQuantity: '.cart-line-qty-selector span',
    lineSku: '.cart-line-variant span:last-child',
    linePrice: '.cart-line-price',
    lineControls: '.cart-line-qty',
    product: '[data-shopify-handle]',
    texture: '.news--lightbox-content',
    focusable: 'button, [href], [tabindex]:not([tabindex="-1"])',
    action: '[data-bfg-choose], [data-bfg-open], [data-bfg-close]'
  };

  const COPY = {
    en: {
      start: 'Buy 2 perfumes for a free solid perfume',
      more: (count, gift) => `${count} more ${count === 1 ? 'perfume' : 'perfumes'} for a free ${gift}`,
      complete: 'You have all three gifts',
      rail: { solid: ['Solid', 'perfume'], small: ['9 mL', 'perfume'], large: ['30 mL', 'perfume'] },
      names: { solid: 'Solid perfume', small: '9 mL perfume', large: '30 mL perfume' },
      inline: { solid: 'solid perfume', small: '9 mL perfume', large: '30 mL perfume' },
      choose: { small: 'Choose your free 9 mL perfume', large: 'Choose your free 30 mL perfume' },
      unlocked: { solid: "You've unlocked a free solid perfume", small: "You've unlocked a free 9 mL perfume", large: "You've unlocked a free 30 mL perfume" },
      added: "We've added it to your cart.",
      pickLead: 'Choose your scent.',
      gift: 'Gift',
      free: 'Free',
      pick: 'CHOOSE SCENT',
      change: 'CHANGE',
      later: 'Choose later',
      proceed: 'Continue',
      close: 'Close',
      previewNote: 'Preview: gifts are still charged at checkout until the Shopify discounts are set up.',
      solidNote: 'Preview: not in the online store yet.'
    },
    ja: {
      start: '香水2本で、練り香水をプレゼント',
      more: (count, gift) => `あと${count}本で、${gift}をプレゼント`,
      complete: '3つのギフトすべてをお贈りします',
      rail: { solid: ['練り香水'], small: ['香水 9mL'], large: ['香水 30mL'] },
      names: { solid: '練り香水', small: '香水 9mL', large: '香水 30mL' },
      inline: { solid: '練り香水', small: '香水 9mL', large: '香水 30mL' },
      choose: { small: 'ギフトの香水 9mL を選ぶ', large: 'ギフトの香水 30mL を選ぶ' },
      unlocked: { solid: '練り香水をプレゼント', small: '香水 9mL をプレゼント', large: '香水 30mL をプレゼント' },
      added: 'カートに追加しました。',
      pickLead: 'お好きな香りをお選びください。',
      gift: 'ギフト',
      free: '無料',
      pick: '香りを選ぶ',
      change: '変更',
      later: 'あとで選ぶ',
      proceed: 'お買い物を続ける',
      close: '閉じる',
      previewNote: 'プレビュー：Shopifyの割引設定が完了するまで、ギフトはチェックアウトで課金されます。',
      solidNote: 'プレビュー：オンラインストアには未登録です。'
    }
  };

  const CART_FIELDS = 'id lines(first: 50) { edges { node { id quantity attributes { key value } merchandise { ... on ProductVariant { id sku } } } } }';

  const QUERIES = {
    cart: `query($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`,
    add: `mutation($id: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $id, lines: $lines) { cart { ${CART_FIELDS} } } }`,
    update: `mutation($id: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $id, lines: $lines) { cart { ${CART_FIELDS} } } }`,
    remove: `mutation($id: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $id, lineIds: $lineIds) { cart { ${CART_FIELDS} } } }`,
    search: 'query($query: String!) { search(query: $query, first: 5, types: PRODUCT) { edges { node { ... on Product { variants(first: 10) { edges { node { id sku availableForSale } } } } } } } }'
  };

  const copy = COPY[JA_PATH_PATTERN.test(window.location.pathname) ? 'ja' : 'en'];
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  const state = { ready: false, busy: false, lines: [], gifts: {}, solid: null, failed: new Set(), loading: '', hostTotal: 0, lastPaid: null, queue: [], popup: null, returnFocus: null, scrollLocked: false, resumeScroll: false, messageHtml: '', expect: { present: [], absent: [] }, waiters: [] };
  const refs = {};

  const css = `
    .shipping-progress.${OFF_CLASS}{position:absolute;visibility:hidden;pointer-events:none}
    .bfg-progress{position:relative;z-index:2}
    .bfg-progress::after{content:'';position:absolute;top:100%;left:0;width:100%;height:1.5rem;background:${COLORS.cream};z-index:1;pointer-events:none}
    .bfg-progress__msg{margin:0;font-size:14px;line-height:20px}
    .bfg-progress__link{all:unset;cursor:pointer;color:${COLORS.terra};border-bottom:1px solid currentColor}
    .bfg-progress__link:focus-visible{outline:1px solid ${COLORS.ink};outline-offset:3px}
    .bfg-bar{position:relative;height:${POINT_SIZE}px;margin:10px ${POINT_SIZE / 2}px 26px 0}
    .bfg-points{margin:0;padding:0;list-style:none}
    .bfg-bar__track,.bfg-bar__fill{position:absolute;top:50%;left:0;height:${TRACK_HEIGHT}px;margin-top:-${TRACK_HEIGHT / 2}px}
    .bfg-bar__track{right:0;background:${COLORS.track}}
    .bfg-bar__fill{width:0;background:${COLORS.ink};transition:width .7s ${EASE_OUT}}
    .bfg-point{position:absolute;top:0;box-sizing:border-box;width:${POINT_SIZE}px;height:${POINT_SIZE}px;margin:0 0 0 -${POINT_SIZE / 2}px;padding:0;border:1px solid ${COLORS.hover};border-radius:50%;background:${COLORS.cream};color:${COLORS.ink};font:400 11px/${POINT_SIZE - 2}px ${FONTS.text};text-align:center;transition:background-color .4s .25s,border-color .4s .25s,color .4s .25s}
    .bfg-point.${DONE_CLASS}{border-color:${COLORS.ink};background:${COLORS.ink};color:${COLORS.cream}}
    .bfg-point__label{position:absolute;top:${POINT_SIZE + 6}px;left:50%;transform:translateX(-50%);white-space:nowrap;font:400 12px/1.3 ${FONTS.text};color:${COLORS.ink};opacity:.55;transition:opacity .4s .25s}
    .bfg-point.${DONE_CLASS} .bfg-point__label{opacity:1}
    .bfg-point:last-child .bfg-point__label{left:auto;right:0;transform:none;text-align:right}
    .bfg-progress__ship{margin:0;font-size:12px;line-height:18px;opacity:.6}
    [data-cart-lines] .cart-line.${LINE_CLASS}{padding:1.25rem 0}
    .${LINE_CLASS} .cart-line-img{width:88px;height:112px}
    .${LINE_CLASS} .cart-line-info{justify-content:flex-start}
    .${LINE_CLASS} .cart-line-qty{margin:.75rem 0 0}
    .${LINE_CLASS} .cart-line-price{white-space:nowrap;padding-left:.75rem}
    .${LINE_CLASS} .bfg-gift-img{object-fit:contain;padding:14px;box-sizing:border-box;background:${COLORS.wash}}
    .${LINE_CLASS}.${BUSY_CLASS}{opacity:.45;pointer-events:none}
    .bfg-was{margin-right:.6em;opacity:.5}
    .bfg-free{color:${COLORS.terra}}
    .bfg-tag{font-size:14px;opacity:.6}
    .bfg-note{margin:0;padding:1rem 0 0;font-size:11px;line-height:1.6;opacity:.6}
    .bfg-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px 12px;margin:0 0 22px}
    .bfg-option{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:12px;min-width:0;padding:6px;border:1px solid transparent;cursor:pointer;transition:border-color .3s}
    .bfg-option:hover,.bfg-option.${CURRENT_CLASS}{border-color:${COLORS.hover}}
    .bfg-option:focus-visible{outline:1px solid ${COLORS.ink};outline-offset:2px}
    .bfg-option img{flex:none;width:48px;height:60px;object-fit:cover}
    .bfg-option span{min-width:0;font:400 14px/1.3 ${FONTS.title}}
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
    .bfg-pop__title,.bfg-pop__lead{word-break:keep-all;overflow-wrap:anywhere}
    .bfg-pop__lead{margin:0 0 20px;font:400 13px/1.8 ${FONTS.text};letter-spacing:.04em}
    .bfg-pop__gift{display:flex;align-items:center;gap:20px;margin:0 0 26px}
    .bfg-pop__gift img{flex:none;width:88px;height:88px;object-fit:contain}
    .bfg-pop__gift .bfg-pop__lead{margin:0}
    .bfg-pop__actions{display:flex;align-items:center;gap:24px}
    .bfg-pop__cta{all:unset;box-sizing:border-box;padding:16px 32px;background:${COLORS.ink};color:${COLORS.cream};font:400 12px/1 ${FONTS.text};letter-spacing:.16em;text-align:center;cursor:pointer;transition:opacity .3s}
    .bfg-pop__cta:hover{opacity:.85}
    .bfg-pop__later{all:unset;padding-bottom:3px;border-bottom:1px solid currentColor;font:400 12px/1 ${FONTS.text};letter-spacing:.12em;opacity:.7;cursor:pointer}
    .bfg-pop__cta:focus-visible,.bfg-pop__later:focus-visible{outline:1px solid ${COLORS.ink};outline-offset:3px}
    .bfg-pop__close:focus-visible{outline:1px solid ${COLORS.ink};outline-offset:-8px}
    @media ${MOBILE_QUERY}{
      .bfg-bar{margin-bottom:38px}
      .bfg-point__label{width:${LABEL_WIDTH}px;white-space:normal;font-size:11px;text-align:center}
      .bfg-point__wrap{display:block}
      .bfg-options{grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 8px}
      .bfg-option{gap:8px;padding:4px}
      .bfg-option img{width:40px;height:50px}
      .bfg-option span{font-size:13px}
      .bfg-pop{align-items:flex-end}
      .bfg-pop .bfg-pop__card{width:100%;max-height:88vh;max-height:88dvh;opacity:1;transform:translateY(100%)}
      .bfg-pop.${OPEN_CLASS} .bfg-pop__card{transform:none}
      .bfg-pop__scroll{padding:30px 20px calc(24px + env(safe-area-inset-bottom))}
      .bfg-pop__title{font-size:22px}
      .bfg-pop__gift img{width:72px;height:72px}
      .bfg-pop__cta{flex:1}
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

  const request = (query, variables) => window.fetch(STOREFRONT.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': STOREFRONT.token },
    body: JSON.stringify({ query, variables })
  }).then((response) => response.json()).then((payload) => payload.data || {});

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

  const snapshotGifts = (cart) => {
    const gifts = [];
    if (!cart) return gifts;
    cart.lines.edges.forEach(({ node }) => {
      const attribute = node.attributes.find((item) => item.key === GIFT_ATTRIBUTE);
      if (attribute) gifts.push({ lineId: node.id, key: attribute.value, variantId: node.merchandise.id });
    });
    return gifts;
  };

  const adopt = (cart) => {
    state.gifts = {};
    snapshotGifts(cart).forEach((gift) => {
      state.gifts[gift.lineId] = gift.key;
    });
  };

  const readLines = () => [...refs.list.querySelectorAll(SELECTORS.line)].map((node) => {
    const remove = node.querySelector(SELECTORS.lineRemove);
    const match = LINE_ID_PATTERN.exec((remove && remove.getAttribute('onclick')) || '');
    const quantity = node.querySelector(SELECTORS.lineQuantity);
    const sku = node.querySelector(SELECTORS.lineSku);
    const price = node.querySelector(SELECTORS.linePrice);
    return {
      el: node,
      html: node.innerHTML,
      className: node.className,
      id: match ? match[1] : '',
      quantity: Number(quantity && quantity.textContent) || 1,
      sku: sku ? sku.textContent.trim() : '',
      price: parseYen(price && price.textContent)
    };
  }).filter((line) => line.id);

  const paidCount = () => state.lines.filter((line) => !state.gifts[line.id] && PAID_SKU_PATTERN.test(line.sku)).reduce((sum, line) => sum + line.quantity, 0);

  const giftLines = (key) => state.lines.filter((line) => state.gifts[line.id] === key);

  const giftValue = () => state.lines.filter((line) => state.gifts[line.id]).reduce((sum, line) => sum + line.price * line.quantity, 0);

  const subtotal = () => (state.lines.length ? Math.max(0, state.hostTotal - (PREVIEW_ASSUMES_FREE ? giftValue() : 0)) : 0);

  const options = (tier) => {
    if (!tier.choice || typeof window.getProduct !== 'function') return [];
    const handles = [...new Set([...document.querySelectorAll(SELECTORS.product)].map((node) => node.dataset.shopifyHandle).filter(Boolean))];
    return handles.map((handle) => {
      const product = window.getProduct(handle);
      const variant = product && product.variants.find((item) => tier.skuPattern.test(item.sku));
      if (!variant || !variant.available || state.failed.has(variant.id)) return null;
      return { variantId: variant.id, sku: variant.sku, name: product.title.replace(TITLE_PREFIX_PATTERN, ''), image: variant.image || product.image };
    }).filter(Boolean);
  };

  const offered = (tier) => (tier.choice ? options(tier).length > 0 : Boolean(state.solid) || PREVIEW_ASSUMES_FREE);

  const wanted = (tier) => {
    if (!tier.choice) return state.solid ? { variantId: state.solid.variantId, sku: tier.sku } : null;
    const choice = readStore().choices[tier.key];
    return options(tier).find((option) => option.variantId === choice) || null;
  };

  const plan = () => {
    const paid = paidCount();
    const actions = [];
    TIERS.forEach((tier) => {
      const lines = giftLines(tier.key);
      if (paid < tier.buy) {
        lines.forEach((line) => actions.push({ type: 'remove', lineId: line.id }));
        return;
      }
      lines.slice(1).forEach((line) => actions.push({ type: 'remove', lineId: line.id }));
      const current = lines[0];
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
      } else {
        state.solid = false;
      }
    });
    state.expect = { present: gifts.map((gift) => gift.lineId), absent: actions.filter((action) => action.type === 'remove').map((action) => action.lineId) };
  };

  const settled = () => {
    const ids = new Set(state.lines.map((line) => line.id));
    return state.expect.present.every((id) => ids.has(id)) && state.expect.absent.every((id) => !ids.has(id));
  };

  const refreshHost = () => new Promise((resolve) => {
    const timer = window.setTimeout(resolve, HOST_RENDER_TIMEOUT);
    state.waiters.push(() => {
      window.clearTimeout(timer);
      resolve();
    });
    window.Cart.init();
  });

  const shippingState = () => {
    const goalNode = document.querySelector(SELECTORS.shippingGoal);
    const goal = parseYen(goalNode && goalNode.textContent);
    const i18n = window.YokaiI18n;
    if (!goal || !i18n) return null;
    const remain = Math.max(0, goal - subtotal());
    return { goal, ratio: Math.min(1, subtotal() / goal), done: remain === 0, message: remain ? i18n.freeShipRemain(remain) : i18n.freeShipDone };
  };

  const openChoice = (paid) => TIERS.find((tier) => tier.choice && paid >= tier.buy && !giftLines(tier.key).length && offered(tier));

  const nextMessage = (paid) => {
    const next = TIERS.find((tier) => paid < tier.buy);
    if (!next) return '';
    return paid ? copy.more(next.buy - paid, copy.inline[next.key]) : copy.start;
  };

  const message = (paid) => {
    const open = openChoice(paid);
    if (open) return `<button type="button" class="bfg-progress__link" data-bfg-open="${open.key}">${copy.choose[open.key]}</button>`;
    return nextMessage(paid) || copy.complete;
  };

  const paintProgress = (paid) => {
    const goal = TIERS[TIERS.length - 1].buy;
    refs.fill.style.width = `${Math.min(1, paid / goal) * 100}%`;
    TIERS.forEach((tier) => refs.points[tier.key].classList.toggle(DONE_CLASS, paid >= tier.buy));
    const shipping = shippingState();
    refs.ship.textContent = shipping ? shipping.message : '';
    const html = message(paid);
    if (state.messageHtml === html) return;
    state.messageHtml = html;
    refs.message.innerHTML = html;
  };

  const decorate = (line, tier) => {
    const node = line.el;
    node.innerHTML = line.html;
    node.className = `${line.className} ${LINE_CLASS}`;
    const price = node.querySelector(SELECTORS.linePrice);
    if (price) price.innerHTML = `<s class="bfg-was">${yen(line.price)}</s><span class="bfg-free">${copy.free}</span>`;
    const controls = node.querySelector(SELECTORS.lineControls);
    if (controls) controls.innerHTML = `<span class="bfg-tag">${copy.gift}</span>${tier.choice ? `<button type="button" class="cart-line-remove" data-bfg-open="${tier.key}">${copy.change}</button>` : ''}`;
    if (state.loading === tier.key) node.classList.add(BUSY_CLASS);
    return node;
  };

  const placeholder = (tier) => {
    const detail = tier.choice ? '' : `<p class="cart-line-purfume-style">${copy.solidNote}</p>`;
    const action = tier.choice ? `<button type="button" class="cart-line-remove" data-bfg-open="${tier.key}">${copy.pick}</button>` : '';
    const node = element('div', `${NODE_CLASS} cart-line ${LINE_CLASS}`, `<img class="cart-line-img bfg-gift-img" src="${GIFT_IMAGES[tier.key]}" alt=""><div class="cart-line-info"><div class="cart-line-info-wrapper"><div class="cart-line-title-and-price"><p class="cart-line-title">${copy.names[tier.key]}</p><p class="cart-line-price"><span class="bfg-free">${copy.free}</span></p></div>${detail}</div><div class="cart-line-qty"><span class="bfg-tag">${copy.gift}</span>${action}</div></div>`);
    if (state.loading === tier.key) node.classList.add(BUSY_CLASS);
    return node;
  };

  const paintLines = (paid) => {
    refs.list.querySelectorAll(`.${NODE_CLASS}`).forEach((node) => node.remove());
    state.lines.filter((line) => state.gifts[line.id]).forEach((line) => line.el.remove());
    const nodes = [];
    TIERS.filter((tier) => paid >= tier.buy).forEach((tier) => {
      const line = giftLines(tier.key)[0];
      if (line) nodes.push(decorate(line, tier));
      else if (tier.choice ? offered(tier) : PREVIEW_ASSUMES_FREE && state.solid === false) nodes.push(placeholder(tier));
    });
    if (!nodes.length) return;
    nodes.forEach((node) => refs.list.appendChild(node));
    if (PREVIEW_ASSUMES_FREE) refs.list.appendChild(element('p', `${NODE_CLASS} bfg-note`, copy.previewNote));
  };

  const paintTotal = () => {
    if (!PREVIEW_ASSUMES_FREE || !giftValue()) return;
    const total = document.querySelector(SELECTORS.total);
    if (total) total.textContent = yen(subtotal());
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
    paintTotal();
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

  const popupBody = (tier, mode) => {
    const title = mode === MODES.unlock ? copy.unlocked[tier.key] : copy.choose[tier.key];
    const head = `<h2 class="bfg-pop__title" id="bfg-pop-title">${title}</h2>`;
    if (!tier.choice) {
      const nudge = nextMessage(paidCount());
      return `${head}<div class="bfg-pop__gift"><img src="${GIFT_IMAGES[tier.key]}" alt=""><p class="bfg-pop__lead">${copy.added}${nudge ? `<br>${nudge}` : ''}</p></div><div class="bfg-pop__actions"><button type="button" class="bfg-pop__cta" data-bfg-close="proceed">${copy.proceed}</button></div>`;
    }
    const line = giftLines(tier.key)[0];
    const buttons = options(tier).map((item) => {
      const current = Boolean(line) && line.sku === item.sku;
      return `<button type="button" class="bfg-option${current ? ` ${CURRENT_CLASS}` : ''}" data-bfg-choose="${tier.key}" data-variant-id="${escapeHtml(item.variantId)}" aria-pressed="${current ? 'true' : 'false'}"><img src="${escapeHtml(thumb(item.image))}" alt="" decoding="async"><span>${escapeHtml(item.name)}</span></button>`;
    }).join('');
    const lead = mode === MODES.unlock ? `<p class="bfg-pop__lead">${copy.pickLead}</p>` : '';
    return `${head}${lead}<div class="bfg-options" role="group" aria-label="${copy.choose[tier.key]}">${buttons}</div><div class="bfg-pop__actions"><button type="button" class="bfg-pop__later" data-bfg-close="later">${line ? copy.close : copy.later}</button></div>`;
  };

  const openPopup = (tier, mode) => {
    if (state.popup || !offered(tier)) return false;
    state.popup = tier.key;
    state.returnFocus = document.activeElement;
    refs.popupBody.innerHTML = popupBody(tier, mode);
    refs.popup.classList.toggle(CHOICE_CLASS, tier.choice);
    refs.popupBody.scrollTop = 0;
    refs.popup.classList.add(VISIBLE_CLASS);
    refs.popup.setAttribute('aria-hidden', 'false');
    refs.popupCard.getBoundingClientRect();
    window.requestAnimationFrame(() => refs.popup.classList.add(OPEN_CLASS));
    lockScroll(true);
    refs.popupCard.focus({ preventScroll: true });
    return true;
  };

  const openNext = () => {
    while (!state.popup && state.queue.length) {
      const tier = tierOf(state.queue.shift());
      if (paidCount() >= tier.buy && openPopup(tier, MODES.unlock)) {
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

  const reconcile = async () => {
    if (!state.ready || state.busy) return;
    state.busy = true;
    try {
      for (let round = 0; round < MAX_ROUNDS; round += 1) {
        const actions = plan();
        if (!actions.length) break;
        const cart = await apply(actions);
        if (!cart) break;
        adopt(cart);
        verify(actions, cart);
        await refreshHost();
      }
    } catch (error) {
      window.console.warn(LOG_LABEL, error);
    } finally {
      state.busy = false;
      state.loading = '';
      paint();
    }
  };

  const choose = (key, variantId) => {
    setChoice(key, variantId);
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
    if (settled()) state.waiters.splice(0).forEach((resolve) => resolve());
    if (state.lastPaid !== null && paid > state.lastPaid) announce(state.lastPaid, paid);
    state.lastPaid = paid;
    reconcile();
  };

  const onClick = (event) => {
    const target = event.target.closest(SELECTORS.action);
    if (!target) return;
    event.preventDefault();
    if (target.hasAttribute('data-bfg-choose')) choose(target.getAttribute('data-bfg-choose'), target.getAttribute('data-variant-id'));
    else if (target.hasAttribute('data-bfg-open')) openPopup(tierOf(target.getAttribute('data-bfg-open')), MODES.choose);
    else closePopup();
  };

  const onKeydown = (event) => {
    if (!state.popup) return;
    if (event.key === 'Escape') {
      event.stopPropagation();
      closePopup();
      return;
    }
    const closer = event.target.closest && event.target.closest('[data-bfg-close]');
    if (closer && closer.getAttribute('role') === 'button' && ACTIVATE_KEYS.includes(event.key)) {
      event.preventDefault();
      closePopup();
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
    const goal = TIERS[TIERS.length - 1].buy;
    const points = TIERS.map((tier) => `<li class="bfg-point" data-bfg-point="${tier.key}" style="left:${(tier.buy / goal) * 100}%">${tier.buy}<span class="bfg-point__label">${railLabel(tier.key)}</span></li>`).join('');
    const node = element('div', 'bfg-progress', `<p class="bfg-progress__msg" aria-live="polite"></p><div class="bfg-bar"><span class="bfg-bar__track" aria-hidden="true"></span><span class="bfg-bar__fill" aria-hidden="true"></span><ol class="bfg-points">${points}</ol></div><p class="bfg-progress__ship"></p>`);
    refs.shipping.classList.add(OFF_CLASS);
    refs.shipping.insertAdjacentElement('afterend', node);
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

  const findSolid = () => {
    const tier = TIERS.find((item) => !item.choice);
    return request(QUERIES.search, { query: tier.sku }).then((data) => {
      const variants = ((data.search || {}).edges || []).flatMap((edge) => ((edge.node.variants || {}).edges || []).map((item) => item.node));
      const variant = variants.find((item) => item.sku === tier.sku && item.availableForSale);
      return variant ? { variantId: variant.id } : false;
    });
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
    try {
      const [cart, solid] = await Promise.all([loadCart(), findSolid().catch(() => false)]);
      adopt(cart);
      state.solid = solid;
    } catch (error) {
      window.console.warn(LOG_LABEL, error);
      state.solid = false;
    }
    state.ready = true;
    onHostRender();
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
