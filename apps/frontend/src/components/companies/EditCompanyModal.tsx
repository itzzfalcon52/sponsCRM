import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useCompanies } from "../../hooks/useCompany";
import { Building2, UserCircle, Globe, Link, Phone, IndianRupee, Building, Activity, ChevronDown,Notebook} from "lucide-react";
import { toast } from "sonner";

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

export default function EditCompanyModal({ open, onClose, company }: any) {
  const { updateCompany } = useCompanies();

  const [form, setForm] = useState<any>({
    name: "",
    contactName: "",
    phoneNumber: "",
    linkedinUrl: "",
    domain: "",
    status: "NOT_CONTACTED",
    amount: "",
    type: "CASH",
    note:"",
  });

  useEffect(() => {
    if (company && open) {
      setForm({
        name: company.name || "",
        contactName: company.contactName || "",
        phoneNumber: company.phoneNumber || "",
        linkedinUrl: company.linkedinUrl || "",
        domain: company.domain || "",
        status: company.status || "NOT_CONTACTED",
        amount: company.amount ?? "",
        type: company.type || "CASH",
        note: company.note || "",
      });
    }
  }, [company, open]);

  if (!company) return null;

  const handleSubmit = () => {
    if (!company) return;

    // 1. Start with a base payload of guaranteed primitives
    const payload: any = {
      status: form.status,
      type: form.type,
    };

    // 2. Only attach string fields if they actually have length to prevent sending empty strings
    if (form.name?.trim()) payload.name = form.name.trim();
    if (form.contactName?.trim()) payload.contactName = form.contactName.trim();
    if (form.domain?.trim()) payload.domain = form.domain.trim();
    if (form.linkedinUrl?.trim()) payload.linkedinUrl = form.linkedinUrl.trim();
    if (form.phoneNumber?.trim()) payload.phoneNumber = form.phoneNumber.trim();

    // 3. Only attach amount if it's a valid number
    if (form.amount && !isNaN(Number(form.amount))) {
      payload.amount = Number(form.amount);
    }
    if(form.note?.trim()) payload.note=form.note.trim();

    updateCompany({
      id: company.id,
      data: payload,
    });
    toast.success("Company updated successfully!");

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 bg-white overflow-hidden border-slate-200">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2.5 rounded-xl">
              <Building2 className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">Edit Company</DialogTitle>
              <DialogDescription className="text-slate-500 text-sm mt-1">
                Update the details for <span className="font-semibold text-slate-800">{company.name}</span>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Company Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Acme Corp"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Contact Name */}
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Contact Name</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100 my-2"></div>

          <div className="grid grid-cols-2 gap-4">
            {/* Domain */}
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Domain</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                <select
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                  className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 appearance-none bg-white"
                >
                  <option value="" disabled>Select Domain</option>
                  {domains.map((domain) => (
                    <option key={domain.value} value={domain.value}>
                      {domain.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
              </div>
            </div>

            {/* Phone */}
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-700">LinkedIn URL</label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={form.linkedinUrl}
                  onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/company/..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Status */}
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 bg-white appearance-none"
                >
                  <option value="NOT_CONTACTED">Not Contacted</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="IN_TALKS">In Talks</option>
                  <option value="NEGOTIATING">Negotiating</option>
                  <option value="POSITIVE">Positive</option>
                  <option value="CLOSED">Closed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
              </div>
            </div>

            {/* Deal Type */}
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Deal Type</label>
              <div className="relative">
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 bg-white appearance-none"
                >
                  <option value="CASH">Cash</option>
                  <option value="IN_KIND">In-Kind</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
              </div>
            </div>

            {/* Amount */}
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Amount</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
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
                  rows={3}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 disabled:opacity-50 bg-white resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-lg">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}