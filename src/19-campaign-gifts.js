(() => {
  const PREVIEW_HOST_PATTERN = /\.webflow\.io$/;
  if (!PREVIEW_HOST_PATTERN.test(window.location.hostname)) return;

  const STOREFRONT = { endpoint: 'https://yokai-sake.myshopify.com/api/2025-01/graphql.json', token: '1432a4269f2a938b1e58ab4c6b49138a' };
  const CART_KEY = 'yokai_cart_id';
  const CHOICE_KEY = 'yokai_bf2026_gifts';
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
  const MOBILE_QUERY = '(max-width: 767px)';
  const NODE_CLASS = 'bfg-node';
  const LINE_CLASS = 'bfg-line';
  const DONE_CLASS = 'is-done';
  const BUSY_CLASS = 'is-busy';
  const CURRENT_CLASS = 'is-current';
  const PICKING_CLASS = 'is-picking';
  const LOG_LABEL = '[yokai-gifts]';
  const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const COLORS = { terra: '#A5512F', ink: '#1F1D21', cream: '#F5EFE1', track: 'rgba(31, 29, 33, 0.15)', hover: 'rgba(31, 29, 33, 0.35)', wash: 'rgba(31, 29, 33, 0.05)' };
  const FONTS = { title: "Optima, 'Palatino Linotype', sans-serif", text: 'ibm-plex-sans-jp, sans-serif' };
  const SOLID_IMAGE = 'https://cdn.prod.website-files.com/694de20134d7a4afc6818bdd/6af16afa84e7ff9e17c2e41b_yokai-bf2026-gift-solid-alpha.webp';

  const TIERS = [
    { key: 'solid', buy: 2, sku: 'SP001', choice: false },
    { key: 'small', buy: 3, skuPattern: /-9$/, choice: true },
    { key: 'large', buy: 5, skuPattern: /-30$/, choice: true }
  ];

  const SELECTORS = {
    shipping: '.shipping-progress',
    shippingMessage: '[data-shipping-msg]',
    shippingBar: '[data-shipping-bar]',
    shippingGoal: '[data-shipping-goal]',
    list: '[data-cart-lines]',
    total: '[data-cart-total]',
    line: '.cart-line',
    lineRemove: '.cart-line-remove',
    lineQuantity: '.cart-line-qty-selector span',
    lineSku: '.cart-line-variant span:last-child',
    linePrice: '.cart-line-price',
    lineControls: '.cart-line-qty',
    product: '[data-shopify-handle]'
  };

  const COPY = {
    en: {
      heading: 'BLACK FRIDAY GIFTS',
      start: 'Buy 2 perfumes for a free solid perfume',
      more: (count, gift) => `${count} more ${count === 1 ? 'perfume' : 'perfumes'} for a free ${gift}`,
      complete: 'You have all three Black Friday gifts',
      step: (buy) => `Buy ${buy}`,
      names: { solid: 'Solid perfume', small: '9 mL perfume', large: '30 mL perfume' },
      inline: { solid: 'solid perfume', small: '9 mL perfume', large: '30 mL perfume' },
      choose: { small: 'Choose your free 9 mL perfume', large: 'Choose your free 30 mL perfume' },
      gift: 'GIFT',
      free: 'Free',
      change: 'CHANGE',
      cancel: 'CLOSE',
      previewNote: 'Preview: gifts are still charged at checkout until the Shopify discounts are set up.',
      solidNote: 'Preview: not in the online store yet.'
    },
    ja: {
      heading: 'BLACK FRIDAY ギフト',
      start: '香水2本で、練り香水をプレゼント',
      more: (count, gift) => `あと${count}本で、${gift}をプレゼント`,
      complete: '3つのギフトすべてをお贈りします',
      step: (buy) => `${buy}本ご購入で`,
      names: { solid: '練り香水', small: '香水 9mL', large: '香水 30mL' },
      inline: { solid: '練り香水', small: '香水 9mL', large: '香水 30mL' },
      choose: { small: 'ギフトの香水 9mL をお選びください', large: 'ギフトの香水 30mL をお選びください' },
      gift: 'ギフト',
      free: '無料',
      change: '変更',
      cancel: '閉じる',
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
  const state = { ready: false, busy: false, lines: [], gifts: {}, solid: null, failed: new Set(), picking: {}, loading: '', hostTotal: 0, expect: { present: [], absent: [] }, waiters: [] };
  const refs = {};

  const css = `
    .bfg-progress{position:relative;z-index:2;margin-top:1rem}
    .bfg-progress::after{content:'';position:absolute;top:100%;left:0;width:100%;height:1.5rem;background:${COLORS.cream};z-index:1;pointer-events:none}
    .bfg-progress__msg{margin:0;font-size:14px;line-height:20px}
    .bfg-steps{list-style:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:.5rem 0 0;padding:0}
    .bfg-step{min-width:0;margin:0;padding:0}
    .bfg-step__track{display:block;height:3px;background:${COLORS.track}}
    .bfg-step__bar{display:block;width:0;height:3px;background:${COLORS.ink};transition:width .7s ${EASE_OUT}}
    .bfg-step__text{display:block;margin-top:7px;font-size:12px;line-height:1.35;opacity:.55;transition:opacity .4s}
    .bfg-step.${DONE_CLASS} .bfg-step__text{opacity:1}
    .bfg-step__buy{display:block;font-size:10.5px;letter-spacing:.12em;color:${COLORS.terra}}
    .bfg-heading{margin:0;padding:1.5rem 0 .25rem;font:400 11px/1 ${FONTS.text};letter-spacing:.24em;color:${COLORS.terra}}
    [data-cart-lines] .cart-line.${LINE_CLASS}{padding:1.25rem 0}
    [data-cart-lines] .cart-line.${LINE_CLASS}.${PICKING_CLASS}{padding-bottom:.75rem;border-bottom:0}
    .${LINE_CLASS} .cart-line-img{width:88px;height:auto;min-height:112px}
    .${LINE_CLASS} .cart-line-info{justify-content:flex-start}
    .${LINE_CLASS} .cart-line-qty{margin:.75rem 0 0}
    .${LINE_CLASS} .bfg-solid-img{object-fit:contain;padding:18px;box-sizing:border-box;background:${COLORS.wash}}
    .bfg-was{margin-right:.6em;opacity:.5}
    .bfg-free{color:${COLORS.terra}}
    .bfg-tag{font:400 11px/1 ${FONTS.text};letter-spacing:.2em;color:${COLORS.terra}}
    [data-cart-lines] .cart-line.bfg-pick{display:block}
    .bfg-pick--change{padding:0 0 1.25rem;border-bottom:1px solid ${COLORS.track}}
    .bfg-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 16px;margin-top:1rem}
    .bfg-pick--change .bfg-options{margin-top:0}
    .bfg-option{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:12px;min-width:0;padding:6px;border:1px solid transparent;cursor:pointer;transition:border-color .3s}
    .bfg-option:hover,.bfg-option.${CURRENT_CLASS}{border-color:${COLORS.hover}}
    .bfg-option:focus-visible{outline:1px solid ${COLORS.ink};outline-offset:2px}
    .bfg-option img{flex:none;width:48px;height:60px;object-fit:cover}
    .bfg-option span{min-width:0;font:400 14px/1.3 ${FONTS.title}}
    .bfg-pick.${BUSY_CLASS}{opacity:.45;pointer-events:none}
    .bfg-note{margin:0;padding:1rem 0 0;font-size:11px;line-height:1.6;opacity:.6}
    @media ${MOBILE_QUERY}{
      .bfg-options{gap:4px 8px}
      .bfg-option{gap:8px;padding:4px}
      .bfg-option img{width:40px;height:50px}
      .bfg-option span{font-size:13px}
    }
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

  const readChoices = () => {
    try {
      return JSON.parse(window.localStorage.getItem(CHOICE_KEY)) || {};
    } catch (error) {
      return {};
    }
  };

  const writeChoice = (key, variantId) => {
    const choices = readChoices();
    if (variantId) choices[key] = variantId;
    else delete choices[key];
    window.localStorage.setItem(CHOICE_KEY, JSON.stringify(choices));
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

  const options = (tier) => {
    if (typeof window.getProduct !== 'function') return [];
    const handles = [...new Set([...document.querySelectorAll(SELECTORS.product)].map((node) => node.dataset.shopifyHandle).filter(Boolean))];
    return handles.map((handle) => {
      const product = window.getProduct(handle);
      const variant = product && product.variants.find((item) => tier.skuPattern.test(item.sku));
      if (!variant || !variant.available || state.failed.has(variant.id)) return null;
      return { variantId: variant.id, sku: variant.sku, name: product.title.replace(TITLE_PREFIX_PATTERN, ''), image: variant.image || product.image };
    }).filter(Boolean);
  };

  const wanted = (tier) => {
    if (!tier.choice) return state.solid ? { variantId: state.solid.variantId, sku: tier.sku } : null;
    const choice = readChoices()[tier.key];
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
        writeChoice(action.tier.key, '');
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

  const decorate = (line, tier) => {
    const node = line.el;
    node.innerHTML = line.html;
    node.className = `${line.className} ${LINE_CLASS}`;
    const picking = tier.choice && state.picking[tier.key];
    if (picking) node.classList.add(PICKING_CLASS);
    const price = node.querySelector(SELECTORS.linePrice);
    if (price) price.innerHTML = `<s class="bfg-was">${yen(line.price)}</s><span class="bfg-free">${copy.free}</span>`;
    const controls = node.querySelector(SELECTORS.lineControls);
    if (controls) controls.innerHTML = `<span class="bfg-tag">${copy.gift}</span>${tier.choice ? `<button type="button" class="cart-line-remove" data-bfg-change="${tier.key}" aria-expanded="${picking ? 'true' : 'false'}">${picking ? copy.cancel : copy.change}</button>` : ''}`;
    return node;
  };

  const picker = (tier, line) => {
    const items = options(tier);
    if (!items.length) return null;
    const node = element('div', `${NODE_CLASS} bfg-pick ${line ? 'bfg-pick--change' : `cart-line ${LINE_CLASS}`}`);
    const head = line ? '' : `<div class="cart-line-title-and-price"><p class="cart-line-title">${copy.choose[tier.key]}</p><p class="cart-line-price"><span class="bfg-free">${copy.free}</span></p></div>`;
    const buttons = items.map((item) => {
      const current = Boolean(line) && line.sku === item.sku;
      return `<button type="button" class="bfg-option${current ? ` ${CURRENT_CLASS}` : ''}" data-bfg-choose="${tier.key}" data-variant-id="${escapeHtml(item.variantId)}" aria-pressed="${current ? 'true' : 'false'}"><img src="${escapeHtml(thumb(item.image))}" alt="" loading="lazy" decoding="async"><span>${escapeHtml(item.name)}</span></button>`;
    }).join('');
    node.innerHTML = `${head}<div class="bfg-options" role="group" aria-label="${copy.choose[tier.key]}">${buttons}</div>`;
    if (state.loading === tier.key) node.classList.add(BUSY_CLASS);
    return node;
  };

  const virtualSolid = () => element('div', `${NODE_CLASS} cart-line ${LINE_CLASS}`, `<img class="cart-line-img bfg-solid-img" src="${SOLID_IMAGE}" alt=""><div class="cart-line-info"><div class="cart-line-info-wrapper"><div class="cart-line-title-and-price"><p class="cart-line-title">${copy.names.solid}</p><p class="cart-line-price"><span class="bfg-free">${copy.free}</span></p></div><p class="cart-line-purfume-style">${copy.solidNote}</p></div><div class="cart-line-qty"><span class="bfg-tag">${copy.gift}</span></div></div>`);

  const paintProgress = (paid) => {
    const next = TIERS.find((tier) => paid < tier.buy);
    if (!next) refs.message.textContent = copy.complete;
    else if (!paid) refs.message.textContent = copy.start;
    else refs.message.textContent = copy.more(next.buy - paid, copy.inline[next.key]);
    TIERS.forEach((tier, index) => {
      const floor = index ? TIERS[index - 1].buy : 0;
      const ratio = Math.max(0, Math.min(1, (paid - floor) / (tier.buy - floor)));
      refs.steps[index].bar.style.width = `${ratio * 100}%`;
      refs.steps[index].node.classList.toggle(DONE_CLASS, paid >= tier.buy);
    });
  };

  const paintLines = (paid) => {
    refs.list.querySelectorAll(`.${NODE_CLASS}`).forEach((node) => node.remove());
    state.lines.filter((line) => state.gifts[line.id]).forEach((line) => line.el.remove());
    const nodes = [];
    TIERS.filter((tier) => paid >= tier.buy).forEach((tier) => {
      const line = giftLines(tier.key)[0];
      if (line) {
        nodes.push(decorate(line, tier));
        if (tier.choice && state.picking[tier.key]) nodes.push(picker(tier, line));
      } else if (tier.choice) {
        nodes.push(picker(tier, null));
      } else if (PREVIEW_ASSUMES_FREE && state.solid === false) {
        nodes.push(virtualSolid());
      }
    });
    const visible = nodes.filter(Boolean);
    if (!visible.length) return;
    refs.list.appendChild(element('p', `${NODE_CLASS} bfg-heading`, copy.heading));
    visible.forEach((node) => refs.list.appendChild(node));
    if (PREVIEW_ASSUMES_FREE) refs.list.appendChild(element('p', `${NODE_CLASS} bfg-note`, copy.previewNote));
  };

  const paintTotals = () => {
    if (!PREVIEW_ASSUMES_FREE) return;
    const value = state.lines.filter((line) => state.gifts[line.id]).reduce((sum, line) => sum + line.price * line.quantity, 0);
    if (!value) return;
    const subtotal = Math.max(0, state.hostTotal - value);
    const total = document.querySelector(SELECTORS.total);
    if (total) total.textContent = yen(subtotal);
    const goalNode = document.querySelector(SELECTORS.shippingGoal);
    const goal = parseYen(goalNode && goalNode.textContent);
    const i18n = window.YokaiI18n;
    if (!goal || !i18n) return;
    const bar = document.querySelector(SELECTORS.shippingBar);
    const message = document.querySelector(SELECTORS.shippingMessage);
    if (bar) bar.style.width = `${Math.min(100, (subtotal / goal) * 100)}%`;
    if (message) message.textContent = subtotal < goal ? i18n.freeShipRemain(goal - subtotal) : i18n.freeShipDone;
  };

  const paint = () => {
    if (!state.ready) return;
    const paid = paidCount();
    refs.observer.disconnect();
    paintProgress(paid);
    paintLines(paid);
    paintTotals();
    refs.observer.observe(refs.list, { childList: true });
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

  const onHostRender = () => {
    state.lines = readLines();
    const total = document.querySelector(SELECTORS.total);
    state.hostTotal = parseYen(total && total.textContent);
    paint();
    if (settled()) state.waiters.splice(0).forEach((resolve) => resolve());
    reconcile();
  };

  const onListClick = (event) => {
    const option = event.target.closest('[data-bfg-choose]');
    const change = event.target.closest('[data-bfg-change]');
    if (option) {
      const key = option.getAttribute('data-bfg-choose');
      writeChoice(key, option.getAttribute('data-variant-id'));
      state.picking[key] = false;
      state.loading = key;
      paint();
      reconcile();
      return;
    }
    if (!change) return;
    const key = change.getAttribute('data-bfg-change');
    state.picking[key] = !state.picking[key];
    paint();
  };

  const onProductsReady = () => {
    paint();
    reconcile();
  };

  const buildProgress = () => {
    const steps = TIERS.map((tier) => `<li class="bfg-step"><span class="bfg-step__track"><span class="bfg-step__bar"></span></span><span class="bfg-step__text"><span class="bfg-step__buy">${copy.step(tier.buy)}</span>${copy.names[tier.key]}</span></li>`).join('');
    const node = element('div', 'bfg-progress', `<p class="bfg-progress__msg" aria-live="polite"></p><ol class="bfg-steps">${steps}</ol>`);
    refs.shipping.insertAdjacentElement('afterend', node);
    refs.message = node.querySelector('.bfg-progress__msg');
    refs.steps = [...node.querySelectorAll('.bfg-step')].map((step) => ({ node: step, bar: step.querySelector('.bfg-step__bar') }));
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
    if (!refs.list || !refs.shipping) return;
    document.head.appendChild(element('style', '', css));
    buildProgress();
    refs.observer = new MutationObserver(onHostRender);
    refs.list.addEventListener('click', onListClick);
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
