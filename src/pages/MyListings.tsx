import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Eye, Edit, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface Listing {
  id: string;
  title: string;
  price: number;
  is_free: boolean;
  category: string;
  images: string[] | null;
  status: string;
  views: number;
  created_at: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  sold: "bg-muted text-muted-foreground",
  removed: "bg-destructive/10 text-destructive",
};

const MyListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchListings();
  }, [user]);

  const fetchListings = async () => {
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (data) setListings(data as Listing[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("listings").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    toast.success(`Listing marked as ${status}`);
  };

  const deleteListing = async (id: string) => {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setListings((prev) => prev.filter((l) => l.id !== id));
    toast.success("Listing deleted");
  };

  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
  const activeCount = listings.filter((l) => l.status === "active").length;

  return (
    <div className="min-h-screen bg-background pb-28 pt-6 lg:pt-24 px-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">My Listings</h1>
        <Link
          to="/marketplace/new"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-display font-bold"
        >
          <Plus size={14} />
          New
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total", value: listings.length },
          { label: "Active", value: activeCount },
          { label: "Views", value: totalViews },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-xl bg-card border border-border text-center">
            <p className="text-lg font-data font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] font-data text-muted-foreground uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm mb-4">You haven't listed anything yet</p>
          <Link
            to="/marketplace/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm"
          >
            <Plus size={16} />
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-3 p-3 rounded-xl bg-card border border-border"
            >
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-muted overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                  <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">♻️</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link to={`/marketplace/${listing.id}`} className="text-sm font-display font-bold text-foreground truncate block hover:text-primary transition-colors">
                  {listing.title}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-data font-bold ${statusStyles[listing.status]}`}>
                    {listing.status}
                  </span>
                  <span className="text-xs font-data text-primary">{listing.is_free ? "Free" : `₹${listing.price}`}</span>
                  <span className="flex items-center gap-0.5 text-[10px] font-data text-muted-foreground">
                    <Eye size={10} /> {listing.views}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                {listing.status === "active" && (
                  <button
                    onClick={() => updateStatus(listing.id, "sold")}
                    className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                    title="Mark Sold"
                  >
                    <CheckCircle size={14} />
                  </button>
                )}
                <button
                  onClick={() => deleteListing(listing.id)}
                  className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
