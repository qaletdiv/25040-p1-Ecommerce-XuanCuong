import { initShopData } from "./storage.js";
import { renderHeader, renderFooter } from "./common-ui.js";

function initPoliciesPage() {
  initShopData();
  renderHeader();
  renderFooter();
}

document.addEventListener("DOMContentLoaded", initPoliciesPage);
