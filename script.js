'use strict';
//何見てるんですか.粗探さないでください.

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

function getRandom(min, max) {
  return Math.floor(Math.random() * ((max + 1) - min) + min);
};

const htmlWidth = document.querySelector('html');
const fields = document.getElementById("field");//canvasを取得
const fieldsLength = htmlWidth.clientWidth - 10;//(-px)は調整用
fields.setAttribute('width', fieldsLength);
fields.setAttribute('height', fieldsLength);
const cellSize = fieldsLength / 4;
const ctx = fields.getContext('2d');//ctxでcanvasに描写

//スクロール固定
const body1 = document.getElementById("body1");
const outerHeight = window.innerHeight;
const bodyHeight = document.querySelector('body').clientHeight;
if ((outerHeight - bodyHeight) >= 0) {
  body1.classList.add("body1");
}


const userConsole = document.getElementById("alert");
//ルール
let stepCount = 0;//通ったマスの数
let bonusNum = 0;//拾った宝の数
const oneStep = 1;//ノーマルセル１マス通ったときのインクリメント
const bonus = 3;//宝拾ったときのデクリメント
let zuruResetCount = 0;
let bestjudge = false;

//フィールドをランダムに生成
let fieldInfo = new Array(16).fill(0);
let c1, c2, h1, h2, w1, w2;
let i = 0;

function makeFieldInfo() {
    //コインの場所
  c1 = getRandom(0, 7);
  for (c2 = 12; c2 == 12; i++) {
    c2 = getRandom(8, 15);
  };
  fieldInfo[c1] = 2;
  fieldInfo[c2] = 2;
    //落とし穴の場所
  for (h1 = 3; [3, 12, c1, c2].includes(h1); i++) {
    h1 = getRandom(0, 15);
  }
  for (h2 = 3; [3, 12, h1, c1, c2].includes(h2) || [[2, 7], [8, 13]].some(pair => pair.every(v => [h1, h2].includes(v))); i++) {
    h2 = getRandom(0, 15);
  }
  fieldInfo[h1] = -2;
  fieldInfo[h2] = -2;
    //ワープホール(Input)の場所
  for (w1 = 3; [3, 12, h1, h2, c1, c2].includes(w1) || [[2, 7], [8, 13]].some(pair => pair.every(v => [h1, w1].includes(v))) || [[2, 7], [8, 13]].some(pair => pair.every(v => [h2, w1].includes(v))); i++) {
    w1 = getRandom(0, 15);
  }
  //ワープホール(output)の場所
  for (w2 = 3; [3, 12, h1, h2, c1, c2, w1].includes(w2); i++) {
    w2 = getRandom(0, 15);
  }
  fieldInfo[w1] = -1;
  fieldInfo[w2] = 1;
  console.log(fieldInfo);
}
makeFieldInfo();

const imagep = new Image();
imagep.src = 'plain.png';
const imagec = new Image();
imagec.src = 'coin.png';
const imageh = new Image();
imageh.src = 'hole.png';
const imagei = new Image();
imagei.src = 'input.png';
const imageo = new Image();
imageo.src = 'output.png';
const imagem = new Image();
imagem.src = JSON.parse(storage.getItem("walker"));
const imagef = new Image();
imagef.src = 'fall.png';
const imageg = new Image();
imageg.src = 'goal.png';
const images = new Image();
images.src = 'start.png';
const imager = new Image();
imager.src = 'result.png';
const imageb = new Image();
imageb.src = 'best.png';

let passedPath = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0];//通った道
let attributes = [[imagep, imagec, imageh, imagei, imageo], [0, 2, -2, -1, 1]];
let moveNum = [0, 0];
let tmpMoveNum = 0;

function makeFieldImage(index) {//表示する画像のインデックス
  for (let i = 0; i < 16; i++) {
    if (fieldInfo[i] === attributes[1][index]) {
      const gyo = Math.floor(i / 4);
      const retu = i % 4;
      const x0 = cellSize * retu;
      const y0 = cellSize * gyo;
      ctx.drawImage(attributes[0][index], x0, y0, cellSize, cellSize);
    };
  };
};
function makeFieldImages() {//盤面上の全ての画像をリセット
  ctx.clearRect(0, 0, fieldsLength, fieldsLength);
  for (let k = 0; k < attributes[0].length; k++) {
    makeFieldImage(k);
  };
};


const maxTime = 50;
let count = 0;
let timerId;
let date1, date2;
function refleshTime() {
  count += 1;
  userConsole.textContent = `${count}秒経過`;
  if (count >= maxTime) {
    clearInterval(timerId);
    fields.removeEventListener('click', canvasClick);
    ctx.drawImage(images, 0, 0, fieldsLength, fieldsLength);
    const textWidth = ctx.measureText('TIME UP!!').width;
    ctx.font = "40px Potta One";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = '#474747';
    ctx.fillText('TIME UP!!', cellSize * 2, cellSize * 2);
    setTimeout(() => {
      fieldInfo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      makeFieldInfo();
      pertsReset();
    }, 5000);
  }
}
function getStart() {
  ctx.clearRect(0, 0, fieldsLength, fieldsLength);
  pertsReset();
  fields.removeEventListener('click', getStart);
  resetImage.disabled = false;
  allReset.disabled = false;
  //imagem.addEventListener('load', () => {
    //ctx.drawImage(imagem, 0, cellSize * 3, cellSize, cellSize);
    //fields.addEventListener('click', canvasClick);
  //});
  if (imagem.complete) {
    ctx.drawImage(imagem, 0, cellSize * 3, cellSize, cellSize);
    fields.addEventListener('click', canvasClick);
  } else {
    imagem.addEventListener('load', () => {
      ctx.drawImage(imagem, 0, cellSize * 3, cellSize, cellSize);
      fields.addEventListener('click', canvasClick);
    });
  }
}

const result = document.getElementById("explain");
const initialCell = 12;//スタートのセル番号
let tmpCellNum = initialCell;
images.addEventListener('load', () => {
  ctx.drawImage(images, 0, 0, fieldsLength, fieldsLength);
  const textWidth = ctx.measureText('タップして開始').width;
  ctx.font = "40px Potta One";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = '#474747';
  ctx.fillText('タップして開始', cellSize * 2, cellSize * 2);
  fields.addEventListener('click', getStart);
})

  //canvas押したときの動作
function canvasClick(e) {
  // Canvas要素の境界線情報を取得
  const rect = fields.getBoundingClientRect();

  // 画面上のマウス座標からCanvas内の相対座標を計算
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const xcell = Math.floor(x / cellSize);
  const ycell = Math.floor(y / cellSize);
  let cellNum = 4 * ycell + xcell;
  const xpix = xcell * cellSize;
  const ypix = ycell * cellSize;
  //result.textContent = `クリック座標: X=${xpix}, Y=${ypix}, Number: ${cellNum}`;

  judge(cellNum);
  //console.log(`tmpCellNum = ${tmpCellNum}`);
};

function moveImage(cellNum) {
  let tmpgyo = Math.floor(tmpCellNum / 4);
  let tmpretu = tmpCellNum % 4;
  ctx.clearRect(cellSize * tmpretu, cellSize * tmpgyo, cellSize, cellSize);
  //画像作る
  for (let k = 0; k < attributes[0].length; k++) {
    if (fieldInfo[tmpCellNum] === attributes[1][k]) {
      ctx.drawImage(attributes[0][k], cellSize * tmpretu, cellSize * tmpgyo, cellSize, cellSize);
    };
    let gyo = Math.floor(cellNum / 4);
    let retu = cellNum % 4;
    ctx.drawImage(imagem, cellSize * retu, cellSize * gyo, cellSize, cellSize);
  }
  tmpCellNum = cellNum;
}



const resetImage = document.getElementById("reset");
const allReset = document.getElementById("allReset");
function pertsReset() {
  tmpCellNum = initialCell;
  passedPath = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0];
  stepCount = 0;//通ったマスの数
  bonusNum = 0;//拾った宝の数
  moveNum = [0, 0];
  makeFieldImages();
  ctx.drawImage(imagem, 0, cellSize * 3, cellSize, cellSize);
  fields.removeEventListener('click', showDialog);
  fields.addEventListener('click', canvasClick);
  userConsole.textContent = "";
  date1 = new Date();
  count = 0;
  clearInterval(timerId);
  timerId = setInterval(refleshTime, 1000);
  bestjudge = false;
}
let risemara1;
let risemara2;
//盤面以外をリセットする！！！！！！！
resetImage.disabled = true;
resetImage.addEventListener('click', () => {
  pertsReset();
  zuruResetCount += 1;
  resetImage.disabled = true;
  allReset.disabled = true;
  risemara1 = setInterval(() => {
    resetImage.disabled = false;
    allReset.disabled = false;
  }, 3000);
});
//盤面全てをリセットする！！！！！！！！！
allReset.disabled = true;
allReset.addEventListener('click', () => {
  fieldInfo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  makeFieldInfo();
  pertsReset();
  zuruResetCount = 0;
  resetImage.disabled = true;
  allReset.disabled = true;
  risemara2 = setInterval(() => {
    resetImage.disabled = false;
    allReset.disabled = false;
  }, 3000);
})



//処理(fieldInfo[cellNum]の値(移動した先のNum)を入れる)
function processing(value, myTmpCellNum) {
  if (value == 0) {
    passedPath[myTmpCellNum] += oneStep;
  } else if (value == 2) {
    passedPath[myTmpCellNum] += oneStep;
    bonusNum += 1;
  } else if (value == -1) {
    passedPath[myTmpCellNum] += oneStep;
  } else if (value == 1) {
    passedPath[myTmpCellNum] += oneStep;
  };
};
//判定(fieldInfo[cellNum]の値(移動した先のNum)を入れる)
function judge(value) {
  const tmpgyo = Math.floor(tmpCellNum / 4);
  const tmpretu = tmpCellNum % 4;
  const gyo = Math.floor(value / 4);
  const retu = value % 4;
  let myTmpCellNum = tmpCellNum;
  if (tmpgyo != gyo && tmpretu == retu) {
    //縦移動の処理
    const idou = gyo - tmpgyo;
    for (let k = Math.sign(idou); Math.abs(k) <= Math.abs(idou); k += Math.sign(idou)) {
      tmpMoveNum += 1;
      console.log(`tmpMoveNum = ${tmpMoveNum}`);
      myTmpCellNum += Math.sign(k) * 4;
      const tmp = fieldInfo[myTmpCellNum];
      moveImage(myTmpCellNum);
      if (tmp == -2) {
        ctx.drawImage(imagef, 0, 0, fieldsLength, fieldsLength);
        clearInterval(timerId);
        userConsole.textContent = "穴に落ちた💦ボタンを押してリスタートしよう！";
        fields.removeEventListener("click", canvasClick);
        break;
      };
      if (tmp == -1) {
        passedPath[myTmpCellNum] += oneStep;
        //1のとこに強制移動
        for (let k = 0; k < fieldInfo.length; k++) {
          if (fieldInfo[k] == 1) {
            moveImage(k);
          }
        }
        processing(tmp, myTmpCellNum);
        break;
      }
      processing(tmp, myTmpCellNum);
      console.log(`k = ${k}、tmp = ${myTmpCellNum}で${fieldInfo[myTmpCellNum]}`);
      countfunc();
      if (myTmpCellNum == 3) {
        goalProcess();
      }
    };
    if (tmpMoveNum == 2) {
      moveNum[0] += 1;
    } else if (tmpMoveNum == 3) {
      moveNum[1] += 1;
    };
    tmpMoveNum = 0;
  } else if (tmpgyo == gyo && tmpretu != retu) {
    //横移動の処理
    const idou = retu - tmpretu;
    for (let k = Math.sign(idou); Math.abs(k) <= Math.abs(idou); k += Math.sign(idou)) {
      tmpMoveNum += 1;
      myTmpCellNum += Math.sign(k);
      const tmp = fieldInfo[myTmpCellNum];
      moveImage(myTmpCellNum);
      if (tmp == -2) {
        ctx.drawImage(imagef, 0, 0, fieldsLength, fieldsLength);
        clearInterval(timerId);
        userConsole.textContent = "穴に落ちた💦ボタンを押してリスタートしよう！";
        fields.removeEventListener("click", canvasClick);
        break;
      };
      if (tmp == -1) {
        passedPath[myTmpCellNum] += oneStep;
        //1のとこに強制移動
        for (let k = 0; k < fieldInfo.length; k++) {
          if (fieldInfo[k] == 1) {
            moveImage(k);
          }
        }
        processing(tmp, myTmpCellNum);
        break;
      }
      processing(tmp, myTmpCellNum);
      //console.log(`l = ${k}、tmp = ${myTmpCellNum}で${fieldInfo[myTmpCellNum]}`);
      countfunc();
      if (myTmpCellNum == 3) {
        goalProcess();
      }
    };
    if (tmpMoveNum == 2) {
      moveNum[0] += 1;
    } else if (tmpMoveNum == 3) {
      moveNum[1] += 1;
    };
    tmpMoveNum = 0;
  } else if (tmpgyo != gyo && tmpretu != retu) {
    //斜めのマスをクリックしたとき
    userConsole.textContent = "斜めには動けないよぉ～😢";
  } else if (tmpgyo == gyo && tmpretu == retu) {
    //同じマスをクリックしたとき
    userConsole.textContent = "足踏みしてたら景色は変わらないZe✨"
  }
}

function countfunc() {
  stepCount = 0;
  for (let k = 0; k < passedPath.length; k++) {
    stepCount += passedPath[k];
  }
  console.log(`${stepCount}歩で宝${bonusNum}個です`);
}

const resultDialog = document.getElementById("dialog");
function goalProcess() {
  resetImage.disabled = true;
  allReset.disabled = true;
  clearInterval(risemara1);
  clearInterval(risemara2);
  if (tmpMoveNum == 2) {
    moveNum[0] += 1;
  } else if (tmpMoveNum == 3) {
    moveNum[1] += 1;
  };
  tmpMoveNum = 0;
  ctx.drawImage(imageg, 0, 0, fieldsLength, fieldsLength);
  fields.removeEventListener("click", canvasClick);
  fields.addEventListener('click', showDialog);
  date2 = new Date();
  let date3 = date2.getTime() - date1.getTime();
  let sec = date3 / 1000 % 60;
  clearInterval(timerId);
  const score = Math.floor(((2500 / sec) + ((1 + bonusNum * 400) + (1 + moveNum[0] * 400 + moveNum[1] * 600)) / (stepCount * 100)) * (1 - (2 * Math.atan(zuruResetCount)) / Math.PI));
  let diff = score - JSON.parse(storage.getItem("best_score"));
  if (JSON.parse(storage.getItem("best_score")) < score) {
    storage.best_score = JSON.stringify(score);
    bestjudge = true;
  };
  setTimeout(() => {
    ctx.drawImage(imager, 0, 0, fieldsLength, fieldsLength);
    ctx.font = "40px Potta One";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = '#474747';
    ctx.fillText('SCORE...', cellSize * 2, cellSize * 1.5);
    ctx.font = "20px Potta One";
    ctx.fillText('タップして結果の詳細を表示', cellSize * 2, cellSize * 3.5);
    ctx.font = "90px Potta One";
    ctx.fillText(score, cellSize * 2, cellSize * 2.3);
    if (bestjudge == true) {
      ctx.drawImage(imageb, cellSize * 3, cellSize, cellSize, cellSize);
    }
    resetImage.disabled = false;
    allReset.disabled = false;
  }, 1500);
  //ダイアログを設定
  resultDialog.innerHTML = `<form method="dialog">
      <p class="diatitle">結果詳細</p>
      <p class="diap">通ったマス：　　　${stepCount}マス</p>
      <p class="diap">拾った宝：　　　　${bonusNum}個</p>
      <p class="diap">経過時間：　　　　${sec}秒</p>
      <p class="diap">２マスジャンプ：　${moveNum[0]}回</p>
      <p class="diap">３マスジャンプ：　${moveNum[1]}回</p>
      <p class="diap">このマップのトライ回数：${zuruResetCount + 1}回目</p>
      <p class="diap">自己ベストとの差：　${diff}</p>
      <p class="diascore">${score}点</p>
      <p class="closeppp"><button class="closepop potta-one-regular">とじる</button></p>
    </form>`;
  
  //userConsole.textContent = `RESULT : ${stepCount}歩、宝${bonusNum}個、${sec}秒、2マス移動${moveNum[0]}回、3マス移動${moveNum[1]}、${zuruResetCount}回リセット、${score}点`;
  const tips = ["理論上点数は無限に増やせます。方法は🤫", 
    "盤面を固定してリスタートを繰り返すと点数が大幅に圧縮されます", 
    "宝１個と２マスジャンプ１回は点数的に等価です", 
    "３マスジャンプは２マスジャンプの1.5倍の価値があります", 
    "ゲームは何度でもやり直せます。", 
    "５秒以内にゴールするのが重要です", 
    "宝の上を反復横跳びしても点数は上がりません", 
    "少ない歩数で全ての宝を攫っていくのがプロ。", 
    "プログラミングたっのしぃ～", 
    "たぶんまだバグある", 
    `盤面の情報は長さ16のリストです。今回は[${fieldInfo}]でした`, 
    "たまにゴールできない盤面になることがあります", 
    "一瞬の迷いが命取り", 
    "落とし穴の先はThe Backrooms", 
    "最近地震が多くて嫌な感じですね", 
    "割と速さが必要かも？"];
  if (diff > 0) {
    userConsole.textContent = `自己ベストを＋${diff}点更新！`;
  } else if (-200 < diff && diff <= 0) {
    userConsole.textContent = `自己ベスト更新まであと${-diff}点、、、！`;
  } else {
    userConsole.textContent = tips[getRandom(0, (tips.length - 1))];
  }
};

function showDialog() {
  resultDialog.showModal();
}

//リセマラの回数制限
