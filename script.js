'use strict';

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

const userConsole = document.getElementById("alert");
//ルール
let stepCount = 0;//通ったマスの数
let bonusNum = 0;//拾った宝の数
const oneStep = 1;//ノーマルセル１マス通ったときのインクリメント
const bonus = 3;//宝拾ったときのデクリメント

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
imagem.src = 'human.png';
const imagef = new Image();
imagef.src = 'fall.png';
const imageg = new Image();
imageg.src = 'goal.png';
const images = new Image();
images.src = 'start.png';

let passedPath = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0];//通った道
let attributes = [[imagep, imagec, imageh, imagei, imageo], [0, 2, -2, -1, 1]];


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



function getStart() {
  ctx.clearRect(0, 0, fieldsLength, fieldsLength);
  //最初に画像を貼り付け
  //for (let k = 0; k < attributes[0].length; k++) {
    //attributes[0][k].addEventListener('load', () => {
      //makeFieldImage(k);
    //})
  //};
  pertsReset();
  fields.removeEventListener('click', getStart);
  imagem.addEventListener('load', () => {
    ctx.drawImage(imagem, 0, cellSize * 3, cellSize, cellSize);
    fields.addEventListener('click', canvasClick);
  });
}

const result = document.getElementById("explain");
const initialCell = 12;//スタートのセル番号
let tmpCellNum = initialCell;
images.addEventListener('load', () => {
  ctx.drawImage(images, 0, 0, fieldsLength, fieldsLength);
  const textWidth = ctx.measureText('タップして開始').width;
  ctx.font = "40px serif";
  ctx.textAlign = "center";
  ctx.textBaseLine = "middle";
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
  result.textContent = `クリック座標: X=${xpix}, Y=${ypix}, Number: ${cellNum}`;

  
  judge(cellNum);
  console.log(`tmpCellNum = ${tmpCellNum}`);
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
  makeFieldImages();
  ctx.drawImage(imagem, 0, cellSize * 3, cellSize, cellSize);
  fields.addEventListener('click', canvasClick);
  userConsole.textContent = "";
}
//盤面以外をリセットする！！！！！！！
resetImage.addEventListener('click', pertsReset);
//盤面全てをリセットする！！！！！！！！！
allReset.addEventListener('click', () => {
  fieldInfo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  makeFieldInfo();
  pertsReset();
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
      myTmpCellNum += Math.sign(k) * 4;
      const tmp = fieldInfo[myTmpCellNum];
      moveImage(myTmpCellNum);
      if (tmp == -2) {
        ctx.drawImage(imagef, 0, 0, fieldsLength, fieldsLength);
        userConsole.textContent = "穴に落ちた💦再読み込みでリスタートしよう！";
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
    };
    if (value == 3) {
      goalProcess(value);
    }
  } else if (tmpgyo == gyo && tmpretu != retu) {
    //横移動の処理
    const idou = retu - tmpretu;
    for (let k = Math.sign(idou); Math.abs(k) <= Math.abs(idou); k += Math.sign(idou)) {
      myTmpCellNum += Math.sign(k);
      const tmp = fieldInfo[myTmpCellNum];
      moveImage(myTmpCellNum);
      if (tmp == -2) {
        ctx.drawImage(imagef, 0, 0, fieldsLength, fieldsLength);
        userConsole.textContent = "穴に落ちた💦再読み込みでリスタートしよう！";
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
      console.log(`l = ${k}、tmp = ${myTmpCellNum}で${fieldInfo[myTmpCellNum]}`);
      countfunc();
    };
    if (value == 3) {
      goalProcess(value);
    }
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

function goalProcess(value) {
  ctx.drawImage(imageg, 0, 0, fieldsLength, fieldsLength);
  fields.removeEventListener("click", canvasClick);
  userConsole.textContent = `RESULT : ${stepCount}歩、宝${bonusNum}個`;
};