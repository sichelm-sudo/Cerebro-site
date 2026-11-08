// Cerebro marketing site - shared behaviour: menu, reveal, tabs (lifecycle + tour), hero network, beta form.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // mobile menu
  const btn = document.querySelector(".menu-btn"), nav = document.getElementById("nav");
  if (btn && nav) btn.addEventListener("click", () => { const open = nav.classList.toggle("open"); btn.setAttribute("aria-expanded", open); btn.textContent = open ? "Close" : "Menu"; });

  // sections ease in as they arrive
  const io = "IntersectionObserver" in window && !reduced ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.1 }) : null;
  document.querySelectorAll(".reveal").forEach(el => (io ? io.observe(el) : el.classList.add("in")));

  // accessible tabs: [role=tablist] with [role=tab] buttons controlling [role=tabpanel]s; arrow keys move
  document.querySelectorAll("[role=tablist]").forEach(list => {
    const tabs = [...list.querySelectorAll("[role=tab]")];
    const select = (t, focus) => {
      tabs.forEach(x => { const on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute("aria-controls")).hidden = !on; });
      if (focus) t.focus();
      if (list.scrollWidth > list.clientWidth) t.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduced ? "auto" : "smooth" });
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", e => {
        const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
        if (e.key === "Home") { e.preventDefault(); select(tabs[0], true); }
        if (e.key === "End") { e.preventDefault(); select(tabs.at(-1), true); }
      });
    });
  });

  // hero background: a faint, slow network with the occasional price pulse (the brand's synapse motif, kept quiet)
  const cv = document.getElementById("net");
  if (cv && !reduced) {
    const ctx = cv.getContext("2d");
    let W, H, nodes = [], edges = [], pulses = [], visible = true;
    const make = () => {
      const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(110, (W * H) / 11000));
      nodes = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .12, vy: (Math.random() - .5) * .12 }));
    };
    const link = () => { edges = []; for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) { const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y); if (d < 150) edges.push([i, j, d]); } };
    make(); link();
    addEventListener("resize", () => { make(); link(); });
    new IntersectionObserver(es => (visible = es[0].isIntersecting)).observe(cv);
    let frame = 0;
    const draw = () => {
      requestAnimationFrame(draw);
      if (!visible) return;
      frame++;
      for (const p of nodes) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
      if (frame % 30 === 0) link();
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      for (const [i, j, d] of edges) { ctx.strokeStyle = `rgba(90,184,255,${0.16 * (1 - d / 150)})`; ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke(); }
      ctx.fillStyle = "rgba(140,200,255,0.55)";
      for (const p of nodes) { ctx.beginPath(); ctx.arc(p.x, p.y, 1.4, 0, 6.283); ctx.fill(); }
      if (edges.length && Math.random() < 0.06) { const e = edges[Math.floor(Math.random() * edges.length)]; pulses.push({ e, t: 0, up: Math.random() > .45 }); }
      for (let k = pulses.length - 1; k >= 0; k--) {
        const u = pulses[k]; u.t += 0.012; if (u.t >= 1 || !nodes[u.e[1]]) { pulses.splice(k, 1); continue; }
        const a = nodes[u.e[0]], b = nodes[u.e[1]];
        ctx.fillStyle = u.up ? "rgba(47,227,154,0.9)" : "rgba(255,84,112,0.8)";
        ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * u.t, a.y + (b.y - a.y) * u.t, 2, 0, 6.283); ctx.fill();
      }
    };
    draw();
  }

  // beta form: no server behind this static site, so it opens an email with the answers filled in -
  // nothing is saved here and the page never says it was
  const form = document.getElementById("beta-form");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(form), msg = document.getElementById("form-msg");
    const email = String(f.get("email") || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = "Please enter a valid email address."; return; }
    if (!f.get("consent")) { msg.textContent = "Please tick the box so we can reply to you."; return; }
    const body = `Email: ${email}\nTrading experience: ${f.get("experience") || "-"}\nMain interest: ${f.get("interest") || "-"}\n\nI agree to Cerebro contacting me about the private beta.`;
    location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent("Cerebro private beta request")}&body=${encodeURIComponent(body)}`;
    msg.textContent = "Your email app should open with your request ready - press send to finish. Nothing has been sent yet.";
  });
})();
