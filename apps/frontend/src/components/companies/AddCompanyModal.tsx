import { useState, useEffect } from "react";
import {
  Building2,
  UserCircle,
  Globe,
  Phone,
  IndianRupee,
  Building,
  Loader2,
  ChevronDown,
  Notebook,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Info,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useCompanies } from "../../hooks/useCompany";
import { useDuplicateCheck } from "../../hooks/useDuplicateCheck";
import { cn } from "@/lib/utils";

// ============================================================
// LINKEDIN ICON
// ============================================================

const LinkedInIcon = ({
  className,
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
  </svg>
);

// ============================================================
// DOMAINS
// ============================================================

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
  {
    value: "AUTOMOBILE_TRAVEL",
    label: "Automobile & Travel",
  },
  {
    value: "MISCELLANEOUS",
    label: "Miscellaneous",
  },
];

// ============================================================
// COMPONENT
// ============================================================

export default function AddCompanyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { createCompany } = useCompanies();

  // ============================================================
  // FORM
  // ============================================================

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

  const [errors, setErrors] = useState<
    Record<string, boolean>
  >({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [forceCreate, setForceCreate] =
    useState(false);

  // ============================================================
  // DUPLICATE CHECK
  // ============================================================

  const { suggestions, isChecking } =
    useDuplicateCheck(form.name);

  // ============================================================
  // RESET FORM WHEN OPENING
  // ============================================================

  useEffect(() => {
    if (open) {
      setForm(initialFormState);
      setErrors({});
      setForceCreate(false);
      setIsSubmitting(false);
    }
  }, [open]);

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};

    if (!form.name.trim()) {
      newErrors.name = true;
    }

    if (!form.contactName.trim()) {
      newErrors.contactName = true;
    }

    if (!form.domain.trim()) {
      newErrors.domain = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      contactName: form.contactName.trim(),
      amount: form.amount
        ? Number(form.amount)
        : undefined,
      force: forceCreate,
    };

    setIsSubmitting(true);

    createCompany(payload, {
      onSuccess: () => {
        setIsSubmitting(false);
        onClose();
      },

      onError: (err: any) => {
        setIsSubmitting(false);

        if (err.response?.status === 409) {
          setForceCreate(true);
        }
      },
    });
  };

  // ============================================================
  // INPUT STYLES
  // ============================================================

  const inputClass = `
    w-full
    h-16
    rounded-3xl
    border-2
    border-border
    bg-background
    text-foreground
    text-base
    font-bold
    shadow-sm
    transition-all

    placeholder:text-muted-foreground/60

    focus:border-indigo-600
    focus:ring-8
    focus:ring-indigo-600/5

    dark:focus:border-indigo-400
    dark:focus:ring-indigo-400/10
  `;

  const iconClass = `
    absolute
    left-5
    top-1/2
    h-5
    w-5
    -translate-y-1/2
    text-muted-foreground
    transition-colors

    group-focus-within:text-indigo-600
    dark:group-focus-within:text-indigo-400
  `;

  const labelClass = `
    ml-1
    text-xs
    font-black
    uppercase
    tracking-widest
    text-muted-foreground
  `;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Dialog
      open={open}
      onOpenChange={() =>
        !isSubmitting && onClose()
      }
    >
      <DialogContent
        className="
          sm:max-w-[620px]
          gap-0
          overflow-hidden
          rounded-[3rem]
          border
          border-border
          bg-card
          p-0
          text-card-foreground
          shadow-[0_32px_64px_-12px_rgba(0,0,0,0.20)]

          dark:shadow-[0_32px_80px_-20px_rgba(0,0,0,0.7)]
        "
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <DialogHeader
          className="
            relative
            overflow-hidden
            bg-gradient-to-br
            from-indigo-600
            via-indigo-700
            to-indigo-800
            px-12
            pb-10
            pt-12
            text-white
          "
        >
          {/* Decorative icon */}

          <div className="absolute right-0 top-0 p-8 opacity-10">
            <Building2 className="h-32 w-32 rotate-12" />
          </div>

          <div className="relative z-10 flex items-center gap-6">
            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-3xl
                border
                border-white/20
                bg-white/10
                shadow-2xl
                backdrop-blur-md
                transition-transform
                duration-500

                hover:scale-110
                active:scale-95
              "
            >
              <Sparkles className="h-8 w-8 text-white" />
            </div>

            <div className="space-y-1">
              <DialogTitle
                className="
                  text-3xl
                  font-black
                  tracking-tight
                  text-white
                "
              >
                Add New Partner
              </DialogTitle>

              <DialogDescription
                className="
                  text-base
                  font-medium
                  text-indigo-100
                "
              >
                Capture new opportunities for your
                workspace.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ======================================================
            FORM BODY
        ====================================================== */}

        <div
          className="
            max-h-[60vh]
            space-y-10
            overflow-y-auto
            bg-muted/20
            px-12
            py-10
          "
        >
          {/* ====================================================
              CORE IDENTITY
          ==================================================== */}

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="
                    h-2
                    w-10
                    rounded-full
                    bg-indigo-600
                    dark:bg-indigo-500
                  "
                />

                <span
                  className="
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.2em]
                    text-muted-foreground
                  "
                >
                  Core Identity
                </span>
              </div>

              <Info className="h-4 w-4 text-muted-foreground/50" />
            </div>

            {/* COMPANY NAME */}

            <div className="space-y-3">
              <label className={labelClass}>
                Official Company Name *
              </label>

              <div className="group relative">
                <Building
                  className={iconClass}
                />

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  className={cn(
                    inputClass,
                    "pl-14 pr-14",
                    errors.name &&
                      `
                        border-red-500/60
                        bg-red-50/30
                        focus:border-red-500
                        focus:ring-red-500/5

                        dark:border-red-500/60
                        dark:bg-red-950/20
                      `
                  )}
                  placeholder="e.g. Microsoft Corporation"
                />

                {isChecking && (
                  <Loader2
                    className="
                      absolute
                      right-5
                      top-1/2
                      h-6
                      w-6
                      -translate-y-1/2
                      animate-spin
                      text-indigo-600
                      dark:text-indigo-400
                    "
                  />
                )}
              </div>

              {/* DUPLICATE SUGGESTIONS */}

              {suggestions.length > 0 && (
                <div
                  className="
                    animate-in
                    zoom-in-95
                    rounded-3xl
                    border-2
                    border-amber-200
                    bg-amber-50/70
                    p-5
                    duration-500

                    dark:border-amber-900/60
                    dark:bg-amber-950/30
                  "
                >
                  <div className="mb-3 flex items-center gap-3">
                    <AlertCircle
                      className="
                        h-5
                        w-5
                        text-amber-600
                        dark:text-amber-400
                      "
                    />

                    <span
                      className="
                        text-xs
                        font-black
                        uppercase
                        tracking-tight
                        text-amber-800

                        dark:text-amber-300
                      "
                    >
                      Possible Duplicates Found
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <div
                        key={s}
                        className="
                          rounded-2xl
                          border
                          border-amber-200/60
                          bg-background
                          px-4
                          py-1.5
                          text-xs
                          font-bold
                          text-foreground
                          shadow-sm

                          dark:border-amber-800/60
                        "
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CONTACT + DOMAIN */}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* CONTACT */}

              <div className="space-y-3">
                <label className={labelClass}>
                  Contact Lead *
                </label>

                <div className="group relative">
                  <UserCircle
                    className={iconClass}
                  />

                  <input
                    value={form.contactName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        contactName:
                          e.target.value,
                      })
                    }
                    className={cn(
                      inputClass,
                      "pl-14",
                      errors.contactName &&
                        `
                          border-red-500/60
                          bg-red-50/30
                          dark:bg-red-950/20
                        `
                    )}
                    placeholder="Primary Name"
                  />
                </div>
              </div>

              {/* DOMAIN */}

              <div className="space-y-3">
                <label className={labelClass}>
                  Sector *
                </label>

                <div className="group relative">
                  <Globe
                    className={iconClass}
                  />

                  <select
                    value={form.domain}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        domain: e.target.value,
                      })
                    }
                    className={cn(
                      inputClass,
                      "cursor-pointer appearance-none pl-14 pr-12",
                      errors.domain &&
                        `
                          border-red-500/60
                          bg-red-50/30
                          dark:bg-red-950/20
                        `
                    )}
                  >
                    <option value="">
                      Choose Industry
                    </option>

                    {domains.map((d) => (
                      <option
                        key={d.value}
                        value={d.value}
                      >
                        {d.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    className="
                      pointer-events-none
                      absolute
                      right-5
                      top-1/2
                      h-5
                      w-5
                      -translate-y-1/2
                      text-muted-foreground
                    "
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================
              COMMUNICATION
          ==================================================== */}

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div
                className="
                  h-2
                  w-10
                  rounded-full
                  bg-border
                "
              />

              <span
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-muted-foreground
                "
              >
                Communication
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* PHONE */}

              <div className="space-y-3">
                <label className={labelClass}>
                  Mobile / Desk
                </label>

                <div className="group relative">
                  <Phone className={iconClass} />

                  <input
                    value={form.phoneNumber}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phoneNumber:
                          e.target.value,
                      })
                    }
                    className={cn(
                      inputClass,
                      "pl-14"
                    )}
                    placeholder="+XX XXXXX XXXXX"
                  />
                </div>
              </div>

              {/* LINKEDIN */}

              <div className="space-y-3">
                <label className={labelClass}>
                  Professional URL
                </label>

                <div className="group relative">
                  <LinkedInIcon
                    className={`
                      ${iconClass}
                    `}
                  />

                  <input
                    value={form.linkedinUrl}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        linkedinUrl:
                          e.target.value,
                      })
                    }
                    className={cn(
                      inputClass,
                      "pl-14"
                    )}
                    placeholder="linkedin.com/..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================
              DEAL INTELLIGENCE
          ==================================================== */}

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div
                className="
                  h-2
                  w-10
                  rounded-full
                  bg-border
                "
              />

              <span
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-muted-foreground
                "
              >
                Deal Intelligence
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* AMOUNT */}

              <div className="space-y-3">
                <label className={labelClass}>
                  Target Amount
                </label>

                <div className="group relative">
                  <IndianRupee
                    className={iconClass}
                  />

<input
  type="number"
  min="0"
  step="1"
  value={form.amount}
  onChange={(e) => {
    const value = e.target.value;

    // Don't allow negative values
    if (value === "" || Number(value) >= 0) {
      setForm({
        ...form,
        amount: value,
      });
    }
  }}
  className={cn(
    inputClass,
    "pl-14"
  )}
  placeholder="Planned Ask"
/>

                </div>
              </div>

              {/* PAYMENT STRATEGY */}

              <div className="space-y-3">
                <label className={labelClass}>
                  Payment Strategy
                </label>

                <div className="group relative">
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
                      h-16
                      cursor-pointer
                      appearance-none
                      rounded-3xl
                      border-2
                      border-border
                      bg-background
                      px-6
                      pr-12
                      text-base
                      font-bold
                      text-foreground
                      shadow-sm
                      transition-all

                      focus:border-indigo-600
                      focus:ring-8
                      focus:ring-indigo-600/5

                      dark:focus:border-indigo-400
                      dark:focus:ring-indigo-400/10
                    "
                  >
                    <option value="CASH">
                      Cash Transfer
                    </option>

                    <option value="IN_KIND">
                      In-Kind (Barter)
                    </option>
                  </select>

                  <ChevronDown
                    className="
                      pointer-events-none
                      absolute
                      right-5
                      top-1/2
                      h-5
                      w-5
                      -translate-y-1/2
                      text-muted-foreground
                    "
                  />
                </div>
              </div>
            </div>

            {/* NOTE */}

            <div className="space-y-3">
              <label className={labelClass}>
                Strategic Summary
              </label>

              <div className="group relative">
                <Notebook
                  className="
                    absolute
                    left-5
                    top-6
                    h-5
                    w-5
                    text-muted-foreground
                    transition-colors

                    group-focus-within:text-indigo-600
                    dark:group-focus-within:text-indigo-400
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
                  className="
                    min-h-[140px]
                    w-full
                    resize-none
                    rounded-[2.5rem]
                    border-2
                    border-border
                    bg-background
                    py-6
                    pl-14
                    pr-6
                    text-base
                    font-bold
                    text-foreground
                    shadow-sm
                    transition-all

                    placeholder:text-muted-foreground/60

                    focus:border-indigo-600
                    focus:ring-8
                    focus:ring-indigo-600/5

                    dark:focus:border-indigo-400
                    dark:focus:ring-indigo-400/10
                  "
                  placeholder="What is the potential of this partnership?..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <DialogFooter
          className="
            flex
            items-center
            justify-between
            gap-6
            border-t
            border-border
            bg-card
            px-12
            py-10
          "
        >
          {/* DISCARD */}

          <button
            onClick={onClose}
            className="
              text-xs
              font-black
              uppercase
              tracking-widest
              text-muted-foreground
              transition-all

              hover:text-foreground
              active:scale-90
            "
          >
            Discard
          </button>

          {/* SUBMIT */}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={cn(
              `
                h-16
                rounded-[2rem]
                px-12
                text-lg
                font-black
                text-white
                shadow-lg
                transition-all
                active:scale-95
              `,
              forceCreate
                ? `
                    bg-amber-600
                    hover:bg-amber-700
                    shadow-amber-600/20

                    dark:bg-amber-600
                    dark:hover:bg-amber-500
                  `
                : `
                    bg-indigo-600
                    hover:bg-indigo-700
                    shadow-indigo-600/20

                    dark:bg-indigo-500
                    dark:hover:bg-indigo-400
                  `
            )}
          >
            {isSubmitting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : forceCreate ? (
              "Bypass & Create"
            ) : (
              <span className="flex items-center gap-3">
                Finalize Partner
                <CheckCircle2 className="h-5 w-5" />
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}