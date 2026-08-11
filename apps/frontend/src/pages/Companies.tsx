import { useMemo, useState } from "react";

import { useCompanies } from "../hooks/useCompany";
import { useAuthStore } from "../stores/authstore";

import CompanyTable from "../components/companies/CompanyTable";
import MemberCompanyTable from "../components/companies/MemberCompanyTable";
import CompanyFilters from "../components/companies/CompanyFilter";
import AddCompanyModal from "../components/companies/AddCompanyModal";

import { api } from "../api/axios";

export default function Companies() {
  // ============================================================
  // STATE
  // ============================================================

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  // ============================================================
  // AUTH
  // ============================================================

  const user = useAuthStore((state) => state.user);

  const isAdminOrSenior =
    user?.role === "ADMIN" || user?.role === "SENIOR";

  // ============================================================
  // COMPANIES
  // ============================================================

  const {
    companies,
    isLoading,
  } = useCompanies(filters);

  // ============================================================
  // GOOGLE SHEETS
  // ============================================================

  const { googleConnected, lastSync } = useMemo(() => {
    const organization = user?.organization;

    return {
      googleConnected: Boolean(
        organization?.googleAccessToken
      ),
      lastSync: organization?.lastSyncedAt ?? null,
    };
  }, [user?.organization]);

  // ============================================================
  // GOOGLE CONNECT
  // ============================================================

  const handleConnect = async () => {
    try {
      const response = await api.get("/google/connect");

      const redirectUrl = response.data?.url;

      if (!redirectUrl) {
        throw new Error(
          "Google connection URL was not returned."
        );
      }

      window.location.href = redirectUrl;
    } catch (error) {
      console.error(
        "Failed to initiate Google connection:",
        error
      );
    }
  };

  // ============================================================
  // GOOGLE SHEETS SYNC
  // ============================================================

  const handleExport = async () => {
    try {
      const response = await api.post("/google/sync");

      const sheetUrl = response.data?.url;

      if (!sheetUrl) {
        throw new Error(
          "Google Sheets URL was not returned."
        );
      }

      window.open(
        sheetUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.error(
        "Failed to sync with Google Sheets:",
        error
      );
    }
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
          onChange={setFilters}
          onAdd={() => setOpen(true)}
          onConnect={handleConnect}
          onExport={handleExport}
          isConnected={googleConnected}
          lastSyncedAt={lastSync}
        />

        {/* ======================================================
            COMPANY TABLE
        ====================================================== */}

        {isAdminOrSenior ? (
          <CompanyTable
            companies={companies}
            isLoading={isLoading}
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
          onClose={() => setOpen(false)}
        />

      </div>
    </main>
  );
}