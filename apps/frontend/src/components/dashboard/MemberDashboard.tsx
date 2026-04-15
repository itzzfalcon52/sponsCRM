import { useCompanies } from "../../hooks/useCompany";
import { 
  Building2, 
  IndianRupee, 
  Gift, 
  TrendingUp, 
  CheckCircle2, 
  CalendarClock 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function MemberDashboard() {
  const { companies, isLoading: companiesLoading } = useCompanies();

  if (companiesLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  // Safely extract the array. If API returned { data: [...] } or { companies: { data: [...] } }, handle it.
  let safeCompanies: any[] = [];
  
  if (Array.isArray(companies)) {
    safeCompanies = companies;
  } else if (companies && Array.isArray((companies as any).companies)) {
    safeCompanies = (companies as any).companies;
  } else if (companies && Array.isArray((companies as any).data)) {
    safeCompanies = (companies as any).data;
  }

  const total = safeCompanies.length;


  // Calculate Status Counts
  const inTalks = safeCompanies.filter((c: any) => c.status === "IN_TALKS").length;
  const negotiating = safeCompanies.filter((c: any) => c.status === "NEGOTIATING").length;
  const positive = safeCompanies.filter((c: any) => c.status === "POSITIVE").length;
  const closed = safeCompanies.filter((c: any) => c.status === "CLOSED").length;
  const rejected = safeCompanies.filter((c: any) => c.status === "REJECTED").length;

  // Calculate Revenue (Only for their CLOSED deals)
  const closedDeals = safeCompanies.filter((c: any) => c.status === "CLOSED");
  
  const totalCash = closedDeals
    .filter((c: any) => c.type === "CASH")
    .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);

  const totalInKind = closedDeals
    .filter((c: any) => c.type === "IN_KIND")
    .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);

  // Formatter for currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Follow-up calculations
  const getDaysDifference = (targetDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatFollowUpText = (dateString: string) => {
    const diffDays = getDaysDifference(dateString);
    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, styles: 'bg-red-100 text-red-700' };
    if (diffDays === 0) return { text: 'Today', styles: 'bg-amber-100 text-amber-700' };
    if (diffDays === 1) return { text: 'Tomorrow', styles: 'bg-blue-100 text-blue-700' };
    return { text: `In ${diffDays} days`, styles: 'bg-slate-100 text-slate-700' };
  };

  const upcomingFollowUps = safeCompanies
    .filter((c: any) => c.nextFollowUp && c.status !== "CLOSED" && c.status !== "REJECTED")
    .sort((a:any, b:any) => new Date(a.nextFollowUp).getTime() - new Date(b.nextFollowUp).getTime())
    .slice(0, 5);

  // Chart Data: Pipeline Status
  const pipelineData = [
    { name: "Not Contacted", count: safeCompanies.filter((c: any) => c.status === "NOT_CONTACTED").length },
    { name: "Contacted", count: safeCompanies.filter((c: any) => c.status === "CONTACTED").length },
    { name: "In Talks", count: inTalks },
    { name: "Negotiating", count: negotiating },
    { name: "Positive", count: positive },
    { name: "Closed", count: closed },
    { name: "Rejected", count: rejected },
  ];

  // Chart Data: Deal Types (Pie Chart)
  const dealTypeData = [
    { name: "Cash", value: totalCash },
    { name: "In-Kind", value: totalInKind },
  ];
  const COLORS = ["#4f46e5", "#ec4899"]; // Indigo & Pink

  return (
    <div className="flex-1 space-y-6 p-8 bg-slate-50 min-h-screen">
      
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">My Workspace</h2>
      </div>

      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Assigned to Me</CardTitle>
            <Building2 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{total}</div>
            <p className="text-xs text-slate-500 mt-1">Companies in your queue</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">My Closed Deals</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{closed}</div>
            <p className="text-xs text-slate-500 mt-1">Successfully secured by you</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white -z-10"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700">My Cash Raised</CardTitle>
            <IndianRupee className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700">{formatCurrency(totalCash)}</div>
            <p className="text-xs text-indigo-500/80 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> From your closed deals
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-white -z-10"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-pink-700">My In-Kind Value</CardTitle>
            <Gift className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-700">{formatCurrency(totalInKind)}</div>
            <p className="text-xs text-pink-500/80 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> From your closed deals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Pipeline Funnel */}
        <Card className="col-span-4 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">My Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Split */}
        <Card className="col-span-3 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">My Secured Values</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {totalCash === 0 && totalInKind === 0 ? (
               <div className="h-[250px] flex items-center justify-center text-slate-400">No closed deals yet</div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dealTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dealTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full bg-indigo-600"></div> Cash
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full bg-pink-500"></div> In-Kind
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row Tables */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Recent Activity Table */}
        <Card className="col-span-4 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">My Assigned Companies (Recent)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeCompanies.length === 0 ? (
                <p className="text-sm text-slate-500">No companies assigned to you yet.</p>
              ) : (
                safeCompanies.slice(0, 5).map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{c.contactName} • {c.domain || "No Domain"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${c.status === "CLOSED" ? "bg-green-100 text-green-800" : 
                          c.status === "REJECTED" ? "bg-red-100 text-red-800" : 
                          "bg-indigo-100 text-indigo-800"}`}>
                        {c.status.replace("_", " ")}
                      </span>
                      {c.amount > 0 && c.status === "CLOSED" && (
                         <span className="text-xs font-semibold text-slate-600">
                           {formatCurrency(c.amount)} ({c.type})
                         </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Follow-ups Table */}
        <Card className="col-span-3 shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800">Upcoming Follow-ups</CardTitle>
            <CalendarClock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingFollowUps.length === 0 ? (
                <p className="text-sm text-slate-500 flex flex-col items-center justify-center py-6 text-center">
                  <CalendarClock className="h-8 w-8 text-slate-200 mb-2" />
                  No upcoming follow-ups scheduled.
                </p>
              ) : (
                upcomingFollowUps.map((c: any) => {
                  const status = formatFollowUpText(c.nextFollowUp);
                  return (
                    <div key={c.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium text-slate-900 truncate max-w-[150px]">{c.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(c.nextFollowUp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${status.styles}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}