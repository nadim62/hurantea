// Android-style brightness bar. Drag or tap anywhere along the bar; arrows / PageUp / PageDown / Home / End on the keyboard.
// 10–100 %: dims like a phone. The background scene dims strongly, the whole screen gently, so text stays readable (DIAG-014).
(function () {
  const root = document.documentElement, KEY = "hurantea-bright", MIN = 10, MAX = 100, DEF = 50;
  const tr = (s) => (window.N && N.t ? N.t(s) : s);
  const get = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return typeof v === "number" && isFinite(v) ? Math.max(MIN, Math.min(MAX, v)) : DEF; } catch { return DEF; } };   // nothing saved = 50 % (owner's choice)
  let level = get();
  function apply(v, save) {
    level = Math.max(MIN, Math.min(MAX, Math.round(v)));
    const k = (100 - level) / 100;   // same formulas as the first-paint script in <head>
    root.style.setProperty("--dim", (k * .35).toFixed(3));          // whole screen, gently — text keeps its contrast
    root.style.setProperty("--scene-dim", (k * .85).toFixed(3));    // the living background and the AI Core, strongly
    if (save) { try { localStorage.setItem(KEY, JSON.stringify(level)); } catch {} }
    document.querySelectorAll(".bbar").forEach(paint);
    dispatchEvent(new Event("hurantea-bright"));
  }
  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  function paint(bar) {
    const p = (level - MIN) / (MAX - MIN) * 100;
    bar.style.setProperty("--p", p.toFixed(1) + "%"); bar.style.setProperty("--b", p.toFixed(1) + "%");
    bar.setAttribute("aria-valuenow", String(level)); bar.setAttribute("aria-valuetext", level + "%");
    const o = bar.querySelector(".bbar-v"); if (o) o.textContent = level + "%";
    
  }
  function make() {
    const wrap = document.createElement("div"); wrap.className = "bbar-wrap";
    wrap.innerHTML = `<div class="bbar" role="slider" tabindex="0" aria-label="${tr("Brightness")}" aria-valuemin="${MIN}" aria-valuemax="${MAX}">
        <span class="bbar-fill"></span><span class="bbar-ic">${SUN}</span><span class="bbar-v" data-no-i18n></span></div>
      <button type="button" class="bbar-reset" aria-label="${tr("Reset")}" title="${tr("Reset")}">↺</button>`;
    const bar = wrap.querySelector(".bbar"); let drag = false;
    const at = (x) => { const r = bar.getBoundingClientRect(); let f = (x - r.left) / r.width; if (root.dir === "rtl") f = 1 - f; apply(MIN + Math.max(0, Math.min(1, f)) * (MAX - MIN), true); };
    bar.addEventListener("pointerdown", (e) => { drag = true; bar.setPointerCapture(e.pointerId); bar.classList.add("drag", "active"); at(e.clientX); e.preventDefault(); });
    bar.addEventListener("pointermove", (e) => { if (drag) at(e.clientX); });
    const end = () => { drag = false; bar.classList.remove("drag", "active"); };
    bar.addEventListener("pointerup", end); bar.addEventListener("pointercancel", end);
    bar.addEventListener("keydown", (e) => {
      const step = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5, PageUp: 20, PageDown: -20 }[e.key];
      if (step) { e.preventDefault(); apply(level + (root.dir === "rtl" && /Left|Right/.test(e.key) ? -step : step), true); }
      else if (e.key === "Home") { e.preventDefault(); apply(MIN, true); } else if (e.key === "End") { e.preventDefault(); apply(MAX, true); }
    });
    wrap.querySelector(".bbar-reset").onclick = () => apply(DEF, true);
    paint(bar); return wrap;
  }
  function mount() { document.querySelectorAll(":is(.bbar-host, [data-bright-bar]):not([data-on])").forEach((h) => { h.dataset.on = "1"; h.appendChild(make()); }); }
  apply(level, false);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
  new MutationObserver(mount).observe(document.documentElement, { childList: true, subtree: true });
  window.NBright = { set: (v) => apply(v, true), get: () => level, mount };
})();
