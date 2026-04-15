import { useState, useEffect } from "react";
import { useActivity } from "../../hooks/useActivity";
import { Button } from "@/components/ui/button";
import { X, Phone, Mail, Calendar, Loader2 } from "lucide-react";

export default function ActivityModal({
  open,
  onClose,
  company,
}: any) {
  const [type, setType] = useState<"CALL" | "EMAIL" | "MEETING">("CALL");
  const [note, setNote] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");

  const { createActivity, isLoading } = useActivity(company?.id);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setType("CALL");
      setNote("");
      setNextFollowUp("");
    }
  }, [open]);

  if (!open || !company) return null;

  const handleSubmit = () => {
    createActivity({
      companyId: company.id,
      type,
      note,
      nextFollowUp: nextFollowUp || undefined,
    });

    onClose();
  };

  const activityTypes = [
    { value: "CALL", label: "Call", icon: Phone },
    { value: "EMAIL", label: "Email", icon: Mail },
    { value: "MEETING", label: "Meeting", icon: Calendar },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Log Activity
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              {company.name}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Type Selector (Segmented Control) */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-slate-700">Activity Type</label>
            <div className="grid grid-cols-3 gap-3">
              {activityTypes.map(({ value, label, icon: Icon }) => {
                const isActive = type === value;
                return (
                  <button
                    key={value}
                    onClick={() => setType(value as any)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      isActive 
                        ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-1 ring-indigo-600 shadow-sm" 
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <Icon className={`h-5 w-5 mb-1.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-slate-700">Notes & Details</label>
            <textarea
              placeholder="What was discussed?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[120px] resize-none shadow-sm"
            />
          </div>

          {/* Follow-up */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
              <span>Next Follow-up Date</span>
              <span className="text-xs font-normal text-slate-400">Optional</span>
            </label>
            <input
              type="date"
              value={nextFollowUp}
              onChange={(e) => setNextFollowUp(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Button>

          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !note.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm min-w-[120px]"
          >
            {isLoading? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              "Save Activity"
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}