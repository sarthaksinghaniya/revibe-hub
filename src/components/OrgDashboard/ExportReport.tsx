import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import type { MemberStat } from "./Leaderboard";

interface ExportReportProps {
  orgName: string;
  members: MemberStat[];
  totalScans: number;
  totalCo2: number;
}

const ExportReport = ({ orgName, members, totalScans, totalCo2 }: ExportReportProps) => {
  const [exporting, setExporting] = useState(false);

  const exportCSV = () => {
    setExporting(true);
    try {
      const headers = ["Rank", "Student Name", "Total Scans", "Carbon Credits", "CO₂ Saved (kg)"];
      const rows = members.map((m, i) => [
        i + 1,
        m.display_name,
        m.total_scans,
        m.total_credits,
        m.total_co2.toFixed(2),
      ]);

      // Add summary rows
      rows.push([]);
      rows.push(["Summary"]);
      rows.push(["Total Students", members.length]);
      rows.push(["Total Scans", totalScans]);
      rows.push(["Total CO₂ Saved (kg)", totalCo2]);
      rows.push(["Report Date", new Date().toLocaleDateString()]);

      const csvContent = [headers, ...rows]
        .map((row) => (row as any[]).map((cell) => `"${cell ?? ""}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${orgName.replace(/\s+/g, "_")}_report_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded!");
    } catch {
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={exportCSV}
      disabled={exporting}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground border border-border font-display font-bold text-xs hover:bg-secondary/80 transition-colors disabled:opacity-50"
    >
      <Download size={14} />
      {exporting ? "Exporting..." : "Export Report"}
    </button>
  );
};

export default ExportReport;
