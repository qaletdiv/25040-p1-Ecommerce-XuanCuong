// file name: cart.js
import { initShopData } from "./storage.js";
import {
  getCurrentUser,
  requireLogin,
  getDetailedCartItems,
  formatPrice,
  updateCartItemQuantity,
  removeCartItem,
  changeCartItemVariant,
} from "./common.js";
import { renderHeader, renderFooter } from "./common-ui.js";

function createSelectOptions(options = [], selectedValue = "") {
  return options
    .map(
      (option) =>
        `<option value="${option}" ${String(option) === String(selectedValue) ? "selected" : ""}>${option}</option>`,
    )
    .join("");
}

function createQtyOptions(selectedValue = 1) {
  return Array.from({ length: 10 }, (_, index) => index + 1)
    .map(
      (qty) =>
        `<option value="${qty}" ${Number(qty) === Number(selectedValue) ? "selected" : ""}>${qty}</option>`,
    )
    .join("");
}

function renderCartPage() {
  const currentUser = getCurrentUser();
  const itemsSection = document.getElementById("cartItemsSection");
  const summarySection = document.getElementById("cartSummarySection");

  if (!currentUser || !itemsSection || !summarySection) return;

  const detailedItems = getDetailedCartItems(currentUser.id);
  const subtotal = detailedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalQuantity = detailedItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  if (!detailedItems.length) {
    itemsSection.innerHTML = `
      <div class="empty-state cart-empty-state">
        Your cart is empty. Start exploring products you like.
        <div class="cart-empty-actions">
          <a href="./products.html" class="btn">Continue shopping</a>
        </div>
      </div>
    `;

    summarySection.innerHTML = `
      <div class="cart-summary-card card">
        <h2>Order summary</h2>
        <div class="summary-line"><span>Items</span><strong>0</strong></div>
        <div class="summary-line"><span>Quantity</span><strong>0</strong></div>
        <div class="summary-line total"><span>Subtotal</span><strong>${formatPrice(0)}</strong></div>
        <a href="./products.html" class="btn summary-btn">Browse products</a>
      </div>
    `;
    return;
  }

  itemsSection.innerHTML = `
    <div class="cart-list">
      ${detailedItems
        .map(
          (item) => `
            <article class="cart-item card">
              <a class="cart-item-image" href="./product-detail.html?id=${item.product.id}">
                <img src="${item.product.image}" alt="${item.product.name}" />
              </a>

              <div class="cart-item-content">
                <div class="cart-item-main">
                  <div class="cart-item-info">
                    <h3>
                      <a href="./product-detail.html?id=${item.product.id}">
                        ${item.product.name}
                      </a>
                    </h3>

                    <p class="cart-item-meta">${item.product.description || ""}</p>

                    <div class="cart-variant-grid">
                      <label class="cart-field">
                        <span class="cart-field-label">Color</span>
                        <select
                          class="cart-variant-select cart-color-select"
                          data-role="color"
                          data-product-id="${item.product.id}"
                          data-old-color="${item.color}"
                          data-old-size="${item.size}"
                        >
                          ${createSelectOptions(item.availableColors, item.color)}
                        </select>
                      </label>

                      <label class="cart-field">
                        <span class="cart-field-label">Size</span>
                        <select
                          class="cart-variant-select cart-size-select"
                          data-role="size"
                          data-product-id="${item.product.id}"
                          data-old-color="${item.color}"
                          data-old-size="${item.size}"
                        >
                          ${createSelectOptions(item.availableSizes, item.size)}
                        </select>
                      </label>

                      <label class="cart-field cart-field-qty">
                        <span class="cart-field-label">Qty</span>
                        <select
                          class="cart-qty-select"
                          data-product-id="${item.product.id}"
                          data-color="${item.color}"
                          data-size="${item.size}"
                        >
                          ${createQtyOptions(item.quantity)}
                        </select>
                      </label>
                    </div>

                    <div class="cart-item-actions">
                      <button
                        type="button"
                        class="cart-remove-btn"
                        data-product-id="${item.product.id}"
                        data-color="${item.color}"
                        data-size="${item.size}"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div class="cart-price-box">
                    <div class="unit-price">${formatPrice(item.product.price)}</div>
                    <div class="line-price">${formatPrice(item.lineTotal)}</div>
                  </div>
                </div>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;

  summarySection.innerHTML = `
    <div class="cart-summary-card card">
      <h2>Order summary</h2>
      <div class="summary-line"><span>Items</span><strong>${detailedItems.length}</strong></div>
      <div class="summary-line"><span>Quantity</span><strong>${totalQuantity}</strong></div>
      <div class="summary-line total"><span>Subtotal</span><strong>${formatPrice(subtotal)}</strong></div>
      <p class="summary-note">Shipping and tax will be calculated during checkout.</p>
      <a href="./checkout.html" class="btn summary-btn">Proceed to checkout</a>
      <a href="./products.html" class="summary-link">Continue shopping</a>
    </div>
  `;
}

function setupCartEvents() {
  document.addEventListener("change", (event) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const qtySelect = event.target.closest(".cart-qty-select");
    if (qtySelect) {
      updateCartItemQuantity(
        currentUser.id,
        Number(qtySelect.dataset.productId),
        Number(qtySelect.value),
        {
          color: qtySelect.dataset.color,
          size: qtySelect.dataset.size,
        },
      );
      renderCartPage();
      renderHeader();
      return;
    }

    const variantSelect = event.target.closest(".cart-variant-select");
    if (variantSelect) {
      const productId = Number(variantSelect.dataset.productId);
      const oldColor = variantSelect.dataset.oldColor;
      const oldSize = variantSelect.dataset.oldSize;

      const row = variantSelect.closest(".cart-item-info");
      if (!row) return;

      const colorSelect = row.querySelector(".cart-color-select");
      const sizeSelect = row.querySelector(".cart-size-select");

      if (!colorSelect || !sizeSelect) return;

      changeCartItemVariant(
        currentUser.id,
        productId,
        {
          color: oldColor,
          size: oldSize,
        },
        {
          color: colorSelect.value,
          size: sizeSelect.value,
        },
      );

      renderCartPage();
      renderHeader();
    }
  });

  document.addEventListener("click", (event) => {
    const removeBtn = event.target.closest(".cart-remove-btn");
    if (!removeBtn) return;

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    removeCartItem(currentUser.id, Number(removeBtn.dataset.productId), {
      color: removeBtn.dataset.color,
      size: removeBtn.dataset.size,
    });

    renderCartPage();
    renderHeader();
  });
}

function initCartPage() {
  initShopData();
  if (!requireLogin("Please sign in first to view your cart.")) return;

  renderHeader();
  renderFooter();
  renderCartPage();
  setupCartEvents();
}

document.addEventListener("DOMContentLoaded", initCartPage);
