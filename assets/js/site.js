(function () {
  "use strict";

  const catalog = window.DrSeaCatalog;
  if (!catalog) return;

  const storageKey = "drsea-cart-v2";
  let lastFocused = null;

  function readCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "{}");
      const clean = {};
      Object.entries(parsed).forEach(([sku, quantity]) => {
        const product = catalog.find(sku);
        const count = Number.parseInt(quantity, 10);
        if (product && Number.isFinite(count) && count > 0) clean[product.sku] = Math.min(count, 20);
      });
      return clean;
    } catch (_error) {
      return {};
    }
  }

  let cart = readCart();

  function queryValue(name) {
    const direct = new URLSearchParams(location.search).get(name);
    if (direct) return direct;
    const pattern = new RegExp(`[?&]${name}=([^&#]*)`, "g");
    const matches = [...location.href.matchAll(pattern)];
    if (!matches.length) return "";
    return decodeURIComponent(matches[matches.length - 1][1].replace(/\+/g, " "));
  }

  function saveCart() {
    localStorage.setItem(storageKey, JSON.stringify(cart));
    renderCart();
  }

  function productPlaceholder(product) {
    return `<div class="product-placeholder" role="img" aria-label="${product.name} product placeholder"><span>DR. SEA</span><strong>${product.ref}</strong><small>${product.category}</small></div>`;
  }

  function productMedia(product, eager) {
    if (!product.image) return productPlaceholder(product);
    return `<img class="product-image" src="${product.image}" alt="${product.imageAlt || product.name}" loading="${eager ? "eager" : "lazy"}" decoding="async">`;
  }

  function activateImageFallbacks(root) {
    root.querySelectorAll("img.product-image").forEach((image) => {
      image.addEventListener("error", () => {
        const product = catalog.find(image.closest("[data-sku]")?.dataset.sku);
        if (product) image.replaceWith(document.createRange().createContextualFragment(productPlaceholder(product)));
      }, { once: true });
    });
  }

  function productCard(product) {
    const subtitle = product.subtitle ? `<div class="card-subtitle">${product.subtitle}</div>` : "";
    return `<article class="card" data-sku="${product.sku}">
      <a class="card-media" href="product.html?sku=${product.sku}" aria-label="View ${product.name}">
        <span class="badge">Ref ${product.ref}</span>
        ${productMedia(product, false)}
      </a>
      <div class="card-body">
        <div class="product-meta"><span>${product.category}</span><span>${product.size}</span></div>
        <a class="card-title" href="product.html?sku=${product.sku}">${product.name}</a>
        ${subtitle}
        <p class="card-copy">${product.summary}</p>
        <div class="card-footer">
          <span class="price">${catalog.money(product.price)}</span>
          <button class="btn small" type="button" data-add="${product.sku}">Add to bag</button>
        </div>
      </div>
    </article>`;
  }

  function renderFeatured() {
    const grid = document.querySelector("[data-featured-products]");
    if (!grid) return;
    grid.innerHTML = catalog.products.slice(0, 4).map(productCard).join("");
    activateImageFallbacks(grid);
  }

  function renderShop() {
    const grid = document.querySelector("[data-shop-grid]");
    if (!grid) return;
    const search = document.querySelector("#catalogSearch");
    const category = document.querySelector("#categoryFilter");
    const sort = document.querySelector("#sortProducts");
    const count = document.querySelector("#resultCount");
    if (queryValue("q")) search.value = queryValue("q");
    if (queryValue("category")) category.value = queryValue("category");

    function update() {
      const query = search.value.trim().toLowerCase();
      let products = catalog.products.filter((product) => {
        const matchesCategory = category.value === "all" || product.category === category.value;
        const haystack = [product.name, product.subtitle, product.category, product.ref, product.summary].filter(Boolean).join(" ").toLowerCase();
        return matchesCategory && (!query || haystack.includes(query));
      });

      if (sort.value === "price-asc") products = products.sort((a, b) => a.price - b.price);
      if (sort.value === "price-desc") products = products.sort((a, b) => b.price - a.price);
      if (sort.value === "name") products = products.sort((a, b) => a.name.localeCompare(b.name));

      count.textContent = `${products.length} verified-price product${products.length === 1 ? "" : "s"}`;
      grid.innerHTML = products.length ? products.map(productCard).join("") : `<div class="empty full-span"><h2>No matching products</h2><p>Try a broader search or another category.</p></div>`;
      activateImageFallbacks(grid);

      const next = new URLSearchParams();
      if (search.value.trim()) next.set("q", search.value.trim());
      if (category.value !== "all") next.set("category", category.value);
      try {
        history.replaceState(null, "", `${location.pathname}${next.toString() ? `?${next}` : ""}`);
      } catch (_error) {
        // Sandboxed preview hosts can block history updates; filtering still works.
      }
    }

    search.addEventListener("input", update);
    category.addEventListener("change", update);
    sort.addEventListener("change", update);
    document.querySelectorAll("[data-category]").forEach((button) => {
      button.addEventListener("click", () => {
        category.value = button.dataset.category;
        update();
      });
    });
    update();
  }

  function renderProductPage() {
    const target = document.querySelector("[data-product-page]");
    if (!target) return;
    const product = catalog.find(queryValue("sku"));
    if (!product) {
      target.innerHTML = `<div class="empty"><h1>Product not found</h1><p>This item may not be published yet.</p><a class="btn" href="shop.html">Browse verified-price products</a></div>`;
      return;
    }

    document.title = `${product.name} | Dr. SEA Beauty`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `https://drseabeauty.shop/product.html?sku=${encodeURIComponent(product.sku)}`;
    const structuredData = document.createElement("script");
    structuredData.type = "application/ld+json";
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      sku: product.sku,
      brand: { "@type": "Brand", name: "Dr. SEA" },
      description: product.summary,
      image: product.image ? `https://drseabeauty.shop/${product.image}` : undefined
    });
    document.head.appendChild(structuredData);
    const subtitle = product.subtitle ? `<p class="product-subtitle">${product.subtitle}</p>` : "";
    target.dataset.sku = product.sku;
    target.innerHTML = `<div class="product-grid">
      <div class="product-media product-media-large">${productMedia(product, true)}</div>
      <div class="product-info">
        <a class="back-link" href="shop.html">← Back to shop</a>
        <div class="eyebrow">${product.category} · Ref ${product.ref}</div>
        <h1>${product.name}</h1>
        ${subtitle}
        <div class="product-meta"><span>${product.size}</span><span>SKU ${product.sku}</span></div>
        <div class="product-price">${catalog.money(product.price)}</div>
        <p class="product-copy">${product.details}</p>
        <ul class="highlight-list">${product.highlights.map((item) => `<li>${item}</li>`).join("")}</ul>
        <button class="btn wide" type="button" data-add="${product.sku}">Add to bag</button>
        <div class="pricing-note"><strong>Transparent pricing:</strong> this published price is $0.50 below the verified official regular price. Unverified prices are not listed.</div>
        <p class="fine-print">Cosmetic product information only. Follow the package directions and discontinue use if irritation occurs.</p>
      </div>
    </div>`;
    activateImageFallbacks(target);
  }

  function ensureCart() {
    if (document.querySelector("#cartDrawer")) return;
    const shell = document.createElement("div");
    shell.innerHTML = `<div class="overlay" id="cartOverlay"></div>
      <aside class="drawer" id="cartDrawer" role="dialog" aria-modal="true" aria-labelledby="cartTitle" aria-hidden="true">
        <div class="drawer-head"><div><div class="eyebrow">Your selection</div><h2 id="cartTitle">Shopping bag</h2></div><button class="icon-btn" id="cartClose" type="button" aria-label="Close shopping bag">×</button></div>
        <div class="drawer-items" id="cartItems"></div>
        <div class="drawer-total"><div class="total-row"><span>Subtotal</span><strong id="cartSubtotal">$0.00</strong></div><p class="fine-print">Taxes and delivery are calculated only after checkout is activated.</p><a class="btn wide" href="checkout.html">Review launch status</a></div>
      </aside>
      <div class="toast" id="cartToast" role="status" aria-live="polite"></div>`;
    while (shell.firstChild) document.body.appendChild(shell.firstChild);
  }

  function renderCart() {
    const count = Object.values(cart).reduce((total, quantity) => total + quantity, 0);
    document.querySelectorAll("[data-cart-count]").forEach((node) => { node.textContent = String(count); });
    const items = document.querySelector("#cartItems");
    const subtotal = document.querySelector("#cartSubtotal");
    if (!items || !subtotal) return;

    items.replaceChildren();
    let total = 0;
    Object.entries(cart).forEach(([sku, quantity]) => {
      const product = catalog.find(sku);
      if (!product) return;
      total += product.price * quantity;
      const row = document.createElement("div");
      row.className = "drawer-item";

      const copy = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = product.name;
      const meta = document.createElement("div");
      meta.className = "muted small-text";
      meta.textContent = `${product.size} · ${catalog.money(product.price)}`;
      copy.append(name, meta);

      const controls = document.createElement("div");
      controls.className = "quantity-controls";
      const minus = document.createElement("button");
      minus.type = "button";
      minus.dataset.decrease = sku;
      minus.setAttribute("aria-label", `Decrease ${product.name} quantity`);
      minus.textContent = "−";
      const qty = document.createElement("span");
      qty.textContent = String(quantity);
      const plus = document.createElement("button");
      plus.type = "button";
      plus.dataset.increase = sku;
      plus.setAttribute("aria-label", `Increase ${product.name} quantity`);
      plus.textContent = "+";
      controls.append(minus, qty, plus);

      const linePrice = document.createElement("strong");
      linePrice.textContent = catalog.money(product.price * quantity);
      row.append(copy, controls, linePrice);
      items.appendChild(row);
    });

    if (!count) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.innerHTML = "<h3>Your bag is empty</h3><p>Browse the verified-price collection to get started.</p>";
      items.appendChild(empty);
    }
    subtotal.textContent = catalog.money(total);
  }

  function openCart() {
    lastFocused = document.activeElement;
    document.querySelector("#cartDrawer").classList.add("open");
    document.querySelector("#cartDrawer").setAttribute("aria-hidden", "false");
    document.querySelector("#cartOverlay").classList.add("open");
    document.body.classList.add("drawer-open");
    document.querySelector("#cartClose").focus();
  }

  function closeCart() {
    document.querySelector("#cartDrawer").classList.remove("open");
    document.querySelector("#cartDrawer").setAttribute("aria-hidden", "true");
    document.querySelector("#cartOverlay").classList.remove("open");
    document.body.classList.remove("drawer-open");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function toast(message) {
    const node = document.querySelector("#cartToast");
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 2200);
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const add = event.target.closest("[data-add]");
      if (add) {
        const product = catalog.find(add.dataset.add);
        if (!product) return;
        cart[product.sku] = Math.min((cart[product.sku] || 0) + 1, 20);
        saveCart();
        toast(`${product.name} added to your bag.`);
      }
      const increase = event.target.closest("[data-increase]");
      if (increase) {
        cart[increase.dataset.increase] = Math.min((cart[increase.dataset.increase] || 0) + 1, 20);
        saveCart();
      }
      const decrease = event.target.closest("[data-decrease]");
      if (decrease) {
        const sku = decrease.dataset.decrease;
        cart[sku] = (cart[sku] || 0) - 1;
        if (cart[sku] <= 0) delete cart[sku];
        saveCart();
      }
    });
    document.querySelectorAll("[data-open-cart]").forEach((button) => button.addEventListener("click", openCart));
    document.querySelector("#cartClose").addEventListener("click", closeCart);
    document.querySelector("#cartOverlay").addEventListener("click", closeCart);
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeCart(); });
  }

  ensureCart();
  renderFeatured();
  renderShop();
  renderProductPage();
  renderCart();
  bindEvents();
})();
