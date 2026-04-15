// Mục đích:
// Render header/footer dùng chung và xử lý search tại header
// file name: common-ui.js
import {
  getCurrentUser,
  setCurrentUser,
  redirect,
  getCartCount,
} from "./common.js";
import { formatPrice } from "./common.js";
export function renderHeader() {
  const container = document.getElementById("siteHeader");
  if (!container) return;

  const currentUser = getCurrentUser();
  const cartCount = currentUser ? getCartCount(currentUser.id) : 0;

  container.innerHTML = `
    <header class="site-header">
      <div class="container site-header-top">
        <a href="./index.html" class="site-logo">CN Artify</a>

        <div class="site-search">
          <input
            type="text"
            id="shopSearchInput"
            placeholder="Search for product name"
          />
          <button type="button" id="shopSearchBtn">⌕</button>
        </div>

        <div class="site-header-actions">
          ${
            currentUser
              ? `
                <a href="./account.html">Hi, ${currentUser.fullName?.trim() || "User"}</a>
                <a href="./cart.html" class="cart-link">🛒 <span class="cart-count-badge">${cartCount}</span></a>
                <a href="#" id="headerLogoutBtn">Logout</a>
              `
              : `
                <a href="./login.html">Sign in</a>
                <a href="./signup.html">Sign up</a>
                <a href="./cart.html" class="cart-link">🛒</a>
              `
          }
        </div>
      </div>

      <div class="container site-header-nav">
        <a href="./index.html">Home</a>
        <a href="./products.html">Products</a>
        <a href="./contact.html">Contact</a>
        <a href="./policies.html">Shop Policies</a>
      </div>

      <section class="shop-cover">
        <img src="./assets/images/shop-cover.png" alt="Shop cover" />
      </section>

      <section class="shop-info container">
        <div class="shop-info-left">
          <img
            src="./assets/images/logo.png"
            alt="CN Artify"
            class="shop-avatar"
          />
          <div>
            <h1 class="shop-name">CN artify - Creative gifts, made with love</h1>
          </div>
        </div>
      </section>
    </header>
  `;

  document
    .getElementById("headerLogoutBtn")
    ?.addEventListener("click", (event) => {
      event.preventDefault();
      setCurrentUser(null);
      redirect("./index.html");
    });

  setupHeaderSearch();
}

export function setupHeaderSearch() {
  // Mục đích:
  // Search chung ở header. Có thể dùng tại trang home và products.
  const input = document.getElementById("shopSearchInput");
  const btn = document.getElementById("shopSearchBtn");

  if (!input || !btn) return;

  const currentUrl = new URL(window.location.href);
  const currentKeyword = currentUrl.searchParams.get("keyword") || "";
  input.value = currentKeyword;

  const handleSearch = () => {
    const keyword = input.value.trim();

    if (!keyword) {
      window.location.href = "./products.html";
      return;
    }

    window.location.href = `./products.html?keyword=${encodeURIComponent(keyword)}`;
  };

  btn.addEventListener("click", handleSearch);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleSearch();
  });
}

export function renderFooter() {
  const container = document.getElementById("siteFooter");
  if (!container) return;

  container.innerHTML = `
    <footer class="market-footer">
      <div class="container market-footer-main">
        <div class="market-footer-brand">
          <div class="market-brand-box">CN</div>
          <!-- <button class="download-app-btn">Download the App</button> -->
        </div>

        <div class="market-footer-cols">
          <div>
            <h3>Shop</h3>
            <a href="index.html">Home Page</a>
            <a href="products.html">Products</a>
            <!--<a href="#">Sitemap</a>-->
            <!-- <a href="#">Blog</a> -->
          </div>

         <!-- <div>
            <h3>Sell</h3>
            <a href="#">Sell on marketplace</a>
            <a href="#">Teams</a>
            <a href="#">Forums</a>
            <a href="#">Affiliates</a>
          </div> -->

          <div>
            <h3>About</h3>
            <a href="contact.html">Company</a>
            <a href="policies.html">Policies</a>
            <!--<a href="#">Investors</a>-->
            <!--<a href="#">Careers</a>-->
          </div>

          <div>
            <h3>Help</h3>
            <a href="contact.html">Help Center</a>
            <!--<a href="#">Privacy settings</a>-->
            <a href="contact.html">Contact support</a>
          </div>
        </div>
      </div>

      <div class="market-footer-bottom">
        <div class="container market-footer-bottom-inner">
          <div>© ${new Date().getFullYear()} CN. All rights reserved.</div>
          <!--<div class="footer-bottom-links">
            <a href="#">Terms of Use</a>
            <a href="#">Privacy</a>
            <a href="#">Regions</a>
          </div> -->
        </div>
      </div>
    </footer>
  `;
}
export function createProductCard(product) {
  console.log("creatProductCard: ", product);
  return `
    <article class="product-card">
      <a href="./product-detail.html?id=${product.id}">
        <img src="${product.image}" alt="${product.name}" />
      </a>

      <h3 class="product-title">${product.name}</h3>

      <div class="product-price-row">
        <span class="product-price-current">${formatPrice(product.price)}</span>
        <span class="product-price-old">${formatPrice(product.oldPrice)}</span>
      </div>

      <button class="btn w-100 add-to-cart-btn" data-id="${product.id}">
        Add to cart
      </button>
    </article>
  `;
}
