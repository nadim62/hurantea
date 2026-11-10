// HURANTEA "Journey of Creation" — the background zooms out through every scale of existence as you scroll:
// proton → atom → DNA → cell → mind → city → Earth → star system → galaxy → black hole → cosmic web → multiverse.
// One full-screen shader. Each chapter morphs into the next like a powers-of-ten zoom. UI stays black & white;
// colour lives only here. Reduced resolution, ~30 fps, still frame (re-drawn on scroll) with Motion Off / reduced motion.
(function () {
  const root = document.documentElement;
  const CH = [  // six acts of HURANTEA's story, told across twelve scales
    { k: "01", a: "I · Your idea", n: "Proton", s: "10⁻¹⁵ m", c: "Every creation starts as one small idea." },
    { k: "02", a: "I · Your idea", n: "Atom", s: "10⁻¹⁰ m", c: "The idea takes shape." },
    { k: "03", a: "II · Shape the brief", n: "DNA", s: "10⁻⁹ m", c: "Your brief: the code of what you want." },
    { k: "04", a: "II · Shape the brief", n: "Living cell", s: "10⁻⁵ m", c: "The job comes alive.", v: "artist's vision" },
    { k: "05", a: "III · Find the match", n: "Mind", s: "10⁻¹ m", c: "The AI Core compares skills.", v: "artist's vision" },
    { k: "06", a: "III · Find the match", n: "City of makers", s: "10⁴ m", c: "From connections to collaboration.", v: "artist's vision" },
    { k: "07", a: "IV · Worldwide", n: "Earth", s: "10⁷ m", c: "Open to talent everywhere." },
    { k: "08", a: "IV · Worldwide", n: "Star system", s: "10¹³ m", c: "Delivered — and it shines." },
    { k: "09", a: "V · Reach", n: "Galaxy", s: "10²¹ m", c: "Every job grows the network." },
    { k: "10", a: "V · Reach", n: "Black hole", s: "10¹³ m", c: "Trust pulls everything together." },
    { k: "11", a: "V · Reach", n: "Cosmic web", s: "10²⁵ m", c: "Everything connected." },
    { k: "12", a: "VI · What next?", n: "Multiverse", s: "hypothesis · artist's vision", c: "What will you create next?" },
  ];
  const N_CH = CH.length;
  let qual = 1, slowN = -8, slowS = 0, SL = null, canvas, gl, prog, raf = 0, t0 = performance.now(), last = 0, U = {}, mx = 0, my = 0, pmx = 0, pmy = 0, shown = -1, forced = null, cur = 0, curT = 0;

  const FS = `#version 300 es
  precision highp float;
  uniform vec2 uRes, uCenter, uMouse; uniform float uTime, uMix, uScale, uDim, uGain, uBright; uniform int uA, uB; out vec4 o;
  #define PI 3.14159265
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
    return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
  float fbm(vec2 p){ float v = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 5; i++) { v += a*n(p); p = m*p; a *= .5; } return v; }
  float ridge(vec2 p){ float v = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 4; i++) { float k = 1. - abs(n(p)*2. - 1.); v += a*k*k; p = m*p; a *= .5; } return v; }
  mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
  vec3 stars(vec2 p, float d){ vec3 c = vec3(0);
    for (int l = 0; l < 3; l++) { float s = 70. + float(l)*90.; vec2 g = p*s + float(l)*31.7; vec2 id = floor(g); vec2 f = fract(g) - .5; float r = h(id);
      if (r > 1. - .045*d) { vec2 off = vec2(h(id+1.3), h(id+2.7)) - .5; float dd = length(f - off*.6);
        float tw = .65 + .35*sin(uTime*(.6 + r*2.5) + r*50.); c += mix(vec3(.62,.75,1.), vec3(1.,.92,.78), h(id+5.)) * smoothstep(.07, 0., dd) * tw * 1.1; } }
    return c; }

  // 01 proton: three quarks bound by flickering gluon flux tubes, a boiling sea of virtual particles
  vec3 proton(vec2 q){
    q *= .8; float r = length(q), t = uTime*.35; vec3 col = vec3(0);
    float haze = fbm(q*3.5 + vec2(t, -t*.7)) * smoothstep(.75, .1, r);
    col += vec3(.08,.13,.26) * haze * 1.1;
    vec2 Q[3]; vec3 C[3]; C[0] = vec3(1.,.62,.22); C[1] = vec3(.35,.85,1.); C[2] = vec3(.95,.95,1.);
    for (int i = 0; i < 3; i++) { float a = t*.9 + float(i)*2.094; Q[i] = vec2(cos(a), sin(a*1.13))*(.2 + .05*sin(t*2.3 + float(i))); }
    for (int i = 0; i < 3; i++) { vec2 a = Q[i], b = Q[(i+1)%3]; vec2 pa = q - a, ba = b - a; float k = clamp(dot(pa, ba)/dot(ba, ba), 0., 1.);
      float d = length(pa - ba*k); float fl = .55 + .45*n(vec2(k*14. - uTime*4., float(i)*9.));
      col += mix(C[i], C[(i+1)%3], k) * exp(-d*d*900.) * fl * .9 + vec3(.5,.7,1.) * exp(-d*55.) * .08; }
    for (int i = 0; i < 3; i++) { float d = length(q - Q[i]); col += C[i] * (exp(-d*d*2600.)*2.2 + exp(-d*16.)*.35); }
    vec2 g = q*26.; vec2 id = floor(g); float sp = h(id + floor(uTime*3.)); float dd = length(fract(g) - .5);
    col += vec3(.8,.9,1.) * step(.94, sp) * smoothstep(.12, 0., dd) * smoothstep(.8, .2, r) * .8;
    col += vec3(.9,.95,1.) * exp(-pow((r - .52)/.012, 2.)) * .25 * (.6 + .4*n(vec2(atan(q.y, q.x)*8., uTime)));
    return col; }
  // 02 atom: probability clouds of electron orbitals around a tiny bright nucleus
  vec3 atom(vec2 q, vec2 p){
    vec3 col = stars(p, .5) * .4; float r = length(q), a = atan(q.y, q.x), t = uTime*.25;
    q *= 3.4; r = length(q); float s1 = exp(-r*7.); vec2 q2 = rot(t)*q; float p1 = pow(abs(q2.x)/(r + .001), 2.) * exp(-r*4.2) * r * 9.;
    vec2 q3 = rot(-t*.7 + 1.)*q; float p2 = pow(abs(q3.y)/(r + .001), 2.) * exp(-r*3.4) * r * 7.;
    float d2 = pow(abs(cos(2.*(a - t*.5))), 3.) * exp(-r*2.6) * r * r * 22.;
    float grain = .75 + .5*n(q*220. + uTime*6.);
    float dens = (s1*.9 + p1 + p2*.8 + d2*.7) * grain;
    col += mix(vec3(.18,.38,.9), vec3(.7,.82,1.), clamp(dens*.6, 0., 1.)) * dens * .32;
    col += vec3(1.,.8,.5) * exp(-r*r*9000.) * 3.;
    return col; }
  // 03 DNA: a slowly turning double helix with base-pair rungs
  vec3 dna(vec2 q, vec2 p){
    vec3 col = stars(p, .4) * .35; q = rot(-.45)*q*1.05; float t = uTime*.6;
    for (int s = 0; s < 2; s++) { float ph = float(s)*PI;
      for (int k = -14; k <= 14; k++) { float y = float(k)*.055 + mod(t*.12, .055); float a = y*11. + t + ph;
        vec2 c = vec2(sin(a)*.17, y); float z = cos(a); float d = length(q - c);
        col += mix(vec3(.25,.55,1.), vec3(1.,.72,.35), float(s)) * exp(-d*d*(2600. - z*800.)) * (.55 + .45*z) * 1.6; } }
    float a = q.y*11. + t; float x1 = sin(a)*.17, x2 = sin(a + PI)*.17; float onR = step(abs(fract(q.y/.055 + .5) - .5), .08);
    float inX = step(min(x1, x2), q.x) * step(q.x, max(x1, x2));
    col += vec3(.75,.85,1.) * onR * inX * .25 * (.5 + .5*cos(a));
    col *= smoothstep(1.1, .5, abs(q.y));
    return col; }
  // 04 cell: membrane, nucleus, organelles drifting in cytoplasm
  vec3 cell(vec2 q){
    float r = length(q), a = atan(q.y, q.x), t = uTime*.12;
    float R = .55 + .03*sin(a*5. + t*3.) + .02*fbm(vec2(a*3., t));
    float inside = smoothstep(R + .01, R - .01, r);
    vec3 col = vec3(.01,.03,.05);
    float cyt = fbm(q*6. + t) ; col += mix(vec3(.02,.10,.12), vec3(.08,.30,.30), cyt) * inside * .9;
    col += vec3(.45,.95,.85) * exp(-pow((r - R)/.012, 2.)) * .9;
    vec2 nc = vec2(.08, .04); float rn = length(q - nc); float nu = smoothstep(.2, .18, rn + .02*fbm(q*9.));
    col = mix(col, vec3(.10,.08,.20) + vec3(.55,.45,.9)*fbm(q*14. - t)*.6, nu);
    col += vec3(.75,.7,1.) * exp(-pow((rn - .19)/.008, 2.)) * .6;
    col += vec3(1.,.85,.6) * exp(-length(q - nc - vec2(.03,-.02))*40.) * .5;
    for (int i = 0; i < 7; i++) { float fi = float(i); vec2 c = vec2(cos(fi*2.4 + t), sin(fi*1.7 + t*.8)) * (.3 + .08*sin(fi)); vec2 d = rot(fi + t)*(q - c);
      float e = length(d*vec2(1., 2.4)); col += vec3(1.,.62,.25) * smoothstep(.07, .05, e) * .55 * inside + vec3(1.,.7,.4)*exp(-pow((e - .06)/.006, 2.))*.5*inside; }
    return col; }
  // 05 mind: branching neurons with signals racing along them.
  // neural() is shared with the transitions: snap pulls the cell bodies onto a regular grid (→ streets),
  // grow limits how far neurites have reached from each cell body, warm turns nerve light into street light.
  vec3 neural(vec2 w, float snap, float grow, float warm){
    vec2 id = floor(w), f = fract(w); float d1 = 9., d2 = 9.;
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 b = vec2(x, y); vec2 o = mix(vec2(h(id + b), h(id + b + 9.)), vec2(.5), clamp(snap*1.7 - h(id + b + 21.)*.7, 0., 1.)); /* blocks organise one by one */ float d = length(b + o - f); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
    float e = d2 - d1; float axon = (exp(-e*e*420.) + .35*(1. - snap)*smoothstep(.7, 1., ridge(w*3.))) * (.4 + .9*mix(fbm(w*5.), .75, snap));
    axon *= smoothstep(grow, grow - .15, d1);                                   // neurites reach out from the cell bodies
    float cone = exp(-e*e*300.) * exp(-pow((d1 - grow + .05)/.035, 2.)) * step(grow, 2.);   // bright growth cones at the tips
    vec3 col = vec3(.006,.01,.025) + mix(vec3(.16,.34,.75), vec3(1.,.62,.25), warm) * axon * .7;
    float pulse = pow(.5 + .5*sin(d1*14. - uTime*3.5 + h(id)*30.), 18.);
    col += vec3(.75,.95,1.) * cone * 1.4;
    col += mix(vec3(.7,.92,1.), vec3(1.,.95,.85), warm) * axon * pulse * 1.6 * smoothstep(.8, 1.05, grow);   // signals fire once neurites connect; later → traffic
    float soma = (1. - .85*snap) * exp(-d1*d1*140.);
    col += mix(vec3(.55,.8,1.), vec3(1.,.85,.6), warm) * soma * .9 + vec3(1.,.82,.5) * exp(-d1*d1*900.) * (.6 + .4*sin(uTime*2. + h(id)*9.)) * 1.2 * (1. - .85*snap);
    return col; }
  vec2 mindW(vec2 q){ return q*2.2 + 1.3*vec2(fbm(q*1.6 + uTime*.02), fbm(q*1.6 - 7.)); }
  vec3 mind(vec2 q){ return neural(mindW(q), 0., 9., 0.); }
  // 06 city of makers: night city from the air — lit street grid running to a glowing skyline (cityView below)
  // 07 Earth: night side glowing with cities, thin blue atmosphere, sunrise on the limb
  vec3 earth(vec2 q, vec2 p){
    vec3 col = stars(p, 1.); float R = .55; float r = length(q), ang = atan(q.y, q.x);
    // light from the cities streams outward behind the planet, always drifting (artist's vision of a connected world)
    if (r > R*.98) { float sid = floor(ang*22./PI); float lane = fract(ang*22./PI) - .5;
      float run = fract(r*.9 - uTime*(.05 + .05*h(vec2(sid, 1.))) + h(vec2(sid, 2.)));
      col += mix(vec3(1.,.6,.25), vec3(.75,.85,1.), h(vec2(sid, 3.))) * (smoothstep(.16, .0, abs(lane)) + .25*smoothstep(.45, .0, abs(lane))) * smoothstep(.0, .05, run) * smoothstep(.22, .05, run)
             * step(.55, h(vec2(sid, floor(r*.9 - uTime*(.05 + .05*h(vec2(sid, 1.))) + h(vec2(sid, 2.)))))) * exp(-(r - R)*1.8) * .95; }
    if (r < R) { vec3 nn = vec3(q/R, sqrt(1. - dot(q/R, q/R))); vec3 L = normalize(vec3(.9, .25, .2));
      float lon = atan(nn.x, nn.z) + uTime*.04, lat = asin(nn.y); vec2 uv = vec2(lon, lat)*2.2;
      float land = smoothstep(.5, .56, fbm(uv*1.3 + 3.)); float day = smoothstep(-.1, .25, dot(nn, L));
      vec3 dcol = mix(vec3(.02,.08,.22), vec3(.16,.22,.12) + vec3(.12,.10,.06)*fbm(uv*6.), land) + vec3(.9)*smoothstep(.6, .9, fbm(uv*2.5 - uTime*.02))*.5;
      vec2 lc = floor(uv*90.);
      float lights = land * step(.62, n(uv*40.)) * n(uv*90.) * 1.6 * (.88 + .12*sin(uTime*(.6 + .8*h(lc)) + h(lc)*40.));   // cities breathe gently, no blinking
      col = dcol*day*1.2 + vec3(1.,.72,.35)*lights*(1. - day); }
    float rim = exp(-pow((r - R)/.016, 2.)); col += vec3(.35,.65,1.) * rim * .9;
    col += vec3(1.,.85,.6) * exp(-length(q - vec2(R*.93, R*.3))*14.) * .6;
    // flight and data routes: tilted orbits with a moving bright head and a fading trail, hidden behind the globe
    for (int i = 0; i < 3; i++) { float fi = float(i); float tl = .5 + fi*1.9; float rr = R*(1.04 + .07*h(vec2(fi, 1.)));
      vec2 e = rot(-tl)*q; vec2 ee = vec2(e.x, e.y/(.22 + .5*h(vec2(fi, 2.))));
      float dd = abs(length(ee) - rr), a = atan(ee.y, ee.x), front = step(0., ee.y) + step(R, length(q));
      float head = mod(a - (uTime*(.25 + .15*h(vec2(fi, 3.))) + fi*1.7), 6.2832);           // one lap every 15–25 s
      col += mix(vec3(1.,.78,.45), vec3(.7,.88,1.), h(vec2(fi, 4.))) * (exp(-dd*dd*90000.) + .2*exp(-dd*dd*9000.)) * exp(-head*1.4) * min(front, 1.) * 1.5; }
    return col; }
  // 08 star system: a living sun with corona and planets on their orbits
  vec3 starSystem(vec2 q, vec2 p){
    vec3 col = stars(p, 1.); vec2 e = q*vec2(1., 2.3); float r = length(q), re = length(e);
    float cor = fbm(vec2(atan(q.y, q.x)*3., r*6. - uTime*.3));
    col += vec3(1.,.78,.4) * (exp(-r*r*400.)*3. + exp(-r*9.)*.6*(.7 + cor*.6));
    for (int i = 1; i <= 5; i++) { float fi = float(i); float R = .12 + fi*.11; col += vec3(.5,.6,.8) * exp(-pow((re - R)/.002, 2.)) * .18;
      float a = uTime*.25/fi + fi*1.7; vec2 pp = vec2(cos(a), sin(a)/2.3)*R; float d = length(q - pp);
      col += mix(vec3(.5,.75,1.), vec3(1.,.7,.4), fract(fi*.37)) * (exp(-d*d*20000.)*1.5 + exp(-d*60.)*.12); }
    return col; }
  // 09 galaxy: a spiral of a hundred billion suns with dust lanes
  vec3 galaxy(vec2 q, vec2 p){
    vec3 col = stars(p, .7); vec2 e = rot(.4)*q; e.y *= 1.9; float r = length(e), a = atan(e.y, e.x) + uTime*.03;
    float arm = pow(.5 + .5*cos(2.*(a - log(r + .001)*2.6)), 3.);
    float dust = fbm(vec2(a*2. - log(r)*3., r*8.));
    float dens = arm * exp(-r*3.2) * (.5 + dust);
    col += mix(vec3(.45,.6,1.), vec3(1.,.82,.55), exp(-r*6.)) * dens * 1.7;
    col -= vec3(.25,.2,.15) * smoothstep(.55, .75, dust) * arm * exp(-r*3.) * .8;
    col += vec3(1.,.9,.7) * exp(-r*r*120.) * 1.4;
    vec2 g = e*60.; vec2 id = floor(g); col += vec3(.8,.9,1.) * step(.985 - arm*.04, h(id)) * smoothstep(.2, 0., length(fract(g) - .5)) * exp(-r*2.5) * 1.5;
    return max(col, 0.); }
  // 10 black hole: lensed starfield, photon ring, Doppler-bright accretion disk
  vec3 blackHole(vec2 q, vec2 p){
    float rs = .15, r = length(q);
    vec2 lens = q - normalize(q) * (rs*rs*1.35 / max(r, .02));
    vec3 col = stars(p + (lens - q), 1.) * smoothstep(rs*1.05, rs*1.9, r);
    vec2 d = vec2(q.x, q.y/.2); float rd = length(d), ang = atan(d.y, d.x);
    float band = smoothstep(rs*1.45, rs*1.95, rd) * smoothstep(rs*5.6, rs*2.5, rd);
    float swirl = fbm(vec2(ang*3. - uTime*.7/(rd + .15), rd*10.));
    float dop = .5 + .5*cos(ang + PI);
    vec3 hot = mix(vec3(.95,.42,.10), vec3(1.,.95,.82), smoothstep(rs*3.2, rs*1.5, rd));
    vec3 disk = hot * band * (.25 + swirl*1.1) * (.35 + 1.6*dop);
    float shadow = smoothstep(rs, rs*.93, r);
    float halo = smoothstep(rs*2.25, rs*1.5, r) * smoothstep(rs*1.2, rs*1.5, r);
    vec3 haloc = vec3(1.,.78,.45) * halo * (.45 + .7*fbm(vec2(atan(q.y, q.x)*4. - uTime*.35, r*22.)));
    float ring = exp(-pow((r - rs*1.07)/(rs*.03), 2.));
    col = col*(1. - shadow) + haloc*(1. - shadow) + vec3(1.,.9,.76)*ring*1.4;
    col += disk * mix(1. - shadow, 1., step(q.y, 0.));
    return col; }
  // 11 cosmic web: filaments of galaxies around empty voids, clusters glowing at the knots
  vec3 web(vec2 q){
    vec2 g = q*3.4 + .6*vec2(fbm(q*1.8), fbm(q*1.8 + 5.)) + vec2(uTime*.02, 0.); vec2 id = floor(g), f = fract(g); float d1 = 9., d2 = 9.; vec2 c1;
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 b = vec2(x, y); vec2 o = vec2(h(id + b), h(id + b + 9.)); o = .5 + .38*sin(uTime*.05 + 6.28*o);
      float d = length(b + o - f); if (d < d1) { d2 = d1; d1 = d; c1 = b + o; } else if (d < d2) d2 = d; }
    float edge = d2 - d1; float fil = exp(-edge*edge*220.) * (.3 + 1.*fbm(g*5.));
    vec3 col = vec3(.005,.006,.015) + mix(vec3(.2,.38,.9), vec3(.85,.92,1.), fil) * fil * .8;
    col += vec3(1.,.85,.6) * exp(-length(f - c1)*0.) * 0.;
    float knot = exp(-d1*d1*120.) * step(.6, h(id + floor(c1))); col += vec3(1.,.9,.75) * knot * .8;
    col += vec3(.7,.8,1.) * step(.92, h(floor(q*220.))) * fil * .9;
    return col; }
  // 12 multiverse: bubble universes being born, each holding its own sky
  vec3 multiverse(vec2 q, vec2 p){
    vec3 col = vec3(.004,.004,.01);
    for (int i = 0; i < 14; i++) { float fi = float(i); float life = fract(uTime*.03 + fi*.137);
      vec2 c = vec2(h(vec2(fi, 1.)) - .5, h(vec2(fi, 2.)) - .5) * vec2(2.4, 1.4); float R = .06 + .32*life*h(vec2(fi, 3.));
      float d = length(q - c); float inside = smoothstep(R, R - .01, d);
      vec3 tint = mix(vec3(.35,.6,1.), vec3(1.,.75,.4), h(vec2(fi, 4.)));
      col += tint * exp(-pow((d - R)/.006, 2.)) * (1. - life) * 1.2;
      col += stars((q - c)*1.7 + fi, 1.) * inside * tint * 1.2 + tint * inside * pow(fbm((q - c)*6./R*.25 + fi), 2.) * .35;
      col += tint * exp(-(d - R)*18.) * step(R, d) * .08;
      col += vec3(1.) * exp(-d*30.) * smoothstep(.06, 0., life) * 1.5; }
    return col; }


  // DNA → living cell: the helix unwinds and its rungs break, the freed strands pack into the nucleus as chromatin,
  // and the cell is revealed around it (an artist's vision of a change of scale, not cell formation).
  vec3 dnaToCell(vec2 q, vec2 p, float m){
    vec3 col = dna(q, p) * (1. - smoothstep(.0, .22, m));
    float t = uTime*.6, show = smoothstep(.0, .12, m) * (1. - smoothstep(.72, 1., m));
    for (int s = 0; s < 2; s++) { float ph = float(s)*PI;
      for (int k = -14; k <= 14; k++) { float fk = float(k); float y = fk*.055 + mod(t*.12, .055); float a = y*11. + t + ph;
        float unwind = smoothstep(.0, .35, m);
        vec2 hd = vec2(sin(a)*.17*(1. + unwind*1.6) + (float(s)*2. - 1.)*unwind*.12, y);          // strands pull apart
        vec2 hp = rot(.45)*(hd/1.05);                                                             // back to screen space
        float id = fk + 14. + float(s)*29.; float lane = mod(id, 3.);
        float th = id/58.*6.2832 + uTime*.05;
        // biologically honest: DNA lives in the nucleus, so the freed strands pack into it as chromatin
        vec2 tgt = vec2(.08, .04) + vec2(cos(th*3. + lane), sin(th*3. + lane))*(.03 + .14*h(vec2(id, 4.)));
        float d0 = h(vec2(id, 1.))*.18, e = smoothstep(.18 + d0, .7 + d0, m); e = e*e*(3. - 2.*e);
        vec2 pos = mix(hp, tgt, e) + vec2(h(vec2(id, 2.)) - .5, h(vec2(id, 3.)) - .5) * .22 * sin(e*PI);   // drift in the cytoplasm
        float d = length(q - pos);
        vec3 tint = mix(mix(vec3(.25,.55,1.), vec3(1.,.72,.35), float(s)), vec3(.78,.72,1.), e);
        col += tint * (exp(-d*d*2400.)*1.5 + exp(-d*40.)*.08*e) * show; } }
    float grow = smoothstep(.5, 1., m);
    col += cell(q) * grow;
    float rr = mix(.2, .55, smoothstep(.35, .85, m));                   // the cell is revealed around the nucleus
    col += vec3(.45,.95,.85) * exp(-pow((length(q) - rr)/.018, 2.)) * smoothstep(.3, .6, m) * (1. - grow) * .7;
    return col; }


  // Living cell → Mind (artist's vision): the cell cleaves like an early embryo, 1 → 4 → 16, the membranes pinching
  // into furrows (metaballs); the tissue then condenses into neuron bodies, neurites grow out to meet, and signals fire.
  // the brain's own cell pattern (same domain + seeds as neural(), snap 0): d1 = to nucleus, e = to membrane
  vec3 vorB(vec2 w){ vec2 id = floor(w), f = fract(w); float d1 = 9., d2 = 9.;
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 b = vec2(x, y); vec2 o = vec2(h(id + b), h(id + b + 9.)); float d = length(b + o - f); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
    return vec3(d1, d2 - d1, h(id)); }
  vec3 cellToMind(vec2 q, vec2 p, float m){
    // stage 1 — cleavage: the cell divides 1 → 4 → 16, membranes pinching into furrows (metaballs)
    vec2 qw = q + .2*vec2(fbm(q*1.7 + uTime*.04), fbm(q*1.7 + 3.1 - uTime*.04)) - .1;
    float k = smoothstep(.04, .44, m)*2.; float L = min(floor(k), 1.); float f = clamp(k - L, 0., 1.); f = f*f*(3. - 2.*f);
    float cs = 1.31*pow(.5, L), r = cs*mix(.29, .25, f)*(.86 + .28*n(qw*2.3 + 11.));
    vec2 id = floor(qw/cs + .5); float F = 0., nu = 0.;
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 cid = id + vec2(x, y); vec2 c = cid*cs;
      float wgt = (L < .5 && dot(cid, cid) > .5) ? smoothstep(.15, .9, k) : 1.;
      for (int i = 0; i < 4; i++) { vec2 sd = vec2(i == 0 || i == 2 ? -1. : 1., i < 2 ? -1. : 1.);
        float d = length(qw - (c + sd*.25*cs*f)); F += wgt*exp(-d*d/(r*r)); nu += wgt*exp(-d*d/(r*r*.07)); } }
    float furrow = smoothstep(.15, .5, f) * smoothstep(1., .7, f);
    vec3 A = vec3(.01,.03,.05) + mix(vec3(.02,.10,.12), vec3(.08,.30,.30), fbm(qw*14. + uTime*.12)) * smoothstep(.42, .58, F) * .9
           + vec3(.45,.95,.85) * exp(-pow((F - .5)/.09, 2.)) * (.85 + furrow*.6) + vec3(.55,.45,.9) * min(nu, 1.4) * .55;
    A = mix(cell(q), A, smoothstep(.0, .07, m));
    // stage 2 — the cells pack into tissue on the brain's own pattern, so every membrane is a future axon
    vec2 w = mindW(q); vec3 v = vorB(w);
    float morph = smoothstep(.55, .92, m);                                // membranes thin into axons, nuclei into cell bodies
    float diff = smoothstep(-.04, .04, n(q*2.6 + 5.) - mix(1.1, -.1, smoothstep(.42, .7, m)));   // cells differentiate patch by patch
    float memb = exp(-v.y*v.y*mix(260., 900., morph)) * (1. - morph);
    vec3 B = vec3(.008,.02,.035)
           + mix(vec3(.02,.10,.12), vec3(.08,.30,.30), fbm(w*3. + uTime*.1)) * smoothstep(.0, .12, v.y) * .85 * (1. - morph)   // cytoplasm drains
           + mix(vec3(.45,.95,.85), vec3(.5,.72,1.), diff) * memb * (.9 + .3*diff)
           + mix(vec3(.55,.45,.9), vec3(.55,.8,1.), diff) * exp(-v.x*v.x*mix(45., 140., morph)) * .8 * (1. - morph);
    vec3 col = mix(A, B, smoothstep(.36, .52, m));
    col += neural(w, 0., mix(.15, 1.1, smoothstep(.55, .97, m)), 0.) * morph;   // same edges light up as axons
    return col; }

  // City of makers seen from the air: s = how organised the network is, tilt = camera pitch (0 overhead → 1 skyline)
  vec3 cityView(vec2 q, float s, float tilt, float lights){
    float H = .32, zz = 1. - q.y*tilt/H;
    vec3 sky = vec3(.008,.01,.024) + (vec3(.22,.32,.6)*exp(-abs(q.y - H)*9.)*.45 + vec3(1.,.55,.25)*exp(-max(q.y - H, 0.)*16.)*.16) * tilt;
    if (zz < .015) {                                                                       // skyline on the horizon, windows still lit
      vec3 col = sky; float hz = q.y - H;
      for (int l = 0; l < 3; l++) { float fl = float(l); float wdt = mix(44., 14., fl*.5); float cx = floor(q.x*wdt + fl*7.3);
        float top = (.015 + .16*pow(h(vec2(cx, fl)), 2.2) + .09*step(.9, h(vec2(cx, fl + 5.)))) * mix(.45, 1.25, fl*.5);   // towers rise nearer the camera
        if (hz < top) { vec2 wv = vec2(fract(q.x*wdt + fl*7.3)*mix(5., 7., fl*.5), hz*mix(220., 120., fl*.5)); vec2 wid = floor(wv) + vec2(cx*8., fl*99.);
          float win = step(.55, h(wid)) * step(.28, fract(wv.x)) * step(.32, fract(wv.y)) * (.92 + .08*sin(uTime*.4 + h(wid)*40.));
          float edge = smoothstep(.0, .004, top - hz);
          col = mix(col, vec3(.004,.005,.012) + sky*.18*(2. - fl), edge)
              + mix(vec3(1.,.82,.55), vec3(.65,.82,1.), h(wid + 2.)) * win * mix(.45, 1.05, fl*.5) * tilt * edge;
          col += vec3(1.,.4,.25) * step(.82, h(vec2(cx, fl + 9.))) * exp(-pow((top - hz)/.004, 2.)) * (.5 + .5*sin(uTime*2. + cx)) * .6 * tilt; } }   // red beacons on the tallest towers
      return col; }
    vec2 gq = q/zz; gq += .22*(vec2(fbm(gq*.55 + 2.), fbm(gq*.55 + 8.)) - .5);           // older routes stay gently curved
    vec2 w = mix(mindW(q), rot(.3)*gq*2.4, s);
    float fog = mix(1., exp(-max(1./zz - 1., 0.)*.22), tilt);
    vec3 col = neural(w, s, 9., s) * fog;
    vec2 bl = fract(w*6.) - .5, bid = floor(w*6.); vec2 fw = abs(fract(w) - .5); float off = .5 - max(fw.x, fw.y);
    col += mix(vec3(1.,.85,.6), vec3(.6,.8,1.), h(bid + 3.)) * step(.55, h(bid)) * smoothstep(.3, .1, length(bl)) * 1.1
           * lights * smoothstep(.04, .1, off) * fog * (.92 + .08*sin(uTime*.5 + h(bid)*50.));           // windows light up block by block
    { vec2 fr = fract(w); float vx = min(fr.x, 1. - fr.x), hy = min(fr.y, 1. - fr.y); vec2 rid = floor(w + .5);   // traffic, always moving
      for (int dir = 0; dir < 2; dir++) { float sg = dir == 0 ? 1. : -1., lane = sg*.022;
        float tv = w.y*2. + sg*uTime*(.28 + .1*h(vec2(rid.x, 3.))) + h(vec2(rid.x, float(dir)));
        float th = w.x*2. - sg*uTime*(.24 + .1*h(vec2(rid.y, 5.))) + h(vec2(rid.y, float(dir) + 7.));
        vec3 lc = dir == 0 ? vec3(1.,.96,.88) : vec3(1.,.28,.18);                                   // headlights one way, tail lights the other
        col += lc * (smoothstep(.012, .0, abs(vx - abs(lane))) * smoothstep(.16, .0, abs(fract(tv) - .5)) * step(.4, h(vec2(rid.x, floor(tv))))
                  + smoothstep(.012, .0, abs(hy - abs(lane))) * smoothstep(.16, .0, abs(fract(th) - .5)) * step(.4, h(vec2(floor(th), rid.y + 50.))))
               * 1.1 * s * fog; } }
    col += sky * smoothstep(.35, .0, zz) * .6;                                              // haze where the streets meet the horizon
    return col; }

  // Mind → City of makers (artist's vision): the tangled network organises itself — cell bodies snap onto a grid
  // (a Voronoi of a regular grid is a street grid), nerve light warms into street light, signals become traffic,
  // buildings light up between the streets and the camera tilts from overhead to the skyline.
  vec3 mindToCity(vec2 q, vec2 p, float m){
    float s = smoothstep(.0, .5, m); s = s*s*(3. - 2.*s);
    float tilt = smoothstep(.4, .95, m); tilt = tilt*tilt*(3. - 2.*tilt);
    return cityView(q, s, tilt, smoothstep(.3, .75, m)); }

  vec3 scene(int s, vec2 q, vec2 p){
    if (s == 0) return proton(q); if (s == 1) return atom(q, p); if (s == 2) return dna(q, p); if (s == 3) return cell(q);
    if (s == 4) return mind(q); if (s == 5) return cityView(q, 1., 1., 1.); if (s == 6) return earth(q, p); if (s == 7) return starSystem(q, p);
    if (s == 8) return galaxy(q, p); if (s == 9) return blackHole(q, p); if (s == 10) return web(q); return multiverse(q, p); }
  void main(){
    vec2 p = (gl_FragCoord.xy - .5*uRes) / uRes.y;
    vec2 c = (uCenter - .5) * vec2(uRes.x/uRes.y, 1.);
    vec2 q = (p - c) / uScale + uMouse*.03;
    vec2 ps = p + uMouse*.012;
    float m = uMix;
    // powers-of-ten zoom: the old scale shrinks away into the centre while the next scale arrives from close up
    vec3 col;
    if (uA == 2 && uB == 3) col = dnaToCell(q, ps, m);                  // a real process instead of a zoom
    else if (uA == 3 && uB == 4) col = cellToMind(q, ps, m);
    else if (uA == 4 && uB == 5) col = mindToCity(q, ps, m);
    else {
      vec3 A = scene(uA, q * mix(1., 7., m*m), ps);
      vec3 B = scene(uB, q * mix(.16, 1., 1. - (1. - m)*(1. - m)), ps);
      col = mix(A, B, smoothstep(.15, .85, m));
      col += vec3(1.) * exp(-length(q)*6.) * sin(m*PI) * .15;          // flash of the jump between scales
    }
    float idea = length(q); col += vec3(1.) * (exp(-idea*idea*5200.)*.6 + exp(-idea*22.)*.03) * (.75 + .25*sin(uTime*1.7));   // your idea, present at every scale
    col += vec3(.008,.01,.022);
    col *= mix(1. - uDim, 1., smoothstep(-.35, .45, p.x/(uRes.x/uRes.y)*1.6));
    col *= 1. - .3*dot(p, p);
    col *= uGain * uBright;                                            // visitor brightness applies BEFORE the glare cap
    col = 1. - exp(-col*1.1);
    col = min(col, vec3(.82));                                         // never a glaring white wash behind text
    o = vec4(pow(col, vec3(1./1.05)), 1.);
  }`;
  const VS = `#version 300 es
  in vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }`;

  const bright = () => { const v = parseFloat(root.style.getPropertyValue("--bg-bright")); return isFinite(v) && v > 0 ? Math.min(1.4, Math.max(.3, v)) : 1; };
  addEventListener("hurantea-bright", () => { last = 0; if (!raf) start(); });
  const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches || root.dataset.motion === "off";
  function build() {
    const layer = document.querySelector(".universe"); if (!layer || canvas) return !!gl;
    canvas = document.createElement("canvas"); canvas.className = "cosmos"; canvas.setAttribute("aria-hidden", "true");
    layer.insertBefore(canvas, layer.querySelector(".universe-fx"));
    gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!gl) { canvas.remove(); canvas = null; return false; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    try { prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link"); } catch (e) { console.warn("cosmos", e.message); canvas.remove(); canvas = null; gl = null; return false; }
    gl.useProgram(prog);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    for (const k of ["uRes", "uCenter", "uMouse", "uTime", "uMix", "uScale", "uDim", "uGain", "uBright", "uA", "uB"]) U[k] = gl.getUniformLocation(prog, k);
    addEventListener("resize", size); size();
    addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - .5; my = .5 - e.clientY / innerHeight; }, { passive: true });
    addEventListener("scroll", () => { if (!raf) start(); }, { passive: true });
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    layer.classList.add("has-cosmos");
    return true;
  }
  function size() {
    if (!canvas) return; const k = (innerWidth < 700 ? .4 : .5) * qual;
    canvas.width = Math.max(2, Math.round(innerWidth * k)); canvas.height = Math.max(2, Math.round(innerHeight * k));
    gl.viewport(0, 0, canvas.width, canvas.height); last = 0; if (!raf) start();
  }
  function layout() {
    const r = document.body.dataset.route || "home", phone = innerWidth < 900;
    if (r === "home" && scrollY < innerHeight * .6) return phone ? { c: [.62, .22], s: .62, dim: .35, g: .6 } : { c: [.72, .55], s: .78, dim: .66, g: .72 };
    if (r !== "home") return phone ? { c: [.62, .3], s: .66, dim: .5, g: .26 } : { c: [.72, .5], s: .8, dim: .62, g: .4 };   // DIAG-048: calmer behind forms and text pages
    return phone ? { c: [.62, .3], s: .66, dim: .5, g: .42 } : { c: [.7, .5], s: .8, dim: .62, g: .65 };
  }
  // scroll position → chapter (a float: 3.4 = 40% of the way from chapter 4 to 5)
  function target() {
    if (forced !== null) return forced;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    return Math.min(1, Math.max(0, scrollY / max)) * (N_CH - 1);
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (now - last < 33) return; const dt = last ? Math.min(.1, (now - last) / 1000) : 1;
    // DIAG-044 adaptive quality: if a device can't keep ~20 fps, render the background at a lower resolution
    // (never below 45 %) so typing and scrolling stay smooth; checked every 12 drawn frames, after a short warm-up
    if (last && !document.hidden) { slowN++; if (now - last > 50) slowS++; if (slowN >= 12) { if (slowS > 8 && qual > .46) { qual = Math.max(.45, qual * .8); size(); } slowN = slowS = 0; } }
    last = now;
    const tgt = target(); cur += (tgt - cur) * (1 - Math.exp(-dt * 6)); if (Math.abs(tgt - cur) < .0005) cur = tgt;
    const a = Math.min(N_CH - 1, Math.floor(cur + 1e-4)), b = Math.min(N_CH - 1, a + 1), fr = Math.min(1, Math.max(0, cur - a)), m = Math.min(1, Math.max(0, (fr - .3) / .4));
    const t = still() ? 6 : (now - t0) / 1000;
    pmx += (mx - pmx) * .05; pmy += (my - pmy) * .05; const T = layout(); const kk = Math.min(1, dt * 2.5);
    if (!SL) SL = { c: [...T.c], s: T.s, dim: T.dim, g: T.g }; SL.c[0] += (T.c[0] - SL.c[0]) * kk; SL.c[1] += (T.c[1] - SL.c[1]) * kk; SL.s += (T.s - SL.s) * kk; SL.dim += (T.dim - SL.dim) * kk; SL.g += (T.g - SL.g) * kk; const L = SL;
    gl.uniform2f(U.uRes, canvas.width, canvas.height); gl.uniform2f(U.uCenter, L.c[0], L.c[1]); gl.uniform2f(U.uMouse, pmx, pmy);
    gl.uniform1f(U.uTime, t); gl.uniform1f(U.uMix, m); gl.uniform1f(U.uScale, L.s); gl.uniform1f(U.uDim, L.dim); gl.uniform1f(U.uGain, L.g); gl.uniform1f(U.uBright, bright());
    gl.uniform1i(U.uA, a); gl.uniform1i(U.uB, b);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const sh = m > .5 ? b : a;
    if (sh !== shown) { shown = sh; dispatchEvent(new CustomEvent("cosmos-scene", { detail: { i: sh, ...CH[sh] } })); }
    if (still() && cur === tgt) { cancelAnimationFrame(raf); raf = 0; }
  }
  function start() { if (!raf && gl && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }
  function sync() { if (!gl && !build()) return; stop(); start(); }
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ["data-theme", "data-motion"] });
  addEventListener("hashchange", () => { cur = 0; setTimeout(start, 50); });
  const boot = () => { const tryIt = () => (document.querySelector(".universe") ? sync() : setTimeout(tryIt, 120)); tryIt(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.NCosmos = {
    CH, get center() { const L = layout(); return { x: L.c[0], y: 1 - L.c[1], s: L.s, on: !!gl }; }, sync,
    goto(i) { forced = i; cur = i; last = 0; start(); }, free() { forced = null; }, get scene() { return shown; }, get quality() { return qual; },
  };
})();
