import TopBar from "@/components/TopBar";
import CarDetailsView from "@/components/CarDetailsView";
import ClimatePanel from "@/components/ClimatePanel";
import MeterDashboard from "@/components/MeterDashboard";
import ChargingStationView from "@/components/ChargingStationView";
import TyreStatusView from "@/components/TyreStatusView";
import SleepOverlay from "@/components/SleepOverlay";
import OnScreenKeyboard from "@/components/OnScreenKeyboard";
import HomePanel from "@/components/HomePanel";
import MapPanel from "@/components/MapPanel";
import SideBar from "@/components/SideBar";
import CarPanel from "@/components/CarPanel";

import { useTheme } from "@/context/ThemeContext";
import { NavProvider, useNav } from "@/context/NavContext";

function DashboardInner() {
  const { theme } = useTheme();
  const { view, navMode, mapHidden } = useNav();

  const showCarDetails = view === "car-details";
  const showCharging   = view === "charging";
  const showTyres      = view === "tyres";
  const showFullPanel  = showCarDetails || showCharging || showTyres;

  // HomePanel handles ALL non-nav, non-full, non-meter views.
  // It owns its own internal 3-column layout (car | content | nav) and
  // decides what to show in the centre based on the current `view`.
  const showHomeLayout = !navMode && view !== "meter" && !showFullPanel;

  // Grid columns
  let cols: string;
  if (navMode) {
    // Navigation is ALWAYS full-screen — no CarPanel alongside.
    cols = "1fr 56px";
  } else if (showCharging) {
    cols = "1fr 56px";
  } else if (showFullPanel) {
    cols = mapHidden ? "1fr 56px" : "2fr 1fr 56px";
  } else if (showHomeLayout) {
    cols = "1fr 56px"; // HomePanel fills the 1fr
  } else {
    cols = "1fr 56px"; // meter / fallback
  }

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
        {/* HomePanel — handles home + all feature sub-views internally */}
        {showHomeLayout && <HomePanel />}

        {/* Full-panel special views */}
        {showCarDetails && <CarDetailsView />}
        {showCharging   && <ChargingStationView />}
        {showTyres      && <TyreStatusView />}

        {/* Navigation — always full-screen map, no CarPanel alongside */}
        {navMode && !mapHidden && !showCharging && (
          <>
            <MapPanel />
          </>
        )}
        {/* CarPanel is only shown alongside the map when mapHidden in
            car-details nav mode — matches the legacy behaviour for that
            specific edge case */}
        {navMode && showCarDetails && mapHidden && <CarPanel />}

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
