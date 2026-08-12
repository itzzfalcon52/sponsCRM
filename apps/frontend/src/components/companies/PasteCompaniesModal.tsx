import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardPaste,
  Loader2,
  X,
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";


import { companyImportApi } from "../../api/companyImportApi";

// ============================================================
// TYPES
// ============================================================

interface PasteCompaniesModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ParsedCompany {
  companyName: string;
  pocName: string;
  linkedin: string;
  phoneNumber: string;
  email: string;
}

// ============================================================
// ZOD VALIDATION
// ============================================================

const companySchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, "Company name is required"),

  pocName: z
    .string()
    .trim()
    .optional(),

  linkedin: z
    .string()
    .trim()
    .optional(),

  phoneNumber: z
    .string()
    .trim()
    .optional(),

  email: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) =>
        !value ||
        z.email().safeParse(value).success,
      {
        message: "Invalid email address",
      }
    ),
});

// ============================================================
// SECTORS / DOMAINS
// ============================================================
//
// IMPORTANT:
// These values MUST match the values of your Prisma
// Domain enum exactly.
//
// Change these if your actual Prisma enum uses different names.
// ============================================================

const sectors = [
    {
      value: "EDTECH",
      label: "EdTech",
    },
    {
      value: "FINTECH",
      label: "FinTech",
    },
    {
      value: "PREVIOUS_YEAR",
      label: "Previous Year",
    },
    {
      value: "BRAND_ACTIVATION",
      label: "Brand Activation",
    },
    {
      value: "MEDIA",
      label: "Media",
    },
    {
      value: "STATIONERY",
      label: "Stationery",
    },
    {
      value: "AI_TECH",
      label: "AI / Technology",
    },
    {
      value: "STARTUP",
      label: "Startup",
    },
    {
      value: "FITNESS",
      label: "Fitness",
    },
    {
      value: "GAMING",
      label: "Gaming",
    },
    {
      value: "FMCG",
      label: "FMCG",
    },
    {
      value: "AUDIO_MOBILE",
      label: "Audio / Mobile",
    },
    {
      value: "BANK",
      label: "Bank",
    },
    {
      value: "AUTOMOBILE_TRAVEL",
      label: "Automobile / Travel",
    },
    {
      value: "FASHION",
      label: "Fashion",
    },
    {
      value: "SKINCARE",
      label: "Skincare",
    },
    {
      value: "HEALTHCARE",
      label: "Healthcare",
    },
    {
      value: "WORKSHOP",
      label: "Workshop",
    },
    {
      value: "MISCELLANEOUS",
      label: "Miscellaneous",
    },
    { value: "HACKATHON", label: "Hackathon/Competition" },

  ];

// ============================================================
// HELPERS
// ============================================================

const cleanValue = (value?: string) => {
  return (value ?? "").trim();
};

/**
 * Excel copied rows normally come through as:
 *
 * Company    \t POC    \t LinkedIn    \t Phone    \t Email
 *
 * Example:
 *
 * Medibuddy    Devidutta Pattnaik
 *              7799988877    devi@gmail.com
 *
 * The important thing is that we split by TAB and DON'T
 * remove empty columns.
 */
const parseRow = (
  row: string
): ParsedCompany => {
  const columns = row.split("\t");

  return {
    companyName: cleanValue(columns[0]),
    pocName: cleanValue(columns[1]),
    linkedin: cleanValue(columns[2]),
    phoneNumber: cleanValue(columns[3]),
    email: cleanValue(columns[4]),
  };
};

/**
 * Remove completely empty rows.
 */
const parsePastedText = (
  text: string
): ParsedCompany[] => {
  return text
    .split(/\r?\n/)
    .map((row) => row.replace(/\r/g, ""))
    .filter((row) => row.trim().length > 0)
    .map(parseRow);
};

// ============================================================
// COMPONENT
// ============================================================

export default function PasteCompaniesModal({
  open,
  onClose,
  onSuccess,
}: PasteCompaniesModalProps) {
  // ============================================================
  // STATE
  // ============================================================

  const [pastedText, setPastedText] =
    useState("");

  const [selectedSector, setSelectedSector] =
    useState("");

  const [isImporting, setIsImporting] =
    useState(false);

  const [hasSubmitted, setHasSubmitted] =
    useState(false);

  // ============================================================
  // PARSE PASTED DATA
  // ============================================================

  const parsedCompanies = useMemo(() => {
    if (!pastedText.trim()) {
      return [];
    }

    return parsePastedText(
      pastedText
    );
  }, [pastedText]);

  // ============================================================
  // VALIDATION
  // ============================================================

  const validationResults = useMemo(() => {
    return parsedCompanies.map(
      (company, index) => {
        const result =
          companySchema.safeParse(
            company
          );

        return {
          row: index + 1,
          company,
          success: result.success,
          error: result.success
            ? null
            : result.error.issues
                .map(
                  (issue) =>
                    issue.message
                )
                .join(", "),
        };
      }
    );
  }, [parsedCompanies]);

  const validCompanies =
    validationResults
      .filter(
        (result) => result.success
      )
      .map(
        (result) => result.company
      );

  const invalidCompanies =
    validationResults.filter(
      (result) => !result.success
    );

  // ============================================================
  // RESET
  // ============================================================

  const resetModal = () => {
    setPastedText("");
    setSelectedSector("");
    setIsImporting(false);
    setHasSubmitted(false);
  };

  // ============================================================
  // CLOSE
  // ============================================================

  const handleClose = () => {
    if (isImporting) {
      return;
    }

    resetModal();
    onClose();
  };

  // ============================================================
  // IMPORT
  // ============================================================

  const handleImport = async () => {
    setHasSubmitted(true);

    // ----------------------------------------------------------
    // No data
    // ----------------------------------------------------------

    if (parsedCompanies.length === 0) {
      toast.error(
        "Please paste at least one company row."
      );

      return;
    }

    // ----------------------------------------------------------
    // Sector required
    // ----------------------------------------------------------

    if (!selectedSector) {
      toast.error(
        "Please select a sector."
      );

      return;
    }

    // ----------------------------------------------------------
    // Invalid rows
    // ----------------------------------------------------------

    if (
      invalidCompanies.length > 0
    ) {
      toast.error(
        `Please fix ${invalidCompanies.length} invalid row${
          invalidCompanies.length > 1
            ? "s"
            : ""
        } before importing.`
      );

      return;
    }

    // ----------------------------------------------------------
    // Import
    // ----------------------------------------------------------

    try {
      setIsImporting(true);

      const response = await companyImportApi.bulkImport({
        domain: selectedSector,
        companies: validCompanies.map((company) => ({
          name: company.companyName,
          contactName: company.pocName || "",
          linkedinUrl: company.linkedin || undefined,
          phoneNumber: company.phoneNumber || undefined,
          email: company.email || undefined,
        })),
      });

      // --------------------------------------------------------
      // Success
      // --------------------------------------------------------

      const importedCount =
       response.data?.data?.count ??
       validCompanies.length;

      toast.success(
        `${importedCount} compan${
          importedCount === 1
            ? "y"
            : "ies"
        } imported successfully.`
      );

      resetModal();

      onSuccess?.();

      onClose();
    } catch (error: any) {
      console.error(
        "Bulk company import failed:",
        error
      );

      const message =
        error?.response?.data
          ?.message ||
        "Failed to import companies.";

      toast.error(message);
    } finally {
      setIsImporting(false);
    }
  };

  // ============================================================
  // DON'T RENDER
  // ============================================================

  if (!open) {
    return null;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <ClipboardPaste className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Import Companies
                </h2>

                <p className="text-xs text-muted-foreground">
                  Paste rows directly from Excel
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isImporting}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ======================================================
            BODY
        ====================================================== */}

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2">

          {/* ====================================================
              LEFT: PASTE AREA
          ==================================================== */}

          <div className="border-b border-border p-6 lg:border-b-0 lg:border-r">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Paste Excel Rows
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Copy the rows directly from your
                standardized Excel sheet and paste
                them below. Do not include headers.
              </p>
            </div>

            {/* Expected format */}

            <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/40 dark:bg-indigo-950/20">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Column order
              </p>

              <p className="text-xs text-indigo-900 dark:text-indigo-200">
                Company Name → POC Name →
                LinkedIn → Phone → Email
              </p>
            </div>

            <textarea
              value={pastedText}
              onChange={(event) =>
                setPastedText(
                  event.target.value
                )
              }
              disabled={isImporting}
              placeholder={`Medibuddy\tDevidutta Pattnaik\t\t7799988877\tdevi@gmail.com
Company B\tJohn Doe\thttps://linkedin.com/in/johndoe\t9876543210\tjohn@example.com`}
              className="min-h-[280px] w-full resize-none rounded-xl border border-border bg-background p-4 font-mono text-xs text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              spellCheck={false}
            />

            {/* Data count */}

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {parsedCompanies.length} row
                {parsedCompanies.length === 1
                  ? ""
                  : "s"} detected
              </span>

              {invalidCompanies.length >
                0 && (
                <span className="font-medium text-rose-600">
                  {invalidCompanies.length} invalid
                </span>
              )}
            </div>
          </div>

          {/* ====================================================
              RIGHT: PREVIEW
          ==================================================== */}

          <div className="min-h-0 p-6">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Import Preview
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                This is how the information will be
                stored in SponsCRM.
              </p>
            </div>

            {/* Sector */}

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Sector
              </label>

              <select
                value={selectedSector}
                onChange={(event) =>
                  setSelectedSector(
                    event.target.value
                  )
                }
                disabled={isImporting}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
              >
                <option value="">
                  Select a sector...
                </option>

                {sectors.map(
                  (sector) => (
                    <option
                      key={sector.value}
                      value={sector.value}
                    >
                      {sector.label}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Empty preview */}

            {parsedCompanies.length ===
              0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 text-center">
                <ClipboardPaste className="mb-3 h-8 w-8 text-muted-foreground/40" />

                <p className="text-sm font-medium text-muted-foreground">
                  No rows to preview
                </p>

                <p className="mt-1 max-w-xs text-xs text-muted-foreground/70">
                  Paste your Excel rows on the
                  left to see how they will be
                  imported.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="max-h-[350px] overflow-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-muted">
                      <tr>
                        <th className="whitespace-nowrap border-b border-border px-3 py-2 font-semibold text-muted-foreground">
                          #
                        </th>

                        <th className="whitespace-nowrap border-b border-border px-3 py-2 font-semibold text-muted-foreground">
                          Company
                        </th>

                        <th className="whitespace-nowrap border-b border-border px-3 py-2 font-semibold text-muted-foreground">
                          POC
                        </th>

                        <th className="whitespace-nowrap border-b border-border px-3 py-2 font-semibold text-muted-foreground">
                          LinkedIn
                        </th>

                        <th className="whitespace-nowrap border-b border-border px-3 py-2 font-semibold text-muted-foreground">
                          Phone
                        </th>

                        <th className="whitespace-nowrap border-b border-border px-3 py-2 font-semibold text-muted-foreground">
                          Email
                        </th>

                        <th className="border-b border-border px-3 py-2 font-semibold text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {validationResults.map(
                        (result) => (
                          <tr
                            key={result.row}
                            className="border-b border-border last:border-0 hover:bg-muted/30"
                          >
                            <td className="px-3 py-3 text-muted-foreground">
                              {result.row}
                            </td>

                            <td className="max-w-[150px] truncate px-3 py-3 font-medium text-foreground">
                              {result.company
                                .companyName ||
                                "—"}
                            </td>

                            <td className="max-w-[150px] truncate px-3 py-3 text-muted-foreground">
                              {result.company
                                .pocName ||
                                "—"}
                            </td>

                            <td className="max-w-[180px] truncate px-3 py-3 text-muted-foreground">
                              {result.company
                                .linkedin ||
                                "—"}
                            </td>

                            <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                              {result.company
                                .phoneNumber ||
                                "—"}
                            </td>

                            <td className="max-w-[180px] truncate px-3 py-3 text-muted-foreground">
                              {result.company
                                .email ||
                                "—"}
                            </td>

                            <td className="px-3 py-3">
                              {result.success ? (
                                <div className="flex items-center gap-1 text-emerald-600">
                                  <CheckCircle2 className="h-3.5 w-3.5" />

                                  <span className="font-medium">
                                    Valid
                                  </span>
                                </div>
                              ) : (
                                <div
                                  className="flex items-center gap-1 text-rose-600"
                                  title={
                                    result.error ??
                                    undefined
                                  }
                                >
                                  <AlertCircle className="h-3.5 w-3.5" />

                                  <span className="font-medium">
                                    Invalid
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Validation errors */}

            {hasSubmitted &&
              invalidCompanies.length >
                0 && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-900/50 dark:bg-rose-950/20">
                  <div className="flex gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />

                    <div>
                      <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                        Please fix these rows
                      </p>

                      <div className="mt-2 space-y-1">
                        {invalidCompanies
                          .slice(0, 5)
                          .map(
                            (result) => (
                              <p
                                key={
                                  result.row
                                }
                                className="text-xs text-rose-600 dark:text-rose-400"
                              >
                                Row{" "}
                                {result.row}:{" "}
                                {result.error}
                              </p>
                            )
                          )}

                        {invalidCompanies.length >
                          5 && (
                          <p className="text-xs font-medium text-rose-600">
                            +
                            {invalidCompanies.length -
                              5}{" "}
                            more invalid rows
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
          <div className="text-xs text-muted-foreground">
            {validCompanies.length > 0
              ? `${validCompanies.length} company${
                  validCompanies.length === 1
                    ? ""
                    : "ies"
                } ready to import`
              : "No valid companies yet"}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isImporting}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleImport}
              disabled={
                isImporting ||
                parsedCompanies.length ===
                  0 ||
                invalidCompanies.length >
                  0 ||
                !selectedSector
              }
              className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:pointer-events-none disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                "Import Companies"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}