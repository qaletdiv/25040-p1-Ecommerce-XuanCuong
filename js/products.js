// Mục đích:
// Xử lý toàn bộ trang products:
// - render Featured items
// - search theo keyword từ header
// - filter theo category
// - filter theo khoảng giá
// - sort theo tên / giá
// - phân trang
// - add to cart
//
// Quy tắc hiện tại:
// - Trạng thái mặc định:
//   + hiện Featured items
//   + filter nằm ở header Featured items
// - Chỉ cần khác mặc định:
//   + search
//   + sort
//   + price
//   + category
//   + page > 1
//   => ẩn Featured items
//   => filter chuyển xuống phần Filtered products / All items
// file name: products.js

import { initShopData } from "./storage.js";
import {
  getProducts,
  getCategories,
  getQueryParam,
  setupAddToCart,
} from "./common.js";
import { renderHeader, renderFooter, createProductCard } from "./common-ui.js";

const PRODUCTS_PER_PAGE = 12;

// function createProductCard(product) {
//   return `
//     <article class="product-card">
//       <a href="./product-detail.html?id=${product.id}">
//         <img src="${product.image}" alt="${product.name}" />
//       </a>

//       <h3 class="product-title">${product.name}</h3>

//       <div class="product-price-row">
//         <span class="product-price-current">${formatPrice(product.price)}</span>
//         <span class="product-price-old">${formatPrice(product.oldPrice)}</span>
//       </div>

//       <button class="btn w-100 add-to-cart-btn" data-id="${product.id}">
//         Add to cart
//       </button>
//     </article>
//   `;
// }

function getFilterState() {
  return {
    keyword: (getQueryParam("keyword") || "").trim().toLowerCase(),
    category: getQueryParam("category") || "",
    sort: getQueryParam("sort") || "default",
    priceRange: getQueryParam("price") || "all",
    page: Number(getQueryParam("page") || 1),
  };
}

function isDefaultProductsState() {
  const { keyword, category, sort, priceRange, page } = getFilterState();

  return (
    !keyword &&
    !category &&
    sort === "default" &&
    priceRange === "all" &&
    page === 1
  );
}

function filterByKeyword(products, keyword) {
  if (!keyword) return products;

  return products.filter((product) =>
    product.name.toLowerCase().includes(keyword),
  );
}

function filterByCategory(products, category) {
  if (!category) return products;

  return products.filter(
    (product) => String(product.categoryId) === String(category),
  );
}

function filterByPriceRange(products, priceRange) {
  switch (priceRange) {
    case "under-50":
      return products.filter((product) => Number(product.price) < 50);

    case "above-50":
      return products.filter((product) => Number(product.price) > 50);

    case "50-100":
      return products.filter(
        (product) =>
          Number(product.price) >= 50 && Number(product.price) <= 100,
      );

    case "above-100":
      return products.filter((product) => Number(product.price) > 100);

    case "all":
    default:
      return products;
  }
}

function sortProducts(products, sort) {
  const clonedProducts = [...products];

  switch (sort) {
    case "price-asc":
      return clonedProducts.sort((a, b) => a.price - b.price);

    case "price-desc":
      return clonedProducts.sort((a, b) => b.price - a.price);

    case "name-asc":
      return clonedProducts.sort((a, b) => a.name.localeCompare(b.name));

    case "name-desc":
      return clonedProducts.sort((a, b) => b.name.localeCompare(a.name));

    case "default":
    default:
      return clonedProducts;
  }
}

function getProcessedProducts() {
  const { keyword, category, sort, priceRange } = getFilterState();

  let products = getProducts();
  products = filterByKeyword(products, keyword);
  products = filterByCategory(products, category);
  products = filterByPriceRange(products, priceRange);
  products = sortProducts(products, sort);

  return products;
}

function syncFilterVisibility() {
  const featuredFilters = document.getElementById("featuredFilters");
  const allItemsFilters = document.getElementById("allItemsFilters");

  if (!featuredFilters || !allItemsFilters) return;

  const isDefaultState = isDefaultProductsState();

  if (isDefaultState) {
    featuredFilters.style.display = "flex";
    allItemsFilters.style.display = "none";
  } else {
    featuredFilters.style.display = "none";
    allItemsFilters.style.display = "flex";
  }
}

function renderFeaturedProducts() {
  const container = document.getElementById("featuredProducts");
  const featuredHeader = document.getElementById("featuredBlockHeader");

  if (!container || !featuredHeader) return;

  const isDefaultState = isDefaultProductsState();

  if (!isDefaultState) {
    featuredHeader.style.display = "none";
    container.style.display = "none";
    container.innerHTML = "";
    return;
  }

  featuredHeader.style.display = "flex";
  container.style.display = "grid";

  const featuredProducts = getProducts()
    .filter((item) => item.featured)
    .slice(0, 4);

  container.innerHTML = featuredProducts.map(createProductCard).join("");
}

function renderAllProducts() {
  const container = document.getElementById("allProducts");
  if (!container) return;

  const filterState = getFilterState();
  const processedProducts = getProcessedProducts();

  const totalPages = Math.max(
    1,
    Math.ceil(processedProducts.length / PRODUCTS_PER_PAGE),
  );

  const currentPage = Math.min(Math.max(filterState.page, 1), totalPages);

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;

  const paginatedProducts = processedProducts.slice(startIndex, endIndex);

  if (!paginatedProducts.length) {
    container.innerHTML = `
      <div class="empty-state">
        No products found matching your condition.
      </div>
    `;
    return;
  }

  container.innerHTML = paginatedProducts.map(createProductCard).join("");
}

function renderCategoryMenu() {
  const container = document.getElementById("shopCategoryMenu");
  if (!container) return;

  const categories = getCategories();
  const products = getProducts();

  const currentCategory = getQueryParam("category") || "";
  const currentKeyword = getQueryParam("keyword") || "";
  const currentSort = getQueryParam("sort") || "default";
  const currentPrice = getQueryParam("price") || "all";

  const allCount = filterByPriceRange(
    filterByKeyword(products, currentKeyword.toLowerCase()),
    currentPrice,
  ).length;

  const html = `
    <li>
      <a
        href="./products.html?keyword=${encodeURIComponent(currentKeyword)}&sort=${encodeURIComponent(currentSort)}&price=${encodeURIComponent(currentPrice)}"
        class="${!currentCategory ? "active" : ""}"
      >
        All <span>${allCount}</span>
      </a>
    </li>

    ${categories
      .map((category) => {
        const filteredCount = filterByPriceRange(
          filterByKeyword(products, currentKeyword.toLowerCase()),
          currentPrice,
        ).filter(
          (product) => Number(product.categoryId) === Number(category.id),
        ).length;

        return `
          <li>
            <a
              href="./products.html?keyword=${encodeURIComponent(currentKeyword)}&category=${category.id}&sort=${encodeURIComponent(currentSort)}&price=${encodeURIComponent(currentPrice)}"
              class="${String(currentCategory) === String(category.id) ? "active" : ""}"
            >
              ${category.name} <span>${filteredCount}</span>
            </a>
          </li>
        `;
      })
      .join("")}
  `;

  container.innerHTML = html;
}

function renderPagination() {
  const container = document.getElementById("productsPagination");
  if (!container) return;

  const filterState = getFilterState();
  const processedProducts = getProcessedProducts();

  const totalPages = Math.ceil(processedProducts.length / PRODUCTS_PER_PAGE);

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let currentPage = Number(filterState.page || 1);
  currentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const baseParams = new URLSearchParams(window.location.search);

  const createPageLink = (page) => {
    baseParams.set("page", String(page));
    return `./products.html?${baseParams.toString()}`;
  };

  let html = `
    <a class="page-btn" href="${createPageLink(Math.max(1, currentPage - 1))}">
      ←
    </a>
  `;

  for (let page = 1; page <= totalPages; page += 1) {
    html += `
      <a class="page-btn ${page === currentPage ? "active" : ""}" href="${createPageLink(page)}">
        ${page}
      </a>
    `;
  }

  html += `
    <a class="page-btn" href="${createPageLink(Math.min(totalPages, currentPage + 1))}">
      →
    </a>
  `;

  container.innerHTML = html;
}

function updatePageTitleBySearch() {
  const allItemsTitle = document.getElementById("allItemsTitle");
  const countText = document.getElementById("resultCountText");

  if (!allItemsTitle || !countText) return;

  const { keyword, category, priceRange } = getFilterState();
  const categories = getCategories();
  const selectedCategory = categories.find(
    (item) => String(item.id) === String(category),
  );

  const resultCount = getProcessedProducts().length;

  if (keyword) {
    allItemsTitle.textContent = `Search results for "${keyword}"`;
  } else if (selectedCategory) {
    allItemsTitle.textContent = selectedCategory.name;
  } else if (priceRange !== "all") {
    allItemsTitle.textContent = "Filtered products";
  } else {
    allItemsTitle.textContent = "All items";
  }

  countText.textContent = `${resultCount} product(s) found`;
}

function syncFilterValues() {
  const { sort, priceRange } = getFilterState();

  const sortTop = document.getElementById("sortSelectTop");
  const priceTop = document.getElementById("priceRangeSelectTop");
  const sortBottom = document.getElementById("sortSelectBottom");
  const priceBottom = document.getElementById("priceRangeSelectBottom");

  if (sortTop) sortTop.value = sort;
  if (priceTop) priceTop.value = priceRange;
  if (sortBottom) sortBottom.value = sort;
  if (priceBottom) priceBottom.value = priceRange;
}

function setupFilterControls() {
  const sortTop = document.getElementById("sortSelectTop");
  const priceTop = document.getElementById("priceRangeSelectTop");
  const sortBottom = document.getElementById("sortSelectBottom");
  const priceBottom = document.getElementById("priceRangeSelectBottom");

  syncFilterValues();

  const updateUrlByFilters = (sortValue, priceValue) => {
    const url = new URL(window.location.href);
    url.searchParams.set("sort", sortValue);
    url.searchParams.set("price", priceValue);
    url.searchParams.set("page", "1");
    window.location.href = url.toString();
  };

  sortTop?.addEventListener("change", () => {
    updateUrlByFilters(sortTop.value, priceTop.value);
  });

  priceTop?.addEventListener("change", () => {
    updateUrlByFilters(sortTop.value, priceTop.value);
  });

  sortBottom?.addEventListener("change", () => {
    updateUrlByFilters(sortBottom.value, priceBottom.value);
  });

  priceBottom?.addEventListener("change", () => {
    updateUrlByFilters(sortBottom.value, priceBottom.value);
  });
}

// function setupAddToCart() {
//   document.addEventListener("click", (event) => {
//     const button = event.target.closest(".add-to-cart-btn");
//     if (!button) return;

//     const productId = Number(button.dataset.id);
//     const defaultVariant = getDefaultVariant();

//     addProductToCart(productId, 1, {
//       color: defaultVariant.color,
//       size: defaultVariant.size,
//     });

//     renderHeader();
//   });
// }

function initProductsPage() {
  initShopData();
  renderHeader();
  renderFooter();
  renderCategoryMenu();
  syncFilterVisibility();
  renderFeaturedProducts();
  renderAllProducts();
  renderPagination();
  updatePageTitleBySearch();
  syncFilterValues();
  setupFilterControls();
  setupAddToCart();
}

document.addEventListener("DOMContentLoaded", initProductsPage);
