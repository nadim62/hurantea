// HURANTEA first-visit notice: Terms of Use + Privacy Policy. Stays until the visitor accepts; remembered on this device.
(function () {
  const KEY = "hurantea-consent", VERSION = "2026-11";
  try { if (localStorage.getItem(KEY) === VERSION) return; } catch (e) {}
  const N = window.N || {}, t = (s) => (N.t ? N.t(s) : s);
  const css = document.createElement("style");
  css.textContent = `
  .hc-bar{position:fixed;left:12px;right:12px;bottom:12px;z-index:70;max-width:860px;margin:0 auto;display:flex;gap:14px;align-items:center;flex-wrap:wrap;padding:14px 16px;background:#080909;border:1px solid rgba(198,161,91,.55);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.65);color:#EDE7DB;font-size:.9rem;line-height:1.45}
  .hc-text{flex:1 1 320px;min-width:0}.hc-text a{color:#D0B06C;text-decoration:underline}
  .hc-ok{flex:none;background:#C6A15B;color:#080909;border:0;border-radius:10px;padding:10px 20px;font:inherit;font-weight:600;cursor:pointer}
  .hc-ok:hover{background:#D0B06C}
  @media (max-width:760px){.hc-bar{bottom:84px}.hc-ok{width:100%}}`;
  document.head.appendChild(css);
  const bar = document.createElement("div"); bar.className = "hc-bar"; bar.setAttribute("role", "dialog"); bar.setAttribute("aria-label", t("Terms and privacy"));
  const text = document.createElement("div"); text.className = "hc-text";
  const link = (href, label) => { const a = document.createElement("a"); a.href = href; a.textContent = t(label); return a; };
  text.append(t("By using HURANTEA you agree to our "), link("#/terms", "Terms of Use"), t(" and "), link("#/privacy", "Privacy Policy"), t(". This site saves your settings and your request codes in your browser so it can work."));
  const ok = document.createElement("button"); ok.type = "button"; ok.className = "hc-ok"; ok.textContent = t("Accept");
  ok.onclick = () => { try { localStorage.setItem(KEY, VERSION); } catch (e) {} bar.remove(); };
  bar.append(text, ok); document.body.appendChild(bar);
})();
