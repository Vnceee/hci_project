import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useNav } from "@/context/NavContext";
import { HomeCar } from "@/components/HomePanel";

const FRAME = "#F5A623";

interface ClusterColors {
  isDark: boolean;
  bg: string;
  panel: string;
  text: string;
  textMuted: string;
  arcBg: string;
  pillBg: string;
  pillText: string;
  danger: string;
  warning: string;
}

function getColors(isDark: boolean, danger: string, warning: string): ClusterColors {
  // Identical layout for both themes — only colours change.
  if (isDark) {
    return {
      isDark: true,
      bg: "#000000",
      panel: "#000000",
      text: "#ffffff",
      textMuted: "rgba(255,255,255,0.55)",
      arcBg: "rgba(255,255,255,0.15)",
      pillBg: "#1f1f1f",
      pillText: "#e5e7eb",
      danger,
      warning,
    };
  }
  return {
    isDark: false,
    bg: "#f3f4f6",
    panel: "#ffffff",
    text: "#1a1a1a",
    textMuted: "#4b5563",
    arcBg: "#d1d5db",
    pillBg: "#e5e7eb",
    pillText: "#1a1a1a",
    danger,
    warning,
  };
}

/**
 * Full instrument cluster — fits inside the Dashboard grid area so the global
 * TopBar (which already has back / home buttons) stays visible above it.
 *
 * The layout is identical between light and dark themes; only the colour
 * palette changes.
 */
export default function MeterDashboard() {
  const { theme } = useTheme();
  const { goHome, gear, setGear, signal, setSignal, brake, setBrake, speed, setSpeed, batteryPct, mode, kmLeft } = useNav();
  const c = getColors(theme.mode === "night", theme.danger, theme.warning);

  // Pedals: gas accelerates while held; brake decelerates while held.
  // Speed lives in NavContext so the home screen's "km/h" headline
  // reflects exactly what the cluster shows here.
  const [gas, setGas] = useState(false);

  // The mid control bar floats over the cluster, can be dragged around,
  // and can be hidden so only the BRAKE and GAS pedals remain on screen.
  // Position is stored as % of the cluster frame so it survives resizes.
  const [ctrlVisible, setCtrlVisible] = useState(true);
  const [ctrlPos, setCtrlPos] = useState<{ x: number; y: number }>({ x: 50, y: 92 });
  const dragRef = useRef<{
    startX: number; startY: number; ox: number; oy: number;
    rect: DOMRect | null;
    halfW: number; halfH: number; // bar half-size as % of cluster, used to clamp
  } | null>(null);
  const clusterRef = useRef<HTMLDivElement>(null);
  const onCtrlDragStart = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
    const cluster = clusterRef.current?.getBoundingClientRect() ?? null;
    const bar = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const halfW = cluster ? (bar.width  / 2 / cluster.width)  * 100 : 0;
    const halfH = cluster ? (bar.height / 2 / cluster.height) * 100 : 0;
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      ox: ctrlPos.x, oy: ctrlPos.y,
      rect: cluster, halfW, halfH,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onCtrlDragMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || !d.rect) return;
    const dx = ((e.clientX - d.startX) / d.rect.width)  * 100;
    const dy = ((e.clientY - d.startY) / d.rect.height) * 100;
    // Clamp so the full pill stays inside the cluster frame (translate -50%).
    setCtrlPos({
      x: Math.min(100 - d.halfW, Math.max(d.halfW, d.ox + dx)),
      y: Math.min(100 - d.halfH, Math.max(d.halfH, d.oy + dy)),
    });
  };
  const onCtrlDragEnd = () => { dragRef.current = null; };
  useEffect(() => {
    const id = setInterval(() => {
      setSpeed(prev => {
        if (gear === "P" || gear === "N") return Math.max(0, prev - 6);
        if (brake) return Math.max(0, prev - 8);
        if (gas) {
          if (gear === "R") return Math.min(20, prev + 1);
          return Math.min(220, prev + 4);
        }
        // Engine braking when neither pedal is pressed.
        return Math.max(0, prev - 1);
      });
    }, 120);
    return () => clearInterval(id);
  }, [gear, brake, gas]);

  // Control-panel state — only the indicators we still surface on the dash:
  // headlights, high beam, and horn (press-and-hold).
  const [controls, setControls] = useState({
    headlight: false,
    highBeam:  false,
  });
  const [horn, setHorn] = useState(false);
  const toggle = (k: keyof typeof controls) =>
    setControls(s => ({ ...s, [k]: !s[k] }));

  // Safety: if the cluster view is dismissed while a pedal is held down
  // (pointerup never fires), make sure the global brake stays consistent
  // and that gas/horn don't get stuck.
  useEffect(() => {
    return () => {
      setBrake(false);
      setGas(false);
      setHorn(false);
    };
  }, [setBrake]);

  const signalLeft  = signal === "left"  || signal === "hazard";
  const signalRight = signal === "right" || signal === "hazard";
  const toggleSignal = (s: "left" | "right" | "hazard") =>
    setSignal(signal === s ? "off" : s);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: c.bg,
        zIndex: 2000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "1.5vh",
        fontFamily: "'Inter', -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Single back-out button — the only nav in this fullscreen cluster view */}
      <button
        onClick={goHome}
        title="Exit cluster"
        style={{
          position: "absolute", top: "20px", left: "20px",
          width: "44px", height: "44px",
          borderRadius: "50%",
          background: c.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          border: `1px solid ${c.isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`,
          color: c.text,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", zIndex: 5,
          backdropFilter: "blur(8px)",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      {/* Turn-signal blink keyframes — scoped to this component */}
      <style>{`
        @keyframes md-blink {
          0%, 49%   { opacity: 1; }
          50%, 100% { opacity: 0.18; }
        }
        .md-signal { animation: md-blink 0.9s steps(1, end) infinite; transform-origin: center; }
      `}</style>

      <div
        ref={clusterRef}
        style={{
          position: "relative",
          width: "min(94%, 1280px)",
          aspectRatio: "1868 / 920",
        }}
      >
        {/* Frame: blinking left + right yellow chevrons, with the inner body
            rendered between them. Each chevron is its own polygon so we can
            animate them independently as turn signals. */}
        <svg
          viewBox="0 0 1868 920"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          preserveAspectRatio="none"
        >
          {/* Inner body (panel) */}
          <polygon
            points="252,0 672,0 756,150 1112,150 1196,0 1616,0 1818,460 1616,920 1196,920 1112,770 756,770 672,920 252,920 50,460"
            fill={c.panel}
          />
          {/* Left turn signal — blinks only when active */}
          <polygon
            className={signalLeft ? "md-signal" : ""}
            points="0,460 252,0 50,460 252,920"
            fill={FRAME}
            opacity={signalLeft ? 1 : 0.28}
          />
          {/* Right turn signal — blinks only when active */}
          <polygon
            className={signalRight ? "md-signal" : ""}
            points="1868,460 1616,0 1818,460 1616,920"
            fill={FRAME}
            opacity={signalRight ? 1 : 0.28}
          />
        </svg>

        {/* Nav banner inside the top notch */}
        <div
          style={{
            position: "absolute", top: "1%", left: "50%",
            transform: "translateX(-50%)",
            padding: "8px 22px 10px",
            display: "flex", alignItems: "center", gap: "14px",
            color: c.text, minWidth: "240px", zIndex: 2,
          }}
        >
          {/* Clean turn-right navigation arrow */}
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none" stroke={c.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 26 L6 16 Q6 12 10 12 L22 12" />
            <polyline points="18 6 24 12 18 18" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
            <span style={{ color: theme.success, fontSize: "clamp(13px, 1.6vw, 24px)", fontWeight: 700 }}>100m</span>
            <span style={{ fontSize: "clamp(11px, 1.3vw, 18px)", fontWeight: 600 }}>Jln Kuching</span>
            <span style={{ fontSize: "clamp(9px, 1.05vw, 14px)", color: c.textMuted }}>ETA : 5 minutes</span>
          </div>
        </div>

        {/* Status row: 28°C | headlight | 9:50 */}
        <div
          style={{
            position: "absolute", top: "21%", left: "50%",
            transform: "translateX(-50%)",
            display: "flex", alignItems: "center",
            gap: "5%", width: "22%",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "clamp(12px, 1.6vw, 24px)", color: c.text, fontWeight: 600 }}>28°C</span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minHeight: "26px" }}>
            {/* Headlight indicator — only visible when toggled on. */}
            {controls.headlight && <HeadlightIcon color="#F5A623" />}
            {/* High-beam indicator — blue when active. */}
            {controls.highBeam  && <HeadlightIcon color="#3D53FF" beam="high" />}
            {/* Horn pulse */}
            {horn && (
              <span style={{
                fontSize: "clamp(11px, 1.3vw, 16px)", color: "#f43f5e", fontWeight: 800,
                animation: "md-blink 0.25s steps(1, end) infinite",
              }}>HORN</span>
            )}
          </div>
          <span style={{ fontSize: "clamp(12px, 1.6vw, 24px)", color: c.text, fontWeight: 600 }}>9:50</span>
        </div>

        {/* Drive mode / range pills — mirror NavContext so they match the home panel */}
        <Pill colors={c} style={{ position: "absolute", top: "12%", left: "17%" }}>{mode}</Pill>
        <Pill colors={c} style={{ position: "absolute", top: "12%", right: "17%" }}>{kmLeft} km left</Pill>

        {/* Gauges */}
        <div style={{ position: "absolute", left: "8%", top: "24%", width: "30%", height: "58%" }}>
          <ArcGauge
            value={speed} max={300} unit="km/h" side="left" colors={c}
            colorStops={[
              { at: 0,    color: c.isDark ? "#1f2937" : "#9ca3af" },
              { at: 0.25, color: "#3D53FF" },
              { at: 0.55, color: "#8b5cf6" },
              { at: 1,    color: c.isDark ? "#1f2937" : "#9ca3af" },
            ]}
          />
        </div>
        <div style={{ position: "absolute", right: "8%", top: "24%", width: "30%", height: "58%" }}>
          <ArcGauge
            value={batteryPct} max={100} unit="%" side="right" colors={c}
            colorStops={[
              { at: 0,    color: theme.success },
              { at: 0.4,  color: "#eab308" },
              { at: 0.7,  color: "#f97316" },
              { at: 1,    color: theme.danger },
            ]}
          />
        </div>

        {/* Center car — shares the SAME HomeCar component used by the
            home screen and car-details view so the silhouette, size, and
            centering match across every screen of the app. */}
        <div
          style={{
            position: "absolute", top: "22%", left: "50%",
            transform: "translateX(-50%)",
            width: "26%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <HomeCar theme={theme} />
        </div>

        {/* Floating mid control bar — turn signals, gear shifter, lights, horn.
            Draggable by its grip handle; toggle button (always visible) shows /
            hides the bar so the driver can clear the cluster to just pedals.
            BRAKE + GAS pedals live outside this frame and are never hidden. */}
        {ctrlVisible && (
          <div
            onPointerDown={onCtrlDragStart}
            onPointerMove={onCtrlDragMove}
            onPointerUp={onCtrlDragEnd}
            onPointerCancel={onCtrlDragEnd}
            style={{
              position: "absolute",
              left: `${ctrlPos.x}%`,
              top:  `${ctrlPos.y}%`,
              transform: "translate(-50%, -50%)",
              display: "flex", alignItems: "center",
              gap: "clamp(4px, 0.7vw, 10px)",
              background: c.isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.85)",
              border: `1px solid ${c.isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)"}`,
              borderRadius: "999px",
              padding: "8px 14px 8px 10px",
              backdropFilter: "blur(8px)",
              boxShadow: c.isDark ? "0 6px 24px rgba(0,0,0,0.5)" : "0 6px 18px rgba(0,0,0,0.18)",
              zIndex: 5,
              cursor: dragRef.current ? "grabbing" : "grab",
              touchAction: "none",
              userSelect: "none",
            }}
          >
            {/* Drag grip */}
            <div style={{
              display: "flex", flexDirection: "column", gap: "2px",
              padding: "0 4px", color: c.textMuted, opacity: 0.7,
            }} aria-label="Drag to move">
              <span style={{ display: "flex", gap: "2px" }}>
                <Dot c={c.textMuted} /><Dot c={c.textMuted} />
              </span>
              <span style={{ display: "flex", gap: "2px" }}>
                <Dot c={c.textMuted} /><Dot c={c.textMuted} />
              </span>
              <span style={{ display: "flex", gap: "2px" }}>
                <Dot c={c.textMuted} /><Dot c={c.textMuted} />
              </span>
            </div>
            {/* Hide button */}
            <button
              data-no-drag
              onClick={() => setCtrlVisible(false)}
              title="Hide controls"
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: c.textMuted, padding: "4px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6 L18 18 M18 6 L6 18" /></svg>
            </button>
            <div data-no-drag style={{ width: "1px", alignSelf: "stretch", background: c.isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)", margin: "0 4px" }} />
            <div data-no-drag style={{ display: "flex", alignItems: "center", gap: "clamp(4px, 0.7vw, 10px)" }}>
          <CtrlButton colors={c} label="Left" active={signal === "left"} activeColor="#F5A623" onClick={() => toggleSignal("left")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14 4 L4 12 L14 20 L14 15 L20 15 L20 9 L14 9 Z" /></svg>
          </CtrlButton>
          <CtrlButton colors={c} label="Right" active={signal === "right"} activeColor="#F5A623" onClick={() => toggleSignal("right")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4 L20 12 L10 20 L10 15 L4 15 L4 9 L10 9 Z" /></svg>
          </CtrlButton>
          <CtrlButton colors={c} label="Hazard" active={signal === "hazard"} activeColor="#F93827" onClick={() => toggleSignal("hazard")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 L22 20 L2 20 Z" opacity="0.92"/><line x1="12" y1="10" x2="12" y2="15" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="17.5" r="1" fill="#1a1a1a"/></svg>
          </CtrlButton>

          <div style={{ width: "1px", alignSelf: "stretch", background: c.isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)", margin: "0 4px" }} />

          {/* Gear shifter — single source of truth (Car Details mirrors this) */}
          <div style={{
            display: "flex", gap: "2px",
            background: c.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            border: `1px solid ${c.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            borderRadius: "10px", padding: "3px",
          }}>
            {(["P", "R", "N", "D"] as const).map(g => {
              const active = gear === g;
              const col = g === "R" ? "#F93827" : "#16C47F";
              return (
                <button
                  key={g}
                  onClick={() => setGear(g)}
                  style={{
                    background: active ? col : "transparent",
                    border: "none",
                    borderRadius: "7px",
                    width: "30px", height: "30px",
                    color: active ? "#fff" : c.textMuted,
                    fontSize: "13px", fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: active ? `0 0 10px ${col}77` : "none",
                    fontFamily: "inherit",
                    transition: "all 0.12s",
                  }}
                >{g}</button>
              );
            })}
          </div>

          <div style={{ width: "1px", alignSelf: "stretch", background: c.isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)", margin: "0 4px" }} />

          <CtrlButton colors={c} label="Lights" active={controls.headlight} activeColor="#F5A623" onClick={() => toggle("headlight")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 12c0-3.87 3.13-7 7-7s7 3.13 7 7v3a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-3z" opacity="0.85"/><path d="M2 10h2M2 14h2M2 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
          </CtrlButton>
          <CtrlButton colors={c} label="High" active={controls.highBeam} activeColor="#3D53FF" onClick={() => toggle("highBeam")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 12c0-3.87 3.13-7 7-7s7 3.13 7 7v3a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-3z" opacity="0.85"/><path d="M2 9h3M2 12h3M2 15h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
          </CtrlButton>
          <CtrlButton colors={c} label={horn ? "Horn!" : "Horn"} active={horn} activeColor="#f43f5e"
            onPointerDown={() => setHorn(true)} onPointerUp={() => setHorn(false)} onPointerLeave={() => setHorn(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 10v4h4l5 4V6L7 10H3z" opacity="0.92"/><path d="M16 8a4 4 0 0 1 0 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </CtrlButton>
            </div>
          </div>
        )}

        {/* Tiny "show controls" pill when the bar is hidden. Sits in a
            non-intrusive spot just above the centre of the cluster. */}
        {!ctrlVisible && (
          <button
            onClick={() => setCtrlVisible(true)}
            style={{
              position: "absolute", bottom: "1%", left: "50%",
              transform: "translateX(-50%)",
              background: c.isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.85)",
              border: `1px solid ${c.isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)"}`,
              borderRadius: "999px",
              padding: "8px 14px",
              color: c.text,
              fontSize: "12px", fontWeight: 700,
              display: "flex", alignItems: "center", gap: "8px",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              zIndex: 5,
              fontFamily: "inherit",
            }}
            title="Show controls"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></svg>
            Controls
          </button>
        )}

        {/* Speed limit + battery temp — centered under each gauge. */}
        <div style={{
          position: "absolute", bottom: "10%", left: "23%",
          transform: "translateX(-50%)",
        }}>
          <SpeedLimitPill colors={c} />
        </div>
        <div style={{
          position: "absolute", bottom: "8%", right: "23%",
          transform: "translateX(50%)",
        }}>
          <BatteryTempIcon />
        </div>

        {/* Large gear letters above the control bar — purely indicative. */}
        <div
          style={{
            position: "absolute", bottom: "5%", left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "clamp(14px, 2vw, 32px)",
            color: c.text,
            zIndex: 2,
          }}
        >
          {(["P", "R", "N", "D"] as const).map(g => {
            const active = g === gear;
            return (
              <span
                key={g}
                style={{
                  fontSize: "clamp(20px, 2.4vw, 36px)",
                  fontWeight: 800,
                  color: active
                    ? (g === "R" ? "#F93827" : c.text)
                    : (c.isDark ? "rgba(255,255,255,0.32)" : "rgba(26,26,26,0.32)"),
                  letterSpacing: "2px",
                  textShadow: active
                    ? (c.isDark ? "0 0 10px rgba(255,255,255,0.5)" : "0 0 6px rgba(0,0,0,0.18)")
                    : "none",
                  transition: "color 0.15s, text-shadow 0.15s",
                }}
              >
                {g}
              </span>
            );
          })}
        </div>
      </div>

      {/* === BIG CORNER PEDALS — sit on the screen, not on the cluster.
          Press-and-hold: brake decelerates, gas accelerates. === */}
      <PedalButton
        side="left"
        active={brake}
        color="#F93827"
        label="STOP"
        sublabel="Hold to brake"
        onHold={setBrake}
      />
      <PedalButton
        side="right"
        active={gas}
        color="#16C47F"
        label="GAS"
        sublabel="Hold to accelerate"
        onHold={setGas}
      />
    </div>
  );
}

function PedalButton({
  side, active, color, label, sublabel, onHold,
}: {
  side: "left" | "right";
  active: boolean;
  color: string;
  label: string;
  sublabel: string;
  onHold: (v: boolean) => void;
}) {
  const press = () => onHold(true);
  const release = () => onHold(false);
  return (
    <button
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onContextMenu={e => e.preventDefault()}
      style={{
        position: "absolute",
        bottom: "28px",
        [side]: "28px",
        width: "clamp(120px, 12vw, 170px)",
        height: "clamp(120px, 12vw, 170px)",
        borderRadius: "26px",
        background: active
          ? `linear-gradient(180deg, ${color} 0%, ${color}cc 100%)`
          : "linear-gradient(180deg, rgba(45,45,52,0.95) 0%, rgba(20,20,24,0.95) 100%)",
        border: `2.5px solid ${active ? "#fff" : color}aa`,
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        boxShadow: active
          ? `0 0 32px ${color}aa, 0 8px 20px rgba(0,0,0,0.5), inset 0 -4px 0 rgba(0,0,0,0.3)`
          : `0 8px 22px rgba(0,0,0,0.55), inset 0 -5px 0 rgba(0,0,0,0.4)`,
        transform: active ? "translateY(3px)" : "translateY(0)",
        transition: "transform 0.08s, background 0.12s, box-shadow 0.15s",
        userSelect: "none",
        touchAction: "none",
        zIndex: 10,
        fontFamily: "inherit",
      }}
    >
      <div style={{ fontSize: "clamp(22px, 2.4vw, 32px)", fontWeight: 900, letterSpacing: "1.5px" }}>{label}</div>
      <div style={{ fontSize: "10px", fontWeight: 600, opacity: 0.8, letterSpacing: "0.4px" }}>{sublabel}</div>
    </button>
  );
}

/**
 * Renders pulsing markers over the centre car illustration to flag any
 * open door (red) or under-pressure tyre (yellow). The wrapper that hosts
 * the HomepageCar must be `position: relative` and sized identically to
 * the car, which it is.
 */
function CarStatusOverlay({ danger, warning }: { danger: string; warning: string }) {
  // One coloured dot per wheel. The warning row used to surface these, but
  // now the wheels themselves carry the status with a strong glow so the
  // information stays visible.
  const tyres: { top: string; left: string; color: string }[] = [
    { top: "22%",  left: "-8%",  color: warning }, // FL  low
    { top: "22%",  left: "108%", color: "transparent" }, // FR normal
    { top: "78%",  left: "-8%",  color: "transparent" }, // RL normal
    { top: "78%",  left: "108%", color: danger  }, // RR critical
  ];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {tyres.map((m, i) => m.color === "transparent" ? null : (
        <div
          key={i}
          title="Tyre alert"
          style={{
            position: "absolute",
            top: m.top, left: m.left,
            transform: "translate(-50%, -50%)",
            width: "18px", height: "18px",
            borderRadius: "50%",
            background: m.color,
            boxShadow: `0 0 22px ${m.color}, 0 0 10px ${m.color}, 0 0 4px ${m.color}`,
            border: "2px solid rgba(0,0,0,0.4)",
            animation: "md-warn-pulse 1.2s ease-in-out infinite",
          }}
        />
      ))}
      <style>{`
        @keyframes md-warn-pulse {
          0%, 100% { opacity: 1;   transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 22px currentColor; }
          50%      { opacity: 0.7; transform: translate(-50%, -50%) scale(1.3); }
        }
      `}</style>
    </div>
  );
}

/* ===================== Sub-components ===================== */

/**
 * Live-control button used in the cluster's bottom row. Supports either a
 * click toggle (`onClick`) or press-and-hold (`onPointerDown`/`onPointerUp`)
 * for things like the horn. Active state lights up in `activeColor`.
 */
function CtrlButton({
  children, label, active, activeColor, colors,
  onClick, onPointerDown, onPointerUp, onPointerLeave,
}: {
  children: React.ReactNode;
  label: string;
  active: boolean;
  activeColor: string;
  colors: ClusterColors;
  onClick?: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  onPointerLeave?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      title={label}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
        width: "clamp(44px, 5vw, 60px)",
        padding: "6px 4px",
        background: active ? `${activeColor}26` : "transparent",
        border: `1px solid ${active ? activeColor : (colors.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)")}`,
        borderRadius: "12px",
        color: active ? activeColor : colors.textMuted,
        cursor: "pointer",
        transition: "all 0.12s",
        boxShadow: active ? `0 0 14px ${activeColor}55, inset 0 0 8px ${activeColor}33` : "none",
        fontFamily: "inherit",
        userSelect: "none",
        touchAction: "manipulation",
      }}
    >
      {children}
      <span style={{ fontSize: "clamp(8px, 0.7vw, 10px)", fontWeight: 700, letterSpacing: "0.04em" }}>{label}</span>
    </button>
  );
}

function Pill({
  children, style, colors,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  colors: ClusterColors;
}) {
  return (
    <div
      style={{
        background: colors.pillBg,
        color: colors.pillText,
        borderRadius: "999px",
        padding: "0.5em 1.6em",
        fontSize: "clamp(11px, 1.4vw, 20px)",
        fontWeight: 600,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function HeadlightIcon({ color = "#3D53FF", beam = "low" }: { color?: string; beam?: "low" | "high" }) {
  return (
    <svg width="46" height="30" viewBox="0 0 48 32" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <path d="M4 6 Q14 4 22 12 Q14 20 4 18 Z" fill={color} />
      {beam === "high" ? (
        <>
          <line x1="28" y1="8"  x2="44" y2="8" />
          <line x1="28" y1="14" x2="44" y2="14" />
          <line x1="28" y1="20" x2="44" y2="20" />
        </>
      ) : (
        <>
          <line x1="28" y1="10" x2="42" y2="14" />
          <line x1="28" y1="16" x2="42" y2="20" />
          <line x1="28" y1="22" x2="42" y2="26" />
        </>
      )}
    </svg>
  );
}

function ArcGauge({
  value, max, unit, colorStops, side, colors,
}: {
  value: number;
  max: number;
  unit: string;
  colorStops: { at: number; color: string }[];
  side: "left" | "right";
  colors: ClusterColors;
}) {
  const R = 180;
  const CX = 200;
  const CY = 200;
  const toRad = (d: number) => (d * Math.PI) / 180;

  const startDeg = side === "left" ? 60 : 120;
  const endDeg   = side === "left" ? 300 : 240;
  const sweepFlag = side === "left" ? 0 : 1;

  const startPt = { x: CX + R * Math.cos(toRad(startDeg)), y: CY - R * Math.sin(toRad(startDeg)) };
  const endPt   = { x: CX + R * Math.cos(toRad(endDeg)),   y: CY - R * Math.sin(toRad(endDeg))   };
  const arcPath = `M ${startPt.x} ${startPt.y} A ${R} ${R} 0 1 ${sweepFlag} ${endPt.x} ${endPt.y}`;

  const gradId = `arcGrad-${side}`;
  const maxLabelX = side === "left" ? startPt.x + 20 : startPt.x - 20;
  const maxLabelAnchor = side === "left" ? "start" : "end";
  const minLabelX = side === "left" ? endPt.x + 20 : endPt.x - 20;
  const minLabelAnchor = maxLabelAnchor;

  const valueColor = colors.isDark ? "rgba(255,255,255,0.18)" : "rgba(26,26,26,0.22)";
  const unitColor  = colors.isDark ? "rgba(255,255,255,0.18)" : "rgba(26,26,26,0.35)";
  const labelFill  = colors.isDark ? "rgba(255,255,255,0.45)" : colors.textMuted;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 400 400"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            {colorStops.map((s, i) => (
              <stop key={i} offset={`${s.at * 100}%`} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>

        <path d={arcPath} fill="none" stroke={colors.arcBg} strokeWidth="14" strokeLinecap="round" />
        <path d={arcPath} fill="none" stroke={`url(#${gradId})`} strokeWidth="14" strokeLinecap="round" />

        <text x={maxLabelX} y={startPt.y - 12} fontSize="26" fontWeight="600"
              fill={labelFill} textAnchor={maxLabelAnchor}>{max}</text>
        <text x={minLabelX} y={endPt.y + 30} fontSize="26" fontWeight="600"
              fill={labelFill} textAnchor={minLabelAnchor}>0</text>
      </svg>

      <div
        style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center", pointerEvents: "none",
        }}
      >
        <div style={{
          fontSize: "clamp(56px, 8vw, 130px)",
          fontWeight: 700,
          fontFamily: unit === "km/h" ? "'Orbitron', sans-serif" : "'DM Mono', monospace",
          color: valueColor,
          lineHeight: 1, letterSpacing: unit === "km/h" ? "-2px" : "-3px",
        }}>{value}</div>
        <div style={{
          fontSize: "clamp(14px, 1.8vw, 26px)",
          color: unitColor,
          fontFamily: "'Exo 2', sans-serif",
          fontWeight: 500, marginTop: "6px",
        }}>{unit}</div>
      </div>
    </div>
  );
}


function SpeedLimitPill({ colors }: { colors: ClusterColors }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        background: colors.pillBg, borderRadius: "999px",
        padding: "0.45em 1em",
        fontSize: "clamp(10px, 1.2vw, 17px)",
        color: colors.pillText, fontWeight: 600,
      }}
    >
      [Speed Limit : 80]
      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
    </div>
  );
}

function BatteryTempIcon() {
  return (
    <svg width="42" height="50" viewBox="0 0 40 48" fill="none">
      <rect x="12" y="2" width="16" height="6" rx="1" fill="#ef4444" />
      <rect x="6" y="8" width="28" height="38" rx="4" stroke="#ef4444" strokeWidth="2.5" fill="none" />
      <rect x="10" y="18" width="20" height="24" rx="2" fill="#ef4444" />
      <path d="M20 14 L20 22 M16 30 L24 30" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WarnBrake() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" stroke="#ef4444" strokeWidth="2.5" />
      <circle cx="16" cy="16" r="9" stroke="#ef4444" strokeWidth="2" />
      <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="800" fill="#ef4444">!</text>
      <path d="M5 5 L27 27" stroke="#ef4444" strokeWidth="2" opacity="0.4" />
    </svg>
  );
}
function WarnEngine() {
  return (
    <svg width="36" height="34" viewBox="0 0 34 32" fill="none">
      <path d="M6 12 L6 20 L10 20 L10 24 L20 24 L20 20 L26 20 L28 18 L28 14 L26 12 L20 12 L20 8 L10 8 L10 12 Z" fill="#f97316" />
    </svg>
  );
}
function WarnSeatbelt() {
  return (
    <svg width="30" height="34" viewBox="0 0 28 32" fill="none">
      <circle cx="14" cy="6" r="3" fill="#ef4444" />
      <path d="M8 30 L8 18 Q8 14 14 14 Q20 14 20 18 L20 30" fill="#ef4444" />
      <path d="M6 14 L22 26" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}
function WarnBattery() {
  return (
    <svg width="38" height="30" viewBox="0 0 36 28" fill="none">
      <rect x="2" y="6" width="28" height="18" rx="2" fill="#ef4444" />
      <rect x="30" y="11" width="4" height="8" rx="1" fill="#ef4444" />
      <text x="10" y="20" fontSize="14" fontWeight="800" fill="#fff">+</text>
      <text x="22" y="20" fontSize="14" fontWeight="800" fill="#fff">−</text>
    </svg>
  );
}
function WarnCharge() {
  return (
    <svg width="36" height="32" viewBox="0 0 34 30" fill="none" stroke="#3D53FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="14" height="20" rx="2" />
      <path d="M17 14 Q24 14 24 20 Q24 26 30 26" fill="none" />
      <line x1="7" y1="10" x2="13" y2="10" />
      <line x1="7" y1="16" x2="13" y2="16" />
    </svg>
  );
}

function Dot({ c }: { c: string }) {
  return <span style={{ width: 3, height: 3, borderRadius: "50%", background: c, display: "inline-block" }} />;
}
