// HURANTEA "Mission Control" HUD — a film-style instrument frame over the living cosmos.
// Decorative only: aria-hidden, pointer-events none. Real data only (clock, scroll); object labels describe the background scene.
(function () {
  const root = document.documentElement;
  const OBJ = () => (window.NCosmos && NCosmos.CH ? NCosmos.CH : [{ k: "01", n: "Proton", s: "10⁻¹⁵ m", c: "" }]);
  const tr = (s) => (window.N && N.t ? N.t(s) : s);
  const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches || root.dataset.motion === "off";
  let hud, ret, lbl, clock, rule, ra, scene = 0;

  function mount() {
    hud = document.createElement("div"); hud.className = "hud"; hud.setAttribute("aria-hidden", "true"); hud.setAttribute("data-no-i18n", "");
    hud.innerHTML = `
      <div class="hud-grid"></div><div class="hud-noise"></div>
      <i class="hud-c tl"></i><i class="hud-c tr"></i><i class="hud-c bl"></i><i class="hud-c br"></i>
      <div class="hud-rule"><i data-v="000"></i></div>
      <div class="hud-bl"><span>SYS <b>HURANTEA</b></span><span>UTC <b class="hud-clock">--:--:--</b></span><span>BASE <b>25.20N 55.27E</b></span></div>
      <div class="hud-br hud-only-space"><span class="hud-scene"></span></div>
      <div class="hud-ret hud-only-space"><svg viewBox="0 0 340 340" fill="none" stroke="currentColor">
        <g class="r1" opacity=".55"><circle cx="170" cy="170" r="150" stroke-dasharray="2 7"/><path d="M170 8v22M170 310v22M8 170h22M310 170h22" /></g>
        <g class="r2" opacity=".8"><path d="M170 40a130 130 0 0 1 112 64" /><path d="M170 300a130 130 0 0 1-112-64" /></g>
        <g opacity=".9"><path d="M60 60h18M60 60v18M280 60h-18M280 60v18M60 280h18M60 280v-18M280 280h-18M280 280v-18"/></g>
      </svg><div class="lbl"><span class="k"></span><b class="n"></b><span class="d"></span></div></div>`;
    document.body.appendChild(hud);
    ret = hud.querySelector(".hud-ret"); lbl = hud.querySelector(".lbl"); clock = hud.querySelector(".hud-clock"); rule = hud.querySelector(".hud-rule i");
    addEventListener("cosmos-scene", (e) => { scene = e.detail.i; label(true); });
    addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", place);
    addEventListener("hashchange", () => setTimeout(place, 60));
    new MutationObserver(() => { sync(); }).observe(root, { attributes: true, attributeFilter: ["data-theme", "data-motion"] });
    sync(); label(false); onScroll(); tick(); setInterval(tick, 1000);
  }
  function sync() {
    const c = window.NCosmos && NCosmos.center; const on = !!(c && c.on);
    hud.classList.toggle("space", on); place();
  }
  function place() {
    const c = window.NCosmos && NCosmos.center; if (!c || !ret) return;
    const off = scrollY > innerHeight * .55 || (document.body.dataset.route || "home") !== "home";
    hud.classList.toggle("off", off);
    ret.style.left = c.x * innerWidth + "px"; ret.style.top = c.y * innerHeight + "px";
  }
  function label(lock) {
    const L = OBJ(), o = L[scene] || L[0];
    lbl.querySelector(".k").textContent = `${o.a || ""} · ${o.k} / ${String(L.length).padStart(2, "0")} · ${o.s}`;
    decode(lbl.querySelector(".n"), tr(o.n)); lbl.querySelector(".d").textContent = tr(o.c) + (o.v ? " · " + tr(o.v) : "");
    hud.querySelector(".hud-scene").innerHTML = `${o.k} / ${String(L.length).padStart(2, "0")} · <b>${tr(o.n)}</b> · ${o.s}`;
    if (lock && !still()) { ret.classList.remove("lock"); void ret.offsetWidth; ret.classList.add("lock"); }
  }
  function tick() {
    const d = new Date(); clock.textContent = d.toISOString().slice(11, 19);
  }
  function onScroll() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight), p = Math.min(1, scrollY / max);
    rule.style.setProperty("--sp", (p * 100).toFixed(1) + "%"); rule.style.top = (p * 100).toFixed(1) + "%";
    rule.dataset.v = String(Math.round(p * 100)).padStart(3, "0"); place();
  }

  // ----- terminal "decode" for headlines (Latin scripts only, so translations are never touched) -----
  const GLYPH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_#*+";
  function decode(el, text) {
    if (!el) return;
    if (still() || !/^(en|es|fr|pt|id)$/.test(root.lang || "en")) { el.textContent = text; return; }
    const t0 = performance.now(), dur = Math.min(900, 220 + text.length * 28);
    const step = (now) => { const k = Math.min(1, (now - t0) / dur), n = Math.floor(text.length * k);
      el.textContent = text.slice(0, n) + [...text.slice(n)].map((ch) => (ch === " " ? " " : GLYPH[(Math.random() * GLYPH.length) | 0])).join("");
      if (k < 1) requestAnimationFrame(step); else el.textContent = text; };
    requestAnimationFrame(step);
  }
  // headlines: decode each text node once when it first appears (English only; leaves markup intact)
  function decodeHeads(scope) {
    if (still() || (root.lang || "en") !== "en") return;
    scope.querySelectorAll(".os-title, .section-head h2, .sstep h2, .page-head h1").forEach((h) => {
      if (h.dataset.decoded) return; h.dataset.decoded = "1";
      const io = new IntersectionObserver((es) => { if (!es[0].isIntersecting) return; io.disconnect();
        const nodes = []; const w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT); while (w.nextNode()) if (w.currentNode.nodeValue.trim()) nodes.push(w.currentNode);
        nodes.forEach((nd, i) => { const txt = nd.nodeValue; const span = { set textContent(v) { nd.nodeValue = v; } };
          setTimeout(() => decode(span, txt), i * 140); });
      }); io.observe(h);
    });
  }

  // panels lean toward the pointer (not forms: they stay still while typing)
  let tiltEl = null;
  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || still()) return;
    const el = e.target.closest && e.target.closest(".card, details, .tile");
    if (tiltEl && tiltEl !== el) { tiltEl.classList.remove("tilt"); tiltEl.style.removeProperty("--rx"); tiltEl.style.removeProperty("--ry"); tiltEl = null; }
    if (!el || el.querySelector("input, textarea, select") || el.closest(".menu, .modal")) return;
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.style.setProperty("--ry", (x * 7).toFixed(2) + "deg"); el.style.setProperty("--rx", (-y * 6).toFixed(2) + "deg"); el.classList.add("tilt"); tiltEl = el;
  }, { passive: true });
  const app = () => document.getElementById("app");
  function boot() {
    mount();
    setTimeout(sync, 400); setTimeout(sync, 1500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.NHud = { sync, place };
})();
