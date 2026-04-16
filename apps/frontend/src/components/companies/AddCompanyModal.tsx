import { useState, useEffect } from "react";
import { 
  Building2, UserCircle, Globe, Link, Phone, 
  IndianRupee, Building, Loader2, ChevronDown, 
  Notebook, AlertCircle, Sparkles, CheckCircle2 
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCompanies } from "../../hooks/useCompany";
import { useDuplicateCheck } from "../../hooks/useDuplicateCheck"; // Custom hook we discussed
import { cn } from "@/lib/utils";

const domains = [
  { value: "EDTECH", label: "EdTech" },
  { value: "FINTECH", label: "FinTech" },
  { value: "AI_TECH", label: "AI/Tech" },
  { value: "STARTUP", label: "Startup" },
  { value: "MEDIA", label: "Media" },
  { value: "FMCG", label: "FMCG" },
  { value: "GAMING", label: "Gaming" },
  { value: "FITNESS", label: "Fitness" },
  { value: "FASHION", label: "Fashion" },
  { value: "SKINCARE", label: "Skincare" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "BANK", label: "Bank" },
  { value: "AUTOMOBILE_TRAVEL", label: "Automobile & Travel" },
  { value: "MISCELLANEOUS", label: "Miscellaneous" },
];

export default function AddCompanyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createCompany } = useCompanies();
  
  const initialFormState = {
    name: "",
    contactName: "",
    domain: "",
    linkedinUrl: "",
    phoneNumber: "",
    amount: "",
    type: "CASH",
    note: "",
  };

  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forceCreate, setForceCreate] = useState(false);

  // Ghost Search Logic
  const { suggestions, isChecking } = useDuplicateCheck(form.name);

  useEffect(() => {
    if (open) {
      setForm(initialFormState);
      setErrors({});
      setForceCreate(false);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = () => {
    const newErrors: any = {};
    if (!form.name.trim()) newErrors.name = true;
    if (!form.contactName.trim()) newErrors.contactName = true;
    if (!form.domain.trim()) newErrors.domain = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      contactName: form.contactName.trim(),
      amount: form.amount ? Number(form.amount) : undefined,
      force: forceCreate // Pass force flag to backend
    };

    setIsSubmitting(true);
    createCompany(payload, {
      onSuccess: () => {
        setIsSubmitting(false);
        onClose();
      },
      onError: (err: any) => {
        setIsSubmitting(false);
        if (err.response?.status === 409) setForceCreate(true);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden">
        
        {/* SaaS Header with Gradient Backdrop */}
        <DialogHeader className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-slate-50 to-indigo-50/30 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 rotate-3 group-hover:rotate-0 transition-transform">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">New Pipeline Entry</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Add a high-potential lead to your organization.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-8 py-6 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
          
          {/* Section: Basic Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-8 bg-indigo-600 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company Identity</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Company Name *</label>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={cn(
                    "w-full pl-11 pr-12 h-12 text-sm font-bold bg-slate-50 border-transparent rounded-2xl transition-all focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500",
                    errors.name && "border-red-500 bg-red-50 focus:ring-red-500/10"
                  )}
                  placeholder="e.g. Google Cloud"
                />
                {isChecking && <Loader2 className="absolute right-4 top-3.5 h-5 w-5 animate-spin text-indigo-500" />}
              </div>

              {/* GHOST SEARCH ALERT */}
              {suggestions.length > 0 && (
                <div className="mt-2 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-tight">Similar records detected</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <span key={s} className="px-3 py-1 bg-white border border-amber-200 text-[11px] font-bold text-slate-600 rounded-lg shadow-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Contact Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Contact Lead *</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  className="w-full pl-11 h-12 text-sm font-bold bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  placeholder="POC Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Domain *</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                  className="w-full pl-11 pr-10 h-12 text-sm font-bold bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none"
                >
                  <option value="">Select Sector</option>
                  {domains.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Section: Financials & Notes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-8 bg-slate-200 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deal Specifics</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Amount</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full pl-11 h-12 text-sm font-bold bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                    placeholder="50,000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Deal Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 h-12 text-sm font-bold bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none"
                >
                  <option value="CASH">Cash Funding</option>
                  <option value="IN_KIND">In-Kind (Product)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Contextual Note</label>
              <div className="relative">
                <Notebook className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full pl-11 pr-4 py-4 min-h-[100px] text-sm font-bold bg-slate-50 border-transparent rounded-3xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                  placeholder="Write a brief strategy note..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <DialogFooter className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-4">
          <button 
            onClick={onClose} 
            className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            Discard
          </button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting} 
            className={cn(
              "h-12 px-8 rounded-2xl font-black transition-all active:scale-95 shadow-xl",
              forceCreate 
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : forceCreate ? (
              "Create Anyway"
            ) : (
              <>Create Company <CheckCircle2 className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}