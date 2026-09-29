/* ========= EDIT ME ========= */
const MUSIC_FILE = "music/song.mp3";
const PAGE3_MESSAGE = "ถ้าตอนนี้เธอได้เปิดดูเค้าคงตื่นเต้นจนใจจะทะลุออกมาแล้ว!!!  เพราะงั้นห้ามทำหน้าล้อเค้า5555 เค้าดีใจจังง่าที่เราคุยกันมาจนถึงตอนนี้ แล้วดีใจมากๆที่ตรงนี้เป็นเธอ พอเป็นเธอแล้วทำให้เค้ารู้สึกว่าหัวใจเค้าจะปลอดภัย แต่แล้วเธอน่ะก็ชอบทำตัวน่ารักมากๆน่ารักจนเค้าหวงสุดๆกลัวเธอเผลอไปน่ารักใส่ใครแล้วเขาจะหวั่นไหวเหมือนเค้า เพราะงั้นนนนนนนนนนนนนน!!!!! >>>>>>>>>>>>>>>>>>>>>>>>> \n\nว่าแต่ตอนนี้เธอจะเขินเหมือนเค้ามั้ยนะ :P";
const PROPOSAL_MESSAGE = "WILL YOU BE MY GIRLFRIEND?";
const PAGE5_MESSAGE = "เย้!!! เป็นแฟนกันแล้วนะ เค้าน่ะจะตั้งใจรักเธออย่างดีเลยยขอบคุณที่ให้โอกาสงับ\nจากนี้ไปก็ค่อยๆโต ค่อยๆเรียนรู้ไปกับเค้านะ กรี๊ดดดดดดดเขินนจริงงงงงง\nเลิฟฟยูวววววววคั๊บ\nหอมแก้มเค้าสองทีด้วย!!!";
const PAGE3_SPEED_MS = 50;        // ms per character (40-60)
const PAGE4_DELAY_MS = 1000;      // wait before the question appears
const PAGE4_CHAR_MS = 80;         // ms per letter of the question
const STORAGE_KEY = "visitedPage3";
/* =========================== */

const $ = (s) => document.querySelector(s);
const pages = [...document.querySelectorAll(".page")];
let timers = [];
const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
const every = (fn, ms) => { const t = setInterval(fn, ms); timers.push(t); return t; };
const clearTimers = () => { timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); timers = []; };

const visited = () => { try { return localStorage.getItem(STORAGE_KEY) === "true"; } catch (e) { return false; } };
const setVisited = () => { try { localStorage.setItem(STORAGE_KEY, "true"); } catch (e) {} };

/* ---------- Music (one audio object, never restarted) ---------- */
const music = new Audio();
music.loop = true;
music.preload = "auto";
music.addEventListener("error", () => {}); // missing file = silently ignore
music.src = MUSIC_FILE;
function startMusic() { if (music.paused) { const p = music.play(); if (p && p.catch) p.catch(() => {}); } }

/* ---------- Navigation ---------- */
function go(n) {
  if (n === 4 && !visited()) n = 2;      // Page 4 guard
  clearTimers();
  resetNo();
  pages.forEach((p) => p.classList.toggle("active", +p.dataset.page === n));
  document.body.dataset.page = n;
  if (location.hash !== "#" + n) history.replaceState(null, "", "#" + n);
  ({ 2: enter2, 3: enter3, 4: enter4, 5: enter5 }[n] || (() => {}))();
}

/* ---------- Page 1 ---------- */
$("#startBtn").addEventListener("click", () => { startMusic(); go(2); });

/* ---------- Page 2 ---------- */
function enter2() { $("#jessie").style.cursor = visited() ? "pointer" : "not-allowed"; }
$("#woody").addEventListener("click", () => go(3));
$("#jessie").addEventListener("click", () => {
  if (visited()) return go(4);
  const j = $("#jessie"), t = $("#toast");
  j.classList.remove("shake"); void j.offsetWidth; j.classList.add("shake");
  t.classList.add("show");
  clearTimeout(enter2.t); enter2.t = setTimeout(() => t.classList.remove("show"), 1600);
});

/* ---------- Page 3 ---------- */
const letter = $("#letter");
function fitLetter() {
  let s = 2.4; letter.style.fontSize = s + "cqw";
  while (letter.scrollHeight > letter.clientHeight + 1 && s > 1.1) { s -= 0.1; letter.style.fontSize = s + "cqw"; }
}
function enter3() {
  const chars = [...PAGE3_MESSAGE];
  let i = 0;
  const shown = document.createElement("span"), rest = document.createElement("span");
  rest.className = "rest"; rest.textContent = PAGE3_MESSAGE;
  letter.replaceChildren(shown, rest);   // full text is laid out (hidden) so the size is stable
  fitLetter();
  every(() => {
    i++;
    shown.textContent = chars.slice(0, i).join("");
    rest.textContent = chars.slice(i).join("");
    if (i >= chars.length) clearTimers();
  }, PAGE3_SPEED_MS);
}
$("#completeBtn").addEventListener("click", () => { setVisited(); go(2); });

/* ---------- Page 4 ---------- */
const proposal = $("#proposal"), yesno = $("#yesno"), noBtn = $("#noBtn");
function enter4() {
  yesno.classList.remove("show");
  const box = document.createElement("div");
  proposal.replaceChildren(box);
  later(() => {
    let idx = 0, word = null;
    every(() => {
      const c = PROPOSAL_MESSAGE[idx++];
      if (c === undefined) {
        clearTimers();
        later(() => yesno.classList.add("show"), 400);
        return;
      }
      if (c === " ") { box.appendChild(document.createTextNode(" ")); word = null; return; }
      if (!word) { word = document.createElement("span"); word.className = "w"; box.appendChild(word); }
      const s = document.createElement("span"); s.className = "ch"; s.textContent = c; word.appendChild(s);
    }, PAGE4_CHAR_MS);
  }, PAGE4_DELAY_MS);
}
$("#yesBtn").addEventListener("click", () => go(5));

/* NO button: stays put until touched, dodges once, returns after 5s (setTimeout only, no intervals) */
let noTimer = null, noDx = 0, noDy = 0, lastEsc = 0;
const NO_RETURN_MS = 600;
function setNo(dx, dy) { noDx = dx; noDy = dy; noBtn.style.setProperty("--dx", dx + "px"); noBtn.style.setProperty("--dy", dy + "px"); }
function resetNo() { clearTimeout(noTimer); setNo(0, 0); }   // back to original spot
function escapeNo() {
  const now = performance.now();
  if (now - lastEsc < 300) return;            // pointerenter + pointerdown must not double-fire
  lastEsc = now;
  const st = $(".page.active .stage").getBoundingClientRect();
  const r = noBtn.getBoundingClientRect(), y = $("#yesBtn").getBoundingClientRect();
  const bx = r.left - noDx, by = r.top - noDy, w = r.width, h = r.height, m = st.width * 0.03, pad = 8;
  // Safe area: below the question text, inside the stage and the viewport
  const minX = Math.max(st.left, 0) + m, maxX = Math.min(st.right, innerWidth) - w - m;
  const minY = st.top + st.height * 0.565, maxY = Math.min(st.bottom, innerHeight) - h - m;
  let best = null;
  for (let i = 0; i < 40 && !best; i++) {
    const x = minX + Math.random() * Math.max(0, maxX - minX), yy = minY + Math.random() * Math.max(0, maxY - minY);
    const hitsYes = x < y.right + pad && x + w > y.left - pad && yy < y.bottom + pad && yy + h > y.top - pad;
    if (!hitsYes && Math.hypot(x - r.left, yy - r.top) > Math.max(w, h) * 1.2) best = [x, yy];
  }
  if (!best) best = [Math.min(maxX, r.left + w * 1.5), Math.min(maxY, r.top + h * 1.6)];
  setNo(best[0] - bx, best[1] - by);
  clearTimeout(noTimer);
  noTimer = setTimeout(resetNo, NO_RETURN_MS);  // every touch restarts the 5s timer
}
["pointerenter", "pointerdown"].forEach((ev) =>
  noBtn.addEventListener(ev, (e) => { if (yesno.classList.contains("show")) { e.preventDefault(); escapeNo(); } }));
noBtn.addEventListener("click", (e) => e.preventDefault());

/* ---------- Animated background layers (pages 1-2) ---------- */
const rnd = (a, b) => a + Math.random() * (b - a);
function buildFx(el, clouds) {
  const add = (cls, txt, css) => { const d = document.createElement("div"); d.className = cls; if (txt) d.textContent = txt; d.style.cssText = css; el.appendChild(d); };
  clouds.forEach((y, i) => add("cloud", "", `top:${y}%;animation-duration:${55 + i * 15}s;animation-delay:-${i * 23}s;opacity:${0.35 + (i % 2) * 0.15}`));
  for (let i = 0; i < 12; i++) add("spark", "✦", `left:${rnd(3, 95)}%;top:${rnd(3, 95)}%;font-size:${rnd(2, 3.6)}cqw;animation-duration:${rnd(2.5, 5)}s;animation-delay:-${rnd(0, 5)}s`);
  for (let i = 0; i < 9; i++) add("pt", i % 2 ? "♥" : "•", `left:${rnd(3, 95)}%;font-size:${rnd(1.6, 3)}cqw;animation-duration:${rnd(11, 18)}s;animation-delay:-${rnd(0, 15)}s`);
}
document.querySelectorAll(".fx").forEach((el) => buildFx(el, el.dataset.fx === "1" ? [62, 74, 90] : [66, 76, 95]));

addEventListener("resize", () => {
  if (letter.textContent) fitLetter();
  resetNo();
});

/* ---------- Page 5 ---------- */
const HEARTS = ["💗", "💕", "🩷", "♥", "💖"], SPARK = ["✨", "⭐", "💫"];
function drop(list) {
  const box = $("#hearts");
  if (box.childElementCount > 70) return;
  const s = document.createElement("span");
  s.textContent = list[Math.floor(Math.random() * list.length)];
  const dur = 5 + Math.random() * 6;
  s.style.cssText = `left:${Math.random() * 100}%;font-size:${10 + Math.random() * 26}px;animation-duration:${dur}s;opacity:${0.6 + Math.random() * 0.4}`;
  s.addEventListener("animationend", () => s.remove());
  box.appendChild(s);
}
function enter5() {
  $("#msg5").textContent = PAGE5_MESSAGE;
  const box = $("#hearts"); box.replaceChildren();
  for (let i = 0; i < 26; i++) {                       // celebration burst
    const s = document.createElement("span"); s.className = "burst";
    s.textContent = ["💕", "✨", "💗", "✨", "💕"][i % 5];
    const a = (i / 26) * Math.PI * 2, r = 25 + Math.random() * 30;
    s.style.cssText = `--x:${Math.cos(a) * r}vmin;--y:${Math.sin(a) * r}vmin;font-size:${18 + Math.random() * 18}px`;
    s.addEventListener("animationend", () => s.remove());
    box.appendChild(s);
  }
  every(() => drop(HEARTS), 280);
  every(() => drop(SPARK), 600);
}
const couple = $("#couple");
couple.addEventListener("load", () => $(".photo").classList.add("has"));
couple.addEventListener("error", () => { couple.style.display = "none"; });

/* ---------- Boot ---------- */
const h = parseInt(location.hash.slice(1), 10);
go(h >= 2 && h <= 5 ? h : 1);
