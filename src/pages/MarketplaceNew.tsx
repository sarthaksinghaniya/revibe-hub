import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, X, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const categoryOptions = ["Electronics", "Furniture", "Decor", "Clothing", "Other"];

const MarketplaceNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillWaste = searchParams.get("waste_type") || "";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [category, setCategory] = useState("Other");
  const [wasteType, setWasteType] = useState(prefillWaste);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [suggestingTitle, setSuggestingTitle] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 4 - images.length;
    const newFiles = files.slice(0, remaining);
    setImages((prev) => [...prev, ...newFiles]);
    newFiles.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setImagePreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const suggestTitle = async () => {
    if (!wasteType) {
      toast.error("Enter a waste type first to get title suggestions");
      return;
    }
    setSuggestingTitle(true);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-listing-title", {
        body: { waste_type: wasteType },
      });
      if (error) throw error;
      if (data?.title) setTitle(data.title);
    } catch {
      // Fallback suggestions
      const suggestions = [
        `Upcycled ${wasteType} Art Piece`,
        `Handcrafted ${wasteType} Organizer`,
        `Creative ${wasteType} Planter`,
        `Repurposed ${wasteType} Decor`,
      ];
      setTitle(suggestions[Math.floor(Math.random() * suggestions.length)]);
    } finally {
      setSuggestingTitle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) { toast.error("Title is required"); return; }

    setSubmitting(true);
    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const file of images) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("listing-images").upload(path, file);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }

      const { data, error } = await supabase.from("listings").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        price: isFree ? 0 : parseFloat(price) || 0,
        is_free: isFree,
        category,
        waste_type: wasteType.trim() || null,
        images: imageUrls.length > 0 ? imageUrls : null,
        location_city: city.trim() || null,
        location_state: state.trim() || null,
        contact_whatsapp: whatsapp.trim() || null,
        contact_email: email.trim() || null,
      }).select("id").single();

      if (error) throw error;
      toast.success("Listing created!");
      navigate(`/marketplace/${data.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28 pt-6 lg:pt-24 px-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Create Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Images */}
        <div>
          <label className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-2 block">
            Photos ({images.length}/4)
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-border">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            {images.length < 4 && (
              <label className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
                <Upload size={16} className="text-muted-foreground" />
                <span className="text-[9px] font-data text-muted-foreground mt-1">Add</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageAdd} />
              </label>
            )}
          </div>
        </div>

        {/* Waste type + AI title */}
        <div>
          <label className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-2 block">
            Waste Material
          </label>
          <input
            value={wasteType}
            onChange={(e) => setWasteType(e.target.value)}
            placeholder="e.g. Plastic bottle, Old t-shirt"
            className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-2 block">
            Title
          </label>
          <div className="flex gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you listing?"
              className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
            <button
              type="button"
              onClick={suggestTitle}
              disabled={suggestingTitle}
              className="flex-shrink-0 px-3 py-2.5 rounded-xl bg-category-upcycle/15 text-category-upcycle border border-category-upcycle/20 text-xs font-display font-bold hover:bg-category-upcycle/25 transition-colors disabled:opacity-50"
            >
              {suggestingTitle ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-2 block">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe your upcycled item..."
            className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        {/* Price */}
        <div>
          <label className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-2 block">
            Price
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={isFree ? "" : price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isFree}
              placeholder="₹0"
              className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-xs font-display font-semibold text-foreground">Free</span>
            </label>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-2 block">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-2 block">
              City
            </label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Lucknow"
              className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-2 block">
              State
            </label>
            <input
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. UP"
              className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-2 block">
              WhatsApp
            </label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+91..."
              className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-2 block">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
          {submitting ? "Creating..." : "Create Listing"}
        </motion.button>
      </form>
    </div>
  );
};

export default MarketplaceNew;
