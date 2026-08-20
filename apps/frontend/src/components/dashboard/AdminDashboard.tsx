import { useCompanies } from "../../hooks/useCompany";
import { useOrg } from "../../hooks/useOrg";
import { useAdminDashboardStats } from "@/hooks/useDashboard";

import {
  Building2,
  Gift,
  TrendingUp,
  CheckCircle2,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  Cell,
} from "recharts";

export default function AdminDashboard() {
  // ============================================================
  // DASHBOARD STATS
  // ============================================================

  const {
    data: dashboardStats,
    isLoading: dashboardLoading,
  } = useAdminDashboardStats();

  // ============================================================
  // COMPANY DATA
  // ============================================================
  // Used ONLY for the small Portfolio Overview preview.
  // Dashboard totals/statistics do NOT depend on this data.

  const {
    companies,
    isLoading: companiesLoading,
  } = useCompanies({
    page: "1",
    limit: "5",
  });

  // ============================================================
  // ORGANIZATION MEMBERS
  // ============================================================

  const {
    orgMembers,
    isOrgMembersLoading,
  } = useOrg();

  // ============================================================
  // LOADING
  // ============================================================

  if (
    dashboardLoading ||
    isOrgMembersLoading ||
    companiesLoading
  ) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div
          className="
            h-8
            w-8
            animate-spin
            rounded-full
            border-b-2
            border-t-2
            border-indigo-600
          "
        />
      </div>
    );
  }

  // ============================================================
  // DASHBOARD STATS
  // ============================================================

  const total =
    dashboardStats?.total ?? 0;

  const notContacted =
    dashboardStats?.statuses?.NOT_CONTACTED ?? 0;

  const contacted =
    dashboardStats?.statuses?.CONTACTED ?? 0;

  const inTalks =
    dashboardStats?.statuses?.IN_TALKS ?? 0;

  const negotiating =
    dashboardStats?.statuses?.NEGOTIATING ?? 0;

  const positive =
    dashboardStats?.statuses?.POSITIVE ?? 0;

  const closed =
    dashboardStats?.statuses?.CLOSED ?? 0;

  const rejected =
    dashboardStats?.statuses?.REJECTED ?? 0;

  const totalCash =
    dashboardStats?.revenue?.totalCash ?? 0;

  const totalInKind =
    dashboardStats?.revenue?.totalInKind ?? 0;

  const weightedPipeline =
    dashboardStats?.revenue?.weightedPipeline ?? 0;

  const assignedCounts =
    dashboardStats?.assignedCounts ?? {};

  // ============================================================
  // MEMBER STATS
  // ============================================================

  const memberStats = (orgMembers || [])
    .map((member: any) => {
      const assignedCount =
        assignedCounts[member.id] ?? 0;

      return {
        ...member,
        assignedCount,
      };
    })
    .sort(
      (a: any, b: any) =>
        b.assignedCount - a.assignedCount
    );

  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // ============================================================
  // PIPELINE CHART
  // ============================================================

  const pipelineData = [
    {
      name: "Not Contacted",
      count: notContacted,
    },
    {
      name: "Contacted",
      count: contacted,
    },
    {
      name: "In Talks",
      count: inTalks,
    },
    {
      name: "Negotiating",
      count: negotiating,
    },
    {
      name: "Positive",
      count: positive,
    },
    {
      name: "Closed",
      count: closed,
    },
  ];

  // ============================================================
  // DEAL TYPE CHART
  // ============================================================

  const dealTypeData = [
    {
      name: "Cash",
      value: totalCash,
    },
    {
      name: "In-Kind",
      value: totalInKind,
    },
  ];

  const COLORS = [
    "#4f46e5",
    "#ec4899",
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="
        flex-1
        min-h-screen
        space-y-6
        bg-background
        p-8
        text-foreground
      "
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between space-y-2">
        <h2
          className="
            text-3xl
            font-bold
            tracking-tight
            text-foreground
          "
        >
          Dashboard Overview
        </h2>
      </div>

      {/* ======================================================
          TOP STATS ROW
      ====================================================== */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* TOTAL PIPELINE */}

        <Card
          className="
            border-border
            bg-card
            shadow-sm
            transition-shadow
            duration-200
            hover:shadow-md
          "
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className="
                text-sm
                font-semibold
                uppercase
                tracking-wider
                text-muted-foreground
              "
            >
              Total Pipeline
            </CardTitle>

            <Building2 className="h-4 w-4 text-slate-400" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {total}
            </div>

            <p
              className="
                mt-1
                text-xs
                font-medium
                text-muted-foreground
              "
            >
              Active company entries
            </p>
          </CardContent>
        </Card>

        {/* CONVERSION */}

        <Card
          className="
            border-border
            bg-card
            shadow-sm
            transition-shadow
            duration-200
            hover:shadow-md
          "
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className="
                text-sm
                font-semibold
                uppercase
                tracking-wider
                text-muted-foreground
              "
            >
              Conversion
            </CardTitle>

            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {closed}
            </div>

            <p
              className="
                mt-1
                w-fit
                rounded-full
                bg-emerald-50
                px-2
                py-0.5
                text-xs
                font-medium
                text-emerald-600
              "
            >
              {total > 0
                ? ((closed / total) * 100).toFixed(1)
                : 0}
              % success rate
            </p>
          </CardContent>
        </Card>

        {/* REVENUE FORECAST */}

        <Card
          className="
            relative
            overflow-hidden
            border-border
            bg-card
            shadow-sm
            transition-all
            hover:shadow-md
          "
        >
          <div
            className="
              absolute
              inset-0
              -z-10
              bg-gradient-to-br
              from-indigo-50/50
              to-transparent
              dark:from-indigo-950/30
            "
          />

          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className="
                text-sm
                font-semibold
                uppercase
                tracking-wider
                text-indigo-700
              "
            >
              Revenue Forecast
            </CardTitle>

            <TrendingUp className="h-4 w-4 animate-pulse text-indigo-600" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-indigo-700">
              {formatCurrency(weightedPipeline)}
            </div>

            <div className="mt-1 flex flex-col gap-1">
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  text-indigo-500
                "
              >
                Weighted Pipeline Value
              </p>

              <p
                className="
                  text-xs
                  font-medium
                  italic
                  text-muted-foreground
                "
              >
                Actual Collected:{" "}
                {formatCurrency(totalCash)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* IN-KIND VALUE */}

        <Card
          className="
            relative
            overflow-hidden
            border-border
            bg-card
            shadow-sm
            transition-all
            hover:shadow-md
          "
        >
          <div
            className="
              absolute
              inset-0
              -z-10
              bg-gradient-to-br
              from-pink-50/50
              to-transparent
              dark:from-pink-950/30
            "
          />

          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className="
                text-sm
                font-semibold
                uppercase
                tracking-wider
                text-pink-700
              "
            >
              In-Kind Value
            </CardTitle>

            <Gift className="h-4 w-4 text-pink-600" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-pink-700">
              {formatCurrency(totalInKind)}
            </div>

            <p
              className="
                mt-1
                w-fit
                rounded-full
                bg-pink-50
                px-2
                py-0.5
                text-xs
                font-medium
                text-pink-500
              "
            >
              Non-monetary assets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ======================================================
          CHARTS ROW
      ====================================================== */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* PIPELINE */}

        <Card className="col-span-4 border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-card-foreground">
              Pipeline Velocity
            </CardTitle>

            <span
              className="
                rounded
                bg-slate-100
                px-2
                py-1
                text-[10px]
                font-bold
                uppercase
                tracking-tighter
                text-muted-foreground
              "
            >
              Real-time
            </span>
          </CardHeader>

          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={pipelineData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
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
                    cursor={{
                      fill: "var(--muted)",
                    }}
                    contentStyle={{
                      borderRadius: "12px",
                      border:
                        "1px solid var(--border)",
                      backgroundColor:
                        "var(--popover)",
                      color:
                        "var(--popover-foreground)",
                      boxShadow:
                        "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />

                  <Bar
                    dataKey="count"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* FINANCIAL SPLIT */}

        <Card className="col-span-3 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-card-foreground">
              Financial Split
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center">
            {totalCash === 0 &&
            totalInKind === 0 ? (
              <div
                className="
                  flex
                  h-[250px]
                  items-center
                  justify-center
                  font-medium
                  text-muted-foreground
                "
              >
                Waiting for first deal...
              </div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
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
                      {dealTypeData.map(
                        (_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              COLORS[
                                index %
                                  COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      formatter={(value: any) =>
                        formatCurrency(
                          Number(value) || 0
                        )
                      }
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow:
                          "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-4 flex gap-6">
              <div className="flex items-center gap-2 text-xs font-bold text-card-foreground">
                <div className="h-2 w-2 rounded-full bg-indigo-600" />
                CASH
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-card-foreground">
                <div className="h-2 w-2 rounded-full bg-pink-500" />
                IN-KIND
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ======================================================
          BOTTOM ROW
      ====================================================== */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* PORTFOLIO OVERVIEW */}

        <Card className="col-span-4 overflow-hidden border-border bg-card shadow-sm">
          <CardHeader className="border-b bg-card">
            <CardTitle className="text-lg font-bold text-card-foreground">
              Portfolio Overview
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {companies.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  No portfolio data found.
                </p>
              ) : (
                companies
                  .slice(0, 5)
                  .map((c: any) => (
                    <div
                      key={c.id}
                      className="
                        flex
                        items-center
                        justify-between
                        p-4
                        transition-colors
                        hover:bg-slate-50/80
                      "
                    >
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-bold text-card-foreground">
                          {c.name}
                        </p>

                        <p className="text-[11px] font-medium text-muted-foreground">
                          {c.contactName} •{" "}
                          {c.domain || "General"}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={`
                            inline-flex
                            items-center
                            rounded
                            px-2
                            py-0.5
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-tighter
                            ${
                              c.status ===
                              "CLOSED"
                                ? "bg-emerald-100 text-emerald-700"
                                : c.status ===
                                  "REJECTED"
                                ? "bg-rose-100 text-rose-700"
                                : "border border-indigo-100 bg-indigo-50 text-indigo-600"
                            }
                          `}
                        >
                          {c.status.replace(
                            "_",
                            " "
                          )}
                        </span>

                        {c.amount > 0 &&
                          c.status ===
                            "CLOSED" && (
                            <span
                              className="
                                rounded
                                bg-slate-100
                                px-1.5
                                text-[11px]
                                font-bold
                                text-card-foreground
                              "
                            >
                              {formatCurrency(
                                c.amount
                              )}
                            </span>
                          )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* TEAM WORKLOAD */}

        <Card className="col-span-3 overflow-hidden border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-card">
            <CardTitle className="text-lg font-bold text-card-foreground">
              Team Workload
            </CardTitle>

            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {memberStats.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  No active team members.
                </p>
              ) : (
                memberStats.map(
                  (member: any) => (
                    <div
                      key={member.id}
                      className="
                        flex
                        items-center
                        justify-between
                        p-4
                        transition-colors
                        hover:bg-slate-50/80
                      "
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            bg-indigo-600
                            text-[12px]
                            font-black
                            text-white
                            shadow-sm
                          "
                        >
                          {member.name
                            ? member.name
                                .charAt(0)
                                .toUpperCase()
                            : "?"}
                        </div>

                        <div>
                          <p
                            className="
                              text-sm
                              font-bold
                              leading-none
                              text-card-foreground
                            "
                          >
                            {member.name}
                          </p>

                          <p
                            className="
                              mt-1
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-tight
                              text-slate-400
                            "
                          >
                            {member.role}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="text-sm font-black text-card-foreground">
                          {member.assignedCount}
                        </div>

                        <span
                          className="
                            text-[9px]
                            font-bold
                            uppercase
                            text-muted-foreground
                          "
                        >
                          Accounts
                        </span>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}