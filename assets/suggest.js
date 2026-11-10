// HURANTEA autocomplete: suggestions appear while typing, and the full list can be opened and picked from.
// <input data-suggest="country">  every country, named in the visitor's language (Intl.DisplayNames), plus English names
// <input data-suggest="skills">   common skills; comma-separated, completes the word you are typing
// ARIA combobox pattern: ↑/↓ to move, Enter to pick, Esc to close; works with touch and mouse.
(function () {
  const ISO = "AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR XK KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW".split(" ");
  const SKILLS = ["WordPress", "Shopify", "Website design", "Web development", "Landing page", "Logo design", "Branding", "Graphic design", "Canva", "Photoshop", "Illustrator", "Figma", "UI/UX design",
    "Video editing", "YouTube editing", "Premiere Pro", "After Effects", "Animation", "Motion graphics", "Photo editing", "Copywriting", "Content writing", "Blog writing", "SEO", "Social media",
    "Facebook ads", "Google Ads", "Email marketing", "Translation", "Arabic translation", "Bengali translation", "Hindi translation", "Spanish translation", "French translation", "Proofreading",
    "Data entry", "Excel", "Google Sheets", "Data analysis", "Power BI", "Python", "JavaScript", "React", "Node.js", "PHP", "Laravel", "Mobile apps", "Flutter", "Android", "iOS",
    "Customer support", "Virtual assistant", "Bookkeeping", "Voice over", "Transcription", "Presentation design", "PowerPoint", "Resume writing", "3D modelling", "Blender", "AutoCAD",
    "Music production", "Podcast editing", "Tutoring", "Chatbots", "AI automation", "Zapier", "Wix", "Squarespace", "Amazon listings", "E-commerce", "Product photos"];
  const root = document.documentElement;
  const lang = () => root.lang || "en";
  let names = null;
  function countries() {
    if (names && names.lang === lang()) return names.list;
    let loc = null, en = null;
    try { loc = new Intl.DisplayNames([lang(), "en"], { type: "region" }); en = new Intl.DisplayNames(["en"], { type: "region" }); } catch {}
    const list = ISO.map((c) => { const n = (loc && loc.of(c)) || c, e = (en && en.of(c)) || c; return { code: c, label: n, keys: [n, e, c].map(fold) }; })
      .filter((x) => x.label && x.label !== x.code).sort((a, b) => a.label.localeCompare(b.label, lang()));
    names = { lang: lang(), list }; return list;
  }
  const fold = (s) => String(s).toLocaleLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const tr = (s) => (window.N && N.t ? N.t(s) : s);
  let uid = 0;

  function attach(input) {
    if (input.dataset.sgOn) return; input.dataset.sgOn = "1";
    const kind = input.dataset.suggest, id = "sg" + (++uid);
    const wrap = document.createElement("div"); wrap.className = "sg-wrap"; input.parentNode.insertBefore(wrap, input); wrap.appendChild(input);
    const btn = document.createElement("button"); btn.type = "button"; btn.className = "sg-btn"; btn.tabIndex = -1;
    btn.setAttribute("aria-label", tr(kind === "country" ? "Show all countries" : "Show skill suggestions")); btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>';
    const box = document.createElement("ul"); box.className = "sg-list"; box.id = id; box.setAttribute("role", "listbox"); box.hidden = true; box.setAttribute("data-no-i18n", "");
    wrap.append(btn, box);
    input.setAttribute("role", "combobox"); input.setAttribute("aria-autocomplete", "list"); input.setAttribute("aria-expanded", "false"); input.setAttribute("aria-controls", id); input.autocomplete = "off";
    let items = [], act = -1;
    const token = () => kind === "skills" ? input.value.split(",").pop().trim() : input.value.trim();
    function build(all) {
      const q = fold(token());
      if (kind === "country") {
        const list = countries();
        items = (all || !q ? list : list.filter((x) => x.keys.some((k) => k.startsWith(q))).concat(list.filter((x) => !x.keys.some((k) => k.startsWith(q)) && x.keys.some((k) => k.includes(q))))).slice(0, all || !q ? 400 : 8)
          .map((x) => ({ v: x.label, sub: x.code }));
      } else {
        const have = new Set(input.value.split(",").map((s) => fold(s.trim())));
        items = SKILLS.filter((s) => !have.has(fold(s)) && (all || !q || fold(s).includes(q))).sort((a, b) => fold(b).startsWith(q) - fold(a).startsWith(q)).slice(0, all ? 80 : 8).map((s) => ({ v: s }));
      }
      act = items.length && q ? 0 : -1;
      box.innerHTML = items.length ? items.map((it, i) => `<li role="option" id="${id}-${i}" data-i="${i}" aria-selected="${i === act}"><span>${esc(it.v)}</span>${it.sub ? `<small>${it.sub}</small>` : ""}</li>`).join("")
        : `<li class="sg-none" aria-disabled="true">${esc(tr("No match — you can keep what you typed."))}</li>`;
      openBox(true); mark();
    }
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    function openBox(v) { box.hidden = !v; input.setAttribute("aria-expanded", String(v)); wrap.classList.toggle("open", v); if (!v) input.removeAttribute("aria-activedescendant"); }
    function mark() { box.querySelectorAll("[role=option]").forEach((li) => li.setAttribute("aria-selected", String(+li.dataset.i === act)));
      if (act >= 0) { input.setAttribute("aria-activedescendant", `${id}-${act}`); box.querySelector(`[data-i="${act}"]`)?.scrollIntoView({ block: "nearest" }); } }
    function pick(i) {
      const it = items[i]; if (!it) return;
      if (kind === "skills") { const parts = input.value.split(","); parts[parts.length - 1] = " " + it.v; input.value = parts.join(",").replace(/^\s+/, "") + ", "; }
      else input.value = it.v;
      picking = true; input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); picking = false;
      openBox(false); input.focus();
    }
    let picking = false;
    input.addEventListener("input", () => { if (picking) return; if (kind === "country" && !token()) openBox(false); else build(false); });
    input.addEventListener("focus", () => { if (kind === "skills" || !input.value) build(false); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); if (box.hidden) build(!token()); else { act = Math.min(items.length - 1, act + 1); mark(); } }
      else if (e.key === "ArrowUp") { e.preventDefault(); act = Math.max(0, act - 1); mark(); }
      else if (e.key === "Enter" && !box.hidden && act >= 0) { e.preventDefault(); pick(act); }
      else if (e.key === "Escape" && !box.hidden) { e.preventDefault(); e.stopPropagation(); openBox(false); }
      else if (e.key === "Tab" && !box.hidden && act >= 0 && token()) { pick(act); }
    });
    input.addEventListener("blur", () => setTimeout(() => { if (!wrap.contains(document.activeElement)) openBox(false); }, 160));
    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.onclick = () => { if (box.hidden) { input.focus(); build(true); } else openBox(false); };
    box.addEventListener("mousedown", (e) => e.preventDefault());
    box.addEventListener("click", (e) => { const li = e.target.closest("[role=option]"); if (li) pick(+li.dataset.i); });
    // country: start with the visitor's likely country (from device settings — no permission needed)
    if (kind === "country" && !input.value) {
      let cc = ""; for (const l of navigator.languages || []) { const m = /-([A-Z]{2})$/i.exec(l); if (m) { cc = m[1].toUpperCase(); break; } }
      try { if (!cc) { const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; cc = ({ "Asia/Dhaka": "BD", "Asia/Kolkata": "IN", "Asia/Karachi": "PK", "Asia/Dubai": "AE" })[tz] || ""; } } catch {}
      const hit = cc && countries().find((x) => x.code === cc); if (hit) input.placeholder = (tr("e.g.") + " " + hit.label);
    }
  }
  const scan = () => document.querySelectorAll("input[data-suggest]").forEach(attach);
  const app = document.getElementById("app");
  if (app) new MutationObserver(() => requestAnimationFrame(scan)).observe(app, { childList: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", scan); else scan();
  window.NSuggest = { scan };
})();
