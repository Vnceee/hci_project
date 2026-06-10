import { useTheme } from "@/context/ThemeContext";
import { useNav } from "@/context/NavContext";

export default function CarPanel() {
  const { theme } = useTheme();
  const { setView } = useNav();

  return (
    <div
      onClick={() => setView("car-details")}
      title="Tap for car details"
      style={{
        background: theme.panelBg,
        borderRadius: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 14px 14px",
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${theme.border}`,
        boxShadow: theme.mode === "night"
          ? "0 4px 24px rgba(0,0,0,0.3)"
          : "0 2px 12px rgba(0,0,0,0.07)",
        height: "100%",
        cursor: "pointer",
      }}
    >
      {/* Header */}
      <div style={{ alignSelf: "flex-start", width: "100%" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: theme.text }}>Ailon 67</div>
        <div style={{ fontSize: "10px", color: theme.textMuted, marginTop: "2px" }}>2030 Ailon Edition</div>
      </div>

      {/* Speed */}
      <div style={{ marginTop: "14px", textAlign: "center" }}>
        <span style={{ fontSize: "32px", fontWeight: 800, color: theme.text, letterSpacing: "-1px", fontFamily: "'Orbitron', sans-serif" }}>200</span>
        <span style={{ fontSize: "15px", color: theme.textSub, fontWeight: 500, marginLeft: "5px", fontFamily: "'Exo 2', sans-serif" }}>km/h</span>
      </div>

      {/* Car with circular ring — fills remaining space */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          position: "relative",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <CarWithRing theme={theme} />
      </div>

      {/* Mode display — non-interactive */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          background: theme.mode === "night" ? "#f0f0f0" : "#1a1d26",
          borderRadius: "14px",
          padding: "13px 0",
          color: theme.mode === "night" ? "#1a1d26" : "#f0f0f0",
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "0.03em",
          marginTop: "8px",
          flexShrink: 0,
          textAlign: "center",
          userSelect: "none",
        }}
      >
        Mode
      </div>
    </div>
  );
}

function CarWithRing({ theme }: { theme: import("@/context/ThemeContext").Theme }) {
  const ringColor = theme.mode === "night" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const ring2Color = theme.mode === "night" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

  return (
    <svg
      viewBox="0 0 280 340"
      width="100%"
      height="100%"
      style={{ maxHeight: "420px" }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={theme.mode === "night" ? "rgba(74,142,255,0.08)" : "rgba(37,99,235,0.05)"} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="carBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={theme.mode === "night" ? "#c8d4ec" : "#d8e4f8"} stopOpacity="0.85" />
          <stop offset="50%" stopColor={theme.mode === "night" ? "#e0eaff" : "#eef4ff"} />
          <stop offset="100%" stopColor={theme.mode === "night" ? "#b8c8e0" : "#ccd8f0"} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="carRoof" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={theme.mode === "night" ? "#5a6a8a" : "#6a7ea8"} />
          <stop offset="50%" stopColor={theme.mode === "night" ? "#7888a8" : "#889ab8"} />
          <stop offset="100%" stopColor={theme.mode === "night" ? "#4a5a78" : "#5a6e90"} />
        </linearGradient>
        <filter id="carShadow">
          <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor={theme.mode === "night" ? "rgba(74,142,255,0.15)" : "rgba(37,99,235,0.10)"} />
        </filter>
      </defs>

      {/* Outer rings */}
      <ellipse cx="140" cy="170" rx="128" ry="148" fill="none" stroke={ringColor} strokeWidth="1" strokeDasharray="4 8" />
      <ellipse cx="140" cy="170" rx="100" ry="116" fill="none" stroke={ring2Color} strokeWidth="1" />
      <ellipse cx="140" cy="170" rx="130" ry="150" fill="url(#glowGrad)" />

      {/* Car group */}
      <g filter="url(#carShadow)" transform="translate(140, 170)">
        {/* Front bumper */}
        <path d="M-46 -112 Q0 -125 46 -112 L42 -100 Q0 -110 -42 -100 Z" fill="url(#carBody)" opacity="0.75" />

        {/* Front wheels */}
        <rect x="-66" y="-96" width="22" height="38" rx="5" fill={theme.mode === "night" ? "#0d1020" : "#1a1d30"} />
        <rect x="44" y="-96" width="22" height="38" rx="5" fill={theme.mode === "night" ? "#0d1020" : "#1a1d30"} />
        <rect x="-64" y="-94" width="18" height="34" rx="4" fill={theme.mode === "night" ? "#1a1e35" : "#22263d"} />
        <rect x="46" y="-94" width="18" height="34" rx="4" fill={theme.mode === "night" ? "#1a1e35" : "#22263d"} />
        <circle cx="-55" cy="-77" r="7" fill={theme.mode === "night" ? "#0d1020" : "#1a1d30"} />
        <circle cx="55" cy="-77" r="7" fill={theme.mode === "night" ? "#0d1020" : "#1a1d30"} />

        {/* Main body */}
        <path d="M-46 -100 Q-52 -94 -52 -86 L-52 86 Q-52 96 -44 100 L44 100 Q52 96 52 86 L52 -86 Q52 -94 46 -100 Z"
          fill="url(#carBody)" />

        {/* Hood */}
        <path d="M-44 -100 Q0 -112 44 -100 L44 -60 Q0 -68 -44 -60 Z" fill={theme.mode === "night" ? "#ccd8ee" : "#dce8fc"} opacity="0.85" />

        {/* Windshield */}
        <path d="M-40 -60 Q0 -68 40 -60 L36 -28 Q0 -34 -36 -28 Z"
          fill="url(#carRoof)" opacity="0.92" />

        {/* Roof */}
        <path d="M-36 -28 Q0 -34 36 -28 L36 28 Q0 24 -36 28 Z" fill={theme.mode === "night" ? "#62728e" : "#72849e"} />

        {/* Rear windshield */}
        <path d="M-36 28 Q0 24 36 28 L40 60 Q0 66 -40 60 Z"
          fill="url(#carRoof)" opacity="0.82" />

        {/* Rear body / trunk */}
        <path d="M-44 60 Q0 68 44 60 L44 100 Q0 110 -44 100 Z" fill={theme.mode === "night" ? "#ccd8ee" : "#dce8fc"} opacity="0.8" />

        {/* Rear wheels */}
        <rect x="-66" y="58" width="22" height="38" rx="5" fill={theme.mode === "night" ? "#0d1020" : "#1a1d30"} />
        <rect x="44" y="58" width="22" height="38" rx="5" fill={theme.mode === "night" ? "#0d1020" : "#1a1d30"} />
        <rect x="-64" y="60" width="18" height="34" rx="4" fill={theme.mode === "night" ? "#1a1e35" : "#22263d"} />
        <rect x="46" y="60" width="18" height="34" rx="4" fill={theme.mode === "night" ? "#1a1e35" : "#22263d"} />
        <circle cx="-55" cy="77" r="7" fill={theme.mode === "night" ? "#0d1020" : "#1a1d30"} />
        <circle cx="55" cy="77" r="7" fill={theme.mode === "night" ? "#0d1020" : "#1a1d30"} />

        {/* Rear bumper */}
        <path d="M-44 100 Q0 112 44 100 L46 114 Q0 126 -46 114 Z" fill={theme.mode === "night" ? "#b8c8e0" : "#c8d8f0"} opacity="0.7" />

        {/* Front headlights (amber) */}
        <rect x="-42" y="-110" width="16" height="6" rx="2" fill="#ffd060" opacity="0.95" />
        <rect x="26" y="-110" width="16" height="6" rx="2" fill="#ffd060" opacity="0.95" />

        {/* Rear lights (red) */}
        <rect x="-42" y="104" width="16" height="7" rx="2" fill="#ff3344" opacity="0.9" />
        <rect x="26" y="104" width="16" height="7" rx="2" fill="#ff3344" opacity="0.9" />

        {/* Rear light glow */}
        <rect x="-44" y="103" width="20" height="9" rx="3" fill="#ff3344" opacity="0.35" style={{ filter: "blur(4px)" }} />
        <rect x="24" y="103" width="20" height="9" rx="3" fill="#ff3344" opacity="0.35" style={{ filter: "blur(4px)" }} />

        {/* Door seam */}
        <path d="M-50 -28 Q0 -32 50 -28" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
        <path d="M-50 28 Q0 24 50 28" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" />

        {/* Center highlight */}
        <line x1="0" y1="-100" x2="0" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
