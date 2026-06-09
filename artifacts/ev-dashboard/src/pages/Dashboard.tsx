import TopBar from "@/components/TopBar";
import CarPanel from "@/components/CarPanel";
import CenterPanel from "@/components/CenterPanel";
import MapPanel from "@/components/MapPanel";
import SideBar from "@/components/SideBar";
import CarDetailsView from "@/components/CarDetailsView";
import ClimatePanel from "@/components/ClimatePanel";
import MeterDashboard from "@/components/MeterDashboard";
import FeaturePanel from "@/components/FeaturePanel";
import ChargingStationView from "@/components/ChargingStationView";
import TyreStatusView from "@/components/TyreStatusView";
import SleepOverlay from "@/components/SleepOverlay";
import OnScreenKeyboard from "@/components/OnScreenKeyboard";
import HomePanel from "@/components/HomePanel";

const FEATURE_VIEWS = ["music", "call", "apps", "settings", "wifi", "bluetooth", "weather"] as const;
type FeatureView = typeof FEATURE_VIEWS[number];
const isFeatureView = (v: string): v is FeatureView =>
  (FEATURE_VIEWS as readonly string[]).includes(v);
import { useTheme } from "@/context/ThemeContext";
import { NavProvider, useNav } from "@/context/NavContext";

function DashboardInner() {
  const { theme } = useTheme();
  const { view, setView, navMode, isNavigating, mapHidden, hasDestination } = useNav();

  const showCarDetails = view === "car-details";
  const showCharging   = view === "charging";
  const showTyres      = view === "tyres";
  const showFullPanel  = showCarDetails || showCharging || showTyres;

  // The brand-new combined home layout shows up when the user has NOT
  // picked a destination yet. Once they pick one, switch back to the
  // legacy CarPanel + CenterPanel + MapPanel layout that's better suited
  // for active navigation.
  // HomePanel owns its own idle vs. has-destination layout split internally,
  // so we only gate it on view + navMode (full-map mode for picking a place).
  const newHome = view === "home" && !navMode;

  // Decide grid columns.
  let cols: string;
  if (newHome)                            cols = "1fr 56px";
  else if (navMode && isNavigating)       cols = "1fr 1fr 56px";      // CarPanel + map while navigating (equal widths)
  else if (navMode && showCarDetails)     cols = mapHidden ? "1.1fr 1fr 56px" : "1.1fr 1.4fr 56px";
  else if (navMode)                       cols = "1fr 56px";          // full-screen map for route selection
  else if (showCharging)                  cols = "1fr 56px";          // full-screen charging
  else if (showFullPanel)                 cols = mapHidden ? "1fr 56px" : "2fr 1fr 56px";
  else if (mapHidden)                     cols = "1fr 1fr 56px";
  else                                    cols = "1fr 1fr 1fr 56px";

  const showCenter   = !newHome && !navMode && !showFullPanel && view !== "meter";
  // Show CarPanel alongside the map once navigation is active
  const showCarPanel = !newHome && !showFullPanel && (!navMode || isNavigating);
  const showMapPanel = !newHome && !mapHidden && !showCharging;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        gap: "8px",
        minWidth: "920px",
        fontFamily: "'Exo 2', 'Exo', sans-serif",
        transition: "background 0.3s",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <TopBar />

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: cols,
          gap: "8px",
          minHeight: 0,
          transition: "grid-template-columns 0.4s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {newHome && <HomePanel />}
        {showCarDetails && <CarDetailsView />}
        {showCharging && <ChargingStationView />}
        {showTyres && <TyreStatusView />}
        {showCarPanel && <CarPanel />}
        {showCenter && (
          view === "climate" ? <ClimatePanel />
          : isFeatureView(view) ? <FeaturePanel view={view} />
          : <CenterPanel />
        )}
        {showMapPanel && <MapPanel />}
        <SideBar />
      </div>

      {view === "meter" && <MeterDashboard />}

      <OnScreenKeyboard />
      <SleepOverlay />
    </div>
  );
}

export default function Dashboard() {
  return (
    <NavProvider>
      <DashboardInner />
    </NavProvider>
  );
}
