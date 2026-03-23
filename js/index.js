// Mục đích:
// Xử lý trang chủ:
// - nạp dữ liệu
// - render header/footer
// - render sản phẩm nổi bật
// - slider
// - bắt sự kiện add to cart

import { initShopData } from "./storage.js";
import { getProducts, formatPrice, addProductToCart } from "./common.js";
import { renderHeader, renderFooter } from "./common-ui.js";

function createProductCard(product) {
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

function renderFeaturedProducts() {
  const container = document.getElementById("featuredProducts");
  if (!container) return;

  const featuredProducts = getProducts()
    .filter((item) => item.featured)
    .slice(0, 8);

  container.innerHTML = featuredProducts.map(createProductCard).join("");
}

function setupAddToCart() {
  // Mục đích:
  // Dùng event delegation để bắt click nút add to cart trong trang home
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".add-to-cart-btn");
    if (!button) return;

    const productId = Number(button.dataset.id);
    addProductToCart(productId, 1);
    renderHeader();
  });
}

function setupHomeSlider() {
  const slider = document.getElementById("homeSlider");
  const prevBtn = document.getElementById("sliderPrev");
  const nextBtn = document.getElementById("sliderNext");
  const dotsContainer = document.getElementById("homeSliderDots");

  if (!slider || !prevBtn || !nextBtn || !dotsContainer) return;

  const slides = Array.from(slider.querySelectorAll(".home-slide"));
  if (!slides.length) return;

  let currentIndex = 0;
  let autoSlide;

  function renderDots() {
    dotsContainer.innerHTML = slides
      .map(
        (_, index) =>
          `<button type="button" data-index="${index}" class="${
            index === currentIndex ? "active" : ""
          }"></button>`,
      )
      .join("");

    dotsContainer.querySelectorAll("button").forEach((dot) => {
      dot.addEventListener("click", () => {
        goToSlide(Number(dot.dataset.index));
      });
    });
  }

  function goToSlide(index) {
    slides[currentIndex].classList.remove("active");
    currentIndex = (index + slides.length) % slides.length;
    slides[currentIndex].classList.add("active");
    renderDots();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlide = setInterval(nextSlide, 4000);
  }

  function stopAutoSlide() {
    if (autoSlide) clearInterval(autoSlide);
  }

  prevBtn.addEventListener("click", () => {
    prevSlide();
    startAutoSlide();
  });

  nextBtn.addEventListener("click", () => {
    nextSlide();
    startAutoSlide();
  });

  slider.addEventListener("mouseenter", stopAutoSlide);
  slider.addEventListener("mouseleave", startAutoSlide);

  renderDots();
  startAutoSlide();
}

function initHomePage() {
  initShopData();
  renderHeader();
  renderFooter();
  renderFeaturedProducts();
  setupAddToCart();
  setupHomeSlider();
}

document.addEventListener("DOMContentLoaded", initHomePage);
