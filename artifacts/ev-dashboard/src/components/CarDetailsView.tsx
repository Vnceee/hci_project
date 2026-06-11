import { useState, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import type { Theme } from "@/context/ThemeContext";
import { useNav } from "@/context/NavContext";
import { HomeCar } from "@/components/HomePanel";

export default function CarDetailsView() {
  const { theme } = useTheme();
  // Gear and drive mode now live in NavContext so the meter cluster owns
  // the gear shifter and Car Details simply mirrors it (read-only).
  // Pull battery + range from NavContext so this screen, the homepage and
  // the meter cluster all show the same numbers.
  const { setView, gear, mode, batteryPct, kmLeft } = useNav();
  const [charging, setCharging] = useState(false);
  const [locked, setLocked] = useState(true);
  const [trunkOpen, setTrunkOpen] = useState(false);

  return (
    <div
      style={{
        background: theme.panelBg,
        borderRadius: "20px",
        padding: "clamp(14px, 1.8vw, 22px) clamp(16px, 2vw, 26px)",
        border: `1px solid ${theme.border}`,
        boxShadow: theme.mode === "night" ? "0 4px 24px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.07)",
        display: "grid",
        // Equal-width 3-column track so the center column (name / gear) is
        // truly horizontally centred no matter how wide the side panes get.
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "auto 1fr auto",
        gap: "clamp(10px, 1.2vw, 16px)",
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* Keyframes for the battery animation only */}
      <style>{`
        @keyframes cdv-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        @keyframes cdv-fill  { 0% { transform: translateX(-100%); } 100% { transform: translateX(0); } }
        @keyframes cdv-bolt  { 0%, 100% { opacity: 0.4; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } }
      `}</style>

      {/* Top-left: battery + charging status. The button has a fixed width
          so toggling Stop/Start never reflows neighbouring columns. */}
      <div style={{
        display: "flex", flexDirection: "column", gap: "10px",
        alignItems: "flex-start", justifySelf: "start",
        minWidth: "180px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <BatteryIcon level={batteryPct} charging={charging} theme={theme} />
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          height: "20px",
        }}>
          <span style={{
            fontSize: "13px",
            fontWeight: 700,
            color: charging ? theme.success : theme.textSub,
            animation: charging ? "cdv-pulse 1.6s ease-in-out infinite" : "none",
          }}>
            {charging ? "Charging" : "Not Charging"}
          </span>
          <span style={{ fontSize: "12px", color: theme.textMuted }}>·</span>
          <span style={{ fontSize: "12px", color: theme.textSub, fontWeight: 600 }}>
            {charging ? "6h 7min to full" : "Idle"}
          </span>
        </div>
        <button
          onClick={() => setCharging(c => !c)}
          style={{
            background: charging ? theme.cardBg : theme.success,
            border: `1px solid ${charging ? theme.border : theme.success}`,
            borderRadius: "999px",
            padding: "8px 0",
            color: charging ? theme.text : "#fff",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "background 0.15s, color 0.15s, border-color 0.15s",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            width: "150px",
          }}
        >
          {charging ? "Stop Charging" : "Start Charging"}
        </button>
      </div>

      {/* Top-center: title — true horizontal centre */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: "2px" }}>
        <div style={{ fontSize: "15px", color: theme.text, fontWeight: 700, letterSpacing: "0.2px" }}>Ailon 67</div>
        <div style={{ fontSize: "11px", color: theme.textMuted, fontWeight: 600 }}>2030 Edition</div>
      </div>

      {/* Top-right: range */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", justifySelf: "end" }}>
        <div style={{ fontSize: "26px", fontWeight: 800, color: theme.text, letterSpacing: "-0.5px", lineHeight: 1 }}>
          {kmLeft}<span style={{ fontSize: "13px", fontWeight: 600, color: theme.textSub, marginLeft: "4px" }}>km left</span>
        </div>
      </div>

      {/* Middle: car illustration + side actions */}
      <div style={{
        gridColumn: "1 / -1",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 0,
      }}>
        <div style={{ maxWidth: "220px", width: "100%", maxHeight: "min(300px, 50vh)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <HomeCar theme={theme} />
        </div>

        {/* Right floating actions */}
        <div style={{
          position: "absolute",
          right: "0px",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}>
          <TrunkAction theme={theme} open={trunkOpen} onToggle={() => setTrunkOpen(v => !v)} />
          <DetailAction
            theme={theme}
            label={locked ? "Locked" : "Unlocked"}
            onClick={() => setLocked(v => !v)}
            activeColor={!locked ? theme.success : undefined}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              {locked
                ? <path d="M8 11V7a4 4 0 0 1 8 0" />
                : <path d="M8 11V7a4 4 0 0 1 7.9-0.8" />}
            </svg>
          </DetailAction>
        </div>
      </div>

      {/* Bottom-left: tyres */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", justifySelf: "start" }}>
        <DetailAction theme={theme} label="Tyres" onClick={() => setView("tyres")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="3" x2="12" y2="8" /><line x1="12" y1="16" x2="12" y2="21" />
            <line x1="3" y1="12" x2="8" y2="12" /><line x1="16" y1="12" x2="21" y2="12" />
          </svg>
        </DetailAction>
      </div>

      {/* Bottom-center: single mode label + gear pill */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: "8px",
          padding: "4px 10px",
          fontSize: "11px", fontWeight: 700, color: theme.textSub,
        }}>
          Mode: <span style={{ color: theme.success }}>{mode}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            border: `1.5px solid ${gear === "R" ? theme.danger : theme.success}`,
            borderRadius: "8px",
            padding: "2px 10px",
            color: gear === "R" ? theme.danger : theme.success,
            fontSize: "14px", fontWeight: 800,
            background: theme.cardBg,
            opacity: 0.9,
          }}>{gear}</div>
          <span style={{ fontSize: "10px", color: theme.textMuted, fontWeight: 600 }}>
            Gear (cluster)
          </span>
        </div>
      </div>

      {/* Bottom-right: stations */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", justifySelf: "end" }}>
        <DetailAction theme={theme} label="Stations" onClick={() => setView("charging")}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="11" height="16" rx="2" />
            <path d="M14 8h3l2 3v6a2 2 0 0 1-2 2" />
            <path d="M7 8h4M7 12h4" strokeLinecap="round" />
          </svg>
        </DetailAction>
      </div>
    </div>
  );
}

/**
 * Drive-mode picker (Auto / Eco / Normal / Sport). Reused by the Home
 * panel too, so it's exported.
 */
export function DriveModeRow({
  theme, mode, setMode, compact, readOnly,
}: {
  theme: Theme;
  mode: import("@/context/NavContext").DriveMode;
  setMode: (m: import("@/context/NavContext").DriveMode) => void;
  compact?: boolean;
  readOnly?: boolean;
}) {
  const modes: import("@/context/NavContext").DriveMode[] = ["Auto", "Eco", "Normal", "Sport"];
  return (
    <div style={{ display: "flex", gap: compact ? "6px" : "8px", pointerEvents: readOnly ? "none" : "auto" }}>
      {modes.map(m => {
        const active = m === mode;
        return (
          <button
            key={m}
            onClick={readOnly ? undefined : () => setMode(m)}
            style={{
              background: active ? theme.success : theme.cardBg,
              border: `1px solid ${active ? theme.success : theme.border}`,
              borderRadius: "10px",
              padding: compact ? "6px 14px" : "8px 18px",
              color: active ? "#fff" : theme.textSub,
              fontSize: compact ? "11px" : "12px",
              fontWeight: 700,
              cursor: readOnly ? "default" : "pointer",
              boxShadow: active ? `0 4px 12px ${theme.success}55` : "none",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
          >{m}</button>
        );
      })}
    </div>
  );
}

function DetailAction({
  children, label, theme, onClick, activeColor,
}: {
  children: React.ReactNode;
  label: string;
  theme: Theme;
  onClick?: () => void;
  activeColor?: string;
}) {
  return (
    <button onClick={onClick} style={{
      background: "transparent",
      border: "none",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
      cursor: "pointer",
      color: theme.textSub,
      padding: "4px",
    }}>
      <div style={{
        width: "42px", height: "42px",
        background: activeColor ? `${activeColor}22` : theme.cardBg,
        border: `1px solid ${activeColor ?? theme.border}`,
        borderRadius: "12px",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: activeColor ?? theme.text,
        boxShadow: activeColor ? `0 0 12px ${activeColor}33` : undefined,
        transition: "all 0.15s",
      }}>{children}</div>
      <span style={{ fontSize: "10px", color: activeColor ?? theme.textMuted, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

/** Hold-to-open trunk button — hold 600 ms to toggle; green when open. */
function TrunkAction({ theme, open, onToggle }: { theme: Theme; open: boolean; onToggle: () => void }) {
  const heldRef  = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };
  const onDown = () => {
    heldRef.current = false; clear();
    timerRef.current = setTimeout(() => { heldRef.current = true; onToggle(); }, 600);
  };
  const onUp = () => { clear(); };
  const onLeave = () => { clear(); heldRef.current = false; };
  const color = open ? theme.success : undefined;
  return (
    <div
      onPointerDown={onDown} onPointerUp={onUp}
      onPointerLeave={onLeave} onPointerCancel={onLeave}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: "pointer", padding: "4px", userSelect: "none", touchAction: "manipulation" }}
    >
      <div style={{
        width: "42px", height: "42px",
        background: color ? `${color}22` : theme.cardBg,
        border: `1px solid ${color ?? theme.border}`,
        borderRadius: "12px",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: color ?? theme.text,
        boxShadow: color ? `0 0 12px ${color}33` : undefined,
        transition: "all 0.15s",
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 17v-3a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v3" />
          <circle cx="7" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" />
        </svg>
      </div>
      <span style={{ fontSize: "10px", color: color ?? theme.textMuted, fontWeight: 600 }}>
        {open ? "Open" : "Trunk"}
      </span>
    </div>
  );
}

function BatteryIcon({ level, charging, theme }: { level: number; charging: boolean; theme: Theme }) {
  return <BatteryGlyph level={level} charging={charging} theme={theme} width={52} height={22} fontSize={15} />;
}

/**
 * Shared battery icon — exported so the Tyre view can reuse the exact same
 * design and size, plus the animated charging flow and lightning bolt
 * overlay.
 */
export function BatteryGlyph({
  level, charging, theme, width, height, fontSize,
}: {
  level: number;
  charging: boolean;
  theme: Theme;
  width: number;
  height: number;
  fontSize: number;
}) {
  const color = level < 25 ? theme.warning : theme.success;
  const borderWidth   = Math.max(1.5, width / 35);
  const innerPad      = Math.max(2, width / 26);
  const radius        = Math.max(3, width / 17);
  const termWidth     = Math.max(3, width / 17);
  const termHeight    = Math.max(8, height / 2.2);
  const termOffsetTop = (height - termHeight) / 2;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: width >= 90 ? "14px" : "8px" }}>
      <div style={{
        width: `${width}px`, height: `${height}px`,
        border: `${borderWidth}px solid ${theme.textMuted}`,
        borderRadius: `${radius}px`,
        position: "relative",
        padding: `${innerPad}px`,
        overflow: "hidden",
      }}>
        {/* base fill */}
        <div style={{
          width: `${level}%`, height: "100%",
          background: color,
          borderRadius: `${Math.max(2, radius - 2)}px`,
          boxShadow: `0 0 8px ${color}66`,
        }} />
        {/* charging flow overlay */}
        {charging && (
          <div style={{
            position: "absolute",
            top: innerPad, bottom: innerPad, left: innerPad,
            width: `calc(${100 - level}% - ${innerPad * 2}px)`,
            background: `linear-gradient(90deg, ${color}00, ${color}66, ${color}00)`,
            backgroundSize: `${width * 1.2}px 100%`,
            animation: "cdv-fill 1.4s linear infinite",
            borderRadius: `${Math.max(2, radius - 2)}px`,
          }} />
        )}
        {/* terminal */}
        <div style={{
          position: "absolute", right: `-${termWidth + 2}px`, top: `${termOffsetTop}px`,
          width: `${termWidth}px`, height: `${termHeight}px`,
          background: theme.textMuted,
          borderRadius: `0 ${Math.max(2, termWidth / 2)}px ${Math.max(2, termWidth / 2)}px 0`,
        }} />
      </div>
      <span style={{ fontSize: `${fontSize}px`, fontWeight: 700, color: theme.text }}>{level}%</span>
    </div>
  );
}

/**
 * Legacy 3/4 angled car — kept around for reference but no longer rendered;
 * the home and details views share the side-view HomeCar so the two screens
 * look identical.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _SideCar_LEGACY({ theme }: { theme: Theme }) {
  const isDark = theme.mode === "night";

  return (
    <svg viewBox="0 0 600 320" width="100%" height="100%" style={{ maxHeight: "360px" }} preserveAspectRatio="xMidYMid meet">
      <defs>
        {/* Body — pearl white with soft top-down shading */}
        <linearGradient id="cdv-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={isDark ? "#f5f8ff" : "#ffffff"} />
          <stop offset="55%"  stopColor={isDark ? "#c4cee2" : "#d6dff0"} />
          <stop offset="100%" stopColor={isDark ? "#6d7892" : "#7d88a2"} />
        </linearGradient>
        {/* Glass — smoked */}
        <linearGradient id="cdv-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2a3144" />
          <stop offset="100%" stopColor="#0c1018" />
        </linearGradient>
        {/* Hood reflection */}
        <linearGradient id="cdv-hood-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        {/* Tyre */}
        <radialGradient id="cdv-tyre" cx="50%" cy="40%" r="60%">
          <stop offset="0%"  stopColor="#3a3f4d" />
          <stop offset="100%" stopColor="#0a0c12" />
        </radialGradient>
        {/* Wheel rim */}
        <linearGradient id="cdv-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#dde3ee" />
          <stop offset="100%" stopColor="#7c8497" />
        </linearGradient>
        {/* Headlight bar glow */}
        <linearGradient id="cdv-headbar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#fff8d0" stopOpacity="0.9" />
          <stop offset="50%"  stopColor="#aee0ff" stopOpacity="1" />
          <stop offset="100%" stopColor="#7ab8ff" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* Ground shadow — soft elongated ellipse */}
      <ellipse cx="300" cy="278" rx="240" ry="14" fill="rgba(0,0,0,0.22)" style={{ filter: "blur(6px)" }} />

      {/* === Main body — flowing 3/4 silhouette === */}
      <path
        d="
          M 70 220
          Q 64 188 96 174
          L 130 168
          Q 156 124 220 110
          Q 320 96 430 116
          Q 482 124 510 158
          L 540 170
          Q 558 178 558 200
          L 558 232
          Q 558 246 540 246
          L 90 246
          Q 70 244 70 230 Z
        "
        fill="url(#cdv-body)"
      />

      {/* Hood highlight — long sweeping reflection */}
      <path
        d="
          M 150 158
          Q 240 130 380 130
          Q 470 132 502 156
          L 488 168
          Q 410 148 320 148
          Q 220 150 165 168 Z
        "
        fill="url(#cdv-hood-shine)" opacity="0.55"
      />

      {/* Greenhouse (windows) */}
      <path
        d="
          M 168 162
          Q 200 122 250 116
          Q 340 106 410 118
          Q 460 124 490 158
          L 470 162
          Q 440 138 380 134
          Q 290 128 235 142
          Q 200 150 185 164 Z
        "
        fill="url(#cdv-glass)"
      />

      {/* Window split / B-pillar */}
      <line x1="320" y1="116" x2="320" y2="158" stroke={isDark ? "#0c1018" : "#1a1f2d"} strokeWidth="2" />

      {/* Subtle door crease along body */}
      <path d="M 180 200 Q 320 192 510 198" stroke="rgba(0,0,0,0.18)" strokeWidth="1.2" fill="none" />
      <path d="M 180 218 Q 320 210 510 216" stroke="rgba(0,0,0,0.12)" strokeWidth="1" fill="none" />

      {/* Door handles */}
      <rect x="230" y="194" width="26" height="4" rx="2" fill="rgba(0,0,0,0.35)" />
      <rect x="380" y="194" width="26" height="4" rx="2" fill="rgba(0,0,0,0.35)" />

      {/* === Front light bar (full-width LED strip) === */}
      <rect x="88" y="206" width="38" height="6" rx="3" fill="url(#cdv-headbar)" opacity="0.95" />
      {/* Headlight glow halo */}
      <ellipse cx="100" cy="210" rx="38" ry="10" fill="#aee0ff" opacity="0.25" style={{ filter: "blur(6px)" }} />

      {/* Lower front intake */}
      <path d="M 110 234 Q 150 226 200 230 L 200 238 Q 150 234 110 240 Z" fill="rgba(0,0,0,0.45)" />

      {/* Charge port detail on rear quarter */}
      <g transform="translate(490, 200)">
        <rect x="-12" y="-7" width="24" height="14" rx="3" fill="rgba(0,0,0,0.55)" />
        <circle cx="0" cy="0" r="3.5" fill={theme.success} />
        <circle cx="0" cy="0" r="3.5" fill={theme.success} opacity="0.4" style={{ filter: "blur(2px)" }} />
      </g>

      {/* === Wheels === */}
      {/* Front */}
      <g>
        <ellipse cx="160" cy="248" rx="44" ry="46" fill="url(#cdv-tyre)" />
        <ellipse cx="160" cy="246" rx="32" ry="34" fill="url(#cdv-rim)" />
        <circle cx="160" cy="246" r="8" fill="#3a3f4d" />
        {/* 5 spokes */}
        {[0, 72, 144, 216, 288].map(a => {
          const rad = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={160 + 9 * Math.cos(rad)} y1={246 + 9 * Math.sin(rad)}
              x2={160 + 30 * Math.cos(rad)} y2={246 + 32 * Math.sin(rad)}
              stroke="#3a3f4d" strokeWidth="4" strokeLinecap="round"
            />
          );
        })}
      </g>
      {/* Rear */}
      <g>
        <ellipse cx="460" cy="248" rx="44" ry="46" fill="url(#cdv-tyre)" />
        <ellipse cx="460" cy="246" rx="32" ry="34" fill="url(#cdv-rim)" />
        <circle cx="460" cy="246" r="8" fill="#3a3f4d" />
        {[0, 72, 144, 216, 288].map(a => {
          const rad = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={460 + 9 * Math.cos(rad)} y1={246 + 9 * Math.sin(rad)}
              x2={460 + 30 * Math.cos(rad)} y2={246 + 32 * Math.sin(rad)}
              stroke="#3a3f4d" strokeWidth="4" strokeLinecap="round"
            />
          );
        })}
      </g>

      {/* Wheel arches (thin dark accent over body) */}
      <path d="M 116 246 Q 160 196 204 246" stroke="rgba(0,0,0,0.55)" strokeWidth="3" fill="none" />
      <path d="M 416 246 Q 460 196 504 246" stroke="rgba(0,0,0,0.55)" strokeWidth="3" fill="none" />
    </svg>
  );
}
