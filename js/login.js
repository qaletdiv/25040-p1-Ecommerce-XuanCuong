// Mục đích:
// Xử lý đăng nhập:
// - kiểm tra email/password
// - lưu currentUser
// - quay lại trang trước khi login hoặc về trang chủ
// file name: login.js

import { initShopData } from "./storage.js";
import { renderHeader, renderFooter } from "./common-ui.js";
import {
  findUserByEmail,
  setCurrentUser,
  getRedirectAfterLogin,
  clearRedirectAfterLogin,
  redirect,
} from "./common.js";

function showMessage(message, type = "error") {
  const messageBox = document.getElementById("authMessage");
  if (!messageBox) return;

  messageBox.className = `message ${type}`;
  messageBox.textContent = message;
}

function setupLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showMessage("Please enter email and password.", "error");
      return;
    }

    const foundUser = findUserByEmail(email);

    if (!foundUser || foundUser.password !== password) {
      showMessage("Email or password is incorrect.", "error");
      return;
    }

    if (foundUser.status !== "active") {
      showMessage("This account is not active.", "error");
      return;
    }

    setCurrentUser(foundUser);
    showMessage("Sign in successful.", "success");

    const redirectUrl = getRedirectAfterLogin();
    clearRedirectAfterLogin();

    setTimeout(() => {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        redirect("./index.html");
      }
    }, 800);
  });
}

function initLoginPage() {
  initShopData();
  renderHeader();
  renderFooter();
  setupLoginForm();
}

document.addEventListener("DOMContentLoaded", initLoginPage);
