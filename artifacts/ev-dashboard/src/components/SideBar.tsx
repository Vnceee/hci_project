import { useRef, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useNav } from "@/context/NavContext";

export default function SideBar() {
  const { theme, brightness, setBrightness, volume, setVolume } = useTheme();
  const { sleep, setView } = useNav();

  return (
    <div
      style={{
        width: "56px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "16px",
        background: theme.panelBg,
        borderRadius: "20px",
        padding: "14px 0",
        border: `1px solid ${theme.border}`,
        boxShadow: theme.mode === "night"
          ? "4px 0 20px rgba(0,0,0,0.3)"
          : "4px 0 20px rgba(0,0,0,0.06)",
        flexShrink: 0,
      }}
    >
      {/* Sleep button — sits at the very top above the brightness slider */}
      <button
        onClick={sleep}
        title="Sleep — tap screen to wake"
        aria-label="Sleep screen"
        style={{
          width: "40px", height: "40px",
          borderRadius: "12px",
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          color: theme.textSub,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      <div style={{ width: "32px", height: "1px", background: theme.border }} />

      <SliderControl
        icon={<BrightnessIcon />}
        value={brightness}
        onChange={setBrightness}
        label="Brightness"
        theme={theme}
        color="#FFD65A"
      />
      <div style={{ width: "32px", height: "1px", background: theme.border }} />
      <SliderControl
        icon={<VolumeIcon value={volume} />}
        value={volume}
        onChange={setVolume}
        label="Volume"
        theme={theme}
        color={theme.accent}
      />

      {/* Dashboard-meter shortcut sits at the very bottom of the side rail,
          right under the volume slider. Icon-only speedometer glyph so it
          can't be confused with the system settings gear. */}
      <div style={{ width: "32px", height: "1px", background: theme.border }} />
      <button
        onClick={() => setView("meter")}
        title="Dashboard meter"
        aria-label="Open dashboard meter"
        style={{
          width: "40px", height: "40px",
          borderRadius: "12px",
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          color: theme.textSub,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        <SpeedometerIcon />
      </button>
    </div>
  );
}

function SpeedometerIcon() {
  // Stylised speedo: half-circle dial + needle pointing upper-right. Clearly
  // distinct from the gear-shaped settings icon used elsewhere.
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14a9 9 0 1 1 18 0" />
      <line x1="12" y1="14" x2="16.5" y2="9.5" />
      <circle cx="12" cy="14" r="1.4" fill="currentColor" stroke="none" />
      <line x1="6" y1="14" x2="7" y2="14" />
      <line x1="17" y1="14" x2="18" y2="14" />
      <line x1="12" y1="6" x2="12" y2="7" />
    </svg>
  );
}

function SliderControl({
  icon, value, onChange, label, theme, color,
}: {
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  label: string;
  theme: import("@/context/ThemeContext").Theme;
  color: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const updateFromEvent = useCallback((clientY: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const y = clientY - rect.top;
    const pct = 100 - (y / rect.height) * 100;
    onChange(Math.max(0, Math.min(100, Math.round(pct))));
  }, [onChange]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    updateFromEvent(e.clientY);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    updateFromEvent(e.clientY);
  };
  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowUp")        onChange(Math.min(100, value + 5));
    else if (e.key === "ArrowDown") onChange(Math.max(0, value - 5));
  };

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "8px", flex: 1, maxHeight: "220px",
      }}
    >
      <div style={{ color: theme.textSub, flexShrink: 0 }}>{icon}</div>

      {/* Vertical slider — pointer-driven so click & drag work along the
          full track height instead of only the rotated 32px input area. */}
      <div
        ref={trackRef}
        role="slider"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onKeyDown={handleKey}
        style={{
          flex: 1,
          width: "32px",
          position: "relative",
          cursor: "pointer",
          touchAction: "none",
          background: theme.sliderTrack,
          borderRadius: "16px",
          outline: "none",
        }}
      >
        {/* Fill */}
        <div
          style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: `${value}%`,
            background: color,
            borderRadius: "16px",
            transition: "height 0.08s linear",
            opacity: 0.9,
            pointerEvents: "none",
          }}
        />
        {/* Thumb */}
        <div
          style={{
            position: "absolute",
            bottom: `calc(${value}% - 10px)`,
            left: "50%",
            transform: "translateX(-50%)",
            width: "28px",
            height: "20px",
            background: theme.panelBg,
            border: `2px solid ${color}`,
            borderRadius: "6px",
            transition: "bottom 0.08s linear",
            pointerEvents: "none",
            boxShadow: theme.mode === "night" ? "0 2px 6px rgba(0,0,0,0.4)" : "0 1px 4px rgba(0,0,0,0.15)",
          }}
        />
      </div>

      <div
        style={{
          fontSize: "9px", color: theme.textMuted,
          fontWeight: 600, letterSpacing: "0.05em", flexShrink: 0,
        }}
      >
        {value}%
      </div>
    </div>
  );
}

function BrightnessIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function VolumeIcon({ value }: { value: number }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {value > 0 && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />}
      {value > 50 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />}
    </svg>
  );
}
