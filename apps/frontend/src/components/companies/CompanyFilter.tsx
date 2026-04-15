import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Filter, 
  Briefcase, 
  ChevronDown, 
  FileSpreadsheet,
  Link2,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/authstore";

export default function CompanyFilters({ 
  onChange, 
  onAdd, 
  onExport,      
  onConnect,
  isConnected,       
  lastSyncedAt       
}: any) {

  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user) as any;
  const isAdmin = user?.role === "ADMIN";

  const domains = [
    { value: "EDTECH", label: "EdTech" },
    { value: "FINTECH", label: "FinTech" },
    { value: "PREVIOUS_YEAR", label: "Previous Year" },
    { value: "BRAND_ACTIVATION", label: "Brand Activation" },
    { value: "MEDIA", label: "Media" },
    { value: "STATIONERY", label: "Stationery" },
    { value: "AI_TECH", label: "AI/Tech" },
    { value: "STARTUP", label: "Startup" },
    { value: "FITNESS", label: "Fitness" },
    { value: "GAMING", label: "Gaming" },
    { value: "FMCG", label: "FMCG" },
    { value: "AUDIO_MOBILE", label: "Audio/Mobile" },
    { value: "BANK", label: "Bank" },
    { value: "AUTOMOBILE_TRAVEL", label: "Automobile & Travel" },
    { value: "FASHION", label: "Fashion" },
    { value: "SKINCARE", label: "Skincare" },
    { value: "HEALTHCARE", label: "Healthcare" },
    { value: "WORKSHOP", label: "Workshop" },
    { value: "MISCELLANEOUS", label: "Miscellaneous" },
  ];

  const handleChange = (key: string, value: string) => {
    onChange((prev: any) => {
      const next = { ...prev };
      if (!value) delete next[key];
      else next[key] = value;
      return next;
    });
  };

  const handleExportClick = async () => {
    if (!isConnected) {
      return toast.error("Connect Google first");
    }

    try {
      setLoading(true);
      await onExport(); // This triggers the /google/sync endpoint in Companies.tsx
    } catch (err) {
      console.error(err);
      toast.error("Export to Google Sheets failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-5 mb-8 w-full">
      
      {/* LEFT SIDE: FILTERS */}
      <div className="flex flex-1 items-center flex-wrap gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            placeholder="Search companies, contacts..."
            onChange={(e) => handleChange("search", e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 transition-all font-medium text-slate-700"
          />
        </div>

        {/* Status */}
        <div className="relative group">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <select
            className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm shadow-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 transition-all font-medium text-slate-700"
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="NOT_CONTACTED">Not Contacted</option>
            <option value="CONTACTED">Contacted</option>
            <option value="IN_TALKS">In Talks</option>
            <option value="NEGOTIATING">Negotiating</option>
            <option value="POSITIVE">Positive</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Domain */}
        <div className="relative group">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <select
            className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm shadow-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 transition-all font-medium text-slate-700"
            onChange={(e) => handleChange("domain", e.target.value)}
          >
            <option value="">All Domains</option>
            {domains.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* RIGHT SIDE: ACTIONS & STATUS */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* Connection Status Pill (Admin Only) */}
        {isAdmin && (
          <div className="flex flex-col items-end mr-2 hidden sm:flex">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full shadow-sm">
              <div className="relative flex h-2.5 w-2.5">
                {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </div>
              <span className="text-xs font-semibold text-slate-700">
                {isConnected ? "Google Connected" : "Not Connected"}
              </span>
            </div>
            {lastSyncedAt && isConnected && (
              <span className="text-[10px] text-slate-400 mt-1 font-medium px-1">
                Last synced: {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric'})}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          
          {/* Google Sync Button (Admin Only) */}
          {isAdmin && (
            !isConnected ? (
              <Button 
                variant="outline"
                onClick={onConnect}
                className="flex-1 sm:flex-none bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold shadow-sm py-2.5"
              >
                <Link2 className="h-4 w-4 mr-2 shrink-0" /> Connect Google
              </Button>
            ) : (
              <Button 
                 variant="outline"
                 onClick={handleExportClick}
                 disabled={loading}
                 className="flex-1 sm:flex-none bg-white border-emerald-200 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 hover:border-emerald-300 font-semibold shadow-sm transition-colors py-2.5"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 shrink-0 animate-spin text-emerald-600" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 mr-2 shrink-0 text-emerald-600" />
                )}
                {loading ? "Syncing..." : "Sync Sheets"}
              </Button>
            )
          )}

          {/* Add Company */}
          <Button 
            onClick={onAdd}
            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-all py-2.5"
          >
            <Plus className="h-4 w-4 mr-2 shrink-0" />
            Add Company
          </Button>
        </div>

      </div>
    </div>
  );
}