import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import type { Theme } from "@/context/ThemeContext";
import { useNav } from "@/context/NavContext";

type AirFlow = "feet" | "feet-face" | "face" | "face-defrost" | "defrost";
type Mode = "preset" | "auto" | "rain";

export default function ClimatePanel() {
  const { theme } = useTheme();
  const { climateTemp: temp, setClimateTemp: setTemp } = useNav();
  // Default OFF
  const [acOn, setAcOn] = useState(false);
  const [fanSpeed, setFanSpeed] = useState(2);
  const [airFlow, setAirFlow] = useState<AirFlow>("face");
  const [mode, setMode] = useState<Mode>("auto");

  return (
    <div
      style={{
        background: theme.panelBg,
        borderRadius: "20px",
        padding: "20px 22px",
        border: `1px solid ${theme.border}`,
        boxShadow: theme.mode === "night" ? "0 4px 24px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.07)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "18px",
        height: "100%",
        overflow: "auto",
      }}
    >
      <div style={{ fontSize: "20px", fontWeight: 800, color: theme.text }}>Climate Control</div>

      {/* AC On/Off toggle */}
      <button
        onClick={() => setAcOn(v => !v)}
        style={{
          background: acOn ? `${theme.accent}22` : theme.cardBg,
          border: `1px solid ${acOn ? theme.accent : theme.border}`,
          borderRadius: "20px",
          padding: "7px 18px",
          display: "flex", alignItems: "center", gap: "8px",
          color: acOn ? theme.accent : theme.textSub,
          fontSize: "13px", fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        <span style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: acOn ? theme.success : theme.textMuted,
        }} />
        AC {acOn ? "On" : "Off"}
      </button>

      {/* Temperature */}
      <Section theme={theme} title="Temperature">
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <RoundBtn theme={theme} onClick={() => setTemp(t => Math.max(16, t - 1))}>−</RoundBtn>
          <div style={{ fontSize: "44px", fontWeight: 800, color: theme.text, minWidth: "110px", textAlign: "center", letterSpacing: "-1px" }}>
            {temp}°C
          </div>
          <RoundBtn theme={theme} onClick={() => setTemp(t => Math.min(30, t + 1))}>+</RoundBtn>
        </div>
        <div style={{ width: "min(360px, 80vw)", paddingTop: "8px" }}>
          <style>{`
            input.cp-temp-slider {
              -webkit-appearance: none; appearance: none;
              width: 100%; height: 10px; margin: 0;
              background: transparent; cursor: pointer; outline: none;
            }
            input.cp-temp-slider::-webkit-slider-runnable-track {
              height: 10px; border-radius: 6px;
              background: var(--cp-track);
            }
            input.cp-temp-slider::-moz-range-track {
              height: 10px; border-radius: 6px;
              background: var(--cp-track);
            }
            input.cp-temp-slider::-webkit-slider-thumb {
              -webkit-appearance: none; appearance: none;
              width: 26px; height: 26px; border-radius: 50%;
              background: #fff; border: 3px solid var(--cp-accent);
              box-shadow: 0 3px 10px rgba(0,0,0,0.25);
              margin-top: -8px; cursor: pointer;
            }
            input.cp-temp-slider::-moz-range-thumb {
              width: 26px; height: 26px; border-radius: 50%;
              background: #fff; border: 3px solid var(--cp-accent);
              box-shadow: 0 3px 10px rgba(0,0,0,0.25); cursor: pointer;
            }
          `}</style>
          <input
            type="range" min={16} max={30} value={temp}
            onChange={e => setTemp(Number(e.target.value))}
            className="cp-temp-slider"
            style={{
              ["--cp-track" as string]: temp <= 20
                ? `linear-gradient(90deg, #3D53FF 0%, #3D53FF ${((temp - 16) / 14) * 100}%, ${theme.sliderTrack} ${((temp - 16) / 14) * 100}%, ${theme.sliderTrack} 100%)`
                : `linear-gradient(90deg, #F93827 0%, #F93827 ${((temp - 16) / 14) * 100}%, ${theme.sliderTrack} ${((temp - 16) / 14) * 100}%, ${theme.sliderTrack} 100%)`,
              ["--cp-accent" as string]: temp <= 20 ? "#3D53FF" : "#F93827",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
            <span style={{ fontSize: "11px", color: theme.textMuted, fontWeight: 600 }}>16°C</span>
            <span style={{ fontSize: "11px", color: theme.textMuted, fontWeight: 600 }}>30°C</span>
          </div>
        </div>
      </Section>

      {/* Fan speed */}
      <Section theme={theme} title="Fan Speed">
        <div style={{ display: "flex", gap: "10px" }}>
          {[1, 2, 3].map(n => (
            <button key={n}
              onClick={() => setFanSpeed(n)}
              style={{
                width: "46px", height: "46px",
                background: fanSpeed === n ? `${theme.accent}22` : theme.cardBg,
                border: `1px solid ${fanSpeed === n ? theme.accent : theme.border}`,
                borderRadius: "12px",
                color: fanSpeed === n ? theme.accent : theme.text,
                fontSize: "16px", fontWeight: 800,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >{n}</button>
          ))}
        </div>
      </Section>

      {/* Air flow */}
      <Section theme={theme} title="Air Flow">
        <div style={{ display: "flex", gap: "10px" }}>
          {(["feet", "feet-face", "face", "face-defrost", "defrost"] as AirFlow[]).map(af => (
            <IconBtn key={af} theme={theme} active={airFlow === af} onClick={() => setAirFlow(af)}>
              <AirFlowIcon kind={af} />
            </IconBtn>
          ))}
        </div>
      </Section>

      {/* Mode */}
      <Section theme={theme} title="Mode">
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <ModeBtn theme={theme} active={mode === "preset"} onClick={() => setMode("preset")} label="My Preset">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" /><circle cx="10" cy="6" r="2.5" fill={theme.panelBg} />
              <line x1="4" y1="12" x2="20" y2="12" /><circle cx="15" cy="12" r="2.5" fill={theme.panelBg} />
              <line x1="4" y1="18" x2="20" y2="18" /><circle cx="8" cy="18" r="2.5" fill={theme.panelBg} />
            </svg>
          </ModeBtn>
          <ModeBtn theme={theme} active={mode === "auto"} onClick={() => setMode("auto")} label="Auto">
            <span style={{ fontSize: "18px", fontWeight: 800 }}>A</span>
          </ModeBtn>
          <ModeBtn theme={theme} active={mode === "rain"} onClick={() => setMode("rain")} label="Rain">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 14 Q3 12 5 9 Q5 5 10 5 Q14 4 16 8 Q20 8 20 12 Q20 15 17 15 L7 15 Q5.5 15 6 14 Z" />
              <line x1="8" y1="18" x2="7" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="12" y1="18" x2="11" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16" y1="18" x2="15" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </ModeBtn>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children, theme }: { title: string; children: React.ReactNode; theme: Theme }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <div style={{ fontSize: "12px", color: theme.textMuted, fontWeight: 600 }}>{title}</div>
      {children}
    </div>
  );
}

function RoundBtn({ children, theme, onClick }: { children: React.ReactNode; theme: Theme; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: "56px", height: "56px",
      background: theme.cardBg,
      border: `1px solid ${theme.border}`,
      borderRadius: "16px",
      color: theme.text,
      fontSize: "28px", fontWeight: 700,
      cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.15s",
      boxShadow: theme.mode === "night" ? "0 2px 8px rgba(0,0,0,0.25)" : "0 1px 4px rgba(0,0,0,0.08)",
    }}>{children}</button>
  );
}

function IconBtn({ children, active, theme, onClick }: { children: React.ReactNode; active: boolean; theme: Theme; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: "44px", height: "44px",
      background: active ? `${theme.accent}22` : theme.cardBg,
      border: `1px solid ${active ? theme.accent : theme.border}`,
      borderRadius: "12px",
      color: active ? theme.accent : theme.textSub,
      cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.15s",
    }}>{children}</button>
  );
}

function ModeBtn({ children, active, theme, onClick, label }: {
  children: React.ReactNode; active: boolean; theme: Theme; onClick: () => void; label: string;
}) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", border: "none",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
      cursor: "pointer",
    }}>
      <div style={{
        width: "48px", height: "48px",
        background: active ? `${theme.accent}22` : theme.cardBg,
        border: `1px solid ${active ? theme.accent : theme.border}`,
        borderRadius: "12px",
        color: active ? theme.accent : theme.text,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{children}</div>
      <span style={{ fontSize: "10px", color: active ? theme.accent : theme.textMuted, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

function AirFlowIcon({ kind }: { kind: AirFlow }) {
  const car = <path d="M4 18 L6 14 L18 14 L20 18 Z" fill="currentColor" />;
  const arrowFeet = <path d="M8 22 L8 19 M12 22 L12 19 M16 22 L16 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />;
  const arrowFace = <path d="M8 11 L8 8 M12 11 L12 8 M16 11 L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />;
  const arrowDefrost = <path d="M8 6 Q8 4 10 4 M12 6 Q12 4 14 4 M16 6 Q16 4 18 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />;

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {car}
      {(kind === "feet" || kind === "feet-face") && arrowFeet}
      {(kind === "face" || kind === "feet-face" || kind === "face-defrost") && arrowFace}
      {(kind === "defrost" || kind === "face-defrost") && arrowDefrost}
    </svg>
  );
}
