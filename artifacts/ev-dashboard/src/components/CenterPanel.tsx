import { useState, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import type { Theme } from "@/context/ThemeContext";
import { useNav } from "@/context/NavContext";
import type { ViewMode } from "@/context/NavContext";

export default function CenterPanel() {
  const { theme } = useTheme();
  const { setView } = useNav();
  const [isPlaying, setIsPlaying] = useState(false);
  const [temperature, setTemperature] = useState(18);
  const [fanSpeed, setFanSpeed] = useState(0); // 0 = off, 1/2/3 = speed

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        height: "100%",
        minHeight: 0,
      }}
    >
      <div onClick={() => setView("weather")} style={{ cursor: "pointer" }}>
        <WeatherCard theme={theme} />
      </div>
      <div onClick={() => setView("music")} style={{ cursor: "pointer" }}>
        <MusicCard theme={theme} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", flexShrink: 0 }}>
        <TemperatureCard theme={theme} temperature={temperature} setTemperature={setTemperature} onOpen={() => setView("climate")} />
        <FanCard theme={theme} fanSpeed={fanSpeed} setFanSpeed={setFanSpeed} />
      </div>
      <QuickActions theme={theme} setView={setView} />
    </div>
  );
}

function WeatherCard({ theme }: { theme: Theme }) {
  return (
    <div
      style={{
        background: theme.panelBg,
        borderRadius: "18px",
        padding: "20px 20px",
        border: `1px solid ${theme.border}`,
        boxShadow: theme.mode === "night" ? "0 4px 20px rgba(0,0,0,0.25)" : "0 2px 10px rgba(0,0,0,0.07)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <div>
        <div style={{ fontSize: "11px", color: theme.textMuted, fontWeight: 600, marginBottom: "5px" }}>Sarawak</div>
        <div style={{ fontSize: "20px", fontWeight: 800, color: theme.text, lineHeight: 1.1 }}>Kota Samarahan</div>
        <div style={{ fontSize: "13px", color: theme.textSub, marginTop: "5px" }}>Mostly Sunny</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
        <WeatherIcon />
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "20px", fontWeight: 800, color: theme.text }}>30°</span>
          <span style={{ fontSize: "13px", color: theme.textMuted }}>/ 19°</span>
        </div>
      </div>
    </div>
  );
}

function WeatherIcon() {
  return (
    <svg width="56" height="48" viewBox="0 0 60 50">
      <circle cx="40" cy="18" r="11" fill="#ffd750" opacity="0.95" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
        <line key={i}
          x1={40 + 14 * Math.cos(a * Math.PI / 180)}
          y1={18 + 14 * Math.sin(a * Math.PI / 180)}
          x2={40 + 19 * Math.cos(a * Math.PI / 180)}
          y2={18 + 19 * Math.sin(a * Math.PI / 180)}
          stroke="#ffd750" strokeWidth="2.5" strokeLinecap="round"
        />
      ))}
      <ellipse cx="22" cy="36" rx="16" ry="10" fill="#9ab4d8" />
      <ellipse cx="13" cy="40" rx="11" ry="9" fill="#aac4e8" />
      <ellipse cx="29" cy="40" rx="12" ry="9" fill="#aac4e8" />
      <ellipse cx="22" cy="44" rx="18" ry="6" fill="#bad4f4" />
    </svg>
  );
}

function MusicCard({ theme, isPlaying, setIsPlaying }: {
  theme: Theme; isPlaying: boolean; setIsPlaying: (v: boolean) => void;
}) {
  const [progress, setProgress] = useState(0);
  const totalSeconds = 140;
  const currentSeconds = Math.round((progress / 100) * totalSeconds);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div
      style={{
        background: theme.panelBg,
        borderRadius: "18px",
        border: `1px solid ${theme.border}`,
        boxShadow: theme.mode === "night" ? "0 4px 20px rgba(0,0,0,0.25)" : "0 2px 10px rgba(0,0,0,0.07)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Album art banner */}
      <div style={{
        height: "96px",
        position: "relative",
        background: "linear-gradient(135deg, #1a0533 0%, #2d1060 40%, #5b1f9e 70%, #8b3fcf 100%)",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        <svg viewBox="0 0 300 96" width="100%" height="96" preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e8d8f8" />
              <stop offset="50%" stopColor="#c0a0e8" />
              <stop offset="100%" stopColor="#8060c0" />
            </linearGradient>
            <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f0c8a0" />
              <stop offset="100%" stopColor="#d8a080" />
            </linearGradient>
            <linearGradient id="rainbowEye" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff6b9d" />
              <stop offset="33%" stopColor="#ffd93d" />
              <stop offset="66%" stopColor="#4d96ff" />
              <stop offset="100%" stopColor="#9b59b6" />
            </linearGradient>
          </defs>
          <ellipse cx="80" cy="65" rx="44" ry="60" fill="url(#skinGrad)" />
          <ellipse cx="80" cy="25" rx="50" ry="40" fill="url(#hairGrad)" />
          <rect x="30" y="22" width="16" height="60" rx="8" fill="url(#hairGrad)" />
          <rect x="114" y="22" width="14" height="55" rx="7" fill="url(#hairGrad)" />
          <ellipse cx="65" cy="62" rx="13" ry="6" fill="url(#rainbowEye)" opacity="0.9" />
          <ellipse cx="95" cy="62" rx="13" ry="6" fill="url(#rainbowEye)" opacity="0.9" />
          <ellipse cx="65" cy="62" rx="8" ry="5" fill="#1a0533" />
          <ellipse cx="95" cy="62" rx="8" ry="5" fill="#1a0533" />
          <ellipse cx="63" cy="59" rx="2.5" ry="2" fill="white" opacity="0.7" />
          <ellipse cx="93" cy="59" rx="2.5" ry="2" fill="white" opacity="0.7" />
          <path d="M70 78 Q80 84 90 78" stroke="#e06080" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <ellipse cx="52" cy="72" rx="9" ry="5" fill="#ffb0c0" opacity="0.4" />
          <ellipse cx="108" cy="72" rx="9" ry="5" fill="#ffb0c0" opacity="0.4" />
        </svg>

        {/* Track info */}
        <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", textAlign: "right" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#f0f0f0", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
            Almost is Never Enough
          </div>
          <div style={{ fontSize: "11px", color: "rgba(240,240,240,0.75)", marginTop: "3px" }}>Ariana Grande</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div>
          <div style={{ position: "relative", marginBottom: "5px" }}>
            <div style={{ background: theme.sliderTrack, borderRadius: "4px", height: "4px", overflow: "hidden" }}>
              <div style={{ background: theme.mode === "night" ? "#ccc" : "#555", height: "100%", width: `${progress}%`, transition: "width 0.2s" }} />
            </div>
            <input type="range" min={0} max={100} value={progress}
              onChange={e => setProgress(Number(e.target.value))}
              style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", cursor: "pointer", height: "4px" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "10px", color: theme.textMuted }}>{fmt(currentSeconds)}</span>
            <span style={{ fontSize: "10px", color: theme.textMuted }}>2:20</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px" }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: theme.textSub, padding: "4px", display: "flex" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: "none", border: `2px solid ${theme.textSub}`,
              borderRadius: "50%", width: "50px", height: "50px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: theme.text,
            }}
          >
            {isPlaying
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            }
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: theme.textSub, padding: "4px", display: "flex" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function TemperatureCard({ theme, temperature, setTemperature, onOpen }: {
  theme: Theme;
  temperature: number;
  setTemperature: (v: number) => void;
  onOpen: () => void;
}) {
  const [acMode, setAcMode] = useState<"auto" | "cool" | "heat">("auto");

  return (
    <div
      onClick={onOpen}
      title="Tap for full climate control"
      style={{
        background: theme.panelBg,
        borderRadius: "18px",
        border: `1px solid ${theme.border}`,
        boxShadow: theme.mode === "night" ? "0 4px 20px rgba(0,0,0,0.25)" : "0 2px 10px rgba(0,0,0,0.07)",
        padding: "18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: 700, color: theme.text }}>
        Temperature: {temperature}°C
      </div>

      <div style={{ position: "relative", paddingTop: "6px", height: "28px" }}>
        {/* Track */}
        <div style={{
          position: "absolute", top: "12px", left: 0, right: 0,
          background: theme.sliderTrack, borderRadius: "8px", height: "8px", overflow: "hidden",
        }}>
          <div style={{
            background: temperature <= 20 ? "linear-gradient(90deg, #232D49, #3D53FF)" : "linear-gradient(90deg, #f97171, #F93827)",
            height: "100%",
            width: `${((temperature - 16) / 14) * 100}%`,
            transition: "width 0.1s linear",
          }} />
        </div>
        {/* Visible round thumb */}
        <div style={{
          position: "absolute",
          left: `calc(${((temperature - 16) / 14) * 100}% - 11px)`,
          top: "2px",
          width: "22px", height: "22px",
          borderRadius: "50%",
          background: "#fff",
          border: `2px solid ${temperature <= 20 ? "#3D53FF" : "#F93827"}`,
          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          pointerEvents: "none",
          transition: "left 0.1s linear",
        }} />
        {/* Full-width transparent input — accepts click anywhere on track */}
        <input type="range" min={16} max={30} value={temperature}
          onChange={e => setTemperature(Number(e.target.value))}
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute", left: 0, right: 0, top: 0,
            width: "100%", height: "28px",
            opacity: 0, cursor: "pointer", margin: 0,
          }} />
      </div>

      <div style={{ display: "flex", gap: "6px", alignItems: "center" }} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setAcMode("auto")}
          style={{
            background: acMode === "auto" ? (theme.mode === "night" ? "#f0f0f0" : "#1a1d26") : theme.cardBg,
            border: `1px solid ${theme.border}`, borderRadius: "10px",
            padding: "9px 18px",
            color: acMode === "auto" ? (theme.mode === "night" ? "#1a1d26" : "#f0f0f0") : theme.textSub,
            fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
          }}
        >Auto</button>
        {(["cool", "heat"] as const).map(mode => (
          <button key={mode} onClick={() => setAcMode(mode)}
            style={{
              background: acMode === mode ? theme.btnActive : theme.cardBg,
              border: `1px solid ${acMode === mode ? theme.accent : theme.border}`,
              borderRadius: "10px", padding: "9px 12px",
              color: acMode === mode ? theme.accent : theme.textSub,
              fontSize: "11px", fontWeight: 600, cursor: "pointer",
              textTransform: "capitalize", transition: "all 0.15s",
            }}
          >{mode}</button>
        ))}
      </div>
    </div>
  );
}

function FanCard({ theme, fanSpeed, setFanSpeed }: {
  theme: Theme;
  fanSpeed: number;
  setFanSpeed: (v: number) => void;
}) {
  const fanOn = fanSpeed > 0;

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heldRef = useRef(false);

  const startHold = () => {
    heldRef.current = false;
    holdTimerRef.current = setTimeout(() => {
      heldRef.current = true;
      setFanSpeed(0);
    }, 600);
  };
  const cancelHold = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
  };

  // Tap the fan to cycle: 0→1→2→3→1→2→3...
  const handleFanTap = () => {
    if (heldRef.current) {
      heldRef.current = false;
      return;
    }
    setFanSpeed(fanSpeed >= 3 || fanSpeed === 0 ? 1 : fanSpeed + 1);
  };

  return (
    <div
      style={{
        background: fanOn ? "rgba(34,197,94,0.12)" : theme.panelBg,
        borderRadius: "18px",
        border: `1px solid ${fanOn ? "rgba(34,197,94,0.4)" : theme.border}`,
        boxShadow: fanOn
          ? "0 0 18px rgba(34,197,94,0.25), 0 4px 20px rgba(0,0,0,0.25)"
          : theme.mode === "night" ? "0 4px 20px rgba(0,0,0,0.25)" : "0 2px 10px rgba(0,0,0,0.07)",
        padding: "16px 22px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "110px",
        transition: "all 0.2s",
      }}
    >
      {/* Fan icon — tap to cycle speed, hold to turn off */}
      <button
        onClick={handleFanTap}
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        title="Tap to change speed · Hold to turn off"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: fanOn ? "#16C47F" : theme.textSub,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          transition: "color 0.2s",
        }}
      >
        <svg width="40" height="40" viewBox="0 0 48 48" fill="currentColor">
          <path d="M24 24C24 16 32 11 38 15C33 18 33 30 24 24Z" />
          <path d="M24 24C16 24 11 16 15 10C18 15 30 15 24 24Z" />
          <path d="M24 24C24 32 16 37 10 33C15 30 15 18 24 24Z" />
          <path d="M24 24C32 24 37 32 33 38C30 33 18 33 24 24Z" />
          <circle cx="24" cy="24" r="4.5" fill={fanOn ? "rgba(34,197,94,0.12)" : theme.panelBg} />
        </svg>
      </button>

      {/* Fan speed bars — 3 stepped bars */}
      <div style={{ display: "flex", gap: "5px", alignItems: "flex-end" }}>
        {[1, 2, 3].map(level => {
          const lit = fanSpeed >= level;
          return (
            <div
              key={level}
              style={{
                width: "10px",
                height: "32px",
                background: lit ? "#16C47F" : theme.sliderTrack,
                borderRadius: "5px",
                transition: "background 0.15s",
                boxShadow: lit ? "0 0 8px rgba(34,197,94,0.5)" : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function QuickActions({ theme, setView }: { theme: Theme; setView: (v: ViewMode) => void }) {
  // Doors start locked. Toggling unlocks → button turns green with an open
  // padlock icon. Locked is the neutral default state.
  const [locked, setLocked] = useState(true);

  type Action = {
    id: string;
    icon: React.ReactNode;
    onClick: () => void;
    isActive: boolean;
    activeColor?: string;
  };

  const actions: Action[] = [
    { id: "wifi",     icon: <WifiIcon />,      onClick: () => setView("wifi"),      isActive: false },
    { id: "bt",       icon: <BluetoothIcon />, onClick: () => setView("bluetooth"), isActive: false },
    { id: "phone",    icon: <PhoneIcon />,     onClick: () => setView("call"),      isActive: false },
    { id: "apps",     icon: <AppsIcon />,      onClick: () => setView("apps"),      isActive: false },
    { id: "settings", icon: <SettingsIcon />,  onClick: () => setView("settings"),  isActive: false },
    {
      id: "lock",
      icon: <LockIcon locked={locked} />,
      onClick: () => setLocked(v => !v),
      isActive: !locked,
      activeColor: theme.success,
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", flex: 1 }}>
      {actions.map(({ id, icon, onClick, isActive, activeColor }) => {
        // Active state uses a tinted background + coloured border + coloured
        // icon. The solid-fill active style was hiding the icon, so this
        // keeps the glyph readable while still signalling "on".
        const color = activeColor ?? theme.accent;
        return (
          <button
            key={id}
            onClick={onClick}
            style={{
              background: isActive ? `${color}22` : theme.panelBg,
              border: `1px solid ${isActive ? color : theme.border}`,
              borderRadius: "14px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: isActive ? color : theme.textSub,
              transition: "all 0.15s",
              boxShadow: isActive
                ? `0 0 14px ${color}33`
                : theme.mode === "night" ? "0 2px 8px rgba(0,0,0,0.2)" : "0 1px 4px rgba(0,0,0,0.06)",
              minHeight: "44px",
            }}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}

function WifiIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" /></svg>;
}
function BluetoothIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5" /></svg>;
}
function PhoneIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.77 12 19.79 19.79 0 0 1 1.72 3.41 2 2 0 0 1 3.7 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.16 6.16l1.03-1.03a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
}
function AppsIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>;
}
function SettingsIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
}
function LockIcon({ locked = true }: { locked?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      {locked
        ? <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        // Open shackle — leans to the right to read as "unlocked"
        : <path d="M7 11V7a5 5 0 0 1 9.9-1" />}
    </svg>
  );
}
