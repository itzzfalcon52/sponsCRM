import { useCompanies } from "../../hooks/useCompany";
import { useOrg } from "../../hooks/useOrg";
import { 
  Building2, 
  IndianRupee, 
  Gift, 
  TrendingUp, 
  CheckCircle2, 
  Users 
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

export default function AdminDashboard() {
  const { companies, isLoading: companiesLoading } = useCompanies();
  const { orgMembers, isOrgMembersLoading } = useOrg();

  if (companiesLoading || isOrgMembersLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  const safeCompanies = companies || [];
  const total = safeCompanies.length;

  // Calculate Status Counts
  const inTalks = safeCompanies.filter((c: any) => c.status === "IN_TALKS").length;
  const negotiating = safeCompanies.filter((c: any) => c.status === "NEGOTIATING").length;
  const closed = safeCompanies.filter((c: any) => c.status === "CLOSED").length;

  // Calculate Member Stats
  const memberStats = (orgMembers || []).map((member: any) => {
    const assignedCount = safeCompanies.filter(
      (c: any) => c.assignedToId === member.id
    ).length;
    return { ...member, assignedCount };
  }).sort((a: any, b: any) => b.assignedCount - a.assignedCount);

  // Calculate Revenue (Only for CLOSED deals)
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

  // Chart Data: Pipeline Status
  const pipelineData = [
    { name: "Not Contacted", count: safeCompanies.filter((c: any) => c.status === "NOT_CONTACTED").length },
    { name: "Contacted", count: safeCompanies.filter((c: any) => c.status === "CONTACTED").length },
    { name: "In Talks", count: inTalks },
    { name: "Negotiating", count: negotiating },
    { name: "Positive", count: safeCompanies.filter((c: any) => c.status === "POSITIVE").length },
    { name: "Closed", count: closed },
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
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h2>
      </div>

      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{total}</div>
            <p className="text-xs text-slate-500 mt-1">In your pipeline</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Closed Deals</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{closed}</div>
            <p className="text-xs text-slate-500 mt-1">Successfully secured</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white -z-10"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700">Cash Raised</CardTitle>
            <IndianRupee className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700">{formatCurrency(totalCash)}</div>
            <p className="text-xs text-indigo-500/80 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> From closed cash deals
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-white -z-10"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-pink-700">In-Kind Value</CardTitle>
            <Gift className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-700">{formatCurrency(totalInKind)}</div>
            <p className="text-xs text-pink-500/80 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> From closed in-kind deals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Pipeline Funnel */}
        <Card className="col-span-4 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Pipeline Distribution</CardTitle>
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
            <CardTitle className="text-lg font-semibold text-slate-800">Revenue Split (Values)</CardTitle>
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
            <CardTitle className="text-lg font-semibold text-slate-800">Recent Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeCompanies.length === 0 ? (
                <p className="text-sm text-slate-500">No companies added yet.</p>
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

        {/* Team Members Workload */}
        <Card className="col-span-3 shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800">Team Pipeline</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memberStats.length === 0 ? (
                <p className="text-sm text-slate-500">No active members.</p>
              ) : (
                memberStats.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                        {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        {member.assignedCount} assigned
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">{member.role}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}