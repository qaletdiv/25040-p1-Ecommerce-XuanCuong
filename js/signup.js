// Mục đích:
// Xử lý đăng ký tài khoản:
// - validate dữ liệu
// - kiểm tra email trùng
// - tạo user mới
// - chuyển sang trang login sau khi đăng ký thành công
// file name : signup.js

import { initShopData } from "./storage.js";
import { renderHeader, renderFooter } from "./common-ui.js";
import { findUserByEmail, createUser, redirect } from "./common.js";

function showMessage(message, type = "error") {
  const messageBox = document.getElementById("authMessage");
  if (!messageBox) return;

  messageBox.className = `message ${type}`;
  messageBox.textContent = message;
}

function validateSignupForm({ fullName, email, password, confirmPassword }) {
  if (!fullName.trim()) {
    return "Full name is required.";
  }

  if (!email.trim()) {
    return "Email is required.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Email format is invalid.";
  }

  if (!password) {
    return "Password is required.";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  if (password !== confirmPassword) {
    return "Confirm password does not match.";
  }

  if (findUserByEmail(email)) {
    return "Email already exists.";
  }

  return "";
}

function setupSignupForm() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const error = validateSignupForm({
      fullName,
      email,
      password,
      confirmPassword,
    });

    if (error) {
      showMessage(error, "error");
      return;
    }

    createUser({ fullName, email, password });
    showMessage(
      "Sign up successful. Redirecting to sign in page...",
      "success",
    );

    setTimeout(() => {
      redirect("./login.html");
    }, 1200);
  });
}

function initSignupPage() {
  initShopData();
  renderHeader();
  renderFooter();
  setupSignupForm();
}

document.addEventListener("DOMContentLoaded", initSignupPage);
