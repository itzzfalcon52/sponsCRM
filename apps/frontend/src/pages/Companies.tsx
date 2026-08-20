import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useCompanies } from "../hooks/useCompany";
import { useAuthStore } from "../stores/authstore";
import { toast } from "sonner";

import CompanyTable from "../components/companies/CompanyTable";
import MemberCompanyTable from "../components/companies/MemberCompanyTable";
import CompanyFilters from "../components/companies/CompanyFilter";
import AddCompanyModal from "../components/companies/AddCompanyModal";
import PasteCompaniesModal from "../components/companies/PasteCompaniesModal";

import { api } from "../api/axios";

export default function Companies() {
  const queryClient = useQueryClient();

  // ============================================================
  // PAGINATION
  // ============================================================

  const [currentPage, setCurrentPage] = useState(1);

  // Keep this consistent with the table UI.
  const itemsPerPage = 10;

  // ============================================================
  // FILTERS
  // ============================================================

  const [filters, setFilters] = useState<
    Record<string, string>
  >({});

  // ============================================================
  // MODALS
  // ============================================================

  const [open, setOpen] = useState(false);

  const [pasteImportOpen, setPasteImportOpen] =
    useState(false);

  // ============================================================
  // AUTH
  // ============================================================

  const user = useAuthStore((state) => state.user);

  const isAdminOrSenior =
    user?.role === "ADMIN" ||
    user?.role === "SENIOR";

  // ============================================================
  // SERVER PAGINATION
  // ============================================================

  const queryFilters = useMemo(
    () => ({
      ...filters,
      page: String(currentPage),
      limit: String(itemsPerPage),
    }),
    [filters, currentPage]
  );

  // ============================================================
  // COMPANIES
  // ============================================================

  const {
    companies,
    pagination,
    isLoading,
  } = useCompanies(queryFilters);

  // ============================================================
  // GOOGLE SHEETS STATUS
  // ============================================================

  const {
    googleConnected,
    lastSync,
  } = useMemo(() => {
    const organization = user?.organization;

    return {
      googleConnected: Boolean(
        organization?.googleConnected
      ),

      lastSync:
        organization?.lastSyncedAt ?? null,
    };
  }, [user?.organization]);

  // ============================================================
  // FILTER CHANGE
  // ============================================================

  const handleFilterChange = (
    updater: (
      prev: Record<string, string>
    ) => Record<string, string>
  ) => {
    setFilters((prev) => {
      const next = updater(prev);

      // Whenever filters change,
      // go back to page 1.
      setCurrentPage(1);

      return next;
    });
  };

  // ============================================================
  // GOOGLE CONNECT
  // ============================================================

  const handleConnect = async () => {
    try {
      const response = await api.get(
        "/google/connect"
      );

      const url = response.data?.url;

      if (!url) {
        throw new Error(
          "Google OAuth URL was not returned."
        );
      }

      window.location.href = url;
    } catch (error) {
      console.error(
        "Failed to initiate Google connection:",
        error
      );

      toast.error(
        "Unable to connect Google."
      );
    }
  };

  // ============================================================
  // GOOGLE SHEETS SYNC
  // ============================================================

  const handleExport = async () => {
    try {
      const response = await api.post(
        "/google/sync"
      );

      const sheetUrl =
        response.data?.url;

      if (!sheetUrl) {
        throw new Error(
          "Google Sheets URL was not returned."
        );
      }

      toast.success(
        "Google Sheets synced successfully!"
      );

      window.open(
        sheetUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error: any) {
      console.error(
        "Failed to sync with Google Sheets:",
        error
      );

      const status =
        error?.response?.status;

      const errorCode =
        error?.response?.data?.error;

      if (
        status === 401 &&
        errorCode ===
          "GOOGLE_RECONNECT_REQUIRED"
      ) {
        toast.info(
          "Google connection expired. Reconnecting..."
        );

        try {
          const connectResponse =
            await api.get(
              "/google/connect"
            );

          const connectUrl =
            connectResponse.data?.url;

          if (!connectUrl) {
            throw new Error(
              "Google reconnect URL was not returned."
            );
          }

          window.location.href =
            connectUrl;
        } catch (connectError) {
          console.error(
            "Failed to reconnect Google:",
            connectError
          );

          toast.error(
            "Unable to reconnect Google."
          );
        }

        return;
      }

      toast.error(
        error?.response?.data?.message ||
          "Failed to sync with Google Sheets."
      );
    }
  };

  // ============================================================
  // IMPORT SUCCESS
  // ============================================================

  const handleImportSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ["companies"],
    });

    // Return to first page after import.
    setCurrentPage(1);

    toast.success(
      "Companies imported successfully."
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main
      className="
        min-h-full
        w-full
        bg-background
        text-foreground
        transition-colors
        duration-200
      "
    >
      <div className="space-y-6 p-6">

        {/* ======================================================
            FILTERS & ACTION BAR
        ====================================================== */}

        <CompanyFilters
          onChange={handleFilterChange}
          onAdd={() => setOpen(true)}
          onConnect={handleConnect}
          onExport={handleExport}
          isConnected={googleConnected}
          lastSyncedAt={lastSync}
          onImport={() =>
            setPasteImportOpen(true)
          }
        />

        {/* ======================================================
            COMPANY TABLE
        ====================================================== */}

        {isAdminOrSenior ? (
          <CompanyTable
            companies={companies}
            pagination={pagination}
            isLoading={isLoading}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        ) : (
          <MemberCompanyTable
            companies={companies}
            isLoading={isLoading}
            filters={filters}
          />
        )}

        {/* ======================================================
            ADD COMPANY MODAL
        ====================================================== */}

        <AddCompanyModal
          open={open}
          onClose={() =>
            setOpen(false)
          }
        />

        {/* ======================================================
            IMPORT MODAL
        ====================================================== */}

        <PasteCompaniesModal
          open={pasteImportOpen}
          onClose={() =>
            setPasteImportOpen(false)
          }
          onSuccess={
            handleImportSuccess
          }
        />

      </div>
    </main>
  );
}