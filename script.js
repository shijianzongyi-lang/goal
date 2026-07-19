'use strict';
const dimention = document.getElementById("dimention");
const storage = localStorage;
if (storage.getItem("best_score") == null) {
  storage.setItem("best_score", JSON.stringify(""));
};
if (storage.getItem("walker") == null) {
  storage.setItem("walker", JSON.stringify("human.png"));
}
if (storage.getItem("dimention") == null) {
  storage.setItem("dimention", JSON.stringify(4));
} else {
  dimention.textContent = JSON.parse(storage.getItem("dimention"));
}
let cols = JSON.parse(storage.getItem("dimention"));
let rows = JSON.parse(storage.getItem("dimention"));
let cell_count = cols * rows;
const returnArr = [];
let path_length;
const calcbtn = document.getElementById("calc");
const decdim = document.getElementById("decDim");
const incdim = document.getElementById("incDim");

calcbtn.disabled = true;
calcbtn.classList.add("hide");

let timerAI, AI_now_index;
let returnForJS = [];
function main() {
  //fieldInfo(js)→fieldInfoNew(C++)
  let fieldInfoNew = new Array(cell_count).fill(0);
  let CtoJS = new Array(cell_count).fill(0);
  let i = 0;
  for (let k = rows - 1; k >= 0; k--) {
    for(let j = 0; j < cols; j++) {
      fieldInfoNew[cols*k + j] = fieldInfo[i];
      CtoJS[i] = cols * k + j;
      i++;
    }
  }

  const size = cell_count;// C++側のメモリ空間を確保
  const buffer = Module._malloc(size * 4);

  // JavaScript側でTypedArrayのビューを作成
  const heap = new Int32Array(Module.HEAP32.buffer, buffer, size);
  heap.set(fieldInfoNew);

  path_length = Module._func(buffer, cols, rows);// C++の関数を呼び出し、ポインタ（buffer）を渡す

  for (let i = 0; i < cell_count; i++) {
    returnArr[i] = heap[i];
  }
  // C++で更新された結果をJS側で読み込む
  //console.log(returnArr);

  // メモリを解放
  Module._free(buffer);

  returnForJS = new Array(path_length).fill(0);
  for (let i = 0; i < path_length; i++) {
    returnForJS[i] = CtoJS[returnArr[i]];
  }
  console.log(`path_length = ${path_length}`);
  console.log(returnForJS);
  //描写する
  calcbtn.disabled = true;
  calcbtn.classList.add("hide");
  AI_now_index = 0;
  pertsReset();
  fields.removeEventListener('click', canvasClick);
  clearInterval(timerId);
  timerAI = setInterval(AIchangeImage, 8000 / cell_count);
}

function AIchangeImage() {
  if (returnForJS[path_length - 1] == cols - 1) {
    userConsole.textContent = "AIが考えた道";
  } else {
    userConsole.textContent = "AIが考えた道(ゴールできません!)";
  }
  moveImage(returnForJS[AI_now_index]);
  AI_now_index++;
  if (AI_now_index >= path_length) {
    clearInterval(timerAI);
    userConsole.textContent = "３秒後にリセットします";
    resetImage.disabled = true;
    allReset.disabled = true;
    setTimeout(() => {
      fieldInfo = new Array(cell_count).fill(0);
      makeFieldInfo();
      pertsReset();
      resetImage.disabled = false;
      allReset.disabled = false;
    }, 3000);
  }
}

function decreDim() {
  const now = Number(JSON.parse(storage.getItem("dimention")));
  if(now <= 4) {
    userConsole.textContent = "一辺は4マス以上にしてね！";
  } else {
    dimention.textContent = now - 1;
    storage.setItem("dimention", now - 1);
    cols--;
    rows--;
    location.reload();
  }
}
function increDim() {
  const now = Number(JSON.parse(storage.getItem("dimention")));
  if(now >= 8) {
    userConsole.textContent = "一辺は8マス以下にしてね！";
  } else {
    dimention.textContent = now + 1;
    storage.setItem("dimention", now + 1);
    cols++;
    rows++;
    location.reload();
  }
}
decdim.addEventListener("click", decreDim);
incdim.addEventListener("click", increDim);



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
const cellSize = fieldsLength / cols;
const cellFour = fieldsLength / 4;
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
let fieldInfo = new Array(cell_count).fill(0);
let c1, c2, h1, h2, w1, w2;
let i = 0;
const surrArr = [[cols - 2, 2 * cols - 1], [cols*(rows - 2), cell_count - cols + 1]];

function makeFieldInfo() {
    //コインの場所
  c1 = getRandom(0, ((rows / 2) * cols) - 1);
  for (c2 = 12; c2 == 12; i++) {
    c2 = getRandom((rows / 2) * cols, cell_count - 1);
  };
  fieldInfo[c1] = 2;
  fieldInfo[c2] = 2;
    //落とし穴の場所
  for (h1 = cols - 1; [cols - 1, cols*(rows - 1), c1, c2].includes(h1); i++) {
    h1 = getRandom(0, cell_count - 1);
  }
  for (h2 = cols - 1; [cols - 1, cols*(rows - 1), h1, c1, c2].includes(h2) || surrArr.some(pair => pair.every(v => [h1, h2].includes(v))); i++) {
    h2 = getRandom(0, cell_count - 1);
  }
  fieldInfo[h1] = -2;
  fieldInfo[h2] = -2;
    //ワープホール(Input)の場所
  for (w1 = cols - 1; [cols - 1, cols*(rows - 1), h1, h2, c1, c2].includes(w1) || surrArr.some(pair => pair.every(v => [h1, w1].includes(v))) || surrArr.some(pair => pair.every(v => [h2, w1].includes(v))); i++) {
    w1 = getRandom(0, cell_count - 1);
  }
  //ワープホール(output)の場所
  for (w2 = cols - 1; [cols - 1, cols*(rows - 1), h1, h2, c1, c2, w1].includes(w2); i++) {
    w2 = getRandom(0, cell_count - 1);
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

let passedPath = new Array(cell_count).fill(0);//通った道
passedPath[cols*(rows - 1)] = 1;//Start初期化
let attributes = [[imagep, imagec, imageh, imagei, imageo], [0, 2, -2, -1, 1]];
let moveNum = [0, 0];
let tmpMoveNum = 0;

function makeFieldImage(index) {//表示する画像のインデックス
  for (let i = 0; i < cell_count; i++) {
    if (fieldInfo[i] === attributes[1][index]) {
      const gyo = Math.floor(i / cols);
      const retu = i % cols;
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
    ctx.fillText('TIME UP!!', cellFour * 2, cellFour * 2);
    setTimeout(() => {
      fieldInfo = new Array(cell_count).fill(0);
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
    ctx.drawImage(imagem, 0, cellSize * (cols - 1), cellSize, cellSize);
    fields.addEventListener('click', canvasClick);
  } else {
    imagem.addEventListener('load', () => {
      ctx.drawImage(imagem, 0, cellSize * (cols - 1), cellSize, cellSize);
      fields.addEventListener('click', canvasClick);
    });
  }
}

const result = document.getElementById("explain");
const initialCell = cols*(rows - 1);//スタートのセル番号
let tmpCellNum = initialCell;
images.addEventListener('load', () => {
  ctx.drawImage(images, 0, 0, fieldsLength, fieldsLength);
  const textWidth = ctx.measureText('タップして開始').width;
  ctx.font = "40px Potta One";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = '#474747';
  ctx.fillText('タップして開始', cellFour * 2, cellFour * 2);
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
  let cellNum = cols * ycell + xcell;
  const xpix = xcell * cellSize;
  const ypix = ycell * cellSize;
  //result.textContent = `クリック座標: X=${xpix}, Y=${ypix}, Number: ${cellNum}`;

  judge(cellNum);
  //console.log(`tmpCellNum = ${tmpCellNum}`);
};

function moveImage(cellNum) {
  let tmpgyo = Math.floor(tmpCellNum / cols);
  let tmpretu = tmpCellNum % cols;
  ctx.clearRect(cellSize * tmpretu, cellSize * tmpgyo, cellSize, cellSize);
  //画像作る
  for (let k = 0; k < attributes[0].length; k++) {
    if (fieldInfo[tmpCellNum] === attributes[1][k]) {
      ctx.drawImage(attributes[0][k], cellSize * tmpretu, cellSize * tmpgyo, cellSize, cellSize);
    };
    let gyo = Math.floor(cellNum / cols);
    let retu = cellNum % cols;
    ctx.drawImage(imagem, cellSize * retu, cellSize * gyo, cellSize, cellSize);
  }
  tmpCellNum = cellNum;
}



const resetImage = document.getElementById("reset");
const allReset = document.getElementById("allReset");
function pertsReset() {
  tmpCellNum = initialCell;
  passedPath = new Array(cell_count).fill(0);
  passedPath[cols*(rows - 1)] = 1;
  stepCount = 0;//通ったマスの数
  bonusNum = 0;//拾った宝の数
  moveNum = [0, 0];
  calcbtn.disabled = true;
  calcbtn.classList.add("hide");
  makeFieldImages();
  ctx.drawImage(imagem, 0, cellSize * (cols - 1), cellSize, cellSize);
  fields.removeEventListener('click', showDialog);
  fields.addEventListener('click', canvasClick);
  userConsole.textContent = "";
  date1 = new Date();
  count = 0;
  clearInterval(timerId);
  clearInterval(timerAI);
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
  fieldInfo = new Array(cell_count).fill(0);;
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
  const tmpgyo = Math.floor(tmpCellNum / cols);
  const tmpretu = tmpCellNum % cols;
  const gyo = Math.floor(value / cols);
  const retu = value % cols;
  let myTmpCellNum = tmpCellNum;
  if (tmpgyo != gyo && tmpretu == retu) {
    //縦移動の処理
    const idou = gyo - tmpgyo;
    for (let k = Math.sign(idou); Math.abs(k) <= Math.abs(idou); k += Math.sign(idou)) {
      tmpMoveNum += 1;
      console.log(`tmpMoveNum = ${tmpMoveNum}`);
      myTmpCellNum += Math.sign(k) * cols;
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
      if (myTmpCellNum == cols - 1) {
        goalProcess();
      }
    };
    if (tmpMoveNum == 2) {//ジャンプ
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
      if (myTmpCellNum == cols - 1) {
        goalProcess();
      }
    };
    if (tmpMoveNum == 2) {//ジャンプ
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
    ctx.fillText('SCORE...', cellFour * 2, cellFour * 1.5);
    ctx.font = "20px Potta One";
    ctx.fillText('タップして結果の詳細を表示', cellFour * 2, cellFour * 3.5);
    ctx.font = "90px Potta One";
    ctx.fillText(score, cellFour * 2, cellFour * 2.3);
    if (bestjudge == true) {
      ctx.drawImage(imageb, cellFour * 3, cellFour, cellFour, cellFour);
    }
    resetImage.disabled = false;
    allReset.disabled = false;
    calcbtn.disabled = false;
    calcbtn.classList.remove("hide");
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
    "割と速さが必要かも？", 
    "機械学習を勉強したい"];
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
