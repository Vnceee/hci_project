import { useTheme, type Theme } from "@/context/ThemeContext";
import { useNav, TYRE_READINGS, classifyTyre, type TyrePosition, type TyreState } from "@/context/NavContext";

export default function TyreStatusView() {
  const { theme } = useTheme();
  const { setView } = useNav();

  const colorOf = (s: TyreState) =>
    s === "critical" ? theme.danger
    : s === "low"     ? theme.warning
    : theme.success;

  const reading  = (pos: TyrePosition) => TYRE_READINGS.find(r => r.position === pos)!;
  const dotColor = (pos: TyrePosition) => colorOf(classifyTyre(reading(pos).psi));

  const warnings = TYRE_READINGS.filter(r => classifyTyre(r.psi) !== "normal").length;

  return (
    <div
      style={{
        background: theme.panelBg,
        borderRadius: "20px",
        padding: "clamp(14px, 1.8vw, 22px) clamp(16px, 2vw, 26px)",
        border: `1px solid ${theme.border}`,
        boxShadow: theme.mode === "night" ? "0 4px 24px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.07)",
        display: "grid",
        // Three rows: title, centered car, bottom action row.
        gridTemplateRows: "auto 1fr auto",
        gap: "clamp(10px, 1.2vw, 16px)",
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* Title */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
        <div style={{ fontSize: "15px", color: theme.text, fontWeight: 700, letterSpacing: "0.2px" }}>Tyre Status</div>
        <div style={{ fontSize: "11px", color: theme.textMuted, fontWeight: 600 }}>4 wheels monitored</div>
      </div>

      {/* Centered car — top-down silhouette (same visual language as the
          meter cluster) with each corner labelled with its current PSI.
          A side-view strip on the right calls out which side has an issue. */}
      <div style={{
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: 0, gap: "16px",
      }}>
        <div style={{
          position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
          display: "flex", flexDirection: "column", gap: "14px",
        }}>
          <div style={{ fontSize: "20px", fontWeight: 800, color: theme.text, letterSpacing: "1px" }}>PSI</div>
          <LegendItem color={theme.warning} label="Low (25-28)" theme={theme} />
          <LegendItem color={theme.success} label="Normal (30-35)" theme={theme} />
          <LegendItem color={theme.danger}  label="Critical (Below 20)" theme={theme} />
        </div>

        <TyreCar
          theme={theme}
          fl={{ color: dotColor("FL"), psi: reading("FL").psi }}
          fr={{ color: dotColor("FR"), psi: reading("FR").psi }}
          rl={{ color: dotColor("RL"), psi: reading("RL").psi }}
          rr={{ color: dotColor("RR"), psi: reading("RR").psi }}
        />

        {/* Side-view remarks: simple per-side summary so the driver can see
            at a glance which side of the car has an issue. */}
        <div style={{
          position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
          display: "flex", flexDirection: "column", gap: "10px",
          maxWidth: "180px",
        }}>
          <SideRemark theme={theme} side="Left"  positions={["FL", "RL"]} />
          <SideRemark theme={theme} side="Right" positions={["FR", "RR"]} />
        </div>
      </div>

      {/* Bottom row: warnings on the left, stations launcher on the right */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={theme.warning} stroke="#1a1a1a" strokeWidth="1.4">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="17" r="1" fill="#1a1a1a" />
            </svg>
            <span style={{ fontSize: "15px", fontWeight: 700, color: theme.text }}>Warnings</span>
          </div>
          <div style={{
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: "10px",
            padding: "8px 14px",
            fontSize: "12px",
            color: theme.text,
            fontWeight: 600,
            alignSelf: "flex-start",
          }}>
            {warnings} tyre{warnings === 1 ? "" : "s"} need attention
          </div>
        </div>

        <button
          onClick={() => setView("charging")}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
            color: theme.text, padding: "4px",
          }}
        >
          <div style={{
            width: "42px", height: "42px",
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="3" width="11" height="18" rx="2" />
              <path d="M17 8h2l2 3v6a2 2 0 0 1-2 2" />
              <path d="M11 8 L9 12 L13 12 L11 16" />
            </svg>
          </div>
          <span style={{ fontSize: "10px", color: theme.textMuted, fontWeight: 600 }}>Stations</span>
        </button>
      </div>
    </div>
  );
}

function LegendItem({ color, label, theme }: { color: string; label: string; theme: Theme }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{
        width: "12px", height: "12px", borderRadius: "50%",
        background: color, boxShadow: `0 0 6px ${color}88`,
      }} />
      <span style={{ fontSize: "12px", color: theme.text, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function SideRemark({ theme, side, positions }: {
  theme: Theme; side: "Left" | "Right"; positions: TyrePosition[];
}) {
  const worst = positions
    .map(p => ({ pos: p, psi: TYRE_READINGS.find(r => r.position === p)?.psi ?? 32 }))
    .map(x => ({ ...x, state: classifyTyre(x.psi) }))
    .sort((a, b) => sevOf(b.state) - sevOf(a.state))[0];
  const color = worst.state === "critical" ? theme.danger
              : worst.state === "low"      ? theme.warning
              : theme.success;
  const label = worst.state === "normal" ? "All OK" : `${posName(worst.pos)} ${worst.state}`;
  return (
    <div style={{
      background: `${color}1a`,
      border: `1px solid ${color}55`,
      borderRadius: "10px",
      padding: "8px 12px",
      color: theme.text,
    }}>
      <div style={{ fontSize: "10px", color: theme.textMuted, fontWeight: 700, letterSpacing: "0.4px" }}>{side.toUpperCase()} SIDE</div>
      <div style={{ fontSize: "12px", fontWeight: 700, marginTop: "2px", color }}>{label}</div>
      <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "1px" }}>{worst.psi} psi</div>
    </div>
  );
}
function sevOf(s: TyreState) { return s === "critical" ? 2 : s === "low" ? 1 : 0; }
function posName(p: TyrePosition) {
  return ({ FL: "Front", FR: "Front", RL: "Rear", RR: "Rear" } as const)[p] + " tyre";
}

function TyreCar({
  theme, fl, fr, rl, rr,
}: {
  theme: Theme;
  fl: { color: string; psi: number };
  fr: { color: string; psi: number };
  rl: { color: string; psi: number };
  rr: { color: string; psi: number };
}) {
  const isDark = theme.mode === "night";
  return (
    <svg viewBox="0 0 360 420" width="auto" height="100%" style={{ maxHeight: "min(300px, 50vh)", display: "block" }}>
      <defs>
        <linearGradient id="ts-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={isDark ? "#c8d4ec" : "#d8e4f8"} stopOpacity="0.85" />
          <stop offset="50%"  stopColor={isDark ? "#e0eaff" : "#eef4ff"} />
          <stop offset="100%" stopColor={isDark ? "#b8c8e0" : "#ccd8f0"} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="ts-roof" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={isDark ? "#5a6a8a" : "#6a7ea8"} />
          <stop offset="50%"  stopColor={isDark ? "#7888a8" : "#889ab8"} />
          <stop offset="100%" stopColor={isDark ? "#4a5a78" : "#5a6e90"} />
        </linearGradient>
        <filter id="ts-shadow">
          <feDropShadow dx="0" dy="10" stdDeviation="18" floodColor={isDark ? "rgba(74,142,255,0.15)" : "rgba(37,99,235,0.10)"} />
        </filter>
      </defs>

      {/* Corner PSI badges (dot + numeric value) */}
      <PsiBadge x={50}  y={120} color={fl.color} psi={fl.psi} theme={theme} anchor="end" />
      <PsiBadge x={310} y={120} color={fr.color} psi={fr.psi} theme={theme} anchor="start" />
      <PsiBadge x={50}  y={320} color={rl.color} psi={rl.psi} theme={theme} anchor="end" />
      <PsiBadge x={310} y={320} color={rr.color} psi={rr.psi} theme={theme} anchor="start" />

      <g filter="url(#ts-shadow)" transform="translate(180, 210)">
        <path d="M-58 -140 Q0 -156 58 -140 L52 -125 Q0 -138 -52 -125 Z" fill="url(#ts-body)" opacity="0.75" />
        <rect x="-82" y="-120" width="26" height="46" rx="5" fill={isDark ? "#0d1020" : "#1a1d30"} />
        <rect x="56"  y="-120" width="26" height="46" rx="5" fill={isDark ? "#0d1020" : "#1a1d30"} />
        <path d="M-58 -125 Q-65 -118 -65 -108 L-65 108 Q-65 120 -55 125 L55 125 Q65 120 65 108 L65 -108 Q65 -118 58 -125 Z"
              fill="url(#ts-body)" />
        <path d="M-55 -125 Q0 -140 55 -125 L55 -75 Q0 -85 -55 -75 Z"
              fill={isDark ? "#ccd8ee" : "#dce8fc"} opacity="0.85" />
        <path d="M-50 -75 Q0 -85 50 -75 L45 -35 Q0 -42 -45 -35 Z" fill="url(#ts-roof)" opacity="0.92" />
        <path d="M-45 -35 Q0 -42 45 -35 L45 35 Q0 30 -45 35 Z"
              fill={isDark ? "#62728e" : "#72849e"} />
        <path d="M-45 35 Q0 30 45 35 L50 75 Q0 82 -50 75 Z" fill="url(#ts-roof)" opacity="0.82" />
        <path d="M-55 75 Q0 85 55 75 L55 125 Q0 138 -55 125 Z"
              fill={isDark ? "#ccd8ee" : "#dce8fc"} opacity="0.8" />
        <rect x="-82" y="74"  width="26" height="46" rx="5" fill={isDark ? "#0d1020" : "#1a1d30"} />
        <rect x="56"  y="74"  width="26" height="46" rx="5" fill={isDark ? "#0d1020" : "#1a1d30"} />
        <path d="M-55 125 Q0 140 55 125 L58 142 Q0 156 -58 142 Z"
              fill={isDark ? "#b8c8e0" : "#c8d8f0"} opacity="0.7" />
        <rect x="-52" y="-138" width="20" height="7" rx="2" fill="#ffd060" opacity="0.95" />
        <rect x="32"  y="-138" width="20" height="7" rx="2" fill="#ffd060" opacity="0.95" />
        <rect x="-52" y="130" width="20" height="9" rx="2" fill="#ff3344" opacity="0.9" />
        <rect x="32"  y="130" width="20" height="9" rx="2" fill="#ff3344" opacity="0.9" />
        <rect x="-54" y="129" width="24" height="11" rx="3" fill="#ff3344" opacity="0.35" style={{ filter: "blur(4px)" }} />
        <rect x="30"  y="129" width="24" height="11" rx="3" fill="#ff3344" opacity="0.35" style={{ filter: "blur(4px)" }} />
        <line x1="0" y1="-125" x2="0" y2="125" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

/* Small badge sitting next to each corner of the top-down car: a colored
   dot + the live PSI value. `anchor` picks which side the text sits on so
   it doesn't overlap the silhouette. */
function PsiBadge({ x, y, color, psi, theme, anchor }: {
  x: number; y: number; color: string; psi: number; theme: Theme;
  anchor: "start" | "end";
}) {
  const tx = anchor === "end" ? x - 22 : x + 22;
  return (
    <g>
      <circle cx={x} cy={y} r="11" fill={color} />
      <text x={tx} y={y + 5} textAnchor={anchor} fontSize="16" fontWeight="800" fill={theme.text}>{psi}</text>
      <text x={tx} y={y + 19} textAnchor={anchor} fontSize="9" fontWeight="700" fill={theme.textMuted}>PSI</text>
    </g>
  );
}
