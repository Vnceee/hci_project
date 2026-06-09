import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import type { Theme } from "@/context/ThemeContext";
import {
  useNav, DEST_LOCATIONS, HERE_LATLNG, buildRoutePoints,
  type DestKey, type DestLocation,
} from "@/context/NavContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Loc = DestLocation;
const HERE: Loc = { lat: HERE_LATLNG[0], lng: HERE_LATLNG[1], name: "You are here" };

// Detailed nearby place suggestions shown in nav mode
const PLACES = [
  { name: "Vivacity Megamall", desc: "Ground Floor, Management Office", hours: "Open  Closes 10pm", dist: "3 km" },
  { name: "The Spring",        desc: "The Spring Shopping Mall",         hours: "Open  Closes 10pm", dist: "4.2 km" },
  { name: "CityOne Megamall",  desc: "T20, 3rd Floor, Mall 2, Jalan Song", hours: "Open  Closes 10pm", dist: "6 km" },
];

const DARK_TILE  = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const LIGHT_TILE = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

export default function MapPanel() {
  const { theme } = useTheme();
  const {
    navMode, isNavigating, enterNav, exitNav, startNavigating,
    destinationKey, pickDestination, navProgress, setView,
  } = useNav();
  const mapRef          = useRef<L.Map | null>(null);
  const tileRef         = useRef<L.TileLayer | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const routeLayersRef  = useRef<L.Layer[]>([]);
  const userMarkerRef   = useRef<L.Marker | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Destination lives in NavContext now so it survives unmounting MapPanel
  // (going home → coming back keeps the same active route).
  const destination = destinationKey;
  const setDestination = (d: DestKey | null) => pickDestination(d);

  // Init map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [HERE.lat, HERE.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      doubleClickZoom: false,
    });

    // Single-click the map to enter full navigation mode
    map.on("click", () => enterNav());

    const url = theme.mode === "night" ? DARK_TILE : LIGHT_TILE;
    tileRef.current = L.tileLayer(url, { maxZoom: 19 }).addTo(map);
    mapRef.current = map;

    const currentIcon = L.divIcon({
      html: `<div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(74,142,255,0.2);top:-10px;left:-10px;"></div>
        <div style="width:20px;height:20px;background:#4a8eff;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(74,142,255,0.5);position:relative;z-index:1;"></div>
      </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      className: "",
    });
    userMarkerRef.current = L.marker([HERE.lat, HERE.lng], { icon: currentIcon }).addTo(map);

    return () => { map.remove(); mapRef.current = null; userMarkerRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resize map when layout changes (e.g. entering/exiting nav mode)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const id = setTimeout(() => map.invalidateSize(), 420);
    return () => clearTimeout(id);
  }, [navMode]);

  // "Cockpit view" — real-GPS feel. While navigating, the map auto-rotates
  // every second so the road ahead is always pointing UP the screen
  // (matching Google Maps / Waze). The car marker advances along the route
  // as `navProgress` ticks from 0 → 1, the map pans to keep the car
  // centred, and the rotation re-aligns to whichever route segment the
  // car is currently traversing.
  //
  // The transform is applied to the leaflet container; the
  // absolutely-positioned overlays (progress bar, speed limit, zoom
  // controls) are siblings and stay upright.
  useEffect(() => {
    const map = mapRef.current;
    const el = mapContainerRef.current;
    if (!map || !el) return;

    if (!isNavigating || !destination) {
      el.style.transition = "transform 0.4s ease";
      el.style.transform = "";
      userMarkerRef.current?.setLatLng([HERE.lat, HERE.lng]);
      const t = setTimeout(() => map.invalidateSize(), 450);
      return () => clearTimeout(t);
    }

    // Build the same 4-point route the polyline uses and figure out which
    // segment we're on right now.
    const pts = buildRoutePoints(destination);
    const segCount = pts.length - 1;
    const idxF = navProgress * segCount;
    const idx  = Math.min(segCount - 1, Math.floor(idxF));
    const t    = Math.min(1, Math.max(0, idxF - idx));
    const a    = pts[idx];
    const b    = pts[idx + 1];
    const cur: [number, number] = [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
    ];
    // Bearing of the current segment, in degrees clockwise from north.
    const bearingDeg = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;

    // First tick uses an ease transition to nudge into nav view; subsequent
    // ticks use a linear 0.95 s transition so the rotation matches the 1 s
    // setInterval cadence smoothly.
    el.style.transition = navProgress < 0.001
      ? "transform 0.7s ease"
      : "transform 0.95s linear";
    el.style.transformOrigin = "50% 72%";
    // Scale > 1 hides the empty triangles rotation introduces at corners.
    el.style.transform = `scale(1.7) rotate(${-bearingDeg}deg)`;
    map.setView(cur, 17, { animate: true, duration: 0.95 });
    userMarkerRef.current?.setLatLng(cur);
    return;
  }, [isNavigating, destination, navProgress]);

  // Switch tiles on theme change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileRef.current) map.removeLayer(tileRef.current);
    const url = theme.mode === "night" ? DARK_TILE : LIGHT_TILE;
    tileRef.current = L.tileLayer(url, { maxZoom: 19 }).addTo(map);
  }, [theme.mode]);

  // Draw / clear route — clear ALL layers each change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    routeLayersRef.current.forEach(layer => {
      try { map.removeLayer(layer); } catch (_) { /* ignore */ }
    });
    routeLayersRef.current = [];

    if (!destination) {
      map.flyTo([HERE.lat, HERE.lng], 15, { duration: 1 });
      return;
    }

    const dest = DEST_LOCATIONS[destination];
    const mid1: [number, number] = [
      HERE.lat + (dest.lat - HERE.lat) * 0.3,
      HERE.lng + (dest.lng - HERE.lng) * 0.3 + 0.004,
    ];
    const mid2: [number, number] = [
      HERE.lat + (dest.lat - HERE.lat) * 0.7,
      HERE.lng + (dest.lng - HERE.lng) * 0.7 - 0.002,
    ];
    const pts: [number, number][] = [
      [HERE.lat, HERE.lng], mid1, mid2, [dest.lat, dest.lng],
    ];

    const glow  = L.polyline(pts, { color: "rgba(74,142,255,0.28)", weight: 16, lineCap: "round", lineJoin: "round" }).addTo(map);
    const route = L.polyline(pts, { color: "#4a8eff", weight: 6, opacity: 1, lineCap: "round", lineJoin: "round" }).addTo(map);

    const navArrowIcon = L.divIcon({
      html: `<div style="width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-bottom:22px solid #4a8eff;filter:drop-shadow(0 2px 6px rgba(74,142,255,0.7));"></div>`,
      iconSize: [18, 22], iconAnchor: [9, 11], className: "",
    });
    const navArrow = L.marker(
      [HERE.lat + 0.0015, HERE.lng], { icon: navArrowIcon }
    ).addTo(map);

    const destIcon = L.divIcon({
      html: `<div style="background:#01CEA5;color:white;font-size:12px;font-weight:700;padding:5px 12px;border-radius:20px;white-space:nowrap;box-shadow:0 2px 12px rgba(0,0,0,0.35);font-family:Inter,sans-serif;">${dest.name}</div>`,
      iconAnchor: [60, 14], className: "",
    });
    const destMarker = L.marker([dest.lat, dest.lng], { icon: destIcon }).addTo(map);

    routeLayersRef.current = [glow, route, navArrow, destMarker];
    map.fitBounds(route.getBounds(), { padding: [80, 60] });
  }, [destination]);

  const dest = destination ? DEST_LOCATIONS[destination] : null;

  return (
    <div
      style={{
        background: theme.panelBg,
        borderRadius: "20px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${theme.border}`,
        boxShadow: theme.mode === "night" ? "0 4px 24px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.08)",
        height: "100%",
      }}
    >
      {/* === Map column === */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", minHeight: 0, flex: 1, height: "100%" }}>
        <div ref={mapContainerRef} style={{ flex: 1, minHeight: 0 }} />


        {/* Floating left column — search bar + place cards. Hidden while navigating. */}
        {navMode && !isNavigating && (
          <div style={{
            position: "absolute",
            top: "28px",
            left: "12px", zIndex: 1000,
            width: "280px",
            display: "flex", flexDirection: "column", gap: "10px",
            maxHeight: "calc(100% - 160px)", overflowY: "auto",
          }}>
            {/* Search bar */}
            <div style={{
              background: theme.mode === "night" ? "rgba(24,27,38,0.95)" : "rgba(255,255,255,0.97)",
              border: `1px solid ${theme.border}`,
              borderRadius: "14px",
              padding: "10px 14px",
              display: "flex", gap: "10px", alignItems: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              backdropFilter: "blur(10px)",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search here"
                style={{
                  flex: 1, minWidth: 0,
                  background: "transparent", border: "none", outline: "none",
                  fontSize: "13px", color: theme.text,
                  fontFamily: "inherit",
                }}
              />
            </div>
            {/* Place cards */}
            {PLACES.map(p => (
              <button key={p.name} style={{
                background: theme.mode === "night" ? "rgba(24,27,38,0.95)" : "rgba(255,255,255,0.97)",
                border: `1px solid ${theme.border}`,
                borderRadius: "14px",
                padding: "12px 14px",
                display: "flex", gap: "10px", alignItems: "flex-start",
                cursor: "pointer", textAlign: "left",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                backdropFilter: "blur(10px)",
                transition: "background 0.15s",
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: theme.panelBg, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: "2px",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textSub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: theme.text }}>{p.name}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: theme.text, flexShrink: 0 }}>{p.dist}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "3px" }}>{p.desc}</div>
                  <div style={{ fontSize: "11px", marginTop: "4px" }}>
                    <span style={{ color: "#2CFF95", fontWeight: 700 }}>Open</span>
                    <span style={{ color: theme.textMuted }}>  Closes 10pm</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Top progress bar — only while actively navigating */}
        {navMode && isNavigating && (
          <div style={{
            position: "absolute", top: "12px", left: "12px", right: "12px",
            zIndex: 1000,
          }}>
            <TopProgressBar theme={theme} dest={dest} />
          </div>
        )}

        {/* Right controls — only in full nav mode */}
        {navMode && (
          <div style={{ position: "absolute", top: "76px", right: "12px", zIndex: 1000, display: "flex", flexDirection: "column", gap: "6px" }}>
            <MapCtrlBtn theme={theme} onClick={() => mapRef.current?.setView([HERE.lat, HERE.lng], 15)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
              </svg>
            </MapCtrlBtn>
            <MapCtrlBtn theme={theme} onClick={() => mapRef.current?.zoomIn()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </MapCtrlBtn>
            <MapCtrlBtn theme={theme} onClick={() => mapRef.current?.zoomOut()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </MapCtrlBtn>
          </div>
        )}

        {/* Speed limit — only in full nav mode while navigating */}
        {navMode && isNavigating && (
          <div style={{
            position: "absolute", bottom: "82px", left: "14px", zIndex: 1000,
            width: "50px", height: "50px", borderRadius: "50%",
            background: "#fff", border: "4px solid #F93827",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 3px 12px rgba(0,0,0,0.4)",
          }}>
            <span style={{ fontSize: "15px", fontWeight: 900, color: "#1a1a2e" }}>60</span>
          </div>
        )}

        {/* Bottom bar — only in full nav mode.
            !isNavigating : chips + Charging Stations + Start Navigation
            isNavigating  : Stop Navigation only (same size/position as Start) */}
        {navMode && <div style={{
          position: "absolute", bottom: "12px", left: "12px", right: "12px",
          zIndex: 1000, display: "flex", gap: "8px", alignItems: "stretch",
          minHeight: "52px",
        }}>
          {/* Left side: chips + Charging Stations — hidden while navigating */}
          {!isNavigating && (
            <>
              <LocationChips
                theme={theme}
                destination={destination}
                setDestination={setDestination}
                compact={navMode}
              />
              {/* Charging Stations icon button */}
              <button
                onClick={() => { exitNav(); setView("charging"); }}
                style={{
                  background: theme.mode === "night" ? "rgba(24,27,38,0.95)" : "rgba(255,255,255,0.97)",
                  border: `1px solid ${theme.border}`,
                  borderRadius: "14px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: "4px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
                  backdropFilter: "blur(10px)",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ fontSize: "18px", lineHeight: 1 }}>⚡</span>
                <span style={{ fontSize: "10px", color: theme.textSub, fontWeight: 600 }}>Charging<br/>Stations</span>
              </button>
            </>
          )}

          {/* Right side: Start Navigation OR Stop Navigation — same size */}
          {!isNavigating && (
            <button
              onClick={startNavigating}
              style={{
                background: "#01CEA5",
                border: "none",
                borderRadius: "14px",
                padding: "12px 22px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 18px rgba(0,196,160,0.5)",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              Start Navigation
            </button>
          )}
          {isNavigating && (
            <button
              onClick={() => { setDestination(null); exitNav(); }}
              style={{
                marginLeft: "auto",
                background: "#F93827",
                border: "none",
                borderRadius: "14px",
                padding: "12px 22px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 18px rgba(249,56,39,0.5)",
                display: "flex", alignItems: "center", gap: "8px",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              Stop Navigation
            </button>
          )}
        </div>}
      </div>
    </div>
  );
}

/**
 * Top status row that lives above any active route. Reads navProgress
 * from NavContext so the full MapPanel and the minimised home NavPanel
 * stay perfectly in sync. Renders without absolute positioning — the
 * parent decides where to place it.
 */
export function TopProgressBar({ theme, dest }: { theme: Theme; dest: Loc | null }) {
  const { navProgress } = useNav();
  const totalKm = (() => {
    const raw = dest?.dist ?? "0 km";
    const n = parseFloat(raw);
    return isNaN(n) ? 0 : n;
  })();
  const coveredKm = totalKm * navProgress;
  const progress  = navProgress;

  const arrival = (() => {
    const mins = dest?.time ? parseInt(dest.time, 10) || 5 : 5;
    const remaining = Math.max(1, Math.round(mins * (1 - progress)));
    const now = new Date();
    now.setMinutes(now.getMinutes() + remaining);
    return now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  })();

  return (
    <div style={{
      display: "flex", gap: "10px", alignItems: "stretch",
    }}>
      {/* Green nav badge */}
      <div style={{
        background: "#01CEA5", borderRadius: "14px", padding: "10px 14px",
        display: "flex", alignItems: "center", gap: "10px",
        boxShadow: "0 4px 18px rgba(0,0,0,0.35)", flexShrink: 0,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
        </svg>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff", lineHeight: 1 }}>200<span style={{ fontSize: "11px", fontWeight: 600 }}>m</span></div>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.9)", marginTop: "2px" }}>continuing</div>
        </div>
      </div>

      {/* Trip progress */}
      <div style={{
        flex: 1, background: theme.panelBg,
        border: `1px solid ${theme.border}`,
        borderRadius: "14px", padding: "10px 16px",
        display: "flex", flexDirection: "column", gap: "6px",
        boxShadow: "0 4px 18px rgba(0,0,0,0.25)",
      }}>
        {/* Car driving along progress line */}
        <div style={{ position: "relative", height: "26px" }}>
          <div style={{
            position: "absolute", left: 0, right: 0, top: "50%",
            height: "3px", background: theme.sliderTrack, borderRadius: "2px",
            transform: "translateY(-50%)",
          }} />
          <div style={{
            position: "absolute", left: 0, top: "50%",
            height: "3px", width: `${progress * 100}%`,
            background: theme.text, borderRadius: "2px",
            transform: "translateY(-50%)",
            transition: "width 0.8s linear",
          }} />
          {/* Car icon along the line — starts at 0% (the very left) */}
          <div style={{
            position: "absolute",
            left: `calc(${progress * 100}% - 14px)`, top: 0, color: theme.text,
            transition: "left 0.8s linear",
          }}>
            <svg width="28" height="26" viewBox="0 0 32 26" fill="currentColor">
              <path d="M6 18 L4 12 Q4 9 7 9 L25 9 Q28 9 28 12 L26 18 Z" />
              <circle cx="9" cy="20" r="3" fill={theme.panelBg} stroke="currentColor" strokeWidth="2" />
              <circle cx="23" cy="20" r="3" fill={theme.panelBg} stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          {/* Flag at end */}
          <div style={{ position: "absolute", right: 0, top: "4px", color: theme.text }}>
            <svg width="18" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="5" y1="22" x2="5" y2="4" />
              <path d="M5 4 L20 4 L17 9 L20 14 L5 14" fill="currentColor" />
            </svg>
          </div>
        </div>
        {/* Labels: km covered so far / km remaining / ETA */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: theme.text }}>
            {coveredKm.toFixed(1)} km
          </span>
          <span style={{ fontSize: "11px", color: theme.textSub, fontWeight: 600 }}>
            {Math.max(0, totalKm - coveredKm).toFixed(1)} km left
          </span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: theme.text }}>{arrival}</span>
        </div>
      </div>
    </div>
  );
}

function MapCtrlBtn({ children, theme, onClick }: { children: React.ReactNode; theme: Theme; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: theme.mode === "night" ? "rgba(24,27,38,0.9)" : "rgba(255,255,255,0.92)",
      border: `1px solid ${theme.border}`, borderRadius: "10px",
      width: "38px", height: "38px",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", color: theme.textSub,
      boxShadow: "0 2px 8px rgba(0,0,0,0.25)", backdropFilter: "blur(8px)",
    }}>
      {children}
    </button>
  );
}

function LocationChips({ theme, destination, setDestination, compact }: {
  theme: Theme;
  destination: DestKey | null;
  setDestination: (v: DestKey | null) => void;
  compact?: boolean;
}) {
  const chips: { key: DestKey; label: string; time: string }[] = [
    { key: "pohonmasCafe", label: "Pohonmas Cafe",     time: "5 min"  },
    { key: "vivacity",     label: "Vivacity Megamall", time: "25 min" },
    { key: "megalanes",    label: "Megalanes Kuching", time: "30 min" },
  ];

  return (
    <div style={{ display: "flex", gap: "8px", flex: 1, minWidth: 0 }}>
      {chips.map(({ key, label, time }) => {
        const isSelected = destination === key;
        return (
          <button
            key={key}
            onClick={() => setDestination(isSelected ? null : key)}
            style={{
              flex: 1, minWidth: 0,
              background: theme.mode === "night" ? "rgba(24,27,38,0.95)" : "rgba(255,255,255,0.97)",
              border: `1px solid ${isSelected ? theme.accent : theme.border}`,
              borderRadius: "14px",
              padding: compact ? "8px 10px" : "9px 10px",
              cursor: "pointer", textAlign: "left",
              boxShadow: isSelected
                ? `0 0 12px ${theme.accent}44, 0 2px 10px rgba(0,0,0,0.25)`
                : "0 2px 10px rgba(0,0,0,0.25)",
              backdropFilter: "blur(10px)", transition: "all 0.15s",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 700, color: isSelected ? theme.accent : theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {label}
            </div>
            <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "2px" }}>{time}</div>
          </button>
        );
      })}
    </div>
  );
}
