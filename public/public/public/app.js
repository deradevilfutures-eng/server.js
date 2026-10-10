
/* ========================================
   7. DATA MENU COFFEE SHOP
======================================== */

const menuProducts = [
    {
        id: 1,
        name: "Midnight Latte",
        category: "Coffee",
        price: 24000,
        description: "Espresso, susu creamy, gula aren.",
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        name: "Velvet Cappuccino",
        category: "Coffee",
        price: 26000,
        description: "Espresso dengan foam lembut.",
        image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        name: "Classic Americano",
        category: "Coffee",
        price: 18000,
        description: "Kopi hitam dengan karakter kuat.",
        image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        name: "Golden Matcha",
        category: "Non-Coffee",
        price: 25000,
        description: "Matcha dan susu yang seimbang.",
        image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 5,
        name: "Dark Chocolate",
        category: "Non-Coffee",
        price: 23000,
        description: "Cokelat pekat, creamy, dan lembut.",
        image: "https://images.unsplash.com/photo-1542990253-0b8be8f1f3f0?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 6,
        name: "Butter Croissant",
        category: "Food",
        price: 19000,
        description: "Pastry renyah dengan aroma butter.",
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 7,
        name: "Classic Pancake",
        category: "Food",
        price: 27000,
        description: "Pancake lembut untuk waktu santai.",
        image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 8,
        name: "Iced Coffee",
        category: "Coffee",
        price: 20000,
        description: "Kopi dingin yang menyegarkan.",
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80"
    }
];

const grid = document.getElementById("productGrid");
const countElement = document.getElementById("cartCount");
const itemsElement = document.getElementById("cartItems");
const totalElement = document.getElementById("cartTotal");
const panel = document.getElementById("cartPanel");
const backdrop = document.getElementById("overlay");

let selectedCategory = "All";
let shoppingCart = [];

function rupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(value);
}

/* ========================================
   8. RENDER MENU DAN FILTER
======================================== */

function renderMenu() {
    const visibleProducts = selectedCategory === "All"
        ? menuProducts
        : menuProducts.filter(
            product => product.category === selectedCategory
        );

    grid.innerHTML = visibleProducts.map(product => `
        <article class="product-card">
            <div class="product-image">
                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >
            </div>

            <div class="product-info">
                <span class="product-category">
                    ${product.category}
                </span>

                <h3>${product.name}</h3>

                <p class="product-description">
                    ${product.description}
                </p>

                <div class="product-bottom">
                    <span class="product-price">
                        ${rupiah(product.price)}
                    </span>

                    <button
                        class="add-button"
                        data-add="${product.id}"
                    >
                        + Add to bag
                    </button>
                </div>
            </div>
        </article>
    `).join("");
}

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        selectedCategory = button.dataset.category;

        renderMenu();
    });
});

/* ========================================
   9. KERANJANG BELANJA
======================================== */

function addToCart(id) {
    const product = menuProducts.find(item => item.id === id);

    if (!product) return;

    const existing = shoppingCart.find(item => item.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        shoppingCart.push({
            ...product,
            quantity: 1
        });
    }

    renderCart();
    openShoppingCart();
}

grid.addEventListener("click", event => {
    const button = event.target.closest("[data-add]");

    if (button) {
        addToCart(Number(button.dataset.add));
    }
});

function changeQuantity(id, amount) {
    const item = shoppingCart.find(product => product.id === id);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        shoppingCart = shoppingCart.filter(
            product => product.id !== id
        );
    }

    renderCart();
}

function renderCart() {
    const totalItems = shoppingCart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const totalPrice = shoppingCart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    countElement.textContent = totalItems;
    totalElement.textContent = rupiah(totalPrice);

    if (shoppingCart.length === 0) {
        itemsElement.innerHTML = `
            <p class="empty-cart">
                Your bag is waiting.<br>
                Temukan kopi favoritmu ☕
            </p>
        `;
        return;
    }

    itemsElement.innerHTML = shoppingCart.map(item => `
        <div class="cart-item">
            <div>
                <h3>${item.name}</h3>
                <p>${rupiah(item.price)} / item</p>

                <div class="quantity-controls">
                    <button
                        data-quantity="-1"
                        data-id="${item.id}"
                        aria-label="Kurangi jumlah"
                    >−</button>

                    <span>${item.quantity}</span>

                    <button
                        data-quantity="1"
                        data-id="${item.id}"
                        aria-label="Tambah jumlah"
                    >+</button>
                </div>
            </div>

            <strong>
                ${rupiah(item.price * item.quantity)}
            </strong>
        </div>
    `).join("");
}

itemsElement.addEventListener("click", event => {
    const button = event.target.closest("[data-quantity]");

    if (!button) return;

    changeQuantity(
        Number(button.dataset.id),
        Number(button.dataset.quantity)
    );
});

/* ========================================
   10. BUKA DAN TUTUP KERANJANG
======================================== */

function openShoppingCart() {
    panel.classList.add("show");
    backdrop.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeShoppingCart() {
    panel.classList.remove("show");
    backdrop.classList.remove("show");
    document.body.style.overflow = "";
}

document.getElementById("openCart")
    .addEventListener("click", openShoppingCart);

document.getElementById("closeCart")
    .addEventListener("click", closeShoppingCart);

backdrop.addEventListener("click", closeShoppingCart);

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeShoppingCart();
    }
});

/* ========================================
   11. NAVIGASI MOBILE
======================================== */

const mobileMenuButton = document.getElementById("mobileMenu");
const navigation = document.getElementById("navigation");

mobileMenuButton.addEventListener("click", () => {
    navigation.classList.toggle("open");
});

navigation.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navigation.classList.remove("open");
    });
});

/* ========================================
   12. SIMULASI CHECKOUT
======================================== */

document.getElementById("checkout")
    .addEventListener("click", () => {
        if (shoppingCart.length === 0) {
            alert("Keranjang kamu masih kosong.");
            return;
        }

        const orderDetails = shoppingCart.map(item =>
            `${item.name} x ${item.quantity}`
        ).join("\n");

        const total = shoppingCart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        alert(
            "KOPI SENJA — ORDER SUMMARY\n\n" +
            orderDetails +
            "\n\nTotal: " + rupiah(total) +
            "\n\nIni masih simulasi. Belum ada transaksi nyata."
        );
    });

/* ========================================
   13. JALANKAN KATALOG
======================================== */

renderMenu();
renderCart();
