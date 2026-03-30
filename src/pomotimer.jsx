import React, { useEffect, useMemo, useRef, useState } from "react";

const DEFAULTS = {
  workMinutes: 25,
  breakMinutes: 5,
};

const STORAGE_KEY = "study-pomodoro-timer-v1";

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function readStoredState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const now = Date.now();
    const lastSavedAt = typeof parsed.lastSavedAt === "number" ? parsed.lastSavedAt : now;
    const isRunning = Boolean(parsed.isRunning);
    const mode = parsed.mode === "break" ? "break" : "work";
    const status = parsed.status === "paused" ? "paused" : "idle";

    const workMinutes = Number.isFinite(parsed.workMinutes) ? parsed.workMinutes : DEFAULTS.workMinutes;
    const breakMinutes = Number.isFinite(parsed.breakMinutes) ? parsed.breakMinutes : DEFAULTS.breakMinutes;

    const durationSeconds =
      mode === "work" ? workMinutes * 60 : breakMinutes * 60;

    let remainingSeconds = Number.isFinite(parsed.remainingSeconds)
      ? Math.max(0, Math.floor(parsed.remainingSeconds))
      : durationSeconds;

    if (isRunning && typeof parsed.endsAt === "number") {
      const diffSeconds = Math.floor((parsed.endsAt - now) / 1000);
      remainingSeconds = Math.max(0, diffSeconds);
    }

    const elapsedWhileOffline = Math.max(0, Math.floor((now - lastSavedAt) / 1000));
    if (!isRunning && status === "paused") {
      remainingSeconds = Math.max(0, remainingSeconds);
    } else if (!isRunning && status === "idle") {
      remainingSeconds = durationSeconds;
    } else if (isRunning && elapsedWhileOffline > 0 && typeof parsed.endsAt !== "number") {
      remainingSeconds = Math.max(0, remainingSeconds - elapsedWhileOffline);
    }

    return {
      mode,
      isRunning,
      remainingSeconds,
      workMinutes,
      breakMinutes,
    };
  } catch {
    return null;
  }
}

function saveState(state) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        lastSavedAt: Date.now(),
      })
    );
  } catch {
    // Ignore storage failures.
  }
}

export default function PomodoroStudyTimer() {
  const restored = useMemo(() => readStoredState(), []);

  const [workMinutes, setWorkMinutes] = useState(
    restored?.workMinutes ?? DEFAULTS.workMinutes
  );
  const [breakMinutes, setBreakMinutes] = useState(
    restored?.breakMinutes ?? DEFAULTS.breakMinutes
  );
  const [mode, setMode] = useState(restored?.mode ?? "work");
  const [isRunning, setIsRunning] = useState(Boolean(restored?.isRunning));
  const [remainingSeconds, setRemainingSeconds] = useState(
    restored?.remainingSeconds ?? DEFAULTS.workMinutes * 60
  );

  const intervalRef = useRef(null);

  const durationSeconds = mode === "work" ? workMinutes * 60 : breakMinutes * 60;

  useEffect(() => {
    if (restored) return;
    setRemainingSeconds(workMinutes * 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!restored) {
      setRemainingSeconds(mode === "work" ? workMinutes * 60 : breakMinutes * 60);
    }
  }, [mode, workMinutes, breakMinutes, restored]);

  useEffect(() => {
    saveState({
      workMinutes,
      breakMinutes,
      mode,
      isRunning,
      remainingSeconds,
      endsAt: isRunning ? Date.now() + remainingSeconds * 1000 : null,
      status: isRunning ? "running" : "paused",
    });
  }, [workMinutes, breakMinutes, mode, isRunning, remainingSeconds]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isRunning) return;

    intervalRef.current = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          const nextMode = mode === "work" ? "break" : "work";
          const nextDuration = (mode === "work" ? breakMinutes : workMinutes) * 60;
          setMode(nextMode);
          return nextDuration;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, mode, workMinutes, breakMinutes]);

  function handleStartPause() {
    setIsRunning((prev) => !prev);
  }

  function handleReset() {
    setIsRunning(false);
    setMode("work");
    setRemainingSeconds(workMinutes * 60);
  }

  function updateWorkMinutes(value) {
    const next = Math.max(1, Math.min(180, Number(value) || 1));
    setWorkMinutes(next);
    if (mode === "work" && !isRunning) {
      setRemainingSeconds(next * 60);
    }
  }

  function updateBreakMinutes(value) {
    const next = Math.max(1, Math.min(60, Number(value) || 1));
    setBreakMinutes(next);
    if (mode === "break" && !isRunning) {
      setRemainingSeconds(next * 60);
    }
  }

  const progress = durationSeconds > 0 ? 1 - remainingSeconds / durationSeconds : 0;
  const ringStroke = 14;
  const ringRadius = 110;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div>
            <div style={styles.kicker}>Study</div>
            <h1 style={styles.title}>Pomodoro Timer</h1>
          </div>
          <div style={mode === "work" ? styles.badgeWork : styles.badgeBreak}>
            {mode === "work" ? "Work" : "Break"}
          </div>
        </div>

        <div style={styles.timerWrap}>
          <svg width="280" height="280" viewBox="0 0 280 280" aria-hidden="true">
            <circle
              cx="140"
              cy="140"
              r={ringRadius}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={ringStroke}
              fill="none"
            />
            <circle
              cx="140"
              cy="140"
              r={ringRadius}
              stroke="currentColor"
              strokeWidth={ringStroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              transform="rotate(-90 140 140)"
              style={{ color: mode === "work" ? "#7c3aed" : "#06b6d4" }}
            />
          </svg>
          <div style={styles.timerCenter}>
            <div style={styles.time}>{formatTime(remainingSeconds)}</div>
            <div style={styles.subtext}>
              {isRunning ? "Running" : "Paused"}
            </div>
          </div>
        </div>

        <div style={styles.controls}>
          <button style={styles.primaryButton} onClick={handleStartPause}>
            {isRunning ? "Pause" : "Start"}
          </button>
          <button style={styles.secondaryButton} onClick={handleReset}>
            Reset
          </button>
        </div>

        <div style={styles.inputs}>
          <label style={styles.label}>
            Work minutes
            <input
              style={styles.input}
              type="number"
              min="1"
              max="180"
              value={workMinutes}
              onChange={(e) => updateWorkMinutes(e.target.value)}
              disabled={isRunning}
            />
          </label>

          <label style={styles.label}>
            Break minutes
            <input
              style={styles.input}
              type="number"
              min="1"
              max="60"
              value={breakMinutes}
              onChange={(e) => updateBreakMinutes(e.target.value)}
              disabled={isRunning}
            />
          </label>
        </div>

        <div style={styles.footerNote}>
          Auto-switches between work and break. State persists after refresh.
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background:
      "radial-gradient(circle at top, rgba(124,58,237,0.22), transparent 30%), linear-gradient(180deg, #0f172a 0%, #020617 100%)",
    color: "#e2e8f0",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    width: "100%",
    maxWidth: 560,
    borderRadius: 28,
    padding: 28,
    background: "rgba(15, 23, 42, 0.72)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
    backdropFilter: "blur(16px)",
  },
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#94a3b8",
    marginBottom: 6,
  },
  title: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.1,
    fontWeight: 700,
  },
  badgeWork: {
    padding: "10px 14px",
    borderRadius: 999,
    background: "rgba(124,58,237,0.16)",
    color: "#c4b5fd",
    fontWeight: 600,
  },
  badgeBreak: {
    padding: "10px 14px",
    borderRadius: 999,
    background: "rgba(6,182,212,0.16)",
    color: "#67e8f9",
    fontWeight: 600,
  },
  timerWrap: {
    position: "relative",
    width: 280,
    height: 280,
    margin: "10px auto 16px",
  },
  timerCenter: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  time: {
    fontSize: 58,
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: "-0.05em",
  },
  subtext: {
    marginTop: 10,
    fontSize: 15,
    color: "#94a3b8",
  },
  controls: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    marginBottom: 18,
  },
  primaryButton: {
    border: "none",
    padding: "12px 18px",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    color: "white",
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    cursor: "pointer",
    minWidth: 110,
  },
  secondaryButton: {
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "12px 18px",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    color: "#e2e8f0",
    background: "rgba(255,255,255,0.04)",
    cursor: "pointer",
    minWidth: 110,
  },
  inputs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 14,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontSize: 14,
    color: "#cbd5e1",
  },
  input: {
    width: "100%",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#e2e8f0",
    padding: "12px 14px",
    fontSize: 15,
    outline: "none",
  },
  footerNote: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
  },
};
