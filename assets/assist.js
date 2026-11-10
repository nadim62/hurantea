// HURANTEA help assistant: a small chat button with built-in answers (runs in the browser, no server call, no cost). Text is always inserted as plain text.
(function () {
  const C = window.HURANTEA_CONFIG || {}, N = window.N || {}, t = (s) => (N.t ? N.t(s) : s);
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
  .ha-chips{display:flex;gap:6px;overflow-x:auto;padding:0 10px 8px;scrollbar-width:none}.ha-chips::-webkit-scrollbar{display:none}
  .ha-chip{flex:none;background:none;border:1px solid rgba(198,161,91,.45);color:#D0B06C;border-radius:999px;padding:5px 10px;font:inherit;font-size:.76rem;cursor:pointer;white-space:nowrap}.ha-chip:hover{background:rgba(198,161,91,.14)}
  .ha-note{padding:0 12px 8px;font-size:.72rem;color:rgba(237,231,219,.55)}
  @media (max-width:760px){.ha-btn{bottom:86px;right:12px}.ha-panel{bottom:146px;right:12px;height:min(440px,calc(100vh - 230px))}}`;
  document.head.appendChild(css);

  // Built-in answers: no server call, no cost. Each topic: keywords (any language welcome) + answer.
  const FAQ = [
    { k: "Post a job", w: ["post", "start", "how do i", "how does", "how it works", "work", "order", "request", "hire", "need", "begin", "job"], a: "Describe your job in the box on the home page, in any language. Posting is free and needs no account. HURANTEA's AI does the job itself when it can and shows you a free sample first; other jobs go to one verified human expert." },
    { k: "Prices", w: ["price", "cost", "how much", "fee", "cheap", "expensive", "rate", "charge", "quote", "free"], a: "Posting is free. You get one fixed price for the whole job before any work starts. AI jobs usually cost much less than hiring a person. For expert jobs the price already includes the expert's pay and HURANTEA's service fee." },
    { k: "Payment", w: ["pay", "payment", "card", "stripe", "checkout", "money", "safe", "secure", "held", "escrow"], a: "After you accept your offer, you pay securely by card through our payment partner. Your money is held safely and only released after the work is delivered. Never pay anyone outside HURANTEA." },
    { k: "Refunds", w: ["refund", "money back", "not delivered", "unhappy", "cancel", "complain", "problem", "wrong"], a: "If the work is not delivered, you get your money back. You can cancel a request under My requests before work starts. For a problem with a delivered job, use the contact link in the footer if there is one, or post it as a new request." },
    { k: "Track my request", w: ["track", "status", "progress", "code", "where is", "my request", "offer", "sample", "lost", "delivered", "when"], a: "Open My requests. Requests posted from this device appear there automatically; otherwise paste your private tracking code. Keep a copy of the code and don't share it: anyone with the code can see that request. I can't see your requests from here." },
    { k: "AI or a person?", w: ["ai", "human", "person", "expert do", "who does", "robot", "real", "quality"], a: "AI first. When HURANTEA's AI can do a job well (texts, translations, simple websites, spreadsheets, research summaries, small scripts) it does it and shows a free sample. Everything else goes to one verified human expert, and you can always choose \"Ask a human expert instead\"." },
    { k: "Earn as an expert", w: ["earn", "join", "freelanc", "expert", "work for", "apply", "payout", "get paid", "payoneer", "wise", "bank", "skills", "sign up", "register"], a: "Join free under Earn with your skills and set your own hourly rate. Before any paid job you verify your ID and age (18+) once. You receive your full rate after the client confirms delivery (or after 7 days with no complaint), sent to Payoneer, Wise or your bank. Experts never pay to get work." },
    { k: "Safety", w: ["safe", "safety", "scam", "trust", "verify", "verified", "legit", "fraud", "illegal"], a: "Every request is screened, and illegal, harmful or deceptive jobs are declined. Experts verify their ID and age before paid work. Clients only pay into HURANTEA's held payment, never to a person." },
    { k: "Academy", w: ["academy", "learn", "course", "tutor", "study", "teach", "skill", "kid", "child", "student"], a: "The Academy is a free AI tutor for any age: type what you want to learn and get a short plan with practice steps. Learning is free; paid jobs are for adults (18+)." },
    { k: "Account & languages", w: ["account", "login", "log in", "password", "language", "translate", "arabic", "bangla", "hindi", "spanish", "french"], a: "Clients don't need an account: you get a private tracking code after posting. You can write your job in any language, and change the site's language in the settings menu at the top." },
  ];
  const answer = (q) => {
    const s = " " + q.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ") + " "; let best = null, top = 0;
    for (const f of FAQ) { let n = 0; for (const w of f.w) if (s.includes(w.length <= 3 ? " " + w + " " : w)) n += w.includes(" ") ? 2 : 1; if (n > top) { top = n; best = f; } }
    if (/(?:\d[ -]?){12,19}/.test(q)) return t("Please don't share card numbers or codes here. Card details are only entered on the secure payment page.");
    return best ? t(best.a) : t("I don't have an answer for that. Pick a topic below, or describe what you need in the box on the home page: posting is free and you see a fixed price before any work starts.");
  };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const btn = el("button", "ha-btn"); btn.type = "button"; btn.setAttribute("aria-label", t("Help assistant")); btn.title = t("Help assistant");
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9.5 10a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.6"/><path d="M12 16.6h.01"/></svg>';
  const panel = el("div", "ha-panel"); panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", t("Help assistant"));
  const head = el("div", "ha-head"); head.append(el("b", "", t("Help assistant"))); const x = el("button", "ha-x", "×"); x.type = "button"; x.setAttribute("aria-label", t("Close")); head.append(x);
  const log = el("div", "ha-log"); log.setAttribute("aria-live", "polite");
  const note = el("div", "ha-note", t("Automatic help. It can't see your requests or payments. Don't share codes or card details here."));
  const form = el("form", "ha-form"); const input = el("input"); input.type = "text"; input.maxLength = 600; input.placeholder = t("Ask about HURANTEA…"); input.setAttribute("aria-label", t("Your question"));
  const send = el("button", "", t("Send")); send.type = "submit"; form.append(input, send);
  const chips = el("div", "ha-chips"); FAQ.forEach((f) => { const c = el("button", "ha-chip", t(f.k)); c.type = "button"; c.onclick = () => { if (busy) return; add("user", t(f.k)); add("assistant", t(f.a)); }; chips.append(c); });
  panel.append(head, log, chips, note, form); document.body.append(btn, panel);


  const hist = []; let busy = false, greeted = false;
  const add = (role, text) => { const m = el("div", "ha-m " + (role === "user" ? "ha-u" : "ha-a"), text); log.append(m); log.scrollTop = log.scrollHeight; return m; };
  const toggle = (open) => { panel.classList.toggle("open", open); if (open) { if (!greeted) { greeted = true; add("assistant", t("Hi! I'm HURANTEA's help assistant. Type a question or pick a topic below.")); } input.focus(); } };
  btn.onclick = () => toggle(!panel.classList.contains("open")); x.onclick = () => toggle(false);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.classList.contains("open")) toggle(false); });

  form.onsubmit = async (e) => {
    e.preventDefault(); const q = input.value.trim(); if (!q || busy) return;
    busy = true; send.disabled = true; input.value = ""; add("user", q); hist.push({ role: "user", content: q });
    const wait = add("assistant", "…");
    try {
      await new Promise((r) => setTimeout(r, 350));
      const reply = answer(q);
      wait.textContent = reply; hist.push({ role: "assistant", content: reply });
    } catch (err) { hist.pop(); wait.textContent = err && err.message && err.message !== "x" ? err.message : t("Sorry, I couldn't answer just now. Please try again."); }
    log.scrollTop = log.scrollHeight; busy = false; send.disabled = false; input.focus();
  };
})();
