import { useState, useEffect } from "react";
import { 
  Building2, UserCircle, Globe, Phone, 
  IndianRupee, Building, Loader2, ChevronDown, 
  Notebook, AlertCircle, Sparkles, CheckCircle2,
  Hash, Info
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCompanies } from "../../hooks/useCompany";
import { useDuplicateCheck } from "../../hooks/useDuplicateCheck";
import { cn } from "@/lib/utils";

// Custom LinkedIn SVG Component for SaaS-level branding
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
  </svg>
);

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
      force: forceCreate 
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
      <DialogContent className="sm:max-w-[620px] p-0 gap-0 border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] bg-white rounded-[3rem] overflow-hidden">
        
        {/* SaaS Header: Premium Aesthetic */}
        <DialogHeader className="relative px-12 pt-12 pb-10 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Building2 className="h-32 w-32 rotate-12" />
          </div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl transition-transform hover:scale-110 active:scale-95 duration-500">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-3xl font-black tracking-tight">Add New Partner</DialogTitle>
              <DialogDescription className="text-indigo-100 font-medium text-base">
                Capture new opportunities for your workspace.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-12 py-10 space-y-10 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50/30">
          
          {/* Section: Core Identity */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2 w-10 bg-indigo-600 rounded-full" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Core Identity</span>
              </div>
              <Info className="h-4 w-4 text-slate-300" />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Official Company Name *</label>
              <div className="relative group">
                <Building className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={cn(
                    "w-full pl-14 pr-14 h-16 text-base font-bold bg-white border-2 border-slate-100 rounded-3xl transition-all shadow-sm focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600",
                    errors.name && "border-red-500/50 bg-red-50/30 focus:ring-red-500/5"
                  )}
                  placeholder="e.g. Microsoft Corporation"
                />
                {isChecking && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 h-6 w-6 animate-spin text-indigo-600" />}
              </div>

              {suggestions.length > 0 && (
                <div className="mt-3 p-5 bg-amber-50/50 border-2 border-amber-100 rounded-3xl animate-in zoom-in-95 duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <span className="text-xs font-black uppercase text-amber-800 tracking-tight">Possible Duplicates Found</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <div key={s} className="px-4 py-1.5 bg-white border border-amber-200/50 text-xs font-bold text-slate-600 rounded-2xl shadow-sm">
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Contact Lead *</label>
                    <div className="relative group">
                        <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            value={form.contactName}
                            onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                            className="w-full pl-14 h-16 text-base font-bold bg-white border-2 border-slate-100 rounded-3xl focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-sm"
                            placeholder="Primary Name"
                        />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Sector *</label>
                    <div className="relative group">
                        <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <select
                            value={form.domain}
                            onChange={(e) => setForm({ ...form, domain: e.target.value })}
                            className="w-full pl-14 pr-12 h-16 text-base font-bold bg-white border-2 border-slate-100 rounded-3xl focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all appearance-none shadow-sm"
                        >
                            <option value="">Choose Industry</option>
                            {domains.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>
          </div>

          {/* Section: Communication */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-2 w-10 bg-slate-200 rounded-full" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Communication</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Mobile / Desk</label>
                    <div className="relative group">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            value={form.phoneNumber}
                            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                            className="w-full pl-14 h-16 text-base font-bold bg-white border-2 border-slate-100 rounded-3xl focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-sm"
                            placeholder="+XX XXXXX XXXXX"
                        />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Professional URL</label>
                    <div className="relative group">
                        <LinkedInIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            value={form.linkedinUrl}
                            onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                            className="w-full pl-14 h-16 text-base font-bold bg-white border-2 border-slate-100 rounded-3xl focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-sm"
                            placeholder="linkedin.com/..."
                        />
                    </div>
                </div>
            </div>
          </div>

          {/* Section: Deal Intelligence */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-2 w-10 bg-slate-200 rounded-full" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Deal Intelligence</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Target Amount</label>
                <div className="relative group">
                  <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full pl-14 h-16 text-base font-bold bg-white border-2 border-slate-100 rounded-3xl focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 shadow-sm"
                    placeholder="Planned Ask"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Payment Strategy</label>
                <div className="relative group">
                    <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="w-full px-6 h-16 text-base font-bold bg-white border-2 border-slate-100 rounded-3xl focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all appearance-none shadow-sm"
                    >
                        <option value="CASH">Cash Transfer</option>
                        <option value="IN_KIND">In-Kind (Barter)</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Strategic Summary</label>
              <div className="relative group">
                <Notebook className="absolute left-5 top-6 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full pl-14 pr-6 py-6 min-h-[140px] text-base font-bold bg-white border-2 border-slate-100 rounded-[2.5rem] focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all resize-none shadow-sm"
                  placeholder="What is the potential of this partnership?..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer: High-Friction Confirms */}
        <DialogFooter className="px-12 py-10 bg-white border-t border-slate-100 flex items-center justify-between gap-6">
          <button 
            onClick={onClose} 
            className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all active:scale-90"
          >
            Discard
          </button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting} 
            className={cn(
              "h-16 px-12 rounded-[2rem] font-black text-lg transition-all active:scale-95 shadow-[0_20px_40px_-12px_rgba(79,70,229,0.3)]",
              forceCreate 
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : forceCreate ? (
              "Bypass & Create"
            ) : (
              <span className="flex items-center gap-3">Finalize Partner <CheckCircle2 className="h-5 w-5" /></span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}