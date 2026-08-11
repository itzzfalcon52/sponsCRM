import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useCompanies } from "../../hooks/useCompany";
import {
  Building2,
  UserCircle,
  Globe,
  Link,
  Phone,
  IndianRupee,
  Building,
  Activity,
  ChevronDown,
  Notebook,
} from "lucide-react";
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

export default function EditCompanyModal({
  open,
  onClose,
  company,
}: any) {
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
    note: "",
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

    // =========================================================
    // VALIDATE AMOUNT
    // =========================================================

    if (
      form.amount !== "" &&
      (isNaN(Number(form.amount)) || Number(form.amount) < 0)
    ) {
      toast.error("Amount cannot be negative.");
      return;
    }

    // =========================================================
    // BUILD PAYLOAD
    // =========================================================

    const payload: any = {
      status: form.status,
      type: form.type,
    };

    // String fields
    if (form.name?.trim()) {
      payload.name = form.name.trim();
    }

    if (form.contactName?.trim()) {
      payload.contactName = form.contactName.trim();
    }

    if (form.domain?.trim()) {
      payload.domain = form.domain.trim();
    }

    if (form.linkedinUrl?.trim()) {
      payload.linkedinUrl = form.linkedinUrl.trim();
    }

    if (form.phoneNumber?.trim()) {
      payload.phoneNumber = form.phoneNumber.trim();
    }

    // Amount
    if (form.amount !== "" && !isNaN(Number(form.amount))) {
      payload.amount = Math.max(0, Number(form.amount));
    }

    // Note
    if (form.note?.trim()) {
      payload.note = form.note.trim();
    }

    updateCompany({
      id: company.id,
      data: payload,
    });

    toast.success("Company updated successfully!");

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          sm:max-w-[550px]
          max-h-[90vh]
          overflow-hidden
          p-0
          border-border
          bg-background
          text-foreground
        "
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <DialogHeader
          className="
            border-b
            border-border
            bg-muted/40
            px-6
            pb-4
            pt-6
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                rounded-xl
                bg-primary/10
                p-2.5
                ring-1
                ring-primary/10
              "
            >
              <Building2 className="h-5 w-5 text-primary" />
            </div>

            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Edit Company
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                Update the details for{" "}
                <span className="font-semibold text-foreground">
                  {company.name}
                </span>
                .
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* =====================================================
            FORM
        ===================================================== */}

        <div className="max-h-[65vh] overflow-y-auto p-6">
          <div className="space-y-5">

            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <div className="grid grid-cols-2 gap-4">

              {/* Company Name */}
              <div className="col-span-2 space-y-1.5 sm:col-span-1">
                <label className="text-sm font-medium text-foreground">
                  Company Name
                </label>

                <div className="relative">
                  <Building
                    className="
                      absolute
                      left-3
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-muted-foreground
                    "
                  />

                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g. Acme Corp"
                    className="
                      w-full
                      rounded-lg
                      border
                      border-input
                      bg-background
                      py-2
                      pl-9
                      pr-3
                      text-sm
                      font-medium
                      text-foreground
                      outline-none
                      transition-all
                      placeholder:text-muted-foreground
                      hover:border-primary/40
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/20
                    "
                  />
                </div>
              </div>

              {/* Contact Name */}
              <div className="col-span-2 space-y-1.5 sm:col-span-1">
                <label className="text-sm font-medium text-foreground">
                  Contact Name
                </label>

                <div className="relative">
                  <UserCircle
                    className="
                      absolute
                      left-3
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-muted-foreground
                    "
                  />

                  <input
                    value={form.contactName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        contactName: e.target.value,
                      })
                    }
                    placeholder="e.g. John Doe"
                    className="
                      w-full
                      rounded-lg
                      border
                      border-input
                      bg-background
                      py-2
                      pl-9
                      pr-3
                      text-sm
                      font-medium
                      text-foreground
                      outline-none
                      transition-all
                      placeholder:text-muted-foreground
                      hover:border-primary/40
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/20
                    "
                  />
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-border" />

            {/* =================================================
                CONTACT / CLASSIFICATION
            ================================================= */}

            <div className="grid grid-cols-2 gap-4">

              {/* Domain */}
              <div className="col-span-2 space-y-1.5 sm:col-span-1">
                <label className="text-sm font-medium text-foreground">
                  Domain
                </label>

                <div className="relative">
                  <Globe
                    className="
                      absolute
                      left-3
                      top-1/2
                      z-10
                      h-4
                      w-4
                      -translate-y-1/2
                      text-muted-foreground
                    "
                  />

                  <select
                    value={form.domain}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        domain: e.target.value,
                      })
                    }
                    className="
                      w-full
                      appearance-none
                      rounded-lg
                      border
                      border-input
                      bg-background
                      py-2
                      pl-9
                      pr-8
                      text-sm
                      font-medium
                      text-foreground
                      outline-none
                      transition-all
                      hover:border-primary/40
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/20
                      [&>option]:bg-background
                      [&>option]:text-foreground
                    "
                  >
                    <option value="" disabled>
                      Select Domain
                    </option>

                    {domains.map((domain) => (
                      <option
                        key={domain.value}
                        value={domain.value}
                      >
                        {domain.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    className="
                      pointer-events-none
                      absolute
                      right-3
                      top-1/2
                      z-10
                      h-4
                      w-4
                      -translate-y-1/2
                      text-muted-foreground
                    "
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="col-span-2 space-y-1.5 sm:col-span-1">
                <label className="text-sm font-medium text-foreground">
                  Phone
                </label>

                <div className="relative">
                  <Phone
                    className="
                      absolute
                      left-3
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-muted-foreground
                    "
                  />

                  <input
                    value={form.phoneNumber}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phoneNumber: e.target.value,
                      })
                    }
                    placeholder="+1 (555) 000-0000"
                    className="
                      w-full
                      rounded-lg
                      border
                      border-input
                      bg-background
                      py-2
                      pl-9
                      pr-3
                      text-sm
                      font-medium
                      text-foreground
                      outline-none
                      transition-all
                      placeholder:text-muted-foreground
                      hover:border-primary/40
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/20
                    "
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div className="col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  LinkedIn URL
                </label>

                <div className="relative">
                  <Link
                    className="
                      absolute
                      left-3
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-muted-foreground
                    "
                  />

                  <input
                    value={form.linkedinUrl}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        linkedinUrl: e.target.value,
                      })
                    }
                    placeholder="https://linkedin.com/company/..."
                    className="
                      w-full
                      rounded-lg
                      border
                      border-input
                      bg-background
                      py-2
                      pl-9
                      pr-3
                      text-sm
                      font-medium
                      text-foreground
                      outline-none
                      transition-all
                      placeholder:text-muted-foreground
                      hover:border-primary/40
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/20
                    "
                  />
                </div>
              </div>

              {/* =================================================
                  STATUS
              ================================================= */}

              <div className="col-span-2 space-y-1.5 sm:col-span-1">
                <label className="text-sm font-medium text-foreground">
                  Status
                </label>

                <div className="relative">
                  <Activity
                    className="
                      absolute
                      left-3
                      top-1/2
                      z-10
                      h-4
                      w-4
                      -translate-y-1/2
                      text-muted-foreground
                    "
                  />

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value,
                      })
                    }
                    className="
                      w-full
                      appearance-none
                      rounded-lg
                      border
                      border-input
                      bg-background
                      py-2
                      pl-9
                      pr-8
                      text-sm
                      font-medium
                      text-foreground
                      outline-none
                      transition-all
                      hover:border-primary/40
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/20
                      [&>option]:bg-background
                      [&>option]:text-foreground
                    "
                  >
                    <option value="NOT_CONTACTED">
                      Not Contacted
                    </option>

                    <option value="CONTACTED">
                      Contacted
                    </option>

                    <option value="IN_TALKS">
                      In Talks
                    </option>

                    <option value="NEGOTIATING">
                      Negotiating
                    </option>

                    <option value="POSITIVE">
                      Positive
                    </option>

                    <option value="CLOSED">
                      Closed
                    </option>

                    <option value="REJECTED">
                      Rejected
                    </option>
                  </select>

                  <ChevronDown
                    className="
                      pointer-events-none
                      absolute
                      right-3
                      top-1/2
                      z-10
                      h-4
                      w-4
                      -translate-y-1/2
                      text-muted-foreground
                    "
                  />
                </div>
              </div>

              {/* Deal Type */}
              <div className="col-span-2 space-y-1.5 sm:col-span-1">
                <label className="text-sm font-medium text-foreground">
                  Deal Type
                </label>

                <div className="relative">
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value,
                      })
                    }
                    className="
                      w-full
                      appearance-none
                      rounded-lg
                      border
                      border-input
                      bg-background
                      py-2
                      pl-3
                      pr-8
                      text-sm
                      font-medium
                      text-foreground
                      outline-none
                      transition-all
                      hover:border-primary/40
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/20
                      [&>option]:bg-background
                      [&>option]:text-foreground
                    "
                  >
                    <option value="CASH">
                      Cash
                    </option>

                    <option value="IN_KIND">
                      In-Kind
                    </option>
                  </select>

                  <ChevronDown
                    className="
                      pointer-events-none
                      absolute
                      right-3
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-muted-foreground
                    "
                  />
                </div>
              </div>

              {/* =================================================
                  AMOUNT
              ================================================= */}

              <div className="col-span-2 space-y-1.5 sm:col-span-1">
                <label className="text-sm font-medium text-foreground">
                  Amount
                </label>

                <div className="relative">
                  <IndianRupee
                    className="
                      absolute
                      left-3
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-muted-foreground
                    "
                  />

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.amount}
                    onChange={(e) => {
                      const value = e.target.value;

                      // Don't allow negative values
                      if (
                        value !== "" &&
                        Number(value) < 0
                      ) {
                        return;
                      }

                      setForm({
                        ...form,
                        amount: value,
                      });
                    }}
                    placeholder="0"
                    className="
                      w-full
                      rounded-lg
                      border
                      border-input
                      bg-background
                      py-2
                      pl-9
                      pr-3
                      text-sm
                      font-medium
                      text-foreground
                      outline-none
                      transition-all
                      placeholder:text-muted-foreground
                      hover:border-primary/40
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/20
                      [appearance:textfield]
                      [&::-webkit-inner-spin-button]:appearance-none
                      [&::-webkit-outer-spin-button]:appearance-none
                    "
                  />
                </div>
              </div>

              {/* =================================================
                  NOTE
              ================================================= */}

              <div className="col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Note (Optional)
                </label>

                <div className="relative">
                  <Notebook
                    className="
                      absolute
                      left-3
                      top-3
                      h-4
                      w-4
                      text-muted-foreground
                    "
                  />

                  <textarea
                    value={form.note}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        note: e.target.value,
                      })
                    }
                    placeholder="Add any notes about this company..."
                    rows={3}
                    className="
                      w-full
                      resize-none
                      rounded-lg
                      border
                      border-input
                      bg-background
                      py-2
                      pl-9
                      pr-3
                      text-sm
                      font-medium
                      text-foreground
                      outline-none
                      transition-all
                      placeholder:text-muted-foreground
                      hover:border-primary/40
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/20
                    "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <DialogFooter
          className="
            flex
            items-center
            justify-end
            gap-3
            border-t
            border-border
            bg-muted/40
            px-6
            py-4
          "
        >
          <Button
            variant="outline"
            onClick={onClose}
            className="
              rounded-lg
              border-border
              bg-background
              text-foreground
              hover:bg-muted
            "
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            className="
              rounded-lg
              bg-primary
              text-primary-foreground
              shadow-sm
              hover:bg-primary/90
            "
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}