// Mục đích:
// Chứa các hàm dùng chung toàn hệ thống:
// - đọc dữ liệu
// - format tiền
// - login check
// - cart functions
// - helper cho query params
// file name: common.js
import {
  STORAGE_KEYS,
  DEFAULT_COLOR_OPTIONS,
  DEFAULT_SIZE_OPTIONS,
} from "./keys.js";
import { getLocalData, setLocalData } from "./storage.js";
import { renderHeader } from "./common-ui.js";

export function getCategories() {
  return getLocalData(STORAGE_KEYS.CATEGORIES, []);
}

export function getProducts() {
  return getLocalData(STORAGE_KEYS.PRODUCTS, []);
}

export function getUsers() {
  return getLocalData(STORAGE_KEYS.USERS, []);
}

export function setUsers(users) {
  setLocalData(STORAGE_KEYS.USERS, users);
}

export function getCarts() {
  return getLocalData(STORAGE_KEYS.CARTS, []);
}

export function setCarts(carts) {
  setLocalData(STORAGE_KEYS.CARTS, carts);
}

export function getOrders() {
  return getLocalData(STORAGE_KEYS.ORDERS, []);
}

export function setOrders(orders) {
  setLocalData(STORAGE_KEYS.ORDERS, orders);
}

export function getCurrentUser() {
  return getLocalData(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user) {
  setLocalData(STORAGE_KEYS.CURRENT_USER, user);
}

export function getRedirectAfterLogin() {
  return getLocalData(STORAGE_KEYS.REDIRECT_AFTER_LOGIN, null);
}

export function clearRedirectAfterLogin() {
  localStorage.removeItem(STORAGE_KEYS.REDIRECT_AFTER_LOGIN);
}

export function formatPrice(price) {
  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice)) return "$0.00";
  return `$${numericPrice.toFixed(2)}`;
}

export function formatDateTime(dateValue) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getCategoryById(categoryId) {
  const id = Number(categoryId);
  return getCategories().find((category) => category.id === id) || null;
}

export function getProductById(productId) {
  const id = Number(productId);
  return getProducts().find((product) => product.id === id) || null;
}

export function getOrderById(orderId) {
  const id = Number(orderId);
  return getOrders().find((order) => Number(order.id) === id) || null;
}

export function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

export function setQueryParams(params = {}) {
  const url = new URL(window.location.href);

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });

  window.location.href = url.toString();
}

export function redirect(path) {
  if (!path) return;
  window.location.assign(path);
}

export function isLoggedIn() {
  return !!getCurrentUser();
}

export function requireLogin(
  message = "Please sign in first before adding products to cart.",
) {
  const currentUser = getCurrentUser();

  if (currentUser) {
    return true;
  }

  setLocalData(STORAGE_KEYS.REDIRECT_AFTER_LOGIN, window.location.href);
  alert(message);
  redirect("./login.html");
  return false;
}

export function getUserCart(userId) {
  const carts = getCarts();
  return carts.find((cart) => cart.userId === Number(userId)) || null;
}

export function getUserOrders(userId) {
  const orders = getOrders();
  return orders.filter((order) => order.userId === Number(userId));
}

// export function calculateCartTotal(cartItems = []) {
//   const products = getProducts();

//   return cartItems.reduce((total, item) => {
//     const product = products.find((p) => p.id === Number(item.productId));
//     if (!product) return total;

//     return total + Number(product.price) * Number(item.quantity || 0);
//   }, 0);
// }

export function getCartCount(userId) {
  const cart = getUserCart(userId);
  if (!cart || !Array.isArray(cart.items)) return 0;

  return cart.items.reduce((total, item) => {
    return total + Number(item.quantity || 0);
  }, 0);
}

export function getDefaultVariant() {
  return {
    color: DEFAULT_COLOR_OPTIONS[0],
    size: DEFAULT_SIZE_OPTIONS[2] || DEFAULT_SIZE_OPTIONS[0],
  };
}

export function normalizeCartItemVariant(options = {}) {
  const defaultVariant = getDefaultVariant();
  return {
    color: String(options.color || defaultVariant.color).trim(),
    size: String(options.size || defaultVariant.size).trim(),
  };
}

export function getProductColors(product) {
  if (Array.isArray(product?.colors) && product.colors.length > 0) {
    return product.colors;
  }
  return DEFAULT_COLOR_OPTIONS;
}

export function getProductSizes(product) {
  if (Array.isArray(product?.sizes) && product.sizes.length > 0) {
    return product.sizes;
  }
  return DEFAULT_SIZE_OPTIONS;
}

export function getDetailedCartItems(userId) {
  const cart = getUserCart(userId);
  if (!cart || !Array.isArray(cart.items)) return [];

  return cart.items
    .map((item) => {
      const product = getProductById(item.productId);
      if (!product) return null;

      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(product.price || 0);

      return {
        ...item,
        quantity,
        product,
        availableColors: getProductColors(product),
        availableSizes: getProductSizes(product),
        lineTotal: unitPrice * quantity,
      };
    })
    .filter(Boolean);
}

export function addProductToCart(productId, quantity = 1, options = {}) {
  if (!requireLogin()) return false;

  const currentUser = getCurrentUser();
  const carts = getCarts();
  const normalizedVariant = normalizeCartItemVariant(options);

  let cart = carts.find((item) => item.userId === Number(currentUser.id));

  if (!cart) {
    cart = {
      userId: Number(currentUser.id),
      items: [],
    };
    carts.push(cart);
  }

  const existingItem = cart.items.find(
    (item) =>
      Number(item.productId) === Number(productId) &&
      String(item.color || "") === normalizedVariant.color &&
      String(item.size || "") === normalizedVariant.size,
  );

  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({
      productId: Number(productId),
      quantity: Number(quantity),
      color: normalizedVariant.color,
      size: normalizedVariant.size,
    });
  }

  setCarts(carts);
  alert("Added to cart successfully.");
  return true;
}
export function setupAddToCart() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".add-to-cart-btn");
    if (!button) return;

    const productId = Number(button.dataset.id);
    const defaultVariant = getDefaultVariant();

    addProductToCart(productId, 1, {
      color: defaultVariant.color,
      size: defaultVariant.size,
    });

    renderHeader();
  });
}
export function updateCartItemQuantity(
  userId,
  productId,
  quantity,
  options = {},
) {
  const carts = getCarts();
  const normalizedVariant = normalizeCartItemVariant(options);
  const cart = carts.find((item) => item.userId === Number(userId));

  if (!cart || !Array.isArray(cart.items)) return false;

  const existingItem = cart.items.find(
    (item) =>
      Number(item.productId) === Number(productId) &&
      String(item.color || "") === normalizedVariant.color &&
      String(item.size || "") === normalizedVariant.size,
  );

  if (!existingItem) return false;

  const normalizedQuantity = Number(quantity || 0);

  if (normalizedQuantity <= 0) {
    cart.items = cart.items.filter(
      (item) =>
        !(
          Number(item.productId) === Number(productId) &&
          String(item.color || "") === normalizedVariant.color &&
          String(item.size || "") === normalizedVariant.size
        ),
    );
  } else {
    existingItem.quantity = normalizedQuantity;
  }

  setCarts(carts);
  return true;
}

export function removeCartItem(userId, productId, options = {}) {
  const carts = getCarts();
  const normalizedVariant = normalizeCartItemVariant(options);
  const cart = carts.find((item) => item.userId === Number(userId));

  if (!cart || !Array.isArray(cart.items)) return false;

  cart.items = cart.items.filter(
    (item) =>
      !(
        Number(item.productId) === Number(productId) &&
        String(item.color || "") === normalizedVariant.color &&
        String(item.size || "") === normalizedVariant.size
      ),
  );

  setCarts(carts);
  return true;
}

export function changeCartItemVariant(
  userId,
  productId,
  oldOptions = {},
  newOptions = {},
) {
  const carts = getCarts();
  const cart = carts.find((item) => item.userId === Number(userId));

  if (!cart || !Array.isArray(cart.items)) return false;

  const oldVariant = normalizeCartItemVariant(oldOptions);
  const newVariant = normalizeCartItemVariant(newOptions);

  const sourceItem = cart.items.find(
    (item) =>
      Number(item.productId) === Number(productId) &&
      String(item.color || "") === oldVariant.color &&
      String(item.size || "") === oldVariant.size,
  );

  if (!sourceItem) return false;

  const duplicateItem = cart.items.find(
    (item) =>
      item !== sourceItem &&
      Number(item.productId) === Number(productId) &&
      String(item.color || "") === newVariant.color &&
      String(item.size || "") === newVariant.size,
  );

  if (duplicateItem) {
    duplicateItem.quantity += Number(sourceItem.quantity || 0);
    cart.items = cart.items.filter((item) => item !== sourceItem);
  } else {
    sourceItem.color = newVariant.color;
    sourceItem.size = newVariant.size;
  }

  setCarts(carts);
  return true;
}

export function createOrder({ userId, shippingInfo, items }) {
  const orders = getOrders();
  const carts = getCarts();

  const normalizedItems = (items || []).map((item) => ({
    productId: Number(item.product.id),
    name: item.product.name,
    image: item.product.image,
    price: Number(item.product.price),
    quantity: Number(item.quantity),
    color: item.color,
    size: item.size,
    lineTotal: Number(item.lineTotal),
  }));

  const total = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const order = {
    id: Date.now(),
    code: `ORD-${Date.now()}`,
    userId: Number(userId),
    status: "Pending",
    createdAt: new Date().toISOString(),
    shippingInfo,
    items: normalizedItems,
    total,
  };

  orders.unshift(order);
  setOrders(orders);

  const cart = carts.find((item) => item.userId === Number(userId));
  if (cart) {
    cart.items = [];
    setCarts(carts);
  }

  return order;
}

export function findUserByEmail(email) {
  return getUsers().find(
    (user) => user.email.trim().toLowerCase() === email.trim().toLowerCase(),
  );
}

export function createUser({ fullName, email, password }) {
  const users = getUsers();

  const newUser = {
    id: Date.now(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: "customer",
    status: "active",
  };

  users.push(newUser);
  setUsers(users);
  return newUser;
}
