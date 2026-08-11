import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Filter,
  Briefcase,
  ChevronDown,
  FileSpreadsheet,
  Link2,
  Loader2,
  ClipboardPaste,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/authstore";

interface CompanyFiltersProps {
  onChange: (
    updater: (
      prev: Record<string, string>
    ) => Record<string, string>
  ) => void;

  onAdd: () => void;

  onExport: () => Promise<void>;

  onConnect: () => Promise<void>;

  // NEW
  onImport: () => void;

  isConnected: boolean;

  lastSyncedAt?: string | Date | null;
}

export default function CompanyFilters({
  onChange,
  onAdd,
  onExport,
  onConnect,
  onImport,
  isConnected,
  lastSyncedAt,
}: CompanyFiltersProps) {
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

  // ============================================================
  // FILTER CHANGE
  // ============================================================

  const handleChange = (key: string, value: string) => {
    onChange((prev) => {
      const next = { ...prev };

      if (!value) {
        delete next[key];
      } else {
        next[key] = value;
      }

      return next;
    });
  };

  // ============================================================
  // GOOGLE SYNC
  // ============================================================

  const handleExportClick = async () => {
    if (!isConnected) {
      toast.error("Connect Google first");
      return;
    }

    try {
      setLoading(true);
      await onExport();
    } catch (error) {
      console.error(
        "Failed to sync with Google Sheets:",
        error
      );

      toast.error(
        "Export to Google Sheets failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex w-full flex-col gap-5 mb-8 xl:flex-row">

      {/* ======================================================
          LEFT SIDE — FILTERS
      ====================================================== */}

      <div className="flex flex-1 flex-wrap items-center gap-3">

        {/* SEARCH */}

        <div className="group relative w-full sm:w-72">
          <Search
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-muted-foreground
              transition-colors
              group-focus-within:text-primary
            "
          />

          <input
            placeholder="Search companies, contacts..."
            onChange={(e) =>
              handleChange("q", e.target.value)
            }
            className="
              w-full
              rounded-lg
              border
              border-input
              bg-background
              py-2.5
              pl-9
              pr-4
              text-sm
              font-medium
              text-foreground
              shadow-sm
              placeholder:text-muted-foreground
              hover:border-primary/40
              focus:border-primary
              focus:outline-none
              focus:ring-2
              focus:ring-primary/20
              transition-all
            "
          />
        </div>

        {/* STATUS */}

        <div className="group relative">
          <Filter
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              z-10
              h-4
              w-4
              -translate-y-1/2
              text-muted-foreground
              transition-colors
              group-focus-within:text-primary
            "
          />

          <select
            defaultValue=""
            onChange={(e) =>
              handleChange(
                "status",
                e.target.value
              )
            }
            className="
              appearance-none
              cursor-pointer
              rounded-lg
              border
              border-input
              bg-background
              py-2.5
              pl-9
              pr-9
              text-sm
              font-medium
              text-foreground
              shadow-sm
              hover:border-primary/40
              focus:border-primary
              focus:outline-none
              focus:ring-2
              focus:ring-primary/20
              transition-all
              [&>option]:bg-background
              [&>option]:text-foreground
            "
          >
            <option value="">
              All Statuses
            </option>

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
              h-4
              w-4
              -translate-y-1/2
              text-muted-foreground
            "
          />
        </div>

        {/* DOMAIN */}

        <div className="group relative">
          <Briefcase
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              z-10
              h-4
              w-4
              -translate-y-1/2
              text-muted-foreground
              transition-colors
              group-focus-within:text-primary
            "
          />

          <select
            defaultValue=""
            onChange={(e) =>
              handleChange(
                "domain",
                e.target.value
              )
            }
            className="
              appearance-none
              cursor-pointer
              rounded-lg
              border
              border-input
              bg-background
              py-2.5
              pl-9
              pr-9
              text-sm
              font-medium
              text-foreground
              shadow-sm
              hover:border-primary/40
              focus:border-primary
              focus:outline-none
              focus:ring-2
              focus:ring-primary/20
              transition-all
              [&>option]:bg-background
              [&>option]:text-foreground
            "
          >
            <option value="">
              All Domains
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
              h-4
              w-4
              -translate-y-1/2
              text-muted-foreground
            "
          />
        </div>
      </div>

      {/* ======================================================
          RIGHT SIDE — GOOGLE + ACTIONS
      ====================================================== */}

      <div className="flex flex-wrap items-center gap-3">

        {/* GOOGLE CONNECTION STATUS */}

        {isAdmin && (
          <div className="mr-2 hidden flex-col items-end sm:flex">

            <div
              className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-border
                bg-muted/50
                px-3
                py-1.5
                shadow-sm
              "
            >
              <div className="relative flex h-2.5 w-2.5">

                {isConnected && (
                  <span
                    className="
                      absolute
                      inline-flex
                      h-full
                      w-full
                      animate-ping
                      rounded-full
                      bg-emerald-400
                      opacity-75
                    "
                  />
                )}

                <span
                  className={`
                    relative
                    inline-flex
                    h-2.5
                    w-2.5
                    rounded-full
                    ${
                      isConnected
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                    }
                  `}
                />
              </div>

              <span className="text-xs font-semibold text-foreground">
                {isConnected
                  ? "Google Connected"
                  : "Not Connected"}
              </span>
            </div>

            {lastSyncedAt && isConnected && (
              <span
                className="
                  mt-1
                  px-1
                  text-[10px]
                  font-medium
                  text-muted-foreground
                "
              >
                Last synced:{" "}
                {new Date(
                  lastSyncedAt
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        )}

        {/* ====================================================
            ACTION BUTTONS
        ==================================================== */}

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">

          {/* GOOGLE */}

          {isAdmin &&
            (!isConnected ? (
              <Button
                variant="outline"
                onClick={onConnect}
                className="
                  flex-1
                  border-border
                  bg-background
                  font-semibold
                  text-foreground
                  shadow-sm
                  hover:bg-muted
                  hover:text-foreground
                  sm:flex-none
                "
              >
                <Link2 className="mr-2 h-4 w-4 shrink-0" />
                Connect Google
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleExportClick}
                disabled={loading}
                className="
                  flex-1
                  border-emerald-500/30
                  bg-emerald-500/5
                  font-semibold
                  text-emerald-600
                  shadow-sm
                  hover:border-emerald-500/50
                  hover:bg-emerald-500/10
                  hover:text-emerald-500
                  dark:text-emerald-400
                  dark:hover:text-emerald-300
                  sm:flex-none
                "
              >
                {loading ? (
                  <Loader2
                    className="
                      mr-2
                      h-4
                      w-4
                      shrink-0
                      animate-spin
                      text-emerald-500
                    "
                  />
                ) : (
                  <FileSpreadsheet
                    className="
                      mr-2
                      h-4
                      w-4
                      shrink-0
                      text-emerald-500
                    "
                  />
                )}

                {loading
                  ? "Syncing..."
                  : "Sync Sheets"}
              </Button>
            ))}

          {/* ==================================================
              IMPORT EXCEL / PASTE
          ================================================== */}

          {isAdmin && (
            <Button
              variant="outline"
              onClick={onImport}
              className="
                flex-1
                border-indigo-500/30
                bg-indigo-500/5
                font-semibold
                text-indigo-600
                shadow-sm
                hover:border-indigo-500/50
                hover:bg-indigo-500/10
                hover:text-indigo-700
                dark:text-indigo-400
                dark:hover:text-indigo-300
                sm:flex-none
              "
            >
              <ClipboardPaste className="mr-2 h-4 w-4 shrink-0" />
              Import Excel
            </Button>
          )}

          {/* ==================================================
              ADD COMPANY
          ================================================== */}

          <Button
            onClick={onAdd}
            className="
              flex-1
              bg-primary
              font-semibold
              text-primary-foreground
              shadow-sm
              transition-all
              hover:bg-primary/90
              active:scale-[0.98]
              sm:flex-none
            "
          >
            <Plus className="mr-2 h-4 w-4 shrink-0" />
            Add Company
          </Button>

        </div>
      </div>
    </div>
  );
}