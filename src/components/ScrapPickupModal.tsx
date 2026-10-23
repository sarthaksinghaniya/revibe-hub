import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Scale,
  Calendar,
  CheckCircle2,
  X,
  Phone,
  MapPin,
  TrendingUp,
  Sparkles,
  IndianRupee,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ScrapItem {
  id: string;
  name: string;
  ratePerKg: number;
  category: "Paper" | "Plastic" | "Metal" | "E-Waste";
  co2SavedPerKg: number;
}

export const SCRAP_RATES: ScrapItem[] = [
  { id: "s1", name: "Cardboard / Carton (गत्ता)", ratePerKg: 10, category: "Paper", co2SavedPerKg: 1.1 },
  { id: "s2", name: "Old Newspaper (रद्दी अख़बार)", ratePerKg: 15, category: "Paper", co2SavedPerKg: 1.3 },
  { id: "s3", name: "PET Plastic Bottles (पानी/कोल्डड्रिंक बोतलें)", ratePerKg: 18, category: "Plastic", co2SavedPerKg: 2.1 },
  { id: "s4", name: "HDPE Hard Plastic (डब्बे/कंटेनर)", ratePerKg: 22, category: "Plastic", co2SavedPerKg: 1.8 },
  { id: "s5", name: "Scrap Iron / Steel (लोहा)", ratePerKg: 28, category: "Metal", co2SavedPerKg: 1.5 },
  { id: "s6", name: "Aluminium Cans & Utensils (एल्युमिनियम)", ratePerKg: 115, category: "Metal", co2SavedPerKg: 9.0 },
  { id: "s7", name: "Copper Wire / Scrap (तांबा)", ratePerKg: 490, category: "Metal", co2SavedPerKg: 3.8 },
  { id: "s8", name: "Brass Items (पीतल)", ratePerKg: 330, category: "Metal", co2SavedPerKg: 3.2 },
  { id: "s9", name: "Old Electronics / E-Waste (ई-कचरा)", ratePerKg: 50, category: "E-Waste", co2SavedPerKg: 3.5 },
];

interface ScrapPickupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMaterial?: string;
}

export const ScrapPickupModal = ({
  open,
  onOpenChange,
  defaultMaterial = "",
}: ScrapPickupModalProps) => {
  const [selectedTab, setSelectedTab] = useState<"rates" | "book">("rates");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: "",
    pickupDate: "",
    estimatedKg: 15,
    selectedScrapId: SCRAP_RATES[0].id,
  });
  const [isBooked, setIsBooked] = useState(false);

  const filteredRates = SCRAP_RATES.filter(
    (item) => selectedCategory === "All" || item.category === selectedCategory
  );

  const selectedItem =
    SCRAP_RATES.find((item) => item.id === formData.selectedScrapId) || SCRAP_RATES[0];
  const estimatedEarnings = selectedItem.ratePerKg * formData.estimatedKg;
  const estimatedCo2Saved = Math.round(selectedItem.co2SavedPerKg * formData.estimatedKg * 10) / 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error("Please fill in your name, contact phone, and pickup address");
      return;
    }

    setIsBooked(true);
    toast.success("🚚 Doorstep pickup request confirmed! Our collector will call you.");
  };

  const handleReset = () => {
    setIsBooked(false);
    setSelectedTab("rates");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95%] rounded-3xl bg-card border-border p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left pb-2 border-b border-border/60">
          <DialogTitle className="text-lg font-display font-bold flex items-center gap-2">
            <Truck className="text-primary" size={20} />
            <span>Kabadiwala Doorstep Scrap Pickup</span>
          </DialogTitle>
          <p className="text-xs text-muted-foreground font-body">
            Get instant doorstep recycling pickup with verified market scrap rates.
          </p>
        </DialogHeader>

        {isBooked ? (
          <div className="py-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-bounce">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-foreground">
                Pickup Scheduled Successfully!
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto font-body">
                Our local verified recycling partner will contact you at{" "}
                <strong className="text-foreground">{formData.phone}</strong> before arrival.
              </p>
            </div>

            <div className="w-full p-4 rounded-2xl bg-surface-alt border border-border/80 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Estimated Payout:</span>
                <span className="font-bold text-primary font-data">₹{estimatedEarnings}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">CO₂ Diverted:</span>
                <span className="font-bold text-emerald-400 font-data">~{estimatedCo2Saved} kg</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Address:</span>
                <span className="text-foreground truncate max-w-[200px]">{formData.address}</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Tabs */}
            <div className="flex rounded-xl bg-muted p-1">
              <button
                type="button"
                onClick={() => setSelectedTab("rates")}
                className={`flex-1 py-1.5 text-xs font-display font-semibold rounded-lg transition-colors ${
                  selectedTab === "rates"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Live Rate Card (दाम)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab("book")}
                className={`flex-1 py-1.5 text-xs font-display font-semibold rounded-lg transition-colors ${
                  selectedTab === "book"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Schedule Pickup (पिकअप)
              </button>
            </div>

            {selectedTab === "rates" ? (
              <div className="space-y-3">
                {/* Category filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {["All", "Paper", "Plastic", "Metal", "E-Waste"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-[11px] font-data whitespace-nowrap border transition-all ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-surface-alt border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Rates list */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {filteredRates.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-surface-alt border border-border flex items-center justify-between hover:border-primary/40 transition-colors"
                    >
                      <div>
                        <p className="text-xs font-display font-bold text-foreground">
                          {item.name}
                        </p>
                        <span className="text-[10px] font-data text-emerald-400">
                          Saves ~{item.co2SavedPerKg} kg CO₂ / kg
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-data font-bold text-primary flex items-center justify-end">
                          <IndianRupee size={13} />
                          {item.ratePerKg}
                          <span className="text-[10px] text-muted-foreground font-normal">/kg</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTab("book")}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  <Truck size={14} />
                  Book Doorstep Scrap Collection
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-display font-semibold text-muted-foreground block mb-1">
                    Primary Scrap Material
                  </label>
                  <select
                    value={formData.selectedScrapId}
                    onChange={(e) => setFormData({ ...formData, selectedScrapId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-alt border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    {SCRAP_RATES.map((rate) => (
                      <option key={rate.id} value={rate.id}>
                        {rate.name} — ₹{rate.ratePerKg}/kg
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-display font-semibold text-muted-foreground">
                      Approximate Weight (किलो)
                    </label>
                    <span className="text-xs font-data font-bold text-primary">
                      {formData.estimatedKg} kg
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={formData.estimatedKg}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedKg: Number(e.target.value) })
                    }
                    className="w-full accent-primary h-1.5 bg-muted rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-data mt-1">
                    <span>Est. Payout: ~₹{estimatedEarnings}</span>
                    <span>CO₂ Saved: ~{estimatedCo2Saved} kg</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-display font-semibold text-muted-foreground block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2 rounded-xl bg-surface-alt border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-display font-semibold text-muted-foreground block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2 rounded-xl bg-surface-alt border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-display font-semibold text-muted-foreground block mb-1">
                    Pickup Address & Landmark
                  </label>
                  <textarea
                    rows={2}
                    placeholder="House/Flat No., Street, Area, City"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2 rounded-xl bg-surface-alt border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  <CheckCircle2 size={14} />
                  Confirm Pickup Booking
                </button>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
