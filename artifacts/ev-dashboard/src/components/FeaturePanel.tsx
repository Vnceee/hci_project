import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import type { Theme } from "@/context/ThemeContext";
import type { ViewMode } from "@/context/NavContext";

/**
 * FeaturePanel — the middle-column "app" views (music, dialer, apps grid,
 * settings, wifi, bluetooth, weather). All share the same shell so the
 * design feels consistent and never overlaps the left car panel or the
 * right map panel.
 */
export default function FeaturePanel({ view }: { view: ViewMode }) {
  const { theme } = useTheme();

  const title = TITLES[view] ?? "";
  const showRefresh = view === "wifi" || view === "bluetooth";
  // Weather should fit inside the panel without scrolling.
  const noScroll = view === "weather";

  return (
    <Shell theme={theme} title={title} showRefresh={showRefresh} noScroll={noScroll}>
      {view === "music"     && <MusicView theme={theme} />}
      {view === "call"      && <CallView theme={theme} />}
      {view === "apps"      && <AppsView theme={theme} />}
      {view === "settings"  && <SettingsView theme={theme} />}
      {view === "wifi"      && <WifiView theme={theme} />}
      {view === "bluetooth" && <BluetoothView theme={theme} />}
      {view === "weather"   && <WeatherView theme={theme} />}
    </Shell>
  );
}

const TITLES: Partial<Record<ViewMode, string>> = {
  music: "",
  call: "Dialer",
  apps: "All apps",
  settings: "Settings",
  wifi: "Wi-Fi",
  bluetooth: "Bluetooth",
  weather: "Weather",
};

/* ============================ Shared chrome ============================ */

function Shell({
  theme, title, showRefresh, noScroll, children,
}: {
  theme: Theme;
  title: string;
  showRefresh?: boolean;
  noScroll?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: theme.panelBg,
        borderRadius: "18px",
        border: `1px solid ${theme.border}`,
        boxShadow: theme.mode === "night" ? "0 4px 20px rgba(0,0,0,0.25)" : "0 2px 10px rgba(0,0,0,0.07)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header row — title only. Back / home live in the global TopBar. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px 10px",
          flexShrink: 0,
        }}
      >
        <div style={{ width: "32px", flexShrink: 0 }} />
        <div style={{ fontSize: "18px", fontWeight: 700, color: theme.text, flex: 1, textAlign: "center" }}>
          {title}
        </div>
        {showRefresh ? (
          <IconBtn theme={theme} title="Refresh">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </IconBtn>
        ) : (
          <div style={{ width: "32px" }} />
        )}
      </div>

      {/* Body */}
      <div style={{
        flex: 1, minHeight: 0,
        overflowY: noScroll ? "hidden" : "auto",
        padding: "0 16px 16px",
      }}>
        {children}
      </div>
    </div>
  );
}

function IconBtn({
  theme, onClick, title, children,
}: {
  theme: Theme;
  onClick?: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: "10px",
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: theme.text,
        cursor: onClick ? "pointer" : "default",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function SearchBar({ theme, placeholder }: { theme: Theme; placeholder: string }) {
  return (
    <div
      style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: "999px",
        padding: "9px 14px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "14px",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2.4" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        placeholder={placeholder}
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          color: theme.text,
          fontSize: "13px",
          flex: 1,
          minWidth: 0,
        }}
      />
    </div>
  );
}

function Section({ theme, label, children }: { theme: Theme; label?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      {label && (
        <div style={{ fontSize: "11px", color: theme.textMuted, fontWeight: 600, marginBottom: "8px", paddingLeft: "4px" }}>
          {label}
        </div>
      )}
      <div
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Row({
  theme, icon, label, sub, right, isLast,
}: {
  theme: Theme;
  icon?: React.ReactNode;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 14px",
        borderBottom: isLast ? "none" : `1px solid ${theme.border}`,
      }}
    >
      {icon && <div style={{ color: theme.textSub, display: "flex" }}>{icon}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "13px", color: theme.text, fontWeight: 600 }}>{label}</div>
        {sub && <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "2px" }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function Chevron({ theme }: { theme: Theme }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function Toggle({ theme, on, onChange }: { theme: Theme; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: "38px",
        height: "22px",
        borderRadius: "999px",
        background: on ? theme.success : theme.sliderTrack,
        border: "none",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.15s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "2px",
          left: on ? "18px" : "2px",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.15s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

/* ============================ Music ============================ */

function MusicView({ theme }: { theme: Theme }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(20);
  const [liked, setLiked] = useState(false);
  const totalSeconds = 140;
  const currentSeconds = Math.round((progress / 100) * totalSeconds);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px", paddingTop: "4px" }}>
      <div style={{ width: "100%", textAlign: "center" }}>
        <span style={{ fontSize: "11px", color: theme.textMuted, fontWeight: 600, letterSpacing: "0.08em" }}>NOW PLAYING</span>
      </div>

      {/* Album art — larger for touch */}
      <div
        style={{
          width: "min(220px, 80%)",
          aspectRatio: "1 / 1",
          borderRadius: "16px",
          overflow: "hidden",
          background: "linear-gradient(135deg, #1a0533 0%, #2d1060 40%, #5b1f9e 70%, #8b3fcf 100%)",
          flexShrink: 0,
        }}
      >
        <svg viewBox="0 0 160 160" width="100%" height="100%">
          <defs>
            <linearGradient id="mvHair" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e8d8f8" /><stop offset="100%" stopColor="#8060c0" />
            </linearGradient>
            <linearGradient id="mvSkin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f0c8a0" /><stop offset="100%" stopColor="#d8a080" />
            </linearGradient>
            <linearGradient id="mvEye" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff6b9d" /><stop offset="50%" stopColor="#ffd93d" /><stop offset="100%" stopColor="#9b59b6" />
            </linearGradient>
          </defs>
          <ellipse cx="80" cy="100" rx="48" ry="60" fill="url(#mvSkin)" />
          <ellipse cx="80" cy="50" rx="55" ry="45" fill="url(#mvHair)" />
          <rect x="28" y="48" width="18" height="80" rx="9" fill="url(#mvHair)" />
          <rect x="114" y="48" width="18" height="78" rx="9" fill="url(#mvHair)" />
          <ellipse cx="62" cy="95" rx="14" ry="7" fill="url(#mvEye)" opacity="0.95" />
          <ellipse cx="98" cy="95" rx="14" ry="7" fill="url(#mvEye)" opacity="0.95" />
          <ellipse cx="62" cy="95" rx="9" ry="5.5" fill="#1a0533" />
          <ellipse cx="98" cy="95" rx="9" ry="5.5" fill="#1a0533" />
          <ellipse cx="60" cy="92" rx="3" ry="2" fill="white" opacity="0.7" />
          <ellipse cx="96" cy="92" rx="3" ry="2" fill="white" opacity="0.7" />
          <path d="M68 118 Q80 126 92 118" stroke="#e06080" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="48" cy="110" rx="10" ry="6" fill="#ffb0c0" opacity="0.4" />
          <ellipse cx="112" cy="110" rx="10" ry="6" fill="#ffb0c0" opacity="0.4" />
        </svg>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px", fontWeight: 800, color: theme.text }}>Almost is Never Enough</div>
        <div style={{ fontSize: "14px", color: theme.textSub, fontWeight: 500, marginTop: "4px" }}>Ariana Grande</div>
      </div>

      {/* Progress — taller, touch-friendly */}
      <div style={{ width: "100%", padding: "0 4px" }}>
        <div style={{ position: "relative", height: "24px", display: "flex", alignItems: "center" }}>
          <div style={{ background: theme.sliderTrack, borderRadius: "4px", height: "6px", width: "100%", overflow: "hidden" }}>
            <div style={{ background: theme.text, height: "100%", width: `${progress}%`, transition: "width 0.1s linear" }} />
          </div>
          <div style={{
            position: "absolute",
            left: `calc(${progress}% - 9px)`,
            width: "18px", height: "18px",
            borderRadius: "50%",
            background: "#fff",
            border: `2px solid ${theme.text}`,
            pointerEvents: "none",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            transition: "left 0.1s linear",
          }} />
          <input type="range" min={0} max={100} value={progress}
            onChange={e => setProgress(Number(e.target.value))}
            style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", cursor: "pointer", height: "24px", margin: 0 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
          <span style={{ fontSize: "11px", color: theme.textMuted, fontFamily: "'DM Mono', monospace" }}>{fmt(currentSeconds)}</span>
          <span style={{ fontSize: "11px", color: theme.textMuted, fontFamily: "'DM Mono', monospace" }}>2:20</span>
        </div>
      </div>

      {/* Controls — large touch targets */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "30px" }}>
        <button title="Previous" style={{ background: "none", border: "none", cursor: "pointer", color: theme.textSub, display: "flex", padding: "10px" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
        </button>
        <button
          onClick={() => setPlaying(p => !p)}
          title={playing ? "Pause" : "Play"}
          style={{
            background: theme.success, border: "none", borderRadius: "50%",
            width: "68px", height: "68px", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff",
            boxShadow: `0 6px 18px ${theme.success}73`,
            transition: "transform 0.1s",
          }}
        >
          {playing
            ? <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            : <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "3px" }}><path d="M8 5v14l11-7z" /></svg>}
        </button>
        <button title="Next" style={{ background: "none", border: "none", cursor: "pointer", color: theme.textSub, display: "flex", padding: "10px" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
        </button>
      </div>

      {/* Quick row — bigger pill */}
      <div
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: "999px",
          padding: "12px 22px",
          display: "flex",
          gap: "26px",
          alignItems: "center",
          color: theme.textSub,
        }}
      >
        <button title="Queue" style={{ background: "none", border: "none", cursor: "pointer", color: theme.textSub, display: "flex", padding: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>
        </button>
        <button title="Library" style={{ background: "none", border: "none", cursor: "pointer", color: theme.textSub, display: "flex", padding: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        </button>
        <button
          onClick={() => setLiked(l => !l)}
          title="Like"
          style={{ background: "none", border: "none", cursor: "pointer", color: liked ? theme.danger : theme.textSub, display: "flex", padding: 0 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <button title="Search" style={{ background: "none", border: "none", cursor: "pointer", color: theme.textSub, display: "flex", padding: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ============================ Call / Dialer ============================ */

function CallView({ theme }: { theme: Theme }) {
  const [number, setNumber] = useState("");
  const press = (k: string) => setNumber(n => (n.length >= 16 ? n : n + k));
  const backspace = () => setNumber(n => n.slice(0, -1));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <SearchBar theme={theme} placeholder="Search contact" />
      <div style={{ fontSize: "24px", fontWeight: 700, color: theme.text, textAlign: "center", letterSpacing: "1px" }}>
        {number || "\u00A0"}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "4px" }}>
        {[
          ["1", ""], ["2", "ABC"], ["3", "DEF"],
          ["4", "GHI"], ["5", "JKL"], ["6", "MNO"],
          ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"],
          ["*", ""], ["0", "+"], ["#", ""],
        ].map(([k, sub]) => (
          <button
            key={k}
            onClick={() => press(k)}
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: "999px",
              aspectRatio: "1.6 / 1",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              color: theme.text, cursor: "pointer", padding: "6px",
            }}
          >
            <span style={{ fontSize: "18px", fontWeight: 600, lineHeight: 1 }}>{k}</span>
            {sub && <span style={{ fontSize: "8px", color: theme.textMuted, marginTop: "2px" }}>{sub}</span>}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", marginTop: "6px" }}>
        <IconBtn theme={theme} title="Recent">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></svg>
        </IconBtn>
        <button
          onClick={() => alert("Calling " + number)}
          style={{
            background: theme.success, border: "none", borderRadius: "50%",
            width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", cursor: "pointer", boxShadow: `0 4px 14px ${theme.success}66`,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 15.5c-1.2 0-2.5-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.4-1.1-.6-2.4-.6-3.6 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.5-.4-.9-1-.9z"/></svg>
        </button>
        <IconBtn theme={theme} onClick={backspace} title="Delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
        </IconBtn>
      </div>
    </div>
  );
}

/* ============================ Apps ============================ */

function AppsView({ theme }: { theme: Theme }) {
  const apps = [
    { name: "Music",    bg: "linear-gradient(135deg,#ff4d6d,#c9184a)", icon: "♪" },
    { name: "Safari",   bg: "linear-gradient(135deg,#2196f3,#0d47a1)", icon: "🧭" },
    { name: "Contacts", bg: "linear-gradient(135deg,#ec407a,#7b1fa2)", icon: "👤" },
    { name: "Settings", bg: "linear-gradient(135deg,#9e9e9e,#424242)", icon: "⚙" },
    { name: "Weather",  bg: "linear-gradient(135deg,#42a5f5,#1565c0)", icon: "☀" },
    { name: "Calc",     bg: "linear-gradient(135deg,#424242,#000)",    icon: "=" },
    { name: "Game",     bg: "linear-gradient(135deg,#7c4dff,#4527a0)", icon: "🎮" },
    { name: "Mail",     bg: "linear-gradient(135deg,#42a5f5,#1976d2)", icon: "✉" },
    { name: "News",     bg: "linear-gradient(135deg,#fff,#eee)",       icon: "N" },
  ];

  return (
    <div>
      <SearchBar theme={theme} placeholder="Search apps" />
      <div style={{ fontSize: "11px", color: theme.textMuted, fontWeight: 600, marginBottom: "8px" }}>Recently used</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
        {apps.slice(0, 3).map(a => <AppTile key={a.name} {...a} />)}
      </div>
      <div style={{ height: "1px", background: theme.border, margin: "4px 0 12px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
        {apps.slice(3).map(a => <AppTile key={a.name} {...a} />)}
      </div>
    </div>
  );
}

function AppTile({ bg, icon }: { name: string; bg: string; icon: string }) {
  return (
    <div
      style={{
        aspectRatio: "1 / 1",
        borderRadius: "16px",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "28px",
        color: "#fff",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
      }}
    >
      {icon}
    </div>
  );
}

/* ============================ Settings ============================ */

function SettingsView({ theme }: { theme: Theme }) {
  const [notif, setNotif] = useState(true);
  const [light, setLight] = useState(true);

  return (
    <div>
      <SearchBar theme={theme} placeholder="Search settings" />
      <Section theme={theme}>
        <Row theme={theme} label="About system" right={<Chevron theme={theme} />} />
        <Row theme={theme} label="System update" right={<Chevron theme={theme} />} />
        <Row theme={theme} label="Security status" right={<Chevron theme={theme} />} isLast />
      </Section>
      <Section theme={theme}>
        <Row theme={theme} icon={<LangIcon />} label="Language" sub="English" right={<Chevron theme={theme} />} />
        <Row theme={theme} icon={<WifiIcon />} label="Wi-Fi" sub="iPhone2" right={<Chevron theme={theme} />} />
        <Row theme={theme} icon={<BtIcon />} label="Bluetooth" sub="Connected" right={<Chevron theme={theme} />} isLast />
      </Section>
      <Section theme={theme}>
        <Row theme={theme} icon={<BellIcon />} label="Notifications" right={<Toggle theme={theme} on={notif} onChange={setNotif} />} />
        <Row theme={theme} icon={<BulbIcon />} label="Light mode" right={<Toggle theme={theme} on={light} onChange={setLight} />} isLast />
      </Section>
    </div>
  );
}

/* ============================ Wi-Fi ============================ */

function WifiView({ theme }: { theme: Theme }) {
  const [on, setOn] = useState(true);
  return (
    <div>
      <Section theme={theme}>
        <Row theme={theme} label="Wi-Fi" right={<Toggle theme={theme} on={on} onChange={setOn} />} />
        <Row theme={theme} label="Advanced settings" right={<Chevron theme={theme} />} isLast />
      </Section>
      <Section theme={theme} label="My networks">
        <Row theme={theme} icon={<WifiIcon />} label="iPHONE2" right={<Check theme={theme} />} />
        <Row theme={theme} icon={<WifiIcon />} label="Samsung" right={<InfoCircle theme={theme} />} />
        <Row theme={theme} icon={<WifiIcon />} label="OPPA" right={<InfoCircle theme={theme} />} isLast />
      </Section>
      <Section theme={theme} label="Other networks">
        <Row theme={theme} icon={<WifiIcon />} label="Agrio" right={<InfoCircle theme={theme} />} />
        <Row theme={theme} icon={<WifiIcon />} label="Banana" right={<InfoCircle theme={theme} />} />
        <Row theme={theme} icon={<WifiIcon />} label="Orange" right={<InfoCircle theme={theme} />} isLast />
      </Section>
    </div>
  );
}

/* ============================ Bluetooth ============================ */

function BluetoothView({ theme }: { theme: Theme }) {
  const [on, setOn] = useState(true);
  return (
    <div>
      <Section theme={theme}>
        <Row theme={theme} label="Bluetooth" right={<Toggle theme={theme} on={on} onChange={setOn} />} />
        <Row theme={theme} label="Bluetooth name" sub="Ailon" right={<Chevron theme={theme} />} />
        <Row theme={theme} label="Advanced settings" right={<Chevron theme={theme} />} isLast />
      </Section>
      <Section theme={theme} label="Paired devices">
        <Row theme={theme} icon={<BtIcon />} label="iPHONE2 Bro" right={<Check theme={theme} />} />
        <Row theme={theme} icon={<BtIcon />} label="Samsung A" right={<InfoCircle theme={theme} />} />
        <Row theme={theme} icon={<BtIcon />} label="OPPA A57" right={<InfoCircle theme={theme} />} isLast />
      </Section>
      <Section theme={theme} label="Available devices">
        <Row theme={theme} icon={<BtIcon />} label="Apple Vince" right={<InfoCircle theme={theme} />} />
        <Row theme={theme} icon={<BtIcon />} label="Banana Go" right={<InfoCircle theme={theme} />} />
        <Row theme={theme} icon={<BtIcon />} label="Orange Pro" right={<InfoCircle theme={theme} />} isLast />
      </Section>
    </div>
  );
}

/* ============================ Weather ============================ */

function WeatherView({ theme }: { theme: Theme }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Location pill */}
      <div
        style={{
          background: theme.cardBg, border: `1px solid ${theme.border}`,
          borderRadius: "999px", padding: "14px 20px",
          display: "flex", alignItems: "center", gap: "12px",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span style={{ fontSize: "15px", color: theme.text, fontWeight: 600 }}>94300 Kota Samarahan, Sarawak</span>
      </div>

      {/* Now — bigger hero block */}
      <div
        style={{
          background: theme.cardBg, border: `1px solid ${theme.border}`,
          borderRadius: "20px", padding: "20px 22px",
        }}
      >
        <div style={{ fontSize: "13px", color: theme.textMuted, fontWeight: 600, marginBottom: "10px" }}>Now</div>
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <svg width="84" height="72" viewBox="0 0 60 50">
            <circle cx="40" cy="18" r="11" fill="#ffd750" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
              <line key={i}
                x1={40 + 14 * Math.cos(a * Math.PI / 180)} y1={18 + 14 * Math.sin(a * Math.PI / 180)}
                x2={40 + 19 * Math.cos(a * Math.PI / 180)} y2={18 + 19 * Math.sin(a * Math.PI / 180)}
                stroke="#ffd750" strokeWidth="2.5" strokeLinecap="round" />
            ))}
            <ellipse cx="22" cy="36" rx="16" ry="10" fill="#9ab4d8" />
            <ellipse cx="13" cy="40" rx="11" ry="9" fill="#aac4e8" />
            <ellipse cx="29" cy="40" rx="12" ry="9" fill="#aac4e8" />
            <ellipse cx="22" cy="44" rx="18" ry="6" fill="#bad4f4" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "40px", fontWeight: 800, color: theme.text, lineHeight: 1, letterSpacing: "-1px" }}>25°C</div>
            <div style={{ fontSize: "14px", color: theme.textSub, marginTop: "4px" }}>Mostly cloudy · feels like 27°</div>
          </div>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "18px",
          borderTop: `1px solid ${theme.border}`, paddingTop: "14px",
        }}>
          <Stat theme={theme} label="Humidity" value="89%" />
          <Stat theme={theme} label="UV Index" value="Low" />
          <Stat theme={theme} label="Wind" value="17 km/h" />
        </div>
      </div>

      {/* Driving impact */}
      <div>
        <div style={{ fontSize: "13px", color: theme.textMuted, fontWeight: 600, marginBottom: "8px" }}>Driving Impact</div>
        <div
          style={{
            background: theme.cardBg, border: `1px solid ${theme.border}`,
            borderRadius: "16px", padding: "16px 18px",
            display: "flex", alignItems: "center", gap: "14px",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="#facc15" stroke="#000" strokeWidth="1.5"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13" stroke="#000"/><circle cx="12" cy="17" r="1" fill="#000"/></svg>
          <div>
            <div style={{ fontSize: "15px", color: theme.text, fontWeight: 700 }}>Speed Adjusted</div>
            <div style={{ fontSize: "12px", color: theme.textMuted, marginTop: "3px" }}>110 → 80 km/h due to heavy rain</div>
          </div>
        </div>
      </div>

      {/* Hourly forecast */}
      <div>
        <div style={{ fontSize: "13px", color: theme.textMuted, fontWeight: 600, marginBottom: "8px" }}>Hourly forecast</div>
        <div
          style={{
            background: theme.cardBg, border: `1px solid ${theme.border}`,
            borderRadius: "16px", padding: "16px 8px",
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px",
          }}
        >
          {[
            { t: "Now",  icon: "🌧", deg: "25°" },
            { t: "10pm", icon: "🌧", deg: "24°" },
            { t: "11pm", icon: "⛅", deg: "23°" },
            { t: "12am", icon: "☀", deg: "22°" },
          ].map(h => (
            <div key={h.t} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: theme.textMuted, fontWeight: 600 }}>{h.t}</span>
              <span style={{ fontSize: "32px" }}>{h.icon}</span>
              <span style={{ fontSize: "13px", color: theme.text, fontWeight: 700 }}>{h.deg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ theme, label, value }: { theme: Theme; label: string; value: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "11px", color: theme.textMuted, marginBottom: "4px", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: "16px", color: theme.text, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

/* ============================ Small icons ============================ */

function WifiIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/></svg>;
}
function BtIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/></svg>;
}
function LangIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}
function BellIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function BulbIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2v.3h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z"/></svg>;
}
function Check({ theme }: { theme: Theme }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function InfoCircle({ theme }: { theme: Theme }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
}
