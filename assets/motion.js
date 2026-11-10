// HURANTEA micro-interactions: kinetic headline, scroll reveals, magnetic buttons,
// cursor light on cards, soft 3D tilt. All off with prefers-reduced-motion.
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off";
  const fine = matchMedia("(pointer: fine)").matches;

  // Kinetic word in the hero headline
  let rotTimer = 0;
  function kinetic() {
    clearInterval(rotTimer);
    const el = document.querySelector("[data-rotate]"); if (!el) return;
    const words = el.dataset.rotate.split("|"); let i = 0;
    if (reduce) return;
    rotTimer = setInterval(() => {
      if (!document.body.contains(el)) return clearInterval(rotTimer);
      el.classList.add("out");
      setTimeout(() => { i = (i + 1) % words.length; el.textContent = words[i]; el.classList.remove("out"); el.classList.add("in"); setTimeout(() => el.classList.remove("in"), 450); }, 320);
    }, 2300);
  }

  // Scroll reveals
  let io;
  function reveals() {
    const els = document.querySelectorAll(".reveal:not(.shown)");
    if (reduce || !("IntersectionObserver" in window)) { document.documentElement.classList.remove("js-reveal"); els.forEach((e) => e.classList.add("shown")); return; }
    io = io || new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("shown"); io.unobserve(en.target); } }), { threshold: 0, rootMargin: "0px 0px 12% 0px" });
    els.forEach((e, k) => { e.style.transitionDelay = (e.dataset.delay || 0) + "ms"; io.observe(e); });
    if (!window._revealSweep) { window._revealSweep = true; addEventListener("scroll", () => { document.querySelectorAll(".reveal:not(.shown)").forEach((e) => { if (e.getBoundingClientRect().top < innerHeight * 1.1) { e.style.transitionDelay = "0ms"; e.classList.add("shown"); } }); }, { passive: true }); }
  }

  // Story path for "How it works": the glowing line fills as you scroll
  function storyPath() {
    const sec = document.querySelector(".story"); if (!sec) return;
    const upd = () => { const r = sec.getBoundingClientRect(); const p = Math.max(0, Math.min(1, (innerHeight * 0.75 - r.top) / (r.height * 0.9)));
      sec.style.setProperty("--story", p.toFixed(3)); };
    upd(); addEventListener("scroll", upd, { passive: true });
  }

  // Pointer effects (desktop only)
  if (fine && !reduce) {
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest?.(".card");
      if (card) { const r = card.getBoundingClientRect(); card.style.setProperty("--mx", e.clientX - r.left + "px"); card.style.setProperty("--my", e.clientY - r.top + "px"); }
      const mag = e.target.closest?.(".magnet");
      document.querySelectorAll(".magnet").forEach((b) => { if (b !== mag) b.style.transform = ""; });
      if (mag) { const r = mag.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        mag.style.transform = `translate(${dx * 0.07}px, ${dy * 0.12}px)`; }
      const tilt = e.target.closest?.(".tilt");
      if (tilt) { const r = tilt.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.transform = `perspective(900px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`; }
    }, { passive: true });
    document.addEventListener("pointerout", (e) => {
      const t = e.target.closest?.(".tilt"); if (t && !t.contains(e.relatedTarget)) t.style.transform = "";
      const m = e.target.closest?.(".magnet"); if (m && !m.contains(e.relatedTarget)) m.style.transform = "";
    });
  }

  function run() { kinetic(); reveals(); storyPath(); }
  window.NMotion = { run };
  addEventListener("hashchange", () => setTimeout(run, 30));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(run, 30)); else setTimeout(run, 30);
})();
