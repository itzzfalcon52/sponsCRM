import { useCompanies } from "../../hooks/useCompany";
import {
  Building2,
  IndianRupee,
  Gift,
  TrendingUp,
  CheckCircle2,
  CalendarClock,
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

export default function MemberDashboard() {
  const { companies, isLoading: companiesLoading } = useCompanies();

  // ============================================================
  // LOADING
  // ============================================================

  if (companiesLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600" />
      </div>
    );
  }

  // ============================================================
  // SAFELY EXTRACT COMPANIES
  // ============================================================

  let safeCompanies: any[] = [];

  if (Array.isArray(companies)) {
    safeCompanies = companies;
  } else if (
    companies &&
    Array.isArray((companies as any).companies)
  ) {
    safeCompanies = (companies as any).companies;
  } else if (
    companies &&
    Array.isArray((companies as any).data)
  ) {
    safeCompanies = (companies as any).data;
  }

  const total = safeCompanies.length;

  // ============================================================
  // STATUS COUNTS
  // ============================================================

  const inTalks = safeCompanies.filter(
    (c: any) => c.status === "IN_TALKS"
  ).length;

  const negotiating = safeCompanies.filter(
    (c: any) => c.status === "NEGOTIATING"
  ).length;

  const positive = safeCompanies.filter(
    (c: any) => c.status === "POSITIVE"
  ).length;

  const closed = safeCompanies.filter(
    (c: any) => c.status === "CLOSED"
  ).length;

  const rejected = safeCompanies.filter(
    (c: any) => c.status === "REJECTED"
  ).length;

  // ============================================================
  // REVENUE
  // ============================================================

  const closedDeals = safeCompanies.filter(
    (c: any) => c.status === "CLOSED"
  );

  const totalCash = closedDeals
    .filter((c: any) => c.type === "CASH")
    .reduce(
      (sum: number, c: any) => sum + (c.amount || 0),
      0
    );

  const totalInKind = closedDeals
    .filter((c: any) => c.type === "IN_KIND")
    .reduce(
      (sum: number, c: any) => sum + (c.amount || 0),
      0
    );

  // ============================================================
  // CURRENCY FORMATTER
  // ============================================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // ============================================================
  // FOLLOW-UP HELPERS
  // ============================================================

  const getDaysDifference = (targetDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();

    return Math.ceil(
      diffTime / (1000 * 60 * 60 * 24)
    );
  };

  const formatFollowUpText = (dateString: string) => {
    const diffDays = getDaysDifference(dateString);

    if (diffDays < 0) {
      return {
        text: `${Math.abs(diffDays)} days overdue`,
        styles:
          "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
      };
    }

    if (diffDays === 0) {
      return {
        text: "Today",
        styles:
          "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
      };
    }

    if (diffDays === 1) {
      return {
        text: "Tomorrow",
        styles:
          "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
      };
    }

    return {
      text: `In ${diffDays} days`,
      styles:
        "bg-muted text-muted-foreground",
    };
  };

  // ============================================================
  // UPCOMING FOLLOW-UPS
  // ============================================================

  const upcomingFollowUps = safeCompanies
    .filter(
      (c: any) =>
        c.nextFollowUp &&
        c.status !== "CLOSED" &&
        c.status !== "REJECTED"
    )
    .sort(
      (a: any, b: any) =>
        new Date(a.nextFollowUp).getTime() -
        new Date(b.nextFollowUp).getTime()
    )
    .slice(0, 5);

  // ============================================================
  // PIPELINE CHART DATA
  // ============================================================

  const pipelineData = [
    {
      name: "Not Contacted",
      count: safeCompanies.filter(
        (c: any) => c.status === "NOT_CONTACTED"
      ).length,
    },
    {
      name: "Contacted",
      count: safeCompanies.filter(
        (c: any) => c.status === "CONTACTED"
      ).length,
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
    {
      name: "Rejected",
      count: rejected,
    },
  ];

  // ============================================================
  // DEAL TYPE DATA
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

  // Keep brand colors
  const COLORS = ["#4f46e5", "#ec4899"];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen flex-1 space-y-6 bg-background p-8 text-foreground">

      {/* ========================================================
          PAGE HEADER
      ======================================================== */}

      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          My Workspace
        </h2>
      </div>

      {/* ========================================================
          TOP STATS
      ======================================================== */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* Assigned Companies */}

        <Card className="border-border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assigned to Me
            </CardTitle>

            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {total}
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Companies in your queue
            </p>
          </CardContent>
        </Card>

        {/* Closed Deals */}

        <Card className="border-border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My Closed Deals
            </CardTitle>

            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {closed}
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Successfully secured by you
            </p>
          </CardContent>
        </Card>

        {/* Cash Raised */}

        <Card className="relative overflow-hidden border-border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">

          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 to-transparent dark:from-indigo-950/30" />

          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
              My Cash Raised
            </CardTitle>

            <IndianRupee className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
              {formatCurrency(totalCash)}
            </div>

            <p className="mt-1 flex items-center gap-1 text-xs text-indigo-500 dark:text-indigo-400">
              <TrendingUp className="h-3 w-3" />
              From your closed deals
            </p>
          </CardContent>
        </Card>

        {/* In-Kind Value */}

        <Card className="relative overflow-hidden border-border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">

          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-pink-50 to-transparent dark:from-pink-950/30" />

          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-pink-700 dark:text-pink-400">
              My In-Kind Value
            </CardTitle>

            <Gift className="h-4 w-4 text-pink-600 dark:text-pink-400" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-pink-700 dark:text-pink-400">
              {formatCurrency(totalInKind)}
            </div>

            <p className="mt-1 flex items-center gap-1 text-xs text-pink-500 dark:text-pink-400">
              <TrendingUp className="h-3 w-3" />
              From your closed deals
            </p>
          </CardContent>
        </Card>

      </div>

      {/* ========================================================
          CHARTS
      ======================================================== */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* Pipeline */}

        <Card className="col-span-4 border-border bg-card shadow-sm">

          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground">
              My Pipeline
            </CardTitle>
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
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />

                  <Tooltip
                    cursor={{
                      fill: "var(--muted)",
                    }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--popover)",
                      color: "var(--popover-foreground)",
                      boxShadow:
                        "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />

                  <Bar
                    dataKey="count"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </CardContent>

        </Card>

        {/* Secured Values */}

        <Card className="col-span-3 border-border bg-card shadow-sm">

          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground">
              My Secured Values
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center">

            {totalCash === 0 && totalInKind === 0 ? (

              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                No closed deals yet
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
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >

                      {dealTypeData.map(
                        (_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              COLORS[
                                index % COLORS.length
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
                        borderRadius: "8px",
                        border:
                          "1px solid var(--border)",
                        backgroundColor:
                          "var(--popover)",
                        color:
                          "var(--popover-foreground)",
                        boxShadow:
                          "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />

                  </PieChart>

                </ResponsiveContainer>

              </div>

            )}

            {/* Legend */}

            <div className="mt-4 flex gap-6">

              <div className="flex items-center gap-2 text-sm text-card-foreground">
                <div className="h-3 w-3 rounded-full bg-indigo-600" />
                Cash
              </div>

              <div className="flex items-center gap-2 text-sm text-card-foreground">
                <div className="h-3 w-3 rounded-full bg-pink-500" />
                In-Kind
              </div>

            </div>

          </CardContent>

        </Card>

      </div>

      {/* ========================================================
          BOTTOM ROW
      ======================================================== */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* Assigned Companies */}

        <Card className="col-span-4 border-border bg-card shadow-sm">

          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground">
              My Assigned Companies (Recent)
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="space-y-4">

              {safeCompanies.length === 0 ? (

                <p className="text-sm text-muted-foreground">
                  No companies assigned to you yet.
                </p>

              ) : (

                safeCompanies
                  .slice(0, 5)
                  .map((c: any) => (

                    <div
                      key={c.id}
                      className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                    >

                      <div>

                        <p className="text-sm font-medium text-card-foreground">
                          {c.name}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {c.contactName} •{" "}
                          {c.domain || "No Domain"}
                        </p>

                      </div>

                      <div className="flex flex-col items-end gap-1">

                        {/* Status */}

                        <span
                          className={`
                            inline-flex items-center
                            rounded-full
                            px-2.5
                            py-0.5
                            text-xs
                            font-medium

                            ${
                              c.status === "CLOSED"
                                ? "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400"
                                : c.status === "REJECTED"
                                ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400"
                                : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400"
                            }
                          `}
                        >
                          {c.status.replace("_", " ")}
                        </span>

                        {/* Amount */}

                        {c.amount > 0 &&
                          c.status === "CLOSED" && (

                            <span className="text-xs font-semibold text-muted-foreground">
                              {formatCurrency(c.amount)}{" "}
                              ({c.type})
                            </span>

                          )}

                      </div>

                    </div>

                  ))

              )}

            </div>

          </CardContent>

        </Card>

        {/* Upcoming Follow-ups */}

        <Card className="col-span-3 border-border bg-card shadow-sm">

          <CardHeader className="flex flex-row items-center justify-between">

            <CardTitle className="text-lg font-semibold text-card-foreground">
              Upcoming Follow-ups
            </CardTitle>

            <CalendarClock className="h-4 w-4 text-muted-foreground" />

          </CardHeader>

          <CardContent>

            <div className="space-y-4">

              {upcomingFollowUps.length === 0 ? (

                <p className="flex flex-col items-center justify-center py-6 text-center text-sm text-muted-foreground">

                  <CalendarClock className="mb-2 h-8 w-8 text-muted-foreground/40" />

                  No upcoming follow-ups scheduled.

                </p>

              ) : (

                upcomingFollowUps.map((c: any) => {

                  const status =
                    formatFollowUpText(
                      c.nextFollowUp
                    );

                  return (

                    <div
                      key={c.id}
                      className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                    >

                      <div>

                        <p className="max-w-[150px] truncate text-sm font-medium text-card-foreground">
                          {c.name}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(
                            c.nextFollowUp
                          ).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>

                      </div>

                      <div className="flex flex-col items-end gap-1">

                        <span
                          className={`
                            inline-flex items-center
                            rounded-md
                            px-2.5
                            py-1
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-wider
                            ${status.styles}
                          `}
                        >
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