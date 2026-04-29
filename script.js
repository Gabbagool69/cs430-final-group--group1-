/* ============================================================
   COLLECTION OF PRODUCTS AND DEFAULT FIELDS
   ============================================================ */
const watches = [
    { id: "watch-01", section: "luxury", category:"timeless", name: "Royal Gold", image: "images/watch1.jpg", description: "A luxurious timepiece crafted with the finest materials.", price: "$120" },
    { id: "watch-02", section: "luxury", category:"modern", name: "Midnight Ash", image: "images/watch2.jpg", description: "A luxurious timepiece crafted with the finest materials.", price: "$140" },
    { id: "watch-03", section: "luxury", category:"old-fashioned", name: "Obsidian Elite", image: "images/watch3.jpg", description: "A luxurious timepiece crafted with the finest materials.", price: "$160" },
    { id: "watch-04", section: "luxury", category:"modern", name: "Imperial Chrono", image: "images/watch4.jpg", description: "A luxurious timepiece crafted with the finest materials.", price: "$180" },
    { id: "watch-05", section: "luxury", category:"timeless", name: "Prestige Classic", image: "images/watch5.jpg", description: "A luxurious timepiece crafted with the finest materials.", price: "$200" },
    { id: "watch-06", section: "luxury", category:"old-fashioned", name: "Golden Horizon", image: "images/watch6.jpg", description: "A luxurious timepiece crafted with the finest materials.", price: "$220" },
    { id: "watch-07", section: "luxury", category:"sporty", name: "Velvet Noir", image: "images/watch7.jpg", description: "A luxurious timepiece crafted with the finest materials.", price: "$240" },
    { id: "watch-08", section: "luxury", category:"timeless", name: "Signature Luxe", image: "images/watch8.jpg", description: "A luxurious timepiece crafted with the finest materials.", price: "$260" },
    { id: "watch-09", section: "luxury", category:"sporty", name: "Diamond Edge", image: "images/watch9.jpg", description: "A luxurious timepiece crafted with the finest materials.", price: "$280" },
    { id: "watch-10", section: "luxury", category:"sporty", name: "Emerald Prime", image: "images/watch10.jpg", description: "A luxurious timepiece crafted with the finest materials.", price: "$300" },
    { id: "watch-11", section: "luxury", category: "modern", name: "Obsidian Tide", image: "images/watch11.jpg", description: "A sleek dive-style watch with a bold modern edge.", price: "$320" },
    { id: "watch-12", section: "luxury", category: "old-fashioned", name: "Ivory Legacy", image: "images/watch12.jpg", description: "A vintage-inspired timepiece with timeless elegance and heritage design.", price: "$340" }
];

const fields = {
    name: "Untitled Watch",
    description: "No description available.",
    price: "Price not available",
    image: "images/default-watch.jpg"
};

/*Add to cart sound effect*/
function playCartDing() {
    const cartDingAudio = document.getElementById("cart-ding-audio");

    if (!cartDingAudio) return;

    cartDingAudio.currentTime = 0;
    cartDingAudio.play();
}

/* ============================================================
   UNIFIED CART SYSTEM WITH LOCALSTORAGE
   ============================================================ */
const CartManager = (function () {
    const STORAGE_KEY = "king_watches_cart"; /* This is the key used to store cart data in localStorage.  */

    function loadFromStorage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    function saveToStorage(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    let items = loadFromStorage(); /* This is private */

    return {
        getItems() {
            return items;
        },

        addItem(name, unitPrice, quantity = 1) {
            const key = this.makeKey(name, unitPrice);
            const found = items.find(it => it.key === key);

            if (found) {
                found.qty += quantity;
                found.lineTotal = found.qty * found.unitPrice;
            } else {
                items.push({ key, name, unitPrice, qty: quantity, lineTotal: unitPrice * quantity });
            }

            saveToStorage(items);
        },

        removeItem(key) {
            items = items.filter(it => it.key !== key);
            saveToStorage(items);
        },

        updateQuantity(key, delta) {
            const item = items.find(it => it.key === key);
            if (item) {
                item.qty += delta;
                if (item.qty < 1) {
                    this.removeItem(key);
                } else {
                    item.lineTotal = item.qty * item.unitPrice;
                    saveToStorage(items);
                }
            }
        },

        getTotal() {
            return items.reduce((sum, item) => sum + item.lineTotal, 0);
        },

        makeKey(name, price) {
            return name + "::" + price.toFixed(2);
        },

        clear() {
            items = [];
            saveToStorage(items);
        }
    };
})();

/* ============================================================
   PRODUCT MODAL SYSTEM
   ============================================================ */
const ModalManager = (function () {
    const luxuryGrid = document.getElementById("luxury-watches-grid");
    const modal = document.getElementById("watch-modal");
    const modalCloseBtn = document.getElementById("modal-close");
    const modalTitle = document.getElementById("modal-title");
    const modalSummary = document.getElementById("modal-summary");
    const modalDescription = document.getElementById("modal-description");
    const modalPrice = document.getElementById("modal-price");

    let lastFocusedElement = null;

    if (!luxuryGrid || !modal || !modalCloseBtn || !modalTitle || !modalSummary || !modalDescription || !modalPrice) {
        return null;
    } /* This checks if all the necessary DOM elements for the modal functionality are present. If any of them are missing, it returns null, effectively disabling the modal functionality. */

    function sanitizeText(value, fallback) {
        if (typeof value !== "string") return fallback;
        const compact = value.replace(/\s+/g, " ").trim();
        return compact || fallback;
    }

    function normalizeProduct(product) {
    return {
        id: sanitizeText(product.id, crypto.randomUUID()),
        section: sanitizeText(product.section, "luxury"),
        category: sanitizeText(product.category, "timeless"), /* NEW */
        name: sanitizeText(product.name, fields.name),
        image: sanitizeText(product.image, fields.image),
        description: sanitizeText(product.description, fields.description),
        price: sanitizeText(product.price, fields.price)
    };
}

    function createCard(product) {
        const card = document.createElement("button");
        card.className = "watch-card";
        card.setAttribute("role", "listitem");
        card.setAttribute("aria-label", `View details for ${product.name}`);

        const image = document.createElement("img");
        image.className = "watch-image";
        image.alt = product.name;
        image.src = product.image;

        const content = document.createElement("div");
        content.className = "watch-content";

        const title = document.createElement("h3");
        title.className = "watch-name";
        title.textContent = product.name;

        const summary = document.createElement("p");
        summary.className = "watch-description";
        summary.textContent = product.description;

        content.append(title, summary);
        card.append(image, content);
        card.addEventListener("click", () => openModal(product, card));

        return card;
    }

    function openModal(product, triggerElement) {
        lastFocusedElement = triggerElement || document.activeElement;
        modalTitle.textContent = product.name;
        modalSummary.textContent = product.description;
        modalDescription.textContent = product.description;
        modalPrice.textContent = product.price;

        modal.hidden = false;
        document.body.style.overflow = "hidden";
        modalCloseBtn.focus();
    }

    function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = "";
        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus();
        }
    }

    function renderProducts(filter = "all") {
        const normalizedProducts = watches.map(normalizeProduct);

        let filteredProducts = normalizedProducts.filter(p => p.section === "luxury");

        if (filter !== "all") {
            filteredProducts = filteredProducts.filter(p => p.category === filter);

        }

        luxuryGrid.replaceChildren(...filteredProducts.map(createCard));
    }
    
    /*  These just make sure that the modal can be closed by clicking the close button, clicking outside the modal content, or pressing the Escape key. */
    modalCloseBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modal.hidden) closeModal();
    });

    renderProducts();
    const filterButtons = document.querySelectorAll(".filter-btn");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const selectedFilter = button.dataset.filter;

            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            renderProducts(selectedFilter);
        })
    })

    return { closeModal, getModalTitle: () => modalTitle, getModalPrice: () => modalPrice, getModal: () => modal };
})();

/* ============================================================
   UNIFIED CART UI
   ============================================================ */
const CartUI = (function () {
    const homePanel = document.getElementById("home-cart-panel");
    const homeList = document.getElementById("home-cart-list");
    const homeTotal = document.getElementById("home-cart-total");
    const homeClose = document.getElementById("home-cart-close");
    const homeCheckoutBtn = document.getElementById("home-checkout-btn");
    const homeCheckoutModal = document.getElementById("home-checkout-modal");
    const homeCheckoutList = document.getElementById("home-checkout-list");
    const homeCheckoutClose = document.getElementById("home-checkout-close");

    const productsPanel = document.getElementById("products-cart-panel");
    const productsList = document.getElementById("products-cart-list");
    const productsTotal = document.getElementById("products-cart-total");
    const productsClose = document.getElementById("products-cart-close");
    const productsCheckoutBtn = document.getElementById("products-checkout-btn");
    const productsCheckoutModal = document.getElementById("products-checkout-modal");
    const productsCheckoutList = document.getElementById("products-checkout-list");
    const productsCheckoutClose = document.getElementById("products-checkout-close");

    const panels = [];

    if (homePanel && homeList && homeTotal && homeClose) {
        panels.push({ panel: homePanel, list: homeList, total: homeTotal, close: homeClose, checkoutBtn: homeCheckoutBtn, checkoutModal: homeCheckoutModal, checkoutList: homeCheckoutList, checkoutClose: homeCheckoutClose });
    }

    if (productsPanel && productsList && productsTotal && productsClose) {
        panels.push({ panel: productsPanel, list: productsList, total: productsTotal, close: productsClose, checkoutBtn: productsCheckoutBtn, checkoutModal: productsCheckoutModal, checkoutList: productsCheckoutList, checkoutClose: productsCheckoutClose });
    }

    if (panels.length === 0) return null; /* if no cart UI exists on the page, this will disable the CartUI functionality. */

    function parsePrice(text) {
        const m = (text || "").match(/(\d+(\.\d+)?)/);
        return m ? Number(m[1]) : 0; /* Extracts number texts and converts them to a numeric value */
    }

    function renderCart(panelConfig) {
        let total = 0;
        const items = CartManager.getItems();
        panelConfig.list.innerHTML = "";

        if (!items.length) {
            const emptyRow = document.createElement("li");
            emptyRow.textContent = "No items selected.";
            panelConfig.list.appendChild(emptyRow);
            panelConfig.total.textContent = "Total: $0.00";
            return;
        }

        items.forEach(item => {
            total += item.lineTotal;
            const li = document.createElement("li");
            li.className = "home-cart-row";
            li.dataset.key = item.key;

            const textWrap = document.createElement("div");
            const nameDiv = document.createElement("div");
            nameDiv.className = "home-cart-item-name";
            nameDiv.textContent = item.name;
            const subDiv = document.createElement("div");
            subDiv.className = "home-cart-item-sub";
            subDiv.textContent = `$${item.unitPrice.toFixed(2)} x ${item.qty} = $${item.lineTotal.toFixed(2)}`;
            textWrap.appendChild(nameDiv);
            textWrap.appendChild(subDiv);

            const actions = document.createElement("div");
            actions.className = "home-cart-actions";
            actions.innerHTML = "<button type='button' data-act='dec' aria-label='Decrease quantity'>-</button><button type='button' data-act='inc' aria-label='Increase quantity'>+</button><button type='button' data-act='remove' aria-label='Remove item'>x</button>";

            li.appendChild(textWrap);
            li.appendChild(actions);
            panelConfig.list.appendChild(li);
        });

        panelConfig.total.textContent = `Total: $${total.toFixed(2)}`; /* This updates the total price displayed in the cart panel. It formats the total to two decimal places for currency display. */
    }

    function renderCheckout(panelConfig) {
        const items = CartManager.getItems();
        let total = 0;

        if (!items.length) {
            panelConfig.checkoutList.textContent = "Your cart is empty.";
            return;
        }

        /* This generates the HTML for the checkout modal, listing each item with its quantity and line total, and then appends a total price at the end. The line totals and overall total are calculated based on the items in the cart. */
        const html = items.map(item => {
            total += item.lineTotal;
            return `<div>${item.name} x${item.qty} - $${item.lineTotal.toFixed(2)}</div>`;
        }).join("");
        panelConfig.checkoutList.innerHTML = html + `<hr><strong>Total: $${total.toFixed(2)}</strong>`;
    }

    function openPanel(panelConfig) {
        renderCart(panelConfig);
        panelConfig.panel.classList.add("open");
        panelConfig.panel.setAttribute("aria-hidden", "false");
    }

    function closePanel(panelConfig) {
        panelConfig.panel.classList.remove("open");
        panelConfig.panel.setAttribute("aria-hidden", "true");
    }

    panels.forEach(panelConfig => {
        panelConfig.list.addEventListener("click", event => {
            const btn = event.target.closest("button[data-act]");
            if (!btn) return;

            const row = btn.closest("li[data-key]");
            if (!row) return;

            const key = row.dataset.key;
            const act = btn.dataset.act;

            if (act === "inc") {
                const item = CartManager.getItems().find(it => it.key === key);
                if (item) CartManager.updateQuantity(key, 1);
            } else if (act === "dec") {
                CartManager.updateQuantity(key, -1);
            } else if (act === "remove") {
                CartManager.removeItem(key);
            }

            renderCart(panelConfig);
        });

        panelConfig.close.addEventListener("click", () => closePanel(panelConfig)); /* close button just closes the cart panel when clicked. */

        if (panelConfig.checkoutBtn) {
            panelConfig.checkoutBtn.addEventListener("click", () => {
                renderCheckout(panelConfig);
                panelConfig.checkoutModal.classList.add("open");
                panelConfig.checkoutModal.setAttribute("aria-hidden", "false");
            });
        }

        if (panelConfig.checkoutClose) {
            panelConfig.checkoutClose.addEventListener("click", () => {
                panelConfig.checkoutModal.classList.remove("open");
                panelConfig.checkoutModal.setAttribute("aria-hidden", "true");
            });
        }
    });

    /* This sets up event listeners for the cart panels, allowing users to increase/decrease item quantities, remove items, and open/close the cart and checkout modals.  */
    return {
        openPanel: (panelIndex = 0) => openPanel(panels[panelIndex]),
        renderCart: (panelIndex = 0) => renderCart(panels[panelIndex])
    };
})();

/* ============================================================
   HOME PAGE FEATURED PRODUCTS
   ============================================================ */
(function () {
    const navCartLink = document.querySelector('nav a[href="cart.html"]');
    const addToCartLinks = Array.from(document.querySelectorAll('.price-row a[href="cart.html"]'));

    function parsePrice(text) {
        const m = (text || "").match(/(\d+(\.\d+)?)/);
        return m ? Number(m[1]) : 0;
    }

    /* IMPORTANT */
    if (navCartLink) {
        navCartLink.addEventListener("click", event => {
            event.preventDefault(); /* prevents the browser from following the link's default behavior */ 
            event.stopImmediatePropagation(); /* prevents any other click event listeners on the same element from being called */
            if (CartUI) CartUI.openPanel(0);
        }, true); /* Opens the cart panel when the cart link in the navigation is clicked. */ 
    }

    addToCartLinks.forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            event.stopImmediatePropagation();

            const card = link.closest(".watch-card"); /* to find the product card element that contains the clicked "Add to Cart" link.  */
            const nameNode = card ? card.querySelector("h3") : null;
            const priceNode = card ? card.querySelector(".price") : null;
            const name = nameNode ? nameNode.textContent.trim() : "Item";
            const unitPrice = parsePrice(priceNode ? priceNode.textContent : "");

            CartManager.addItem(name, unitPrice, 1); /* sends the data */
            playCartDing(); /*plays the sound effect*/

            if (CartUI) CartUI.openPanel(0); /* immediately shows the cart panel */
        }, true);
    });
})();

/* ============================================================
   PRODUCTS PAGE MODAL ADD TO CART
   ============================================================ */
(function () {
    const addToCartBtn = document.getElementById("modal-add-to-cart");
    const modalTitle = document.getElementById("modal-title");
    const modalPrice = document.getElementById("modal-price");
    const watchModal = document.getElementById("watch-modal");

    if (!addToCartBtn) return; /* if the button doesn't exist, stop everything. */

    function parsePrice(text) {
        const m = (text || "").match(/(\d+(\.\d+)?)/);
        return m ? Number(m[1]) : 0;
    }

    addToCartBtn.addEventListener("click", event => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const name = modalTitle ? modalTitle.textContent.trim() : "Item"; /* gets clean product name */
        const unitPrice = parsePrice(modalPrice ? modalPrice.textContent : "");

        CartManager.addItem(name, unitPrice, 1); /* sends the data to the cart manager */

        playCartDing(); /*Plays cart sound effect*/

        if (watchModal) {
            watchModal.hidden = true;
            document.body.style.overflow = "";
        }

        if (CartUI) CartUI.openPanel(1);
    }, true);
})();

/* ============================================================
   CONTACT PAGE AUDIO FEEDBACK
   ============================================================ */
(function () {
    const contactForm = document.querySelector(".contact-form form");
    const feedbackAudio = document.getElementById("feedback-audio");
    const feedbackMessage = document.getElementById("feedback-message");

    if (!contactForm || !feedbackAudio || !feedbackMessage) return;

    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        feedbackMessage.textContent = "Thank you for your feedback. We will get back to you soon.";

        feedbackAudio.currentTime = 0;
        feedbackAudio.play();

        contactForm.reset();
    });
})();

/*Purchase Form System*/
/* ============================================================
   PURCHASE FORM SYSTEM
   ============================================================ */
(function () {
    const checkoutForms = [
        {
            form: document.getElementById("home-purchase-form"),
            message: document.getElementById("home-purchase-message")
        },
        {
            form: document.getElementById("products-purchase-form"),
            message: document.getElementById("products-purchase-message")
        }
    ];

    checkoutForms.forEach(checkout => {
        if (!checkout.form || !checkout.message) return;

        checkout.form.addEventListener("submit", function (event) {
            event.preventDefault();

            if (CartManager.getItems().length === 0) {
                checkout.message.textContent = "Your cart is empty. Please add an item before purchasing.";
                return;
            }

            checkout.message.textContent = "Thank you for your purchase! Your order has been placed.";

            CartManager.clear();

            if (CartUI) {
                CartUI.renderCart(0);
                CartUI.renderCart(1);
            }

            checkout.form.reset();
        });
    });
})();