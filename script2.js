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

const htmlWidth = document.querySelector('html');
const photoSize = htmlWidth.clientWidth * 0.8;
for (let i = 1; i <= 4; i++) {
  document.getElementById(`exp${i}`).setAttribute('width', photoSize);
  document.getElementById(`exp${i}`).setAttribute('height', photoSize);
}

for (let i = 1; i <= 4; i++) {
  document.getElementById(`cellexp${i}`).setAttribute('width', photoSize / 4);
  document.getElementById(`cellexp${i}`).setAttribute('height', photoSize / 4);
}
