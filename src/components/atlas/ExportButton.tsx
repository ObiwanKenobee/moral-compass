import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";

interface Props {
  targetRef: React.RefObject<HTMLElement>;
}

const ExportButton = ({ targetRef }: Props) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!targetRef.current || exporting) return;
    setExporting(true);

    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: "#1a1a1a",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `atlas-ethical-analysis-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={exporting}
      className="h-8 text-xs font-mono gap-1.5 border-border"
    >
      {exporting ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Download className="w-3 h-3" />
      )}
      {exporting ? "Exporting…" : "Export PNG"}
    </Button>
  );
};

export default ExportButton;
