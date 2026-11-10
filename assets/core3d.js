// HURANTEA AI Core — a living particle intelligence rendered with raw WebGL.
// States (uMorph): 0 = core sphere · 1 = galaxy of talent · 2 = match beam · 3 = deal ring.
// It breathes on its own, swirls with energy when someone types, follows the pointer,
// and morphs as the visitor scrolls through the story. Falls back to a CSS orb without WebGL.
(function () {
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off";
  let gl, prog, canvas, raf = 0, N = 0, t0 = performance.now(), vis = true;
  const S = { ox: 0, oy: 0, oxT: 0, oyT: 0, fade: 1, energy: 0, energyT: 0, morph: 0, morphT: 0, mx: 0, my: 0, rx: 0, ry: 0, hue: 0, hueT: 0, light: false, w: 0, h: 0, dpr: 1, burst: 0 };

  const VS = `#version 300 es
  precision highp float;
  in vec3 aSphere; in vec3 aGalaxy; in vec4 aRand;
  uniform float uTime, uEnergy, uMorph, uAspect, uScale, uBurst; uniform vec2 uRot, uOffset; uniform float uSize;
  out float vAlpha; out float vMix; out float vGlow;
  mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.,-s, 0.,1.,0., s,0.,c); }
  mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1.,0.,0., 0.,c,s, 0.,-s,c); }
  vec3 flow(vec3 p, float t){ // cheap swirling noise field
    return vec3(sin(p.y*3.1+t*1.3)+sin(p.z*2.3-t), sin(p.z*2.7+t*1.1)+sin(p.x*3.3+t*.7), sin(p.x*2.9-t*1.2)+sin(p.y*2.1+t*.9)) * .5; }
  void main(){
    float t = uTime;
    // 0: sphere that breathes; shells give depth
    float shell = mix(.55, 1.0, pow(aRand.x, .35));
    vec3 sph = aSphere * shell * (1. + .025*sin(t*1.6 + aRand.y*6.28));
    sph += flow(sph*1.4, t*.35) * (.05 + uEnergy*.28);
    // 1: galaxy of talent
    vec3 gal = aGalaxy; float ga = t*.06*(1.2-length(gal.xz)*.4); gal.xz = mat2(cos(ga),-sin(ga),sin(ga),cos(ga))*gal.xz;
    // 2: match beam — particles stream along a curve from job (left) to expert (right)
    float k = fract(aRand.z + t*.12*(.5+aRand.w));
    vec3 a = vec3(-1.35,-.15,0.), b = vec3(1.35,.25,0.), c = vec3(0.,.95,0.);
    vec3 beam = mix(mix(a,c,k), mix(c,b,k), k) + (aRand.xyz-.5)*.08*(1.-abs(k-.5));
    // 3: deal ring
    float ra = aRand.y*6.2832 + t*.25; vec3 ring = vec3(cos(ra)*1.05, sin(ra)*1.05, (aRand.x-.5)*.12) * (1. + (aRand.z-.5)*.06);
    vec3 p;
    float m = clamp(uMorph, 0., 3.);
    if (m < 1.) p = mix(sph, gal, smoothstep(0.,1.,m));
    else if (m < 2.) p = mix(gal, beam, smoothstep(0.,1.,m-1.));
    else p = mix(beam, ring, smoothstep(0.,1.,m-2.));
    p += normalize(aSphere) * uBurst * (.4 + aRand.w*.8);
    p = rotX(uRot.y*.6 + .35*sin(t*.07)) * rotY(uRot.x*.9 + t*(.05 + uEnergy*.25) * (m<1.5?1.:.15)) * p;
    float z = p.z + 3.2;
    vec2 sp = p.xy / z * 1.55 * uScale; sp.x /= uAspect;
    gl_Position = vec4(sp + uOffset, 0., 1.);
    float depth = clamp(1.25 - z*.25, .15, 1.);
    gl_PointSize = (1.4 + aRand.w*2.6) * depth * (1. + uEnergy*.7) * uScale * 1.7 * uSize;
    vAlpha = depth * (.35 + .65*aRand.x);
    vMix = aRand.y; vGlow = uEnergy;
  }`;
  const FS = `#version 300 es
  precision highp float;
  in float vAlpha; in float vMix; in float vGlow; uniform float uHue, uLight; out vec4 o;
  void main(){
    vec2 d = gl_PointCoord - .5; float r = dot(d,d); if (r > .25) discard;
    float a = smoothstep(.25, 0., r);
    vec3 c1 = mix(vec3(.80,.84,.92), vec3(.92,.94,1.), uHue);   // cold silver
    vec3 c2 = mix(vec3(1.,1.,1.), vec3(1.,.93,.82), uHue);      // white -> warm white
    vec3 col = mix(c1, c2, vMix); col = mix(col, vec3(1.), .25*a + vGlow*.15);
    if (uLight > .5) { col = mix(col, vec3(.04,.04,.05), .82); o = vec4(col, min(1., a*vAlpha*1.6)); }
    else o = vec4(col * a * vAlpha * 1.05, a*vAlpha);
  }`;

  function compile(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }

  function build(host) {
    canvas = document.createElement("canvas"); canvas.className = "core-canvas"; canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);
    gl = canvas.getContext("webgl2", { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: "high-performance" });
    if (!gl) { host.classList.add("core-fallback"); return false; }
    prog = gl.createProgram(); gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { host.classList.add("core-fallback"); return false; }
    gl.useProgram(prog);
    const weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
    N = innerWidth < 700 ? (weak ? 4000 : 7000) : (weak ? 9000 : 18000);
    const sph = new Float32Array(N * 3), gal = new Float32Array(N * 3), rnd = new Float32Array(N * 4);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, rad = Math.sqrt(1 - y * y), th = golden * i;
      sph[i * 3] = Math.cos(th) * rad; sph[i * 3 + 1] = y; sph[i * 3 + 2] = Math.sin(th) * rad;
      const arm = i % 3, rr = Math.pow(Math.random(), .6) * 1.9 + .05, ang = arm * 2.094 + rr * 2.6 + (Math.random() - .5) * .55;
      gal[i * 3] = Math.cos(ang) * rr; gal[i * 3 + 1] = (Math.random() - .5) * .14 * (2 - rr); gal[i * 3 + 2] = Math.sin(ang) * rr;
      rnd[i * 4] = Math.random(); rnd[i * 4 + 1] = Math.random(); rnd[i * 4 + 2] = Math.random(); rnd[i * 4 + 3] = Math.random();
    }
    for (const [name, data, size] of [["aSphere", sph, 3], ["aGalaxy", gal, 3], ["aRand", rnd, 4]]) {
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, name); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    }
    gl.enable(gl.BLEND);
    resize(); addEventListener("resize", resize);
    addEventListener("pointermove", (e) => { S.mx = e.clientX / innerWidth - .5; S.my = e.clientY / innerHeight - .5; }, { passive: true });
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    return true;
  }
  function resize() {
    if (!canvas) return;
    S.dpr = Math.min(2, devicePixelRatio || 1); const r = canvas.getBoundingClientRect();
    S.w = r.width; S.h = r.height; canvas.width = Math.max(1, r.width * S.dpr); canvas.height = Math.max(1, r.height * S.dpr);
    gl && gl.viewport(0, 0, canvas.width, canvas.height);
  }
  const U = (n) => gl.getUniformLocation(prog, n);
  function frame(now) {
    raf = vis && !document.hidden ? requestAnimationFrame(frame) : 0;
    const t = (now - t0) / 1000;
    S.energy += (S.energyT - S.energy) * .06; S.energyT *= .985;
    S.morph += (S.morphT - S.morph) * .08; S.rx += (S.mx - S.rx) * .04; S.ry += (S.my - S.ry) * .04;
    S.hue += (S.hueT - S.hue) * .03; S.burst *= .9; S.ox += (S.oxT - S.ox) * .06; S.oy += (S.oyT - S.oy) * .06;
    S.light = false;
    gl.blendFunc(S.light ? gl.SRC_ALPHA : gl.ONE, S.light ? gl.ONE_MINUS_SRC_ALPHA : gl.ONE);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(U("uTime"), reduce() ? 0 : t); gl.uniform1f(U("uEnergy"), S.energy); gl.uniform1f(U("uMorph"), S.morph);
    gl.uniform1f(U("uAspect"), S.w / Math.max(1, S.h)); gl.uniform1f(U("uScale"), S.w < 700 ? .95 : Math.min(1.25, Math.max(.62, Math.min(S.w, S.h * 1.3) / 900)));
    gl.uniform2f(U("uRot"), S.rx, S.ry); gl.uniform1f(U("uHue"), S.hue); gl.uniform1f(U("uLight"), S.light ? 1 : 0); gl.uniform1f(U("uBurst"), S.burst); gl.uniform2f(U("uOffset"), S.ox, S.oy); gl.uniform1f(U("uSize"), S.light ? 1.35 : 1.0);
    gl.drawArrays(gl.POINTS, 0, N);
    if (reduce()) { cancelAnimationFrame(raf); raf = 0; }
  }
  function start() { if (!raf && gl) raf = requestAnimationFrame(frame); }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  let stage = null;
  window.NCore = {
    mount(host) { if (!host || stage) return; stage = host; if (build(host)) start(); },
    show(on) { if (!stage) return; stage.classList.toggle("off", !on); vis = on; on ? (resize(), start()) : stop(); },
    pulse(v = .6) { S.energyT = Math.min(1.4, S.energyT + v); start(); },
    morph(v) { S.morphT = v; start(); },
    hue(v) { S.hueT = v; },
    // DIAG-055: the first placement happens instantly, so on page load the sphere never starts in the centre and slides across the text
    offset(x, y) { S.oxT = x; S.oyT = y; if (!S.placed) { S.ox = x; S.oy = y; S.placed = true; } start(); },
    burst() { S.burst = 1; S.energyT = 1.2; start(); },
    get state() { return S; },
  };
})();
