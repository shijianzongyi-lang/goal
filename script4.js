'use strict';

const storage = localStorage;
if (storage.getItem("best_score") == null) {
  storage.setItem("best_score", JSON.stringify(""));
};
if (storage.getItem("walker") == null) {
  storage.setItem("walker", JSON.stringify("human.png"));
}

const menu = document.querySelector('.header_line');
menu.addEventListener("click", menuchange);
function menuchange() {
  document.querySelector('body').classList.toggle('active');
  document.querySelector('.open_menu').classList.toggle('active');
}

const htmlWidth = document.querySelector('html');
const photoSize = htmlWidth.clientWidth * 0.8;
const walkerName = document.getElementById("walkerName");
const changeField = document.getElementById("changeanimal");
const showpc = document.getElementById("showpc");
const btnWidth = htmlWidth.clientWidth * 0.2;
const btnHeight = htmlWidth.clientWidth * 0.6;
const btnRight = document.getElementById("btnRight");
const btnLeft = document.getElementById("btnLeft");
const centerDiv = document.getElementById("showing");

btnLeft.style.width = `${btnWidth}px`;
btnLeft.style.height = `${btnHeight}px`;
btnRight.style.width = `${btnWidth}px`;
btnRight.style.height = `${btnHeight}px`;
centerDiv.style.height = `${btnHeight}px`;
centerDiv.style.width = `${btnHeight}px`;
showpc.height = btnHeight;
showpc.width = btnHeight;

const names = ["非常口", "カオアリ", "パックマン", "U-tan", "くぅ", "ぽぅぽ", "ワンカス", "ヤンヤン", "中身", "豊城"];
const walkerList = ["human.png", "animal1.png", "animal2.png", "animal3.png", "animal4.png", "animal5.png", "animal6.png", "animal7.png", "animal8.png", "animal9.png"];
let tmpIndex;
for (let i = 0; i < walkerList.length; i++) {
  if(walkerList[i] == JSON.parse(storage.getItem("walker"))) {
    tmpIndex = i;
  }
}
walkerName.textContent = names[tmpIndex];
showpc.src = walkerList[tmpIndex];

btnRight.addEventListener("click", () => {
  if (tmpIndex == walkerList.length -1) {
    tmpIndex = 0;
  } else {
    tmpIndex++;
  }
  walkerName.textContent = names[tmpIndex];
  showpc.src = walkerList[tmpIndex];
  storage.setItem("walker", JSON.stringify(walkerList[tmpIndex]));
})
btnLeft.addEventListener("click", () => {
  if (tmpIndex == 0) {
    tmpIndex = walkerList.length - 1;
  } else {
    tmpIndex--;
  }
  walkerName.textContent = names[tmpIndex];
  showpc.src = walkerList[tmpIndex];
  storage.setItem("walker", JSON.stringify(walkerList[tmpIndex]));
})
