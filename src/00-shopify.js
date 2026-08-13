!(function () {
  "use strict";
  var API = "https://yokai-sake.myshopify.com/api/2025-01/graphql.json";
  var TOKEN = "1432a4269f2a938b1e58ab4c6b49138a";
  var KEY = "yokai_cart_id";

  var CART_FIELDS = `
  id checkoutUrl totalQuantity
  cost { subtotalAmount { amount } }
  lines(first: 50) { edges { node {
    id quantity
    merchandise { ... on ProductVariant {
      id image { url } price { amount } product { title }
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
    return "¥" + Math.round(Number(n)).toLocaleString();
  }

  // ---- Products Info ----
  window.fetchProducts = function (handles) {
    var q = handles
      .map(function (h, i) {
        return `p${i}: product(handle: "${h}") {
      title
      images(first: 1) { edges { node { url } } }
      variants(first: 20) { edges { node {
        id title price { amount } availableForSale image { url }
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
  function render() {
    var count = document.querySelector("[data-cart-count]");
    var list = document.querySelector("[data-cart-lines]");
    var total = document.querySelector("[data-cart-total]");
    var empty = document.querySelector("[data-cart-empty]");

    var qty = cart?.totalQuantity || 0;
    if (count) count.textContent = qty;
    if (total && cart?.cost)
      total.textContent = yen(cart.cost.subtotalAmount.amount);
    if (empty) empty.style.display = qty === 0 ? "" : "none";
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
          <div class="cart-line-title">${m.product.title}</div>
          <div class="cart-line-price">${yen(m.price.amount)}</div>
          <div class="cart-line-qty">
            <button onclick="Cart.setQty('${n.id}', ${n.quantity - 1})">−</button>
            <span>${n.quantity}</span>
            <button onclick="Cart.setQty('${n.id}', ${n.quantity + 1})">+</button>
          </div>
        </div>
        <button class="cart-line-remove" onclick="Cart.remove('${n.id}')">×</button>
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

  window.Cart = {
    add: function (variantId) {
      if (!variantId) return;
      var id = localStorage.getItem(KEY);
      var self = this;
      var p = id
        ? gql(
            `mutation($c:ID!,$l:[CartLineInput!]!){cartLinesAdd(cartId:$c,lines:$l){cart{${CART_FIELDS}}}}`,
            { c: id, l: [{ merchandiseId: variantId, quantity: 1 }] },
          ).then(function (d) {
            return d?.data?.cartLinesAdd?.cart;
          })
        : Promise.resolve(null);

      p.then(function (c) {
        if (c) {
          save(c);
          self.open();
          return;
        }
        localStorage.removeItem(KEY);
        return gql(
          `mutation($l:[CartLineInput!]!){cartCreate(input:{lines:$l}){cart{${CART_FIELDS}}}}`,
          { l: [{ merchandiseId: variantId, quantity: 1 }] },
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
      gql(
        `mutation($c:ID!,$l:[CartLineUpdateInput!]!){cartLinesUpdate(cartId:$c,lines:$l){cart{${CART_FIELDS}}}}`,
        { c: id, l: [{ id: lineId, quantity: q }] },
      ).then(function (d) {
        save(d?.data?.cartLinesUpdate?.cart);
      });
    },
    remove: function (lineId) {
      var id = localStorage.getItem(KEY);
      gql(
        `mutation($c:ID!,$l:[ID!]!){cartLinesRemove(cartId:$c,lineIds:$l){cart{${CART_FIELDS}}}}`,
        { c: id, l: [lineId] },
      ).then(function (d) {
        save(d?.data?.cartLinesRemove?.cart);
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
          save(d?.data?.cart || null);
        },
      );
    },
  };

  window.Cart.init();
})();
