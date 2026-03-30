import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ───────────────────── Intersection Observer hook ───────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.unobserve(el); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useReveal(0.12);
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ───────────────────── Magnetic hover effect ───────────────────── */
function Magnetic({ children, strength = 0.3 }) {
  const ref = useRef(null);
  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} style={{ transition: "transform .35s cubic-bezier(.2,.8,.2,1)", display: "inline-block" }}>
      {children}
    </div>
  );
}

/* ───────────────────── Data ───────────────────── */
const PROJECTS = [
  {
    title: "The Trim App",
    href: "https://github.com/waleedalfar/trim",
    desc: "RESTful backend via FastAPI & PostgreSQL for efficient management of user accounts and service listings.",
    tags: ["FastAPI", "PostgreSQL", "Python"],
  },
  {
    title: "First Response AI",
    href: "https://github.com/waleedalfar/firstresponse-ai",
    desc: "AI medical chatbot using LLMs via LangChain — context-aware natural language healthcare queries.",
    tags: ["LangChain", "Python", "AI"],
  },
  {
    title: "Spring Boot API Service",
    href: "https://github.com/waleedalfar/springboot-store",
    desc: "REST API built with Spring Boot & Java, leveraging Maven for dependency management and version control.",
    tags: ["Java", "Spring Boot", "Maven"],
  },
  {
    title: "Sweet Home Bakery",
    href: "https://sweet-home-bakery-website.vercel.app/",
    desc: "Responsive website using HTML, CSS, and JavaScript to improve user experience and accessibility.",
    tags: ["HTML", "CSS", "JavaScript"],
  },
];

const SKILLS = [
  { category: "Languages", items: ["JavaScript", "Python", "C++", "Java", "SQL"] },
  { category: "Frameworks", items: ["React", "Spring Boot", "FastAPI", "Flask", "LangChain"] },
  { category: "Tools & Infra", items: ["GitHub Actions", "Azure", "Power BI", "Maven", "Tailwind CSS"] },
];

const EXPERIENCE = [
  {
    role: "DevOps Engineer Intern",
    company: "CliquePrize",
    period: "2025 — Present",
    bullets: [
      "Built a fully automated data pipeline using Python and GitHub Actions CI/CD to automate daily ingestion of App Store Connect metrics into Power BI, eliminating manual reporting overhead.",
      "Responsible for building, maintaining and conducting QA tests on authentication APIs using GitHub, Microsoft Azure, Google OAuth, and SSO.",
      "Developed backend API integrations with Branch to generate and configure deep links for promotional campaigns, supporting dynamic routing in a Swift iOS application.",
    ],
  },
];

/* ───────────────────── Component ───────────────────── */
export default function Portfolio() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pf">
      {/* Grain overlay */}
      <div className="grain" />

      {/* ── Nav ── */}
      <nav className={`pf-nav ${scrollY > 60 ? "scrolled" : ""}`}>
        <span className="nav-logo">W.</span>
        <div className="nav-links">
          <a href="#experience">Experience</a>
          <a href="#projects">Projects</a>
          <a href="#skills">Skills</a>
          <a href="#contact">Contact</a>
          <Link to="/study" className="nav-cta">Study Timer</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-glow" />
        <Reveal>
          <p className="hero-tag">Software Developer</p>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="hero-name">
            Waleed<br />Alfar<span className="accent-dot">.</span>
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="hero-sub">
            Computer Science @ Arizona State University<br />
            Building data-driven applications & user-centered solutions.
          </p>
        </Reveal>
        <Reveal delay={320}>
          <div className="hero-actions">
            <Magnetic>
              <a href="#contact" className="btn-primary">Get in touch</a>
            </Magnetic>
            <Magnetic>
              <a href="/WaleedAlfar(1).pdf" target="_blank" className="btn-ghost">Resume ↗</a>
            </Magnetic>
          </div>
        </Reveal>
        <div className="scroll-hint" style={{ opacity: Math.max(0, 1 - scrollY / 200) }}>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ── Experience ── */}
      <section id="experience" className="section">
        <Reveal>
          <span className="section-label">01</span>
          <h2 className="section-title">Experience</h2>
        </Reveal>
        {EXPERIENCE.map((exp, i) => (
          <Reveal key={i} delay={120}>
            <div className="exp-card">
              <div className="exp-header">
                <div>
                  <h3 className="exp-role">{exp.role}</h3>
                  <span className="exp-company">{exp.company}</span>
                </div>
                <span className="exp-period">{exp.period}</span>
              </div>
              <ul className="exp-bullets">
                {exp.bullets.map((b, j) => (
                  <Reveal key={j} delay={80 * j}>
                    <li>{b}</li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ── Projects ── */}
      <section id="projects" className="section">
        <Reveal>
          <span className="section-label">02</span>
          <h2 className="section-title">Projects</h2>
        </Reveal>
        <div className="projects-grid">
          {PROJECTS.map((p, i) => (
            <Reveal key={i} delay={i * 90}>
              <a href={p.href} target="_blank" rel="noopener noreferrer" className="proj-card">
                <div className="proj-num">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="proj-title">{p.title}<span className="arrow"> ↗</span></h3>
                <p className="proj-desc">{p.desc}</p>
                <div className="proj-tags">
                  {p.tags.map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="section">
        <Reveal>
          <span className="section-label">03</span>
          <h2 className="section-title">About</h2>
        </Reveal>
        <Reveal delay={100}>
          <div className="about-content">
            <p>
              I'm a Computer Science major and Undergraduate Teaching Assistant at Arizona State University with a passion
              for software development — especially in data-driven applications and user-centered design.
            </p>
            <p>
              I enjoy building solutions that solve real-world problems, from automated data pipelines to AI-powered
              chatbots. Currently seeking opportunities in software engineering where I can make meaningful impact.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Skills ── */}
      <section id="skills" className="section">
        <Reveal>
          <span className="section-label">04</span>
          <h2 className="section-title">Skills</h2>
        </Reveal>
        <div className="skills-grid">
          {SKILLS.map((group, gi) => (
            <Reveal key={gi} delay={gi * 100}>
              <div className="skill-group">
                <h4 className="skill-cat">{group.category}</h4>
                <div className="skill-items">
                  {group.items.map((s) => (
                    <span key={s} className="skill-chip">{s}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="section section-contact">
        <Reveal>
          <span className="section-label">05</span>
          <h2 className="contact-title">Let's connect<span className="accent-dot">.</span></h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="contact-sub">Open to internships, collaborations, and interesting conversations.</p>
        </Reveal>
        <Reveal delay={220}>
          <div className="contact-links">
            <Magnetic>
              <a href="mailto:contact@waleedalfar.com" className="contact-pill">
                <span className="cp-icon">✉</span> Email
              </a>
            </Magnetic>
            <Magnetic>
              <a href="https://github.com/waleedalfar" target="_blank" className="contact-pill">
                <span className="cp-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 17.07 3.633 16.7 3.633 16.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg>
                </span> GitHub
              </a>
            </Magnetic>
            <Magnetic>
              <a href="/WaleedAlfar(1).pdf" target="_blank" className="contact-pill">
                <span className="cp-icon">↓</span> Resume
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </section>

      <footer className="pf-footer">
        <span>© {new Date().getFullYear()} Waleed Alfar</span>
      </footer>

      {/* ────── Styles ────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=General+Sans:wght@300;400;500;600&display=swap');

        /* ── Reset & Tokens ── */
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .pf {
          --bg: #09090b;
          --bg-raised: #111113;
          --bg-hover: #18181b;
          --border: rgba(255,255,255,.06);
          --border-hover: rgba(255,255,255,.12);
          --text: #fafafa;
          --text-secondary: #a1a1aa;
          --text-dim: #52525b;
          --accent: #c8ff32;
          --accent-dim: rgba(200,255,50,.08);
          --radius: 16px;
          font-family: 'General Sans', -apple-system, sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* Grain */
        .grain {
          position: fixed; inset: 0; z-index: 9999;
          pointer-events: none;
          opacity: .028;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 180px;
        }

        /* ── Reveal ── */
        .reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1);
        }
        .reveal.in { opacity: 1; transform: translateY(0); }

        /* ── Nav ── */
        .pf-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 2.5rem;
          transition: background .35s, backdrop-filter .35s, border-color .35s;
          border-bottom: 1px solid transparent;
        }
        .pf-nav.scrolled {
          background: rgba(9,9,11,.8);
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          border-bottom-color: var(--border);
        }
        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.35rem;
          letter-spacing: -.02em;
          color: var(--text);
        }
        .nav-links { display: flex; align-items: center; gap: 2rem; }
        .nav-links a {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: .85rem;
          font-weight: 500;
          letter-spacing: .01em;
          transition: color .25s;
        }
        .nav-links a:hover { color: var(--text); }
        .nav-cta {
          background: var(--accent-dim) !important;
          color: var(--accent) !important;
          padding: .45rem 1rem;
          border-radius: 8px;
          font-size: .82rem !important;
          transition: background .25s !important;
        }
        .nav-cta:hover { background: rgba(200,255,50,.15) !important; }

        /* ── Hero ── */
        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 8rem 2.5rem 4rem;
          position: relative;
          max-width: 900px;
          margin: 0 auto;
        }
        .hero-glow {
          position: absolute;
          width: 600px; height: 600px;
          top: 10%; right: -20%;
          background: radial-gradient(circle, rgba(200,255,50,.06) 0%, transparent 70%);
          pointer-events: none;
          animation: glowDrift 8s ease-in-out infinite alternate;
        }
        @keyframes glowDrift {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-40px, 30px) scale(1.1); }
        }
        .hero-tag {
          font-size: .82rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .18em;
          color: var(--accent);
          margin-bottom: 1.5rem;
        }
        .hero-name {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(3.5rem, 9vw, 7rem);
          line-height: .95;
          letter-spacing: -.035em;
          color: var(--text);
          margin-bottom: 1.5rem;
        }
        .accent-dot { color: var(--accent); }
        .hero-sub {
          font-size: 1.1rem;
          line-height: 1.7;
          color: var(--text-secondary);
          max-width: 480px;
          margin-bottom: 2.5rem;
          font-weight: 400;
        }
        .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
        .btn-primary {
          display: inline-block;
          padding: .75rem 1.75rem;
          background: var(--accent);
          color: #09090b;
          font-weight: 600;
          font-size: .9rem;
          border-radius: 10px;
          text-decoration: none;
          transition: box-shadow .3s, transform .2s;
        }
        .btn-primary:hover {
          box-shadow: 0 0 30px rgba(200,255,50,.25);
        }
        .btn-ghost {
          display: inline-block;
          padding: .75rem 1.75rem;
          border: 1px solid var(--border-hover);
          color: var(--text-secondary);
          font-weight: 500;
          font-size: .9rem;
          border-radius: 10px;
          text-decoration: none;
          transition: border-color .3s, color .3s;
        }
        .btn-ghost:hover { border-color: var(--text-dim); color: var(--text); }

        /* Scroll indicator */
        .scroll-hint {
          position: absolute;
          bottom: 2.5rem;
          left: 50%;
          transform: translateX(-50%);
          transition: opacity .3s;
        }
        .scroll-line {
          width: 1px; height: 48px;
          background: linear-gradient(to bottom, var(--accent), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: .4; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.2); }
        }

        /* ── Sections ── */
        .section {
          max-width: 900px;
          margin: 0 auto;
          padding: 6rem 2.5rem;
        }
        .section-label {
          font-family: 'Syne', sans-serif;
          font-size: .75rem;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: .14em;
          text-transform: uppercase;
          display: block;
          margin-bottom: .6rem;
        }
        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 4.5vw, 3rem);
          font-weight: 700;
          letter-spacing: -.03em;
          margin-bottom: 2.5rem;
        }

        /* ── Experience ── */
        .exp-card {
          background: var(--bg-raised);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2rem;
          transition: border-color .3s;
        }
        .exp-card:hover { border-color: var(--border-hover); }
        .exp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: .5rem; }
        .exp-role { font-weight: 600; font-size: 1.15rem; margin-bottom: .2rem; }
        .exp-company { color: var(--accent); font-weight: 500; font-size: .95rem; }
        .exp-period { color: var(--text-dim); font-size: .85rem; font-weight: 500; white-space: nowrap; }
        .exp-bullets { list-style: none; display: flex; flex-direction: column; gap: 1rem; }
        .exp-bullets li {
          position: relative;
          padding-left: 1.25rem;
          color: var(--text-secondary);
          font-size: .95rem;
          line-height: 1.65;
        }
        .exp-bullets li::before {
          content: '';
          position: absolute;
          left: 0; top: .55rem;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
          opacity: .6;
        }

        /* ── Projects ── */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .proj-card {
          background: var(--bg-raised);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.75rem;
          text-decoration: none;
          color: var(--text);
          display: flex;
          flex-direction: column;
          gap: .6rem;
          transition: border-color .3s, transform .3s, box-shadow .3s;
          position: relative;
          overflow: hidden;
        }
        .proj-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 0%, var(--accent-dim), transparent 60%);
          opacity: 0;
          transition: opacity .4s;
        }
        .proj-card:hover {
          border-color: rgba(200,255,50,.15);
          transform: translateY(-3px);
          box-shadow: 0 8px 40px rgba(0,0,0,.3);
        }
        .proj-card:hover::before { opacity: 1; }
        .proj-num { font-family: 'Syne', sans-serif; font-size: .75rem; color: var(--text-dim); font-weight: 700; letter-spacing: .06em; position: relative; }
        .proj-title { font-weight: 600; font-size: 1.1rem; position: relative; }
        .proj-title .arrow { opacity: 0; transition: opacity .25s, transform .25s; display: inline-block; }
        .proj-card:hover .arrow { opacity: 1; transform: translate(2px, -2px); }
        .proj-desc { color: var(--text-secondary); font-size: .88rem; line-height: 1.6; position: relative; flex: 1; }
        .proj-tags { display: flex; flex-wrap: wrap; gap: .4rem; position: relative; }
        .tag {
          font-size: .72rem;
          padding: .25rem .6rem;
          border-radius: 6px;
          background: rgba(255,255,255,.04);
          border: 1px solid var(--border);
          color: var(--text-dim);
          font-weight: 500;
          letter-spacing: .02em;
        }

        /* ── About ── */
        .about-content {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-width: 640px;
        }
        .about-content p {
          color: var(--text-secondary);
          font-size: 1.05rem;
          line-height: 1.75;
        }

        /* ── Skills ── */
        .skills-grid { display: flex; flex-direction: column; gap: 2rem; }
        .skill-cat {
          font-size: .75rem;
          text-transform: uppercase;
          letter-spacing: .14em;
          color: var(--text-dim);
          font-weight: 600;
          margin-bottom: .75rem;
        }
        .skill-items { display: flex; flex-wrap: wrap; gap: .5rem; }
        .skill-chip {
          padding: .5rem 1rem;
          border-radius: 10px;
          background: var(--bg-raised);
          border: 1px solid var(--border);
          font-size: .88rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: border-color .25s, color .25s, background .25s;
        }
        .skill-chip:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--accent-dim);
        }

        /* ── Contact ── */
        .section-contact { text-align: center; padding-bottom: 4rem; }
        .contact-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          font-weight: 800;
          letter-spacing: -.03em;
          margin-bottom: 1rem;
        }
        .contact-sub {
          color: var(--text-secondary);
          font-size: 1.05rem;
          margin-bottom: 2.5rem;
        }
        .contact-links { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }
        .contact-pill {
          display: inline-flex;
          align-items: center;
          gap: .55rem;
          padding: .7rem 1.4rem;
          background: var(--bg-raised);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          font-size: .9rem;
          transition: border-color .3s, color .3s, background .3s;
        }
        .contact-pill:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--accent-dim);
        }
        .cp-icon { display: flex; align-items: center; font-size: 1.05rem; }

        /* ── Footer ── */
        .pf-footer {
          text-align: center;
          padding: 2rem;
          font-size: .8rem;
          color: var(--text-dim);
          border-top: 1px solid var(--border);
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .pf-nav { padding: 1rem 1.25rem; }
          .nav-links { gap: 1rem; }
          .nav-links a:not(.nav-cta) { display: none; }
          .hero { padding: 7rem 1.25rem 3rem; }
          .section { padding: 4rem 1.25rem; }
          .projects-grid { grid-template-columns: 1fr; }
          .exp-header { flex-direction: column; }
        }

        @media (max-width: 480px) {
          .hero-name { font-size: 3rem; }
          .section-title { font-size: 1.8rem; }
          .contact-title { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}