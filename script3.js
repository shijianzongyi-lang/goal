'use strict';
const { createClient } = supabase
const client = createClient('https://ltwcysyrojosazncwkqf.supabase.co', 'sb_publishable_j5UkkULVm0FJQboPMoifaA_6Z9feuzz')

const domain = document.getElementById("jumi");
const tbody = document.getElementById("jumib");
const coin = document.getElementById("treasure");
const htmlWidth = document.querySelector('html');
const editname = document.getElementById("editname");
const changename = document.getElementById("changeName");

coin.setAttribute('width', htmlWidth.clientWidth);
coin.setAttribute('height', htmlWidth.clientWidth);

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

function getRandom(min, max) {
  return Math.floor(Math.random() * ((max + 1) - min) + min);
};
const names = ["ネコ", "イヌ", "ゾウ", "カバ", "ワニ", "ニワトリ", "インコ", "ライオン", "タカ", "カモメ", "トカゲ", "ゴリラ", "クマ", "コアラ", "ペンギン", "シロクマ", "ニンゲン", "ラッコ", "トラ", "サバ", "マグロ", "トビウオ"];
async function addScore() {
  const myname = names[getRandom(0, names.length)];
  const { data, error } = await client
    .from('scores')
    .insert([
      {
        name: myname,
        score: storage.getItem("best_score"),
      }
    ])
    .select()
  if (error) {
    console.log(error);
  } else {
    console.log(data[0].id);
    storage.my_score_id = JSON.stringify(data[0].id);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if(JSON.parse(storage.my_score_id) == "") { //初見さん
    addScore();
  }
  //自分の記録が更新していないか確認する関数
  mlScore();
});

async function loadScores() {
  await refleshScore();

  const { data, error } = await client
    .from('scores')
    .select('*')
    .order('score', { ascending: false });

  return data;
  //自分の名前をリンク（下線付き）からDialog?で編集できるようにする
}
async function makeScores(data) {
  tbody.innerHTML = "";
  document.getElementById("treasure").classList.add("hide");
  const list = data;
  let i = 1;
  let pastScore = list[0].score;
  list.forEach(item => {
    const tr = document.createElement('tr');
    if (pastScore > item.score) {
      i++;
      tr.innerHTML = makeChar(i, item);
    } else if (pastScore == item.score) {
      tr.innerHTML = makeChar(i, item);
    } else {
      console.log("エラー");
    }
    tbody.appendChild(tr);
    pastScore = item.score;
  });
  document.getElementById("yourname").addEventListener('click', () => {
    editname.showModal();
  })
}
function makeChar(index, list) {
  const data = list;
  let name;
  if (data.id == JSON.parse(storage.my_score_id)) {
    name = `<td class="mynametd" id="yourname">${data.name}(あなた)</td>`;
  } else {
    name = `<td>${data.name}</td>`;
  }
  return `<th>${index}位</th>
      ${name}<td>${data.score}</td>`;
}

async function mlScore() {
  makeScores(await loadScores());
}

//最高記録を更新させる
async function refleshScore() {
  const { data, error } = await client
  .from('scores')
  .update({ score: JSON.parse(storage.best_score) })
  .eq('id', JSON.parse(storage.my_score_id));
}

//名前を更新する
async function refleshName(udname) {
  if (udname == "") {
    alert("入力してよ～");
  } else if (udname.length > 10) {
    alert("10文字以内にしてー！");
  } else {
    const { data, error } = await client
      .from('scores')
      .update({ name: udname })
      .eq('id', JSON.parse(storage.my_score_id));
    if (error) {
      console.log(error);
    }
  }
  makeScores(await loadScores());
}
async function rfName(udname) {
  await refleshName(udname);
}

changename.addEventListener('click', () => {
  const updated = document.getElementById("nameInput");
  console.log(updated.value);
  rfName(updated.value);
})

document.getElementById("idReset").addEventListener("click", () => {
  console.log("押した");
  storage.setItem("my_score_id", JSON.stringify(""));
})
