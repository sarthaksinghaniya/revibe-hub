// Proxy to Overpass API to bypass browser CORS / network restrictions
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { lat, lon, radius } = await req.json();
    if (typeof lat !== "number" || typeof lon !== "number" || typeof radius !== "number") {
      return new Response(JSON.stringify({ error: "lat, lon, radius required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const query = `[out:json][timeout:25];
(
  node["amenity"="recycling"](around:${radius},${lat},${lon});
  node["amenity"="waste_disposal"](around:${radius},${lat},${lon});
  node["amenity"="waste_transfer_station"](around:${radius},${lat},${lon});
  node["landuse"="landfill"](around:${radius},${lat},${lon});
  node["shop"="second_hand"](around:${radius},${lat},${lon});
  node["amenity"="scrap_yard"](around:${radius},${lat},${lon});
  node["shop"="scrap"](around:${radius},${lat},${lon});
  node["recycling_type"](around:${radius},${lat},${lon});
);
out body;`;

    let lastErr = "";
    for (const url of ENDPOINTS) {
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${encodeURIComponent(query)}`,
        });
        if (!r.ok) { lastErr = `${url} -> ${r.status}`; continue; }
        const json = await r.json();
        return new Response(JSON.stringify({ ...json, _source: url }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        lastErr = `${url} -> ${(e as Error).message}`;
      }
    }
    return new Response(JSON.stringify({ error: "All Overpass endpoints failed", detail: lastErr }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
