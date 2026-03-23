// Mục đích:
// Chứa các hàm dùng chung toàn hệ thống:
// - đọc dữ liệu
// - format tiền
// - login check
// - cart functions
// - helper cho query params
// file name: common.js
import { STORAGE_KEYS } from "./keys.js";
import { getLocalData, setLocalData } from "./storage.js";

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

export function getCategoryById(categoryId) {
  const id = Number(categoryId);
  return getCategories().find((category) => category.id === id) || null;
}

export function getProductById(productId) {
  const id = Number(productId);
  return getProducts().find((product) => product.id === id) || null;
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

export function requireLogin() {
  const currentUser = getCurrentUser();

  if (currentUser) {
    return true;
  }

  setLocalData(STORAGE_KEYS.REDIRECT_AFTER_LOGIN, window.location.href);
  alert("Please sign in first before adding products to cart.");
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

export function calculateCartTotal(cartItems = []) {
  const products = getProducts();

  return cartItems.reduce((total, item) => {
    const product = products.find((p) => p.id === Number(item.productId));
    if (!product) return total;

    return total + product.price * Number(item.quantity || 0);
  }, 0);
}

export function getCartCount(userId) {
  const cart = getUserCart(userId);
  if (!cart || !Array.isArray(cart.items)) return 0;

  return cart.items.reduce((total, item) => {
    return total + Number(item.quantity || 0);
  }, 0);
}

export function addProductToCart(productId, quantity = 1) {
  // Mục đích:
  // Thêm sản phẩm vào giỏ của user hiện tại.
  // Nếu chưa đăng nhập -> chặn và chuyển sang trang login.
  if (!requireLogin()) return false;

  const currentUser = getCurrentUser();
  const carts = getCarts();

  let cart = carts.find((item) => item.userId === Number(currentUser.id));

  if (!cart) {
    cart = {
      userId: Number(currentUser.id),
      items: [],
    };
    carts.push(cart);
  }

  const existingItem = cart.items.find(
    (item) => Number(item.productId) === Number(productId),
  );

  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({
      productId: Number(productId),
      quantity: Number(quantity),
    });
  }

  setCarts(carts);
  alert("Added to cart successfully.");
  return true;
}

export function findUserByEmail(email) {
  return getUsers().find(
    (user) => user.email.trim().toLowerCase() === email.trim().toLowerCase(),
  );
}

export function createUser({ fullName, email, password }) {
  // Mục đích:
  // Tạo tài khoản mới và lưu vào localStorage
  const users = getUsers();

  const newUser = {
    id: Date.now(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    password: password,
    role: "customer",
    status: "active",
  };

  users.push(newUser);
  setUsers(users);
  return newUser;
}