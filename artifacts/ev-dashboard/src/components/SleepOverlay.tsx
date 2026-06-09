import { useTheme } from "@/context/ThemeContext";
import { useNav } from "@/context/NavContext";

/**
 * Full-screen black overlay that simulates a screen-off state. Mounted at
 * the top of the Dashboard so it sits above every other element. A single
 * click anywhere wakes the screen.
 */
export default function SleepOverlay() {
  const { sleeping, wake } = useNav();
  const { theme } = useTheme();
  if (!sleeping) return null;

  return (
    <div
      onClick={wake}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
        animation: "sleep-fade 0.25s ease-out",
      }}
    >
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
        color: "rgba(255,255,255,0.18)",
        fontFamily: "'Inter', sans-serif",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        <span style={{ fontSize: "11px", letterSpacing: "0.3em", fontWeight: 500 }}>TAP TO WAKE</span>
      </div>
      <style>{`
        @keyframes sleep-fade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      {/* Hidden hint so the linter doesn't strip the theme import; the
          overlay deliberately uses pure black regardless of theme. */}
      <span style={{ display: "none" }}>{theme.mode}</span>
    </div>
  );
}
