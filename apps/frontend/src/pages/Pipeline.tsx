import { useState } from "react";
import { useCompanies, useInfiniteCompanies } from "../hooks/useCompany";
import CompanyCard from "../components/kanban/CompanyCard";
import { LayoutGrid, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLUMNS = [
  "NOT_CONTACTED",
  "CONTACTED",
  "IN_TALKS",
  "NEGOTIATING",
  "POSITIVE",
  "REJECTED",
  "CLOSED",
];

const STATUS_COLORS: Record<string, string> = {
  NOT_CONTACTED: "bg-slate-100 text-slate-700 border-slate-200",
  CONTACTED: "bg-blue-50 text-blue-700 border-blue-200",
  IN_TALKS: "bg-indigo-50 text-indigo-700 border-indigo-200",
  NEGOTIATING: "bg-amber-50 text-amber-700 border-amber-200",
  POSITIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  CLOSED: "bg-green-50 text-green-700 border-green-200",
};

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function Pipeline() {
  const { updateCompany } = useCompanies({});
  const [draggedCompanyId, setDraggedCompanyId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCompanyId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedCompanyId) return;

    try {
      updateCompany?.({ id: draggedCompanyId, data: { status: newStatus } });
      toast.success(`Moved to ${formatStatus(newStatus)}`);
    } catch {
      toast.error("Failed to update status");
    }

    setDraggedCompanyId(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Scrollbar styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(203, 213, 225, 0.4); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.6); }
      `}} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-indigo-600" />
            Deal Pipeline
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Drag and drop deals across stages. Explore all deals directly within the columns.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STATUS_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            draggedCompanyId={draggedCompanyId}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
}

function KanbanColumn({
  status,
  draggedCompanyId,
  onDragStart,
  onDragOver,
  onDrop,
}: any) {
  const {
    companies,
    totalItems = 0,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCompanies({ status });

  /**
   *  AUTO LOAD ON SCROLL
   */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;

    const isNearBottom =
      el.scrollHeight - el.scrollTop <= el.clientHeight + 20;

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
      className="flex flex-col bg-slate-50/80 rounded-2xl border border-slate-200/60 shadow-sm h-[450px]"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200/60 flex items-center justify-between bg-white rounded-t-2xl shrink-0">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          {formatStatus(status)}
        </h3>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            STATUS_COLORS[status] || "bg-slate-100 text-slate-600"
          }`}
        >
          {totalItems}
        </span>
      </div>

      {/* Body */}
      <div
        className="flex-1 p-3 overflow-y-auto space-y-3 relative group custom-scrollbar"
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 absolute inset-0">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mb-2" />
            <span className="text-xs font-medium">Loading...</span>
          </div>
        ) : totalItems === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white/50 m-1">
            <p className="text-xs font-medium">Drop deals here</p>
          </div>
        ) : (
          <>
            {companies?.map((company: any,index:number) => (
              <div
                key={`${company.id}-${index}`}
                draggable
                onDragStart={(e) => onDragStart(e, company.id)}
                className={`cursor-grab active:cursor-grabbing transition-transform hover:-translate-y-0.5 ${
                  draggedCompanyId === company.id
                    ? "opacity-50 ring-2 ring-indigo-500 rounded-xl"
                    : ""
                }`}
              >
                <div className="pointer-events-none">
                  <CompanyCard company={company} />
                </div>
              </div>
            ))}

            {/* Load More */}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-2.5 mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Load More (
                    {Math.max(0, totalItems - (companies?.length || 0))}
                    )
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}