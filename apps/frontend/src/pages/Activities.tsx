import { useActivity } from "@/hooks/useActivity"; 
import { useAuthStore } from "../stores/authstore";
import { formatDistanceToNow, format } from "date-fns";
import { 
  Phone, Mail, Calendar as CalendarIcon, Clock, AlertCircle, 
  CheckCircle2, Trophy, TrendingUp, Activity as ActivityIcon, Users 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

export default function Activities() {
  const { overdue, today, allActivities, isLoading } = useActivity();
  const user = useAuthStore((s) => s.user) as any;

  const isAdminOrSenior = user?.role === "ADMIN" || user?.role === "SENIOR";

  // SCOPE DATA BASED ON ROLE
  const displayActivities = isAdminOrSenior 
    ? allActivities 
    : allActivities.filter((a: any) => a.user?.id === user?.id || a.userId === user?.id);

    // Ignore CLOSED and REJECTED states
    const displayOverdue = overdue.filter(
      (c: any) => c.status !== "CLOSED" && c.status !== "REJECTED"
    );
  
    const displayToday = today.filter(
      (c: any) => c.status !== "CLOSED" && c.status !== "REJECTED"
    );

   

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <ActivityIcon className="h-8 w-8 animate-pulse text-indigo-500" />
          <p className="text-sm font-medium animate-pulse">Loading activity dashboard...</p>
        </div>
      </div>
    );
  }

  // --- DATA PROCESSING ---

  // 1. Leaderboard Logic (Admin/Senior)
  const userActivityCounts = displayActivities.reduce((acc: any, act: any) => {
    if (!act.user) return acc;
    const uid = act.user.id;
    if (!acc[uid]) acc[uid] = { name: act.user.name || "Unknown", count: 0, avatar: act.user.name?.[0] || "?" };
    acc[uid].count += 1;
    return acc;
  }, {});

  const topPerformers = Object.values(userActivityCounts)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);

  // 2. Activity Trends (Last 7 Days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return format(d, "MMM dd");
  });

  const trendData = last7Days.map(dateStr => {
    const count = displayActivities.filter((a: any) => format(new Date(a.createdAt), "MMM dd") === dateStr).length;
    return { name: dateStr, activities: count };
  });

  // 3. Helpers
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
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ActivityIcon className="h-7 w-7 text-indigo-600" />
            Activity Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdminOrSenior ? "Overview of your team's engagement and performance." : "Track your recent activities and upcoming action items."}
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Activities</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{displayActivities.length}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-slate-500">Overdue Follow-ups</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{displayOverdue.length}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-slate-500">Due Today</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{displayToday.length}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-slate-500">Companies Engaged</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {new Set(displayActivities.map((a: any) => a.companyId)).size}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CHARTS AND FEED */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* CHART: ACTIVITY TREND */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <h2 className="text-base font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
               Activity Trend (Last 7 Days)
            </h2>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip 
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '10px' }}
                  />
                  <Bar dataKey="activities" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ACTIVITY FEED */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 backdrop-blur-sm">
              <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <ActivityIcon className="h-5 w-5 text-slate-500" />
                Recent Activity Feed
              </h2>
            </div>
            <div className="p-0">
              {displayActivities.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ActivityIcon className="h-8 w-8 text-slate-300" />
                  </div>
                  No recent activities found. Create some!
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {displayActivities.map((activity: any) => (
                    <div key={activity.id} className="p-5 hover:bg-slate-50 transition-colors flex gap-4">
                      <div className={`mt-0.5 shrink-0 flex items-center justify-center h-10 w-10 rounded-full border shadow-sm ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                           <p className="text-sm font-medium text-slate-900 leading-relaxed">
                             {isAdminOrSenior ? (
                               <span className="font-semibold text-indigo-600">{activity.user?.name || "Team Member"}</span>
                             ) : "You"}
                             <span className="font-normal text-slate-500"> logged a </span>
                             <span className="font-semibold lowercase">{activity.type}</span>
                             <span className="font-normal text-slate-500"> with </span>
                             <span className="font-semibold text-slate-800">{activity.company?.name || "a company"}</span>
                           </p>
                           <span className="text-xs font-medium text-slate-400 shrink-0 whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded-full">
                             {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                           </span>
                        </div>
                        {activity.note && (
                          <div className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-slate-200 before:rounded-l-lg">
                            <span className="pl-2 block">{activity.note}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION ITEMS & LEADERBOARD */}
        <div className="space-y-8 xl:col-span-1">
          
          {/* PERFORMANCE LEADERBOARD (Admin/Senior) */}
          {isAdminOrSenior && topPerformers.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200/60 bg-gradient-to-r from-amber-50 to-white relative">
                <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Top Performers
                </h2>
              </div>
              <div className="p-5 pb-6">
                <div className="space-y-4">
                  {topPerformers.map((u: any, idx: number) => (
                    <div key={u.name} className="flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                         <div className="relative">
                           <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                             idx === 0 ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200' : 'bg-slate-100 text-slate-600'
                           }`}>
                             {u.avatar}
                           </div>
                           {idx === 0 && (
                             <div className="absolute -top-1 -right-1 h-4 w-4 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                               <Trophy className="h-2.5 w-2.5 text-white" />
                             </div>
                           )}
                         </div>
                         <div>
                           <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{u.name}</p>
                           <p className="text-xs font-medium text-slate-500">{u.count} interactions</p>
                         </div>
                       </div>
                       <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                         idx === 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                       }`}>
                         {u.count}
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ACTION ITEMS */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm">
              <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-slate-500" />
                Action Items
              </h2>
            </div>
            
            <div className="p-5 space-y-6">
              {/* OVERDUE */}
              <div>
                <h3 className="text-xs font-bold tracking-wider text-rose-600 uppercase flex items-center gap-1.5 mb-3">
                  <AlertCircle className="h-3.5 w-3.5" /> Overdue ({displayOverdue.length})
                </h3>
                {displayOverdue.length === 0 ? (
                  <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700 italic border border-green-100 font-medium">All caught up! 🎉</div>
                ) : (
                  <div className="space-y-2">
                    {displayOverdue.slice(0, 5).map((c: any) => (
                      <div key={c.id} className="group p-3 bg-white border border-rose-100 hover:border-rose-300 rounded-lg shadow-sm transition-all flex justify-between items-center cursor-pointer">
                        <div className="min-w-0 pr-3">
                          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-rose-700 transition-colors">{c.name}</p>
                          {isAdminOrSenior && (
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              Rep: <span className="font-medium text-slate-700">{c.assignedTo?.name || "Unassigned"}</span>
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-[10px] uppercase tracking-wider font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-1 rounded-md">
                          Overdue
                        </span>
                      </div>
                    ))}
                    {displayOverdue.length > 5 && (
                      <button className="w-full text-xs text-center text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-semibold py-2 rounded-md transition-colors">
                        View all {displayOverdue.length} overdue tasks
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* TODAY */}
              <div>
                <h3 className="text-xs font-bold tracking-wider text-amber-600 uppercase flex items-center gap-1.5 mb-3">
                  <Clock className="h-3.5 w-3.5" /> Due Today ({displayToday.length})
                </h3>
                {displayToday.length === 0 ? (
                  <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-500 italic border border-slate-100">No tasks due today.</div>
                ) : (
                  <div className="space-y-2">
                    {displayToday.slice(0, 5).map((c: any) => (
                      <div key={c.id} className="group p-3 bg-white border border-amber-100 hover:border-amber-300 rounded-lg shadow-sm transition-all flex justify-between items-center cursor-pointer">
                        <div className="min-w-0 pr-3">
                          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-amber-700 transition-colors">{c.name}</p>
                          {isAdminOrSenior && (
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              Rep: <span className="font-medium text-slate-700">{c.assignedTo?.name || "Unassigned"}</span>
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-[10px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md">
                          Today
                        </span>
                      </div>
                    ))}
                    {displayToday.length > 5 && (
                      <button className="w-full text-xs text-center text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-semibold py-2 rounded-md transition-colors">
                        View all {displayToday.length} tasks due today
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}