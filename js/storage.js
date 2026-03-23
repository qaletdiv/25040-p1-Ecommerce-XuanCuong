// Mục đích:
// Đọc/ghi/xóa localStorage và nạp dữ liệu gốc từ mock-data.js khi chạy lần đầu.

import { STORAGE_KEYS } from "./keys.js";
import { categories, products, users, carts, orders } from "./mock-data.js";

export function setLocalData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Không thể lưu dữ liệu cho key "${key}":`, error);
  }
}

export function getLocalData(key, defaultValue = null) {
  try {
    const rawData = localStorage.getItem(key);
    return rawData !== null ? JSON.parse(rawData) : defaultValue;
  } catch (error) {
    console.error(`Không thể đọc dữ liệu cho key "${key}":`, error);
    return defaultValue;
  }
}

export function removeLocalData(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Không thể xóa dữ liệu cho key "${key}":`, error);
  }
}

export function clearShopStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeLocalData(key);
  });
}

export function initShopData() {
  // Dùng clone để tránh bị tham chiếu cùng object gốc
  const defaultData = {
    [STORAGE_KEYS.CATEGORIES]: structuredClone(categories),
    [STORAGE_KEYS.PRODUCTS]: structuredClone(products),
    [STORAGE_KEYS.USERS]: structuredClone(users),
    [STORAGE_KEYS.CARTS]: structuredClone(carts),
    [STORAGE_KEYS.ORDERS]: structuredClone(orders),
    [STORAGE_KEYS.CURRENT_USER]: null,
    [STORAGE_KEYS.REDIRECT_AFTER_LOGIN]: null,
  };

  for (const [key, value] of Object.entries(defaultData)) {
    if (localStorage.getItem(key) === null) {
      setLocalData(key, value);
    }
  }
}
