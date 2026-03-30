import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";

/* ───── Intersection Observer reveal ───── */
function useReveal(threshold = 0.13) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); io.unobserve(el); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, v];
}
function Reveal({ children, delay = 0, className = "", direction = "up" }) {
  const [ref, v] = useReveal(0.1);
  const dirs = { up: "translateY(40px)", down: "translateY(-40px)", left: "translateX(40px)", right: "translateX(-40px)", scale: "scale(0.92)" };
  return (
    <div ref={ref} className={className}
      style={{ opacity: v ? 1 : 0, transform: v ? "none" : dirs[direction] || dirs.up,
        transition: `opacity .75s cubic-bezier(.16,1,.3,1) ${delay}ms, transform .75s cubic-bezier(.16,1,.3,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

/* ───── Magnetic hover ───── */
function Magnetic({ children, strength = 0.25 }) {
  const ref = useRef(null);
  const onMove = (e) => { const el = ref.current; if (!el) return; const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*strength}px,${(e.clientY-r.top-r.height/2)*strength}px)`; };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "translate(0,0)"; };
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ transition: "transform .4s cubic-bezier(.2,.8,.2,1)", display: "inline-block" }}>{children}</div>;
}

/* ───── Floating particles ───── */
function Particles({ count = 30 }) {
  const particles = useRef(Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 3 + 1, dur: Math.random() * 20 + 15, delay: Math.random() * -20,
    opacity: Math.random() * 0.3 + 0.05
  }))).current;
  return (
    <div className="particles-wrap">
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity,
          animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`
        }} />
      ))}
    </div>
  );
}

/* ───── Mouse glow follower ───── */
function MouseGlow() {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current) { ref.current.style.left = e.clientX + "px"; ref.current.style.top = e.clientY + "px"; } };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return <div ref={ref} className="mouse-glow" />;
}

/* ───── Staggered counter ───── */
function Counter({ end, suffix = "", duration = 2000 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); io.unobserve(el); } }, { threshold: 0.5 });
    io.observe(el); return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return; let start = null;
    const step = (ts) => { if (!start) start = ts; const p = Math.min((ts - start) / duration, 1); setVal(Math.floor(p * end)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, [started, end, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ───── Data ───── */
const PROJECTS = [
  { title: "The Trim App", href: "https://github.com/waleedalfar/trim", desc: "RESTful backend via FastAPI & PostgreSQL for user accounts and service listings.", tags: ["FastAPI", "PostgreSQL", "Python"], color: "#6366f1" },
  { title: "First Response AI", href: "https://github.com/waleedalfar/firstresponse-ai", desc: "AI medical chatbot using LLMs via LangChain — context-aware healthcare queries.", tags: ["LangChain", "Python", "AI"], color: "#38bdf8" },
  { title: "Spring Boot API", href: "https://github.com/waleedalfar/springboot-store", desc: "REST API with Spring Boot & Java, leveraging Maven for dependency management.", tags: ["Java", "Spring Boot", "Maven"], color: "#818cf8" },
  { title: "Sweet Home Bakery", href: "https://sweet-home-bakery-website.vercel.app/", desc: "Responsive website with HTML, CSS, and JavaScript for improved UX & accessibility.", tags: ["HTML", "CSS", "JavaScript"], color: "#a78bfa" },
];

const SKILLS = [
  { category: "Languages", items: ["JavaScript", "Python", "C++", "Java", "SQL"] },
  { category: "Frameworks", items: ["React", "Spring Boot", "FastAPI", "Flask", "LangChain"] },
  { category: "Tools & Infra", items: ["GitHub Actions", "Azure", "Power BI", "Maven", "Tailwind CSS"] },
];

const EXPERIENCE = [{
  role: "DevOps Engineer Intern", company: "CliquePrize", period: "2025 — Present",
  bullets: [
    "Built a fully automated data pipeline using Python and GitHub Actions CI/CD to automate daily ingestion of App Store Connect metrics into Power BI, eliminating manual reporting overhead.",
    "Responsible for building, maintaining and conducting QA tests on authentication APIs using GitHub, Microsoft Azure, Google OAuth, and SSO.",
    "Developed backend API integrations with Branch to generate and configure deep links for promotional campaigns, supporting dynamic routing in a Swift iOS application.",
  ],
}];

const STATS = [
  { label: "Projects Built", value: 8 },
  { label: "Technologies", value: 14 },
  { label: "Commits This Year", value: 320, suffix: "+" },
];

/* ───── Portfolio ───── */
export default function Portfolio() {
  const [scrollY, setScrollY] = useState(0);
  const [mobileNav, setMobileNav] = useState(false);
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="pf">
      <MouseGlow />
      <Particles />
      <div className="grain" />

      {/* Layered background gradients */}
      <div className="bg-layer bg-1" />
      <div className="bg-layer bg-2" />
      <div className="bg-layer bg-3" />

      {/* ── Nav ── */}
      <nav className={`pf-nav ${scrollY > 50 ? "scrolled" : ""}`}>
        <span className="nav-logo">W<span className="logo-dot">.</span></span>
        <div className={`nav-links ${mobileNav ? "open" : ""}`}>
          <a href="#experience" onClick={() => setMobileNav(false)}>Experience</a>
          <a href="#projects" onClick={() => setMobileNav(false)}>Projects</a>
          <a href="#skills" onClick={() => setMobileNav(false)}>Skills</a>
          <a href="#contact" onClick={() => setMobileNav(false)}>Contact</a>
          <Link to="/study" className="nav-cta" onClick={() => setMobileNav(false)}>Study Timer</Link>
        </div>
        <button className="hamburger" onClick={() => setMobileNav(!mobileNav)}>
          <span className={mobileNav ? "ham open" : "ham"} />
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-orb orb-1" />
        <div className="hero-orb orb-2" />
        <div className="hero-orb orb-3" />
        <Reveal><p className="hero-tag">Software Developer</p></Reveal>
        <Reveal delay={80}>
          <h1 className="hero-name">Waleed<br/>Alfar<span className="accent-dot">.</span></h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="hero-sub">Computer Science @ Arizona State University.<br/>Building data-driven applications & user-centered solutions.</p>
        </Reveal>
        <Reveal delay={260}>
          <div className="hero-actions">
            <Magnetic><a href="#contact" className="btn-primary"><span>Get in touch</span></a></Magnetic>
            <Magnetic><a href="/WaleedAlfar(1).pdf" target="_blank" className="btn-ghost">Resume ↗</a></Magnetic>
          </div>
        </Reveal>
        <Reveal delay={400}>
          <div className="hero-stats">
            {STATS.map((s, i) => (
              <div key={i} className="stat">
                <span className="stat-val"><Counter end={s.value} suffix={s.suffix || ""} /></span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <div className="scroll-cue" style={{ opacity: Math.max(0, 1 - scrollY / 250) }}>
          <div className="scroll-mouse"><div className="scroll-dot" /></div>
          <span className="scroll-text">Scroll</span>
        </div>
      </section>

      {/* ── Experience ── */}
      <section id="experience" className="section">
        <div className="section-divider" />
        <Reveal><span className="section-num">01</span><h2 className="section-title">Experience</h2></Reveal>
        {EXPERIENCE.map((exp, i) => (
          <Reveal key={i} delay={100}>
            <div className="exp-card">
              <div className="exp-glow" />
              <div className="exp-header">
                <div><h3 className="exp-role">{exp.role}</h3><span className="exp-company">{exp.company}</span></div>
                <span className="exp-period">{exp.period}</span>
              </div>
              <ul className="exp-bullets">
                {exp.bullets.map((b, j) => <Reveal key={j} delay={60 * j}><li>{b}</li></Reveal>)}
              </ul>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ── Projects ── */}
      <section id="projects" className="section">
        <div className="section-divider" />
        <Reveal><span className="section-num">02</span><h2 className="section-title">Projects</h2></Reveal>
        <div className="projects-grid">
          {PROJECTS.map((p, i) => (
            <Reveal key={i} delay={i * 80}>
              <a href={p.href} target="_blank" rel="noopener noreferrer" className="proj-card" style={{ "--proj-accent": p.color }}>
                <div className="proj-shine" />
                <div className="proj-top">
                  <span className="proj-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="proj-arrow">↗</span>
                </div>
                <h3 className="proj-title">{p.title}</h3>
                <p className="proj-desc">{p.desc}</p>
                <div className="proj-tags">{p.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="section">
        <div className="section-divider" />
        <Reveal><span className="section-num">03</span><h2 className="section-title">About</h2></Reveal>
        <div className="about-grid">
          <Reveal delay={80}>
            <div className="about-text">
              <p>I'm a Computer Science major and Undergraduate Teaching Assistant at Arizona State University with a passion for software development — especially in data-driven applications and user-centered design.</p>
              <p>I enjoy building solutions that solve real-world problems, from automated data pipelines to AI-powered chatbots. Currently seeking opportunities in software engineering where I can make meaningful impact.</p>
            </div>
          </Reveal>
          <Reveal delay={180} direction="left">
            <div className="about-highlights">
              <div className="highlight-card"><span className="hl-emoji">🎓</span><span>CS Major @ ASU</span></div>
              <div className="highlight-card"><span className="hl-emoji">🧑‍🏫</span><span>Teaching Assistant</span></div>
              <div className="highlight-card"><span className="hl-emoji">⚙️</span><span>DevOps @ CliquePrize</span></div>
              <div className="highlight-card"><span className="hl-emoji">🤖</span><span>AI / ML Enthusiast</span></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Skills ── */}
      <section id="skills" className="section">
        <div className="section-divider" />
        <Reveal><span className="section-num">04</span><h2 className="section-title">Skills</h2></Reveal>
        <div className="skills-cols">
          {SKILLS.map((g, gi) => (
            <Reveal key={gi} delay={gi * 100}>
              <div className="skill-group">
                <h4 className="skill-cat">{g.category}</h4>
                <div className="skill-items">{g.items.map(s => <span key={s} className="skill-chip">{s}</span>)}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="section section-contact">
        <div className="section-divider" />
        <div className="contact-orb" />
        <Reveal><span className="section-num">05</span><h2 className="contact-title">Let's build something<br/>together<span className="accent-dot">.</span></h2></Reveal>
        <Reveal delay={100}><p className="contact-sub">Open to internships, collaborations, and interesting conversations.</p></Reveal>
        <Reveal delay={200}>
          <div className="contact-links">
            <Magnetic><a href="mailto:contact@waleedalfar.com" className="contact-pill">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Email
            </a></Magnetic>
            <Magnetic><a href="https://github.com/waleedalfar" target="_blank" className="contact-pill">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 17.07 3.633 16.7 3.633 16.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </a></Magnetic>
            <Magnetic><a href="/WaleedAlfar(1).pdf" target="_blank" className="contact-pill">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="12" y2="18"/><line x1="15" y1="15" x2="12" y2="18"/></svg>
              Resume
            </a></Magnetic>
          </div>
        </Reveal>
      </section>

      <footer className="pf-footer"><span>© {new Date().getFullYear()} Waleed Alfar</span></footer>

      {/* ────── STYLES ────── */}
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap');

*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}

.pf{
  --accent:#4f8fff;
  --accent-soft:rgba(79,143,255,.12);
  --accent-glow:rgba(79,143,255,.25);
  --accent2:#818cf8;
  --accent3:#38bdf8;
  --bg-0:#06080d;
  --bg-1:#0a0d14;
  --bg-2:#0f1219;
  --bg-3:#141821;
  --surface:rgba(255,255,255,.035);
  --surface-hover:rgba(255,255,255,.07);
  --border:rgba(255,255,255,.06);
  --border-hover:rgba(255,255,255,.13);
  --text:#eef0f6;
  --text-2:#a0a5b8;
  --text-3:#5c6178;
  --radius:16px;
  font-family:'Manrope',-apple-system,sans-serif;
  background:var(--bg-0);
  color:var(--text);
  min-height:100vh;
  overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
  position:relative;
}

/* ── Layered backgrounds ── */
.bg-layer{position:fixed;inset:0;pointer-events:none;z-index:0}
.bg-1{background:radial-gradient(ellipse 80% 60% at 50% -10%,rgba(79,143,255,.07),transparent 70%)}
.bg-2{background:radial-gradient(ellipse 60% 50% at 90% 80%,rgba(129,140,248,.04),transparent 60%)}
.bg-3{background:radial-gradient(ellipse 50% 40% at 10% 50%,rgba(56,189,248,.03),transparent 50%)}

/* ── Grain ── */
.grain{position:fixed;inset:0;z-index:9999;pointer-events:none;opacity:.03;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size:180px}

/* ── Mouse glow ── */
.mouse-glow{position:fixed;width:500px;height:500px;border-radius:50%;pointer-events:none;z-index:1;
  background:radial-gradient(circle,rgba(79,143,255,.045),transparent 65%);
  transform:translate(-50%,-50%);transition:left .15s ease-out,top .15s ease-out}

/* ── Particles ── */
.particles-wrap{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden}
.particle{position:absolute;border-radius:50%;background:var(--accent);
  animation:float linear infinite}
@keyframes float{
  0%{transform:translateY(0) translateX(0)}
  25%{transform:translateY(-30px) translateX(15px)}
  50%{transform:translateY(-10px) translateX(-10px)}
  75%{transform:translateY(-40px) translateX(8px)}
  100%{transform:translateY(0) translateX(0)}
}

/* ── Nav ── */
.pf-nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;
  padding:1.2rem 2.5rem;border-bottom:1px solid transparent;transition:all .35s}
.pf-nav.scrolled{background:rgba(6,8,13,.82);backdrop-filter:blur(24px) saturate(1.5);-webkit-backdrop-filter:blur(24px) saturate(1.5);border-bottom-color:var(--border)}
.nav-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1.4rem;color:var(--text);position:relative;z-index:101}
.logo-dot{color:var(--accent)}
.nav-links{display:flex;align-items:center;gap:2rem}
.nav-links a{color:var(--text-2);text-decoration:none;font-size:.85rem;font-weight:500;transition:color .25s;position:relative}
.nav-links a:hover{color:var(--text)}
.nav-links a::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:1.5px;background:var(--accent);transition:width .3s}
.nav-links a:hover::after{width:100%}
.nav-cta{background:var(--accent-soft)!important;color:var(--accent)!important;padding:.45rem 1.05rem;border-radius:8px;font-size:.82rem!important;transition:background .25s!important}
.nav-cta::after{display:none!important}
.nav-cta:hover{background:rgba(79,143,255,.2)!important}
.hamburger{display:none;background:none;border:none;cursor:pointer;width:36px;height:36px;position:relative;z-index:101}
.ham{display:block;width:22px;height:2px;background:var(--text);position:relative;transition:all .3s}
.ham::before,.ham::after{content:'';position:absolute;width:22px;height:2px;background:var(--text);transition:all .3s}
.ham::before{top:-7px}.ham::after{top:7px}
.ham.open{background:transparent}.ham.open::before{top:0;transform:rotate(45deg)}.ham.open::after{top:0;transform:rotate(-45deg)}

/* ── Hero ── */
.hero{min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:8rem 2.5rem 4rem;position:relative;max-width:960px;margin:0 auto;z-index:2}
.hero-orb{position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none;animation:orbFloat 10s ease-in-out infinite alternate}
.orb-1{width:400px;height:400px;top:-5%;right:-8%;background:rgba(79,143,255,.1)}
.orb-2{width:300px;height:300px;bottom:15%;left:-12%;background:rgba(129,140,248,.07);animation-delay:-3s;animation-duration:12s}
.orb-3{width:200px;height:200px;top:40%;right:10%;background:rgba(56,189,248,.06);animation-delay:-6s;animation-duration:14s}
@keyframes orbFloat{0%{transform:translate(0,0) scale(1)}100%{transform:translate(-30px,25px) scale(1.12)}}

.hero-tag{font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.2em;
  background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  margin-bottom:1.5rem}
.hero-name{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(3.2rem,8.5vw,6.8rem);line-height:.93;letter-spacing:-.04em;margin-bottom:1.5rem}
.accent-dot{color:var(--accent)}
.hero-sub{font-size:1.1rem;line-height:1.75;color:var(--text-2);max-width:500px;margin-bottom:2.5rem}

.hero-actions{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:3rem}
.btn-primary{display:inline-flex;align-items:center;padding:.8rem 1.8rem;
  background:linear-gradient(135deg,var(--accent),#6366f1);color:#fff;font-weight:600;font-size:.9rem;
  border-radius:12px;text-decoration:none;position:relative;overflow:hidden;transition:box-shadow .3s,transform .15s}
.btn-primary:hover{box-shadow:0 0 40px var(--accent-glow),0 4px 20px rgba(0,0,0,.3)}
.btn-primary span{position:relative;z-index:1}
.btn-ghost{display:inline-flex;align-items:center;padding:.8rem 1.8rem;border:1px solid var(--border-hover);color:var(--text-2);font-weight:500;font-size:.9rem;border-radius:12px;text-decoration:none;transition:all .3s}
.btn-ghost:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-soft)}

.hero-stats{display:flex;gap:3rem}
.stat{display:flex;flex-direction:column}
.stat-val{font-family:'Syne',sans-serif;font-weight:800;font-size:2rem;
  background:linear-gradient(135deg,var(--accent),var(--accent3));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.stat-label{font-size:.78rem;color:var(--text-3);font-weight:500;letter-spacing:.04em;margin-top:.15rem}

/* Scroll cue */
.scroll-cue{position:absolute;bottom:2.5rem;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:.5rem;transition:opacity .3s}
.scroll-mouse{width:22px;height:34px;border-radius:11px;border:1.5px solid var(--text-3);position:relative}
.scroll-dot{width:3px;height:7px;border-radius:2px;background:var(--accent);position:absolute;left:50%;top:6px;transform:translateX(-50%);animation:scrollBounce 1.8s ease-in-out infinite}
@keyframes scrollBounce{0%,100%{transform:translateX(-50%) translateY(0);opacity:1}50%{transform:translateX(-50%) translateY(8px);opacity:.3}}
.scroll-text{font-size:.65rem;text-transform:uppercase;letter-spacing:.16em;color:var(--text-3)}

/* ── Sections ── */
.section{max-width:960px;margin:0 auto;padding:5rem 2.5rem;position:relative;z-index:2}
.section-divider{width:48px;height:1.5px;background:linear-gradient(90deg,var(--accent),transparent);margin-bottom:2rem;opacity:.5}
.section-num{font-family:'Syne',sans-serif;font-size:.72rem;font-weight:700;color:var(--accent);letter-spacing:.15em;display:block;margin-bottom:.4rem}
.section-title{font-family:'Syne',sans-serif;font-size:clamp(1.9rem,4vw,2.8rem);font-weight:700;letter-spacing:-.03em;margin-bottom:2.5rem}

/* ── Experience ── */
.exp-card{background:linear-gradient(135deg,var(--bg-2),var(--bg-3));border:1px solid var(--border);border-radius:var(--radius);padding:2rem;position:relative;overflow:hidden;transition:border-color .3s}
.exp-card:hover{border-color:var(--border-hover)}
.exp-glow{position:absolute;top:-40%;right:-20%;width:300px;height:300px;background:radial-gradient(circle,rgba(79,143,255,.06),transparent 70%);pointer-events:none}
.exp-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.5rem;flex-wrap:wrap;gap:.5rem;position:relative}
.exp-role{font-weight:600;font-size:1.15rem;margin-bottom:.2rem}
.exp-company{background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:600;font-size:.95rem}
.exp-period{color:var(--text-3);font-size:.82rem;font-weight:500;white-space:nowrap}
.exp-bullets{list-style:none;display:flex;flex-direction:column;gap:1rem;position:relative}
.exp-bullets li{position:relative;padding-left:1.25rem;color:var(--text-2);font-size:.93rem;line-height:1.7}
.exp-bullets li::before{content:'';position:absolute;left:0;top:.6rem;width:6px;height:6px;border-radius:50%;background:var(--accent);opacity:.5}

/* ── Projects ── */
.projects-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem}
.proj-card{background:linear-gradient(145deg,var(--bg-2),var(--bg-3));border:1px solid var(--border);border-radius:var(--radius);padding:1.75rem;text-decoration:none;color:var(--text);display:flex;flex-direction:column;gap:.5rem;position:relative;overflow:hidden;
  transition:border-color .35s,transform .35s,box-shadow .35s}
.proj-shine{position:absolute;top:-50%;left:-50%;width:200%;height:200%;
  background:conic-gradient(from 180deg at 50% 50%,transparent 0%,var(--proj-accent) 5%,transparent 10%);
  opacity:0;transition:opacity .5s;animation:shineRotate 4s linear infinite paused}
.proj-card:hover .proj-shine{opacity:.04;animation-play-state:running}
@keyframes shineRotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
.proj-card:hover{border-color:color-mix(in srgb,var(--proj-accent) 30%,transparent);transform:translateY(-4px);box-shadow:0 12px 48px rgba(0,0,0,.35)}
.proj-top{display:flex;justify-content:space-between;align-items:center;position:relative}
.proj-num{font-family:'Syne',sans-serif;font-size:.72rem;color:var(--text-3);font-weight:700;letter-spacing:.06em}
.proj-arrow{color:var(--text-3);font-size:1.1rem;opacity:0;transform:translate(-4px,4px);transition:all .3s}
.proj-card:hover .proj-arrow{opacity:1;transform:translate(0,0);color:var(--proj-accent)}
.proj-title{font-weight:600;font-size:1.05rem;position:relative}
.proj-desc{color:var(--text-2);font-size:.86rem;line-height:1.6;position:relative;flex:1}
.proj-tags{display:flex;flex-wrap:wrap;gap:.35rem;position:relative}
.tag{font-size:.7rem;padding:.2rem .55rem;border-radius:6px;background:rgba(255,255,255,.035);border:1px solid var(--border);color:var(--text-3);font-weight:500}

/* ── About ── */
.about-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:2.5rem;align-items:start}
.about-text{display:flex;flex-direction:column;gap:1.25rem}
.about-text p{color:var(--text-2);font-size:1.02rem;line-height:1.75}
.about-highlights{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
.highlight-card{display:flex;align-items:center;gap:.65rem;padding:.85rem 1rem;background:linear-gradient(135deg,var(--bg-2),var(--bg-3));
  border:1px solid var(--border);border-radius:12px;font-size:.88rem;font-weight:500;color:var(--text-2);transition:border-color .3s,transform .2s}
.highlight-card:hover{border-color:var(--border-hover);transform:translateY(-2px)}
.hl-emoji{font-size:1.3rem}

/* ── Skills ── */
.skills-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem}
.skill-cat{font-size:.72rem;text-transform:uppercase;letter-spacing:.14em;color:var(--text-3);font-weight:600;margin-bottom:.75rem}
.skill-items{display:flex;flex-wrap:wrap;gap:.45rem}
.skill-chip{padding:.5rem .95rem;border-radius:10px;background:linear-gradient(135deg,var(--bg-2),var(--bg-3));border:1px solid var(--border);
  font-size:.85rem;font-weight:500;color:var(--text-2);transition:all .3s;cursor:default}
.skill-chip:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-soft);transform:translateY(-2px);box-shadow:0 4px 16px rgba(79,143,255,.1)}

/* ── Contact ── */
.section-contact{text-align:center;padding-bottom:4rem;position:relative;overflow:hidden}
.contact-orb{position:absolute;width:500px;height:500px;border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);
  background:radial-gradient(circle,rgba(79,143,255,.06),transparent 65%);pointer-events:none}
.contact-title{font-family:'Syne',sans-serif;font-size:clamp(2rem,4.5vw,3.2rem);font-weight:800;letter-spacing:-.03em;margin-bottom:1rem;line-height:1.15}
.contact-sub{color:var(--text-2);font-size:1.02rem;margin-bottom:2.5rem}
.contact-links{display:flex;justify-content:center;gap:.8rem;flex-wrap:wrap}
.contact-pill{display:inline-flex;align-items:center;gap:.55rem;padding:.7rem 1.3rem;background:linear-gradient(135deg,var(--bg-2),var(--bg-3));
  border:1px solid var(--border);border-radius:12px;color:var(--text-2);text-decoration:none;font-weight:500;font-size:.88rem;transition:all .3s}
.contact-pill:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-soft);transform:translateY(-2px);box-shadow:0 4px 20px rgba(79,143,255,.12)}

/* ── Footer ── */
.pf-footer{text-align:center;padding:2rem;font-size:.78rem;color:var(--text-3);border-top:1px solid var(--border);position:relative;z-index:2}

/* ── Mobile ── */
@media(max-width:768px){
  .pf-nav{padding:1rem 1.25rem}
  .hamburger{display:block}
  .nav-links{position:fixed;inset:0;background:rgba(6,8,13,.96);backdrop-filter:blur(24px);flex-direction:column;justify-content:center;align-items:center;gap:1.5rem;
    opacity:0;pointer-events:none;transition:opacity .3s;z-index:100}
  .nav-links.open{opacity:1;pointer-events:auto}
  .nav-links a{font-size:1.2rem}
  .hero{padding:7rem 1.25rem 3rem}
  .section{padding:3.5rem 1.25rem}
  .projects-grid{grid-template-columns:1fr}
  .about-grid{grid-template-columns:1fr}
  .skills-cols{grid-template-columns:1fr}
  .hero-stats{gap:1.5rem}
  .stat-val{font-size:1.5rem}
  .exp-header{flex-direction:column}
}
@media(max-width:480px){
  .hero-name{font-size:2.8rem}
  .section-title{font-size:1.7rem}
  .contact-title{font-size:1.8rem}
  .about-highlights{grid-template-columns:1fr}
  .hero-stats{flex-wrap:wrap;gap:1.2rem}
}
      `}</style>
    </div>
  );
}