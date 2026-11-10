// HURANTEA languages. English is the default for everyone and the source text.
// Other languages load as a small pack (assets/lang/<code>.js) only when a visitor picks one.
(function () {
  const LANGS = [
    ["en", "English"], ["ar", "العربية"], ["bn", "বাংলা"], ["hi", "हिन्दी"], ["ur", "اردو"],
    ["zh", "中文"], ["es", "Español"], ["fr", "Français"], ["pt", "Português"], ["id", "Bahasa Indonesia"],
  ];
  const MORE = [["de", "Deutsch"], ["it", "Italiano"], ["nl", "Nederlands"], ["pl", "Polski"], ["ru", "Русский"], ["uk", "Українська"], ["tr", "Türkçe"], ["fa", "فارسی"], ["he", "עברית"], ["ps", "پښتو"], ["ku", "Kurdî"], ["ja", "日本語"], ["ko", "한국어"], ["vi", "Tiếng Việt"], ["th", "ไทย"], ["ms", "Bahasa Melayu"], ["fil", "Filipino"], ["ta", "தமிழ்"], ["te", "తెలుగు"], ["mr", "मराठी"], ["gu", "ગુજરાતી"], ["kn", "ಕನ್ನಡ"], ["ml", "മലയാളം"], ["pa", "ਪੰਜਾਬੀ"], ["ne", "नेपाली"], ["si", "සිංහල"], ["sw", "Kiswahili"], ["am", "አማርኛ"], ["ha", "Hausa"], ["yo", "Yorùbá"], ["ig", "Igbo"], ["zu", "isiZulu"], ["af", "Afrikaans"], ["so", "Soomaali"], ["ro", "Română"], ["el", "Ελληνικά"], ["cs", "Čeština"], ["hu", "Magyar"], ["sv", "Svenska"], ["no", "Norsk"], ["da", "Dansk"], ["fi", "Suomi"], ["bg", "Български"], ["sr", "Српски"], ["hr", "Hrvatski"], ["az", "Azərbaycanca"], ["kk", "Қазақша"], ["uz", "Oʻzbekcha"], ["my", "မြန်မာ"], ["km", "ខ្មែរ"], ["lo", "ລາວ"], ["zh-TW", "繁體中文"], ["sq", "Shqip"], ["hy", "Հայերեն"], ["ka", "ქართული"]];
  const RTL = new Set(["ar", "ur", "fa", "he", "ps"]);
  const root = document.documentElement;
  const pack = window.HURANTEA_LANG && window.HURANTEA_LANG.code === root.lang ? window.HURANTEA_LANG : null;
  const lang = () => (pack ? pack.code : "en");

  function tr(s) {
    if (!pack) return s;
    const k = String(s).replace(/\s+/g, " ").trim();
    if (pack.dict[k]) return pack.dict[k];
    for (const [re, f] of pack.pat) { const m = k.match(re); if (m) return f(m, tr); }
    return s;
  }
  const t = (s) => tr(s);

  function translateNode(node) {
    if (!pack) return;
    const walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    let n; const list = [];
    while ((n = walk.nextNode())) list.push(n);
    for (const x of list) {
      if (x.parentElement?.closest("script,style,.code,[data-no-i18n]")) continue;
      const raw = x.nodeValue; const k = raw.replace(/\s+/g, " ").trim(); if (!k || !/[A-Za-z]/.test(k)) continue;
      const v = tr(k); if (v !== k) x.nodeValue = raw.replace(raw.trim(), v);
    }
    node.querySelectorAll?.("[placeholder],[aria-label],[title]").forEach((e) => {
      for (const a of ["placeholder", "aria-label", "title"]) { const v = e.getAttribute(a); if (v && /[A-Za-z]/.test(v)) { const r = tr(v); if (r !== v) e.setAttribute(a, r); } }
    });
    node.querySelectorAll?.("[data-rotate]").forEach((e) => { if (!e.dataset.rotateTr) { e.dataset.rotate = e.dataset.rotate.split("|").map(tr).join("|"); e.dataset.rotateTr = "1"; } });
  }

  function set(code) {
    try { localStorage.setItem("hurantea-lang", JSON.stringify(code)); } catch {}
    location.reload();
  }

  window.NI18N = { set, t, lang, LANGS, MORE, RTL };

  // Languages without a ready-made pack: fetch an AI translation once (live site only), cache it, reload.
  if (!pack && root.lang && root.lang !== "en") {
    const code = root.lang, C = window.HURANTEA_CONFIG || {};
    const back = (msg) => { try { localStorage.setItem("hurantea-lang", JSON.stringify("en")); } catch {} root.lang = "en"; root.dir = "ltr"; setTimeout(() => window.N?.toast?.(msg), 400); };
    if (C.supabaseUrl && C.supabaseAnonKey) {
      setTimeout(() => window.N?.toast?.("Translating…"), 300);
      fetch(`${C.supabaseUrl.replace(/\/$/, "")}/functions/v1/translate?lang=${encodeURIComponent(code)}`, { headers: { apikey: C.supabaseAnonKey, authorization: "Bearer " + C.supabaseAnonKey } })
        .then((r) => r.json()).then((d) => { if (!d.dict) throw 0; localStorage.setItem("hurantea-pack-" + code, JSON.stringify(d.dict)); location.reload(); })
        .catch(() => back("Translation unavailable right now — showing English."));
    } else back("More languages — AI translation (after launch)");
  }
  window.N = window.N || {}; window.N.t = t;

  if (pack) {
    root.dir = pack.dir;
    const go = () => {
      translateNode(document.body);
      new MutationObserver((muts) => { for (const m of muts) for (const nd of m.addedNodes) { if (nd.nodeType === 1) translateNode(nd); else if (nd.nodeType === 3 && nd.parentElement) translateNode(nd.parentElement); } })
        .observe(document.body, { childList: true, subtree: true });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
  } else if (root.lang !== "en") { root.lang = "en"; root.dir = "ltr"; }
})();

// ---------- region-aware language suggestion ----------
// No permission needed: the likely country comes from the device time zone and language settings.
// The visitor can also pick their country. Only languages with hand-made packs are offered.
(function () {
  const ask = () => { try { return !localStorage.getItem("hurantea-lang") && !localStorage.getItem("hurantea-lang-ask"); } catch { return false; } };
  if (!ask()) return;
  const COUNTRY = { // country -> languages we have hand-made packs for (English is always offered)
    BD: ["bn"], IN: ["hi", "bn"], PK: ["ur"], AE: ["ar"], SA: ["ar"], EG: ["ar"], QA: ["ar"], KW: ["ar"], OM: ["ar"], BH: ["ar"], JO: ["ar"], MA: ["ar", "fr"], DZ: ["ar", "fr"], TN: ["ar", "fr"], IQ: ["ar"], LB: ["ar", "fr"],
    CN: ["zh"], TW: ["zh"], HK: ["zh"], SG: ["zh"], MY: ["zh"], ID: ["id"],
    ES: ["es"], MX: ["es"], AR: ["es"], CO: ["es"], CL: ["es"], PE: ["es"], VE: ["es"],
    FR: ["fr"], BE: ["fr"], CH: ["fr"], CA: ["fr"], SN: ["fr"], CI: ["fr"], BR: ["pt"], PT: ["pt"], AO: ["pt"], MZ: ["pt"],
  };
  const NAMES = { BD: "Bangladesh", IN: "India", PK: "Pakistan", AE: "United Arab Emirates", SA: "Saudi Arabia", EG: "Egypt", QA: "Qatar", KW: "Kuwait", OM: "Oman", BH: "Bahrain", JO: "Jordan", MA: "Morocco", DZ: "Algeria", TN: "Tunisia", IQ: "Iraq", LB: "Lebanon", CN: "China", TW: "Taiwan", HK: "Hong Kong", SG: "Singapore", MY: "Malaysia", ID: "Indonesia", ES: "Spain", MX: "Mexico", AR: "Argentina", CO: "Colombia", CL: "Chile", PE: "Peru", VE: "Venezuela", US: "United States", FR: "France", BE: "Belgium", CH: "Switzerland", CA: "Canada", SN: "Senegal", CI: "Côte d'Ivoire", BR: "Brazil", PT: "Portugal", AO: "Angola", MZ: "Mozambique", GB: "United Kingdom", DE: "Germany", NG: "Nigeria", KE: "Kenya", PH: "Philippines" };
  const TZ = { "Asia/Dhaka": "BD", "Asia/Kolkata": "IN", "Asia/Calcutta": "IN", "Asia/Karachi": "PK", "Asia/Dubai": "AE", "Asia/Riyadh": "SA", "Africa/Cairo": "EG", "Asia/Qatar": "QA", "Asia/Kuwait": "KW", "Asia/Muscat": "OM", "Asia/Bahrain": "BH", "Asia/Amman": "JO", "Africa/Casablanca": "MA", "Africa/Algiers": "DZ", "Africa/Tunis": "TN", "Asia/Baghdad": "IQ", "Asia/Beirut": "LB",
    "Asia/Shanghai": "CN", "Asia/Taipei": "TW", "Asia/Hong_Kong": "HK", "Asia/Singapore": "SG", "Asia/Kuala_Lumpur": "MY", "Asia/Jakarta": "ID", "Asia/Makassar": "ID", "Asia/Jayapura": "ID", "Europe/Madrid": "ES", "America/Mexico_City": "MX", "America/Argentina/Buenos_Aires": "AR", "America/Bogota": "CO", "America/Santiago": "CL", "America/Lima": "PE", "America/Caracas": "VE",
    "Europe/Paris": "FR", "Europe/Brussels": "BE", "Europe/Zurich": "CH", "America/Toronto": "CA", "America/Montreal": "CA", "Africa/Dakar": "SN", "Africa/Abidjan": "CI", "America/Sao_Paulo": "BR", "Europe/Lisbon": "PT", "Africa/Luanda": "AO", "Africa/Maputo": "MZ" };
  const guess = () => {
    for (const l of navigator.languages || [navigator.language || ""]) { const m = /-([A-Z]{2})$/i.exec(l); if (m && COUNTRY[m[1].toUpperCase()]) return m[1].toUpperCase(); }
    try { return TZ[Intl.DateTimeFormat().resolvedOptions().timeZone] || ""; } catch { return ""; }
  };
  function show() {
    const I = window.NI18N; if (!I) return;
    const name = (c) => (I.LANGS.find((x) => x[0] === c) || [c, c])[1];
    const box = document.createElement("div"); box.className = "lang-ask"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "Choose your language"); box.setAttribute("data-no-i18n", "");
    const render = (cc) => {
      const langs = (COUNTRY[cc] || []).filter((c) => I.LANGS.some((x) => x[0] === c));
      box.innerHTML = `<span class="la-k">Region</span>
        <label class="la-c"><select aria-label="Your country or region"><option value="">Choose your country…</option>${Object.entries(NAMES).sort((a, b) => a[1].localeCompare(b[1])).map(([k, v]) => `<option value="${k}"${k === cc ? " selected" : ""}>${v}</option>`).join("")}</select></label>
        <span class="la-l">${langs.length ? "Show HURANTEA in:" : "Choose a language:"}</span>
        ${(langs.length ? langs : I.LANGS.slice(1).map((x) => x[0])).map((c) => `<button type="button" class="btn btn-primary btn-sm" data-l="${c}" lang="${c}">${name(c)}</button>`).join("")}
        <button type="button" class="btn btn-sm" data-l="en">English</button>
        <button type="button" class="la-x" aria-label="Close">×</button>`;
      box.querySelector("select").onchange = (e) => render(e.target.value);
      box.querySelectorAll("[data-l]").forEach((b) => (b.onclick = () => { try { localStorage.setItem("hurantea-lang-ask", "1"); } catch {} if (b.dataset.l === "en") { try { localStorage.setItem("hurantea-lang", '"en"'); } catch {} box.remove(); } else I.set(b.dataset.l); }));
      box.querySelector(".la-x").onclick = () => { try { localStorage.setItem("hurantea-lang-ask", "1"); } catch {} box.remove(); };
    };
    const cc = guess(); if (!cc) return;           // nothing to suggest: stay quiet, the language menu is in Settings
    render(cc); document.body.appendChild(box);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(show, 1200)); else setTimeout(show, 1200);
})();
