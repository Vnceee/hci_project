import { createContext, useContext, useState, type ReactNode } from "react";

export type ThemeMode = "day" | "night";

export interface Theme {
  mode: ThemeMode;
  bg: string;
  panelBg: string;
  cardBg: string;
  border: string;
  text: string;
  textSub: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  sliderTrack: string;
  btnBg: string;
  btnHover: string;
  btnActive: string;
  btnActiveBorder: string;
  mapStyle: "dark" | "light";
  // Brand palette tokens
  success: string;       // #16C47F — Normal PSI / OK
  successAlt: string;    // #2CFF95 — Available station text / open status
  successBg: string;     // #1F3732 — Available station text background
  danger: string;        // #F93827 — Critical / Stop navigation / active gear R
  warning: string;       // #FFD65A — Low PSI / caution
  highlight: string;     // #01CEA5 — Start nav / selected station dot / range distance
  orange: string;        // #f86935 — Unavailable station label / busy dot
  unavailableBg: string; // #32372e — Unavailable station background
  gold: string;          // #F5A623 — Turn signal chevrons
  navGreen: string;      // #009007 — Navigation direction arrow/text background
  chargingBlueBg: string;// #232D49 — kW background on charging station
}

/**
 * Brand palette (provided):
 *   F93827 / 232D49 / FFD65A / 3D53FF / 16C47F / 01CEA5 / FFFFFF /
 *   f86935 / 8383A0 / 32372e / 1E1E2A / 111118 / 1F3732 / 009007 / 2CFF95
 *
 * Mapping:
 *   - Night surfaces: bg #111118, panel #1E1E2A, card #232D49
 *   - Day surfaces:   bg #e8eaf2, panel #FFFFFF, card #f3f4fa
 *   - Accent primary: #3D53FF (used everywhere a brand action is needed)
 *   - Semantic:       success #16C47F, danger #F93827, warning #FFD65A
 */
export const NIGHT: Theme = {
  mode: "night",
  bg: "#1A1A22",
  panelBg: "#111118",
  cardBg: "#1E1E2A",
  border: "rgba(131,131,160,0.14)",
  text: "#FFFFFF",
  textSub: "#8383A0",
  textMuted: "rgba(131,131,160,0.55)",
  accent: "#3D53FF",
  accentHover: "#5567ff",
  sliderTrack: "#1E1E2A",
  btnBg: "#1E1E2A",
  btnHover: "#232D49",
  btnActive: "#3D53FF",
  btnActiveBorder: "#3D53FF",
  mapStyle: "dark",
  success: "#16C47F",
  successAlt: "#2CFF95",
  successBg: "#1F3732",
  danger: "#F93827",
  warning: "#FFD65A",
  highlight: "#01CEA5",
  orange: "#f86935",
  unavailableBg: "#32372e",
  gold: "#F5A623",
  navGreen: "#009007",
  chargingBlueBg: "#232D49",
};

export const DAY: Theme = {
  mode: "day",
  bg: "#e8eaf2",
  panelBg: "#FFFFFF",
  cardBg: "#f3f4fa",
  border: "rgba(30,30,42,0.10)",
  text: "#1E1E2A",
  textSub: "#4a5270",
  textMuted: "#8383A0",
  accent: "#3D53FF",
  accentHover: "#5567ff",
  sliderTrack: "#dde0ef",
  btnBg: "#f0f2fb",
  btnHover: "#e2e6f7",
  btnActive: "#3D53FF",
  btnActiveBorder: "#3D53FF",
  mapStyle: "light",
  success: "#16C47F",
  successAlt: "#2CFF95",
  successBg: "#1F3732",
  danger: "#F93827",
  warning: "#FFD65A",
  highlight: "#01CEA5",
  orange: "#f86935",
  unavailableBg: "#32372e",
  gold: "#F5A623",
  navGreen: "#009007",
  chargingBlueBg: "#232D49",
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  brightness: number;
  setBrightness: (v: number) => void;
  volume: number;
  setVolume: (v: number) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: NIGHT,
  toggleTheme: () => {},
  brightness: 80,
  setBrightness: () => {},
  volume: 60,
  setVolume: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("night");
  const [brightness, setBrightness] = useState(80);
  const [volume, setVolume] = useState(60);

  const theme = mode === "night" ? NIGHT : DAY;
  const toggleTheme = () => setMode((m) => (m === "night" ? "day" : "night"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, brightness, setBrightness, volume, setVolume }}>
      <div
        style={{
          filter: `brightness(${0.5 + brightness / 200})`,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
