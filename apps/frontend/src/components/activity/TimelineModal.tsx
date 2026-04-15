import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X, Clock, Phone, Mail, Users, Activity as ActivityIcon } from "lucide-react";
import { useActivity } from "@/hooks/useActivity";
import { format, formatDistanceToNow } from "date-fns";

export default function TimelineModal({ open, onClose, company }: any) {
  // Fetch activity timeline only when a company is selected
  const { activities, isLoading } = useActivity(company?.id);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "CALL": return <Phone className="h-4 w-4" />;
      case "EMAIL": return <Mail className="h-4 w-4" />;
      case "MEETING": return <Users className="h-4 w-4" />;
      default: return <ActivityIcon className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "CALL": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "EMAIL": return "bg-amber-100 text-amber-700 border-amber-200";
      case "MEETING": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                  <div>
                    <Dialog.Title as="h3" className="text-lg font-semibold text-slate-900">
                      Activity Timeline
                    </Dialog.Title>
                    <p className="text-sm text-slate-500 mt-1">
                      History for <span className="font-medium text-slate-700">{company?.name}</span>
                    </p>
                  </div>
                  <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <Clock className="h-8 w-8 animate-spin mb-3 text-indigo-500" />
                      <p className="text-sm">Loading history...</p>
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3">
                         <ActivityIcon className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-slate-500 text-sm">No activity recorded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                      {activities.map((a: any, idx: number) => (
                        <div key={a.id} className="relative flex items-start gap-4">
                          <div className={`shrink-0 z-10 h-10 w-10 rounded-full border shadow-sm flex items-center justify-center bg-white ${getActivityColor(a.type)} relative`}>
                             {getActivityIcon(a.type)}
                          </div>
                          <div className="flex-1 bg-white border border-slate-100 rounded-xl shadow-sm p-4 hover:border-slate-300 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-sm font-semibold text-slate-800 capitalize">
                                {a.type.toLowerCase()}
                              </p>
                              <span className="text-xs text-slate-500 whitespace-nowrap bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                {format(new Date(a.createdAt), 'MMM d, p')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mb-3">
                              Logged by <span className="font-medium text-slate-700">{a.user?.name || "Someone"}</span> • {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                            </p>
                            {a.note && (
                              <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100">
                                {a.note}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}