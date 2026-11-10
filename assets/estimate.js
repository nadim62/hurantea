// Instant estimate from a plain-language request (any of our languages).
// Clearly an ESTIMATE — the fixed offer comes after the AI Boss matches a real expert.
(function () {
  const CATS = [
    { id: "website", label: "Website", hours: [12, 40], kw: ["website","web site","webpage","landing","wordpress","shopify","wix","site","checkout","woocommerce","موقع","ওয়েবসাইট","वेबसाइट","ویب سائٹ","网站","sitio","página web","site web","situs"] },
    { id: "app", label: "Mobile app", hours: [60, 220], kw: ["app","android","ios","flutter","react native","mobile","تطبيق","অ্যাপ","ऐप","ایپ","应用","aplicación","appli","aplikasi","aplicativo"] },
    { id: "logo", label: "Logo & branding", hours: [4, 14], kw: ["logo","brand","branding","identity","شعار","লোগো","लोगो","لوگو","标志","logotipo","marque","merek"] },
    { id: "design", label: "Graphic design", hours: [3, 12], kw: ["design","poster","flyer","banner","canva","figma","ui","ux","تصميم","ডিজাইন","डिज़ाइन","ڈیزائن","设计","diseño","conception","desain"] },
    { id: "video", label: "Video editing", hours: [5, 18], kw: ["video","edit","youtube","reel","tiktok","premiere","capcut","فيديو","ভিডিও","वीडियो","ویڈیو","视频","vídeo","vidéo"] },
    { id: "translation", label: "Translation", hours: [3, 12], kw: ["translate","translation","subtitle","ترجمة","অনুবাদ","अनुवाद","ترجمہ","翻译","traducción","traduction","terjemah","tradução"] },
    { id: "writing", label: "Writing", hours: [3, 10], kw: ["write","article","blog","copy","content","cv","resume","كتابة","লেখা","लेखन","تحریر","写作","redacción","rédaction","tulis"] },
    { id: "data", label: "Excel & data", hours: [3, 14], kw: ["excel","sheet","spreadsheet","data","report","dashboard","entry","إكسل","بيانات","এক্সেল","ডেটা","एक्सेल","डेटा","ایکسل","表格","数据","datos","données","laporan"] },
    { id: "marketing", label: "Social & SEO", hours: [8, 30], kw: ["seo","social","instagram","facebook","ads","marketing","google","تسويق","মার্কেটিং","मार्केटिंग","مارکیٹنگ","营销","marketing digital","publicité","pemasaran"] },
    { id: "dev", label: "Software & automation", hours: [10, 60], kw: ["code","bug","api","python","javascript","script","automation","bot","database","برمجة","কোড","कोड","کوڈ","代码","programa","développement","kode"] },
  ];
  // Living brief: editable requirements per category. Detected ones start ON; the visitor can toggle any.
  const OPTS = {
    website: [["shop", "Online shop", 10, /shop|store|sell|ecommerce|e-commerce|متجر|দোকান|दुकान|دکان|商店|tienda|boutique|toko|loja/], ["pay", "Card payments", 5, /payment|pay|checkout|stripe|دفع|পেমেন্ট|भुगतान|ادائیگی|支付|pago|paiement|bayar/],
      ["book", "Booking system", 8, /booking|appointment|reserv|حجز|বুকিং|बुकिंग|预约|reserva|réservation/], ["multi", "Multi-language", 6, /language|arabic|english|bangla|لغة|ভাষা|भाषा|زبان|语言|idioma|langue|bahasa/], ["pages5", "5+ pages", 6, /pages|صفحات|পেজ|पेज|页面|páginas|halaman/]],
    app: [["both", "iOS + Android", 40, /ios|iphone|android|both/], ["login", "User accounts", 15, /login|account|sign/], ["pay", "Payments", 15, /payment|pay|checkout/]],
    logo: [["concepts", "3 concepts", 3, /concept|options|versions/], ["kit", "Brand kit", 5, /brand|colors|colours|kit|guide/], ["social", "Social media set", 4, /social|instagram|facebook/]],
    design: [["print", "Print-ready files", 2, /print|flyer|poster/], ["social", "Social media set", 4, /social|instagram|post/]],
    video: [["long", "Over 10 minutes", 8, /\b(1[0-9]|[2-9][0-9])\s*(min|minute)/], ["subs", "Subtitles", 3, /subtit|caption/], ["motion", "Motion graphics", 6, /motion|animation|intro/]],
    translation: [["many", "10+ pages", 8, /\b(1[0-9]|[2-9][0-9])\s*pages?/], ["cert", "Certified style", 3, /certif|official|legal/]],
    writing: [["seo", "SEO-optimised", 2, /seo|google/], ["long", "Long-form (2,000+ words)", 4, /long|2000|3000|ebook/]],
    data: [["dash", "Dashboard & charts", 5, /dashboard|chart|graph/], ["auto", "Automation", 6, /automat|macro|script/]],
    marketing: [["ads", "Paid ads setup", 6, /ads|campaign/], ["month", "Monthly management", 15, /month|ongoing|manage/]],
    dev: [["api", "API integration", 8, /api|integrat/], ["db", "Database", 6, /database|sql|db/]],
    general: [["urgent", "Rush delivery", 0, /urgent|asap/]],
  };
  const RATE = 12; // typical verified global expert rate, USD/hour (assumption; real offers use each expert's own rate)
  const EXTRA = /shop|store|payment|login|booking|database|admin|multi|pages|animation|متجر|দোকান|दुकान|دکان|商店|tienda|boutique|toko|loja/;
  function estimate(text, fee, picks) {
    picks = picks || {};
    const s = " " + String(text || "").toLowerCase() + " ";
    const words = s.trim().split(/\s+/).filter(Boolean).length;
    if (!words) return null;
    const hits = CATS.filter((c) => c.kw.some((k) => s.includes(k)));
    const cats = hits.length ? hits.slice(0, 3) : [{ id: "general", label: "Digital task", hours: [3, 15] }];
    const urgent = /urgent|asap|today|tomorrow|عاجل|জরুরি|ज़रूरी|فوری|加急|urgente/.test(s);
    const cx = Math.min(1, Math.min(words, 60) / 60 + (EXTRA.test(s) ? .25 : 0));
    let h = 0; cats.forEach((c, i) => { h += (c.hours[0] + (c.hours[1] - c.hours[0]) * cx * .6) * (i ? .45 : 1); });
    const brief = (OPTS[cats[0].id] || []).map(([id, label, add, re]) => { const k = cats[0].id + ":" + id; const on = k in picks ? picks[k] : re.test(s); if (on) h += add; return { key: k, label, on, add }; });
    const round5 = (v) => Math.max(10, Math.round(v / 5) * 5);
    const lo = round5(h * .8 * RATE * (1 + fee)), hi = round5(h * 1.25 * RATE * (1 + fee));
    const days = Math.max(1, Math.round((h * .8) / 6)), days2 = Math.max(days + 1, Math.round((h * 1.25) / 5));
    return { cats, brief, rate: RATE, hours: Math.round(h), lo, hi, days: urgent ? Math.max(1, Math.ceil(days / 2)) : days, days2: urgent ? Math.max(2, Math.ceil(days2 / 1.6)) : days2, urgent,
      confidence: Math.min(.95, (hits.length ? .45 : .15) + Math.min(words, 40) / 80) };
  }
  window.NEstimate = { estimate, CATS };
})();
