/* =========================================================
   설정 — 여기만 바꾸면 됩니다
   ========================================================= */
const CONFIG = {
  // Suno로 만든 노래 파일을 music 폴더에 넣고 파일 이름을 맞춰 주세요.
  // 예) 'music/song.mp3'  (파일이 없으면 노래 없이 그대로 진행됩니다)
  songUrl: 'music/song.mp3',
  volume: 0.7,

  // 하트가 완성된 뒤 편지 페이지로 자동으로 넘어가기까지 기다리는 시간(초)
  // 0 으로 두면 자동으로 넘어가지 않고 버튼을 눌러야만 넘어갑니다
  secondsBeforeLetter: 10,

  // 하트를 이루는 단어 개수(대략) 와 단어 묶음이 날아오는 간격(ms)
  heartWordCount: 130,
  batchIntervalMs: 720,

  // 편지 글씨가 써지는 속도(ms, 한 글자 기준)
  typingMs: 70,

  // 하트 장면에 떠다니는 사진: photos 폴더에 1.jpg, 2.jpg, 3.jpg … 순서대로 넣으면 자동으로 찾습니다
  // (jpg, jpeg, png 가능. 번호가 끊기는 곳까지 읽습니다. 최대 30장)
  photoFolder: 'photos',
  photoMax: 30,
  photoOpacity: 0.92,
  // 사진 아래 흰 여백에 쓸 한 줄 메모. 순서대로 1번, 2번 … 사진. 비워 두면 메모 없음
  photoCaptions: [
    '한강 유람선',   // 1.jpg 한강 야경 셀카
    '맛집 탐방!!',   // 2.jpg 선글라스 셀카
    '처음 드라이브!', // 3.jpg 차 안 셀카
    '인스파이어호텔', // 4.jpg 크리스마스 전광판
    '루덴시아!',     // 5.jpg 곰 인형 앞
    '보트 데이트',   // 6.jpg 초승달 조형물 앞
  ],

  // 편지가 다 써진 뒤 마지막에 나오는 한 줄
  finaleText: '♥ 생일 축하해, 서연아 ♥',
};

/* 각 나라 말로 "사랑해" */
const LOVE_WORDS = [
  '사랑해', 'I love you', '愛してる', '我爱你', 'Je t\'aime', 'Te amo', 'Ich liebe dich',
  'Ti amo', 'Я тебя люблю', 'Eu te amo', 'Ik hou van je', 'Σ\'αγαπώ', 'Seni seviyorum',
  'Aku cinta kamu', 'Mahal kita', 'Anh yêu em', 'Jag älskar dig', 'Jeg elsker dig',
  'Kocham cię', 'Miluji tě', 'Szeretlek', 'Te iubesc', 'Volim te', 'Rakastan sinua',
  'Ég elska þig', 'Nakupenda', 'Ngiyakuthanda', 'أحبك', 'אני אוהב אותך', 'ฉันรักคุณ',
  'मैं तुमसे प्यार करता हूँ', 'আমি তোমাকে ভালোবাসি', 'Saranghae', 'Ljubim te', 'Es tevi mīlu',
  'Aš tave myliu', 'Ma armastan sind', 'Minä rakastan sinua', 'Tha gaol agam ort', 'Rwy\'n dy garu di',
  'Ich hab di gärn', 'Ek het jou lief', 'Men seni sevaman', 'Мен сені сүйемін', 'Би чамд хайртай',
  'Ես քեզ սիրում եմ', 'მიყვარხარ', 'Tôi yêu bạn', 'Sayang kamu', 'ຂ້ອຍຮັກເຈົ້າ', 'ខ្ញុំស្រលាញ់អ្នក',
  'Ami tomake bhalobashi', 'Aroha ahau ki a koe', 'Aloha wau iā ʻoe', 'Mi aime a ou', 'Ya tebya lyublyu',
  'Kimi ga suki', 'Wo ai ni', 'Te quiero', 'Mi amas vin',
];

/* 편지 내용 (오타·띄어쓰기 정리본) */
const LETTER_LINES = [
  '사랑하는 서연아,',
  '',
  '8번째 생일을 진심으로 축하해.',
  '가끔 애처럼 투정 부리는 날 보듬어 줘서 고맙고,',
  '항상 날 생각해 줘서 고마워.',
  '',
  '서연이 너도 힘든 나날들이 있었을 텐데,',
  '그 옆에 내가 있어서 조금이나마 행복했으려나.',
  '내가 너의 버팀목이 됐으려나.',
  '나름 노력했는데 그랬는지는 잘 모르겠네.',
  '',
  '2027년에는 2026년보다 더 즐겁고, 기쁘고, 행복하고,',
  '많은 추억 쌓으면서 보내자!',
  '',
  '2026년에는 나도 힘든 일이 있었는데,',
  '너의 곁에서 항상 기쁘고 행복했어.',
  '앞으로도 지금 마음 변치 말고 행복하자.',
  '',
  { sign: '항상 너의 옆에 있는 사람이,' },
  { sign: '사랑하는 서연이에게 ♥' },
];

/* =========================================================
   공용
   ========================================================= */
const $ = (id) => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isWide = (ch) => /[ᄀ-ᇿ㄰-㆏가-힯぀-ヿ一-鿿฀-๿຀-໿ក-៿]/.test(ch);

const state = {
  page: 'heart',
  heartDone: false,
  letterPlayed: false,
  letterPlaying: false,
  autoTimer: null,
  musicOn: false,
};

/* =========================================================
   배경 하트
   ========================================================= */
function makeFloatingHearts() {
  const box = $('floatingHearts');
  const count = 18;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.textContent = Math.random() < 0.5 ? '♥' : '♡';
    s.style.left = rand(0, 100) + 'vw';
    s.style.fontSize = rand(10, 30) + 'px';
    s.style.animationDuration = rand(14, 28) + 's';
    s.style.animationDelay = -rand(0, 28) + 's';
    s.style.setProperty('--drift', rand(-60, 60) + 'px');
    s.style.setProperty('--spin', rand(-50, 50) + 'deg');
    box.appendChild(s);
  }
}

/* =========================================================
   1페이지: 떠다니는 사진
   ========================================================= */
function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// photos/1.jpg, 2.jpg … 를 번호가 끊길 때까지 찾습니다
async function findPhotos() {
  const found = [];
  for (let i = 1; i <= CONFIG.photoMax; i++) {
    let img = null;
    for (const ext of ['jpg', 'jpeg', 'png', 'JPG', 'PNG']) {
      img = await loadImage(`${CONFIG.photoFolder}/${i}.${ext}`);
      if (img) break;
    }
    if (!img) break;
    found.push(img);
  }
  return found;
}

// 사진을 한 화면에 띄웁니다.
// keepOut: 사진이 피해 가야 할 가운데 영역 {left, right}
// allowEdges: 옆자리가 없을 때 가장자리에 걸쳐서라도 띄울지 (false 면 아예 띄우지 않음)
function placePhotos(field, imgs, keepOut, allowEdges) {
  const small = Math.min(innerWidth, innerHeight) < 500;
  const n = imgs.length;
  const W = innerWidth;
  imgs.forEach((src, i) => {
    const img = src.cloneNode();
    img.alt = '';
    img.draggable = false;
    const wrap = document.createElement('div');
    wrap.className = 'photo';
    const inner = document.createElement('div');
    inner.className = 'photo-inner';
    inner.appendChild(img);
    const caption = (CONFIG.photoCaptions || [])[i];
    if (caption) {
      const cap = document.createElement('span');
      cap.className = 'photo-caption';
      cap.textContent = caption;
      inner.appendChild(cap);
    }
    wrap.appendChild(inner);

    let size = small ? rand(74, 96) : rand(110, 160);
    // 가운데(하트/편지지) 좌우의 빈 공간으로만 지나가게 자리 배정
    // 흔들림(좌우 6px, 기울기)까지 감안해 가운데 영역과 24px 띄웁니다
    const gap = 24;
    const sideRoom = Math.max(keepOut.left, W - keepOut.right) - gap - 8;
    if (!allowEdges && sideRoom < size) size = Math.max(56, sideRoom);   // 자리가 좁으면 사진을 줄여서라도
    const leftRoom = keepOut.left - size - gap - 8;
    const rightRoom = W - keepOut.right - size - gap - 8;
    const sides = [];
    if (leftRoom >= 0) sides.push('L');
    if (rightRoom >= 0) sides.push('R');
    let x, opacity = CONFIG.photoOpacity;
    if (sides.length) {
      const side = sides[i % sides.length];
      x = side === 'L' ? rand(8, 8 + leftRoom) : rand(keepOut.right + gap + 8, keepOut.right + gap + 8 + rightRoom);
    } else if (!allowEdges) {
      return;                                   // 편지지를 가리느니 이 화면에서는 띄우지 않습니다
    } else {
      // 좁은 휴대폰: 양쪽 가장자리에 살짝 걸치게 하고 조금 투명하게
      x = i % 2 === 0 ? rand(-size * 0.4, 0) : rand(W - size * 0.6, W - size * 0.35);
      opacity = Math.min(opacity, 0.72);
    }
    const dur = rand(26, 40);
    wrap.style.setProperty('--px', x.toFixed(0) + 'px');
    wrap.style.setProperty('--size', size.toFixed(0) + 'px');
    wrap.style.setProperty('--dur', dur.toFixed(1) + 's');
    wrap.style.setProperty('--delay', (-(i / n) * dur).toFixed(1) + 's');   // 처음부터 여기저기 흩어져 있게
    wrap.style.setProperty('--tilt', rand(-14, 14).toFixed(1) + 'deg');
    wrap.style.setProperty('--sway', rand(3, 5.5).toFixed(1) + 's');
    wrap.style.opacity = opacity;
    field.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('is-ready'));
  });
}

let photoImgs = null;          // 한 번 찾은 사진은 계속 재사용 (다시 보기 때 또 불러오지 않음)

function layoutPhotos() {
  if (!photoImgs || !photoImgs.length) return;
  const heartField = $('photoField'), letterField = $('photoFieldLetter');
  heartField.innerHTML = '';
  letterField.innerHTML = '';
  // 1페이지: 하트 좌우
  const stage = $('heartStage').getBoundingClientRect();
  placePhotos(heartField, photoImgs, { left: stage.left, right: stage.right }, true);
  // 2페이지: 펼쳐진 편지지 좌우 (편지지 폭 = min(92vw, 560px), 가운데 정렬)
  const paperW = Math.min(innerWidth * 0.92, 560);
  const left = (innerWidth - paperW) / 2;
  placePhotos(letterField, photoImgs, { left, right: left + paperW }, false);
}

async function startPhotos() {
  if (photoImgs) return;                 // 이미 띄워져 있으면 그대로 둡니다
  photoImgs = await findPhotos();
  layoutPhotos();
}

// 화면을 돌리거나 크기가 바뀌면 사진 자리를 다시 잡습니다
let photoResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(photoResizeTimer);
  photoResizeTimer = setTimeout(layoutPhotos, 400);
});

/* =========================================================
   1페이지: 사랑해 하트
   ========================================================= */
// 하트 곡선: (x² + y² − 1)³ − x²y³ ≤ 0  (y축 위 방향)
function insideHeart(x, y) {
  const a = x * x + y * y - 1;
  return a * a * a - x * x * y * y * y <= 0;
}
// 무대(0~1) 좌표 ↔ 하트 좌표 변환
const H = { cx: 0.5, cy: 0.52, sx: 0.43, sy: 0.41 };
const toHeart = (u, v) => [(u - H.cx) / H.sx, (H.cy - v) / H.sy];

// 하트 가운데(0, 0.25)에서 바깥으로 얼마나 나갔는지 0~1
function edgeness(hx, hy) {
  const cx = 0, cy = 0.25;
  const dx = hx - cx, dy = hy - cy;
  let lo = 0, hi = 3;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (insideHeart(cx + dx * mid, cy + dy * mid)) lo = mid; else hi = mid;
  }
  return Math.min(1, 1 / lo);
}

function lerp(a, b, t) { return a + (b - a) * t; }
function colorAt(t) {
  // 가운데 분홍 → 바깥 빨강
  const stops = [
    [0.00, [255, 196, 228]],
    [0.40, [255, 140, 185]],
    [0.75, [255, 70, 120]],
    [1.00, [255, 28, 72]],
  ];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, c0] = stops[i - 1], [t1, c1] = stops[i];
      const k = (t - t0) / (t1 - t0);
      return `rgb(${Math.round(lerp(c0[0], c1[0], k))}, ${Math.round(lerp(c0[1], c1[1], k))}, ${Math.round(lerp(c0[2], c1[2], k))})`;
    }
  }
  return 'rgb(214,0,48)';
}

// 단어가 겹치지 않게 하트 안에 배치 (무대 기준 0~1 단위 상자)
function layoutHeartWords(target) {
  const placed = [];
  const pad = 0.004;
  let wi = 0;

  const measure = (word, fs) => {
    let w = 0;
    for (const ch of word) w += isWide(ch) ? 1.0 : 0.52;
    return [w * fs * 0.98, fs * 1.05];
  };
  const fits = (u, v, bw, bh) => {
    const pts = [[u - bw / 2, v - bh / 2], [u + bw / 2, v - bh / 2], [u - bw / 2, v + bh / 2],
                 [u + bw / 2, v + bh / 2], [u, v], [u - bw / 2, v], [u + bw / 2, v], [u, v - bh / 2], [u, v + bh / 2]];
    if (!pts.every(([cu, cv]) => insideHeart(...toHeart(cu, cv)))) return false;
    return !placed.some((p) =>
      Math.abs(p.u - u) < (p.bw + bw) / 2 + pad && Math.abs(p.v - v) < (p.bh + bh) / 2 + pad);
  };
  const add = (word, u, v, bw, bh, fs) => {
    const [hx, hy] = toHeart(u, v);
    placed.push({ word, u, v, bw, bh, fs, t: edgeness(hx, hy) });
  };

  // 1) 테두리: 하트 가장자리를 따라 짧은 단어를 기울여 두릅니다 (선을 그리듯)
  const center = { u: H.cx, v: H.cy - 0.25 * H.sy };
  const shortWords = LOVE_WORDS.filter((w) => measure(w, 1)[0] <= 7.5);
  const boundary = (th) => {
    const du = Math.cos(th), dv = Math.sin(th);
    let lo = 0, hi = 0.8;
    for (let i = 0; i < 30; i++) {
      const m = (lo + hi) / 2;
      if (insideHeart(...toHeart(center.u + du * m, center.v + dv * m))) lo = m; else hi = m;
    }
    return [center.u + du * lo, center.v + dv * lo, du, dv, lo];
  };
  // 둘레 길이 기준으로 고르게 각도를 고릅니다 (아래쪽 긴 변이 비지 않도록)
  const M = 720, arc = [0], pts = [];
  for (let i = 0; i <= M; i++) {
    const [bu, bv] = boundary((i / M) * Math.PI * 2);
    pts.push([bu, bv]);
    if (i > 0) arc.push(arc[i - 1] + Math.hypot(bu - pts[i - 1][0], bv - pts[i - 1][1]));
  }
  const total = arc[M];
  const N = 84;
  let si = 0, ai = 0;
  for (let k = 0; k < N; k++) {
    const target = (k / N) * total;
    while (ai < M && arc[ai + 1] < target) ai++;
    const th = (ai / M) * Math.PI * 2;
    const [bu, bv, du, dv, R] = boundary(th);
    const [au, av] = boundary(th - 0.05), [cu, cv] = boundary(th + 0.05);
    let ang = Math.atan2(cv - av, cu - au);                    // 접선 방향
    if (ang > Math.PI / 2) ang -= Math.PI;
    if (ang < -Math.PI / 2) ang += Math.PI;
    const fs = rand(0.02, 0.026);
    const word = shortWords[si % shortWords.length];
    const [bw, bh] = measure(word, fs);
    const cos = Math.abs(Math.cos(ang)), sin = Math.abs(Math.sin(ang));
    const aw = bw * cos + bh * sin, ah = bw * sin + bh * cos;   // 기울인 상자의 바깥 테두리
    for (let r = R - 0.003; r > R * 0.6; r -= 0.004) {
      const u = center.u + du * r, v = center.v + dv * r;
      if (fits(u, v, aw, ah)) {
        add(word, u, v, aw, ah, fs);
        placed[placed.length - 1].rot = (ang * 180 / Math.PI).toFixed(1) + 'deg';
        placed[placed.length - 1].t = 1;
        si++;
        break;
      }
    }
  }

  // 2) 속 채우기: 큰 글자부터 점점 작은 글자로
  let fs = 0.05, fails = 0;
  while (placed.length < target && fs > 0.014) {
    const word = LOVE_WORDS[wi % LOVE_WORDS.length];
    const [bw, bh] = measure(word, fs);
    let ok = false;
    for (let tries = 0; tries < 500 && !ok; tries++) {
      const u = rand(0.04, 0.96), v = rand(0.02, 0.98);
      if (fits(u, v, bw, bh)) { add(word, u, v, bw, bh, fs); ok = true; }
    }
    wi++;                                   // 안 들어가는 긴 단어는 건너뛰고 다음 단어로
    if (ok) fails = 0;
    else if (++fails > 10) { fs *= 0.93; fails = 0; }
  }
  return placed;
}

function buildHeart() {
  const stage = $('heartStage');
  const words = layoutHeartWords(CONFIG.heartWordCount);
  // 날아오는 순서를 섞어 하트 전체에 고르게 쌓이도록
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  const els = words.map((p) => {
    const el = document.createElement('span');
    el.className = 'heart-word';
    el.textContent = p.word;
    el.style.setProperty('--x', (p.u * 100).toFixed(2) + '%');
    el.style.setProperty('--y', (p.v * 100).toFixed(2) + '%');
    el.dataset.fs = p.fs;
    el.style.setProperty('--r', p.rot || (rand(-10, 10).toFixed(1) + 'deg'));
    el.style.setProperty('--fr', rand(-220, 220).toFixed(0) + 'deg');
    const ang = rand(0, Math.PI * 2), dist = rand(70, 130);
    el.style.setProperty('--fx', (Math.cos(ang) * dist).toFixed(1) + 'vmin');
    el.style.setProperty('--fy', (Math.sin(ang) * dist).toFixed(1) + 'vmin');
    el.style.color = colorAt(p.t);
    stage.appendChild(el);
    return el;
  });
  sizeHeartWords();
  return els;
}

// 무대 크기에 맞춰 글자 크기를 px로 계산 (오래된 브라우저에서도 동일하게 보이도록)
function sizeHeartWords() {
  const stage = $('heartStage');
  const w = stage.clientWidth;
  stage.querySelectorAll('.heart-word').forEach((el) => {
    el.style.fontSize = (parseFloat(el.dataset.fs) * w).toFixed(2) + 'px';
  });
}
window.addEventListener('resize', sizeHeartWords);
window.addEventListener('orientationchange', () => setTimeout(sizeHeartWords, 300));

async function playHeart() {
  const stage = $('heartStage');
  startPhotos();                         // 사진은 있으면 같이 떠다닙니다
  const els = buildHeart();
  // 1개, 2개, 3개 … 점점 많이 날아옵니다
  let i = 0, batch = 1;
  while (i < els.length) {
    const group = els.slice(i, i + batch);
    group.forEach((el, k) => setTimeout(() => el.classList.add('is-in'), k * 90));
    i += batch;
    batch += 1;
    if (i < els.length) await sleep(CONFIG.batchIntervalMs);
  }
  await sleep(1300);
  stage.classList.add('is-complete');
  $('birthdayText').classList.add('is-shown');
  state.heartDone = true;

  // 완성 후 10초 뒤 편지 페이지로
  if (state.page === 'heart' && CONFIG.secondsBeforeLetter > 0) {
    state.autoTimer = setTimeout(() => showPage('letter'), CONFIG.secondsBeforeLetter * 1000);
  }
}

/* =========================================================
   2페이지: 편지 봉투 → 편지지 → 손글씨
   ========================================================= */
function expandPaper() {
  const scene = $('letterScene');
  const paper = $('letterPaper');
  const a = paper.getBoundingClientRect();
  scene.appendChild(paper);              // 봉투 밖으로 꺼내 화면 중앙에 고정
  scene.classList.add('is-expanded');
  const b = paper.getBoundingClientRect();
  paper.style.transition = 'none';
  paper.style.transform =
    `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`;
  paper.getBoundingClientRect();         // reflow
  paper.style.transition = '';
  paper.style.transform = 'none';
}

function movePen(pen, target, paper) {
  const r = target.getBoundingClientRect();
  const pr = paper.getBoundingClientRect();
  pen.style.left = (r.right - pr.left + paper.scrollLeft) + 'px';
  pen.style.top = (r.top - pr.top + paper.scrollTop + r.height * 0.55) + 'px';
}

async function typeLetter() {
  const body = $('letterBody');
  const paper = $('letterPaper');
  const pen = $('pen');
  pen.classList.add('is-writing');

  for (const line of LETTER_LINES) {
    const isSign = typeof line === 'object';
    const text = isSign ? line.sign : line;
    let container = body;
    if (isSign) {
      container = document.createElement('span');
      container.className = 'sign';
      body.appendChild(container);
    }
    if (text === '') {
      body.appendChild(document.createElement('br'));
      await sleep(CONFIG.typingMs * 6);
      continue;
    }
    // 띄어쓰기 단위로 묶어서, 줄이 넘어갈 때 단어 중간이 끊기지 않게 합니다
    let wordBox = null;
    for (const ch of text) {
      if (ch === ' ') {
        container.appendChild(document.createTextNode(' '));
        wordBox = null;
        await sleep(CONFIG.typingMs * 0.6);
        continue;
      }
      if (!wordBox) {
        wordBox = document.createElement('span');
        wordBox.className = 'word';
        container.appendChild(wordBox);
      }
      const span = document.createElement('span');
      span.className = 'ch';
      span.textContent = ch;
      wordBox.appendChild(span);
      movePen(pen, span, paper);
      // 글이 아래로 길어지면 편지지를 따라 내려갑니다
      const sr = span.getBoundingClientRect(), pr = paper.getBoundingClientRect();
      if (sr.bottom > pr.bottom - 40) paper.scrollTop += sr.bottom - (pr.bottom - 40);
      let delay = CONFIG.typingMs * (isWide(ch) ? 1.15 : 0.8);
      if (/[,.!?]/.test(ch)) delay += 260;
      await sleep(delay);
    }
    if (!isSign) body.appendChild(document.createElement('br'));
    await sleep(CONFIG.typingMs * 4);
  }
  pen.classList.remove('is-writing');
}

async function playLetter() {
  if (state.letterPlayed || state.letterPlaying) return;
  state.letterPlaying = true;
  const envelope = $('envelope');
  await sleep(700);
  envelope.classList.add('is-open');     // 봉투 뚜껑 열림
  await sleep(1100);
  envelope.classList.add('is-out');      // 편지지가 위로 나옴
  await sleep(1300);
  expandPaper();                         // 편지지가 화면 가득
  await sleep(1200);
  await typeLetter();                    // 한 글자씩 손글씨
  await sleep(500);
  playFinale();                          // 하트 비 + 마지막 한 줄
  state.letterPlayed = true;
  state.letterPlaying = false;
  $('replayBtn').hidden = false;
  updateNavSpace();
}

// 편지가 끝나면 화면 가득 하트가 흩날리고, 편지지 맨 아래에 마지막 한 줄이 떠오릅니다
function playFinale() {
  const rain = $('finaleRain');
  rain.innerHTML = '';
  const glyphs = ['♥', '♥', '♥', '♡', '✦', '❀'];
  const colors = ['#ffb3d6', '#ff7fae', '#ff5b8d', '#ff3d78', '#ffd1e6'];
  for (let i = 0; i < 70; i++) {
    const sp = document.createElement('span');
    sp.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    sp.style.setProperty('--x', rand(0, 100).toFixed(1) + 'vw');
    sp.style.setProperty('--s', rand(12, 30).toFixed(0) + 'px');
    sp.style.setProperty('--c', colors[Math.floor(Math.random() * colors.length)]);
    sp.style.setProperty('--d', rand(3.5, 6.5).toFixed(1) + 's');
    sp.style.setProperty('--delay', rand(0, 3.5).toFixed(2) + 's');
    sp.style.setProperty('--spin', rand(-360, 360).toFixed(0) + 'deg');
    sp.style.setProperty('--sway', rand(-60, 60).toFixed(0) + 'px');
    rain.appendChild(sp);
  }
  setTimeout(() => { rain.innerHTML = ''; }, 11000);

  if (CONFIG.finaleText) {
    const body = $('letterBody');
    const line = document.createElement('span');
    line.className = 'finale-line';
    line.textContent = CONFIG.finaleText;
    body.appendChild(line);
    const paper = $('letterPaper');
    setTimeout(() => { paper.scrollTop = paper.scrollHeight; }, 50);
  }
}

// 처음부터 다시 보기: 새로고침 없이 하트부터 다시 (노래는 끊기지 않음)
function resetShow() {
  clearTimeout(state.autoTimer);
  $('finaleRain').innerHTML = '';
  $('replayBtn').hidden = true;
  updateNavSpace();

  // 하트
  const stage = $('heartStage');
  stage.innerHTML = '';
  stage.classList.remove('is-complete');
  $('birthdayText').classList.remove('is-shown');

  // 편지: 편지지를 봉투 안 원래 자리로 되돌림
  const envelope = $('envelope');
  const scene = $('letterScene');
  const paper = $('letterPaper');
  scene.classList.remove('is-expanded');
  envelope.classList.remove('is-open', 'is-out');
  paper.style.transition = 'none';
  paper.style.transform = '';
  envelope.insertBefore(paper, envelope.querySelector('.envelope-side'));
  paper.scrollTop = 0;
  $('letterBody').innerHTML = '';
  $('pen').classList.remove('is-writing');
  paper.getBoundingClientRect();
  paper.style.transition = '';

  state.heartDone = false;
  state.letterPlayed = false;
  state.letterPlaying = false;

  state.page = 'letter';
  showPage('heart');
  playHeart();
}

/* =========================================================
   페이지 전환
   ========================================================= */
// 아래 버튼 묶음의 실제 높이를 CSS 에 알려 줘서 편지지가 버튼과 겹치지 않게 합니다
function updateNavSpace() {
  const nav = $('nav');
  const h = nav.hidden ? 44 : nav.offsetHeight;
  document.documentElement.style.setProperty('--nav-h', h + 'px');
}
window.addEventListener('resize', updateNavSpace);

function showPage(name) {
  if (state.page === name) return;
  state.page = name;
  clearTimeout(state.autoTimer);
  $('pageHeart').classList.toggle('is-active', name === 'heart');
  $('pageLetter').classList.toggle('is-active', name === 'letter');
  $('toLetterBtn').hidden = name !== 'heart';
  $('toHeartBtn').hidden = name !== 'letter';
  $('replayBtn').hidden = !state.letterPlayed;
  updateNavSpace();
  if (name === 'letter') playLetter();   // 이미 다 썼으면 그대로 보여주기만
}

/* =========================================================
   노래
   ========================================================= */
function setupMusic() {
  const audio = $('bgm');
  const sound = $('sound');
  const soundBtn = $('soundBtn');
  const panel = $('volumePanel');
  const muteBtn = $('muteBtn');
  const slider = $('volumeSlider');
  const valueEl = $('volumeValue');
  const overlay = $('startOverlay');
  let started = false;
  let musicOk = !!CONFIG.songUrl;
  let gainNode = null;                 // 아이폰은 audio.volume 을 무시해서 Web Audio 로 음량을 조절합니다
  let audioCtx = null;

  const begin = () => { if (!started) { started = true; overlay.hidden = true; $('nav').hidden = false; updateNavSpace(); playHeart(); } };

  const icon = () => {
    const v = audio.muted ? 0 : slider.value / 100;
    soundBtn.textContent = v === 0 ? '🔇' : v < 0.5 ? '🔉' : '🔊';
  };
  const setVolume = (v) => {             // v: 0 ~ 1
    v = Math.max(0, Math.min(1, v));
    if (gainNode) gainNode.gain.value = v;
    audio.volume = v;
    valueEl.textContent = Math.round(v * 100);
    icon();
  };
  const connectGain = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
      const src = audioCtx.createMediaElementSource(audio);
      gainNode = audioCtx.createGain();
      src.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) { gainNode = null; }
  };
  // 화면을 껐다 켜거나 다른 앱에 다녀오면 소리 경로를 다시 깨웁니다
  const wake = () => { if (audioCtx && audioCtx.state !== 'running') audioCtx.resume().catch(() => {}); };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
  document.addEventListener('touchend', wake, { passive: true });
  document.addEventListener('click', wake);

  if (CONFIG.songUrl) {
    audio.src = CONFIG.songUrl;        // 하트를 누르기 전에 미리 받아 둡니다
    audio.load();
    audio.addEventListener('error', () => { musicOk = false; });
  }

  slider.value = Math.round(CONFIG.volume * 100);
  valueEl.textContent = slider.value;

  soundBtn.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    soundBtn.classList.toggle('is-open', !panel.hidden);
  });
  slider.addEventListener('input', () => {
    if (audio.muted && slider.value > 0) { audio.muted = false; muteBtn.classList.remove('is-muted'); }
    setVolume(slider.value / 100);
  });
  muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    muteBtn.classList.toggle('is-muted', audio.muted);
    muteBtn.setAttribute('aria-label', audio.muted ? '소리 켜기' : '소리 끄기');
    icon();
  });
  // 조절 막대 바깥을 누르면 닫힘
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !sound.contains(e.target)) { panel.hidden = true; soundBtn.classList.remove('is-open'); }
  });

  // 하트를 누르는 순간: 그 터치 덕분에 브라우저가 소리를 허용 → 노래 시작 + 하트 시작
  $('startBtn').addEventListener('click', () => {
    if (musicOk) {
      connectGain();
      setVolume(slider.value / 100);
      audio.play().then(() => {
        state.musicOn = true;
        sound.hidden = false;
      }).catch(() => { /* 노래가 안 되면 조용히 진행 */ });
    }
    begin();
  }, { once: true });
}

/* =========================================================
   시작
   ========================================================= */
window.addEventListener('DOMContentLoaded', () => {
  makeFloatingHearts();
  $('toLetterBtn').addEventListener('click', () => showPage('letter'));
  $('toHeartBtn').addEventListener('click', () => showPage('heart'));
  $('replayBtn').addEventListener('click', resetShow);
  setupMusic();
});
