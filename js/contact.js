import { initShopData } from "./storage.js";
import { renderHeader, renderFooter } from "./common-ui.js";

function showMessage(message, type = "error") {
  const box = document.getElementById("contactMessage");
  if (!box) return;

  box.className = `message-box ${type}`;
  box.textContent = message;
}

function validateContactForm({ fullName, email, subject, message }) {
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

  if (!subject.trim()) {
    return "Subject is required.";
  }

  if (!message.trim()) {
    return "Message is required.";
  }

  if (message.trim().length < 10) {
    return "Message must be at least 10 characters.";
  }

  return "";
}

function getContactMessages() {
  return JSON.parse(localStorage.getItem("contactMessages") || "[]");
}

function setContactMessages(messages) {
  localStorage.setItem("contactMessages", JSON.stringify(messages));
}

function setupContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value;

    const error = validateContactForm({
      fullName,
      email,
      subject,
      message,
    });

    if (error) {
      showMessage(error, "error");
      return;
    }

    const messages = getContactMessages();

    messages.unshift({
      id: Date.now(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    });

    setContactMessages(messages);

    showMessage("Your message has been sent successfully.", "success");
    form.reset();
  });
}

function initContactPage() {
  initShopData();
  renderHeader();
  renderFooter();
  setupContactForm();
}

document.addEventListener("DOMContentLoaded", initContactPage);
