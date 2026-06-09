import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "@/context/ThemeContext";
import { useNav, DEST_LOCATIONS, HERE_LATLNG } from "@/context/NavContext";

const HERE = HERE_LATLNG;
const DARK_TILE  = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const LIGHT_TILE = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

/**
 * Tiny live-location map shown in the new home panel. Tap it to open the
 * full navigation experience (which is the legacy 3-column layout).
 * One tap from the home screen is all it takes — that's the 2-click rule
 * (the second click is picking a destination once the full map appears).
 */
export default function MiniMap({
  height = 130, fill = false,
}: { height?: number; fill?: boolean }) {
  const { theme } = useTheme();
  const { enterNav, destinationKey, isNavigating } = useNav();
  const mapRef       = useRef<L.Map | null>(null);
  const tileRef      = useRef<L.TileLayer | null>(null);
  const routeRef     = useRef<L.Layer[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: HERE,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false,
    });
    const url = theme.mode === "night" ? DARK_TILE : LIGHT_TILE;
    tileRef.current = L.tileLayer(url, { maxZoom: 19 }).addTo(map);

    const pin = L.divIcon({
      html: `<div style="position:relative;width:14px;height:14px;">
        <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:rgba(74,142,255,0.25);top:-7px;left:-7px;"></div>
        <div style="width:14px;height:14px;background:#4a8eff;border:2.5px solid #fff;border-radius:50%;position:relative;box-shadow:0 1px 5px rgba(0,0,0,0.45);"></div>
      </div>`,
      iconSize: [14, 14], iconAnchor: [7, 7], className: "",
    });
    L.marker(HERE, { icon: pin }).addTo(map);
    mapRef.current = map;

    return () => { map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap tiles when the theme changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileRef.current) map.removeLayer(tileRef.current);
    const url = theme.mode === "night" ? DARK_TILE : LIGHT_TILE;
    tileRef.current = L.tileLayer(url, { maxZoom: 19 }).addTo(map);
  }, [theme.mode]);

  // Draw the same blue route + destination marker the full MapPanel does,
  // BUT only once the user has actually pressed "Start Navigation" in the
  // full map view. Before that, the dashboard mini-map stays clean — just
  // the live blue dot, no route, no destination pin. This is what the
  // user means by "hide the navigation way inside the dashboard until
  // navigation actually starts".
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    routeRef.current.forEach(l => { try { map.removeLayer(l); } catch (_) { /* ignore */ } });
    routeRef.current = [];

    if (!destinationKey || !isNavigating) {
      map.flyTo(HERE, 14, { duration: 0.5 });
      return;
    }

    const dest = DEST_LOCATIONS[destinationKey];
    const mid1: [number, number] = [
      HERE[0] + (dest.lat - HERE[0]) * 0.3,
      HERE[1] + (dest.lng - HERE[1]) * 0.3 + 0.004,
    ];
    const mid2: [number, number] = [
      HERE[0] + (dest.lat - HERE[0]) * 0.7,
      HERE[1] + (dest.lng - HERE[1]) * 0.7 - 0.002,
    ];
    const pts: [number, number][] = [HERE, mid1, mid2, [dest.lat, dest.lng]];

    const glow  = L.polyline(pts, { color: "rgba(74,142,255,0.30)", weight: 10, lineCap: "round", lineJoin: "round" }).addTo(map);
    const route = L.polyline(pts, { color: "#4a8eff", weight: 4, opacity: 1, lineCap: "round", lineJoin: "round" }).addTo(map);
    const destIcon = L.divIcon({
      html: `<div style="width:12px;height:12px;border-radius:50%;background:#01CEA5;border:2px solid #fff;box-shadow:0 0 8px rgba(1,206,165,0.7);"></div>`,
      iconSize: [12, 12], iconAnchor: [6, 6], className: "",
    });
    const marker = L.marker([dest.lat, dest.lng], { icon: destIcon }).addTo(map);
    routeRef.current = [glow, route, marker];

    map.fitBounds(route.getBounds(), { padding: [22, 22], maxZoom: 14 });
  }, [destinationKey, isNavigating]);

  return (
    <div
      onClick={enterNav}
      title="Tap to open full navigation"
      style={{
        position: "relative",
        height: fill ? "100%" : `${height}px`,
        width: "100%",
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        border: `1px solid ${theme.border}`,
        boxShadow: theme.mode === "night" ? "0 4px 14px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.06)",
        flex: fill ? 1 : "0 0 auto",
        minHeight: fill ? 0 : undefined,
      }}
    >
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
      {/* No built-in label here: every consumer (LiveLocation card,
          NavPanel) already overlays its own status pill/badge on top, so
          a second "Live Location" tag would just duplicate it. */}
    </div>
  );
}
