const PRODUCTS = [
    {
        id: "pistol",
        name: "Masážní pistole",
        price: 2399,
        currency: "Kč",
        category: "regenerace",
        image: "1.webp",
        url: "https://www.alza.cz/sport/stormred-masazni-pistole-pro-rehab-d7919559.htm",
    },
    {
        id: "mandle",
        name: "Mandle v čokoládě",
        price: 249,
        currency: "Kč",
        category: "vyziva",
        image: "2.webp",
        url: "https://www.alza.cz/sport/bery-jones-mandle-v-mlecne-cokolade-a-skorici-500g-d12896710.htm",
    },
    {
        id: "liniment",
        name: "Namman Muay Liniment",
        price: 369,
        currency: "Kč",
        category: "borci",
        image: "3.webp",
        url: "https://www.alza.cz/sport/namman-muay-liniment-0-12-l-d8014635.htm",
    },
];

function formatPrice(price, currency) {
    return `${price.toLocaleString("cs-CZ")} ${currency}`;
}

function getTheme() {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    const btn = document.querySelector('[data-testid="button-theme"]');
    if (btn) btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
}

function qs(id) {
    return document.getElementById(id);
}

function getState() {
    const activeChip = document.querySelector(".chip.is-active");
    const category = activeChip?.getAttribute("data-filter") || "all";
    const search = (qs("search")?.value || "").trim().toLowerCase();
    const min = Number(qs("minPrice")?.value || "");
    const max = Number(qs("maxPrice")?.value || "");
    const sort = qs("sort")?.value || "featured";

    return {
        category,
        search,
        min: Number.isFinite(min) && String(qs("minPrice")?.value || "").trim() !== "" ? min : null,
        max: Number.isFinite(max) && String(qs("maxPrice")?.value || "").trim() !== "" ? max : null,
        sort,
    };
}

function applyFilters(products, state) {
    let items = [...products];

    if (state.category !== "all") {
        items = items.filter((p) => p.category === state.category);
    }

    if (state.search) {
        items = items.filter((p) => p.name.toLowerCase().includes(state.search));
    }

    if (state.min !== null) {
        items = items.filter((p) => p.price >= state.min);
    }

    if (state.max !== null) {
        items = items.filter((p) => p.price <= state.max);
    }

    if (state.sort === "price-asc") items.sort((a, b) => a.price - b.price);
    if (state.sort === "price-desc") items.sort((a, b) => b.price - a.price);
    if (state.sort === "name-asc") items.sort((a, b) => a.name.localeCompare(b.name, "cs"));

    return items;
}

function categoryLabel(cat) {
    if (cat === "regenerace") return "Regenerace";
    if (cat === "vyziva") return "Výživa";
    if (cat === "borci") return "Bojové sporty";
    return "Vše";
}

function renderActiveFilters(state) {
    const parts = [];
    if (state.category !== "all") parts.push(categoryLabel(state.category));
    if (state.search) parts.push(`Hledat: ${state.search}`);
    if (state.min !== null) parts.push(`Min: ${state.min}`);
    if (state.max !== null) parts.push(`Max: ${state.max}`);

    const el = qs("activeFilters");
    if (el) el.textContent = parts.length ? parts.join(" • ") : "Žádné filtry";
}

function cardTemplate(p) {
    const price = formatPrice(p.price, p.currency);
    return `
    <article class="card" data-id="${p.id}">
      <div class="card__media">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
      </div>
      <div class="card__body">
        <h3 class="card__title" data-testid="text-product-name-${p.id}">${p.name}</h3>
        <div class="card__meta">
          <div class="price" data-testid="text-product-price-${p.id}">${price}</div>
          <div class="badge" data-testid="text-product-category-${p.id}">${categoryLabel(p.category)}</div>
        </div>
        <div class="card__actions">
          <a data-testid="link-buy-${p.id}" class="btn" href="${p.url}" target="_blank" rel="noreferrer">Koupit</a>
        </div>
      </div>
    </article>
  `;
}

function renderGrid(items) {
    const grid = qs("grid");
    const empty = qs("empty");
    const count = qs("count");

    if (count) count.textContent = String(items.length);

    if (!grid || !empty) return;

    if (items.length === 0) {
        grid.innerHTML = "";
        empty.hidden = false;
        return;
    }

    empty.hidden = true;
    grid.innerHTML = items.map(cardTemplate).join("");
}

function showModal(product) {
    const modal = qs("modal");
    if (!modal) return;

    qs("modalTitle").textContent = product.name;
    const img = qs("modalImg");
    img.src = product.image;
    img.alt = product.name;

    qs("modalPrice").textContent = formatPrice(product.price, product.currency);
    qs("modalCategory").textContent = categoryLabel(product.category);

    const link = qs("modalLink");
    link.href = product.url;

    const buy = qs("modalBuy");
    buy.onclick = () => {
        window.open(product.url, "_blank", "noopener,noreferrer");
    };

    modal.showModal();
}

function resetFilters() {
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
    const all = document.querySelector('[data-testid="chip-category-all"]');
    if (all) all.classList.add("is-active");

    qs("search").value = "";
    qs("minPrice").value = "";
    qs("maxPrice").value = "";
    qs("sort").value = "featured";

    updateSearchClear();
    rerender();
}

function updateSearchClear() {
    const wrap = document.querySelector(".search");
    const input = qs("search");
    if (!wrap || !input) return;
    wrap.classList.toggle("has-value", input.value.trim().length > 0);
}

function rerender() {
    const state = getState();
    const items = applyFilters(PRODUCTS, state);
    renderActiveFilters(state);
    renderGrid(items);
}

function init() {
    qs("year").textContent = String(new Date().getFullYear());

    setTheme(getTheme());

    const themeBtn = document.querySelector('[data-testid="button-theme"]');
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme") || "dark";
            setTheme(current === "dark" ? "light" : "dark");
        });
    }

    document.querySelectorAll(".chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            document.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
            chip.classList.add("is-active");
            rerender();
        });
    });

    const sort = qs("sort");
    if (sort) sort.addEventListener("change", rerender);

    const apply = document.querySelector('[data-testid="button-apply"]');
    if (apply) apply.addEventListener("click", rerender);

    const reset = document.querySelector('[data-testid="button-reset"]');
    if (reset) reset.addEventListener("click", resetFilters);

    const emptyReset = document.querySelector('[data-testid="button-empty-reset"]');
    if (emptyReset) emptyReset.addEventListener("click", resetFilters);

    const search = qs("search");
    if (search) {
        search.addEventListener("input", () => {
            updateSearchClear();
            rerender();
        });
    }

    const clear = document.querySelector('[data-testid="button-clear-search"]');
    if (clear) {
        clear.addEventListener("click", () => {
            qs("search").value = "";
            updateSearchClear();
            rerender();
            qs("search").focus();
        });
    }

    const grid = qs("grid");
    if (grid) {
        grid.addEventListener("click", (e) => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) return;
            const action = target.getAttribute("data-action");
            if (action !== "details") return;

            const id = target.getAttribute("data-id");
            const product = PRODUCTS.find((p) => p.id === id);
            if (product) showModal(product);
        });
    }

    updateSearchClear();
    rerender();
}

document.addEventListener("DOMContentLoaded", init);
