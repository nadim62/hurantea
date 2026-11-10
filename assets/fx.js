// HURANTEA FX: collapsing menu bar (☰ when scrolled) and real 3D hover effects on text.
(function () {
  const root = document.documentElement;
  const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches || root.dataset.motion === "off";
  const fine = matchMedia("(hover: hover) and (pointer: fine)");

  // ---------- 1. menu bar hides on scroll; a floating ☰ opens a full-screen menu ----------
  const fab = document.getElementById("menuFab"), ov = document.getElementById("menuOverlay"), x = document.getElementById("menuX");
  let open = false, lastFocus = null;
  const onScroll = () => document.body.classList.toggle("nav-min", scrollY > 140 && !open);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const focusables = () => [...ov.querySelectorAll("a, button")].filter((e) => e.offsetParent !== null);
  function show(v) {
    open = v; fab.setAttribute("aria-expanded", String(v));
    if (v) { lastFocus = document.activeElement; ov.hidden = false; requestAnimationFrame(() => ov.classList.add("on")); document.body.classList.add("mo-open");
      const r = document.body.dataset.route || "home"; ov.querySelectorAll("[data-r]").forEach((a) => a.classList.toggle("on", a.dataset.r === r));
      setTimeout(() => (focusables()[1] || x).focus(), 60); }
    else { ov.classList.remove("on"); document.body.classList.remove("mo-open"); setTimeout(() => { if (!open) ov.hidden = true; }, 420); (lastFocus && lastFocus.focus ? lastFocus : fab).focus(); }
    onScroll();
  }
  if (fab && ov) {
    fab.onclick = () => show(!open); x.onclick = () => show(false);
    ov.addEventListener("click", (e) => { if (e.target.closest("a, #menuTitle")) show(false); else if (!e.target.closest("button, .bbar, .bbar-wrap, input, select")) show(false); });   // any empty spot closes it
    document.getElementById("menuSettings").onclick = () => { show(false); scrollTo({ top: 0, behavior: "smooth" }); setTimeout(() => document.getElementById("themeBtn")?.click(), 500); };
    document.addEventListener("keydown", (e) => {
      if (!open) return;
      if (e.key === "Escape") { e.preventDefault(); show(false); }
      if (e.key === "Tab") { const f = focusables(); const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
    });
    addEventListener("hashchange", () => open && show(false));
  }

  // ---------- 2. headlines: letters rise toward you in 3D near the pointer ----------
  // Only for Latin scripts: Arabic, Bengali, Devanagari, Urdu and Chinese must never be split into letters
  // (that breaks how the script joins). Those get a whole-line 3D lift instead (CSS).
  const LATIN = () => /^(en|es|fr|pt|id|de|it|nl|pl|tr|ms|sw|vi)$/.test(root.lang || "en");
  const SEL = ".os-title, .section-head h2, .sstep h2, .page-head h1, .legal h1, .tile h3, .faq-grid h2, .mo-t";
  function split(el) {
    if (el.dataset.fx || !LATIN()) return; const txt = el.textContent.trim(); if (!txt || txt.length > 90) return;
    el.dataset.fx = "1"; el.setAttribute("aria-label", (el.innerText || txt).replace(/\s+/g, " ").trim());
    const walk = (node) => {
      [...node.childNodes].forEach((c) => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.nodeValue.split(/(\s+)/).forEach((w) => {
            if (!w) return; if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            const ws = document.createElement("span"); ws.className = "fx-w"; ws.setAttribute("aria-hidden", "true");
            const seg = window.Intl && Intl.Segmenter ? [...new Intl.Segmenter(root.lang || "en", { granularity: "grapheme" }).segment(w)].map((g) => g.segment) : [...w];
            for (const ch of seg) { const s = document.createElement("span"); s.className = "fx-l"; s.textContent = ch; ws.appendChild(s); }
            frag.appendChild(ws);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && c.tagName !== "BR") walk(c);
      });
    };
    walk(el); el.classList.add("fx-split");
  }
  let raf = 0, px = 0, py = 0, hot = null;
  function paint() {
    raf = 0; if (!hot) return;
    hot.querySelectorAll(".fx-l").forEach((l) => {
      const r = l.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const d = Math.hypot(px - cx, (py - cy) * 1.4), k = Math.max(0, 1 - d / 150), e = k * k * (3 - 2 * k);
      if (e < .01) { if (l.style.transform) { l.style.transform = ""; l.style.textShadow = ""; } return; }
      const dx = (px - cx) / 150;
      l.style.transform = `translate3d(0, ${(-e * 14).toFixed(1)}px, ${(e * 70).toFixed(0)}px) rotateX(${(e * 28).toFixed(1)}deg) rotateY(${(dx * e * -30).toFixed(1)}deg)`;
      l.style.textShadow = `0 ${(e * 10).toFixed(0)}px ${(e * 22).toFixed(0)}px rgba(0,0,0,.75), 0 0 ${(e * 26).toFixed(0)}px rgba(255,255,255,${(e * .55).toFixed(2)})`;
    });
  }
  function relax(el) { el && el.querySelectorAll(".fx-l").forEach((l) => { l.style.transform = ""; l.style.textShadow = ""; }); }
  addEventListener("pointermove", (e) => {
    if (!fine.matches || still()) return;
    const h = e.target.closest && e.target.closest(".fx-split");
    if (hot && hot !== h) { relax(hot); hot = null; }
    if (!h) return; hot = h; px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(paint);
  }, { passive: true });
  document.addEventListener("pointerleave", () => { relax(hot); hot = null; });
  const scan = () => { if (!fine.matches) return; document.querySelectorAll(SEL).forEach(split); };
  const app = document.getElementById("app");
  if (app) new MutationObserver(() => requestAnimationFrame(scan)).observe(app, { childList: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(scan, 300)); else setTimeout(scan, 300);

  // ---------- 3. a light that follows the pointer across any text block (sets --mx/--my for CSS) ----------
  addEventListener("pointermove", (e) => {
    if (!fine.matches || still()) return;
    const t = e.target.closest && e.target.closest("p, li, .lead, summary, label, .muted, .scard, .tile, details");
    if (!t) return; const r = t.getBoundingClientRect();
    t.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%"); t.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
  }, { passive: true });
  window.NFx = { scan };
})();
