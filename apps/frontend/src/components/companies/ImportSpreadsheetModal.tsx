import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Link2,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { companyImportApi } from "../../api/companyImportApi";
import {
  IMPORT_FIELDS,
  buildImportRows,
  columnLabels,
  detectHeaderRow,
  guessMapping,
  type ColumnMapping,
  type ImportField,
} from "../../lib/importColumnMapping";
import { sectors } from "../../lib/sectors";
import { parseSpreadsheetFile, type ParsedSheet } from "../../lib/spreadsheetFile";

// ============================================================
// TYPES
// ============================================================

interface ImportSpreadsheetModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = "source" | "map" | "preview" | "done";
type SourceKind = "file" | "link";

interface SkippedEntry {
  sheetRow: number;
  name: string;
  reason: string;
}

interface ImportResult {
  created: number;
  skipped: SkippedEntry[];
  error: string | null;
}

// The API accepts at most this many companies per request.
const CHUNK_SIZE = 500;

const SKIP_REASONS: Record<string, string> = {
  ALREADY_EXISTS: "Already in your CRM",
  DUPLICATE_IN_SHEET: "Repeated in the sheet",
};

const selectClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60";

const sectorLabel = (value: string) =>
  sectors.find((s) => s.value === value)?.label ?? value;

function ErrorAlert({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div role="alert" className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

const requestError = (error: unknown, fallback: string) => {
  const e = error as { response?: { data?: { message?: string } }; message?: string };
  return e?.response?.data?.message || e?.message || fallback;
};

// ============================================================
// COMPONENT
// ============================================================

export default function ImportSpreadsheetModal({
  open,
  onClose,
  onSuccess,
}: ImportSpreadsheetModalProps) {
  const [step, setStep] = useState<Step>("source");
  const [sourceKind, setSourceKind] = useState<SourceKind>("file");

  const [sheetUrl, setSheetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Loaded data. A file carries all its tabs; a Sheets link loads one tab at a time.
  const [fileSheets, setFileSheets] = useState<ParsedSheet[]>([]);
  const [tabs, setTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("");
  const [rows, setRows] = useState<string[][]>([]);
  const [truncated, setTruncated] = useState(false);

  const [headerRow, setHeaderRow] = useState(0);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [sector, setSector] = useState("");

  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  // ============================================================
  // DERIVED
  // ============================================================

  const labels = useMemo(() => columnLabels(rows, headerRow), [rows, headerRow]);

  const importRows = useMemo(
    () => (mapping ? buildImportRows(rows, headerRow, mapping, sector) : []),
    [rows, headerRow, mapping, sector]
  );

  const readyRows = importRows.filter((r) => !r.error && r.duplicateOf === null);
  const invalidRows = importRows.filter((r) => r.error);
  const repeatRows = importRows.filter((r) => !r.error && r.duplicateOf !== null);
  const warningRows = readyRows.filter((r) => r.warning);

  // ============================================================
  // LOADING A SOURCE
  // ============================================================

  const showRows = (
    nextRows: string[][],
    nextTabs: string[],
    nextActive: string,
    wasTruncated = false
  ) => {
    if (!nextRows.some((row) => row.some((cell) => cell.trim()))) {
      setSourceError("That sheet is empty.");
      return false;
    }
    const header = detectHeaderRow(nextRows);
    setRows(nextRows);
    setTabs(nextTabs);
    setActiveTab(nextActive);
    setTruncated(wasTruncated);
    setHeaderRow(header);
    setMapping(guessMapping(nextRows, header));
    setSourceError(null);
    return true;
  };

  const handleFile = async (file: File) => {
    setLoading(true);
    setSourceError(null);
    try {
      const sheets = await parseSpreadsheetFile(file);
      setFileSheets(sheets);
      const first = sheets[0];
      if (first && showRows(first.rows, sheets.map((s) => s.name), first.name)) {
        setStep("map");
      }
    } catch (error) {
      setSourceError(requestError(error, "Could not read that file."));
    } finally {
      setLoading(false);
    }
  };

  const loadGoogleSheet = async (tab?: string) => {
    setLoading(true);
    setSourceError(null);
    try {
      const data = await companyImportApi.previewGoogleSheet(sheetUrl.trim(), tab);
      if (showRows(data.rows, data.tabs, data.selectedTab, data.truncated)) {
        setStep("map");
      }
    } catch (error) {
      setSourceError(requestError(error, "Could not read that Google Sheet."));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (tab: string) => {
    if (sourceKind === "link") {
      await loadGoogleSheet(tab);
      return;
    }
    const sheet = fileSheets.find((s) => s.name === tab);
    if (sheet) showRows(sheet.rows, tabs, tab);
  };

  const handleHeaderRowChange = (value: number) => {
    setHeaderRow(value);
    setMapping(guessMapping(rows, value));
  };

  const setField = (field: ImportField, value: string) => {
    setMapping((prev) => (prev ? { ...prev, [field]: value === "" ? null : Number(value) } : prev));
  };

  // ============================================================
  // IMPORT
  // ============================================================

  const handleImport = async () => {
    setImporting(true);
    const skipped: SkippedEntry[] = [
      ...invalidRows.map((r) => ({ sheetRow: r.sheetRow, name: r.name, reason: r.error ?? "Invalid" })),
      ...repeatRows.map((r) => ({
        sheetRow: r.sheetRow,
        name: r.name,
        reason: `Repeat of row ${r.duplicateOf}`,
      })),
    ];
    let created = 0;
    let error: string | null = null;

    try {
      for (let i = 0; i < readyRows.length; i += CHUNK_SIZE) {
        const chunk = readyRows.slice(i, i + CHUNK_SIZE);
        setProgress(
          readyRows.length > CHUNK_SIZE
            ? `Importing ${Math.min(i + CHUNK_SIZE, readyRows.length)} of ${readyRows.length}...`
            : "Importing...",
        );

        const response = await companyImportApi.bulkImport({
          domain: sector,
          companies: chunk.map((r) => ({
            name: r.name,
            contactName: r.contactName,
            email: r.email || undefined,
            phoneNumber: r.phoneNumber || undefined,
            linkedinUrl: r.linkedinUrl || undefined,
          })),
        });

        created += response.data.createdCount;
        for (const skip of response.data.skipped) {
          skipped.push({
            sheetRow: chunk[skip.row - 1]?.sheetRow ?? skip.row,
            name: skip.name,
            reason: SKIP_REASONS[skip.reason] ?? skip.reason,
          });
        }
      }
    } catch (err) {
      error = requestError(err, "Failed to import companies.");
      toast.error(error);
    } finally {
      setImporting(false);
      setProgress("");
    }

    skipped.sort((a, b) => a.sheetRow - b.sheetRow);
    setResult({ created, skipped, error });
    setStep("done");
    if (created > 0) onSuccess?.();
  };

  // ============================================================
  // RESET / CLOSE
  // ============================================================

  const reset = () => {
    setStep("source");
    setSourceError(null);
    setFileSheets([]);
    setTabs([]);
    setActiveTab("");
    setRows([]);
    setTruncated(false);
    setHeaderRow(0);
    setMapping(null);
    setSector("");
    setResult(null);
    setSheetUrl("");
  };

  const handleClose = () => {
    if (importing) return;
    reset();
    onClose();
  };

  if (!open) return null;

  const stepNumber = { source: 1, map: 2, preview: 3, done: 3 }[step];
  const sample = (col: number | null) =>
    col === null ? "" : (rows[headerRow + 1 + rows.slice(headerRow + 1).findIndex((r) => (r[col] ?? "").trim())]?.[col] ?? "");

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 p-2 sm:p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Import a spreadsheet"
        onKeyDown={(event) => event.key === "Escape" && handleClose()}
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Import a Sheet</h2>
              <p className="text-xs text-muted-foreground">
                Step {stepNumber} of 3 ·{" "}
                {{ source: "Choose a sheet", map: "Match columns", preview: "Review", done: "Done" }[step]}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={importing}
            aria-label="Close"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {step === "source" && (
            <div className="space-y-5">
              <div role="tablist" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 text-sm font-medium">
                {(
                  [
                    ["file", "Upload file", Upload],
                    ["link", "Google Sheet link", Link2],
                  ] as const
                ).map(([kind, label, Icon]) => (
                  <button
                    key={kind}
                    type="button"
                    role="tab"
                    aria-selected={sourceKind === kind}
                    onClick={() => {
                      setSourceKind(kind);
                      setSourceError(null);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 transition-colors ${
                      sourceKind === kind
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              {sourceKind === "file" ? (
                <div>
                  <label
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragging(false);
                      const file = event.dataTransfer.files[0];
                      if (file) void handleFile(file);
                    }}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-12 text-center transition-colors ${
                      dragging
                        ? "border-indigo-500 bg-indigo-500/5"
                        : "border-border bg-muted/20 hover:border-indigo-500/50"
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="mb-3 h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <Upload className="mb-3 h-8 w-8 text-muted-foreground/60" />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      Drop a file here or click to choose one
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">.xlsx or .csv, up to 5 MB</span>
                    <input
                      ref={fileInput}
                      type="file"
                      accept=".xlsx,.csv,.tsv"
                      className="sr-only"
                      disabled={loading}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (file) void handleFile(file);
                      }}
                    />
                  </label>
                  <p className="mt-3 text-xs text-muted-foreground">
                    From Google Sheets: File → Download → Microsoft Excel (.xlsx).
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void loadGoogleSheet();
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label htmlFor="sheet-url" className="mb-2 block text-sm font-medium text-foreground">
                      Google Sheets link
                    </label>
                    <input
                      id="sheet-url"
                      type="url"
                      value={sheetUrl}
                      onChange={(event) => setSheetUrl(event.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      className={selectClass}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The sheet must be open to the Google account your organization connected to
                    SponsCRM. Otherwise, download it as .xlsx and upload it.
                  </p>
                  <Button type="submit" disabled={loading || !sheetUrl.trim()}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Load sheet
                  </Button>
                </form>
              )}

              <ErrorAlert message={sourceError} />
            </div>
          )}

          {step === "map" && mapping && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                We matched your columns to SponsCRM fields. Check them, change any that are
                wrong, and leave the rest as "Not in sheet".
              </p>

              <ErrorAlert message={sourceError} />

              <div className="grid gap-3 sm:grid-cols-2">
                {tabs.length > 1 && (
                  <div>
                    <label htmlFor="sheet-tab" className="mb-2 block text-sm font-medium text-foreground">
                      Tab
                    </label>
                    <select
                      id="sheet-tab"
                      value={activeTab}
                      disabled={loading}
                      onChange={(event) => void handleTabChange(event.target.value)}
                      className={selectClass}
                    >
                      {tabs.map((tab) => (
                        <option key={tab} value={tab}>
                          {tab}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="header-row" className="mb-2 block text-sm font-medium text-foreground">
                    Header row
                  </label>
                  <select
                    id="header-row"
                    value={headerRow}
                    onChange={(event) => handleHeaderRowChange(Number(event.target.value))}
                    className={selectClass}
                  >
                    <option value={-1}>No header row</option>
                    {rows.slice(0, 10).map((_, i) => (
                      <option key={i} value={i}>
                        Row {i + 1}
                        {rows[i]?.find((c) => c.trim()) ? ` · ${rows[i].find((c) => c.trim())!.slice(0, 30)}` : " · empty"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="divide-y divide-border rounded-xl border border-border">
                {IMPORT_FIELDS.map((field) => {
                  const col = mapping[field.key];
                  return (
                    <div key={field.key} className="grid gap-2 p-3 sm:grid-cols-[10rem_1fr_1fr] sm:items-center">
                      <label htmlFor={`map-${field.key}`} className="text-sm font-medium text-foreground">
                        {field.label}
                        {field.required && <span className="ml-1 text-rose-600">*</span>}
                      </label>
                      <select
                        id={`map-${field.key}`}
                        value={col ?? ""}
                        onChange={(event) => setField(field.key, event.target.value)}
                        className={selectClass}
                      >
                        <option value="">Not in sheet</option>
                        {labels.map((label, i) => (
                          <option key={i} value={i}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <p className="truncate text-xs text-muted-foreground">
                        {col === null ? "" : sample(col) ? `e.g. ${sample(col)}` : "No values"}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div>
                <label htmlFor="import-sector" className="mb-2 block text-sm font-medium text-foreground">
                  Sector for all companies <span className="text-rose-600">*</span>
                </label>
                <select
                  id="import-sector"
                  value={sector}
                  onChange={(event) => setSector(event.target.value)}
                  className={selectClass}
                >
                  <option value="">Select a sector...</option>
                  {sectors.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {truncated && (
                <p className="text-xs text-amber-600">Only the first 2,000 rows of this sheet were read.</p>
              )}
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                <span className="font-medium text-emerald-600">
                  {readyRows.length} ready · all in {sectorLabel(sector)}
                </span>
                {warningRows.length > 0 && (
                  <span className="text-amber-600">{warningRows.length} with an email left out</span>
                )}
                {repeatRows.length > 0 && (
                  <span className="text-amber-600">{repeatRows.length} repeated in sheet</span>
                )}
                {invalidRows.length > 0 && (
                  <span className="font-medium text-rose-600">{invalidRows.length} invalid</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Rows with no company name, and repeated rows, are skipped. A bad email never skips a
                company: it is imported without the email. Companies already in your CRM are skipped
                too and listed after the import.
              </p>

              <div className="overflow-hidden rounded-xl border border-border">
                <div className="max-h-[360px] overflow-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-muted">
                      <tr>
                        {["Row", "Company", "POC", "Email", "Phone", "Status"].map((h) => (
                          <th key={h} className="whitespace-nowrap border-b border-border px-3 py-2 font-semibold text-muted-foreground">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importRows.map((row) => (
                        <tr key={row.sheetRow} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-3 py-2 text-muted-foreground">{row.sheetRow}</td>
                          <td className="max-w-[160px] truncate px-3 py-2 font-medium text-foreground">{row.name || "—"}</td>
                          <td className="max-w-[120px] truncate px-3 py-2 text-muted-foreground">{row.contactName || "—"}</td>
                          <td className="max-w-[160px] truncate px-3 py-2 text-muted-foreground">{row.email || "—"}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{row.phoneNumber || "—"}</td>
                          <td className="whitespace-nowrap px-3 py-2">
                            {row.error ? (
                              <span className="flex items-center gap-1 font-medium text-rose-600">
                                <AlertCircle className="h-3.5 w-3.5" />
                                {row.error}
                              </span>
                            ) : row.duplicateOf !== null ? (
                              <span className="font-medium text-amber-600">Repeat of row {row.duplicateOf}</span>
                            ) : row.warning ? (
                              <span className="flex items-center gap-1 font-medium text-amber-600" title={row.warning}>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Ready · {row.warning}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 font-medium text-emerald-600">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Ready
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {step === "done" && result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {result.created} compan{result.created === 1 ? "y" : "ies"} imported
                  </p>
                  <p className="text-sm text-muted-foreground">{result.skipped.length} skipped</p>
                </div>
              </div>

              {result.error && (
                <div role="alert" className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    The import stopped early: {result.error} Rows imported so far are saved. Fix the
                    problem and import the sheet again; companies already saved will be skipped.
                  </span>
                </div>
              )}

              {result.skipped.length > 0 && (
                <details className="rounded-xl border border-border" open={result.skipped.length <= 10}>
                  <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-foreground">
                    Skipped rows
                  </summary>
                  <ul className="max-h-[260px] divide-y divide-border overflow-auto border-t border-border text-xs">
                    {result.skipped.map((skip, i) => (
                      <li key={i} className="flex justify-between gap-3 px-3 py-2">
                        <span className="truncate text-foreground">
                          Row {skip.sheetRow} · {skip.name || "No name"}
                        </span>
                        <span className="shrink-0 text-muted-foreground">{skip.reason}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/30 px-4 py-3 sm:flex-row sm:justify-end sm:px-6">
          {step === "map" && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setSourceError(null);
                  setStep("source");
                }}
              >
                Back
              </Button>
              <Button disabled={mapping?.name === null || !sector} onClick={() => setStep("preview")}>
                Preview import
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" disabled={importing} onClick={() => setStep("map")}>
                Back
              </Button>
              <Button disabled={importing || readyRows.length === 0} onClick={() => void handleImport()}>
                {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {importing
                  ? progress
                  : `Import ${readyRows.length} compan${readyRows.length === 1 ? "y" : "ies"}`}
              </Button>
            </>
          )}

          {step === "done" && (
            <>
              <Button variant="outline" onClick={reset}>
                Import another sheet
              </Button>
              <Button onClick={handleClose}>Close</Button>
            </>
          )}

          {step === "source" && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
