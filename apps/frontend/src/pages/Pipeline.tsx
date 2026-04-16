import { useState } from "react";
import { useCompanies, useInfiniteCompanies } from "../hooks/useCompany";
import CompanyCard from "../components/kanban/CompanyCard";
import { LayoutGrid, Loader2, ChevronDown, Plus } from "lucide-react";
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

const STATUS_CONFIG: Record<string, { color: string; dot: string }> = {
  NOT_CONTACTED: { color: "border-l-slate-400", dot: "bg-slate-400" },
  CONTACTED: { color: "border-l-blue-500", dot: "bg-blue-500" },
  IN_TALKS: { color: "border-l-indigo-500", dot: "bg-indigo-500" },
  NEGOTIATING: { color: "border-l-amber-500", dot: "bg-amber-500" },
  POSITIVE: { color: "border-l-emerald-500", dot: "bg-emerald-500" },
  REJECTED: { color: "border-l-rose-500", dot: "bg-rose-500" },
  CLOSED: { color: "border-l-green-600", dot: "bg-green-600" },
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
    // Create a transparent drag ghost image or just set data
    e.dataTransfer.setData("text/plain", id);
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
      toast.success(`Pipeline updated: ${formatStatus(newStatus)}`, {
        icon: <LayoutGrid className="h-4 w-4 text-indigo-500" />,
      });
    } catch {
      toast.error("Failed to move deal");
    }

    setDraggedCompanyId(null);
  };

  return (
    <div className="p-8 min-h-screen bg-[#fcfcfd] space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* SaaS Custom Scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .kanban-scroll::-webkit-scrollbar { width: 5px; }
        .kanban-scroll::-webkit-scrollbar-track { background: transparent; }
        .kanban-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .kanban-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
              <LayoutGrid className="h-6 w-6 text-white" />
            </div>
            Deal Pipeline
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Manage your sponsorship flow with high-velocity drag & drop.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 shadow-sm flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Live Pipeline
            </div>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
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

  const [isOver, setIsOver] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isNearBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 50;
    if (isNearBottom && hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  return (
    <div
      onDragOver={(e) => { onDragOver(e); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => { onDrop(e, status); setIsOver(false); }}
      className={`flex flex-col shrink-0 w-[340px] bg-slate-50/50 backdrop-blur-sm rounded-3xl border-2 transition-all duration-200 h-[calc(100vh-280px)] min-h-[500px] snap-center
        ${isOver ? "border-indigo-400 bg-indigo-50/30 scale-[1.01] shadow-xl" : "border-slate-200/60 shadow-sm"}
        ${STATUS_CONFIG[status]?.color} border-l-4`}
    >
      {/* Column Header */}
      <div className="p-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className={`h-2 w-2 rounded-full ${STATUS_CONFIG[status]?.dot}`} />
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">
            {formatStatus(status)}
          </h3>
        </div>
        <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-black text-slate-500 shadow-sm">
          {totalItems}
        </div>
      </div>

      {/* Column Content */}
      <div
        className="flex-1 p-4 overflow-y-auto space-y-4 kanban-scroll"
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500/40" />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Syncing leads...</p>
          </div>
        ) : totalItems === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200/80 rounded-2xl bg-slate-100/30">
            <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                <Plus className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight italic">No Deals Yet</p>
          </div>
        ) : (
          <>
            {companies?.map((company: any, index: number) => (
              <div
                key={`${company.id}-${index}`}
                draggable
                onDragStart={(e) => onDragStart(e, company.id)}
                className={`group relative transition-all duration-300 active:scale-95 active:rotate-1
                  ${draggedCompanyId === company.id ? "opacity-20 scale-95" : "opacity-100"}
                `}
              >
                <div className="pointer-events-none transform transition-transform group-hover:scale-[1.02]">
                  <CompanyCard company={company} />
                </div>
              </div>
            ))}

            {/* Load More Trigger */}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-4 mt-2 flex flex-col items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all border-2 border-transparent hover:border-indigo-100 rounded-2xl hover:bg-white"
              >
                {isFetchingNextPage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span>View {totalItems - (companies?.length || 0)} More</span>
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