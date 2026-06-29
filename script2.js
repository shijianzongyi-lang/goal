'use strict';

const storage = localStorage;
if (storage.getItem("best_score") == null) {
  storage.setItem("best_score", JSON.stringify(""));
};

const menu = document.querySelector('.header_line');
menu.addEventListener("click", menuchange);
function menuchange() {
  document.querySelector('body').classList.toggle('active');
  document.querySelector('.open_menu').classList.toggle('active');
}