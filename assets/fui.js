// HURANTEA FUI layer — film-style interface on top of the Living Cosmos.
// Boot sequence · targeting reticle locked on the cosmic object · text decode · lock-on brackets · cursor reticle · console signal.
// Everything is decorative (aria-hidden), turns off with Motion Off / reduced motion, and only runs in the dark themes.
(function () {
  const root = document.documentElement, body = () => document.body;
  const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches || root.dataset.motion === "off";
  const dark = () => { const t = root.dataset.theme || "dark"; return t !== "light" && !(t === "auto" && !matchMedia("(prefers-color-scheme: dark)").matches); };
  const fine = matchMedia("(pointer: fine)").matches;
  const tr = (s) => (window.N && N.t ? N.t(s) : s);
  const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/<>[]#%+=";
  const TARGETS = [
    ["Black hole", "Event horizon", "Light bends around it"],
    ["Star birth", "Protostar", "A new star is forming"],
    ["Dying star", "Supernova remnant", "A pulsar is left behind"],
    ["Dying planet", "Atmosphere escaping", "Its sun has grown into a red giant"],
  ];

  // ---------- text decode (film "scramble to reveal") ----------
  function decode(el, dur = 700) {
    if (!el || el.dataset.decoded || still()) return; el.dataset.decoded = "1";
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const nodes = [];
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push([walker.currentNode, walker.currentNode.nodeValue]);
    if (!nodes.length || /[؀-ۿঀ-৿ऀ-ॿ一-鿿]/.test(el.textContent)) return;   // keep non-Latin scripts intact
    const t0 = performance.now();
    (function step(now) {
      const k = Math.min(1, (now - t0) / dur);
      for (const [n, s] of nodes) { const cut = Math.floor(s.length * k);
        n.nodeValue = s.slice(0, cut) + s.slice(cut).replace(/\S/g, () => (Math.random() < .5 ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : "·")).slice(0, s.length - cut); }
      if (k < 1) requestAnimationFrame(step); else for (const [n, s] of nodes) n.nodeValue = s;
    })(t0);
  }

  // ---------- boot sequence (once per visit) ----------
  function boot() {
    if (still() || !dark() || sessionStorage.getItem("nr-boot")) return;
    sessionStorage.setItem("nr-boot", "1");
    const lines = ["HURANTEA OS", tr("Linking AI Core"), tr("Loading 65 languages"), tr("Verifying expert network"), tr("Ready")];
    const el = document.createElement("div"); el.className = "fui-boot"; el.setAttribute("aria-hidden", "true");
    el.innerHTML = `<div class="fb-ring"></div><div class="fb-lines">${lines.map((l, i) => `<div class="fb-l" style="--i:${i}"><b>${String(i).padStart(2, "0")}</b> ${l}</div>`).join("")}</div><div class="fb-bar"><i></i></div>`;
    document.body.appendChild(el);
    const end = () => { el.classList.add("out"); setTimeout(() => el.remove(), 700); };
    el.addEventListener("click", end); setTimeout(end, 1900);
  }

  // ---------- targeting reticle locked onto the cosmic object ----------
  let ret, retScene = -1, raf = 0;
  function reticle() {
    ret = document.createElement("div"); ret.className = "fui-reticle"; ret.setAttribute("aria-hidden", "true");
    const ticks = Array.from({ length: 72 }, (_, i) => { const a = i * 5, L = i % 6 ? 6 : 14; return `<line x1="0" y1="-${200}" x2="0" y2="-${200 - L}" transform="rotate(${a})"/>`; }).join("");
    const deg = [0, 90, 180, 270].map((a) => `<text transform="rotate(${a}) translate(0,-214)">${String(a).padStart(3, "0")}</text>`).join("");
    ret.innerHTML = `<svg viewBox="-240 -240 480 480">
      <g class="r-ticks">${ticks}${deg}</g>
      <circle class="r-arc a1" r="168" pathLength="100"/><circle class="r-arc a2" r="150" pathLength="100"/>
      <g class="r-br"><path d="M-120 -96 v-24 h24"/><path d="M120 -96 v-24 h-24"/><path d="M-120 96 v24 h24"/><path d="M120 96 v24 h-24"/></g>
      <line class="r-sweep" x1="0" y1="0" x2="0" y2="-186"/></svg>
      <div class="r-tag"><span class="r-k">${tr("Target")}</span><b class="r-name"></b><span class="r-sub"></span><span class="r-note"></span></div>`;
    document.body.appendChild(ret);
  }
  function place() {
    if (!ret) return;
    const home = (body().dataset.route || "home") === "home", on = home && dark() && document.querySelector(".universe.has-cosmos");
    ret.style.display = on ? "" : "none"; if (!on) return;
    const phone = innerWidth < 900, c = phone ? [.62, .2] : [.72, .55];       // same centre as cosmos.js layout()
    const size = Math.min(innerWidth, innerHeight) * (phone ? .62 : .78);
    ret.style.left = c[0] * innerWidth + "px"; ret.style.top = (1 - c[1]) * innerHeight + "px"; ret.style.width = ret.style.height = size + "px";
    const s = window.NCosmos ? NCosmos.scene : 0;
    if (s !== retScene && s >= 0) { retScene = s; const T = TARGETS[s];
      ret.querySelector(".r-name").textContent = tr(T[0]); ret.querySelector(".r-sub").textContent = tr(T[1]); ret.querySelector(".r-note").textContent = tr(T[2]);
      ret.classList.remove("lock"); void ret.offsetWidth; ret.classList.add("lock"); decode(ret.querySelector(".r-tag"), 500); delete ret.querySelector(".r-tag").dataset.decoded; }
  }

  // ---------- cursor reticle + coordinates (mouse only) ----------
  let cur;
  function cursor() {
    if (!fine) return;
    cur = document.createElement("div"); cur.className = "fui-cursor"; cur.setAttribute("aria-hidden", "true");
    cur.innerHTML = `<i></i><span></span>`; document.body.appendChild(cur);
    let x = -99, y = -99, tx = -99, ty = -99;
    addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY;
      const hot = e.target.closest?.("a,button,[role=button],.chip,.node,label,select"); cur.classList.toggle("hot", !!hot);
      cur.classList.toggle("text", !!e.target.closest?.("input,textarea,[contenteditable]")); }, { passive: true });
    document.addEventListener("pointerleave", () => { tx = ty = -99; });
    (function loop() { x += (tx - x) * .35; y += (ty - y) * .35; cur.style.transform = `translate3d(${x}px,${y}px,0)`;
      cur.lastChild.textContent = `${String(Math.round(tx)).padStart(4, "0")} · ${String(Math.round(ty)).padStart(4, "0")}`; requestAnimationFrame(loop); })();
  }

  // ---------- lock-on brackets for cards and buttons ----------
  function brackets() {
    const lock = document.createElement("div"); lock.className = "fui-lock"; lock.setAttribute("aria-hidden", "true"); lock.innerHTML = "<i></i><i></i><i></i><i></i>"; document.body.appendChild(lock);
    let tgt = null;
    const show = (el) => { tgt = el; if (!el) { lock.classList.remove("on"); return; } const r = el.getBoundingClientRect();
      Object.assign(lock.style, { left: r.left - 6 + "px", top: r.top - 6 + "px", width: r.width + 12 + "px", height: r.height + 12 + "px" }); lock.classList.add("on"); };
    const SEL = ".card,.tile,.scard,.btn,.chip,.plan,.faq details";
    document.addEventListener("pointerover", (e) => { if (!dark() || still()) return show(null); show(e.target.closest?.(SEL) || null); });
    document.addEventListener("focusin", (e) => { if (dark() && e.target.matches?.(SEL)) show(e.target); });
    addEventListener("scroll", () => tgt && show(tgt), { passive: true });
  }

  // ---------- console signal: the command bar "listens" while you type ----------
  function signal() {
    const form = document.getElementById("cmd"); if (!form || form.querySelector(".fui-wave")) return;
    const c = document.createElement("canvas"); c.className = "fui-wave"; c.setAttribute("aria-hidden", "true"); form.appendChild(c);
    const g = c.getContext("2d"); let amp = .15, ph = 0;
    const ta = form.querySelector("textarea"); ta?.addEventListener("input", () => (amp = 1));
    (function loop() { if (!document.body.contains(c)) return; requestAnimationFrame(loop); if (still()) return;
      const w = (c.width = c.clientWidth * 2), h = (c.height = c.clientHeight * 2); g.clearRect(0, 0, w, h);
      amp += (.12 - amp) * .03; ph += .08; g.lineWidth = 2; g.strokeStyle = "rgba(94,232,255,.55)"; g.beginPath();
      for (let x = 0; x <= w; x += 4) { const k = x / w, env = Math.sin(k * Math.PI); const y = h / 2 + Math.sin(k * 26 + ph) * Math.sin(k * 7 - ph * .6) * env * amp * h * .42; x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke(); })();
  }

  // ---------- route hooks ----------
  function onRoute() {
    document.querySelectorAll("#app h1, #app h2, .cmd-label, .eyebrow, .kicker").forEach((el) => {
      if (el.dataset.decoded) return;
      const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { decode(el, el.tagName === "H1" ? 900 : 650); io.disconnect(); } }); io.observe(el); });
    signal(); place();
  }
  function start() {
    root.classList.add("fui");
    boot(); reticle(); cursor(); brackets(); onRoute();
    const app = document.getElementById("app") || document.body;
    new MutationObserver(() => { clearTimeout(start.t); start.t = setTimeout(onRoute, 60); }).observe(app, { childList: true });
    addEventListener("resize", place);
    (function tick() { place(); setTimeout(tick, 400); })();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  window.NFui = { decode };
})();
