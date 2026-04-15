import { Calendar, Clock, AlertCircle, Building2, User } from "lucide-react";

function CompanyCard({ company }: { company: any }) {
  const followUp = company.nextFollowUp ? new Date(company.nextFollowUp) : null;
  const today = new Date();

  let statusConfig = {
    color: "text-slate-500 bg-slate-50 border-slate-200",
    icon: <Calendar className="h-3 w-3" />,
    label: "No follow-up"
  };

  if (followUp) {
    const isOverdue = followUp < today && followUp.toDateString() !== today.toDateString();
    const isToday = followUp.toDateString() === today.toDateString();

    if (isOverdue) {
      statusConfig = {
        color: "text-rose-700 bg-rose-50 border-rose-200",
        icon: <AlertCircle className="h-3 w-3" />,
        label: `Overdue • ${followUp.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
      };
    } else if (isToday) {
      statusConfig = {
        color: "text-amber-700 bg-amber-50 border-amber-200",
        icon: <Clock className="h-3 w-3" />,
        label: "Due Today"
      };
    } else {
      statusConfig = {
        color: "text-emerald-700 bg-emerald-50 border-emerald-200",
        icon: <Calendar className="h-3 w-3" />,
        label: followUp.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      };
    }
  }

  const assigneeName = company.assignedTo?.name || "Unassigned";
  const assigneeInitials = assigneeName.charAt(0).toUpperCase();

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group relative">
      
      <div className="flex justify-between items-start gap-2">
        {/* Company Info */}
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-sm text-slate-900 truncate flex items-center gap-1.5">
            {company.name}
          </h4>
          <p className="text-[11px] font-medium text-slate-500 mt-1 truncate flex items-center gap-1">
             <Building2 className="h-3 w-3 text-slate-400" />
             {company.industry || "No industry"}
          </p>
        </div>

        {/* Assignee Avatar */}
        <div 
          className="shrink-0 h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 ring-2 ring-white shadow-sm tooltip-trigger" 
          title={`Assigned to: ${assigneeName}`}
        >
          {company.assignedTo ? assigneeInitials : <User className="h-3 w-3 text-slate-400" />}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-slate-100 my-3 hidden group-hover:block transition-all"></div>

      {/* Footer / Actions */}
      <div className="mt-4 flex items-center justify-between mt-auto">
        
        {/* Follow-up Badge */}
        {followUp ? (
           <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-semibold ${statusConfig.color}`}>
             {statusConfig.icon}
             <span>{statusConfig.label}</span>
           </div>
        ) : (
           <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
             <Calendar className="h-3 w-3" /> No follow-up
           </div>
        )}

      </div>
    </div>
  );
}

export default CompanyCard;