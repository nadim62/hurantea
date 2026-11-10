// HURANTEA core: theme, helpers and the data layer (Supabase, or preview mode with sample data).
(function () {
  const C = window.HURANTEA_CONFIG || {};
  const LIVE = !!(C.supabaseUrl && C.supabaseAnonKey);
  const FEE = C.feeRate ?? 0.15;

  // ---------- storage that never throws ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  // ---------- theme ----------
  const THEMES = [
    ["auto", "", "Automatic", "Follows your device"],
    ["light", "", "Gold", "Black with champagne gold"],
    ["dark", "", "Dark", "Easy on the eyes"],
    ["glass", "", "Glass", "See-through panels in a dark universe"],
  ];
  const SVG = {
    auto: '<svg class="ic" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
    light: '<svg class="ic" viewBox="0 0 24 24"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l3 18M15 3l-3 18"/></svg>',   // Gold theme: a diamond
    dark: '<svg class="ic" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    glass: '<svg class="ic" viewBox="0 0 24 24"><rect x="3" y="3" width="13" height="13" rx="3"/><rect x="8" y="8" width="13" height="13" rx="3" opacity=".6"/></svg>',
  };
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const dark = t === "dark" || t === "glass" || (t === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
      meta.setAttribute("content", "#000000");
    }
    document.querySelectorAll("[data-theme-opt]").forEach((b) => b.classList.toggle("on", b.dataset.themeOpt === t));
  }
  applyTheme(store.get("hurantea-theme", "dark"));
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => applyTheme(store.get("hurantea-theme", "dark")));

  const GEAR = '<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
  // Settings menu (gear): appearance + extra links, e.g. [["#/payments", icon, "Payments & payouts"]]
  function mountThemeMenu(el, links = []) {
    el.innerHTML = `<button class="btn btn-ghost icon-btn" id="themeBtn" aria-label="Settings" title="Settings">${GEAR}</button>
      <div class="menu" id="themeMenu" role="menu"><small>Appearance</small>
        <div class="seg">${THEMES.map(([k, i, n]) => `<button data-theme-opt="${k}" role="menuitemradio" title="${n}">${SVG[k]}<span>${n === "Automatic" ? "Auto" : n}</span></button>`).join("")}</div>
        <div class="muted" id="themeHint" style="font-size:.78rem;padding:0 10px 4px"></div>
        <small>Motion</small>
        <div class="seg seg2"><button data-motion-opt="on" role="menuitemradio">On</button><button data-motion-opt="off" role="menuitemradio">Off</button></div>
        <small>Brightness</small>
        <div class="bright-row" data-bright-bar></div>
        <small>Language</small>
        <div style="padding:2px 4px 6px"><select id="langSel" aria-label="Language" style="padding:9px 10px;font-size:.9rem" data-no-i18n>
          <optgroup label="${(window.N?.t || ((s) => s))("Languages")}">${(window.NI18N?.LANGS || [["en", "English"]]).map(([c, n]) => `<option value="${c}" lang="${c}">${n}</option>`).join("")}</optgroup>
          <optgroup label="${(window.N?.t || ((s) => s))(LIVE ? "More languages — AI translation" : "More languages — AI translation (after launch)")}">${(window.NI18N?.MORE || []).map(([c, n]) => `<option value="${c}" lang="${c}" ${LIVE ? "" : "disabled"}>${n}</option>`).join("")}</optgroup>
        </select><div class="muted" style="font-size:.74rem;padding:6px 6px 0">${(window.N?.t || ((s) => s))("Translations are machine-made. English is the reference.")}</div></div>
        ${links.length ? `<div class="sep"></div><small>Account & money</small>` + links.map(([href, ic, label]) => `<a class="mi" href="${href}">${ic}<span>${label}</span></a>`).join("") : ""}
      </div>`;
    const menu = el.querySelector("#themeMenu");
    el.querySelector("#themeBtn").onclick = (e) => { e.stopPropagation(); menu.classList.toggle("open"); };
    menu.onclick = (e) => e.stopPropagation();
    document.addEventListener("click", () => menu.classList.remove("open"));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("open")) { menu.classList.remove("open"); el.querySelector("#themeBtn").focus(); } });
    menu.querySelectorAll("a.mi").forEach((a) => a.addEventListener("click", () => menu.classList.remove("open")));
    const hint = () => { const t = store.get("hurantea-theme", "dark"); el.querySelector("#themeHint").textContent = (THEMES.find((x) => x[0] === t) || THEMES[0])[3] || (THEMES.find((x) => x[0] === t) || [])[2] || ""; };
    menu.querySelectorAll("[data-theme-opt]").forEach((b) => (b.onclick = () => {
      store.set("hurantea-theme", b.dataset.themeOpt); applyTheme(b.dataset.themeOpt); hint();
    }));
    const syncOpts = () => {
      menu.querySelectorAll("[data-motion-opt]").forEach((b) => b.classList.toggle("on", b.dataset.motionOpt === (document.documentElement.dataset.motion || "on")));
      const ls = menu.querySelector("#langSel"); if (ls) ls.value = window.NI18N ? NI18N.lang() : "en";
    };
    menu.querySelectorAll("[data-motion-opt]").forEach((b) => (b.onclick = () => { store.set("hurantea-motion", b.dataset.motionOpt); document.documentElement.dataset.motion = b.dataset.motionOpt; syncOpts(); }));
    window.NBright && NBright.mount(menu);
    const ls = menu.querySelector("#langSel"); if (ls) ls.onchange = () => { if (window.NI18N) NI18N.set(ls.value); };
    applyTheme(store.get("hurantea-theme", "dark")); hint(); syncOpts();
  }
  const ICONS = {
    card: '<svg class="ic" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg>',
    wallet: '<svg class="ic" viewBox="0 0 24 24"><path d="M20 7H5a2 2 0 0 1 0-4h13v4"/><path d="M3 5v14a2 2 0 0 0 2 2h15V7"/><circle cx="16" cy="14" r="1.5"/></svg>',
    shield: '<svg class="ic" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
  };

  // ---------- helpers ----------
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => n == null || isNaN(n) ? "—" : "$" + Number(n).toLocaleString("en-US", n < 1000 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 0 });
  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 3200);
  }
  const STATUS = {
    received: ["Received", "", "Your request is queued for review."],
    searching: ["Finding talent", "warn", "We're matching the right expert."],
    quoted: ["Offer ready", "ok", "Your fixed-price offer is ready."],
    accepted: ["Accepted", "", "Your offer is accepted. Check the next step below."],
    delivered: ["Delivered", "ok", "Work delivered. Please review it."],
    paid: ["Completed", "ok", "Done and paid. Thank you!"],
    declined: ["Offer declined", "bad", "You declined this offer."],
    rejected: ["Not accepted", "bad", "We can't take on this request."],
    asking: ["Confirming with an expert", "warn", "A verified expert is reviewing your request and confirming the price."],
    no_match: ["No confirmed match yet", "bad", "None of the experts we asked could take this on right now."],
    cancelled: ["Cancelled", "", "You cancelled this request."],
    clarify: ["Needs your answer", "warn", "Please answer a few quick questions so we can give you an exact price."],
    ai_check: ["Awaiting review", "warn", "The sample and price are waiting for our review."],
  };
  // Public-safe status, independent of private agent orchestration.
  function requestStatus(r) {
    const phase = r.progress?.phase;
    const states = {
      queued: ["Queued", "warn", "Your request is saved and waiting for processing."],
      paused: ["Queued", "warn", "Processing is temporarily paused. Your request is saved; no work is running yet."],
      review: ["Awaiting review", "warn", "Our team needs to review this request before the next step."],
      sample_review: ["Sample under review", "warn", "The sample and fixed price are waiting for our review."],
      final_review: ["Work under review", "warn", "The finished work is being reviewed before delivery."],
      human: ["Waiting for a person", "warn", "This request needs a person. We will update you when someone is available."],
      payment: ["Awaiting payment", "warn", "Work has not started. Check payment availability below."],
      sample: ["Preparing sample", "", "Your sample is being prepared."],
      final: ["Making your work", "", "Your finished work is being prepared."],
    };
    if (states[phase]) return states[phase];
    if (r.status === "accepted" && r.payment_status === "awaiting") return states.payment;
    if (["received", "searching"].includes(r.status)) return states.queued;
    return STATUS[r.status] || ["Update pending", "", "Please check again shortly."];
  }
  // "searching", "asking" and "ai_check" share step 2 on the timeline
  const STEPS = ["received", "asking", "quoted", "accepted", "delivered", "paid"];

  // ---------- preview (demo) backend ----------
  function demoBackend() {
    const id = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));
    const now = () => new Date().toISOString();
    const db = {
      talent: [
        { id: id(), created_at: now(), name: "Rafi Ahmed", contact: "rafi@example.com", country: "Bangladesh", skills: "WordPress, PHP, website fixes, speed optimisation", rate_usd: 12, bio: "", status: "active", id_verified: true },
        { id: id(), created_at: now(), name: "Mira Sultana", contact: "mira@example.com", country: "Bangladesh", skills: "Logo design, Canva, social media graphics, branding", rate_usd: 10, bio: "", status: "active", id_verified: true },
        { id: id(), created_at: now(), name: "Omar Haddad", contact: "omar@example.com", country: "UAE", skills: "Data entry, Excel, Google Sheets, reports", rate_usd: 9, bio: "", status: "active", id_verified: true },
      ],
      jobs: [], log: [{ at: now(), message: "Preview mode: sample data only, nothing is saved." }],
      ratings: [], ops_tasks: [], staff: [],
      settings: { paymentProvider: "stripe", currency: "USD", payoutProvider: "payoneer", payoutSchedule: "weekly", autoPayoutLimit: 0, releaseHours: 24,
        aiFirst: true, aiReview: true, aiKinds: ["writing", "translation", "website", "spreadsheet", "research", "code"], aiPricePct: 50, aiMinPrice: 5, typicalRate: 15 },
    };
    // BACKOFFICE-001 preview history: compare every row before/after each action, like the database trigger does
    db.audit = []; db.ai = { day: new Date().toDateString(), calls: 0 }; db.heartbeat = now();
    const copy = (o) => JSON.parse(JSON.stringify(o));
    let shadow = { jobs: [], talent: copy(db.talent), ratings: [], ops_tasks: [], settings: copy(db.settings) };
    function commit(actor) {
      const seen = new Set();
      for (const ent of ["jobs", "talent", "ratings", "ops_tasks"]) {
        const prev = Object.fromEntries(shadow[ent].map((r) => [r.id, r]));
        for (const r of db[ent]) { seen.add(r.id); const o = prev[r.id];
          if (!o) { const c = copy(r); delete c.token; db.audit.unshift({ id: db.audit.length + 1, at: now(), actor, action: "insert", entity: ent, entity_id: r.id, changes: { created: c } }); continue; }
          const ch = {}; for (const k of Object.keys(r)) if (!["updated_at", "token"].includes(k) && JSON.stringify(o[k]) !== JSON.stringify(r[k])) ch[k] = { from: o[k] ?? null, to: r[k] ?? null };
          if (Object.keys(ch).length) db.audit.unshift({ id: db.audit.length + 1, at: now(), actor, action: "update", entity: ent, entity_id: r.id, changes: ch }); }
      }
      const so = shadow.settings, sc = {}; for (const k of new Set([...Object.keys(so), ...Object.keys(db.settings)])) if (JSON.stringify(so[k]) !== JSON.stringify(db.settings[k])) sc[k] = { from: so[k] ?? null, to: db.settings[k] ?? null };
      if (Object.keys(sc).length) db.audit.unshift({ id: db.audit.length + 1, at: now(), actor, action: "update", entity: "settings", entity_id: "1", changes: { data: sc } });
      shadow = { jobs: copy(db.jobs), talent: copy(db.talent), ratings: copy(db.ratings), ops_tasks: copy(db.ops_tasks), settings: copy(db.settings) };
    }
    function aiTake() {   // same rules as ai_take() in the database
      if (db.settings.aiPaused) return "paused";
      const d = new Date().toDateString(); if (db.ai.day !== d) db.ai = { day: d, calls: 0 };
      if (db.ai.calls >= (Number(db.settings.aiDailyLimit) || 200)) return "limit";
      db.ai.calls++; return "ok";
    }
    const words = (s) => String(s).toLowerCase().match(/[a-z]{3,}/g) || [];
    const CONFIRM_MS = 6000;   // preview: sample experts answer by themselves after a few seconds
    function askNext(j) {
      const c = (j.candidates || []).find((x) => x.state === "waiting");
      if (!c) { Object.assign(j, { status: "no_match", talent_id: null, offer_usd: null, offer_text: "None of the experts we asked could take this on right now.", updated_at: now() }); db.log.unshift({ at: now(), message: `"${j.title}": no expert confirmed — client sees "No confirmed match yet".` }); return "no_match"; }
      Object.assign(c, { state: "asking", key: id(), asked_at: now() });
      Object.assign(j, { status: "asking", talent_id: c.tid, offer_usd: null, offer_text: "A verified expert is reviewing your request and confirming the price.", updated_at: now() });
      db.log.unshift({ at: now(), message: `"${j.title}": asking ${c.name} to confirm (${money(c.provider)} for them).` });
      const key = c.key; setTimeout(() => { const cc = (j.candidates || []).find((x) => x.key === key); if (cc && cc.state === "asking") { expertRespond(key, true); commit("expert"); } }, CONFIRM_MS);
      return "asking";
    }
    function expertRespond(key, accept) {
      const j = db.jobs.find((x) => (x.candidates || []).some((c) => c.key === key)); if (!j) return "not_found";
      const c = j.candidates.find((x) => x.key === key); if (c.state !== "asking" || j.status !== "asking") return "closed";
      c.answered_at = now();
      if (!accept) { c.state = "declined"; db.log.unshift({ at: now(), message: `"${j.title}": ${c.name} declined.` }); askNext(j); return "declined"; }
      c.state = "accepted";
      Object.assign(j, { status: "quoted", talent_id: c.tid, offer_usd: c.total, updated_at: now(),
        offer_text: `A verified expert has confirmed "${j.title}" and can deliver it in about ${Math.ceil(c.hours / 6)} working day(s). The price is fixed — no surprises.`,
        quote: { talentName: c.name, hours: c.hours, rate: c.rate, providerPrice: c.provider, fee: c.fee, total: c.total, confirmedByExpert: true } });
      db.log.unshift({ at: now(), message: `"${j.title}": ${c.name} confirmed → offer ${money(c.total)} shown to the client.` });
      return "accepted";
    }
    // STRATEGY-001 preview of the AI-first decision (the live AI Boss asks a real AI model instead of matching keywords)
    const AI_RULES = [
      ["translation", /\b(translat\w*|übersetz\w*)\b/],
      ["website", /\b(website|landing page|homepage|web page|webpage)\b/],
      ["spreadsheet", /\b(excel|spreadsheet|sheets?|csv|formula\w*|budget)\b/],
      ["code", /\b(script|python|automat\w*|code)\b/],
      ["research", /\b(research|summar\w*|compare|comparison|report)\b/],
      ["writing", /\b(write|writing|text|texts|copy|descriptions?|blog|article|post|posts|email|cv|resume|cover letter|caption\w*|slogan)\b/],
    ];
    const NEEDS_PERSON = /\b(logo|design|video|photo|edit my|repair|clean\w*|deliver\w*|install|login|password|my account|wordpress|online shop|webshop|checkout|app|database|lawyer|legal|tax|medical|visit|on site|every (day|week|month))\b/;
    function aiKind(j) {
      if ((j.files || []).length) return null;   // FILES-001: work that depends on attached files goes to a person
      const t = (j.title + " " + j.description).toLowerCase();
      if (NEEDS_PERSON.test(t)) return null;
      const r = AI_RULES.find(([, re]) => re.test(t)); return r ? r[0] : null;
    }
    const SAMPLES = {
      writing: (j) => `First lines of your text — "${j.title}":\n\n${j.title.replace(/^(write|create|make)\s+/i, "")} — made with care, ready to use. Clear words that tell your customer what they get and why it matters, in a friendly tone that fits your brand.\n\n(Sample only. The full work follows your request exactly.)`,
      translation: (j) => `Sample of the translation (first lines):\n\nOriginal: "Welcome! Our dishes are made fresh every day."\nTranslated: the same line in the language you asked for.\n\n(Preview sample — the live AI translates your real text and keeps your layout.)`,
      website: (j) => `<!-- Sample: top of your page -->\n<header>\n  <h1>${j.title.replace(/[<>&]/g, "")}</h1>\n  <p>Fresh, fast and simple — built as one file you can upload anywhere.</p>\n  <a class="button" href="#contact">Contact us</a>\n</header>`,
      spreadsheet: () => `Sample of your sheet (first rows, CSV):\n\nMonth,Income,Costs,Profit\nJanuary,1200,800,=B2-C2\nFebruary,1350,820,=B3-C3`,
      research: (j) => `Sample — opening of your summary:\n\n1. The question: ${j.title}\n2. What the sources agree on: …\n3. Where they differ: …\n\n(The full summary lists every source.)`,
      code: () => `# Sample: start of your script\nimport csv\n\ndef main():\n    """Reads your file and does the job you described."""\n    ...`,
    };
    const FINAL = (j, w) => (w.kind === "website" ? `<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><title>${j.title.replace(/[<>&]/g, "")}</title></head>\n<body>\n${w.sample}\n<main><p>Preview: this is sample finished work. The live AI writes the complete file for the real request.</p></main>\n</body></html>`
      : `${w.sample.replace(/\(Sample only[^)]*\)|\(The full [^)]*\)/g, "").trim()}\n\n— Full version —\nPreview: this is sample finished work. In the live version, HURANTEA's AI writes the complete work for "${j.title}" here.`) + (w.note ? `\n\n[Changed as you asked: ${w.note}]` : "");
    // preview only: the site and the owner area don't share sample data, so a pretend owner approves AI work after a few seconds
    const OWNER_PAGE = !!window.HURANTEA_OWNER_PAGE;   // in the owner area you approve by hand, so you can try it
    function autoOk(j, stage) { if (OWNER_PAGE) return; setTimeout(() => { if (stage === "sample" && j.status === "ai_check") Object.assign(j, { status: "quoted", offer_usd: j.quote.total, offer_text: j.ai_work.plan, updated_at: now() });
      else if (stage === "final" && j.status === "accepted" && j.ai_work.final && !j.ai_work.approved) Object.assign(j, { status: "delivered", ai_work: { ...j.ai_work, approved: true, approved_at: now() }, updated_at: now() }); else return;
      db.log.unshift({ at: now(), message: `"${j.title}": preview — AI ${stage === "sample" ? "sample" : "work"} approved automatically (live: you approve it in "AI work").` }); commit("owner"); }, CONFIRM_MS); }
    // PIPE-001 preview of the quality check
    function simRun(j, stage) {
      const t = (j.title + " " + j.description).toLowerCase(), at = now();
      const r1 = { round: 1, judge: "Quality agent", at, results: [{ maker: "Maker A", score: 86, pass: true, issues: [] }, { maker: "Maker B", score: 78, pass: false, issues: ["Tone is less friendly than asked"] }] };
      if (/\bimpossible\b/.test(t)) return { pass: false, feedback: ["Missing key facts only the client has", "Format does not match the request"], trace: [
        { round: 1, judge: "Quality agent", at, results: [{ maker: "Maker A", score: 62, pass: false, issues: ["Missing key facts only the client has"] }, { maker: "Maker B", score: 58, pass: false, issues: ["Format does not match the request"] }] },
        { round: 2, judge: "Quality agent", at, results: [{ maker: "Maker A", score: 70, pass: false, issues: ["Missing key facts only the client has"] }, { maker: "Maker B", score: 66, pass: false, issues: ["Format does not match the request"] }] }] };
      if (/\bstrict\b/.test(t)) return { pass: true, maker: "Maker B", score: 84, trace: [
        { round: 1, judge: "Quality agent", at, results: [{ maker: "Maker A", score: 74, pass: false, issues: ["Two requested items missing"] }, { maker: "Maker B", score: 71, pass: false, issues: ["Too long for the format"] }] },
        { round: 2, judge: "Quality agent", at, results: [{ maker: "Maker A", score: 82, pass: true, issues: [] }, { maker: "Maker B", score: 84, pass: true, issues: [] }] }] };
      return { pass: true, maker: "Maker A", score: 86, trace: [r1] };
    }
    function escalate(j, reason, stage) {
      if (!db.ops_tasks.some((k) => k.job_id === j.id && k.dept === "human" && k.status !== "done"))
        db.ops_tasks.unshift({ id: id(), created_at: now(), updated_at: now(), title: ("Human needed: " + j.title).slice(0, 200), detail: reason, dept: "human", status: "ready", priority: stage === "final" ? "p1" : "p2", job_id: j.id, created_by: "ai-boss", kind: "human_job", assignee: null });
      db.log.unshift({ at: now(), message: `"${j.title}": sent to the Human board (${stage}) — preview: a push notification would go to your staff.` });
    }
    const median = (a) => { const x = [...a].sort((p, q) => p - q); return x.length ? x[Math.floor(x.length / 2)] : 0; };
    function boss() {
      db.heartbeat = now();
      const S = db.settings, kinds = Array.isArray(S.aiKinds) ? S.aiKinds : [];
      // paid AI jobs: make the full work (first), like the live Boss
      for (const j of db.jobs.filter((x) => x.route === "ai" && x.status === "accepted" && x.payment_status === "held" && !(x.ai_work || {}).final && !(x.ai_work || {}).escalated)) {
        const gate = aiTake(); if (gate !== "ok") { db.log.unshift({ at: now(), message: gate === "paused" ? "AI Boss is paused by the owner — new jobs wait until you resume." : "Daily AI limit reached — remaining jobs wait until tomorrow or until you raise the limit." }); commit("ai-boss"); return; }
        const w = j.ai_work, review = S.aiReview !== false, run = simRun(j, "final"), tr = { ...(w.pipeline || {}), final: [...((w.pipeline || {}).final || []), ...run.trace] };
        if (!run.pass) { j.ai_work = { ...w, pipeline: tr, escalated: "human", escalated_at: now() }; j.updated_at = now(); escalate(j, "PAID job: the AI work failed 2 quality rounds. Finish it by staff or give it to a backup expert.", "final"); continue; }
        j.ai_work = { ...w, final: FINAL(j, w), final_at: now(), final_by: run.maker, final_score: run.score, pipeline: tr, versions: (w.versions || 0) + 1, approved: !review };
        if (!review) j.status = "delivered"; else autoOk(j, "final"); j.updated_at = now();
        db.log.unshift({ at: now(), message: `"${j.title}": HURANTEA AI finished the work — ${review ? "waiting for your check before the client sees it" : "delivered to the client"}.` });
      }
      for (const j of db.jobs.filter((x) => x.status === "received")) {
        const w = new Set(words(j.title + " " + j.description));
        const pool = db.talent.filter((x) => x.status === "active" && x.id_verified)
          .map((t) => ({ t, s: words(t.skills).filter((k) => w.has(k)).length })).sort((a, b) => b.s - a.s).slice(0, 3);
        // handed over to a person and already ranked → ask the next expert, no AI call
        if (j.route === "expert" && (j.candidates || []).some((c) => c.state === "waiting")) { db.log.unshift({ at: now(), message: `"${j.title}": handed to a person — asking the next ranked expert.` }); askNext(j); continue; }
        const gate = aiTake();
        if (gate !== "ok") { db.log.unshift({ at: now(), message: gate === "paused" ? "AI Boss is paused by the owner — new jobs wait until you resume." : "Daily AI limit reached — remaining jobs wait until tomorrow or until you raise the limit." }); break; }
        // CLARIFY-001 preview rule: very short requests get up to 3 questions, once (the live AI Boss decides from the content)
        if (!(j.ai_work || {}).clarified && words(j.description).length < 5) {
          Object.assign(j, { status: "clarify", ai_work: { ...(j.ai_work || {}), questions: ["What exactly should be delivered at the end?", "How much is it (pages, words, items) and in which language?", "Any deadline, example or link we should follow?"], asked_at: now() },
            offer_text: "We need a few quick details to give you an exact price.", updated_at: now() });
          db.log.unshift({ at: now(), message: `"${j.title}": asked the client 3 question(s) before pricing (preview rule: very short request).` }); continue;
        }
        const hours = Math.min(40, Math.max(2, Math.round(j.description.length / 60)));
        j.candidates = pool.map(({ t }) => { const provider = hours * t.rate_usd, fee = Math.round(provider * FEE * 100) / 100;
          return { tid: t.id, name: t.name, rate: t.rate_usd, hours, provider, fee, total: Math.round((provider + fee) * 100) / 100, state: "waiting" }; });
        const kind = S.aiFirst !== false && j.route !== "expert" ? aiKind(j) : null;
        if (kind && kinds.includes(kind)) {
          const rate = median(db.talent.filter((t) => t.status === "active").map((t) => Number(t.rate_usd))) || Number(S.typicalRate) || 15;
          const price = Math.max(Number(S.aiMinPrice ?? 5) || 5, Math.round(hours * rate * Math.max(5, Math.min(100, Number(S.aiPricePct ?? 50)))) / 100);
          const plan = `HURANTEA's AI will deliver the complete ${{ writing: "text", translation: "translation", website: "website as one ready-to-upload file", spreadsheet: "spreadsheet (CSV with formulas)", research: "research summary with sources", code: "script with instructions" }[kind]} for "${j.title}", usually within a few minutes after payment.`;
          const review = S.aiReview !== false, run = simRun(j, "sample"), base = { ...(j.ai_work || {}), kind, human_hours: hours, plan };
          if (!run.pass) { j.route = "expert"; j.ai_work = { ...base, pipeline: { sample: run.trace }, ai_failed: "sample" };
            if (j.candidates.length) { db.log.unshift({ at: now(), message: `"${j.title}": AI sample failed 2 quality rounds — asking ${j.candidates[0].name}.` }); askNext(j); }
            else { Object.assign(j, { status: "searching", offer_text: "We're finding the right expert for this. You'll see an offer here soon.", updated_at: now() }); escalate(j, "The AI sample failed 2 quality rounds and no expert fits.", "sample"); }
            continue; }
          Object.assign(j, { route: "ai", talent_id: null, ai_work: { ...base, sample: SAMPLES[kind](j), at: now(), pipeline: { sample: run.trace }, sample_by: run.maker, sample_score: run.score },
            quote: { route: "ai", total: price, fee: price, providerPrice: 0, humanEstimate: hours * rate, hours },
            status: review ? "ai_check" : "quoted", offer_usd: review ? null : price, offer_text: review ? STATUS.ai_check[2] : plan, updated_at: now() });
          if (review) autoOk(j, "sample");
          db.log.unshift({ at: now(), message: `"${j.title}": HURANTEA AI can do this (${kind}) — sample passed the quality scan (${run.maker}, ${run.score}/100, round ${run.trace.length}), ${review ? "waiting for your check" : "offer shown"} at ${money(price)}${j.candidates.length ? `; backup experts: ${j.candidates.map((c) => c.name).join(" → ")}` : ""} (preview logic: keywords).` });
          continue;
        }
        j.route = "expert";
        if (!j.candidates.length) { Object.assign(j, { status: "searching", offer_text: "We're finding the right expert for this. You'll see an offer here soon.", updated_at: now() }); db.log.unshift({ at: now(), message: `"${j.title}": needs a person; no matching expert in the network yet.` }); escalate(j, "Needs a person and no expert in the network fits.", "match"); continue; }
        db.log.unshift({ at: now(), message: `"${j.title}": needs a person — ranked ${j.candidates.map((c) => c.name).join(" → ")} (preview logic: skill overlap).` });
        askNext(j);
      }
      commit("ai-boss");
    }
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    return {
      live: false,
      async submitJob(p) {
        const j = { id: id(), token: id(), created_at: now(), updated_at: now(), status: "received", payment_status: "none", payout_status: "none", client_name: p.name, client_contact: p.contact,
          title: p.title, description: p.description, budget_usd: p.budget, deadline: p.deadline,
          files: (p.files || []).slice(0, 5).map((f) => ({ name: f.name, size: f.size, type: f.type, url: URL.createObjectURL(f) })) };   // FILES-001 preview: kept in this tab only
        db.jobs.unshift(j); commit("client"); setTimeout(boss, 4000); await wait(500); return j.token;
      },
      async joinTalent(p) { db.talent.push({ id: id(), created_at: now(), name: p.name, contact: p.contact, country: p.country, skills: p.skills, rate_usd: p.rate, bio: p.bio, status: "active", id_verified: false }); commit("expert"); await wait(400); return true; },
      async track(token) { const j = db.jobs.find((x) => x.token === token); if (!j) return null; const w = j.ai_work || {}, ai = j.route === "ai";   // same rules as track_request() in the database
        return { title: j.title, status: j.status, offer_usd: j.offer_usd, offer_text: j.offer_text, created_at: j.created_at, updated_at: j.updated_at, payment_status: j.payment_status, tries_left: (j.candidates || []).filter((c) => c.state === "waiting").length,
          route: j.route || null, kind: ai ? w.kind : null, sample: ai && ["quoted", "accepted", "delivered", "paid"].includes(j.status) ? w.sample : null,
          deliverable: ai && ["delivered", "paid"].includes(j.status) && w.approved ? w.final : null, questions: j.status === "clarify" ? w.questions || [] : null }; },
      async clientAnswer(token, answer) { const j = db.jobs.find((x) => x.token === token); const a = String(answer || "").trim().slice(0, 2000); if (a.length < 2) return "empty"; if (!j || j.status !== "clarify") return "unchanged";
        const w = { ...(j.ai_work || {}) }; delete w.questions; Object.assign(j, { description: (j.description + "\n\nClient answers: " + a).slice(0, 6000), status: "received", offer_text: null, ai_work: { ...w, clarified: true, answered_at: now() }, updated_at: now() });
        commit("client"); setTimeout(boss, 3000); await wait(300); return "received"; },
      async opsTasks() { return db.ops_tasks; },
      // PIPE-001 staff + Human board (preview: the staff page shows its own sample jobs)
      async isStaff() { return true; },
      async staffList() { return db.staff; },
      async addStaff(email, name) { if (!/@/.test(email)) return "no_account"; db.staff.push({ user_id: id(), name, email, active: true, created_at: now() }); commit("owner"); return "added"; },
      async updateStaff(i, patch) { Object.assign(db.staff.find((x) => x.user_id === i) || {}, patch); commit("owner"); },
      async staffBoard() { if (window.HURANTEA_STAFF_PAGE && !db._seeded) { db._seeded = true;
          const pj = { id: id(), token: id(), created_at: now(), updated_at: now(), status: "accepted", route: "ai", payment_status: "held", client_name: "Sample client", client_contact: "-", title: "Translate my restaurant menu into Arabic", files: [{ name: "menu-current.pdf", type: "application/pdf", url: "assets/sample/menu-current.pdf", preview: "assets/sample/menu-current.png" }, { name: "hygiene-standards.pdf", type: "application/pdf", url: "assets/sample/hygiene-standards.pdf", preview: "assets/sample/hygiene-standards.png" }, { name: "allergy-list.pdf", type: "application/pdf", url: "assets/sample/allergy-list.pdf", preview: "assets/sample/allergy-list.png" }],
            description: "Please translate our menu into Arabic and keep the layout. Our current menu, our kitchen hygiene standards and our allergy list are attached as PDFs: translate all three, and keep the allergen numbers the same.\n\nSTARTERS\nHummus with warm bread - 6.50\nLentil soup of the day - 5.00\n\nMAINS\nGrilled chicken with rice and salad - 14.90\nLamb kofta with yoghurt sauce - 16.50\n\nDESSERTS\nBaklava with pistachios - 4.50", ai_work: { kind: "translation", plan: "The full menu in Arabic, same layout.", escalated: "human" } };
          db.jobs.push(pj); escalate(pj, "PAID job: the AI work failed 2 quality rounds.", "final"); }
        return db.ops_tasks.filter((k) => k.dept === "human" && k.status !== "done").map((k) => { const j = db.jobs.find((x) => x.id === k.job_id) || {};
          return { task_id: k.id, title: k.title, detail: k.detail, priority: k.priority, status: k.status, mine: k.assignee === "me", created_at: k.created_at, job_title: j.title, job_details: j.description, files: j.files || [], job_deadline: j.deadline, plan: (j.ai_work || {}).plan, kind: (j.ai_work || {}).kind, client_name: j.client_name, paid: j.status === "accepted" }; }); },
      async staffTake(tid) { const k = db.ops_tasks.find((x) => x.id === tid); if (!k || k.assignee) return "unavailable"; Object.assign(k, { assignee: "me", status: "working", updated_at: now() }); commit("staff"); return "taken"; },
      async staffDeliver(tid, text) { const k = db.ops_tasks.find((x) => x.id === tid && x.assignee === "me"); if (!k) return "not_yours"; if (String(text || "").trim().length < 2) return "empty";
        const j = db.jobs.find((x) => x.id === k.job_id); if (!j || j.status !== "accepted") return "not_paid"; const review = db.settings.aiReview !== false;
        j.ai_work = { ...j.ai_work, final: String(text).slice(0, 200000), final_at: now(), final_by: "staff", approved: !review, escalated: null }; if (!review) j.status = "delivered";
        Object.assign(k, { status: "done", updated_at: now() }); commit("staff"); return review ? "waiting_owner" : "delivered"; },
      async savePush() { throw new Error("Notifications work once the site is live with its database."); },
      async fileUrl(f) { return f.url || f.path; },
      async addOpsTask(t) { db.ops_tasks.unshift({ id: id(), created_at: now(), updated_at: now(), status: "ready", priority: "p2", dept: "operations", created_by: "owner", ...t }); commit("owner"); },
      async updateOpsTask(i, patch) { Object.assign(db.ops_tasks.find((x) => x.id === i) || {}, patch, { updated_at: now() }); commit("owner"); },
      async clientHuman(token) { const j = db.jobs.find((x) => x.token === token); if (!j || j.route !== "ai" || !["ai_check", "quoted"].includes(j.status)) return "unchanged";
        Object.assign(j, { route: "expert", offer_usd: null, quote: null, ai_work: { ...j.ai_work, handover: "client", handover_at: now() }, offer_text: "We are asking a verified expert to take this on.", updated_at: now() });
        await wait(300); let r; if ((j.candidates || []).some((c) => c.state === "waiting")) r = askNext(j); else { j.status = "received"; setTimeout(boss, 3000); r = "received"; } commit("client"); return r; },
      async expertOffer(key) { const j = db.jobs.find((x) => (x.candidates || []).some((c) => c.key === key)); if (!j) return null; const c = j.candidates.find((x) => x.key === key);
        return { title: j.title, description: j.description, deadline: j.deadline, hours: c.hours, pay_usd: c.provider, state: c.state, answer_by: new Date(Date.parse(c.asked_at) + 12 * 3600e3).toISOString() }; },
      async expertRespond(key, accept) { await wait(300); const r = expertRespond(key, accept); commit("expert"); return r; },
      async clientNext(token) { const j = db.jobs.find((x) => x.token === token && x.status === "quoted"); if (!j) return "unchanged";
        const c = j.candidates.find((x) => x.state === "accepted"); if (c) c.state = "client_declined"; await wait(300); const r = askNext(j); commit("client"); return r; },
      async confirmDelivery(token) { const j = db.jobs.find((x) => x.token === token && x.status === "delivered" && x.payment_status === "held"); if (!j) return "unchanged"; j.status = "paid"; j.payment_status = "released"; if (j.talent_id) j.payout_status = "pending"; j.updated_at = now(); commit("client"); return "confirmed"; },
      async reportProblem(token, text) { const j = db.jobs.find((x) => x.token === token && x.status === "delivered" && !x.problem_at); if (!j) return "unchanged"; j.problem_at = now(); j.problem_text = String(text).slice(0, 1000); commit("client"); return "reported"; },
      async appeal(token, text) { const j = db.jobs.find((x) => x.token === token && x.status === "rejected"); if (!j) return "unchanged"; j.status = "received"; j.description += "\n\nClient reply: " + text; j.offer_text = null; j.updated_at = now(); commit("client"); return "sent"; },
      async cancel(token) { const j = db.jobs.find((x) => x.token === token && ["received", "searching", "clarify", "ai_check", "asking", "quoted", "no_match"].includes(x.status)); if (!j) return "unchanged"; Object.assign(j, { status: "cancelled", offer_usd: null, updated_at: now() }); commit("client"); return "cancelled"; },
      async respond(token, accept) { const j = db.jobs.find((x) => x.token === token && x.status === "quoted"); if (j) { j.status = accept ? "accepted" : "declined"; if (accept) j.payment_status = "awaiting"; j.updated_at = now(); commit("client");
          // preview: pretend the client paid, so the whole AI flow can be tried (live: the payment provider confirms it)
          if (accept && j.route === "ai" && !OWNER_PAGE) setTimeout(() => { if (j.status === "accepted" && j.payment_status === "awaiting") { j.payment_status = "held"; db.log.unshift({ at: now(), message: `"${j.title}": preview — payment simulated.` }); commit("system"); setTimeout(boss, 1500); } }, CONFIRM_MS); }
        return j ? j.status : "unchanged"; },
      async academy({ topic }) {
        await wait(900);
        return { title: `Get started with ${topic}`, why: "A practical skill people pay for every day.",
          steps: ["Watch one beginner tutorial (30 min)", "Copy a simple example step by step", "Change it to make it your own", "Share it with a friend for feedback", "Repeat with a slightly harder example"],
          project: `Make one small ${topic} project you can show to others.`, next: "Learn the next level and build a small portfolio." };
      },
      async signIn() { await wait(300); return true; }, async signOut() {}, async session() { return true; }, async onAuth() {}, async isOwner() { return true; },
      async jobs() { return db.jobs; }, async talent() { return db.talent; }, async log() { return db.log; },
      async deleteJob(i) { db.jobs = db.jobs.filter((x) => x.id !== i); commit("owner"); },
      async updateJob(i, patch) { const j = db.jobs.find((x) => x.id === i) || {}; Object.assign(j, patch, { updated_at: now() }); commit("owner");
        // preview: the Boss reacts a few seconds later, like the live one on its next run
        if (j.status === "received" || (j.route === "ai" && j.status === "accepted" && j.payment_status === "held" && !(j.ai_work || {}).final)) setTimeout(boss, 2500); },
      async updateTalent(i, patch) { Object.assign(db.talent.find((x) => x.id === i) || {}, patch); commit("owner"); },
      async runBoss() { boss(); return { processed: 1 }; },
      async getSettings() { return { ...db.settings }; },
      async rate(r) { db.ratings.unshift({ id: id(), created_at: now(), approved: false, ...r }); commit("client"); await wait(300); return true; },
      async ratingSummary() { const n = db.ratings.length; return { count: n, avg: n ? db.ratings.reduce((s, r) => s + r.stars, 0) / n : 0, recent: db.ratings.filter((r) => r.approved && r.comment).slice(0, 3) }; },
      async ratings() { return db.ratings; },
      async updateRating(i, patch) { Object.assign(db.ratings.find((x) => x.id === i) || {}, patch); commit("owner"); },
      async saveSettings(d) { db.settings = { ...d }; commit("owner"); await wait(200); },
      async audit() { return db.audit.slice(0, 500); },
      async aiUsage() { return { today: db.ai.day === new Date().toDateString() ? db.ai.calls : 0, heartbeat: db.heartbeat }; },
      async mfaFactors() { return []; }, async mfaEnroll() { throw new Error("Two-step login works once the database is connected."); }, async mfaVerify() {}, async mfaNeeded() { return false; }, async isOwnerAccount() { return true; },
    };
  }

  // ---------- live backend (Supabase) ----------
  function liveBackend() {
    let sb = null;
    const ready = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      s.onload = () => { sb = window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey); res(); };
      s.onerror = () => rej(new Error("Could not load. Check your connection."));
      document.head.appendChild(s);
    });
    const ok = (r) => { if (r.error) throw new Error(r.error.message); return r.data; };
    const fn = (name) => `${C.supabaseUrl.replace(/\/$/, "")}/functions/v1/${name}`;
    return {
      live: true,
      async submitJob(p) { await ready;
        // FILES-001: files go to the private bucket first (req/<request id>/…), then the request, then the link between them
        const files = []; if (p.files?.length && p.requestId) for (const f of p.files.slice(0, 5)) {
          const path = `req/${p.requestId}/${Date.now().toString(36)}-${f.name.replace(/[^\w.\-]+/g, "_").slice(-80)}`;
          const up = await sb.storage.from("job-files").upload(path, f, { contentType: f.type || "application/octet-stream", upsert: false });
          if (up.error) throw new Error("Could not upload " + f.name + ": " + up.error.message); files.push({ path, name: f.name, size: f.size, type: f.type }); }
        const token = ok(await sb.rpc("submit_job", { p_name: p.name, p_contact: p.contact, p_title: p.title, p_description: p.description, p_budget: p.budget, p_deadline: p.deadline || "", p_request_id: p.requestId || null }));
        if (files.length) await sb.rpc("attach_files", { p_token: token, p_files: files });
        return token; },
      async joinTalent(p) { await ready; return ok(await sb.rpc("join_talent", { p_name: p.name, p_contact: p.contact, p_country: p.country || "", p_skills: p.skills, p_rate: p.rate, p_bio: p.bio || "", p_adult: !!p.adult, p_payout_method: p.payoutMethod || "", p_payout_details: p.payoutDetails || "" })); },
      async platformStatus() { await ready; try { return ok(await sb.rpc("hurantea_public_status")); } catch { return { processing: "unknown", payments_ready: false }; } },
      async track(token) { await ready; const d = ok(await sb.rpc("track_request", { p_token: token })); const row = d && d[0] || null;
        if (!row) return null; try { row.progress = ok(await sb.rpc("hurantea_request_progress", { p_token: token })); } catch { row.progress = null; } return row; },
      async respond(token, accept) { await ready; return ok(await sb.rpc("respond_offer", { p_token: token, p_accept: accept })); },
      async expertOffer(key) { await ready; const d = ok(await sb.rpc("expert_offer", { p_key: key })); return d && d[0] || null; },
      async expertRespond(key, accept) { await ready; return ok(await sb.rpc("expert_respond", { p_key: key, p_accept: accept })); },
      async clientNext(token) { await ready; return ok(await sb.rpc("client_next", { p_token: token })); },
      async cancel(token) { await ready; return ok(await sb.rpc("cancel_request", { p_token: token })); },
      // APPEAL-001: answer a "not accepted" request, optionally with documents, and have it checked again
      async appeal(token, text, files) { await ready; const dir = crypto.randomUUID(), up = [];
        for (const f of [...(files || [])].slice(0, 5)) { if (f.size > 10485760) throw new Error(f.name + " is larger than 10 MB.");
          const path = `req/${dir}/${Date.now().toString(36)}-${f.name.replace(/[^\w.\-]+/g, "_").slice(-80)}`;
          const r = await sb.storage.from("job-files").upload(path, f, { contentType: f.type || "application/octet-stream", upsert: false });
          if (r.error) throw new Error("Could not upload " + f.name + ": " + r.error.message); up.push({ path, name: f.name, size: f.size, type: f.type }); }
        return ok(await sb.rpc("client_appeal", { p_token: token, p_text: text, p_dir: up.length ? dir : null, p_files: up })); },
      async confirmDelivery(token) { await ready; return ok(await sb.rpc("client_confirm", { p_token: token })); },
      async reportProblem(token, text) { await ready; return ok(await sb.rpc("client_problem", { p_token: token, p_text: text })); },
      async clientHuman(token) { await ready; return ok(await sb.rpc("client_human", { p_token: token })); },
      async clientAnswer(token, answer) { await ready; return ok(await sb.rpc("client_answer", { p_token: token, p_answer: answer })); },
      async opsTasks() { await ready; return ok(await sb.from("ops_tasks").select("*").order("created_at", { ascending: false }).limit(500)); },
      async isStaff() { await ready; return !!ok(await sb.rpc("is_staff")); },
      async staffList() { await ready; return ok(await sb.from("staff").select("*").order("created_at")); },
      async addStaff(email, name) { await ready; return ok(await sb.rpc("owner_add_staff", { p_email: email, p_name: name })); },
      async updateStaff(i, patch) { await ready; ok(await sb.from("staff").update(patch).eq("user_id", i)); },
      async staffBoard() { await ready; return ok(await sb.rpc("staff_board")) || []; },
      async staffTake(tid) { await ready; return ok(await sb.rpc("staff_take", { p_task: tid })); },
      async staffDeliver(tid, text) { await ready; return ok(await sb.rpc("staff_deliver", { p_task: tid, p_work: text })); },
      async savePush(sub) { await ready; return ok(await sb.rpc("save_push", { p_sub: sub })); },
      async fileUrl(f) { await ready; const r = await sb.storage.from("job-files").createSignedUrl(f.path, 3600); if (r.error) throw new Error(r.error.message); return r.data.signedUrl; },
      async addOpsTask(t) { await ready; ok(await sb.from("ops_tasks").insert(t)); },
      async updateOpsTask(i, patch) { await ready; ok(await sb.from("ops_tasks").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", i)); },
      async pay(token) {   // PAY-001: opens Stripe's secure card page; the amount is taken from the database, not from here
        const r = await fetch(fn("pay"), { method: "POST", headers: { "content-type": "application/json", apikey: C.supabaseAnonKey, authorization: "Bearer " + C.supabaseAnonKey }, body: JSON.stringify({ token }) });
        const d = await r.json().catch(() => ({})); if (!r.ok || !d.url) throw new Error(d.error || "Please try again."); return d.url;
      },
      async academy(body) {
        const r = await fetch(fn("academy"), { method: "POST", headers: { "content-type": "application/json", apikey: C.supabaseAnonKey, authorization: "Bearer " + C.supabaseAnonKey }, body: JSON.stringify(body) });
        const d = await r.json().catch(() => ({})); if (!r.ok || d.error) throw new Error(d.error || "Please try again."); return d;
      },
      async signIn(email, password) { await ready; ok(await sb.auth.signInWithPassword({ email, password })); return true; },
      async signOut() { await ready; await sb.auth.signOut(); },
      async session() { await ready; return !!(await sb.auth.getSession()).data.session; },
      async onAuth(cb) { await ready; sb.auth.onAuthStateChange((ev) => cb(ev)); },
      async isOwner() { await ready; return !!ok(await sb.rpc("is_owner")); },
      async jobs() { await ready; return ok(await sb.from("jobs").select("*").order("created_at", { ascending: false }).limit(500)); },
      async talent() { await ready; return ok(await sb.from("talent").select("*").order("created_at", { ascending: false }).limit(1000)); },
      async log() { await ready; return ok(await sb.from("boss_log").select("*").order("at", { ascending: false }).limit(80)); },
      async updateJob(i, patch) { await ready; ok(await sb.from("jobs").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", i)); },
      async deleteJob(i) { await ready; const r = await sb.from("jobs").delete().eq("id", i).select("id"); ok(r); if (!r.data || !r.data.length) throw new Error("Could not delete this job."); },
      async updateTalent(i, patch) { await ready; ok(await sb.from("talent").update(patch).eq("id", i)); },
      async runBoss() {
        await ready; const s = (await sb.auth.getSession()).data.session;
        const r = await fetch(fn("boss"), { method: "POST", headers: { apikey: C.supabaseAnonKey, authorization: "Bearer " + s.access_token } });
        if (!r.ok) throw new Error("Boss could not run (" + r.status + ")"); return r.json();
      },
      async rate(r) { await ready; return ok(await sb.rpc("rate_site", { p_stars: r.stars, p_comment: r.comment || "", p_name: r.name || "" })); },
      async ratingSummary() { await ready; const d = ok(await sb.rpc("rating_summary")); return { avg: Number(d.avg) || 0, count: Number(d.count) || 0, recent: d.recent || [] }; },
      async ratings() { await ready; return ok(await sb.from("ratings").select("*").order("created_at", { ascending: false }).limit(300)); },
      async updateRating(i, patch) { await ready; ok(await sb.from("ratings").update(patch).eq("id", i)); },
      async getSettings() { await ready; const d = ok(await sb.from("settings").select("data").eq("id", 1).maybeSingle()); return d?.data || {}; },
      async saveSettings(data) { await ready; ok(await sb.from("settings").upsert({ id: 1, data, updated_at: new Date().toISOString() })); },
      async audit() { await ready; return ok(await sb.from("audit_log").select("*").order("at", { ascending: false }).limit(500)); },
      async aiUsage() { await ready; const today = new Date().toISOString().slice(0, 10);
        const u = ok(await sb.from("ai_usage").select("calls").eq("day", today).maybeSingle()); const h = ok(await sb.from("boss_heartbeat").select("last_run").eq("id", 1).maybeSingle());
        return { today: u?.calls || 0, heartbeat: h?.last_run || null }; },
      // two-step login (authenticator app, TOTP) for the owner — Supabase Auth MFA
      async mfaFactors() { await ready; const r = await sb.auth.mfa.listFactors(); if (r.error) throw r.error; return (r.data.totp || []).filter((f) => f.status === "verified"); },
      async mfaEnroll() { await ready; const r = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: "HURANTEA owner " + new Date().toISOString().slice(0, 10) }); if (r.error) throw r.error; return { id: r.data.id, qr: r.data.totp.qr_code, secret: r.data.totp.secret }; },
      async mfaVerify(factorId, code) { await ready; const c = await sb.auth.mfa.challenge({ factorId }); if (c.error) throw c.error;
        const v = await sb.auth.mfa.verify({ factorId, challengeId: c.data.id, code: String(code).replace(/\s/g, "") }); if (v.error) throw v.error; return true; },
      async mfaNeeded() { await ready; const r = await sb.auth.mfa.getAuthenticatorAssuranceLevel(); if (r.error) throw r.error; return r.data.nextLevel === "aal2" && r.data.currentLevel !== "aal2"; },
      async isOwnerAccount() { await ready; return !!ok(await sb.rpc("is_owner_account")); },
    };
  }

  // PIPE-001 push notifications for the owner and staff (Web Push; needs vapidPublicKey in config.js and the VAPID secrets)
  async function enablePush(api) {
    if (!LIVE) throw new Error("Notifications work once the site is live with its database.");
    if (!C.vapidPublicKey) throw new Error("Add vapidPublicKey to config.js first (see SETUP.md).");
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) throw new Error("This browser can't receive notifications. On iPhone, add the page to the home screen first.");
    if ((await Notification.requestPermission()) !== "granted") throw new Error("Notifications were not allowed.");
    const reg = await navigator.serviceWorker.register("sw.js");
    const k = C.vapidPublicKey.replace(/-/g, "+").replace(/_/g, "/"), raw = atob(k + "=".repeat((4 - (k.length % 4)) % 4));
    const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: Uint8Array.from(raw, (c) => c.charCodeAt(0)) }));
    await api.savePush(sub.toJSON()); return true;
  }
  window.N = { api: LIVE ? liveBackend() : demoBackend(), LIVE, FEE, C, store, esc, money, toast, STATUS, requestStatus, STEPS, mountThemeMenu, ICONS, enablePush };
})();
