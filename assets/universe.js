// HURANTEA "living universe" for the Glass theme:
// slow camera drift over the space image, mouse/tilt parallax, twinkling stars,
// and occasional shooting stars. Pauses when the tab is hidden; respects reduced motion.
(function () {
  const root = document.documentElement;
  let layer, canvas, ctx, raf = 0, stars = [], shooters = [], w = 0, h = 0, dpr = 1, last = 0, nextShot = 0;
  let mx = 0, my = 0, px = 0, py = 0, mode = "space", bokeh = [];
  const darkMQ = matchMedia("(prefers-color-scheme: dark)");
  const effective = () => { const t = root.dataset.theme || "auto"; return t === "glass" ? "glass" : "dark"; };   // every theme keeps the living cosmos
  const reduceMQ = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let reduce = reduceMQ || root.dataset.motion === "off";

  function build() {
    if (layer) return;
    layer = document.createElement("div");
    layer.className = "universe";
    layer.innerHTML = '<div class="universe-img"></div><canvas class="universe-fx"></canvas>';
    document.body.prepend(layer);
    canvas = layer.querySelector("canvas");
    ctx = canvas.getContext("2d");
    addEventListener("resize", size);
    addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
    addEventListener("deviceorientation", (e) => { if (e.gamma != null) { mx = Math.max(-0.5, Math.min(0.5, e.gamma / 60)); my = Math.max(-0.5, Math.min(0.5, (e.beta - 40) / 60)); } }, { passive: true });
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    size();
  }

  function size() {
    dpr = Math.min(2, devicePixelRatio || 1);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round((w * h) / (w < 700 ? 12000 : 9000));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() ** 3 * 1.6 + 0.3,
      base: Math.random() * 0.5 + 0.15,
      sp: Math.random() * 1.6 + 0.4, ph: Math.random() * 6.28,
      depth: Math.random() * 0.8 + 0.2,
      hue: [210, 220, 0, 45, 30][Math.floor(Math.random() * 5)],
    }));
    const cols = ["167,139,250", "94,234,212", "251,182,206", "147,197,253", "253,224,170"];
    bokeh = Array.from({ length: Math.round((w * h) / 26000) + 12 }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: 6 + Math.random() ** 2 * 46,
      a: 0.10 + Math.random() * 0.22, vy: -(4 + Math.random() * 14), sw: Math.random() * 6.28, ss: 0.2 + Math.random() * 0.5,
      c: cols[Math.floor(Math.random() * cols.length)], depth: Math.random() * 0.8 + 0.2,
    }));
  }


  // ---- "Universe of skills": cursor links nearby stars; AI match draws a constellation job -> expert ----
  const SKILLS = ["Website fix", "Logo design", "Mobile app", "Translation", "Video edit", "Excel report", "SEO", "Social media", "Data entry", "UI design"];
  let match = null, nextMatch = 0, hasPointer = matchMedia("(pointer: fine)").matches, cx = -999, cy = -999;
  addEventListener("pointermove", (e) => { cx = e.clientX; cy = e.clientY; }, { passive: true });
  addEventListener("pointerleave", () => { cx = cy = -999; });
  let rrT = 0; addEventListener("scroll", () => { if (match) match.fade = true; clearTimeout(rrT); rrT = setTimeout(readRects, 120); }, { passive: true }); setTimeout(readRects, 400);
  // keep the story away from text, cards and buttons so the page stays readable
  let rects = [];
  function readRects() {
    rects = [...document.querySelectorAll("h1,h2,h3,p,li,.card,.btn,.nav,.pill,.checks,label,input,textarea,select,table,details,footer .wrap")]
      .map((e) => e.getBoundingClientRect()).filter((r) => r.bottom > 0 && r.top < h && r.width > 0)
      .map((r) => ({ l: r.left - 26, t: r.top - 26, r: r.right + 26, b: r.bottom + 26 }));
  }
  const blocked = (x, y) => y < 80 || x < 10 || x > w - 10 || y > h - 10 || rects.some((r) => x > r.l && x < r.r && y > r.t && y < r.b);
  const segFree = (a, b) => { for (let k = 1; k < 8; k++) { const f = k / 8; if (blocked(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f)) return false; } return true; };
  function pickNear(cur, maxD) {
    let best = null, bd = 1e9;
    for (let i = 0; i < stars.length; i++) { const s = stars[i]; if (s === cur) continue;
      const d = Math.hypot(s.x - cur.x, s.y - cur.y); if (d < 70 || d > maxD) continue;
      const score = d + Math.random() * 90; if (score < bd && !blocked(s.x, s.y) && segFree(cur, s)) { bd = score; best = s; } }
    return best;
  }
  function newMatch(t) {
    { nextMatch = t + 1e9; return; }  // retired: the AI Core tells the matching story   // the AI Core tells the story on the homepage
    if (w < 700) { nextMatch = t + 1e9; return; }   // phones: keep it calm
    readRects();
    const free = stars.filter((s) => !blocked(s.x, s.y) && !blocked(s.x + 150, s.y - 12));
    const a = free[Math.floor(Math.random() * free.length)];
    if (!a) { nextMatch = t + 2500; return; }
    const path = [a]; let cur = a;
    for (let k = 0; k < 3; k++) { const n = pickNear(cur, 230); if (n) { path.push(n); cur = n; } }
    if (path.length < 3) { nextMatch = t + 500; return; }
    match = { path, t0: t, skill: SKILLS[Math.floor(Math.random() * SKILLS.length)] };
    nextMatch = t + 7000 + Math.random() * 4000;
  }
  function drawConstellation(t, light) {
    const ink = light ? "79,70,229" : "190,205,255", ok = light ? "13,148,136" : "94,234,212";
    const off = (s) => [s.x - px * 30 * s.depth, s.y - py * 30 * s.depth];
    // cursor constellation
    if (false && hasPointer && cx > 0 && !rects.some((r) => cx > r.l + 26 && cx < r.r - 26 && cy > r.t + 26 && cy < r.b - 26)) {
      const near = [];
      for (const s of stars) { const [x, y] = off(s); const d = Math.hypot(x - cx, y - cy); if (d < 170) near.push([x, y, d]); }
      near.sort((a, b) => a[2] - b[2]); const pts = near.slice(0, 6);
      ctx.lineWidth = 0.8;
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]); if (d > 150) continue;
        ctx.strokeStyle = `rgba(${ink},${(1 - d / 150) * 0.35 * (1 - pts[i][2] / 170)})`;
        ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke();
      }
    }
    // AI match story
    if (!nextMatch) nextMatch = t + 1800;
    if (!match && t > nextMatch) newMatch(t);
    if (!match) return;
    const age = (t - match.t0) / 1000, P = match.path.map(off), segs = P.length - 1;
    const prog = Math.min(segs, age / 0.55); if (match.fade && !match.fadeAt) match.fadeAt = age;
    let fadeOut = age > segs * 0.55 + 2.2 ? Math.max(0, 1 - (age - segs * 0.55 - 2.2) / 0.8) : 1;
    if (match.fadeAt) fadeOut = Math.min(fadeOut, Math.max(0, 1 - (age - match.fadeAt) / 0.35));
    if (fadeOut <= 0) { match = null; return; }
    ctx.lineWidth = 1.3; ctx.lineCap = "round";
    for (let i = 0; i < segs; i++) {
      const f = Math.max(0, Math.min(1, prog - i)); if (!f) break;
      const [x1, y1] = P[i], [x2, y2] = P[i + 1];
      const g = ctx.createLinearGradient(x1, y1, x2, y2);
      g.addColorStop(0, `rgba(${ink},${0.75 * fadeOut})`); g.addColorStop(1, `rgba(${ok},${0.75 * fadeOut})`);
      ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + (x2 - x1) * f, y1 + (y2 - y1) * f); ctx.stroke();
    }
    const ring = (x, y, col, r, a) => { ctx.strokeStyle = `rgba(${col},${a})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.stroke();
      ctx.fillStyle = `rgba(${col},${a})`; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 6.283); ctx.fill(); };
    const pulse = 6 + Math.sin(age * 5) * 2;
    ring(P[0][0], P[0][1], ink, pulse, 0.9 * fadeOut);
    ctx.font = "600 11px ui-sans-serif, -apple-system, Segoe UI, sans-serif"; ctx.textBaseline = "middle";
    const T = (s) => (window.N?.t ? N.t(s) : s); const fit = (x, txt) => Math.min(Math.max(8, x + 12), w - ctx.measureText(txt).width - 8);
    const l1 = T("Example") + " · " + T(match.skill);
    ctx.fillStyle = `rgba(${ink},${0.85 * fadeOut})`; ctx.fillText(l1, fit(P[0][0], l1), P[0][1] - 12);
    if (prog >= segs) { const e = P[segs]; ring(e[0], e[1], ok, 7 + Math.min(1, age - segs * 0.55) * 4, fadeOut);
      const l2 = T("Expert matched ✓"); ctx.fillStyle = `rgba(${ok},${fadeOut})`; ctx.fillText(l2, fit(e[0], l2), e[1] - 12); }
  }

  function shoot(t) {
    const fromLeft = Math.random() < 0.5;
    const ang = (fromLeft ? 0.35 : Math.PI - 0.35) + (Math.random() - 0.5) * 0.3;
    shooters.push({ x: fromLeft ? Math.random() * w * 0.6 : w * 0.4 + Math.random() * w * 0.6, y: Math.random() * h * 0.45,
      vx: Math.cos(ang) * (700 + Math.random() * 500), vy: Math.sin(ang) * (700 + Math.random() * 500), life: 0, max: 0.9 + Math.random() * 0.6 });
    nextShot = t + 9000 + Math.random() * 9000;
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
    px += (mx - px) * 0.04; py += (my - py) * 0.04;
    layer.style.setProperty("--px", px.toFixed(4)); layer.style.setProperty("--py", py.toFixed(4));
    ctx.clearRect(0, 0, w, h);
    const s = t / 1000;
    if (mode === "light") { lightFrame(s, dt, t); drawConstellation(t, true); return; }
    const cosmos = layer.classList.contains("has-cosmos");
    for (const st of (cosmos ? [] : stars)) {
      const a = st.base + Math.sin(s * st.sp + st.ph) * 0.35 * st.base + (Math.sin(s * st.sp * 3.1 + st.ph) > 0.97 ? 0.5 : 0);
      const x = st.x - px * 30 * st.depth, y = st.y - py * 30 * st.depth;
      ctx.globalAlpha = Math.max(0, Math.min(1, a));
      ctx.fillStyle = st.hue === 0 ? "#fff" : `hsl(${st.hue},80%,85%)`;
      ctx.beginPath(); ctx.arc(x, y, st.r, 0, 6.283); ctx.fill();
      if (st.r > 1.3) { ctx.globalAlpha *= 0.25; ctx.beginPath(); ctx.arc(x, y, st.r * 3.2, 0, 6.283); ctx.fill(); }
    }
    if (!nextShot) nextShot = t + 2500;
    if (t > nextShot && !cosmos) shoot(t);   // no shooting-star streaks over the creation journey
    shooters = shooters.filter((m) => (m.life += dt) < m.max);
    for (const m of shooters) {
      m.x += m.vx * dt; m.y += m.vy * dt;
      const fade = Math.sin((m.life / m.max) * Math.PI);
      const tx = m.x - m.vx * 0.12, ty = m.y - m.vy * 0.12;
      const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
      g.addColorStop(0, `rgba(255,255,255,${0.95 * fade})`); g.addColorStop(1, "rgba(160,190,255,0)");
      ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.fillStyle = `rgba(255,255,255,${fade})`; ctx.beginPath(); ctx.arc(m.x, m.y, 1.4, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
    drawConstellation(t, false);
  }

  // Light mode: floating soft light orbs, tiny sparkles, a rare gentle light streak
  function lightFrame(s, dt, t) {
    for (const b of bokeh) {
      b.y += b.vy * dt; b.x += Math.sin(s * b.ss + b.sw) * 6 * dt;
      if (b.y < -b.r * 2) { b.y = h + b.r * 2; b.x = Math.random() * w; }
      const x = b.x - px * 40 * b.depth, y = b.y - py * 40 * b.depth;
      const g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
      const pulse = b.a * (0.8 + 0.2 * Math.sin(s * b.ss * 2 + b.sw));
      g.addColorStop(0, `rgba(${b.c},${pulse})`); g.addColorStop(0.6, `rgba(${b.c},${pulse * 0.45})`); g.addColorStop(1, `rgba(${b.c},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, b.r, 0, 6.283); ctx.fill();
    }
    for (let i = 0; i < stars.length; i += 3) {
      const st = stars[i]; const a = Math.max(0, Math.sin(s * st.sp + st.ph)) ** 6 * 0.9;
      if (a < 0.05) continue;
      const x = st.x - px * 30 * st.depth, y = st.y - py * 30 * st.depth, r = 1.2 + st.r;
      ctx.globalAlpha = a; ctx.strokeStyle = st.hue === 45 || st.hue === 30 ? "#d4a24c" : "#7c6cf0"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x - r * 2.2, y); ctx.lineTo(x + r * 2.2, y); ctx.moveTo(x, y - r * 2.2); ctx.lineTo(x, y + r * 2.2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (!nextShot) nextShot = t + 3500;
    if (t > nextShot) { shoot(t); nextShot = t + 9000 + Math.random() * 9000; }
    shooters = shooters.filter((m) => (m.life += dt) < m.max);
    for (const m of shooters) {
      m.x += m.vx * dt * 0.6; m.y += m.vy * dt * 0.6;
      const fade = Math.sin((m.life / m.max) * Math.PI), tx = m.x - m.vx * 0.16, ty = m.y - m.vy * 0.16;
      const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
      g.addColorStop(0, `rgba(124,108,240,${0.55 * fade})`); g.addColorStop(1, "rgba(94,234,212,0)");
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
    }
  }

  function start() { if (!raf && !reduce && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }
  function sync() {
    const e = effective(); mode = e === "light" ? "light" : "space";
    build(); layer.dataset.mode = e; shooters = []; nextShot = 0;
    stop(); start(); if (reduce) { frame(performance.now()); stop(); }
  }
  darkMQ.addEventListener?.("change", sync);
  new MutationObserver(() => { reduce = reduceMQ || root.dataset.motion === "off"; layer?.classList.toggle("still", reduce); sync(); }).observe(root, { attributes: true, attributeFilter: ["data-theme", "data-motion"] });
  const boot = () => (window.requestIdleCallback ? requestIdleCallback(sync, { timeout: 600 }) : setTimeout(sync, 200));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
