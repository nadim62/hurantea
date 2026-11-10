// HURANTEA help assistant: a small chat button for visitors' questions. Text is always inserted as plain text.
(function () {
  const C = window.HURANTEA_CONFIG || {}, N = window.N || {}, t = (s) => (N.t ? N.t(s) : s);
  const LIVE = !!(C.supabaseUrl && C.supabaseAnonKey);
  const css = document.createElement("style");
  css.textContent = `
  .ha-btn{position:fixed;right:18px;bottom:18px;z-index:60;width:52px;height:52px;border-radius:50%;border:1px solid #C6A15B;background:#080909;color:#D0B06C;cursor:pointer;display:grid;place-items:center;box-shadow:0 6px 24px rgba(0,0,0,.5)}
  .ha-btn:hover{background:#111}.ha-btn svg{width:24px;height:24px}
  .ha-panel{position:fixed;right:18px;bottom:82px;z-index:61;width:min(360px,calc(100vw - 24px));height:min(480px,calc(100vh - 170px));display:none;flex-direction:column;background:#080909;border:1px solid rgba(198,161,91,.45);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.6);overflow:hidden;color:#EDE7DB;font-size:.92rem}
  .ha-panel.open{display:flex}
  .ha-head{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid rgba(237,231,219,.12)}
  .ha-head b{color:#D0B06C;letter-spacing:.08em;font-size:.8rem;text-transform:uppercase}
  .ha-x{background:none;border:0;color:#EDE7DB;font-size:1.3rem;cursor:pointer;line-height:1;padding:2px 6px}
  .ha-log{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
  .ha-m{max-width:86%;padding:8px 11px;border-radius:12px;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere}
  .ha-a{align-self:flex-start;background:rgba(237,231,219,.07);border:1px solid rgba(237,231,219,.1)}
  .ha-u{align-self:flex-end;background:rgba(198,161,91,.16);border:1px solid rgba(198,161,91,.4)}
  .ha-form{display:flex;gap:8px;padding:10px;border-top:1px solid rgba(237,231,219,.12)}
  .ha-form input{flex:1;min-width:0;background:#111;border:1px solid rgba(237,231,219,.18);border-radius:10px;color:#EDE7DB;padding:9px 11px;font:inherit}
  .ha-form input:focus{outline:none;border-color:#C6A15B}
  .ha-form button{background:#C6A15B;color:#080909;border:0;border-radius:10px;padding:0 14px;font-weight:600;cursor:pointer}
  .ha-form button:disabled{opacity:.5;cursor:default}
  .ha-note{padding:0 12px 8px;font-size:.72rem;color:rgba(237,231,219,.55)}
  @media (max-width:760px){.ha-btn{bottom:86px;right:12px}.ha-panel{bottom:146px;right:12px;height:min(440px,calc(100vh - 230px))}}`;
  document.head.appendChild(css);

  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const btn = el("button", "ha-btn"); btn.type = "button"; btn.setAttribute("aria-label", t("Help assistant")); btn.title = t("Help assistant");
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9.5 10a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.6"/><path d="M12 16.6h.01"/></svg>';
  const panel = el("div", "ha-panel"); panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", t("Help assistant"));
  const head = el("div", "ha-head"); head.append(el("b", "", t("Help assistant"))); const x = el("button", "ha-x", "×"); x.type = "button"; x.setAttribute("aria-label", t("Close")); head.append(x);
  const log = el("div", "ha-log"); log.setAttribute("aria-live", "polite");
  const note = el("div", "ha-note", t("AI assistant. It can't see your requests or payments. Don't share codes or card details here."));
  const form = el("form", "ha-form"); const input = el("input"); input.type = "text"; input.maxLength = 600; input.placeholder = t("Ask about HURANTEA…"); input.setAttribute("aria-label", t("Your question"));
  const send = el("button", "", t("Send")); send.type = "submit"; form.append(input, send);
  panel.append(head, log, note, form); document.body.append(btn, panel);

  const hist = []; let busy = false, greeted = false;
  const add = (role, text) => { const m = el("div", "ha-m " + (role === "user" ? "ha-u" : "ha-a"), text); log.append(m); log.scrollTop = log.scrollHeight; return m; };
  const toggle = (open) => { panel.classList.toggle("open", open); if (open) { if (!greeted) { greeted = true; add("assistant", t("Hi! I'm HURANTEA's AI assistant. Ask me how it works, about prices, payment or joining as an expert.")); } input.focus(); } };
  btn.onclick = () => toggle(!panel.classList.contains("open")); x.onclick = () => toggle(false);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.classList.contains("open")) toggle(false); });

  form.onsubmit = async (e) => {
    e.preventDefault(); const q = input.value.trim(); if (!q || busy) return;
    busy = true; send.disabled = true; input.value = ""; add("user", q); hist.push({ role: "user", content: q });
    const wait = add("assistant", "…");
    try {
      let reply;
      if (!LIVE) reply = t("Preview mode: the assistant answers here once the site is connected.");
      else {
        const r = await fetch(C.supabaseUrl.replace(/\/$/, "") + "/functions/v1/assistant", { method: "POST", headers: { "content-type": "application/json", apikey: C.supabaseAnonKey, authorization: "Bearer " + C.supabaseAnonKey }, body: JSON.stringify({ messages: hist.slice(-8) }) });
        const d = await r.json().catch(() => ({})); if (!r.ok || !d.reply) throw new Error(d.error || "x"); reply = d.reply;
      }
      wait.textContent = reply; hist.push({ role: "assistant", content: reply });
    } catch (err) { hist.pop(); wait.textContent = err && err.message && err.message !== "x" ? err.message : t("Sorry, I couldn't answer just now. Please try again."); }
    log.scrollTop = log.scrollHeight; busy = false; send.disabled = false; input.focus();
  };
})();
