import { useState, useRef, useEffect } from "react";
import { Pencil, MoreVertical, Phone, ExternalLink, ChevronLeft, ChevronRight, CalendarCheck, Mail, Calendar,Clock } from "lucide-react";
import EditCompanyModal from "./EditCompanyModal";
import { getStatusColor } from "./CompanyTableUtils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ActivityModal from "../activity/activityModal";
import TimelineModal from "../activity/TimelineModal"

export default function MemberCompanyTable({ 
  companies = [], 
  isLoading = false,
  filters = {} 
}: any) {
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const [activityOpen, setActivityOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null); 

  const [timelineOpen, setTimelineOpen] = useState(false);
  const [selectedTimelineCompany, setSelectedTimelineCompany] = useState<any>(null);

  
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  let safeCompanies: any[] = [];
  if (Array.isArray(companies)) {
    safeCompanies = companies;
  } else if (companies && Array.isArray(companies.companies)) {
    safeCompanies = companies.companies;
  } else if (companies && Array.isArray(companies.data)) {
    safeCompanies = companies.data;
  }

  const filteredCompanies = safeCompanies.filter((c: any) => {
    let match = true;
    
    if (filters.q) {
      const search = filters.q.toLowerCase();
      const matchesSearch = 
        c.name?.toLowerCase().includes(search) || 
        c.contactName?.toLowerCase().includes(search) || 
        c.domain?.toLowerCase().includes(search);
      match = match && matchesSearch;
    }

    if (filters.status) {
      match = match && c.status === filters.status;
    }

    if (filters.domain) {
      match = match && c.domain?.toLowerCase().includes(filters.domain.toLowerCase());
    }

    return match;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (company: any, action: 'edit') => {
    setSelected(company);
    setOpenDropdownId(null);
    if (action === 'edit') setEditOpen(true);
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

  // Safely gets the latest activity, sorting them just in case they aren't ordered from backend
  const getLatestActivity = (activities: any[]) => {
    if (!activities || !Array.isArray(activities) || activities.length === 0) return null;
    
    // Sort descending by date (createdAt)
    const sorted = [...activities].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
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

  const TableSkeleton = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-slate-100 last:border-0">
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
            <div className="h-6 w-20 bg-slate-200 rounded-md"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-6 w-24 bg-slate-200 rounded-md"></div>
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
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left border-collapse relative">
          <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200 sticky top-0 z-20 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase whitespace-nowrap">Company Info</th>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase whitespace-nowrap">Contact Info</th>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase whitespace-nowrap">Domain</th>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase whitespace-nowrap">Status</th>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase whitespace-nowrap">Activity</th>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase whitespace-nowrap">Follow Up</th>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <TableSkeleton />
            ) : paginatedCompanies.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="text-slate-400 font-medium">No companies found.</div>
                  <div className="text-slate-400 text-xs mt-1">Try adapting your search or filter requirements.</div>
                </td>
              </tr>
            ) : (
              paginatedCompanies.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group pl-2">
                  
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
                      {c.contactName || "No Contact"}
                    </div>
                  </td>

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

                  <td className="px-6 py-4">
                    {c.domain ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {c.domain}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs font-medium">-</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusColor(c.status)}`}>
                      {c.status.replace("_", " ")}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {getLatestActivity(c.activities) ? (
                      renderActivityPill(getLatestActivity(c.activities))
                    ) : (
                      <span className="text-slate-400 text-xs italic">No activity</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {c.nextFollowUp ? (
                      <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                        {new Date(c.nextFollowUp).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 italic">
                        Not set
                      </span>
                    )}
                  </td>

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
                        className="absolute right-10 top-12 w-40 bg-white rounded-xl shadow-lg border border-slate-200 z-[60] py-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-100"
                      >
                        <button 
                          onClick={() => handleAction(c, 'edit')}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Pencil className="h-4 w-4 text-slate-400" /> Edit
                        </button>

                        <button 
                            onClick={() => handleAddActivity(c)}
                             className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                           <CalendarCheck className="h-4 w-4 text-indigo-500" />
                           Log Activity
                        </button>

                        <button 
                            onClick={() => handleViewTimeline(c)}
                             className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
                          >
                           <Clock className="h-4 w-4 text-slate-400" />
                           View Timeline
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

      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-900">{filteredCompanies.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-900">{Math.min(currentPage * itemsPerPage, filteredCompanies.length)}</span> of <span className="font-medium text-slate-900">{filteredCompanies.length}</span> results
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

      <EditCompanyModal 
        open={editOpen} 
        onClose={() => setEditOpen(false)} 
        company={selected} 
      />

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