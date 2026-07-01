'use strict';
const { createClient } = supabase
const client = createClient('https://ltwcysyrojosazncwkqf.supabase.co', 'sb_publishable_j5UkkULVm0FJQboPMoifaA_6Z9feuzz')

const storage = localStorage;
if (storage.getItem("best_score") == null) {
  storage.setItem("best_score", JSON.stringify(""));
};
if (storage.getItem("my_score_id") == null) {
  storage.setItem("my_score_id", JSON.stringify(""));
}

const menu = document.querySelector('.header_line');
menu.addEventListener("click", menuchange);
function menuchange() {
  document.querySelector('body').classList.toggle('active');
  document.querySelector('.open_menu').classList.toggle('active');
}

async function addScore() {
  const { data, error } = await client
    .from('scores')
    .insert([
      {
        name: "おれ",
        score: "1234",
      }
    ])
    .select()
  if (error) {
    console.log(error);
  } else {
    console.log(data[0].id);
  }
}
