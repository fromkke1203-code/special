/* =========================================================
   설정 — 여기만 바꾸면 됩니다
   ========================================================= */
const CONFIG = {
  // Suno로 만든 노래 파일을 music 폴더에 넣고 파일 이름을 맞춰 주세요.
  // 예) 'music/song.mp3'  (파일이 없으면 노래 없이 그대로 진행됩니다)
  songUrl: 'music/song.mp3',
  volume: 0.7,

  // 하트가 완성된 뒤 편지 페이지로 넘어가기까지 기다리는 시간(초)
  secondsBeforeLetter: 10,

  // 하트를 이루는 단어 개수(대략) 와 단어 묶음이 날아오는 간격(ms)
  heartWordCount: 130,
  batchIntervalMs: 720,

  // 편지 글씨가 써지는 속도(ms, 한 글자 기준)
  typingMs: 70,
};

/* 각 나라 말로 "사랑해" */
const LOVE_WORDS = [
  '사랑해', 'I love you', '愛してる', '我爱你', 'Je t\'aime', 'Te amo', 'Ich liebe dich',
  'Ti amo', 'Я тебя люблю', 'Eu te amo', 'Ik hou van je', 'Σ\'αγαπώ', 'Seni seviyorum',
  'Aku cinta kamu', 'Mahal kita', 'Anh yêu em', 'Jag älskar dig', 'Jeg elsker dig',
  'Kocham cię', 'Miluji tě', 'Szeretlek', 'Te iubesc', 'Volim te', 'Rakastan sinua',
  'Ég elska þig', 'Nakupenda', 'Ngiyakuthanda', 'أحبك', 'אני אוהב אותך', 'ฉันรักคุณ',
  'मैं तुमसे प्यार करता हूँ', 'আমি তোমাকে ভালোবাসি', 'Saranghae', 'Ljubim te', 'Es tevi mīlu',
  'Aš tave myliu', 'Ma armastan sind', 'Mina rakastan', 'Tha gaol agam ort', 'Rwy\'n dy garu di',
  'Ich hab di gärn', 'Ek het jou lief', 'Men seni sevaman', 'Мен сені сүйемін', 'Би чамд хайртай',
  'Ես քեզ սիրում եմ', 'მიყვარხარ', 'Tôi yêu bạn', 'Sayang kamu', 'ຂ້ອຍຮັກເຈົ້າ', 'ខ្ញុំស្រលាញ់អ្នក',
  'Ami tomake bhalobashi', 'Ngā aroha', 'Aloha wau iā ʻoe', 'Mi aime a ou', 'Ya tebya lyublyu',
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
    el.style.setProperty('--fs', (p.fs * 100).toFixed(2));
    el.style.setProperty('--r', p.rot || (rand(-10, 10).toFixed(1) + 'deg'));
    el.style.setProperty('--fr', rand(-220, 220).toFixed(0) + 'deg');
    const ang = rand(0, Math.PI * 2), dist = rand(70, 130);
    el.style.setProperty('--fx', (Math.cos(ang) * dist).toFixed(1) + 'vmin');
    el.style.setProperty('--fy', (Math.sin(ang) * dist).toFixed(1) + 'vmin');
    el.style.color = colorAt(p.t);
    stage.appendChild(el);
    return el;
  });
  return els;
}

async function playHeart() {
  const stage = $('heartStage');
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
  if (state.page === 'heart') {
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
    for (const ch of text) {
      const span = document.createElement('span');
      span.className = 'ch' + (ch === ' ' ? ' space' : '');
      span.textContent = ch;
      container.appendChild(span);
      movePen(pen, span, paper);
      // 글이 아래로 길어지면 편지지를 따라 내려갑니다
      const sr = span.getBoundingClientRect(), pr = paper.getBoundingClientRect();
      if (sr.bottom > pr.bottom - 40) paper.scrollTop += sr.bottom - (pr.bottom - 40);
      let delay = CONFIG.typingMs * (ch === ' ' ? 0.6 : isWide(ch) ? 1.15 : 0.8);
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
  state.letterPlayed = true;
  state.letterPlaying = false;
}

/* =========================================================
   페이지 전환
   ========================================================= */
function showPage(name) {
  if (state.page === name) return;
  state.page = name;
  clearTimeout(state.autoTimer);
  $('pageHeart').classList.toggle('is-active', name === 'heart');
  $('pageLetter').classList.toggle('is-active', name === 'letter');
  $('toLetterBtn').hidden = name !== 'heart';
  $('toHeartBtn').hidden = name !== 'letter';
  if (name === 'letter') playLetter();   // 이미 다 썼으면 그대로 보여주기만
}

/* =========================================================
   노래
   ========================================================= */
function setupMusic() {
  const audio = $('bgm');
  const soundBtn = $('soundBtn');
  let started = false;

  const begin = () => { if (!started) { started = true; playHeart(); } };

  if (!CONFIG.songUrl) { begin(); return; }

  audio.src = CONFIG.songUrl;
  audio.volume = CONFIG.volume;

  const onMusic = () => {
    state.musicOn = true;
    soundBtn.hidden = false;
    $('startOverlay').hidden = true;
    begin();
  };

  soundBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    soundBtn.textContent = audio.muted ? '🔇' : '🔊';
    soundBtn.setAttribute('aria-label', audio.muted ? '소리 켜기' : '소리 끄기');
  });

  // 노래 파일을 못 찾으면(404 등) 노래 없이 바로 시작
  audio.addEventListener('error', () => { $('startOverlay').hidden = true; begin(); });

  // 노래 파일을 못 찾아도 2.5초 뒤에는 그냥 시작
  const fallback = setTimeout(begin, 2500);

  audio.play().then(() => { clearTimeout(fallback); onMusic(); }).catch((err) => {
    clearTimeout(fallback);
    if (err && err.name === 'NotAllowedError') {
      // 브라우저가 자동재생을 막음 → 한 번 눌러서 시작
      $('startOverlay').hidden = false;
      $('startBtn').addEventListener('click', () => {
        audio.play().then(onMusic).catch(() => { $('startOverlay').hidden = true; begin(); });
      }, { once: true });
    } else {
      begin();                            // 파일이 없거나 재생 불가 → 노래 없이 진행
    }
  });
}

/* =========================================================
   시작
   ========================================================= */
window.addEventListener('DOMContentLoaded', () => {
  makeFloatingHearts();
  $('toLetterBtn').addEventListener('click', () => showPage('letter'));
  $('toHeartBtn').addEventListener('click', () => showPage('heart'));
  setupMusic();
});
