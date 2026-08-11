import { useCompanies } from "../../hooks/useCompany";
import { useOrg } from "../../hooks/useOrg";
import { 
  Building2, 
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

// SaaS Standard: Probability weights for the weighted pipeline
const STATUS_PROBABILITY: Record<string, number> = {
  NOT_CONTACTED: 0.05,
  CONTACTED: 0.15,
  IN_TALKS: 0.35,
  NEGOTIATING: 0.60,
  POSITIVE: 0.85,
  CLOSED: 1.0,
  REJECTED: 0,
};

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

  const inTalks = safeCompanies.filter((c: any) => c.status === "IN_TALKS").length;
  const negotiating = safeCompanies.filter((c: any) => c.status === "NEGOTIATING").length;
  const closed = safeCompanies.filter((c: any) => c.status === "CLOSED").length;

  // MEMBER STATS
  const memberStats = (orgMembers || []).map((member: any) => {
    const assignedCount = safeCompanies.filter(
      (c: any) => c.assignedToId === member.id
    ).length;
    return { ...member, assignedCount };
  }).sort((a: any, b: any) => b.assignedCount - a.assignedCount);

  // ACTUAL REVENUE (CLOSED)
  const closedDeals = safeCompanies.filter((c: any) => c.status === "CLOSED");
  const totalCash = closedDeals
    .filter((c: any) => c.type === "CASH")
    .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);

  const totalInKind = closedDeals
    .filter((c: any) => c.type === "IN_KIND")
    .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);

  // WEIGHTED PIPELINE (SAAS LOGIC)
  // Calculates expected value based on status probability
  const weightedPipeline = safeCompanies.reduce((sum: number, c: any) => {
    if (c.type !== "CASH") return sum;
    const probability = STATUS_PROBABILITY[c.status] || 0;
    return sum + (c.amount || 0) * probability;
  }, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const pipelineData = [
    { name: "Not Contacted", count: safeCompanies.filter((c: any) => c.status === "NOT_CONTACTED").length },
    { name: "Contacted", count: safeCompanies.filter((c: any) => c.status === "CONTACTED").length },
    { name: "In Talks", count: inTalks },
    { name: "Negotiating", count: negotiating },
    { name: "Positive", count: safeCompanies.filter((c: any) => c.status === "POSITIVE").length },
    { name: "Closed", count: closed },
  ];

  const dealTypeData = [
    { name: "Cash", value: totalCash },
    { name: "In-Kind", value: totalInKind },
  ];
  const COLORS = ["#4f46e5", "#ec4899"];

  return (
    <div className="flex-1 min-h-screen space-y-6 bg-background p-8 text-foreground">
      
      <div className="flex items-center justify-between space-y-2">
      <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
      </div>

      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Pipeline</CardTitle>
            <Building2 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{total}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Active company entries</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Conversion</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{closed}</div>
            <p className="text-xs text-emerald-600 mt-1 font-medium bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
               {total > 0 ? ((closed/total)*100).toFixed(1) : 0}% success rate
            </p>
          </CardContent>
        </Card>

        {/* Weighted Cash Card - The SaaS "Forecast" Card */}
        <Card className="border-border bg-card shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/30 -z-10"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-indigo-700 uppercase tracking-wider">Revenue Forecast</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700">{formatCurrency(weightedPipeline)}</div>
            <div className="flex flex-col gap-1 mt-1">
                <p className="text-[10px] text-indigo-500 font-bold uppercase">Weighted Pipeline Value</p>
                <p className="text-xs text-muted-foreground font-medium italic">Actual Collected: {formatCurrency(totalCash)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
           <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-transparent dark:from-pink-950/30 -z-10"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-pink-700 uppercase tracking-wider">In-Kind Value</CardTitle>
            <Gift className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-700">{formatCurrency(totalInKind)}</div>
            <p className="text-xs text-pink-500 mt-1 font-medium bg-pink-50 w-fit px-2 py-0.5 rounded-full">
              Non-monetary assets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Pipeline Funnel */}
        <Card className="col-span-4 border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-card-foreground">Pipeline Velocity</CardTitle>
            <span className="text-[10px] bg-slate-100 text-muted-foreground px-2 py-1 rounded uppercase font-bold tracking-tighter">Real-time</span>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--popover)",
                   color: "var(--popover-foreground)",
                   boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        

        {/* Revenue Split */}
        <Card className="col-span-3 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-card-foreground">Financial Split</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {totalCash === 0 && totalInKind === 0 ? (
               <div className="h-[250px] flex items-center justify-center text-muted-foreground font-medium animate-pulse">Waiting for first deal...</div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dealTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {dealTypeData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value: any) => formatCurrency(Number(value) || 0)} 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-card-foreground">
                <div className="h-2 w-2 rounded-full bg-indigo-600"></div> CASH
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-card-foreground">
                <div className="h-2 w-2 rounded-full bg-pink-500"></div> IN-KIND
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row Tables */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Recent Activity Table */}
        <Card className="col-span-4 border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-card">
            <CardTitle className="text-lg font-bold text-card-foreground">Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {safeCompanies.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">No portfolio data found.</p>
              ) : (
                safeCompanies.slice(0, 5).map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-bold text-card-foreground">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground font-medium">{c.contactName} • {c.domain || "General"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter
                        ${c.status === "CLOSED" ? "bg-emerald-100 text-emerald-700" : 
                          c.status === "REJECTED" ? "bg-rose-100 text-rose-700" : 
                          "bg-indigo-50 text-indigo-600 border border-indigo-100"}`}>
                        {c.status.replace("_", " ")}
                      </span>
                      {c.amount > 0 && c.status === "CLOSED" && (
                         <span className="text-[11px] font-bold text-card-foreground bg-slate-100 px-1.5 rounded">
                           {formatCurrency(c.amount)}
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
        <Card className="col-span-3 border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-card flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-card-foreground">Team Workload</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {memberStats.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">No active team members.</p>
              ) : (
                memberStats.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-[12px] font-black text-white shadow-sm">
                        {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-card-foreground leading-none">{member.name}</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm font-black text-card-foreground">{member.assignedCount}</div>
                      <span className="text-[9px] text-muted-foreground uppercase font-bold">Accounts</span>
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