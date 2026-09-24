import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, Plus, Heart, Leaf, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import SmartKioskSection from "@/components/SmartKioskSection";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  is_free: boolean;
  category: string;
  waste_type: string | null;
  images: string[] | null;
  location_city: string | null;
  location_state: string | null;
  status: string;
  views: number;
  created_at: string;
  user_id: string;
}

const categories = ["All", "Electronics", "Furniture", "Decor", "Clothing", "Other"];
const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
];

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const Marketplace = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [freeOnly, setFreeOnly] = useState(false);
  const [sort, setSort] = useState("newest");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [totalActive, setTotalActive] = useState(0);

  useEffect(() => {
    fetchListings();
    if (user) fetchSaved();
  }, [category, freeOnly, sort, search, user]);

  const fetchListings = async () => {
    setLoading(true);
    let query = supabase.from("listings").select("*").eq("status", "active");

    if (category !== "All") query = query.eq("category", category);
    if (freeOnly) query = query.eq("is_free", true);
    if (search.trim()) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

    if (sort === "price_asc") query = query.order("price", { ascending: true });
    else if (sort === "price_desc") query = query.order("price", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (!error && data) {
      setListings(data as Listing[]);
      if (category === "All" && !freeOnly && !search.trim()) setTotalActive(data.length);
    }
    setLoading(false);
  };

  const fetchSaved = async () => {
    const { data } = await supabase.from("saved_listings").select("listing_id").eq("user_id", user!.id);
    if (data) setSavedIds(new Set(data.map((s) => s.listing_id)));
  };

  const toggleSave = async (listingId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (savedIds.has(listingId)) {
      await supabase.from("saved_listings").delete().eq("user_id", user.id).eq("listing_id", listingId);
      setSavedIds((prev) => { const n = new Set(prev); n.delete(listingId); return n; });
    } else {
      await supabase.from("saved_listings").insert({ user_id: user.id, listing_id: listingId });
      setSavedIds((prev) => new Set(prev).add(listingId));
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28 pt-6 lg:pt-24 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Upcycle Marketplace</h1>
        <p className="text-sm text-muted-foreground mt-1">Buy, sell, or give away upcycled treasures</p>
      </div>

      {/* Banner */}
      {totalActive > 0 && (
        <motion.div
          className="flex items-center gap-2 p-3 rounded-xl bg-primary/8 border border-primary/15 mb-5"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Leaf size={16} className="text-primary flex-shrink-0" />
          <span className="text-xs text-foreground/80">
            <strong className="text-primary">{totalActive}</strong> items saved from landfill and listed here
          </span>
        </motion.div>
      )}

      {/* Search & Filters */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-colors ${
                category === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
          <button
            onClick={() => setFreeOnly(!freeOnly)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-display font-semibold border transition-colors ${
              freeOnly
                ? "bg-[#E1F5EE] text-[#085041] border-[#085041]/20"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Free Only
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-xs font-data bg-transparent text-muted-foreground focus:outline-none"
          >
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm mb-4">No listings yet. Be the first!</p>
          <Link
            to="/marketplace/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm"
          >
            <Plus size={16} />
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/marketplace/${listing.id}`}
                className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-muted">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-3xl">
                      ♻️
                    </div>
                  )}

                  {/* Free badge */}
                  {listing.is_free && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-display font-bold bg-[#E1F5EE] text-[#085041]">
                      FREE
                    </span>
                  )}

                  {/* Save button */}
                  {user && (
                    <button
                      onClick={(e) => toggleSave(listing.id, e)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center transition-colors hover:bg-card"
                    >
                      <Heart
                        size={14}
                        className={savedIds.has(listing.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}
                      />
                    </button>
                  )}

                  {/* Category tag */}
                  {listing.waste_type && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-data bg-primary/15 text-primary backdrop-blur">
                      {listing.waste_type}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="text-sm font-display font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {listing.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-sm font-data font-bold text-primary">
                      {listing.is_free ? "Free" : `₹${listing.price}`}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-data text-muted-foreground">
                      <Clock size={10} />
                      {timeAgo(listing.created_at)}
                    </div>
                  </div>
                  {listing.location_city && (
                    <p className="text-[10px] font-data text-muted-foreground mt-1 truncate">
                      📍 {listing.location_city}{listing.location_state ? `, ${listing.location_state}` : ""}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* HARDWARE KIOSK BUY / INSTALL SECTION IN MARKETPLACE */}
      <div className="mt-16 border-t border-border pt-10">
        <SmartKioskSection
          title="Buy / Install W2W Smart AI Waste Kiosk"
          subtitle="Empower your organization with enterprise hardware terminals. Order hardware units or subscribe with flexible Rupee (₹) pricing."
        />
      </div>

      {/* FAB */}
      {user && (
        <Link
          to="/marketplace/new"
          className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus size={24} />
        </Link>
      )}
    </div>
  );
};

export default Marketplace;
