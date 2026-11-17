!(function () {
  "use strict";
  var API = "https://yokai-sake.myshopify.com/api/2025-01/graphql.json";
  var TOKEN = "1432a4269f2a938b1e58ab4c6b49138a";
  var KEY = "yokai_cart_id";
  var REF_KEY = "yokai_ref";
  var REF_PARAMS = ["ref", "aff"];
  var REF_CLEAR_PARAM = "noref";
  var REF_ATTRIBUTE = "__ref";
  var REF_LIFETIME = 604800000;
  var REF_PATTERN = /^[\w.-]{1,64}$/;

  // ---- i18n（路徑第一段是 ja 就用日文，否則英文） ----
  var IS_JA = window.location.pathname.split("/").filter(Boolean)[0] === "ja";
  var T = IS_JA
    ? {
        remove: "削除",
        addToCart: "カートに入れる",
        soldOut: "売り切れ",
        decrease: "数量を減らす",
        increase: "数量を増やす",
        freeShipRemain: function (r) {
          return "あと" + yen(r) + "で送料無料";
        },
        freeShipDone: "送料無料になりました",
      }
    : {
        remove: "REMOVE",
        addToCart: "Add To Cart",
        soldOut: "SOLD OUT",
        decrease: "Decrease quantity",
        increase: "Increase quantity",
        freeShipRemain: function (r) {
          return yen(r) + " away from free shipping";
        },
        freeShipDone: "You've got free shipping",
      };
  window.YokaiI18n = T;

  var CART_FIELDS = `
  id checkoutUrl totalQuantity
  attributes { key value }
  cost { subtotalAmount { amount } }
  lines(first: 50) { edges { node {
    id quantity
    merchandise { ... on ProductVariant {
      id sku title image { url } price { amount } product { title }
    }}
  }}}`;

  function gql(query, variables) {
    return fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN,
      },
      body: JSON.stringify({ query: query, variables: variables }),
    }).then(function (r) {
      return r.json();
    });
  }

  var cart = null;
  var productCache = {};

  function yen(n) {
    return "¥" + Math.round(Number(n)).toLocaleString("en-US");
  }

  // ---- Products Info ----
  window.fetchProducts = function (handles) {
    var q = handles
      .map(function (h, i) {
        return `p${i}: product(handle: "${h}") {
      title
      images(first: 1) { edges { node { url } } }
      variants(first: 20) { edges { node {
        id title sku price { amount } availableForSale image { url }
      } } }
    }`;
      })
      .join("\n");

    return gql("{" + q + "}").then(function (d) {
      handles.forEach(function (h, i) {
        var p = d?.data?.["p" + i];
        if (!p) return;
        var vs = (p.variants?.edges || []).map(function (e) {
          var v = e.node;
          return {
            id: v.id,
            title: v.title,
            sku: v.sku || "",
            price: v.price?.amount || "",
            available: v.availableForSale !== false,
            image: v.image?.url || "",
          };
        });
        var first =
          vs.find(function (v) {
            return v.available;
          }) ||
          vs[0] ||
          {};
        productCache[h] = {
          title: p.title,
          image: p.images?.edges?.[0]?.node?.url || "",
          variants: vs,
          price: first.price || "",
          variantId: first.id || "",
          available: first.available !== false,
        };
      });
      window.dispatchEvent(new Event("shopify-products-ready"));
      return productCache;
    });
  };

  window.getProduct = function (handle) {
    return productCache[handle];
  };

  // ---- Cart ----
  var FREE_SHIPPING_THRESHOLD = 12000;

  function renderShipping() {
    var bar = document.querySelector("[data-shipping-bar]");
    var msg = document.querySelector("[data-shipping-msg]");
    var goal = document.querySelector("[data-shipping-goal]");
    if (!bar && !msg && !goal) return;
    var subtotal = Number(cart?.cost?.subtotalAmount?.amount || 0);
    var remain = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    var pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
    if (bar) bar.style.width = pct + "%";
    if (msg)
      msg.textContent = remain > 0 ? T.freeShipRemain(remain) : T.freeShipDone;
    if (goal) goal.textContent = yen(FREE_SHIPPING_THRESHOLD);
  }

  function render() {
    var counts = document.querySelectorAll("[data-cart-count]");
    var list = document.querySelector("[data-cart-lines]");
    var total = document.querySelector("[data-cart-total]");
    var empty = document.querySelector("[data-cart-empty]");

    var qty = cart?.totalQuantity || 0;
    counts.forEach(function (el) {
      el.textContent = qty;
    });
    if (total && cart?.cost)
      total.textContent = yen(cart.cost.subtotalAmount.amount);
    if (empty) empty.style.display = qty === 0 ? "" : "none";
    renderShipping();
    if (!list) return;

    var lines = cart?.lines?.edges || [];
    list.innerHTML = lines
      .map(function (e) {
        var n = e.node,
          m = n.merchandise;
        return `
      <div class="cart-line">
        ${m.image ? `<img class="cart-line-img" src="${m.image.url}" alt="">` : ""}
        <div class="cart-line-info">
            <div class='cart-line-info-wrapper'>
                <div class="cart-line-title-and-price">
                    <p class="cart-line-title">${m.product.title}</p>
                    <p class="cart-line-price">${yen(m.price.amount)}</p>
                </div>
                <p class='cart-line-purfume-style'>EAU DE PARFUM</p>
                <p class="cart-line-variant">${[m.title, m.sku]
                  .filter(Boolean)
                  .map(function (v) {
                    return `<span>${v}</span>`;
                  })
                  .join('<span class="cart-line-variant-sep"> / </span>')}</p>
            </div>
            <div class="cart-line-qty">
                <div class='cart-line-qty-selector'>
                    <button onclick="Cart.setQty('${n.id}', ${n.quantity - 1})" class='cart-line-qty-selector-minus' aria-label="${T.decrease}"></button>
                        <span>${n.quantity}</span>
                    <button onclick="Cart.setQty('${n.id}', ${n.quantity + 1})" class='cart-line-qty-selector-plus' aria-label="${T.increase}"></button>
                </div>
                <button class="cart-line-remove" onclick="Cart.remove('${n.id}')">${T.remove}</button>
            </div>
        </div>
      </div>`;
      })
      .join("");
  }

  function save(c) {
    cart = c;
    if (c) localStorage.setItem(KEY, c.id);
    else localStorage.removeItem(KEY);
    render();
  }

  var queue = Promise.resolve();

  function mutate(query, variables) {
    var run = queue.then(function () {
      return gql(query, variables);
    });
    queue = run.catch(function () {});
    return run;
  }

  function readRef() {
    try {
      var saved = JSON.parse(localStorage.getItem(REF_KEY) || "null");
      return saved && Date.now() - saved.time < REF_LIFETIME ? saved.code : "";
    } catch (e) {
      return "";
    }
  }

  function refAttributes() {
    var code = readRef();
    return code ? [{ key: REF_ATTRIBUTE, value: code }] : [];
  }

  function captureRef() {
    var params = new URLSearchParams(window.location.search);
    if (params.has(REF_CLEAR_PARAM)) return localStorage.removeItem(REF_KEY);
    var code = REF_PARAMS.map(function (name) {
      return params.get(name);
    }).find(Boolean);
    if (code && REF_PATTERN.test(code))
      localStorage.setItem(
        REF_KEY,
        JSON.stringify({ code: code, time: Date.now() }),
      );
  }

  function tagRef(c) {
    if (!c) return;
    var tagged = (c.attributes || []).find(function (a) {
      return a.key === REF_ATTRIBUTE;
    });
    if ((tagged ? tagged.value : "") === readRef()) return;
    mutate(
      `mutation($c:ID!,$a:[AttributeInput!]!){cartAttributesUpdate(cartId:$c,attributes:$a){cart{${CART_FIELDS}}}}`,
      { c: c.id, a: refAttributes() },
    ).then(function (d) {
      var next = d?.data?.cartAttributesUpdate?.cart;
      if (next) save(next);
    });
  }

  captureRef();

  window.Cart = {
    add: function (variantId) {
      if (!variantId) return;
      var id = localStorage.getItem(KEY);
      var self = this;
      var p = id
        ? mutate(
            `mutation($c:ID!,$l:[CartLineInput!]!){cartLinesAdd(cartId:$c,lines:$l){cart{${CART_FIELDS}}}}`,
            { c: id, l: [{ merchandiseId: variantId, quantity: 1 }] },
          ).then(function (d) {
            if (!d?.data) return undefined;
            return d.data.cartLinesAdd?.cart || null;
          })
        : Promise.resolve(null);

      p.then(function (c) {
        if (c === undefined) return;
        if (c) {
          save(c);
          self.open();
          tagRef(c);
          return;
        }
        localStorage.removeItem(KEY);
        return mutate(
          `mutation($l:[CartLineInput!]!,$a:[AttributeInput!]){cartCreate(input:{lines:$l,attributes:$a}){cart{${CART_FIELDS}}}}`,
          { l: [{ merchandiseId: variantId, quantity: 1 }], a: refAttributes() },
        ).then(function (d) {
          var c2 = d?.data?.cartCreate?.cart;
          if (c2) {
            save(c2);
            self.open();
          }
        });
      });
    },
    setQty: function (lineId, q) {
      if (q < 1) return this.remove(lineId);
      var id = localStorage.getItem(KEY);
      mutate(
        `mutation($c:ID!,$l:[CartLineUpdateInput!]!){cartLinesUpdate(cartId:$c,lines:$l){cart{${CART_FIELDS}}}}`,
        { c: id, l: [{ id: lineId, quantity: q }] },
      ).then(function (d) {
        var next = d?.data?.cartLinesUpdate?.cart;
        if (next) save(next);
      });
    },
    remove: function (lineId) {
      var id = localStorage.getItem(KEY);
      mutate(
        `mutation($c:ID!,$l:[ID!]!){cartLinesRemove(cartId:$c,lineIds:$l){cart{${CART_FIELDS}}}}`,
        { c: id, l: [lineId] },
      ).then(function (d) {
        var next = d?.data?.cartLinesRemove?.cart;
        if (next) save(next);
      });
    },
    open: function () {
      document.querySelector("[data-cart-drawer]")?.classList.add("is-open");
    },
    close: function () {
      document.querySelector("[data-cart-drawer]")?.classList.remove("is-open");
    },
    checkout: function () {
      if (cart?.checkoutUrl) location.href = cart.checkoutUrl;
    },
    init: function () {
      var id = localStorage.getItem(KEY);
      if (!id) return render();
      gql(`query($c:ID!){cart(id:$c){${CART_FIELDS}}}`, { c: id }).then(
        function (d) {
          if (!d?.data) return;
          save(d.data.cart || null);
          tagRef(d.data.cart);
        },
      );
    },
  };

  window.Cart.init();
})();
