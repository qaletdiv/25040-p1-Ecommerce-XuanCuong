// file name: account.js
import { initShopData } from "./storage.js";
import {
  getCurrentUser,
  requireLogin,
  getUserOrders,
  formatPrice,
  formatDateTime,
} from "./common.js";
import { renderHeader, renderFooter } from "./common-ui.js";

function renderAccountPage() {
  const currentUser = getCurrentUser();
  const container = document.getElementById("accountPage");
  if (!currentUser || !container) return;

  const orders = getUserOrders(currentUser.id);

  container.innerHTML = `
    <section class="account-hero card">
      <p class="section-kicker">Customer account</p>
      <h1 class="section-title">My account</h1>
      <div class="account-profile-grid">
        <div>
          <span>Full name</span>
          <strong>${currentUser.fullName}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>${currentUser.email}</strong>
        </div>
      </div>
    </section>

    <section class="account-orders-section card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Purchase history</p>
          <h2 class="section-title">Order history</h2>
        </div>
      </div>

      ${
        orders.length
          ? `
            <div class="account-orders-list">
              ${orders
                .map(
                  (order) => `
                    <article class="account-order-item">
                      <div class="account-order-top">
                        <div>
                          <h3>${order.code}</h3>
                          <p>${formatDateTime(order.createdAt)}</p>
                        </div>
                        <div class="account-order-right">
                          <strong>${formatPrice(order.total)}</strong>
                          <span class="status-pill">${order.status}</span>
                        </div>
                      </div>
                      <div class="account-order-body">
                        <p><strong>Shipping:</strong> ${order.shippingInfo.fullName} - ${order.shippingInfo.phone}</p>
                        <p><strong>Address:</strong> ${order.shippingInfo.address}</p>
                        <ul>
                          ${order.items
                            .map(
                              (item) => `<li>${item.name} × ${item.quantity} - ${item.color} / ${item.size} - ${formatPrice(item.lineTotal)}</li>`,
                            )
                            .join("")}
                        </ul>
                      </div>
                    </article>
                  `,
                )
                .join("")}
            </div>
          `
          : `<div class="empty-state">You do not have any orders yet.</div>`
      }
    </section>
  `;
}

function initAccountPage() {
  initShopData();
  if (!requireLogin("Please sign in first to view your account.")) return;
  renderHeader();
  renderFooter();
  renderAccountPage();
}

document.addEventListener("DOMContentLoaded", initAccountPage);
