import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

/* ───── Audio chime ───── */
function useChime() {
  const ctx = useRef(null);
  return useCallback(() => {
    try {
      if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)();
      const c = ctx.current, now = c.currentTime;
      [523.25, 659.25, 783.99].forEach((f, i) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0.25, now + i * 0.15);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.7);
        o.connect(g).connect(c.destination);
        o.start(now + i * 0.15); o.stop(now + i * 0.15 + 0.7);
      });
    } catch (_) {}
  }, []);
}

/* ───── Circular progress ───── */
function Ring({ progress, size = 300, stroke = 5, children, color }) {
  const r = (size - stroke * 2) / 2, circ = 2 * Math.PI * r;
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="rgba(255,255,255,.3)" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.04)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#ringGrad)" strokeWidth={stroke + 2}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke-dashoffset .5s ease" }} />
      </svg>
      <div className="ring-inner">{children}</div>
    </div>
  );
}

/* ───── Quotes ───── */
const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus is the art of knowing what to ignore.", author: "James Clear" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
];

/* ───── Particles ───── */
function Particles() {
  const ps = useRef(Array.from({ length: 20 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    s: Math.random() * 2.5 + .8, d: Math.random() * 18 + 12, dl: Math.random() * -15, o: Math.random() * .2 + .03
  }))).current;
  return <div className="sParticles">{ps.map(p => <div key={p.id} className="sp" style={{ left:`${p.x}%`,top:`${p.y}%`,width:p.s,height:p.s,opacity:p.o,animationDuration:`${p.d}s`,animationDelay:`${p.dl}s` }} />)}</div>;
}

/* ───── Main ───── */
export default function Study() {
  const PHASE_CONFIG = {
    work: { label: "Focus", color: "#4f8fff", emoji: "🎯" },
    shortBreak: { label: "Short Break", color: "#38bdf8", emoji: "☕" },
    longBreak: { label: "Long Break", color: "#818cf8", emoji: "🌿" },
  };

  const [durations, setDurations] = useState({ work: 25, shortBreak: 5, longBreak: 15 });
  const [phase, setPhase] = useState("work");
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [history, setHistory] = useState([]);
  const [quoteIdx] = useState(Math.floor(Math.random() * QUOTES.length));
  const intervalRef = useRef(null);
  const playChime = useChime();

  const totalSec = durations[phase] * 60;
  const progress = totalSec > 0 ? elapsed / totalSec : 0;
  const cfg = PHASE_CONFIG[phase];

  // Tick — counts up
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => setElapsed(s => {
      const next = s + 1;
      if (next >= totalSec) { clearInterval(intervalRef.current); return totalSec; }
      return next;
    }), 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, totalSec]);

  // Phase transition when elapsed reaches target
  useEffect(() => {
    if (elapsed < totalSec || !running) return;
    setRunning(false);
    playChime();
    if (phase === "work") {
      const next = sessions + 1;
      setSessions(next);
      setHistory(h => [{ type: "focus", mins: durations.work, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...h].slice(0, 8));
      if (next % 4 === 0) { setPhase("longBreak"); setElapsed(0); }
      else { setPhase("shortBreak"); setElapsed(0); }
    } else {
      setHistory(h => [{ type: phase === "shortBreak" ? "short" : "long", mins: durations[phase], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...h].slice(0, 8));
      setPhase("work"); setElapsed(0);
    }
  }, [elapsed, running, totalSec]);

  const switchPhase = (p) => { setRunning(false); setPhase(p); setElapsed(0); };
  const reset = () => { setRunning(false); setElapsed(0); };
  const adjustTime = (delta) => {
    if (running) return;
    const newMin = Math.max(1, Math.min(90, durations[phase] + delta));
    setDurations(d => ({ ...d, [phase]: newMin }));
    setElapsed(0);
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const totalFocusMins = history.filter(h => h.type === "focus").reduce((a, h) => a + h.mins, 0);
  const dots = Array.from({ length: 4 }, (_, i) => i);
  const q = QUOTES[quoteIdx];

  return (
    <div className="study" style={{ "--phase-color": cfg.color, "--phase-glow": cfg.color + "20" }}>
      <Particles />
      <div className="s-grain" />
      <div className="s-bg s-bg1" />
      <div className="s-bg s-bg2" />
      <div className="s-bg s-bg3" />

      {/* Header */}
      <header className="s-header">
        <Link to="/" className="s-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          Portfolio
        </Link>
        <div className="s-session-badge">{cfg.emoji} {sessions} session{sessions !== 1 ? "s" : ""}</div>
      </header>

      <main className="s-main">
        {/* Phase pills */}
        <div className="s-pills">
          {Object.entries(PHASE_CONFIG).map(([key, { label, emoji }]) => (
            <button key={key} className={`s-pill ${phase === key ? "active" : ""}`} onClick={() => switchPhase(key)}
              style={phase === key ? { background: cfg.color, boxShadow: `0 2px 20px ${cfg.color}30` } : {}}>
              <span className="pill-emoji">{emoji}</span> {label}
            </button>
          ))}
        </div>

        {/* Timer */}
        <div className="timer-area">
          <Ring progress={progress} color={cfg.color}>
            {/* Inline time adjuster */}
            <button className="time-adj" onClick={() => adjustTime(-1)} disabled={running}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/></svg>
            </button>
            <div className="timer-display">
              <span className="t-digits">{mm}</span>
              <span className="t-colon">:</span>
              <span className="t-digits">{ss}</span>
            </div>
            <button className="time-adj" onClick={() => adjustTime(1)} disabled={running}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
            </button>
            <span className="t-label">{cfg.label} · {Math.floor(elapsed / 60)}m / {durations[phase]}m</span>
          </Ring>
        </div>

        {/* Controls */}
        <div className="s-controls">
          <button className="s-btn sec" onClick={reset} title="Reset">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </button>
          <button className="s-btn pri" onClick={() => setRunning(r => !r)} style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`, boxShadow: `0 4px 28px ${cfg.color}35` }}>
            {running
              ? <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/></svg>
              : <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><polygon points="7,4 21,12 7,20"/></svg>
            }
          </button>
          <button className="s-btn sec" onClick={() => { const np = phase === "work" ? (sessions % 4 === 3 ? "longBreak" : "shortBreak") : "work"; switchPhase(np); }} title="Skip">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5,4 15,12 5,20" fill="currentColor"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
          </button>
        </div>

        {/* Session dots */}
        <div className="s-dots">
          {dots.map(i => <span key={i} className={`sdot ${i < sessions % 4 ? "filled" : ""}`} style={i < sessions % 4 ? { background: cfg.color, borderColor: cfg.color } : { borderColor: cfg.color + "60" }} />)}
          <span className="sdot-label">until long break</span>
        </div>

        {/* Bottom cards */}
        <div className="s-bottom">
          {/* Quote */}
          <div className="s-card quote-card">
            <div className="qmark">"</div>
            <p className="q-text">{q.text}</p>
            <span className="q-author">— {q.author}</span>
          </div>

          {/* Stats */}
          <div className="s-card stats-card">
            <h4 className="sc-title">Today's Progress</h4>
            <div className="sc-row"><span className="sc-label">Sessions</span><span className="sc-val" style={{ color: cfg.color }}>{sessions}</span></div>
            <div className="sc-row"><span className="sc-label">Focus Time</span><span className="sc-val" style={{ color: cfg.color }}>{totalFocusMins}m</span></div>
            <div className="sc-row"><span className="sc-label">Current Streak</span><span className="sc-val" style={{ color: cfg.color }}>{sessions % 4}/4</span></div>
            {history.length > 0 && (
              <div className="sc-history">
                <span className="sc-hist-title">Recent</span>
                {history.slice(0, 4).map((h, i) => (
                  <div key={i} className="sc-hist-item">
                    <span>{h.type === "focus" ? "🎯" : h.type === "short" ? "☕" : "🌿"} {h.mins}m</span>
                    <span className="sc-hist-time">{h.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Manrope:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}

.study{
  --bg-0:#06080d;--bg-1:#0a0d14;--bg-2:#0f1219;--bg-3:#141821;
  --surface:rgba(255,255,255,.035);--surface2:rgba(255,255,255,.06);
  --border:rgba(255,255,255,.06);--border2:rgba(255,255,255,.1);
  --text:#eef0f6;--text-2:#a0a5b8;--text-3:#5c6178;
  font-family:'Manrope',-apple-system,sans-serif;
  background:var(--bg-0);color:var(--text);
  min-height:100vh;position:relative;overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
}

.s-bg{position:fixed;inset:0;pointer-events:none;z-index:0}
.s-bg1{background:radial-gradient(ellipse 70% 50% at 50% 0%,color-mix(in srgb,var(--phase-color) 7%,transparent),transparent 70%);transition:background 1s}
.s-bg2{background:radial-gradient(ellipse 50% 40% at 100% 100%,rgba(129,140,248,.03),transparent)}
.s-bg3{background:radial-gradient(ellipse 40% 50% at 0% 60%,rgba(56,189,248,.025),transparent)}

.s-grain{position:fixed;inset:0;z-index:9999;pointer-events:none;opacity:.025;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size:180px}

.sParticles{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.sp{position:absolute;border-radius:50%;background:var(--phase-color);transition:background .8s;animation:spf linear infinite}
@keyframes spf{0%{transform:translateY(0) translateX(0)}25%{transform:translateY(-25px) translateX(12px)}50%{transform:translateY(-8px) translateX(-8px)}75%{transform:translateY(-35px) translateX(6px)}100%{transform:translateY(0) translateX(0)}}

/* Header */
.s-header{display:flex;justify-content:space-between;align-items:center;padding:1.25rem 2rem;position:relative;z-index:10}
.s-back{display:inline-flex;align-items:center;gap:.4rem;color:var(--text-2);text-decoration:none;font-size:.85rem;font-weight:500;transition:color .25s}
.s-back:hover{color:var(--text)}
.s-session-badge{font-size:.82rem;color:var(--text-2);font-weight:500;background:var(--surface);padding:.4rem .85rem;border-radius:8px;border:1px solid var(--border)}

/* Main */
.s-main{display:flex;flex-direction:column;align-items:center;gap:2rem;padding:1rem 1.5rem 3rem;position:relative;z-index:5;max-width:700px;margin:0 auto}

/* Pills */
.s-pills{display:flex;gap:.4rem;background:var(--surface);border-radius:14px;padding:.3rem;border:1px solid var(--border)}
.s-pill{display:inline-flex;align-items:center;gap:.35rem;padding:.5rem 1rem;border:none;border-radius:11px;background:transparent;color:var(--text-3);
  font-family:'Manrope',sans-serif;font-size:.82rem;font-weight:500;cursor:pointer;transition:all .3s}
.s-pill.active{color:#fff}
.s-pill:not(.active):hover{color:var(--text-2);background:var(--surface2)}
.pill-emoji{font-size:.9rem}

/* Timer ring */
.ring-wrap{position:relative;display:grid;place-items:center;filter:drop-shadow(0 0 50px var(--phase-glow));transition:filter .8s}
.ring-wrap svg{position:absolute}
.ring-inner{display:flex;flex-direction:column;align-items:center;gap:.15rem}
.timer-area{animation:fadeScaleIn .6s ease-out both}
@keyframes fadeScaleIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}

/* Inline adjuster */
.time-adj{background:var(--surface);border:1px solid var(--border);border-radius:8px;width:32px;height:32px;
  display:grid;place-items:center;cursor:pointer;color:var(--text-2);transition:all .2s}
.time-adj:hover:not(:disabled){background:var(--surface2);color:var(--text);border-color:var(--border2)}
.time-adj:disabled{opacity:.25;cursor:not-allowed}
.time-adj:active:not(:disabled){transform:scale(.9)}

.timer-display{display:flex;align-items:baseline;gap:0}
.t-digits{font-family:'JetBrains Mono',monospace;font-size:3.8rem;font-weight:700;letter-spacing:.02em;line-height:1}
.t-colon{font-family:'JetBrains Mono',monospace;font-size:3rem;font-weight:400;color:var(--text-3);margin:0 .1rem;animation:blink 1.2s step-end infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
.t-label{font-size:.75rem;text-transform:uppercase;letter-spacing:.12em;color:var(--text-3);font-weight:500;margin-top:.15rem}

/* Controls */
.s-controls{display:flex;align-items:center;gap:.8rem}
.s-btn{border:none;cursor:pointer;display:grid;place-items:center;transition:all .2s}
.s-btn:active{transform:scale(.9)}
.s-btn.pri{width:64px;height:64px;border-radius:50%;color:#fff;transition:box-shadow .3s,transform .15s}
.s-btn.pri:hover{transform:scale(1.04)}
.s-btn.sec{width:42px;height:42px;border-radius:11px;background:var(--surface);color:var(--text-3);border:1px solid var(--border);transition:all .25s}
.s-btn.sec:hover{background:var(--surface2);color:var(--text);border-color:var(--border2)}

/* Session dots */
.s-dots{display:flex;align-items:center;gap:.45rem}
.sdot{width:10px;height:10px;border-radius:50%;border:2px solid;background:transparent;transition:all .35s}
.sdot.filled{transform:scale(1.15)}
.sdot-label{font-size:.72rem;color:var(--text-3);margin-left:.3rem;font-weight:500}

/* Bottom cards */
.s-bottom{display:grid;grid-template-columns:1fr 1fr;gap:1rem;width:100%;margin-top:.5rem}
.s-card{background:linear-gradient(135deg,var(--bg-2),var(--bg-3));border:1px solid var(--border);border-radius:16px;padding:1.5rem;position:relative;overflow:hidden;transition:border-color .3s}
.s-card:hover{border-color:var(--border2)}

/* Quote */
.quote-card{display:flex;flex-direction:column;justify-content:center}
.qmark{font-family:'Syne',sans-serif;font-size:3.5rem;line-height:1;color:var(--phase-color);opacity:.3;transition:color .8s;margin-bottom:-.5rem}
.q-text{font-size:.92rem;line-height:1.65;color:var(--text-2);font-style:italic}
.q-author{font-size:.75rem;color:var(--text-3);margin-top:.6rem;font-weight:500}

/* Stats */
.sc-title{font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;color:var(--text-3);font-weight:600;margin-bottom:.8rem}
.sc-row{display:flex;justify-content:space-between;padding:.35rem 0;border-bottom:1px solid var(--border)}
.sc-row:last-of-type{border-bottom:none}
.sc-label{font-size:.85rem;color:var(--text-2)}
.sc-val{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:.9rem;transition:color .5s}
.sc-history{margin-top:.8rem;padding-top:.6rem;border-top:1px solid var(--border)}
.sc-hist-title{font-size:.68rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3);font-weight:600;display:block;margin-bottom:.4rem}
.sc-hist-item{display:flex;justify-content:space-between;font-size:.78rem;color:var(--text-2);padding:.2rem 0}
.sc-hist-time{color:var(--text-3);font-family:'JetBrains Mono',monospace;font-size:.72rem}

@media(max-width:600px){
  .s-header{padding:1rem 1.25rem}
  .s-main{padding:1rem 1rem 2rem}
  .s-bottom{grid-template-columns:1fr}
  .t-digits{font-size:2.8rem}
  .t-colon{font-size:2.2rem}
  .s-pill{padding:.45rem .75rem;font-size:.78rem}
}
      `}</style>
    </div>
  );
}
