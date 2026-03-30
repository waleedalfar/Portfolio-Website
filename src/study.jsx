import React, { useState, useEffect, useRef, useCallback } from "react";

const PRESETS = {
  work: { label: "Focus", default: 25 },
  shortBreak: { label: "Short Break", default: 5 },
  longBreak: { label: "Long Break", default: 15 },
};

function useAudioNotification() {
  const audioCtx = useRef(null);
  const play = useCallback(() => {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx.current;
      const now = ctx.currentTime;
      // Three‑tone chime
      [440, 554.37, 659.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, now + i * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.6);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.18);
        osc.stop(now + i * 0.18 + 0.6);
      });
    } catch (_) {}
  }, []);
  return play;
}

function CircularProgress({ progress, size = 280, stroke = 6, children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);
  return (
    <div className="timer-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ring-track)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--ring-active)"
          strokeWidth={stroke + 2}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <div className="timer-ring-inner">{children}</div>
    </div>
  );
}

export default function Study() {
  const [durations, setDurations] = useState({
    work: PRESETS.work.default,
    shortBreak: PRESETS.shortBreak.default,
    longBreak: PRESETS.longBreak.default,
  });
  const [phase, setPhase] = useState("work"); // work | shortBreak | longBreak
  const [secondsLeft, setSecondsLeft] = useState(durations.work * 60);
  const [running, setRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef(null);
  const playChime = useAudioNotification();

  const totalSeconds = durations[phase] * 60;
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;

  // Tick
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // When timer hits zero
  useEffect(() => {
    if (secondsLeft === 0 && running) {
      setRunning(false);
      playChime();
      if (phase === "work") {
        const next = completedSessions + 1;
        setCompletedSessions(next);
        if (next % 4 === 0) {
          setPhase("longBreak");
          setSecondsLeft(durations.longBreak * 60);
        } else {
          setPhase("shortBreak");
          setSecondsLeft(durations.shortBreak * 60);
        }
      } else {
        setPhase("work");
        setSecondsLeft(durations.work * 60);
      }
    }
  }, [secondsLeft, running]);

  const switchPhase = (p) => {
    setRunning(false);
    setPhase(p);
    setSecondsLeft(durations[p] * 60);
  };

  const reset = () => {
    setRunning(false);
    setSecondsLeft(durations[phase] * 60);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const phaseColors = {
    work: { "--ring-active": "#e8503a", "--glow": "rgba(232,80,58,.12)" },
    shortBreak: { "--ring-active": "#3aaf85", "--glow": "rgba(58,175,133,.12)" },
    longBreak: { "--ring-active": "#5b7ee5", "--glow": "rgba(91,126,229,.12)" },
  };

  const dots = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div className="study-page" style={phaseColors[phase]}>
      {/* Ambient background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <header className="study-header">
        <a href="/" className="back-link">← Back</a>
        <button className="settings-toggle" onClick={() => setShowSettings(!showSettings)}>
          {showSettings ? "✕" : "⚙"}
        </button>
      </header>

      {/* Settings drawer */}
      {showSettings && (
        <div className="settings-drawer">
          <h3>Timer Settings</h3>
          {Object.entries(PRESETS).map(([key, { label }]) => (
            <label key={key} className="setting-row">
              <span>{label}</span>
              <div className="stepper">
                <button onClick={() => { const v = Math.max(1, durations[key] - 1); setDurations(d => ({ ...d, [key]: v })); if (phase === key && !running) setSecondsLeft(v * 60); }}>−</button>
                <span className="stepper-val">{durations[key]}m</span>
                <button onClick={() => { const v = Math.min(90, durations[key] + 1); setDurations(d => ({ ...d, [key]: v })); if (phase === key && !running) setSecondsLeft(v * 60); }}>+</button>
              </div>
            </label>
          ))}
        </div>
      )}

      <main className="study-main">
        {/* Phase selector pills */}
        <div className="phase-pills">
          {Object.entries(PRESETS).map(([key, { label }]) => (
            <button key={key} className={`pill ${phase === key ? "active" : ""}`} onClick={() => switchPhase(key)}>
              {label}
            </button>
          ))}
        </div>

        <CircularProgress progress={progress}>
          <span className="timer-digits">{mm}:{ss}</span>
          <span className="timer-label">{PRESETS[phase].label}</span>
        </CircularProgress>

        {/* Controls */}
        <div className="controls">
          <button className="ctrl-btn secondary" onClick={reset} title="Reset">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </button>
          <button className="ctrl-btn primary" onClick={() => setRunning((r) => !r)}>
            {running ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>
            )}
          </button>
          <button className="ctrl-btn secondary" onClick={() => { const nextPhase = phase === "work" ? (completedSessions % 4 === 3 ? "longBreak" : "shortBreak") : "work"; switchPhase(nextPhase); }} title="Skip">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5,4 15,12 5,20"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
          </button>
        </div>

        {/* Session dots */}
        <div className="session-dots">
          {dots.map((i) => (
            <span key={i} className={`dot ${i < completedSessions % 4 ? "filled" : ""}`} />
          ))}
          <span className="session-count">{completedSessions} session{completedSessions !== 1 ? "s" : ""}</span>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600&display=swap');

        .study-page {
          --bg: #0f1118;
          --surface: rgba(255,255,255,.04);
          --surface-hover: rgba(255,255,255,.08);
          --text: #e4e4e7;
          --text-dim: #71717a;
          --ring-track: rgba(255,255,255,.06);
          --glow: rgba(232,80,58,.12);
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: --ring-active 0.5s, --glow 0.5s;
        }

        /* Ambient blobs */
        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          opacity: .55;
          transition: background 0.8s ease;
        }
        .blob-1 {
          width: 500px; height: 500px;
          top: -120px; right: -100px;
          background: var(--ring-active);
          opacity: .10;
        }
        .blob-2 {
          width: 400px; height: 400px;
          bottom: -80px; left: -80px;
          background: var(--ring-active);
          opacity: .07;
        }

        /* Header */
        .study-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.25rem 1.5rem;
          position: relative; z-index: 10;
        }
        .back-link {
          color: var(--text-dim);
          text-decoration: none;
          font-size: .9rem;
          font-weight: 500;
          letter-spacing: .02em;
          transition: color .2s;
        }
        .back-link:hover { color: var(--text); }
        .settings-toggle {
          background: var(--surface);
          border: 1px solid rgba(255,255,255,.06);
          color: var(--text-dim);
          width: 38px; height: 38px;
          border-radius: 10px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background .2s, color .2s;
        }
        .settings-toggle:hover { background: var(--surface-hover); color: var(--text); }

        /* Settings */
        .settings-drawer {
          position: relative; z-index: 10;
          max-width: 340px;
          margin: 0 auto 1rem;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          animation: slideDown .25s ease;
        }
        @keyframes slideDown { from { opacity:0; transform: translateY(-8px); } to { opacity:1; transform: translateY(0); } }
        .settings-drawer h3 {
          font-size: .8rem;
          text-transform: uppercase;
          letter-spacing: .1em;
          color: var(--text-dim);
          margin-bottom: 1rem;
          font-weight: 600;
        }
        .setting-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: .55rem 0;
          font-size: .95rem;
          color: var(--text);
        }
        .stepper { display: flex; align-items: center; gap: .35rem; }
        .stepper button {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,.1);
          background: var(--surface);
          color: var(--text);
          font-size: 1.1rem;
          cursor: pointer;
          display: grid; place-items: center;
          transition: background .2s;
        }
        .stepper button:hover { background: var(--surface-hover); }
        .stepper-val {
          min-width: 40px;
          text-align: center;
          font-family: 'Space Mono', monospace;
          font-size: .95rem;
        }

        /* Main */
        .study-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          padding: 0 1.5rem 3rem;
          position: relative;
          z-index: 5;
        }

        /* Phase pills */
        .phase-pills {
          display: flex;
          gap: .5rem;
          background: var(--surface);
          border-radius: 14px;
          padding: .3rem;
        }
        .pill {
          padding: .5rem 1.15rem;
          border: none;
          border-radius: 11px;
          background: transparent;
          color: var(--text-dim);
          font-family: 'Outfit', sans-serif;
          font-size: .85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all .25s;
        }
        .pill.active {
          background: var(--ring-active);
          color: #fff;
          box-shadow: 0 2px 16px var(--glow);
        }
        .pill:not(.active):hover { color: var(--text); background: var(--surface-hover); }

        /* Timer ring */
        .timer-ring-wrap {
          position: relative;
          display: grid;
          place-items: center;
          filter: drop-shadow(0 0 40px var(--glow));
        }
        .timer-ring-wrap svg { position: absolute; }
        .timer-ring-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: .25rem;
        }
        .timer-digits {
          font-family: 'Space Mono', monospace;
          font-size: 3.6rem;
          font-weight: 700;
          letter-spacing: .04em;
          line-height: 1;
        }
        .timer-label {
          font-size: .8rem;
          text-transform: uppercase;
          letter-spacing: .12em;
          color: var(--text-dim);
          font-weight: 500;
        }

        /* Controls */
        .controls { display: flex; align-items: center; gap: 1rem; }
        .ctrl-btn {
          border: none; cursor: pointer;
          display: grid; place-items: center;
          transition: transform .15s, background .2s, box-shadow .2s;
        }
        .ctrl-btn:active { transform: scale(.93); }
        .ctrl-btn.primary {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: var(--ring-active);
          color: #fff;
          box-shadow: 0 4px 24px var(--glow);
        }
        .ctrl-btn.primary:hover { box-shadow: 0 4px 32px var(--glow), 0 0 0 3px rgba(255,255,255,.08); }
        .ctrl-btn.secondary {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: var(--surface);
          color: var(--text-dim);
          border: 1px solid rgba(255,255,255,.06);
        }
        .ctrl-btn.secondary:hover { background: var(--surface-hover); color: var(--text); }

        /* Session dots */
        .session-dots {
          display: flex; align-items: center; gap: .5rem;
        }
        .dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          border: 2px solid var(--ring-active);
          background: transparent;
          transition: background .3s, border-color .3s;
        }
        .dot.filled { background: var(--ring-active); }
        .session-count {
          font-size: .8rem;
          color: var(--text-dim);
          margin-left: .35rem;
          font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .timer-digits { font-size: 2.8rem; }
          .blob-1 { width: 300px; height: 300px; }
          .blob-2 { width: 250px; height: 250px; }
        }
      `}</style>
    </div>
  );
}