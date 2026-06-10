import TopBar from "@/components/TopBar";
import CarDetailsView from "@/components/CarDetailsView";
import MeterDashboard from "@/components/MeterDashboard";
import ChargingStationView from "@/components/ChargingStationView";
import TyreStatusView from "@/components/TyreStatusView";
import SleepOverlay from "@/components/SleepOverlay";
import OnScreenKeyboard from "@/components/OnScreenKeyboard";
import HomePanel, { NavMapPanel } from "@/components/HomePanel";
import MapPanel from "@/components/MapPanel";
import SideBar from "@/components/SideBar";

import { useTheme } from "@/context/ThemeContext";
import { NavProvider, useNav } from "@/context/NavContext";

function DashboardInner() {
  const { theme } = useTheme();
  const { view, navMode } = useNav();

  const showCarDetails = view === "car-details";
  const showCharging   = view === "charging";
  const showTyres      = view === "tyres";
  const showFullPanel  = showCarDetails || showCharging || showTyres;

  // HomePanel handles ALL non-nav, non-full, non-meter views
  const showHomeLayout = !navMode && view !== "meter" && !showFullPanel;

  // Grid columns
  let cols: string;
  if (navMode) {
    cols = "1fr 56px";
  } else if (showCharging) {
    // ChargingStationView has its own internal map, no extra map needed
    cols = "1fr 56px";
  } else if (showFullPanel) {
    // car-details and tyres show alongside a mini NavMapPanel
    cols = "2fr 1fr 56px";
  } else {
    // HomePanel (home + all feature sub-views)
    cols = "1fr 56px";
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
        {/* Home + all feature sub-views */}
        {showHomeLayout && <HomePanel />}

        {/* Car details — 2/3 width with NavMapPanel on the right */}
        {showCarDetails && <CarDetailsView />}
        {showCarDetails && <NavMapPanel theme={theme} />}

        {/* Charging — full width (has own internal map) */}
        {showCharging && <ChargingStationView />}

        {/* Tyres — 2/3 width with NavMapPanel on the right */}
        {showTyres && <TyreStatusView />}
        {showTyres && <NavMapPanel theme={theme} />}

        {/* Navigation — always full-screen map */}
        {navMode && <MapPanel />}

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
