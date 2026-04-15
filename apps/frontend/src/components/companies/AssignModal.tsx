import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { useOrg } from "../../hooks/useOrg";
import { useCompanies } from "../../hooks/useCompany";
import { UserPlus, UserMinus, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AssignModal({ open, onClose, company, selectedIds = [] }: any) {
  const { orgMembers } = useOrg();
  const { assignCompany, bulkAssign } = useCompanies();

  // Track the ID of the user being assigned, or 'unassign' for the unassign action
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const isBulk = selectedIds.length > 0;

  const handleAssign = (targetUserId: string | null) => {
    if (loadingId) return; // Prevent double clicks
    
    setLoadingId(targetUserId === null ? "unassign" : targetUserId);

    const action = isBulk ? bulkAssign : assignCompany;
    const payload = isBulk 
      ? { companyIds: selectedIds, assignedToId: targetUserId }
      : { id: company.id, assignedToId: targetUserId };

    // Use the mutation options to trigger side effects
    action(payload as any, {
      onSuccess: () => {
        toast.success(
          targetUserId 
            ? `${isBulk ? selectedIds.length + ' companies' : 'Company'} assigned successfully!` 
            : `${isBulk ? selectedIds.length + ' companies' : 'Company'} unassigned successfully!`
        );
        onClose();
      },
      onError: () => {
        toast.error("An error occurred. Please try again.");
      },
      onSettled: () => {
        setLoadingId(null);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !loadingId && onClose(open)}>
      <DialogContent className="sm:max-w-[450px] p-0 bg-white overflow-hidden border-slate-200">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2.5 rounded-xl">
              <UserPlus className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                {isBulk ? "Bulk Assign Companies" : "Assign Company"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm mt-1">
                {isBulk 
                  ? `Select a team member to assign ${selectedIds.length} companies to.`
                  : <>Select a team member to assign <span className="font-semibold text-slate-800">{company?.name}</span> to.</>
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 max-h-[50vh] overflow-y-auto space-y-2.5 bg-slate-50/50 relative">
          
          {/* Prevent clicks on the entire list container if loading */}
          {loadingId && (
            <div className="absolute inset-0 z-10 bg-white/20" />
          )}

          {/* UNASSIGN OPTION */}
          {((!isBulk && company?.assignedToId) || isBulk) && (
            <div
              className={`flex items-center justify-between p-3 border rounded-xl transition-all duration-200 bg-red-50/50 border-red-100 mb-4
                ${loadingId ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-red-300 hover:bg-red-50 hover:shadow-sm'}`}
              onClick={() => handleAssign(null)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <UserMinus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-900 leading-none">
                    Unassign
                  </p>
                  <p className="text-xs text-red-600 mt-1.5 line-clamp-1">
                    Remove current assignment
                  </p>
                </div>
              </div>
              {loadingId === "unassign" && (
                <Loader2 className="h-5 w-5 text-red-600 animate-spin mr-2" />
              )}
            </div>
          )}

          {/* TEAM MEMBERS LIST */}
          {orgMembers && orgMembers.length > 0 ? (
            orgMembers.map((m: any) => {
              const isAssigned = !isBulk && company?.assignedToId === m.id;
              const isLoadingThis = loadingId === m.id;

              return (
                <div
                  key={m.id}
                  className={`flex items-center justify-between p-3 border rounded-xl transition-all duration-200 ${
                    isAssigned 
                      ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500 shadow-sm" 
                      : loadingId 
                        ? "bg-white border-slate-200 opacity-70 cursor-not-allowed"
                        : "bg-white border-slate-200 cursor-pointer hover:border-indigo-300 hover:shadow-sm"
                  }`}
                  onClick={() => {
                    if (!isAssigned) handleAssign(m.id);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm overflow-hidden ${
                      isAssigned ? "bg-indigo-200 text-indigo-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {m.name ? m.name.charAt(0).toUpperCase() : m.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 leading-none">
                        {m.name || "Unknown User"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1.5 truncate max-w-[150px]">{m.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                      m.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 
                      m.role === 'SENIOR' ? 'bg-purple-100 text-purple-700' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {m.role}
                    </span>
                    {isLoadingThis ? (
                      <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
                    ) : isAssigned ? (
                      <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">No team members found in this organization.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}