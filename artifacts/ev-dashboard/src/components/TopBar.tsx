import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useNav } from "@/context/NavContext";

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { navMode, view, goHome, back, panelLayout, setPanelLayout } = useNav();
  const canBack = navMode || view !== "home";
  const showLayoutToggle = view === "home" && !navMode;
  const [time, setTime] = useState(new Date());
  const [islandActive, setIslandActive] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  const timeStr = `${displayHours}:${minutes} ${ampm}`;
  const dateStr = time.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        padding: "0 14px",
        background: theme.panelBg,
        borderRadius: "18px",
        height: "58px",
        flexShrink: 0,
        border: `1px solid ${theme.border}`,
        boxShadow: theme.mode === "night"
          ? "0 4px 20px rgba(0,0,0,0.3)"
          : "0 2px 12px rgba(0,0,0,0.08)",
      }}
    >
      {/* Left: Time & Date */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "17px", fontWeight: 700, color: theme.text, lineHeight: 1.2 }}>
          {timeStr}
        </span>
        <span style={{ fontSize: "11px", color: theme.textSub, lineHeight: 1.2, marginTop: "1px" }}>
          {dateStr}
        </span>
      </div>

      {/* Center: Dynamic Island */}
      <div
        onClick={() => setIslandActive(!islandActive)}
        style={{
          background: "#000",
          borderRadius: "30px",
          height: "34px",
          width: islandActive ? "280px" : "220px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          cursor: "pointer",
          transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
          padding: "0 16px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Camera dot */}
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "#1a1a1a",
            border: "1.5px solid #333",
            flexShrink: 0,
            boxShadow: "inset 0 0 3px rgba(100,180,255,0.25)",
          }}
        />
        {/* Island content when active */}
        {islandActive && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              animation: "fadeIn 0.2s ease",
            }}
          >
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "6px",
                background: "linear-gradient(135deg, #7c3aed, #db2777)",
                flexShrink: 0,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#e0e0e0", lineHeight: 1.2 }}>
                Almost Is Never Enough
              </span>
              <span style={{ fontSize: "10px", color: "#888", lineHeight: 1.2 }}>Ariana Grande</span>
            </div>
            <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
              <span style={{ fontSize: "9px", color: "#555" }}>■</span>
              <span style={{ fontSize: "9px", color: "#4a8eff" }}>▶ ▐▐</span>
            </div>
          </div>
        )}
      </div>

      {/* Right: Nav controls + Day/Night */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
        {/* 2/3 panel layout toggle — single button, icon swaps */}
        {showLayoutToggle && (
          <button
            onClick={() => setPanelLayout(panelLayout === "2" ? "3" : "2")}
            title={panelLayout === "2" ? "Switch to 3-panel layout" : "Switch to 2-panel layout"}
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: "12px",
              width: "44px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: theme.textSub,
              transition: "all 0.18s",
            }}
          >
            {panelLayout === "2" ? <TwoPanelIcon /> : <ThreePanelIcon />}
          </button>
        )}

        {/* Day/Night subtle toggle */}
        <button
          onClick={toggleTheme}
          title={theme.mode === "night" ? "Day mode" : "Night mode"}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: theme.mode === "night" ? "#8383A0" : "#FFD65A",
            padding: "4px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.75,
          }}
        >
          {theme.mode === "night" ? <MoonIcon /> : <SunIcon />}
        </button>

        {/* Back — exits nav mode / detail views */}
        <button
          onClick={back}
          style={{
            background: canBack ? theme.accent : theme.btnBg,
            border: `1px solid ${canBack ? theme.accent : theme.border}`,
            borderRadius: "14px",
            width: "52px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: canBack ? "pointer" : "default",
            color: canBack ? "#fff" : theme.textSub,
            transition: "all 0.2s",
            boxShadow: canBack ? `0 4px 12px ${theme.accent}55` : "none",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>

        {/* Home */}
        <button
          onClick={goHome}
          title="Home"
          style={{
            background: theme.accent,
            border: "none",
            borderRadius: "14px",
            width: "52px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#fff",
            boxShadow: `0 4px 12px ${theme.accent}55`,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function TwoPanelIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
      <rect x="1" y="1" width="8" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="12" y="1" width="9" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function ThreePanelIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
      <rect x="1" y="1" width="5" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="1" width="5" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="15" y="1" width="6" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
