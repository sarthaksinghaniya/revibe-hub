import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Printer, Download, Check, Copy, School, Building2, ShieldCheck, X, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { computeEsgMetrics, type CertificateType } from "@/lib/esgCertificate";
import type { MemberStat } from "./Leaderboard";

interface EsgCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgName: string;
  totalScans: number;
  totalCo2: number;
  memberCount: number;
  members?: MemberStat[];
}

export const EsgCertificateModal = ({
  isOpen,
  onClose,
  orgName,
  totalScans,
  totalCo2,
  memberCount,
  members = [],
}: EsgCertificateModalProps) => {
  const [certType, setCertType] = useState<CertificateType>("naac_green_audit");
  const [copied, setCopied] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const metrics = computeEsgMetrics(totalScans, totalCo2, memberCount, orgName, certType);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(metrics.certificateId);
    setCopied(true);
    toast.success("Certificate Verification ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAuditCSV = () => {
    try {
      const headers = ["Metric", "Value", "Unit", "Regulatory Standard"];
      const rows = [
        ["Organization Name", orgName, "", ""],
        ["Certificate Identifier", metrics.certificateId, "", metrics.complianceStandard],
        ["Certification Type", certType === "naac_green_audit" ? "NAAC Criterion 7.1.3" : "Corporate BRSR Scope 3", "", ""],
        ["Total Active Eco-Auditors", metrics.totalMembers, "Members", "Institutional Engagement"],
        ["Total Waste Items Scanned", metrics.totalScans, "Items", "Autonomous AI / Barcode Verification"],
        ["Total Solid Waste Diverted", metrics.totalWasteDivertedKg, "kg", "MoEFCC SWM Rules 2016"],
        ["Net Avoided GHG Emissions", metrics.co2AvoidedKg, "kg CO₂e", "IPCC AR6 Baseline"],
        ["Equivalent Mature Trees Conserved", metrics.treesEquivalent, "Trees (Neem/Peepal)", "ICFRE Standard (21.77 kg/tree/yr)"],
        ["Freshwater Footprint Conserved", metrics.waterSavedLiters, "Liters", "LCA Virgin vs Recycled Ratio"],
        ["Landfill Airspace Conserved", metrics.landfillVolumeSavedM3, "m³", "Compacted MSW Density (450 kg/m³)"],
        ["Issue Date", metrics.issueDate, "", ""],
        ["Valid Until", metrics.expiryDate, "", ""],
      ];

      const csvContent = [headers, ...rows]
        .map((row) => (row as any[]).map((cell) => `"${cell ?? ""}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${orgName.replace(/\s+/g, "_")}_${certType}_Audit_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Statutory Audit Ledger downloaded!");
    } catch {
      toast.error("Failed to export audit CSV");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden my-8"
        >
          {/* Modal Header */}
          <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between bg-muted/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                <Award size={22} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-display font-bold text-foreground">
                  Official Environmental Impact Certificate
                </h2>
                <p className="text-xs text-muted-foreground font-data">
                  Accredited Green Audit for NAAC & Corporate BRSR ESG
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="p-4 sm:px-6 bg-muted/20 border-b border-border flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCertType("naac_green_audit")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  certType === "naac_green_audit"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <School size={14} />
                <span>NAAC Green Audit (Criterion 7.1.3)</span>
              </button>

              <button
                type="button"
                onClick={() => setCertType("corporate_esg_brsr")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  certType === "corporate_esg_brsr"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 size={14} />
                <span>Corporate BRSR (Scope 3 ESG)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-colors"
              >
                <Printer size={14} />
                <span>Print / Save PDF</span>
              </button>
              <button
                type="button"
                onClick={downloadAuditCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-colors"
              >
                <Download size={14} />
                <span>Audit CSV</span>
              </button>
            </div>
          </div>

          {/* Printable Certificate Canvas */}
          <div className="p-4 sm:p-8 max-h-[70vh] overflow-y-auto">
            <div
              ref={printAreaRef}
              id="w2w-printable-certificate"
              className="relative p-6 sm:p-10 rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border-4 border-double border-primary/40 shadow-inner text-center select-none"
            >
              {/* Decorative Corner Ornaments */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-primary/60" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-primary/60" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-primary/60" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-primary/60" />

              {/* Watermark Logo / Shield */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <ShieldCheck size={380} className="text-primary" />
              </div>

              {/* Certificate Header */}
              <div className="space-y-2 mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-widest">
                  <Sparkles size={12} />
                  <span>Waste-to-Worth Autonomous Environmental Life-Cycle Audit</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-wide uppercase pt-2">
                  Certificate of Environmental Impact
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-serif italic">
                  {certType === "naac_green_audit"
                    ? "Accreditation Compliance — NAAC Criterion 7.1.3 Green Campus Mandate"
                    : "Corporate Sustainability Verification — SEBI BRSR Core Principle 6 (Scope 3)"}
                </p>
              </div>

              {/* Recipient */}
              <div className="my-6 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                  This official credential is proudly conferred to
                </p>
                <div className="py-2">
                  <span className="text-2xl sm:text-4xl font-serif font-extrabold text-primary underline decoration-primary/30 underline-offset-8">
                    {orgName || "Institutional Partner"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/80 max-w-xl mx-auto pt-2 leading-relaxed font-sans">
                  for outstanding commitment to circular waste diversion, real-time lifecycle carbon mitigation, and institutional stewardship verified under MoEFCC guidelines.
                </p>
              </div>

              {/* Verified Impact Metrics Grid */}
              <div className="my-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-3 sm:p-4 rounded-xl bg-background/80 border border-border shadow-sm">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                    Waste Diverted
                  </span>
                  <span className="text-lg sm:text-2xl font-bold font-display text-foreground">
                    {metrics.totalWasteDivertedKg.toLocaleString()} <span className="text-xs text-muted-foreground">kg</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block pt-0.5">
                    100% Landfill Diverted
                  </span>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-background/80 border border-border shadow-sm">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                    Avoided Carbon
                  </span>
                  <span className="text-lg sm:text-2xl font-bold font-display text-primary">
                    {metrics.co2AvoidedKg.toLocaleString()} <span className="text-xs text-muted-foreground">kg CO₂e</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground block pt-0.5">
                    IPCC AR6 Factor
                  </span>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-background/80 border border-border shadow-sm">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                    Tree Equivalent
                  </span>
                  <span className="text-lg sm:text-2xl font-bold font-display text-foreground">
                    {metrics.treesEquivalent} <span className="text-xs text-muted-foreground">Trees</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block pt-0.5">
                    Neem / Peepal Abs.
                  </span>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-background/80 border border-border shadow-sm">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                    Water Conserved
                  </span>
                  <span className="text-lg sm:text-2xl font-bold font-display text-foreground">
                    {metrics.waterSavedLiters.toLocaleString()} <span className="text-xs text-muted-foreground">L</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground block pt-0.5">
                    Recycled Pulp Ratio
                  </span>
                </div>
              </div>

              {/* Regulatory Citation Box */}
              <div className="my-6 p-3 rounded-xl bg-secondary/40 border border-border/80 text-left text-xs font-mono text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <ShieldCheck size={14} className="text-primary" />
                  <span>Statutory Compliance Declaration</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {metrics.complianceStandard}. Verified via Waste-to-Worth (W2W) continuous algorithmic telemetry.
                </p>
              </div>

              {/* Certificate Footer / Signatories */}
              <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-bold">Certificate ID:</span>
                    <span className="text-primary font-bold">{metrics.certificateId}</span>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="p-1 hover:text-foreground text-muted-foreground transition-colors"
                      title="Copy ID"
                    >
                      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Issued: {metrics.issueDate} • Valid Until: {metrics.expiryDate}
                  </p>
                </div>

                {/* Digital Verification Stamp */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full border-2 border-primary/60 p-1 flex items-center justify-center text-center shadow-md bg-primary/5">
                    <span className="text-[8px] font-bold text-primary uppercase leading-tight tracking-tighter">
                      ★ W2W ★<br />VERIFIED<br />AUDIT
                    </span>
                  </div>
                  <div className="text-left text-[11px]">
                    <p className="font-bold text-foreground font-serif">Algorithmic Auditor</p>
                    <p className="text-muted-foreground">W2W LCA Verification Core</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
