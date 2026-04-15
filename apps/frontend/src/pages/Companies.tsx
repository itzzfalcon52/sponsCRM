import { useState, useEffect, useMemo } from "react";
import { useCompanies } from "../hooks/useCompany";
import { useAuthStore } from "../stores/authstore";
import CompanyTable from "../components/companies/CompanyTable";
import MemberCompanyTable from "../components/companies/MemberCompanyTable";
import CompanyFilters from "../components/companies/CompanyFilter";
import AddCompanyModal from "../components/companies/AddCompanyModal";
import { api } from "../api/axios";
import type { User } from "../stores/authstore";

export default function Companies() {
  const [filters, setFilters] = useState({});
  const [open, setOpen] = useState(false);

  const { companies, isLoading } = useCompanies(filters);
  
  // Use user and setUser from your newly updated auth store
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const isAdminOrSenior = user?.role === "ADMIN" || user?.role === "SENIOR";

  const { googleConnected, lastSync } = useMemo(() => {
    const org = user?.organization;
    return {
      googleConnected: !!org?.googleAccessToken,
      lastSync: org?.lastSyncedAt || null,
    };
  }, [user?.organization]);

  
  const handleConnect = async () => {
    try {
      const res = await api.get("/google/connect");
      window.location.href = res.data.url;
    } catch (error) {
      console.error("Failed to initiate Google connection", error);
    }
  };
  
  const handleExport = async () => {
    try {
      const res = await api.post("/google/sync");
      window.open(res.data.url, "_blank");
    } catch (error) {
      console.error("Failed to sync with Google Sheets", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Filters & Action Bar */}
      <CompanyFilters 
        onChange={setFilters} 
        onAdd={() => setOpen(true)} 
        onConnect={handleConnect} 
        onExport={handleExport}
        isConnected={googleConnected}
        lastSyncedAt={lastSync}
      />

      {/* Render table conditionally based on Role */}
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

      {/* Add Modal */}
      <AddCompanyModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}