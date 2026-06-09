import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ViewMode =
  | "home"
  | "car-details"
  | "climate"
  | "meter"
  | "music"
  | "call"
  | "apps"
  | "settings"
  | "wifi"
  | "bluetooth"
  | "weather"
  | "charging"
  | "tyres";

export type Gear = "P" | "R" | "N" | "D";
export type DriveMode = "Auto" | "Eco" | "Normal" | "Sport";
export type Signal = "off" | "left" | "right" | "hazard";

export type TyrePosition = "FL" | "FR" | "RL" | "RR";
export type TyreState = "normal" | "low" | "critical";
export interface TyreReading { position: TyrePosition; psi: number; }

/**
 * Single source of truth for tyre PSI. Every view that draws a car —
 * HomePanel, CarDetails, MeterDashboard cluster, TyreStatus — reads
 * from this so the same wheel always lights up across screens.
 */
export const TYRE_READINGS: TyreReading[] = [
  { position: "FL", psi: 26 }, // low → yellow (only warning)
  { position: "FR", psi: 32 }, // normal
  { position: "RL", psi: 33 }, // normal
  { position: "RR", psi: 32 }, // normal
];

export function classifyTyre(psi: number): TyreState {
  if (psi < 20) return "critical";
  if (psi < 30) return "low";
  return "normal";
}

/**
 * Destinations shared across MapPanel and MiniMap. Lifting these here
 * means the home-screen MiniMap can draw the same waypoint highlight
 * the full nav view shows — even after the user navigates home and the
 * MapPanel local state is destroyed.
 */
export type DestKey = "pohonmasCafe" | "vivacity" | "megalanes";
export interface DestLocation { lat: number; lng: number; name: string; time?: string; dist?: string; }
export const HERE_LATLNG: [number, number] = [1.5587, 110.3543];
export const DEST_LOCATIONS: Record<DestKey, DestLocation> = {
  pohonmasCafe: { lat: 1.5482, lng: 110.3605, name: "Pohonmas Cafe",     time: "5 min",  dist: "1.2 km" },
  vivacity:     { lat: 1.5295, lng: 110.3590, name: "Vivacity Megamall", time: "25 min", dist: "7.8 km" },
  megalanes:    { lat: 1.5380, lng: 110.3650, name: "Megalanes Kuching", time: "30 min", dist: "5.4 km" },
};

type NavContextValue = {
  navMode: boolean;
  isNavigating: boolean;
  enterNav: () => void;
  exitNav: () => void;
  startNavigating: () => void;

  panelLayout: "2" | "3";
  setPanelLayout: (l: "2" | "3") => void;

  view: ViewMode;
  setView: (v: ViewMode) => void;
  goHome: () => void;
  back: () => void;

  mapHidden: boolean;
  toggleMap: () => void;
  hideMap: () => void;
  showMap: () => void;

  sleeping: boolean;
  sleep: () => void;
  wake: () => void;

  // Shared car state — written by the meter cluster, read everywhere else
  gear: Gear;
  setGear: (g: Gear) => void;
  mode: DriveMode;
  setMode: (m: DriveMode) => void;
  signal: Signal;
  setSignal: (s: Signal) => void;
  brake: boolean;
  setBrake: (b: boolean) => void;

  // Live speed driven by the cluster pedals. Read by every other view
  // that displays "km/h" so the headline number is the same everywhere.
  speed: number;
  setSpeed: (n: number | ((prev: number) => number)) => void;

  // Static for now, but lifted so every view shows the same battery /
  // range numbers.
  batteryPct: number;
  kmLeft: number;

  // Whether the user has chosen a destination. Switches the home layout
  // from the new combined view to the legacy CarPanel + CenterPanel +
  // MapPanel arrangement so the user can actively navigate.
  hasDestination: boolean;
  destinationLabel: string | null;
  destinationKey: DestKey | null;
  pickDestination: (key: DestKey | null) => void;

  // 0..1 progress along the active route. Drives the live "car moving on
  // route" animation in both the full MapPanel (rotation + recenter) and
  // the minimised NavPanel progress bar so the two stay in sync.
  navProgress: number;
};

/**
 * Build the same 4-point route polyline both maps draw. Exported so the
 * MapPanel auto-rotate effect can compute the user's current position and
 * heading from the same source of truth.
 */
export function buildRoutePoints(destKey: DestKey): [number, number][] {
  const dest = DEST_LOCATIONS[destKey];
  const [hLat, hLng] = HERE_LATLNG;
  return [
    [hLat, hLng],
    [hLat + (dest.lat - hLat) * 0.3, hLng + (dest.lng - hLng) * 0.3 + 0.004],
    [hLat + (dest.lat - hLat) * 0.7, hLng + (dest.lng - hLng) * 0.7 - 0.002],
    [dest.lat, dest.lng],
  ];
}

const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [navMode, setNavMode] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [view, setView] = useState<ViewMode>("home");
  const [mapHidden, setMapHidden] = useState(false);
  const [sleeping, setSleeping] = useState(false);
  const [panelLayout, setPanelLayout] = useState<"2" | "3">("2");

  const [gear, setGear] = useState<Gear>("D");
  const [mode, setMode] = useState<DriveMode>("Auto");
  const [signal, setSignal] = useState<Signal>("off");
  const [brake, setBrake] = useState(false);
  const [speed, setSpeed] = useState(0);

  const [destinationKey, setDestinationKey] = useState<DestKey | null>(null);
  const [navProgress, setNavProgress] = useState(0);

  // Animate progress along the active route while navigating. ~90 s for a
  // full traversal — same pace the old TopProgressBar used so the ETA
  // numbers still feel right.
  useEffect(() => {
    if (!isNavigating || !destinationKey) { setNavProgress(0); return; }
    const id = setInterval(() => {
      setNavProgress(p => Math.min(1, p + 1 / 90));
    }, 1000);
    return () => clearInterval(id);
  }, [isNavigating, destinationKey]);

  const goHome = () => { setView("home"); setNavMode(false); setMapHidden(false); };
  const back = () => {
    if (navMode) { setNavMode(false); return; }
    if (view === "tyres" || view === "charging") { setView("car-details"); return; }
    goHome();
  };

  const pickDestination = (key: DestKey | null) => {
    setDestinationKey(key);
    // Reset nav state when destination is cleared.
    if (!key) { setNavMode(false); setIsNavigating(false); }
  };

  return (
    <NavContext.Provider value={{
      navMode,
      isNavigating,
      enterNav: () => setNavMode(true),
      exitNav: () => { setNavMode(false); setIsNavigating(false); },
      startNavigating: () => setIsNavigating(true),

      panelLayout, setPanelLayout,

      view, setView, goHome, back,

      mapHidden,
      toggleMap: () => setMapHidden(h => !h),
      hideMap: () => setMapHidden(true),
      showMap: () => setMapHidden(false),

      sleeping,
      sleep: () => setSleeping(true),
      wake:  () => setSleeping(false),

      gear, setGear,
      mode, setMode,
      signal, setSignal,
      brake, setBrake,
      speed, setSpeed,

      batteryPct: 23,
      kmLeft: 167,

      hasDestination: destinationKey !== null,
      destinationLabel: destinationKey ? DEST_LOCATIONS[destinationKey].name : null,
      destinationKey,
      pickDestination,
      navProgress,
    }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be inside NavProvider");
  return ctx;
}
