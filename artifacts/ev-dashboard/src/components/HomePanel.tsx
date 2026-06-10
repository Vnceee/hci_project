import { useRef, useState } from "react";
import { useTheme, type Theme } from "@/context/ThemeContext";
import {
  useNav, TYRE_READINGS, classifyTyre, DEST_LOCATIONS,
  type TyrePosition, type ViewMode,
} from "@/context/NavContext";
import MiniMap from "@/components/MiniMap";
import { TopProgressBar } from "@/components/MapPanel";
import FeaturePanel from "@/components/FeaturePanel";
import ClimatePanel from "@/components/ClimatePanel";

/**
 * HomePanel owns all non-nav, non-full-screen views.
 *
 * Layout rules:
 *   - panelLayout "3": CarPanel | CenterContent | NavMapPanel
 *   - panelLayout "2": CarPanel | CardsPanel (includes Live Location mini-map)
 *   - double-clicking any feature card → fullScreenFeature=true → feature fills all width
 *   - back while fullScreenFeature restores previous layout
 *   - CarPanel always shows a side-view car with energy bar
 */
export default function HomePanel() {
  const { theme } = useTheme();
  const { view, fullScreenFeature, panelLayout } = useNav();

  // Full-screen feature mode (triggered by double-click)
  if (fullScreenFeature && view !== "home") {
    return (
      <div style={{ height: "100%", minHeight: 0 }}>
        {view === "climate" ? <ClimatePanel /> : <FeaturePanel view={view} />}
      </div>
    );
  }

  // 2-panel: Car | CardsPanel (with live-location tile)
  if (panelLayout === "2") {
    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px",
        height: "100%",
        minHeight: 0,
      }}>
        <CarPanel theme={theme} />
        {view === "home"    ? <CardsPanel theme={theme} showLiveLocation /> :
         view === "climate" ? <div style={{ height: "100%", minHeight: 0, overflow: "hidden" }}><ClimatePanel /></div> :
                              <FeaturePanel view={view} />}
      </div>
    );
  }

  // 3-panel: Car | CenterContent | NavMapPanel
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "10px",
      height: "100%",
      minHeight: 0,
    }}>
      <CarPanel theme={theme} />
      <CenterContent theme={theme} view={view} />
      <NavMapPanel theme={theme} />
    </div>
  );
}

/* =================================================================== */
/*  Center column for 3-panel layout                                    */
/* =================================================================== */
function CenterContent({ theme, view }: { theme: Theme; view: ViewMode }) {
  if (view === "climate") {
    return (
      <div style={{ height: "100%", minHeight: 0, overflow: "hidden" }}>
        <ClimatePanel />
      </div>
    );
  }
  if (view !== "home") {
    return <FeaturePanel view={view} />;
  }
  return <CardsPanel theme={theme} showLiveLocation={false} />;
}

/* =================================================================== */
/*  Column 1 — Car panel with SIDE VIEW + energy bar                   */
/* =================================================================== */
function CarPanel({ theme }: { theme: Theme }) {
  const { speed, gear, batteryPct, kmLeft, mode, setMode, setView } = useNav();
  const remark = tyreRemark(theme);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setView("car-details")}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setView("car-details"); }}
      style={{
        background: theme.panelBg,
        borderRadius: "20px",
        border: `1px solid ${theme.border}`,
        boxShadow: theme.mode === "night" ? "0 4px 24px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.08)",
        padding: "clamp(14px, 1.6vw, 20px)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        minHeight: 0,
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        color: theme.text,
        overflow: "hidden",
      }}
    >
      {/* Header row: name + gear badge + speed */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: "clamp(14px, 1.3vw, 17px)", fontWeight: 800, color: theme.text }}>Ailon 67</div>
          <div style={{ fontSize: "10px", color: theme.textMuted, marginTop: "1px" }}>2030 Ailon Edition</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Gear indicator */}
          <div style={{
            width: "34px", height: "34px",
            background: gear === "R" ? `${theme.danger}22` : `${theme.accent}22`,
            border: `2px solid ${gear === "R" ? theme.danger : theme.accent}`,
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", fontWeight: 900,
            color: gear === "R" ? theme.danger : theme.accent,
          }}>{gear}</div>
          {/* Speed */}
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 900, color: theme.text, letterSpacing: "-0.5px" }}>
              {Math.round(speed)}
            </span>
            <div style={{ fontSize: "10px", color: theme.textMuted, fontWeight: 700, marginTop: "1px" }}>km/h</div>
          </div>
        </div>
      </div>

      {/* Side-view car — fills available height */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SideViewCar theme={theme} />
      </div>

      {/* Tyre remark */}
      {remark && (
        <div style={{
          alignSelf: "center", flexShrink: 0,
          fontSize: "11px", fontWeight: 700, color: remark.color,
          background: `${remark.color}1f`,
          border: `1px solid ${remark.color}55`,
          borderRadius: "999px", padding: "3px 10px",
        }}>{remark.text}</div>
      )}

      {/* Energy bar */}
      <div style={{ flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <div style={{
          background: theme.cardBg,
          borderRadius: "10px",
          height: "8px",
          overflow: "hidden",
          position: "relative",
          marginBottom: "5px",
        }}>
          <div style={{
            width: `${batteryPct}%`,
            height: "100%",
            background: batteryPct < 25 ? theme.warning : theme.success,
            borderRadius: "10px",
            transition: "width 0.4s ease",
            boxShadow: `0 0 8px ${batteryPct < 25 ? theme.warning : theme.success}66`,
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700 }}>
          <span style={{ color: batteryPct < 25 ? theme.warning : theme.success }}>{batteryPct}% left</span>
          <span style={{ color: theme.textSub }}>{kmLeft} km left</span>
        </div>
      </div>

      {/* Drive mode selector */}
      <div
        style={{ display: "flex", gap: "6px", flexShrink: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {(["Auto", "Eco", "Normal", "Sport"] as const).map(m => {
          const active = m === mode;
          return (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "7px 4px",
              background: active ? theme.success : theme.cardBg,
              border: `1px solid ${active ? theme.success : theme.border}`,
              borderRadius: "10px",
              color: active ? "#fff" : theme.textSub,
              fontSize: "11px", fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: active ? `0 3px 10px ${theme.success}55` : "none",
              transition: "all 0.15s",
            }}>{m}</button>
          );
        })}
      </div>
    </div>
  );
}

/* =================================================================== */
/*  Column 3 (3-panel) — Live navigation mini-map                       */
/* =================================================================== */
export function NavMapPanel({ theme }: { theme: Theme }) {
  const {
    hasDestination, isNavigating, destinationKey,
    enterNav, pickDestination,
  } = useNav();
  const dest = destinationKey ? DEST_LOCATIONS[destinationKey] : null;
  return (
    <div style={{
      position: "relative",
      borderRadius: "20px",
      overflow: "hidden",
      border: `1px solid ${theme.border}`,
      boxShadow: theme.mode === "night" ? "0 4px 24px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.08)",
      display: "flex", flexDirection: "column",
      minHeight: 0, background: theme.panelBg,
    }}>
      {/* Live Location badge — hides while navigating */}
      {!isNavigating && (
        <div style={{
          position: "absolute", left: "10px", top: "10px",
          background: "rgba(0,0,0,0.55)", color: "#fff",
          padding: "4px 10px", borderRadius: "999px",
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.3px",
          display: "flex", alignItems: "center", gap: "6px",
          zIndex: 10, pointerEvents: "none",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16C47F", boxShadow: "0 0 6px #16C47F" }} />
          Live Location
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, cursor: "pointer" }} onClick={() => enterNav()}>
        <MiniMap height={0} fill />
      </div>

      {/* Navigation progress when active */}
      {isNavigating && (
        <div style={{ position: "absolute", top: "10px", left: "10px", right: "10px", pointerEvents: "none" }}>
          <TopProgressBar theme={theme} dest={dest} />
        </div>
      )}

      {/* Stop button while navigating */}
      {isNavigating && (
        <div style={{ position: "absolute", bottom: "12px", left: "12px", right: "12px" }}>
          <button
            onClick={e => { e.stopPropagation(); pickDestination(null); }}
            style={{
              width: "100%", background: "#F93827", border: "none",
              borderRadius: "12px", padding: "12px",
              color: "#fff", fontSize: "13px", fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 4px 16px rgba(249,56,39,0.45)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            Stop Navigation
          </button>
        </div>
      )}
    </div>
  );
}

/* =================================================================== */
/*  Column 2 — Feature cards (home view)                               */
/* =================================================================== */
function CardsPanel({ theme, showLiveLocation }: { theme: Theme; showLiveLocation: boolean }) {
  const { setView, setFullScreenFeature, enterNav } = useNav();
  const [temperature, setTemperature] = useState(18);

  const open = (v: ViewMode) => { setView(v); };
  const openFull = (v: ViewMode) => { setView(v); setFullScreenFeature(true); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", minHeight: 0 }}>
      {/* Weather */}
      <button
        onClick={() => open("weather")}
        onDoubleClick={() => openFull("weather")}
        style={{
          background: theme.panelBg, borderRadius: "16px",
          border: `1px solid ${theme.border}`, padding: "12px 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          cursor: "pointer", textAlign: "left", fontFamily: "inherit", color: theme.text,
        }}
      >
        <div>
          <div style={{ fontSize: "10px", color: theme.textMuted, fontWeight: 600 }}>Sarawak</div>
          <div style={{ fontSize: "15px", fontWeight: 800, marginTop: "2px" }}>Kota Samarahan</div>
          <div style={{ fontSize: "11px", color: theme.textSub, marginTop: "1px" }}>Mostly Sunny</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="9" r="4" fill="#fbbf24" />
            <path d="M14 18a4 4 0 0 0-4-4 5 5 0 0 0-9 1.5A3 3 0 0 0 4 20h10a3 3 0 0 0 0-2z" fill={theme.textSub} />
          </svg>
          <div style={{ fontSize: "14px", fontWeight: 800 }}>
            30°<span style={{ fontSize: "11px", color: theme.textMuted }}>/19°</span>
          </div>
        </div>
      </button>

      {/* Music */}
      <div
        onClick={() => open("music")}
        onDoubleClick={() => openFull("music")}
        style={{
          background: theme.panelBg, borderRadius: "16px",
          border: `1px solid ${theme.border}`, padding: "10px",
          display: "flex", flexDirection: "column", gap: "8px",
          cursor: "pointer", color: theme.text,
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{
            width: "62px", height: "44px", borderRadius: "8px", flex: "0 0 auto",
            background: "linear-gradient(135deg,#a78bfa,#7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px",
          }}>🎵</div>
          <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
            <div style={{ fontSize: "13px", fontWeight: 800 }}>Almost is Never Enough</div>
            <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "1px" }}>Ariana Grande</div>
          </div>
        </div>
        <div style={{ height: "2px", background: theme.sliderTrack, borderRadius: "1px" }}>
          <div style={{ height: "100%", width: "30%", background: theme.text, borderRadius: "1px" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: theme.textMuted, fontFamily: "'DM Mono', monospace" }}>
          <span>0:00</span><span>2:20</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "18px" }} onClick={e => e.stopPropagation()}>
          <button style={transportBtn(theme)} aria-label="prev"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5v14L8 12zM5 5h2v14H5z"/></svg></button>
          <button style={{ ...transportBtn(theme), background: theme.cardBg, borderRadius: "999px", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="play">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button style={transportBtn(theme)} aria-label="next"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 5l11 7-11 7zm12 0h2v14h-2z"/></svg></button>
        </div>
      </div>

      {/* Temperature + Fan */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 84px", gap: "10px" }}>
        <div
          onClick={() => open("climate")}
          onDoubleClick={() => openFull("climate")}
          style={{ background: theme.panelBg, borderRadius: "16px", border: `1px solid ${theme.border}`, padding: "12px 14px", color: theme.text, cursor: "pointer" }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>Temperature: {temperature}°C</div>
          <div style={{ position: "relative", height: "18px" }} onClick={e => e.stopPropagation()}>
            <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: "3px", background: theme.sliderTrack, borderRadius: "2px", transform: "translateY(-50%)" }} />
            <div style={{ position: "absolute", left: 0, top: "50%", height: "3px", width: `${((temperature - 16) / 14) * 100}%`, background: "#3D53FF", borderRadius: "2px", transform: "translateY(-50%)" }} />
            <input type="range" min={16} max={30} value={temperature}
              onChange={e => setTemperature(Number(e.target.value))}
              data-no-osk="true"
              style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%" }}
            />
            <div style={{
              position: "absolute", top: "50%",
              left: `calc(${((temperature - 16) / 14) * 100}% - 9px)`,
              transform: "translateY(-50%)",
              width: "18px", height: "18px", borderRadius: "50%",
              background: "#fff", border: `1px solid ${theme.border}`, boxShadow: "0 2px 4px rgba(0,0,0,0.18)",
            }} />
          </div>
          <button
            onClick={e => { e.stopPropagation(); open("climate"); }}
            onDoubleClick={e => { e.stopPropagation(); openFull("climate"); }}
            style={{
              marginTop: "8px", width: "100%", padding: "9px",
              background: theme.cardBg, border: `1px solid ${theme.border}`,
              borderRadius: "10px", color: theme.text, fontSize: "11px", fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}
          >
            <AutoIcon /> Climate Control
          </button>
        </div>
        <FanTile theme={theme} />
      </div>

      {/* Live Location mini-map — only in 2-panel mode */}
      {showLiveLocation && (
        <div
          onClick={() => enterNav()}
          style={{
            position: "relative",
            background: theme.panelBg,
            borderRadius: "16px",
            border: `1px solid ${theme.border}`,
            overflow: "hidden",
            cursor: "pointer",
            minHeight: "100px",
            flex: "0 0 auto",
          }}
        >
          <MiniMap height={0} fill />
          <div style={{
            position: "absolute", left: "10px", top: "10px",
            background: "rgba(0,0,0,0.55)", color: "#fff",
            padding: "4px 10px", borderRadius: "999px",
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.3px",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16C47F", boxShadow: "0 0 6px #16C47F" }} />
            Live Location
          </div>
        </div>
      )}

      {/* 2×3 icon grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gridAutoRows: "1fr",
        gap: "10px",
        flex: 1, minHeight: "80px",
      }}>
        <WifiTile theme={theme} />
        <BluetoothTile theme={theme} />
        <IconTile theme={theme} onClick={() => open("call")} onDblClick={() => openFull("call")}><PhoneIcon /></IconTile>
        <IconTile theme={theme} onClick={() => open("apps")} onDblClick={() => openFull("apps")}><AppsIcon /></IconTile>
        <IconTile theme={theme} onClick={() => open("settings")} onDblClick={() => openFull("settings")}><SettingsIcon /></IconTile>
        <LockTile theme={theme} />
      </div>
    </div>
  );
}

/* =================================================================== */
/*  Fan tile                                                            */
/* =================================================================== */
function FanTile({ theme }: { theme: Theme }) {
  const [speed, setSpeed] = useState(0);
  const heldRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ACTIVE_BG = "#16C47F";
  const clearTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };
  const handlePointerDown = () => {
    heldRef.current = false; clearTimer();
    timerRef.current = setTimeout(() => { heldRef.current = true; setSpeed(0); }, 350);
  };
  const handlePointerUp = () => {
    clearTimer();
    if (heldRef.current) return;
    setSpeed(s => (s === 0 ? 1 : s === 3 ? 1 : s + 1));
  };
  const handlePointerLeave = () => { clearTimer(); heldRef.current = false; };
  return (
    <button
      onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave} onPointerCancel={handlePointerLeave}
      style={{
        background: speed > 0 ? ACTIVE_BG : theme.panelBg,
        border: `1px solid ${speed > 0 ? ACTIVE_BG : theme.border}`,
        borderRadius: "14px", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: "8px", cursor: "pointer", color: speed > 0 ? "#fff" : theme.textSub,
        width: "100%", height: "100%", minHeight: "44px", fontFamily: "inherit",
        boxShadow: speed > 0 ? "0 4px 16px rgba(34,197,94,0.35)" : "none",
        transition: "background 0.18s, box-shadow 0.18s",
        touchAction: "manipulation", userSelect: "none",
      }}
    >
      <FanIcon spinning={speed > 0} />
      <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "14px" }}>
        {[1, 2, 3].map(n => (
          <span key={n} style={{
            width: "4px", height: `${4 + n * 3}px`, borderRadius: "2px",
            background: speed >= n ? (speed > 0 ? "#fff" : ACTIVE_BG) : (speed > 0 ? "rgba(255,255,255,0.35)" : theme.sliderTrack),
            transition: "background 0.15s",
          }} />
        ))}
      </div>
    </button>
  );
}

/* =================================================================== */
/*  Side-view car SVG                                                   */
/* =================================================================== */
function SideViewCar({ theme }: { theme: Theme }) {
  const isDark = theme.mode === "night";

  const spoke = (cx: number, cy: number) =>
    [0, 60, 120, 180, 240, 300].map(deg => {
      const r = deg * Math.PI / 180;
      return (
        <line key={deg}
          x1={cx + 11 * Math.sin(r)} y1={cy - 11 * Math.cos(r)}
          x2={cx + 19 * Math.sin(r)} y2={cy - 19 * Math.cos(r)}
          stroke={isDark ? "#38405e" : "#484866"} strokeWidth="3.5" strokeLinecap="round" />
      );
    });

  return (
    <svg viewBox="0 0 420 185" width="100%" style={{ maxHeight: "100%", display: "block", overflow: "visible" }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="sv-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? "#d8e4f8" : "#e4eeff"} />
          <stop offset="55%" stopColor={isDark ? "#bccae0" : "#ccd8f4"} />
          <stop offset="100%" stopColor={isDark ? "#a6b6d0" : "#b6c6e2"} />
        </linearGradient>
        <linearGradient id="sv-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? "#8898bc" : "#98a8cc"} />
          <stop offset="100%" stopColor={isDark ? "#607092" : "#7080a2"} />
        </linearGradient>
        <radialGradient id="sv-wheel" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor={isDark ? "#252840" : "#323558"} />
          <stop offset="100%" stopColor={isDark ? "#16192c" : "#1e2136"} />
        </radialGradient>
        <filter id="sv-drop">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor={isDark ? "rgba(61,83,255,0.18)" : "rgba(61,83,255,0.1)"} />
        </filter>
      </defs>

      {/* Underbody glow */}
      <ellipse cx="208" cy="170" rx="152" ry="9" fill="#16C47F" opacity={isDark ? 0.22 : 0.14} style={{ filter: "blur(7px)" }} />

      {/* Car body */}
      <g filter="url(#sv-drop)">
        {/* Main body shape */}
        <path d="
          M 46 132 L 46 107 Q 48 95 62 84
          L 98 54 Q 118 38 162 34
          L 252 32 Q 296 32 328 50
          Q 354 65 364 90 L 368 108 L 368 132
          Q 342 140 210 142 Q 78 142 46 132 Z
        " fill="url(#sv-body)" />

        {/* Roof */}
        <path d="
          M 116 78 Q 132 36 164 32 L 252 30
          Q 296 30 325 50 L 328 52
          Q 296 34 252 34 L 162 36
          Q 130 40 114 80 Z
        " fill="url(#sv-roof)" />

        {/* Windshield glass */}
        <path d="M 118 79 L 162 34 L 167 37 L 122 82 Z"
          fill={isDark ? "rgba(180,208,255,0.48)" : "rgba(185,215,255,0.58)"} />

        {/* Side window strip */}
        <path d="M 168 35 L 252 33 L 252 73 L 168 75 Z"
          fill={isDark ? "rgba(158,185,240,0.38)" : "rgba(168,198,252,0.48)"} />

        {/* Rear window */}
        <path d="M 254 33 L 326 52 L 317 73 L 254 73 Z"
          fill={isDark ? "rgba(158,185,240,0.38)" : "rgba(168,198,252,0.48)"} />

        {/* A-pillar / window divider */}
        <line x1="254" y1="33" x2="254" y2="74" stroke={isDark ? "rgba(80,100,145,0.55)" : "rgba(100,120,165,0.5)"} strokeWidth="2" />

        {/* Body highlight */}
        <path d="M 68 106 Q 208 112 358 106" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" fill="none" />

        {/* Front headlight */}
        <path d="M 46 96 L 56 89 L 54 110 L 46 113 Z" fill="#ffd060" opacity="0.95" />
        <ellipse cx="46" cy="102" rx="8" ry="10" fill="rgba(255,215,80,0.25)" style={{ filter: "blur(4px)" }} />

        {/* Rear light strip */}
        <rect x="362" y="94" width="9" height="28" rx="2" fill="#ff3344" opacity="0.9" />
        <rect x="360" y="92" width="11" height="32" rx="2" fill="#ff3344" opacity="0.28" style={{ filter: "blur(5px)" }} />
      </g>

      {/* Front wheel arch */}
      <path d="M 70 140 Q 72 143 112 143 Q 152 143 154 140 L 150 132 Q 138 122 112 122 Q 86 122 74 132 Z"
        fill={isDark ? "#1a1d2e" : "#282b40"} />

      {/* Front wheel */}
      <circle cx="112" cy="148" r="26" fill={isDark ? "#16192a" : "#22253a"} />
      <circle cx="112" cy="148" r="22" fill="url(#sv-wheel)" />
      <circle cx="112" cy="148" r="10" fill={isDark ? "#282c44" : "#363a54"} />
      {spoke(112, 148)}
      <circle cx="112" cy="148" r="4" fill={isDark ? "#484e72" : "#585e7a"} />

      {/* Rear wheel arch */}
      <path d="M 264 140 Q 266 143 305 143 Q 344 143 346 140 L 342 132 Q 330 122 305 122 Q 280 122 268 132 Z"
        fill={isDark ? "#1a1d2e" : "#282b40"} />

      {/* Rear wheel */}
      <circle cx="305" cy="148" r="26" fill={isDark ? "#16192a" : "#22253a"} />
      <circle cx="305" cy="148" r="22" fill="url(#sv-wheel)" />
      <circle cx="305" cy="148" r="10" fill={isDark ? "#282c44" : "#363a54"} />
      {spoke(305, 148)}
      <circle cx="305" cy="148" r="4" fill={isDark ? "#484e72" : "#585e7a"} />

      {/* Green underbody line */}
      <path d="M 62 165 L 360 165" stroke="#16C47F" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
      <path d="M 62 165 L 360 165" stroke="#16C47F" strokeWidth="8" strokeLinecap="round" opacity="0.18" style={{ filter: "blur(3px)" }} />
    </svg>
  );
}

/* =================================================================== */
/*  Tyre remark helper                                                  */
/* =================================================================== */
function tyreRemark(theme: Theme): { text: string; color: string } | null {
  const labels: Record<TyrePosition, string> = {
    FL: "Front left", FR: "Front right", RL: "Rear left", RR: "Rear right",
  };
  let worst: { pos: TyrePosition; sev: number } | null = null;
  for (const r of TYRE_READINGS) {
    const s = classifyTyre(r.psi);
    const sev = s === "critical" ? 2 : s === "low" ? 1 : 0;
    if (sev > 0 && (!worst || sev > worst.sev)) worst = { pos: r.position, sev };
  }
  if (!worst) return null;
  const word = worst.sev === 2 ? "critical" : "low";
  return { text: `${labels[worst.pos]} tyre ${word}`, color: worst.sev === 2 ? theme.danger : theme.warning };
}

/* =================================================================== */
/*  Icon tiles                                                           */
/* =================================================================== */
function IconTile({ theme, onClick, onDblClick, active, children }: {
  theme: Theme; onClick: () => void; onDblClick?: () => void; active?: boolean; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} onDoubleClick={onDblClick} style={{
      background: active ? `${theme.success}22` : theme.panelBg,
      border: `1px solid ${active ? theme.success : theme.border}`,
      borderRadius: "14px", display: "flex", alignItems: "center",
      justifyContent: "center", cursor: "pointer",
      color: active ? theme.success : theme.textSub,
      minHeight: "44px", width: "100%", height: "100%",
    }}>{children}</button>
  );
}

function LockTile({ theme }: { theme: Theme }) {
  const [locked, setLocked] = useState(true);
  return (
    <IconTile theme={theme} onClick={() => setLocked(v => !v)} active={!locked}>
      <LockIcon locked={locked} />
    </IconTile>
  );
}

function WifiTile({ theme }: { theme: Theme }) {
  const { setView } = useNav();
  const [on, setOn] = useState(false);
  const heldRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };
  const handlePointerDown = () => {
    heldRef.current = false; clearTimer();
    timerRef.current = setTimeout(() => { heldRef.current = true; setView("wifi"); }, 600);
  };
  const handlePointerUp = () => { clearTimer(); if (heldRef.current) return; setOn(v => !v); };
  const handlePointerLeave = () => { clearTimer(); heldRef.current = false; };
  return (
    <button
      onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave} onPointerCancel={handlePointerLeave}
      style={{
        background: on ? `${theme.success}22` : theme.panelBg,
        border: `1px solid ${on ? theme.success : theme.border}`,
        borderRadius: "14px", display: "flex", alignItems: "center",
        justifyContent: "center", cursor: "pointer",
        color: on ? theme.success : theme.textSub,
        minHeight: "44px", width: "100%", height: "100%",
        transition: "background 0.18s, border-color 0.18s, color 0.18s",
        touchAction: "manipulation", userSelect: "none",
      }}
    ><WifiIcon /></button>
  );
}

function BluetoothTile({ theme }: { theme: Theme }) {
  const { setView } = useNav();
  const [on, setOn] = useState(false);
  const heldRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };
  const handlePointerDown = () => {
    heldRef.current = false; clearTimer();
    timerRef.current = setTimeout(() => { heldRef.current = true; setView("bluetooth"); }, 600);
  };
  const handlePointerUp = () => { clearTimer(); if (heldRef.current) return; setOn(v => !v); };
  const handlePointerLeave = () => { clearTimer(); heldRef.current = false; };
  return (
    <button
      onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave} onPointerCancel={handlePointerLeave}
      style={{
        background: on ? `${theme.success}22` : theme.panelBg,
        border: `1px solid ${on ? theme.success : theme.border}`,
        borderRadius: "14px", display: "flex", alignItems: "center",
        justifyContent: "center", cursor: "pointer",
        color: on ? theme.success : theme.textSub,
        minHeight: "44px", width: "100%", height: "100%",
        transition: "background 0.18s, border-color 0.18s, color 0.18s",
        touchAction: "manipulation", userSelect: "none",
      }}
    ><BluetoothIcon /></button>
  );
}

/* =================================================================== */
/*  Icons                                                               */
/* =================================================================== */
function WifiIcon()      { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>; }
function BluetoothIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/></svg>; }
function FanIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style={spinning ? { animation: "fanSpin 2.5s linear infinite" } : undefined}>
      <style>{`@keyframes fanSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <g style={{ transformOrigin: "12px 12px" }}>
        <path d="M12 11.2c0-3.2 1.3-5.5 4.2-6.6 1.6-.6 3 .7 2.6 2.4-.6 2.6-3 4.4-6.8 4.4z"/>
        <path d="M12.8 12c3.2 0 5.5 1.3 6.6 4.2.6 1.6-.7 3-2.4 2.6-2.6-.6-4.4-3-4.4-6.8z"/>
        <path d="M12 12.8c0 3.2-1.3 5.5-4.2 6.6-1.6.6-3-.7-2.6-2.4.6-2.6 3-4.4 6.8-4.4z"/>
        <path d="M11.2 12c-3.2 0-5.5-1.3-6.6-4.2-.6-1.6.7-3 2.4-2.6 2.6.6 4.4 3 4.4 6.8z"/>
        <circle cx="12" cy="12" r="1.8"/>
      </g>
    </svg>
  );
}
function AutoIcon()     { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 18 L8 7 L12 18 M5 14 L11 14"/><path d="M15 12a3 3 0 1 1 5 2 v4 M15 18 L20 18"/></svg>; }
function PhoneIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.77 12 19.79 19.79 0 0 1 1.72 3.41 2 2 0 0 1 3.7 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.16 6.16l1.03-1.03a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>; }
function AppsIcon()     { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>; }
function SettingsIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function LockIcon({ locked }: { locked: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      {locked ? <path d="M7 11V7a5 5 0 0 1 10 0v4"/> : <path d="M7 11V7a5 5 0 0 1 9.9-1"/>}
    </svg>
  );
}

function transportBtn(theme: Theme): React.CSSProperties {
  return { background: "transparent", border: "none", cursor: "pointer", color: theme.text, padding: "2px" };
}

// Export HomeCar for backward compat (CarDetailsView uses it)
export function HomeCar({ theme }: { theme: Theme }) {
  return <SideViewCar theme={theme} />;
}
