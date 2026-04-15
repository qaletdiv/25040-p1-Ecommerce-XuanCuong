import { initShopData } from "./storage.js";
import {
  getProducts,
  getProductById,
  getCategoryById,
  formatPrice,
  getQueryParam,
  addProductToCart,
  setupAddToCart,
  getDefaultVariant,
} from "./common.js";

import { DEFAULT_COLOR_OPTIONS, DEFAULT_SIZE_OPTIONS } from "./keys.js";
import { renderHeader, renderFooter, createProductCard } from "./common-ui.js";

function getProductIdFromUrl() {
  return Number(getQueryParam("id"));
}

function getProductImages(product) {
  console.log("product full =", product);
  console.log("product.images =", product?.images);
  console.log("product.image =", product?.image);
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images;
  }

  if (product.image) return [product.image];
  return [];
}

function getProductColors(product) {
  if (Array.isArray(product.colors) && product.colors.length > 0) {
    return product.colors;
  }
  return DEFAULT_COLOR_OPTIONS;
}

function getProductSizes(product) {
  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    return product.sizes;
  }
  return DEFAULT_SIZE_OPTIONS;
}

// function createRelatedCard(product) {
//   return `
//     <a class="related-product-card" href="./product-detail.html?id=${product.id}">
//       <div class="related-product-image-wrap">
//         <img src="${product.image}" alt="${product.name}" />
//       </div>
//       <div class="related-product-title">${product.name}</div>
//       <div class="related-product-price-row">
//         <span class="related-product-price">${formatPrice(product.price)}</span>
//         <span class="related-product-old-price">${formatPrice(product.oldPrice)}</span>
//       </div>
//     </a>
//   `;
// }

function renderWideInfo(product) {
  const container = document.getElementById("detailWideInfo");
  if (!container) return;

  const category = getCategoryById(product.categoryId);

  container.innerHTML = `
    <h3>Item details</h3>
    <div class="detail-wide-info-grid">
      <div class="detail-wide-block">
        <h4>Description</h4>
        <p>${product.description || "Beautiful handcrafted product with practical everyday use."}</p>
        <ul>
          <li>Responsive product detail layout for desktop, tablet, and mobile.</li>
          <li>Supports multiple images, variant selection, and add-to-cart flow.</li>
          <li>Clean ecommerce presentation with large visual focus on the product.</li>
          <li>Related products stay visible below for easier continued shopping.</li>
        </ul>
      </div>

      <div class="detail-wide-block">
        <h4>Specifications</h4>
        <div class="detail-spec-table">
          <div class="detail-spec-row">
            <div class="detail-spec-key">Product ID</div>
            <div class="detail-spec-value">${product.id}</div>
          </div>
          <div class="detail-spec-row">
            <div class="detail-spec-key">Category</div>
            <div class="detail-spec-value">${category?.name || "-"}</div>
          </div>
          <div class="detail-spec-row">
            <div class="detail-spec-key">Type</div>
            <div class="detail-spec-value">${product.type || "-"}</div>
          </div>
          <div class="detail-spec-row">
            <div class="detail-spec-key">Available stock</div>
            <div class="detail-spec-value">${product.stock}</div>
          </div>
          <div class="detail-spec-row">
            <div class="detail-spec-key">Price</div>
            <div class="detail-spec-value">${formatPrice(product.price)}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderRelatedProducts(product) {
  const container = document.getElementById("relatedProducts");
  if (!container) return;

  const relatedProducts = getProducts()
    .filter(
      (item) =>
        Number(item.id) !== Number(product.id) &&
        Number(item.categoryId) === Number(product.categoryId),
    )
    .slice(0, 10);

  if (!relatedProducts.length) {
    container.innerHTML = `<div class="empty-state">No related products found.</div>`;
    return;
  }

  container.innerHTML = relatedProducts.map(createProductCard).join("");
}

function bindGallery(images) {
  const mainImage = document.getElementById("detailMainImage");
  const thumbButtons = Array.from(
    document.querySelectorAll(".detail-thumb-btn"),
  );
  const prevBtn = document.getElementById("detailPrevBtn");
  const nextBtn = document.getElementById("detailNextBtn");

  if (!mainImage || !thumbButtons.length || !images.length) return;

  let currentIndex = 0;

  function updateGallery(index) {
    currentIndex = (index + images.length) % images.length;
    mainImage.src = images[currentIndex];

    thumbButtons.forEach((button, buttonIndex) => {
      button.classList.toggle("active", buttonIndex === currentIndex);
    });
  }

  thumbButtons.forEach((button, index) => {
    button.addEventListener("click", () => updateGallery(index));
  });

  prevBtn?.addEventListener("click", () => updateGallery(currentIndex - 1));
  nextBtn?.addEventListener("click", () => updateGallery(currentIndex + 1));

  updateGallery(0);
}

function bindCartActions(product) {
  const minusBtn = document.getElementById("detailQtyMinus");
  const plusBtn = document.getElementById("detailQtyPlus");
  const qtyValue = document.getElementById("detailQtyValue");
  const addCartBtn = document.getElementById("detailAddCartBtn");
  const colorSelect = document.getElementById("detailColorSelect");
  const sizeSelect = document.getElementById("detailSizeSelect");

  if (!qtyValue || !addCartBtn) return;

  let quantity = 1;

  function updateQty() {
    qtyValue.textContent = quantity;
  }

  minusBtn?.addEventListener("click", () => {
    if (quantity > 1) {
      quantity -= 1;
      updateQty();
    }
  });

  plusBtn?.addEventListener("click", () => {
    if (quantity < Number(product.stock || 99)) {
      quantity += 1;
      updateQty();
    }
  });

  addCartBtn.addEventListener("click", () => {
    const defaultVariant = getDefaultVariant();

    addProductToCart(product.id, quantity, {
      color: colorSelect?.value || defaultVariant.color,
      size: sizeSelect?.value || defaultVariant.size,
    });

    renderHeader();
  });

  updateQty();
}

function renderProductDetail(product) {
  const container = document.getElementById("productDetailSection");
  if (!container) return;

  const images = getProductImages(product);
  const colors = getProductColors(product);
  const sizes = getProductSizes(product);
  const category = getCategoryById(product.categoryId);
  const defaultVariant = getDefaultVariant();
  const defaultColor = colors[0] || defaultVariant.color;
  const defaultSize = sizes[1] || sizes[0] || defaultVariant.size;

  const breadcrumbCurrent = document.getElementById("detailBreadcrumbCurrent");
  if (breadcrumbCurrent) {
    breadcrumbCurrent.textContent = product.name;
  }
  console.log(images);

  container.innerHTML = `
    <div class="detail-thumbs">
      ${images
        .map(
          (image, index) => `
            <button class="detail-thumb-btn ${index === 0 ? "active" : ""}" type="button" aria-label="View image ${index + 1}">
              <img src="${image}" alt="${product.name}" />
            </button>
          `,
        )
        .join("")}
    </div>

    <div class="detail-main-gallery">
      <div class="detail-main-image-wrap">
        <button class="detail-gallery-nav prev" id="detailPrevBtn" type="button" aria-label="Previous image">‹</button>
        <img
          id="detailMainImage"
          class="detail-main-image"
          src="${images[0] || product.image}"
          alt="${product.name}"
        />
        <button class="detail-gallery-nav next" id="detailNextBtn" type="button" aria-label="Next image">›</button>
      </div>
    </div>

    <div class="detail-buy-panel">
      <div class="detail-price-row">
        <span class="detail-price-current">${formatPrice(product.price)}</span>
        <span class="detail-price-old">${formatPrice(product.oldPrice)}</span>
      </div>

      <h1 class="detail-title">${product.name}</h1>

      <div class="detail-buy-meta">
        <div class="detail-buy-meta-card">
          <span class="detail-buy-meta-label">Category</span>
          <span class="detail-buy-meta-value">${category?.name || "-"}</span>
        </div>
        <div class="detail-buy-meta-card">
          <span class="detail-buy-meta-label">Stock</span>
          <span class="detail-buy-meta-value">${product.stock}</span>
        </div>
      </div>

      <div class="detail-select-group">
        <label class="detail-select-label" for="detailColorSelect">Color</label>
        <div class="detail-select-wrap">
          <select id="detailColorSelect" class="detail-select">
            ${colors
              .map(
                (color) => `
                  <option value="${color}" ${color === defaultColor ? "selected" : ""}>
                    ${color}
                  </option>
                `,
              )
              .join("")}
          </select>
        </div>
      </div>

      <div class="detail-select-group">
        <label class="detail-select-label" for="detailSizeSelect">Size</label>
        <div class="detail-select-wrap">
          <select id="detailSizeSelect" class="detail-select">
            ${sizes
              .map(
                (size) => `
                  <option value="${size}" ${size === defaultSize ? "selected" : ""}>
                    ${size}
                  </option>
                `,
              )
              .join("")}
          </select>
        </div>
      </div>

      <div class="detail-qty-block">
        <label class="detail-qty-label">Quantity</label>
        <div class="detail-qty-box">
          <button type="button" class="detail-qty-btn" id="detailQtyMinus">−</button>
          <div class="detail-qty-value" id="detailQtyValue">1</div>
          <button type="button" class="detail-qty-btn" id="detailQtyPlus">+</button>
        </div>
      </div>

      <button type="button" class="detail-add-cart-btn" id="detailAddCartBtn">
        Add to cart
      </button>

      <p class="detail-panel-note">Selected color and size will be added exactly as chosen above.</p>
    </div>
  `;

  renderWideInfo(product);
  renderRelatedProducts(product);
  bindGallery(images);
  bindCartActions(product);
}

function renderNotFound() {
  const container = document.getElementById("productDetailSection");
  if (!container) return;

  container.innerHTML = `
    <div class="detail-empty">
      <h2>Product not found</h2>
      <p>Please go back and choose another product.</p>
    </div>
  `;
}

function initProductDetailPage() {
  initShopData();
  renderHeader();
  renderFooter();
  setupAddToCart();
  const productId = getProductIdFromUrl();
  const product = getProductById(productId);

  if (!product) {
    renderNotFound();
    return;
  }

  renderProductDetail(product);
}

document.addEventListener("DOMContentLoaded", initProductDetailPage);
