// file name: order-confirmation.js
import { initShopData } from "./storage.js";
import { getQueryParam, getOrderById, formatPrice, formatDateTime } from "./common.js";
import { renderHeader, renderFooter } from "./common-ui.js";

function renderOrderConfirmation() {
  const section = document.getElementById("orderConfirmSection");
  const orderId = getQueryParam("id");
  const order = getOrderById(orderId);

  if (!section) return;

  if (!order) {
    section.innerHTML = `<div class="empty-state">Order not found.</div>`;
    return;
  }

  section.innerHTML = `
    <section class="confirm-hero card">
      <div class="confirm-icon">✓</div>
      <p class="section-kicker">Thank you</p>
      <h1 class="section-title">Your order has been placed successfully</h1>
      <p class="confirm-subtext">Order code: <strong>${order.code}</strong></p>
      <div class="confirm-actions">
        <a href="./products.html" class="btn">Continue shopping</a>
        <a href="./account.html" class="btn-outline">View order history</a>
      </div>
    </section>

    <section class="confirm-detail-grid">
      <article class="card confirm-info-card">
        <h2>Order information</h2>
        <div class="confirm-info-list">
          <div><span>Order code</span><strong>${order.code}</strong></div>
          <div><span>Created at</span><strong>${formatDateTime(order.createdAt)}</strong></div>
          <div><span>Status</span><strong>${order.status}</strong></div>
          <div><span>Total</span><strong>${formatPrice(order.total)}</strong></div>
        </div>
      </article>

      <article class="card confirm-info-card">
        <h2>Shipping information</h2>
        <div class="confirm-address">
          <p><strong>${order.shippingInfo.fullName}</strong></p>
          <p>${order.shippingInfo.phone}</p>
          <p>${order.shippingInfo.address}</p>
        </div>
      </article>
    </section>

    <section class="card confirm-items-card">
      <h2>Ordered items</h2>
      <div class="confirm-items-list">
        ${order.items
          .map(
            (item) => `
              <article class="confirm-item-row">
                <img src="${item.image}" alt="${item.name}" />
                <div>
                  <h3>${item.name}</h3>
                  <p>Quantity: ${item.quantity}</p>
                  <p>Color: ${item.color}</p>
                  <p>Size: ${item.size}</p>
                </div>
                <strong>${formatPrice(item.lineTotal)}</strong>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function initOrderConfirmationPage() {
  initShopData();
  renderHeader();
  renderFooter();
  renderOrderConfirmation();
}

document.addEventListener("DOMContentLoaded", initOrderConfirmationPage);
