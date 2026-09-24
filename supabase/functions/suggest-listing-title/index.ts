import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { waste_type } = await req.json();
    if (!waste_type) {
      return new Response(JSON.stringify({ error: "waste_type is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const GROQ_API_URL = Deno.env.get("GROQ_API_URL") ?? "https://api.groq.com/openai/v1/chat/completions";
    const GROQ_TITLE_MODEL = Deno.env.get("GROQ_TITLE_MODEL") ?? "llama-3.1-8b-instant";

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_TITLE_MODEL,
        messages: [
          {
            role: "system",
            content: "You suggest creative, catchy marketplace listing titles for upcycled items. Return ONLY the title, nothing else. Keep it under 60 characters. Make it sound appealing and marketable.",
          },
          {
            role: "user",
            content: `Suggest a creative marketplace listing title for an item upcycled from: ${waste_type}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again shortly" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Groq API error");
    }

    const data = await response.json();
    const title = data.choices?.[0]?.message?.content?.trim() || `Upcycled ${waste_type} Creation`;

    return new Response(JSON.stringify({ title }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-listing-title error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
