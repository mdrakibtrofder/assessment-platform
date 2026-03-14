import { FileText, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onReset: () => void;
  onExport: () => void;
  isExportEnabled?: boolean;
}

const Header = ({ onReset, onExport, isExportEnabled }: HeaderProps) => {
  return (
    <header className="bg-card border-b-2 border-header-border px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent-foreground flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-display font-bold text-foreground">Assessment Platform</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <Button
          variant="outline"
          className="gap-1.5"
          onClick={onExport}
          disabled={!isExportEnabled}
        >
          <Download className="w-4 h-4" />
          PDF
        </Button>
      </div>
    </header>
  );
};

export default Header;
