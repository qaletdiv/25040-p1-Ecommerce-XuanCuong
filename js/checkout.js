// file name: checkout.js
import { initShopData } from "./storage.js";
import {
  getCurrentUser,
  requireLogin,
  getDetailedCartItems,
  formatPrice,
  createOrder,
} from "./common.js";
import { renderHeader, renderFooter } from "./common-ui.js";

function showMessage(message, type = "error") {
  const box = document.getElementById("checkoutMessage");
  if (!box) return;
  box.className = `message ${type}`;
  box.textContent = message;
}

function renderCheckoutSummary() {
  const currentUser = getCurrentUser();
  const summarySection = document.getElementById("checkoutSummarySection");
  if (!currentUser || !summarySection) return;

  const items = getDetailedCartItems(currentUser.id);
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  summarySection.innerHTML = `
    <div class="checkout-summary card">
      <h2>Order summary</h2>
      <div class="checkout-summary-list">
        ${items
          .map(
            (item) => `
              <div class="checkout-summary-item">
                <img src="${item.product.image}" alt="${item.product.name}" />
                <div>
                  <h3>${item.product.name}</h3>
                  <p>Qty: ${item.quantity}</p>
                  <p>Color: ${item.color}</p>
                  <p>Size: ${item.size}</p>
                  <strong>${formatPrice(item.lineTotal)}</strong>
                </div>
              </div>
            `,
          )
          .join("")}
      </div>
      <div class="checkout-total-row">
        <span>Total</span>
        <strong>${formatPrice(total)}</strong>
      </div>
    </div>
  `;
}

function setupCheckoutForm() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const items = getDetailedCartItems(currentUser.id);
    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();

    if (!fullName || !phone || !address) {
      showMessage("Please fill in full name, phone number, and address.");
      return;
    }

    const order = createOrder({
      userId: currentUser.id,
      shippingInfo: { fullName, phone, address },
      items,
    });

    if (!order) {
      return;
    }

    showMessage("Order placed successfully.", "success");
    setTimeout(() => {
      window.location.href = `./order-confirmation.html?id=${order.id}`;
    }, 600);
  });
}

function initCheckoutPage() {
  initShopData();
  if (!requireLogin("Please sign in first to continue checkout.")) return;

  const currentUser = getCurrentUser();
  const items = getDetailedCartItems(currentUser.id);
  if (!items.length) {
    window.location.href = "./cart.html";
    return;
  }

  renderHeader();
  renderFooter();
  renderCheckoutSummary();
  setupCheckoutForm();
}

document.addEventListener("DOMContentLoaded", initCheckoutPage);
