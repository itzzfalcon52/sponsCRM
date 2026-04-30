import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2, UserPlus, MoreVertical, Phone, ExternalLink, ChevronLeft, ChevronRight, CheckSquare } from "lucide-react";
import AssignModal from "./AssignModal";
import EditCompanyModal from "./EditCompanyModal";
import { getStatusColor } from "./CompanyTableUtils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ActivityModal from "../activity/activityModal";
import TimelineModal from "../activity/TimelineModal";
import { CalendarCheck, Clock } from "lucide-react";

export default function CompanyTable({ 
  companies = [], 
  isLoading = false 
}: any) {
  // Local state for Bulk Assignment
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Local state for Modals & Dropdowns
  const [assignOpen, setAssignOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(companies.length / itemsPerPage);


  //states for activity and timeline
  const [activityOpen, setActivityOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const [timelineOpen, setTimelineOpen] = useState(false);
  const [selectedTimelineCompany, setSelectedTimelineCompany] = useState<any>(null);
  
  const paginatedCompanies = companies.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (company: any, action: 'edit' | 'assign' | 'delete') => {
    setSelected(company);
    setOpenDropdownId(null);
    if (action === 'edit') setEditOpen(true);
    if (action === 'assign') {
      setSelectedIds([]); // Clear any bulk selection
      setAssignOpen(true);
    }
    if (action === 'delete') {
      console.log("Delete", company.id);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedCompanies.length && paginatedCompanies.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedCompanies.map((c: any) => c.id));
    }
  };

  const handleToggleBulkMode = () => {
    setIsBulkMode(!isBulkMode);
    setSelectedIds([]);
  };

  const handleAddActivity = (company: any) => {
    setSelectedCompany(company);
    setActivityOpen(true);
    setOpenDropdownId(null);
  };
  
  const handleViewTimeline = (company: any) => {
    setSelectedTimelineCompany(company);
    setTimelineOpen(true);
    setOpenDropdownId(null);
  };

  const getLatestActivity = (activities: any[]) => {
    if (!activities || !Array.isArray(activities) || activities.length === 0) return null;
  
    const sorted = [...activities].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  
    return sorted[0].type;
  };

  const renderActivityPill = (type: string) => {
    switch (type) {
      case "CALL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            <Phone className="h-3 w-3" /> Call
          </span>
        );
      case "EMAIL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            <Mail className="h-3 w-3" /> Email
          </span>
        );
      case "MEETING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
            <Calendar className="h-3 w-3" /> Meeting
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide bg-slate-50 text-slate-700 border border-slate-200 whitespace-nowrap">
            {type}
          </span>
        );
    }
  };

  // SKELETON LOADER
  const TableSkeleton = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-slate-100 last:border-0">
          {isBulkMode && (
            <td className="px-6 py-4 w-12">
              <div className="h-4 w-4 bg-slate-200 rounded"></div>
            </td>
          )}
          <td className="px-6 py-4">
            <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
            <div className="h-3 w-24 bg-slate-100 rounded"></div>
          </td>
          <td className="px-6 py-4">
            <div className="flex gap-2">
              <div className="h-6 w-6 bg-slate-200 rounded"></div>
              <div className="h-6 w-6 bg-slate-200 rounded"></div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-6 w-20 bg-slate-200 rounded-md"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-slate-200 rounded-full"></div>
              <div className="h-4 w-20 bg-slate-200 rounded"></div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-20 bg-slate-200 rounded"></div>
          </td>
          <td className="px-6 py-4 text-right">
            <div className="h-6 w-6 bg-slate-200 rounded ml-auto"></div>
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-200px)] min-h-[500px]">

      {/* Component Header / Action Bar */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-white/50 backdrop-blur-sm rounded-t-xl">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Company Details</h2>
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">
            {companies.length}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Always visible toggle button */}
          <Button 
            variant={isBulkMode ? "secondary" : "outline"}
            onClick={handleToggleBulkMode}
            className={`font-semibold shadow-sm transition-all ${
              isBulkMode 
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200" 
                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <CheckSquare className="h-4 w-4 mr-2 shrink-0" />
            {isBulkMode ? "Cancel Selection" : "Bulk Assign"}
          </Button>

          {/* Assign Selected button (Only shows when in bulk mode with active selections) */}
          {isBulkMode && selectedIds.length > 0 && (
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-all"
              onClick={() => setAssignOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Selected ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>
      
      {/* Scrollable Table Area */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left border-collapse relative">
          <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200 sticky top-0 z-20 backdrop-blur-sm">
            <tr>
              {isBulkMode && (
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === paginatedCompanies.length && paginatedCompanies.length > 0}
                    onChange={toggleSelectAll}
                    disabled={isLoading}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4 disabled:opacity-50"
                  />
                </th>
              )}
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase whitespace-nowrap">Company Info</th>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase whitespace-nowrap">Contact Info</th>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase whitespace-nowrap">Domain</th>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase whitespace-nowrap">Status</th>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase whitespace-nowrap"> Activity</th>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase whitespace-nowrap">Assigned To</th>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase whitespace-nowrap">Last Contacted</th>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <TableSkeleton />
            ) : paginatedCompanies.length === 0 ? (
              <tr>
                <td colSpan={isBulkMode ? 8 : 7} className="px-6 py-12 text-center">
                  <div className="text-slate-400 font-medium">No companies found.</div>
                  <div className="text-slate-400 text-xs mt-1">Try adjusting your search or filters.</div>
                </td>
              </tr>
            ) : (
              paginatedCompanies.map((c: any) => (
                <tr key={c.id} className={`hover:bg-slate-50/50 transition-colors group ${selectedIds.includes(c.id) ? "bg-indigo-50/30" : ""}`}>
                  
                  {isBulkMode && (
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds([...selectedIds, c.id]);
                          else setSelectedIds(selectedIds.filter((id:string) => id !== c.id));
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                      />
                    </td>
                  )}

                  {/* Company & POC */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
                      {c.contactName || "No Contact"}
                    </div>
                  </td>

                  {/* Connect Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {c.phoneNumber ? (
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(c.phoneNumber);
                            toast.success(`Copied ${c.phoneNumber} to clipboard!`); 
                          }}
                          className="text-slate-500 hover:text-indigo-600 transition-colors p-1.5 rounded-md hover:bg-indigo-50" 
                          title={`Copy ${c.phoneNumber}`}
                        >
                          <Phone className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-slate-300 p-1.5" title="No Phone"><Phone className="h-4 w-4 opacity-50" /></span>
                      )}
                      
                      {c.linkedinUrl ? (
                        <a 
                          href={c.linkedinUrl.startsWith('http') ? c.linkedinUrl : `https://${c.linkedinUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-500 hover:text-blue-600 transition-colors p-1.5 rounded-md hover:bg-blue-50" 
                          title="Open LinkedIn in new tab"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-slate-300 p-1.5" title="No LinkedIn"><ExternalLink className="h-4 w-4 opacity-50" /></span>
                      )}
                    </div>
                  </td>

                  {/* Domain Tag */}
                  <td className="px-6 py-4">
                    {c.domain ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                        {c.domain}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs font-medium">-</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusColor(c.status)}`}>
                      {c.status.replace("_", " ")}
                    </span>
                  </td>

                  {/* Latest Activity */}
                  <td className="px-6 py-4">
  {getLatestActivity(c.activities) ? (
     renderActivityPill(getLatestActivity(c.activities))
  ) : (
    <span className="text-slate-300 text-xs font-medium italic">
      No Activity
    </span>
  )}
</td>

                  {/* Assigned Member */}
                  <td className="px-6 py-4">
                    {c.assignedTo?.name ? (
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 ring-2 ring-white">
                          {c.assignedTo.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-700 whitespace-nowrap">{c.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 italic bg-slate-50 px-2 py-1 rounded-md border border-slate-100 whitespace-nowrap">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Last Contacted */}
                  <td className="px-6 py-4">
                    {c.lastContactedAt ? (
                      <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                        {new Date(c.lastContactedAt).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 italic">
                        Never
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === c.id ? null : c.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {openDropdownId === c.id && (
                      <div 
                        ref={dropdownRef}
                        className="absolute right-10 top-12 w-36 bg-white rounded-xl shadow-lg border border-slate-200 z-[60] py-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-100"
                      >
                        <button 
                          onClick={() => handleAction(c, 'edit')}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Pencil className="h-4 w-4 text-slate-400" /> Edit
                        </button>
                        <button 
                          onClick={() => handleAction(c, 'assign')}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <UserPlus className="h-4 w-4 text-slate-400" /> Assign
                        </button>
                        <button 
                          onClick={() => handleAddActivity(c)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">

                          <CalendarCheck className="h-4 w-4 text-slate-400" /> Add Activity
                        </button>
                        <button 
                          onClick={() => handleViewTimeline(c)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">

                          <Clock className="h-4 w-4 text-slate-400" /> View Timeline
                        </button>

                        <div className="border-t border-slate-100 my-1"></div>
                        <button 
                          onClick={() => handleAction(c, 'delete')}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                          <Trash2 className="h-4 w-4 text-red-400" /> Delete
                          </button>
                        
                  
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between rounded-b-xl">
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-900">{companies.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-900">{Math.min(currentPage * itemsPerPage, companies.length)}</span> of <span className="font-medium text-slate-900">{companies.length}</span> results
        </p>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1 shadow-sm font-medium"
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4 -ml-1" /> Previous
            </Button>
            
            <div className="flex items-center gap-1 hidden sm:flex">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  disabled={isLoading}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                    currentPage === i + 1 
                      ? "bg-indigo-600 text-white shadow-sm" 
                      : "text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1 shadow-sm font-medium"
              disabled={currentPage === totalPages || isLoading}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next <ChevronRight className="h-4 w-4 -mr-1" />
            </Button>
          </div>
        )}
      </div>

      <AssignModal 
        open={assignOpen} 
        company={selected} 
        selectedIds={selectedIds} 
        onClose={() => { 
          setAssignOpen(false); 
          setIsBulkMode(false); 
          setSelectedIds([]); 
        }} 
      />
      <EditCompanyModal open={editOpen} company={selected} onClose={() => setEditOpen(false)} />

      <ActivityModal
     open={activityOpen}
     onClose={() => setActivityOpen(false)}
      company={selectedCompany}
     />

    <TimelineModal
     open={timelineOpen}
     onClose={() => setTimelineOpen(false)}
     company={selectedTimelineCompany}
    />
    </div>
  );
}
