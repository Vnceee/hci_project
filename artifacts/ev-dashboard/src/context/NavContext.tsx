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

export const TYRE_READINGS: TyreReading[] = [
  { position: "FL", psi: 26 },
  { position: "FR", psi: 32 },
  { position: "RL", psi: 33 },
  { position: "RR", psi: 32 },
];

export function classifyTyre(psi: number): TyreState {
  if (psi < 20) return "critical";
  if (psi < 30) return "low";
  return "normal";
}

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

  // When true the active feature view fills the full width (no left CarPanel).
  // Set by double-clicking a feature card; cleared on goHome/back.
  fullScreenFeature: boolean;
  setFullScreenFeature: (v: boolean) => void;

  mapHidden: boolean;
  toggleMap: () => void;
  hideMap: () => void;
  showMap: () => void;

  sleeping: boolean;
  sleep: () => void;
  wake: () => void;

  gear: Gear;
  setGear: (g: Gear) => void;
  mode: DriveMode;
  setMode: (m: DriveMode) => void;
  signal: Signal;
  setSignal: (s: Signal) => void;
  brake: boolean;
  setBrake: (b: boolean) => void;

  speed: number;
  setSpeed: (n: number | ((prev: number) => number)) => void;

  wifiOn: boolean;
  setWifiOn: (v: boolean) => void;
  bluetoothOn: boolean;
  setBluetoothOn: (v: boolean) => void;

  batteryPct: number;
  kmLeft: number;

  hasDestination: boolean;
  destinationLabel: string | null;
  destinationKey: DestKey | null;
  pickDestination: (key: DestKey | null) => void;

  navProgress: number;
};

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
  const [view, setViewRaw] = useState<ViewMode>("home");
  const [mapHidden, setMapHidden] = useState(false);
  const [sleeping, setSleeping] = useState(false);
  // Default to 3-panel layout so the nav map is visible on home
  const [panelLayout, setPanelLayout] = useState<"2" | "3">("3");
  const [fullScreenFeature, setFullScreenFeature] = useState(false);

  const [gear, setGear] = useState<Gear>("D");
  const [mode, setMode] = useState<DriveMode>("Auto");
  const [signal, setSignal] = useState<Signal>("off");
  const [brake, setBrake] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [wifiOn, setWifiOn] = useState(false);
  const [bluetoothOn, setBluetoothOn] = useState(false);

  const [destinationKey, setDestinationKey] = useState<DestKey | null>(null);
  const [navProgress, setNavProgress] = useState(0);

  useEffect(() => {
    if (!isNavigating || !destinationKey) { setNavProgress(0); return; }
    const id = setInterval(() => {
      setNavProgress(p => Math.min(1, p + 1 / 90));
    }, 1000);
    return () => clearInterval(id);
  }, [isNavigating, destinationKey]);

  const setView = (v: ViewMode) => {
    setViewRaw(v);
    // Leaving a feature view resets full-screen mode
    if (v === "home") setFullScreenFeature(false);
  };

  const goHome = () => {
    setViewRaw("home");
    setNavMode(false);
    setMapHidden(false);
    setFullScreenFeature(false);
  };

  const back = () => {
    if (fullScreenFeature) { setFullScreenFeature(false); return; }
    if (navMode) { setNavMode(false); return; }
    if (view === "tyres" || view === "charging") { setViewRaw("car-details"); return; }
    goHome();
  };

  const pickDestination = (key: DestKey | null) => {
    setDestinationKey(key);
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

      fullScreenFeature, setFullScreenFeature,

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
      wifiOn, setWifiOn,
      bluetoothOn, setBluetoothOn,

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
