import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Mail, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import DecayTimeline from "@/components/DecayTimeline";

interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  is_free: boolean;
  category: string;
  waste_type: string | null;
  images: string[] | null;
  location_city: string | null;
  location_state: string | null;
  contact_whatsapp: string | null;
  contact_email: string | null;
  status: string;
  views: number;
  created_at: string;
}

const MarketplaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [similar, setSimilar] = useState<Listing[]>([]);
  const [sellerName, setSellerName] = useState<string | null>(null);
  const [sellerSince, setSellerSince] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchListing();
  }, [id]);

  const fetchListing = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("listings").select("*").eq("id", id!).single();
    if (!error && data) {
      setListing(data as Listing);
      // Increment views
      supabase.from("listings").update({ views: (data.views || 0) + 1 }).eq("id", id!).then();
      // Fetch seller profile
      supabase.from("profiles").select("display_name, created_at").eq("user_id", data.user_id).single().then(({ data: p }) => {
        if (p) {
          setSellerName(p.display_name);
          setSellerSince(new Date(p.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" }));
        }
      });
      // Fetch similar
      supabase.from("listings").select("*").eq("category", data.category).eq("status", "active").neq("id", id!).limit(4).then(({ data: s }) => {
        if (s) setSimilar(s as Listing[]);
      });
      // Check if saved
      if (user) {
        supabase.from("saved_listings").select("id").eq("user_id", user.id).eq("listing_id", id!).single().then(({ data: sv }) => {
          setIsSaved(!!sv);
        });
      }
    }
    setLoading(false);
  };

  const toggleSave = async () => {
    if (!user || !id) return;
    if (isSaved) {
      await supabase.from("saved_listings").delete().eq("user_id", user.id).eq("listing_id", id);
    } else {
      await supabase.from("saved_listings").insert({ user_id: user.id, listing_id: id });
    }
    setIsSaved(!isSaved);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 pt-6 max-w-lg mx-auto">
        <Skeleton className="w-full aspect-square rounded-2xl mb-4" />
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Listing not found</p>
      </div>
    );
  }

  const images = listing.images || [];
  const initials = (sellerName || "U").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Image Gallery */}
      <div className="relative mx-auto w-full max-w-3xl bg-muted overflow-hidden md:rounded-b-2xl">
        {images.length > 0 ? (
          <img
            src={images[imgIdx]}
            alt={listing.title}
            className="w-full h-auto max-h-[70vh] object-contain bg-muted"
          />
        ) : (
          <div className="w-full h-[260px] sm:h-[360px] md:h-[440px] flex items-center justify-center text-5xl">♻️</div>
        )}

        {/* Back button */}
        <Link
          to="/marketplace"
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </Link>

        {/* Image nav */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setImgIdx((i) => (i > 0 ? i - 1 : images.length - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setImgIdx((i) => (i < images.length - 1 ? i + 1 : 0))}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center"
            >
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === imgIdx ? "bg-primary" : "bg-card/60"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="px-4 pt-4 max-w-3xl mx-auto">
        {/* Price & Title */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-display font-bold text-foreground">{listing.title}</h1>
            <p className="text-lg font-data font-bold text-primary mt-1">
              {listing.is_free ? "Free" : `₹${listing.price}`}
            </p>
          </div>
          {user && (
            <button onClick={toggleSave} className="flex-shrink-0 ml-3 mt-1">
              <Heart
                size={22}
                className={isSaved ? "fill-destructive text-destructive" : "text-muted-foreground"}
              />
            </button>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {listing.is_free && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-display font-bold bg-[#E1F5EE] text-[#085041]">
              Free Pickup
            </span>
          )}
          {listing.waste_type && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-data bg-primary/10 text-primary">
              Made from: {listing.waste_type}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-lg text-xs font-data bg-card border border-border text-muted-foreground">
            {listing.category}
          </span>
        </div>

        {/* Description */}
        {listing.description && (
          <div className="mb-6">
            <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>
        )}

        {/* Seller Info */}
        <div className="p-4 rounded-xl bg-card border border-border mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-display font-bold text-primary">
              {initials}
            </div>
            <div>
              <p className="text-sm font-display font-bold text-foreground">{sellerName || "User"}</p>
              {sellerSince && (
                <p className="text-[10px] font-data text-muted-foreground">Member since {sellerSince}</p>
              )}
              {listing.location_city && (
                <p className="text-[10px] font-data text-muted-foreground">
                  📍 {listing.location_city}{listing.location_state ? `, ${listing.location_state}` : ""}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex gap-3 mb-6">
          {listing.contact_whatsapp && (
            <a
              href={`https://wa.me/${listing.contact_whatsapp.replace(/\D/g, "")}?text=Hi! I'm interested in your listing "${listing.title}" on W2W Marketplace`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white font-display font-bold text-sm"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          )}
          {listing.contact_email && (
            <a
              href={`mailto:${listing.contact_email}?subject=Interested in: ${listing.title}&body=Hi, I found your listing on W2W Marketplace and I'm interested!`}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground border border-border font-display font-bold text-sm"
            >
              <Mail size={16} />
              Email
            </a>
          )}
        </div>

        {/* Decay Timeline for waste_type */}
        {listing.waste_type && (
          <div className="mb-6">
            <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-3">
              Material Decay Info
            </h3>
            <DecayTimeline />
          </div>
        )}

        {/* Similar Listings */}
        {similar.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-3">
              Similar Listings
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {similar.map((s) => (
                <Link
                  key={s.id}
                  to={`/marketplace/${s.id}`}
                  className="flex-shrink-0 w-36 rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors"
                >
                  <div className="aspect-square bg-muted">
                    {s.images && s.images.length > 0 ? (
                      <img src={s.images[0]} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">♻️</div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-display font-bold text-foreground truncate">{s.title}</p>
                    <p className="text-xs font-data text-primary">{s.is_free ? "Free" : `₹${s.price}`}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceDetail;
