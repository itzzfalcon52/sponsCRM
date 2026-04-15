import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCompanies } from "../../hooks/useCompany";
import { useState, useEffect } from "react";
import { Building2, UserCircle, Globe, Link, Phone, IndianRupee, Building, Loader2, ChevronDown,Notebook } from "lucide-react";

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
  const [errors, setErrors] = useState<{ name?: boolean; contactName?: boolean; domain?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal closes or opens
  useEffect(() => {
    if (open) {
      setForm(initialFormState);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = () => {
    const newErrors: any = {};
    const cleanName = form.name.trim();
    const cleanContact = form.contactName.trim();
    const cleanDomain = form.domain.trim();

    if (!cleanName) newErrors.name = true;
    if (!cleanContact) newErrors.contactName = true;
    if (!cleanDomain) newErrors.domain = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Safely sanitize all inputs before sending to the backend
    const payload = {
        name: cleanName,
        contactName: cleanContact,
        domain: cleanDomain,
        linkedinUrl: form.linkedinUrl.trim() || undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
        amount: form.amount && !isNaN(Number(form.amount)) ? Number(form.amount) : undefined,
        type: form.type || "CASH",
        note: form.note?.trim() || undefined,
    };

    setIsSubmitting(true);
    
    createCompany(payload, {
      onSuccess: () => {
        setIsSubmitting(false);
        onClose();
      },
      onError: () => {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-white overflow-hidden border-slate-200">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Building2 className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">Add New Company</DialogTitle>
              <DialogDescription className="text-slate-500 text-sm mt-1">
                Enter the details of the company you want to add to the pipeline.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5 relative max-h-[70vh] overflow-y-auto">
          {/* Prevent interactions while loading */}
          {isSubmitting && <div className="absolute inset-0 z-10 bg-white/20" />}
          
          {/* Mandatory Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: false });
                  }}
                  placeholder="e.g. Acme Corp"
                  disabled={isSubmitting}
                  className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg outline-none transition-all disabled:opacity-50 ${
                    errors.name 
                      ? "border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-red-50" 
                      : "border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  }`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500">Company name is required.</p>}
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={form.contactName}
                  onChange={(e) => {
                    setForm({ ...form, contactName: e.target.value });
                    if (errors.contactName) setErrors({ ...errors, contactName: false });
                  }}
                  placeholder="e.g. John Doe"
                  disabled={isSubmitting}
                  className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg outline-none transition-all disabled:opacity-50 ${
                    errors.contactName 
                      ? "border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-red-50" 
                      : "border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  }`}
                />
              </div>
              {errors.contactName && <p className="text-xs text-red-500">Contact name is required.</p>}
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                Domain <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                <select
                  value={form.domain}
                  onChange={(e) => {
                    setForm({ ...form, domain: e.target.value });
                    if (errors.domain) setErrors({ ...errors, domain: false });
                  }}
                  disabled={isSubmitting}
                  className={`w-full pl-9 pr-8 py-2 text-sm border rounded-lg outline-none transition-all disabled:opacity-50 appearance-none bg-white ${
                    errors.domain 
                      ? "border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-red-50" 
                      : "border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  }`}
                >
                  <option value="" disabled>Select Domain</option>
                  {domains.map((domain) => (
                    <option key={domain.value} value={domain.value}>
                      {domain.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              {errors.domain && <p className="text-xs text-red-500">Domain is required.</p>}
            </div>
          </div>

          <div className="h-px w-full bg-slate-100 my-2"></div>

          {/* Optional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 disabled:opacity-50 bg-white"
                />
              </div>
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-700">LinkedIn URL (Optional)</label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={form.linkedinUrl}
                  onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/company/..."
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 disabled:opacity-50 bg-white"
                />
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Proposed Amount (Optional)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="50000"
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50 bg-white"
                />
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Deal Type</label>
              <div className="relative">
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 bg-white disabled:opacity-50 appearance-none"
                >
                  <option value="CASH">Cash</option>
                  <option value="IN_KIND">In-Kind</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Note (Optional)</label>
              <div className="relative">
                <Notebook className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Add any notes about this company..."
                  disabled={isSubmitting}
                  rows={3}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 disabled:opacity-50 bg-white resize-none"
                />
              </div>
            </div>

          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 sm:gap-4 mt-auto">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-lg">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
              </>
            ) : (
              "Create Company"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}