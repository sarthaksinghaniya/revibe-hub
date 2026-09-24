import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Locate, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window { L: any }
}

interface Facility {
  id: string | number;
  name: string;
  amenity: string;
  lat: number;
  lon: number;
  distance: number;
  tags: Record<string, string>;
}

const LUCKNOW = { lat: 26.8467, lon: 80.9462 };

const FALLBACK_FACILITIES: Facility[] = [
  { id: "f1", name: "Lucknow Nagar Nigam MRF, Aliganj", amenity: "recycling", lat: 26.8845, lon: 80.9320, distance: 0, tags: { amenity: "recycling" } },
  { id: "f2", name: "Gomti Nagar Dry Waste Center", amenity: "recycling", lat: 26.8600, lon: 80.9900, distance: 0, tags: { amenity: "recycling" } },
  { id: "f3", name: "Hazratganj Collection Point", amenity: "recycling", lat: 26.8500, lon: 80.9462, distance: 0, tags: { amenity: "recycling" } },
  { id: "f4", name: "LNN E-Waste Drop, Indira Nagar", amenity: "recycling", lat: 26.8950, lon: 81.0020, distance: 0, tags: { amenity: "recycling" } },
  { id: "f5", name: "Alambagh Composting Unit", amenity: "waste_disposal", lat: 26.8200, lon: 80.9100, distance: 0, tags: { amenity: "waste_disposal" } },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "recycling", label: "Recycling" },
  { key: "waste_disposal", label: "Waste Disposal" },
  { key: "second_hand", label: "Second Hand" },
  { key: "scrap_yard", label: "Scrap Yard" },
];

const RADII = [5000, 10000, 20000];

const PIN_COLORS: Record<string, string> = {
  recycling: "#22c55e",
  waste_disposal: "#f97316",
  waste_transfer_station: "#ef4444",
  second_hand: "#a855f7",
  scrap_yard: "#a855f7",
  landfill: "#6b7280",
};

const CATEGORIES = [
  { key: "recyclable", label: "Recyclable", base: 10 },
  { key: "compostable", label: "Compostable", base: 8 },
  { key: "upcyclable", label: "Upcyclable", base: 12 },
  { key: "hazardous", label: "Hazardous", base: 15 },
  { key: "landfill", label: "Landfill", base: 2 },
];

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildQuery(lat: number, lon: number, radius: number) {
  return `[out:json][timeout:25];
(
  node["amenity"="recycling"](around:${radius},${lat},${lon});
  node["amenity"="waste_disposal"](around:${radius},${lat},${lon});
  node["amenity"="waste_transfer_station"](around:${radius},${lat},${lon});
  node["landuse"="landfill"](around:${radius},${lat},${lon});
  node["shop"="second_hand"](around:${radius},${lat},${lon});
  node["amenity"="scrap_yard"](around:${radius},${lat},${lon});
);
out body;`;
}

function parseAcceptedMaterials(tags: Record<string, string>): string[] {
  return Object.entries(tags)
    .filter(([k, v]) => k.startsWith("recycling:") && (v === "yes" || v === "1"))
    .map(([k]) => k.replace("recycling:", "").replace(/_/g, " "));
}

function humanType(amenity: string): string {
  return amenity.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const Facilities = () => {
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);

  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [radius, setRadius] = useState<number>(5000);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [dropoffOpen, setDropoffOpen] = useState(false);
  const [dropoffFacility, setDropoffFacility] = useState<Facility | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setCoords(LUCKNOW);
      setUsingFallback(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setUsingFallback(false);
      },
      () => {
        setCoords(LUCKNOW);
        setUsingFallback(true);
      }
    );
  }, []);

  useEffect(() => { requestLocation(); }, [requestLocation]);

  // Try Overpass via edge proxy first, then direct endpoints as a fallback
  const fetchFacilities = useCallback(async (lat: number, lon: number, r: number, autoRetry = true) => {
    setLoading(true);
    setErrorMsg("");

    const parseElements = (elements: any[]): Facility[] => {
      const parsed: Facility[] = elements.map((el: any) => {
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;
        const amenity = el.tags?.amenity || el.tags?.shop || el.tags?.landuse || "recycling";
        return {
          id: el.id,
          name: el.tags?.name || el.tags?.operator || `${humanType(amenity)} point`,
          amenity,
          lat: elLat,
          lon: elLon,
          distance: haversine(lat, lon, elLat, elLon),
          tags: el.tags || {},
        };
      }).filter((f: Facility) => Number.isFinite(f.lat) && Number.isFinite(f.lon));
      parsed.sort((a, b) => a.distance - b.distance);
      return parsed;
    };

    const query = buildQuery(lat, lon, r);
    const directEndpoints = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://overpass.openstreetmap.ru/api/interpreter",
    ];

    let parsed: Facility[] | null = null;

    // 1) Try our edge proxy (most reliable, no CORS / no sandbox restrictions)
    try {
      const { data, error } = await supabase.functions.invoke("overpass-proxy", {
        body: { lat, lon, radius: r },
      });
      if (!error && data?.elements) parsed = parseElements(data.elements);
    } catch (e) {
      console.warn("overpass-proxy failed, falling back to direct", e);
    }

    // 2) Fallback to direct Overpass endpoints
    if (!parsed) {
      for (const url of directEndpoints) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `data=${encodeURIComponent(query)}`,
          });
          if (!res.ok) continue;
          const json = await res.json();
          parsed = parseElements(json.elements || []);
          break;
        } catch (e) {
          console.warn("direct overpass failed", url, e);
        }
      }
    }

    if (parsed) {
      if (parsed.length === 0 && autoRetry && r < 20000) {
        const next = r < 10000 ? 10000 : 20000;
        setRadius(next);
        await fetchFacilities(lat, lon, next, next < 20000);
        return;
      }
      if (parsed.length === 0) {
        setErrorMsg(`No mapped facilities within ${r / 1000} km. Try a larger radius — OSM coverage varies by city.`);
      }
      setFacilities(parsed);
    } else {
      setErrorMsg("Live map data unavailable right now. Showing approximate nearby points.");
      // Generate fallback points around the user's actual location (not Lucknow!)
      const localFb: Facility[] = FALLBACK_FACILITIES.map((f, i) => {
        const angle = (i / FALLBACK_FACILITIES.length) * Math.PI * 2;
        const offsetKm = 1 + i * 0.8;
        const dLat = (offsetKm / 111) * Math.cos(angle);
        const dLon = (offsetKm / (111 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle);
        return {
          ...f,
          lat: lat + dLat,
          lon: lon + dLon,
          distance: offsetKm,
        };
      });
      setFacilities(localFb);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!coords) return;
    fetchFacilities(coords.lat, coords.lon, radius);
  }, [coords, radius, fetchFacilities]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!coords || !mapRef.current || mapInstance.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current).setView([coords.lat, coords.lon], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;
    markersLayer.current = L.layerGroup().addTo(map);

    // user location dot
    L.circleMarker([coords.lat, coords.lon], {
      radius: 8,
      color: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.7,
      weight: 2,
    }).addTo(map).bindPopup("You are here");
  }, [coords]);

  // Re-center when coords change
  useEffect(() => {
    if (mapInstance.current && coords) {
      mapInstance.current.setView([coords.lat, coords.lon], 13);
    }
  }, [coords]);

  // Render markers
  useEffect(() => {
    const L = window.L;
    if (!L || !mapInstance.current || !markersLayer.current) return;
    markersLayer.current.clearLayers();

    const visible = facilities.filter((f) =>
      filter === "all" ||
      f.amenity === filter ||
      (filter === "second_hand" && (f.amenity === "second_hand" || f.amenity === "scrap_yard"))
    );

    visible.forEach((f) => {
      const color = PIN_COLORS[f.amenity] || "#22c55e";
      const icon = L.divIcon({
        className: "custom-pin",
        html: `<div style="background:${color};width:18px;height:18px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 18],
      });
      const materials = parseAcceptedMaterials(f.tags);
      const popup = `
        <div style="min-width:200px;font-family:system-ui">
          <strong>${f.name}</strong><br/>
          <small>Type: ${humanType(f.amenity)}</small><br/>
          <small>Distance: ${f.distance.toFixed(1)} km</small><br/>
          <small>Hours: ${f.tags.opening_hours || "Not listed"}</small><br/>
          <small>Phone: ${f.tags.phone || "Not listed"}</small><br/>
          ${materials.length ? `<div style="margin-top:6px"><small>Accepts: ${materials.join(", ")}</small></div>` : ""}
          <a href="https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lon}" target="_blank" style="display:inline-block;margin-top:8px;padding:4px 10px;background:#22c55e;color:white;border-radius:6px;text-decoration:none;font-size:12px">Get Directions</a>
        </div>`;
      L.marker([f.lat, f.lon], { icon }).addTo(markersLayer.current).bindPopup(popup);
    });
  }, [facilities, filter]);

  const visible = facilities.filter((f) =>
    filter === "all" ||
    f.amenity === filter ||
    (filter === "second_hand" && (f.amenity === "second_hand" || f.amenity === "scrap_yard"))
  );

  const handleLogDropoff = (f: Facility) => {
    if (!user) {
      toast.error("Please log in to log a drop-off");
      return;
    }
    setDropoffFacility(f);
    setDropoffOpen(true);
  };

  const confirmDropoff = async (categoryKey: string) => {
    if (!user || !dropoffFacility) return;
    const cat = CATEGORIES.find((c) => c.key === categoryKey)!;
    // Use new CO2-grams formula with verified ×2 multiplier
    const { co2GramsForItem, mintFromReservoir } = await import("@/lib/co2Formula");
    const co2G = co2GramsForItem(categoryKey as any, true);

    try {
      await supabase.from("scan_history").insert({
        user_id: user.id,
        item_name: `Verified drop-off: ${dropoffFacility.name}`,
        category: categoryKey as any,
        material: cat.label,
        carbon_saved: co2G / 1000,
        credits_earned: 0,
        disposal_method: `Dropped at ${dropoffFacility.name}`,
        source: "verified_dropoff",
      } as any);

      const { data: wallet } = await supabase
        .from("carbon_credits").select("*").eq("user_id", user.id).single();
      let mintedCC = 0;
      if (wallet) {
        const prevPending = Number((wallet as any).co2_pending_g) || 0;
        const lifetime = Number((wallet as any).co2_saved_g) || 0;
        const { mintedCC: minted, newPendingG } = mintFromReservoir(
          prevPending, co2G, wallet.current_streak,
        );
        mintedCC = minted;
        await supabase.from("carbon_credits").update({
          total_credits: wallet.total_credits + minted,
          co2_saved_g: lifetime + co2G,
          co2_pending_g: newPendingG,
        } as any).eq("user_id", user.id);
      }
      toast.success(
        mintedCC > 0
          ? `+${co2G}g CO₂ saved · +${mintedCC} CC minted!`
          : `+${co2G}g CO₂ saved (verified ×2). Reservoir filling…`
      );
      setDropoffOpen(false);
      setDropoffFacility(null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to log drop-off");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 lg:pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-display font-bold text-foreground">Facilities</h1>
          <button
            onClick={requestLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-[10px] font-display font-bold"
          >
            <Locate size={12} />
            My Location
          </button>
        </div>

        {usingFallback && (
          <div className="mb-3 p-3 rounded-lg bg-category-compost/10 border border-category-compost/20 text-xs text-foreground/80">
            Showing facilities near Lucknow. Enable location for personalized results.
          </div>
        )}

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-display font-bold transition-all ${
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground border border-border hover:border-primary/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Radius toggle */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-data text-muted-foreground uppercase tracking-wider">Radius:</span>
          {RADII.map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`px-3 py-1 rounded-md text-[11px] font-data font-bold transition-all ${
                radius === r ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border"
              }`}
            >
              {r / 1000} km
            </button>
          ))}
        </div>

        {/* Map */}
        <div className="relative rounded-2xl overflow-hidden border border-border mb-4 shadow-sm" style={{ height: "55vh" }}>
          <div ref={mapRef} className="w-full h-full" />
          {loading && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-[400]">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground font-data mb-3 flex items-center gap-1.5">
          <MapPin size={12} className="text-primary" />
          {visible.length} facilities found within {radius / 1000} km
        </p>

        {errorMsg && (
          <div className="mb-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive">
            {errorMsg}
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {visible.map((f, i) => {
            const materials = parseAcceptedMaterials(f.tags);
            const shown = materials.slice(0, 3);
            const more = materials.length - shown.length;
            return (
              <motion.div
                key={f.id}
                className="p-4 rounded-xl glass-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: PIN_COLORS[f.amenity] || "#22c55e" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-display font-bold text-foreground truncate">{f.name}</h3>
                      <span className="text-[10px] font-data px-2 py-0.5 rounded-full bg-primary/15 text-primary flex-shrink-0">
                        {f.distance.toFixed(1)} km
                      </span>
                    </div>
                    <p className="text-[10px] font-data text-muted-foreground mt-0.5">{humanType(f.amenity)}</p>
                    {shown.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {shown.map((m) => (
                          <span key={m} className="text-[10px] font-data px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border">
                            {m}
                          </span>
                        ))}
                        {more > 0 && (
                          <span className="text-[10px] font-data px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                            +{more} more
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-foreground text-xs font-display font-bold border border-border hover:border-primary/30 transition-colors"
                      >
                        <Navigation size={12} /> Directions
                      </a>
                      <button
                        onClick={() => handleLogDropoff(f)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/15 text-primary text-xs font-display font-bold border border-primary/20 hover:bg-primary/25 transition-colors"
                      >
                        <CheckCircle2 size={12} /> Log Drop-off
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {!loading && visible.length === 0 && !errorMsg && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No facilities match this filter
            </div>
          )}
        </div>
      </div>

      {/* Drop-off modal */}
      {dropoffOpen && dropoffFacility && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end lg:items-center justify-center p-4" onClick={() => setDropoffOpen(false)}>
          <motion.div
            className="w-full max-w-md p-6 rounded-2xl bg-card border border-border"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-display font-bold text-foreground mb-1">What did you drop off?</h3>
            <p className="text-xs text-muted-foreground mb-4">at {dropoffFacility.name}</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => confirmDropoff(c.key)}
                  className="p-3 rounded-xl bg-secondary border border-border hover:border-primary/40 transition-all text-left"
                >
                  <p className="text-sm font-display font-bold text-foreground">{c.label}</p>
                  <p className="text-[10px] font-data text-primary">+{c.base * 2} CC (2x)</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setDropoffOpen(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-muted text-muted-foreground font-display font-bold text-sm"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Facilities;
