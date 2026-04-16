import { useState } from "react";
import { useCompanies, useInfiniteCompanies } from "../hooks/useCompany";
import CompanyCard from "../components/kanban/CompanyCard";
import { LayoutGrid, Loader2, ChevronDown, Plus, Zap, Users } from "lucide-react";
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

const STATUS_CONFIG: Record<string, { color: string; dot: string; bg: string }> = {
  NOT_CONTACTED: { color: "border-l-slate-300", dot: "bg-slate-400", bg: "bg-slate-500/5" },
  CONTACTED: { color: "border-l-blue-400", dot: "bg-blue-500", bg: "bg-blue-500/5" },
  IN_TALKS: { color: "border-l-indigo-400", dot: "bg-indigo-500", bg: "bg-indigo-500/5" },
  NEGOTIATING: { color: "border-l-amber-400", dot: "bg-amber-500", bg: "bg-amber-500/5" },
  POSITIVE: { color: "border-l-emerald-400", dot: "bg-emerald-500", bg: "bg-emerald-500/5" },
  REJECTED: { color: "border-l-rose-400", dot: "bg-rose-500", bg: "bg-rose-500/5" },
  CLOSED: { color: "border-l-green-500", dot: "bg-green-600", bg: "bg-green-600/5" },
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
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedCompanyId) return;

    try {
      updateCompany?.({ id: draggedCompanyId, data: { status: newStatus } });
      toast.success(`Pipeline updated: ${formatStatus(newStatus)}`, {
        icon: <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />,
      });
    } catch (err) {
      toast.error("Update failed");
    }
    setDraggedCompanyId(null);
  };

  return (
    <div className="h-screen flex flex-col bg-[#f9fafb] overflow-hidden">
      
      {/* SaaS Premium Scrollbar Styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .kanban-board-wrapper::-webkit-scrollbar { height: 10px; }
        .kanban-board-wrapper::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .kanban-board-wrapper::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 3px solid #f1f5f9; }
        .kanban-board-wrapper::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        .column-scroll::-webkit-scrollbar { width: 5px; }
        .column-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />

      {/* Page Header */}
      <header className="px-8 pt-8 pb-6 shrink-0 flex items-center justify-between bg-[#f9fafb]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 rotate-3">
             <LayoutGrid className="h-6 w-6 text-white -rotate-3" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Deal Pipeline</h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">Sponscrm Workflow</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2 mr-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 shadow-sm" />
            ))}
          </div>
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Users className="h-4 w-4" /> Team View
          </button>
        </div>
      </header>

      {/* THE KANBAN BOARD - FIX FOR HORIZONTAL SCROLLING */}
      <main className="flex-1 overflow-x-auto kanban-board-wrapper px-8 pb-12 flex flex-row gap-6 items-start">
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
        {/* Spacer to allow scrolling past the last column */}
        <div className="shrink-0 w-8 h-full" />
      </main>
    </div>
  );
}

function KanbanColumn({ status, draggedCompanyId, onDragStart, onDragOver, onDrop }: any) {
  const { 
    companies, 
    totalItems = 0, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteCompanies({ status });

  const [isOver, setIsOver] = useState(false);

  return (
    <div
      onDragOver={(e) => { onDragOver(e); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => { onDrop(e, status); setIsOver(false); }}
      className={`flex flex-col shrink-0 w-[320px] max-h-full bg-white rounded-3xl border transition-all duration-300 relative
        ${isOver ? "border-indigo-500 bg-indigo-50/20 scale-[1.02] shadow-2xl z-20" : "border-slate-200 shadow-sm hover:shadow-md"}
        ${STATUS_CONFIG[status]?.color} border-l-[4px]`}
    >
      {/* Background Accent */}
      <div className={`absolute inset-0 ${STATUS_CONFIG[status]?.bg} opacity-50 pointer-events-none rounded-3xl`} />

      {/* Header */}
      <div className="p-5 flex items-center justify-between shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`h-2.5 w-2.5 rounded-full ${STATUS_CONFIG[status]?.dot} shadow-sm`} />
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
            {formatStatus(status)}
          </h3>
        </div>
        <div className="h-6 min-w-[24px] px-1.5 flex items-center justify-center rounded-lg bg-slate-900 text-[10px] font-black text-white">
          {totalItems}
        </div>
      </div>

      {/* Cards List */}
      <div
        className="flex-1 overflow-y-auto px-3 pb-6 space-y-4 column-scroll relative z-10"
        onScroll={(e) => {
          const el = e.currentTarget;
          if (el.scrollHeight - el.scrollTop <= el.clientHeight + 100 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Updating stage...</p>
          </div>
        ) : totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 m-1">
             <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-2">
                <Plus className="h-4 w-4 text-slate-300" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No deals here</p>
          </div>
        ) : (
          <>
            {companies?.map((company: any, index: number) => (
              <div
                key={`${company.id}-${index}`}
                draggable
                onDragStart={(e) => onDragStart(e, company.id)}
                className={`transition-all duration-300 cursor-grab active:cursor-grabbing
                  ${draggedCompanyId === company.id ? "opacity-25 scale-90 rotate-2" : "opacity-100 hover:-translate-y-1"}
                `}
              >
                 {/* Card Wrapper for micro-interaction */}
                 <div className="pointer-events-none">
                   <CompanyCard company={company} />
                 </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-4 flex flex-col items-center justify-center gap-2 group transition-all"
              >
                {isFetchingNextPage ? (
                  <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                ) : (
                  <>
                    <div className="h-1 w-8 bg-slate-200 rounded-full group-hover:bg-indigo-300 transition-colors" />
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter group-hover:text-indigo-600">
                      View {totalItems - (companies?.length || 0)} More Deals
                    </span>
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