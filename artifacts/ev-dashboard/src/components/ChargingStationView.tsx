import { useEffect, useRef, useState } from "react";
import { useTheme, type Theme } from "@/context/ThemeContext";
import { HERE_LATLNG } from "@/context/NavContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Station {
  id: string;
  name: string;
  area: string;
  distanceKm: number;
  freeBays: number;
  totalBays: number;
  powerKw: number;
  rate: number;
  lat: number;
  lng: number;
}

const STATIONS: Station[] = [
  { id: "kv", name: "Kuching Vivacity",   area: "Jalan Kuching",   distanceKm: 3,  freeBays: 2, totalBays: 6, powerKw: 150, rate: 0.80, lat: 1.5295, lng: 110.3590 },
  { id: "am", name: "Aimanmall",          area: "Kota Samarahan",  distanceKm: 10, freeBays: 2, totalBays: 4, powerKw: 150, rate: 0.80, lat: 1.4661, lng: 110.4376 },
  { id: "sm", name: "Summermall",         area: "Jalan Jalan",     distanceKm: 15, freeBays: 0, totalBays: 4, powerKw: 150, rate: 0.80, lat: 1.5615, lng: 110.4180 },
  { id: "kb", name: "Kuching Boulevard",  area: "Jalan Boulevard", distanceKm: 20, freeBays: 3, totalBays: 6, powerKw: 150, rate: 0.80, lat: 1.5380, lng: 110.3120 },
];

const DARK_TILE  = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const LIGHT_TILE = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

export default function ChargingStationView() {
  const { theme } = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? (STATIONS.find(s => s.id === selectedId) ?? null) : null;

  return (
    <div
      style={{
        background: theme.panelBg,
        borderRadius: "20px",
        border: `1px solid ${theme.border}`,
        boxShadow: theme.mode === "night" ? "0 4px 24px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.07)",
        display: "grid",
        gridTemplateColumns: "minmax(240px, 340px) 1fr",
        gap: "0",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {/* ============ LEFT column: search + station list ============ */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          minHeight: 0,
          overflow: "hidden",
          padding: "clamp(14px, 1.6vw, 20px)",
          borderRight: `1px solid ${theme.border}`,
        }}
      >
        {/* Search */}
        <div
          style={{
            background: theme.cardBg,
            borderRadius: "12px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: `1px solid ${theme.border}`,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            aria-label="Search charging station"
            placeholder="Search Charging Station"
            style={{
              flex: 1, background: "transparent", border: "none",
              color: theme.text, fontSize: "13px", outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Heading */}
        <div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: theme.text }}>Nearby Stations</div>
          <div style={{ fontSize: "11px", color: theme.textSub, marginTop: "2px" }}>
            {STATIONS.length} Stations within range
          </div>
        </div>

        {/* List */}
        <div style={{
          flex: 1, minHeight: 0, overflowY: "auto",
          display: "flex", flexDirection: "column", gap: "10px",
          paddingRight: "4px",
        }}>
          {STATIONS.map(s => (
            <StationRow
              key={s.id}
              theme={theme}
              station={s}
              selected={s.id === selectedId}
              onClick={() => setSelectedId(s.id)}
            />
          ))}
        </div>
      </div>

      {/* ============ RIGHT column: full map with floating info card ============ */}
      <div style={{ position: "relative", minHeight: 0, overflow: "hidden" }}>
        <StationsMap theme={theme} stations={STATIONS} selectedId={selectedId} onSelect={setSelectedId} />

        {/* Floating info card — only when a station is selected */}
        {selected && (
          <div
            style={{
              position: "absolute",
              bottom: "58px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "calc(100% - 32px)",
              maxWidth: "480px",
              background: theme.mode === "night"
                ? "rgba(20,22,35,0.92)"
                : "rgba(255,255,255,0.94)",
              backdropFilter: "blur(14px)",
              borderRadius: "18px",
              padding: "14px 18px",
              border: `1px solid ${theme.border}`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
              zIndex: 600,
            }}
          >
            {/* Station name + battery warning */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: theme.text }}>{selected.name}</div>
                <div style={{ fontSize: "11px", color: theme.textSub, marginTop: "2px" }}>{selected.area}</div>
              </div>
              <div style={{
                fontSize: "11px", color: theme.orange, fontWeight: 700,
                background: `${theme.orange}1a`,
                border: `1px solid ${theme.orange}55`,
                borderRadius: "999px",
                padding: "4px 10px",
                whiteSpace: "nowrap",
              }}>
                Arrive with 5% battery
              </div>
            </div>

            {/* Distance + time + Start */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <InfoPill theme={theme}>{selected.distanceKm}km</InfoPill>
              <InfoPill theme={theme}>{Math.round(selected.distanceKm * 3.3)} minutes</InfoPill>
              <button
                style={{
                  marginLeft: "auto",
                  background: theme.highlight,
                  border: "none",
                  borderRadius: "12px",
                  padding: "10px 24px",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "6px",
                  boxShadow: `0 4px 14px ${theme.highlight}55`,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 11l19-9-9 19-2-8z" />
                </svg>
                Start
              </button>
            </div>
          </div>
        )}

        {/* Legend — always visible at bottom */}
        <div style={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
          display: "flex",
          gap: "18px",
          background: theme.mode === "night" ? "rgba(20,22,35,0.85)" : "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          padding: "8px 16px",
          border: `1px solid ${theme.border}`,
          zIndex: 600,
        }}>
          <LegendDot color={theme.success}   label="Available" theme={theme} />
          <LegendDot color={theme.orange}    label="Busy"      theme={theme} />
          <LegendDot color={theme.highlight} label="Selected"  theme={theme} />
        </div>
      </div>
    </div>
  );
}

function InfoPill({ theme, children }: { theme: Theme; children: React.ReactNode }) {
  return (
    <div style={{
      background: theme.panelBg,
      borderRadius: "10px", padding: "8px 14px",
      fontSize: "13px", color: theme.text, fontWeight: 600,
      border: `1px solid ${theme.border}`,
    }}>
      {children}
    </div>
  );
}

function StationRow({ station, selected, onClick, theme }: {
  station: Station;
  selected: boolean;
  onClick: () => void;
  theme: Theme;
}) {
  const noFree = station.freeBays === 0;
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        background: selected ? theme.cardBg : "transparent",
        border: `1px solid ${selected ? theme.accent : theme.border}`,
        borderRadius: "12px",
        padding: "12px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        transition: "background 0.15s, border-color 0.15s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: theme.text }}>{station.name}</span>
            {selected && (
              <span style={{ fontSize: "10px", fontWeight: 700, color: theme.orange }}>
                Arrive with 5% battery
              </span>
            )}
          </div>
          <div style={{ fontSize: "11px", color: theme.textSub, marginTop: "1px" }}>{station.area}</div>
        </div>
        <div style={{ fontSize: "13px", color: theme.text, fontWeight: 700, flexShrink: 0, marginLeft: "8px" }}>
          {station.distanceKm} km
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Pill
          bg={noFree ? "rgba(248,105,53,0.18)" : "rgba(22,196,127,0.18)"}
          color={noFree ? theme.orange : theme.success}
        >
          {station.freeBays} Free
        </Pill>
        <Pill bg="rgba(61,83,255,0.20)" color={theme.accent}>
          {station.powerKw} kW
        </Pill>
        <div style={{ marginLeft: "auto", fontSize: "11px", color: theme.textMuted, fontWeight: 600 }}>
          RM {station.rate.toFixed(2)} / kWh
        </div>
      </div>
    </button>
  );
}

function Pill({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        background: bg,
        color,
        fontSize: "11px",
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: "999px",
      }}
    >
      {children}
    </span>
  );
}

function LegendDot({ color, label, theme }: { color: string; label: string; theme: Theme }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{
        width: "11px", height: "11px", borderRadius: "50%",
        background: color, boxShadow: `0 0 6px ${color}88`,
      }} />
      <span style={{ fontSize: "12px", color: theme.textSub, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function StationsMap({ theme, stations, selectedId, onSelect }: {
  theme: Theme;
  stations: Station[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const mapRef       = useRef<L.Map | null>(null);
  const tileRef      = useRef<L.TileLayer | null>(null);
  const markersRef   = useRef<L.Marker[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: HERE_LATLNG,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    const url = theme.mode === "night" ? DARK_TILE : LIGHT_TILE;
    tileRef.current = L.tileLayer(url, { maxZoom: 19 }).addTo(map);
    mapRef.current = map;

    // User location marker (blue dot)
    const userIcon = L.divIcon({
      html: `<div style="position:relative;width:18px;height:18px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:34px;height:34px;border-radius:50%;background:rgba(74,142,255,0.2);top:-8px;left:-8px;"></div>
        <div style="width:18px;height:18px;background:#4a8eff;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(74,142,255,0.6);position:relative;z-index:1;"></div>
      </div>`,
      iconSize: [18, 18], iconAnchor: [9, 9], className: "",
    });
    L.marker(HERE_LATLNG, { icon: userIcon }).addTo(map);

    return () => { map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileRef.current) map.removeLayer(tileRef.current);
    const url = theme.mode === "night" ? DARK_TILE : LIGHT_TILE;
    tileRef.current = L.tileLayer(url, { maxZoom: 19 }).addTo(map);
  }, [theme.mode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const fresh: L.Marker[] = [];
    stations.forEach(s => {
      const isSelected = s.id === selectedId;
      const isBusy     = s.freeBays === 0;
      const color = isSelected ? theme.highlight : (isBusy ? theme.orange : theme.success);
      const size  = isSelected ? 32 : 26;

      const icon = L.divIcon({
        html: `
          <div style="
            width:${size}px;height:${size}px;border-radius:50%;
            background:${color};border:2.5px solid #fff;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 2px 10px ${color}cc;font-weight:800;color:#fff;
            font-size:${isSelected ? 16 : 13}px;line-height:1;
          ">⚡</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        className: "",
      });
      const marker = L.marker([s.lat, s.lng], { icon }).addTo(map);
      marker.on("click", () => onSelect(s.id));
      fresh.push(marker);
    });
    markersRef.current = fresh;

    if (!selectedId) {
      map.flyTo(HERE_LATLNG, 13, { duration: 0.6 });
    }
  }, [stations, selectedId, theme.highlight, theme.orange, theme.success, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const id = setTimeout(() => map.invalidateSize(), 350);
    return () => clearTimeout(id);
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />

      {/* Hub label */}
      <div style={{
        position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)",
        background: theme.panelBg,
        border: `1px solid ${theme.border}`,
        borderRadius: "6px",
        padding: "5px 12px",
        zIndex: 500,
        fontSize: "10px", fontWeight: 700, color: theme.text, letterSpacing: "0.5px",
        textAlign: "center", lineHeight: 1.2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}>
        SARAWAK ENERGY
        <div style={{ fontSize: "8px", color: theme.textSub, fontWeight: 600, marginTop: "1px" }}>CHARGING HUB</div>
      </div>

      {/* Map controls — matching MapPanel style */}
      <div style={{
        position: "absolute", right: "12px", top: "12px",
        display: "flex", flexDirection: "column", gap: "6px", zIndex: 500,
      }}>
        {/* Center on user location */}
        <MapCtrlBtn theme={theme} onClick={() => mapRef.current?.flyTo(HERE_LATLNG, 13, { duration: 0.8 })}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        </MapCtrlBtn>

        {/* Zoom in */}
        <MapCtrlBtn theme={theme} onClick={() => mapRef.current?.zoomIn()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </MapCtrlBtn>

        {/* Zoom out */}
        <MapCtrlBtn theme={theme} onClick={() => mapRef.current?.zoomOut()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </MapCtrlBtn>
      </div>
    </div>
  );
}

function MapCtrlBtn({ children, theme, onClick }: { children: React.ReactNode; theme: Theme; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "44px", height: "36px",
        background: theme.mode === "night" ? "rgba(18,20,36,0.88)" : "rgba(255,255,255,0.9)",
        backdropFilter: "blur(10px)",
        border: `1px solid ${theme.border}`,
        borderRadius: "12px",
        color: theme.text,
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
        transition: "background 0.15s",
      }}
    >{children}</button>
  );
}
