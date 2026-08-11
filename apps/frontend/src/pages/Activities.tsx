import { useActivity } from "@/hooks/useActivity";
import { useAuthStore } from "../stores/authstore";
import { formatDistanceToNow, format } from "date-fns";

import {
  Phone,
  Mail,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trophy,
  TrendingUp,
  Activity as ActivityIcon,
  Users,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Activities() {
  const {
    overdue,
    today,
    allActivities,
    isLoading,
  } = useActivity();

  const user = useAuthStore((s) => s.user) as any;

  const isAdminOrSenior =
    user?.role === "ADMIN" || user?.role === "SENIOR";

  // ============================================================
  // DATA SCOPE
  // ============================================================

  const displayActivities = isAdminOrSenior
    ? allActivities
    : allActivities.filter(
        (activity: any) =>
          activity.user?.id === user?.id ||
          activity.userId === user?.id
      );

  // Ignore closed/rejected companies from action items
  const displayOverdue = overdue.filter(
    (company: any) =>
      company.status !== "CLOSED" &&
      company.status !== "REJECTED"
  );

  const displayToday = today.filter(
    (company: any) =>
      company.status !== "CLOSED" &&
      company.status !== "REJECTED"
  );

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <div className="min-h-[400px] bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <ActivityIcon className="h-8 w-8 animate-pulse text-indigo-500" />

          <p className="text-sm font-medium animate-pulse">
            Loading activity dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // LEADERBOARD
  // ============================================================

  const userActivityCounts = displayActivities.reduce(
    (acc: any, activity: any) => {
      if (!activity.user) return acc;

      const userId = activity.user.id;

      if (!acc[userId]) {
        acc[userId] = {
          name: activity.user.name || "Unknown",
          count: 0,
          avatar: activity.user.name?.[0] || "?",
        };
      }

      acc[userId].count += 1;

      return acc;
    },
    {}
  );

  const topPerformers = Object.values(userActivityCounts)
    .sort(
      (a: any, b: any) =>
        b.count - a.count
    )
    .slice(0, 5);

  // ============================================================
  // ACTIVITY TREND — LAST 7 DAYS
  // ============================================================

  const last7Days = Array.from({ length: 7 }).map(
    (_, index) => {
      const date = new Date();

      date.setDate(
        date.getDate() - (6 - index)
      );

      return format(date, "MMM dd");
    }
  );

  const trendData = last7Days.map((dateString) => {
    const count = displayActivities.filter(
      (activity: any) =>
        format(
          new Date(activity.createdAt),
          "MMM dd"
        ) === dateString
    ).length;

    return {
      name: dateString,
      activities: count,
    };
  });

  // ============================================================
  // HELPERS
  // ============================================================

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "CALL":
        return <Phone className="h-4 w-4" />;

      case "EMAIL":
        return <Mail className="h-4 w-4" />;

      case "MEETING":
        return <Users className="h-4 w-4" />;

      default:
        return <ActivityIcon className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "CALL":
        return `
          bg-emerald-100 text-emerald-700 border-emerald-200
          dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20
        `;

      case "EMAIL":
        return `
          bg-amber-100 text-amber-700 border-amber-200
          dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20
        `;

      case "MEETING":
        return `
          bg-indigo-100 text-indigo-700 border-indigo-200
          dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20
        `;

      default:
        return `
          bg-slate-100 text-slate-700 border-slate-200
          dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700
        `;
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="
        min-h-full
        bg-background
        text-foreground
        p-6
        max-w-7xl
        mx-auto
        space-y-8
        animate-in
        fade-in
        duration-300
      "
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1
            className="
              text-3xl
              font-bold
              tracking-tight
              text-foreground
              flex
              items-center
              gap-2
            "
          >
            <ActivityIcon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />

            Activity Dashboard
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            {isAdminOrSenior
              ? "Overview of your team's engagement and performance."
              : "Track your recent activities and upcoming action items."}
          </p>
        </div>
      </div>

      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Activities */}
        <div
          className="
            bg-card
            rounded-xl
            border
            border-border
            shadow-sm
            p-5
            flex
            items-center
            justify-between
            hover:shadow-md
            transition-shadow
          "
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Activities
            </p>

            <h3 className="text-2xl font-bold text-foreground mt-1">
              {displayActivities.length}
            </h3>
          </div>

          <div
            className="
              h-12 w-12
              rounded-full
              bg-indigo-50
              dark:bg-indigo-500/10
              flex
              items-center
              justify-center
              text-indigo-600
              dark:text-indigo-400
            "
          >
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Overdue */}
        <div
          className="
            bg-card
            rounded-xl
            border
            border-border
            shadow-sm
            p-5
            flex
            items-center
            justify-between
            hover:shadow-md
            transition-shadow
          "
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Overdue Follow-ups
            </p>

            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {displayOverdue.length}
            </h3>
          </div>

          <div
            className="
              h-12 w-12
              rounded-full
              bg-rose-50
              dark:bg-rose-500/10
              flex
              items-center
              justify-center
              text-rose-600
              dark:text-rose-400
            "
          >
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>

        {/* Due Today */}
        <div
          className="
            bg-card
            rounded-xl
            border
            border-border
            shadow-sm
            p-5
            flex
            items-center
            justify-between
            hover:shadow-md
            transition-shadow
          "
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Due Today
            </p>

            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {displayToday.length}
            </h3>
          </div>

          <div
            className="
              h-12 w-12
              rounded-full
              bg-amber-50
              dark:bg-amber-500/10
              flex
              items-center
              justify-center
              text-amber-600
              dark:text-amber-400
            "
          >
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Companies Engaged */}
        <div
          className="
            bg-card
            rounded-xl
            border
            border-border
            shadow-sm
            p-5
            flex
            items-center
            justify-between
            hover:shadow-md
            transition-shadow
          "
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Companies Engaged
            </p>

            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {
                new Set(
                  displayActivities.map(
                    (activity: any) =>
                      activity.companyId
                  )
                ).size
              }
            </h3>
          </div>

          <div
            className="
              h-12 w-12
              rounded-full
              bg-emerald-50
              dark:bg-emerald-500/10
              flex
              items-center
              justify-center
              text-emerald-600
              dark:text-emerald-400
            "
          >
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ======================================================
          TWO COLUMN LAYOUT
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* ====================================================
            LEFT COLUMN
        ==================================================== */}

        <div className="xl:col-span-2 space-y-8">

          {/* ==================================================
              ACTIVITY TREND
          ================================================== */}

          <div
            className="
              bg-card
              border
              border-border
              rounded-xl
              shadow-sm
              p-6
              relative
              overflow-hidden
            "
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />

            <h2
              className="
                text-base
                font-semibold
                text-foreground
                mb-6
                flex
                items-center
                gap-2
              "
            >
              <TrendingUp className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />

              Activity Trend (Last 7 Days)
            </h2>

            <div className="h-[250px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={trendData}
                  margin={{
                    top: 0,
                    right: 0,
                    left: -20,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "var(--muted-foreground)",
                    }}
                    dy={10}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "var(--muted-foreground)",
                    }}
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
                      padding: "10px",
                    }}
                    labelStyle={{
                      color: "var(--popover-foreground)",
                    }}
                  />

                  <Bar
                    dataKey="activities"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ==================================================
              ACTIVITY FEED
          ================================================== */}

          <div
            className="
              bg-card
              border
              border-border
              rounded-xl
              shadow-sm
              overflow-hidden
            "
          >
            <div
              className="
                p-5
                border-b
                border-border
                flex
                items-center
                justify-between
                bg-muted/30
              "
            >
              <h2
                className="
                  text-base
                  font-semibold
                  text-foreground
                  flex
                  items-center
                  gap-2
                "
              >
                <ActivityIcon className="h-5 w-5 text-muted-foreground" />

                Recent Activity Feed
              </h2>
            </div>

            <div className="p-0">
              {displayActivities.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-sm">
                  <div
                    className="
                      bg-muted
                      h-16
                      w-16
                      rounded-full
                      flex
                      items-center
                      justify-center
                      mx-auto
                      mb-3
                    "
                  >
                    <ActivityIcon className="h-8 w-8 text-muted-foreground/50" />
                  </div>

                  No recent activities found. Create some!
                </div>
              ) : (
                <div
                  className="
                    divide-y
                    divide-border
                    max-h-[500px]
                    overflow-y-auto
                  "
                >
                  {displayActivities.map(
                    (activity: any) => (
                      <div
                        key={activity.id}
                        className="
                          p-5
                          hover:bg-muted/50
                          transition-colors
                          flex
                          gap-4
                        "
                      >
                        <div
                          className={`
                            mt-0.5
                            shrink-0
                            flex
                            items-center
                            justify-center
                            h-10
                            w-10
                            rounded-full
                            border
                            shadow-sm
                            ${getActivityColor(activity.type)}
                          `}
                        >
                          {getActivityIcon(
                            activity.type
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className="
                                text-sm
                                font-medium
                                text-foreground
                                leading-relaxed
                              "
                            >
                              {isAdminOrSenior ? (
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                  {activity.user?.name ||
                                    "Team Member"}
                                </span>
                              ) : (
                                "You"
                              )}

                              <span className="font-normal text-muted-foreground">
                                {" "}logged a{" "}
                              </span>

                              <span className="font-semibold lowercase">
                                {activity.type}
                              </span>

                              <span className="font-normal text-muted-foreground">
                                {" "}with{" "}
                              </span>

                              <span className="font-semibold text-foreground">
                                {activity.company?.name ||
                                  "a company"}
                              </span>
                            </p>

                            <span
                              className="
                                text-xs
                                font-medium
                                text-muted-foreground
                                shrink-0
                                whitespace-nowrap
                                bg-muted
                                px-2
                                py-0.5
                                rounded-full
                              "
                            >
                              {formatDistanceToNow(
                                new Date(
                                  activity.createdAt
                                ),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </span>
                          </div>

                          {activity.note && (
                            <div
                              className="
                                mt-3
                                text-sm
                                text-muted-foreground
                                bg-muted/60
                                rounded-lg
                                p-3
                                border
                                border-border
                                relative
                                before:absolute
                                before:left-0
                                before:top-0
                                before:bottom-0
                                before:w-1
                                before:bg-border
                                before:rounded-l-lg
                              "
                            >
                              <span className="pl-2 block">
                                {activity.note}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ====================================================
            RIGHT COLUMN
        ==================================================== */}

        <div className="space-y-8 xl:col-span-1">

          {/* ==================================================
              PERFORMANCE LEADERBOARD
          ================================================== */}

          {isAdminOrSenior &&
            topPerformers.length > 0 && (
              <div
                className="
                  bg-card
                  border
                  border-border
                  rounded-xl
                  shadow-sm
                  overflow-hidden
                "
              >
                <div
                  className="
                    p-5
                    border-b
                    border-border
                    bg-gradient-to-r
                    from-amber-50
                    to-transparent
                    dark:from-amber-500/10
                    dark:to-transparent
                  "
                >
                  <h2
                    className="
                      text-base
                      font-semibold
                      text-foreground
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <Trophy className="h-5 w-5 text-amber-500" />

                    Top Performers
                  </h2>
                </div>

                <div className="p-5 pb-6">
                  <div className="space-y-4">
                    {topPerformers.map(
                      (performer: any, index: number) => (
                        <div
                          key={performer.name}
                          className="
                            flex
                            items-center
                            justify-between
                            group
                          "
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div
                                className={`
                                  h-10
                                  w-10
                                  rounded-full
                                  flex
                                  items-center
                                  justify-center
                                  text-sm
                                  font-bold

                                  ${
                                    index === 0
                                      ? `
                                        bg-amber-100
                                        text-amber-700
                                        dark:bg-amber-500/15
                                        dark:text-amber-400
                                        ring-2
                                        ring-amber-200
                                        dark:ring-amber-500/30
                                      `
                                      : `
                                        bg-muted
                                        text-muted-foreground
                                      `
                                  }
                                `}
                              >
                                {performer.avatar}
                              </div>

                              {index === 0 && (
                                <div
                                  className="
                                    absolute
                                    -top-1
                                    -right-1
                                    h-4
                                    w-4
                                    bg-amber-400
                                    rounded-full
                                    border-2
                                    border-card
                                    flex
                                    items-center
                                    justify-center
                                    shadow-sm
                                  "
                                >
                                  <Trophy className="h-2.5 w-2.5 text-white" />
                                </div>
                              )}
                            </div>

                            <div>
                              <p
                                className="
                                  text-sm
                                  font-semibold
                                  text-foreground
                                  group-hover:text-indigo-600
                                  dark:group-hover:text-indigo-400
                                  transition-colors
                                "
                              >
                                {performer.name}
                              </p>

                              <p className="text-xs font-medium text-muted-foreground">
                                {performer.count} interactions
                              </p>
                            </div>
                          </div>

                          <div
                            className={`
                              text-sm
                              font-bold
                              px-3
                              py-1
                              rounded-full

                              ${
                                index === 0
                                  ? `
                                    bg-amber-50
                                    text-amber-600
                                    dark:bg-amber-500/10
                                    dark:text-amber-400
                                  `
                                  : `
                                    bg-muted
                                    text-muted-foreground
                                  `
                              }
                            `}
                          >
                            {performer.count}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* ==================================================
              ACTION ITEMS
          ================================================== */}

          <div
            className="
              bg-card
              border
              border-border
              rounded-xl
              shadow-sm
              overflow-hidden
              flex
              flex-col
            "
          >
            <div
              className="
                p-5
                border-b
                border-border
                bg-muted/30
              "
            >
              <h2
                className="
                  text-base
                  font-semibold
                  text-foreground
                  flex
                  items-center
                  gap-2
                "
              >
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />

                Action Items
              </h2>
            </div>

            <div className="p-5 space-y-6">

              {/* ==================================================
                  OVERDUE
              ================================================== */}

              <div>
                <h3
                  className="
                    text-xs
                    font-bold
                    tracking-wider
                    text-rose-600
                    dark:text-rose-400
                    uppercase
                    flex
                    items-center
                    gap-1.5
                    mb-3
                  "
                >
                  <AlertCircle className="h-3.5 w-3.5" />

                  Overdue ({displayOverdue.length})
                </h3>

                {displayOverdue.length === 0 ? (
                  <div
                    className="
                      p-3
                      bg-green-50
                      dark:bg-green-500/10
                      rounded-lg
                      text-sm
                      text-green-700
                      dark:text-green-400
                      italic
                      border
                      border-green-100
                      dark:border-green-500/20
                      font-medium
                    "
                  >
                    All caught up! 🎉
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayOverdue
                      .slice(0, 5)
                      .map((company: any) => (
                        <div
                          key={company.id}
                          className="
                            group
                            p-3
                            bg-card
                            border
                            border-rose-100
                            dark:border-rose-500/20
                            hover:border-rose-300
                            dark:hover:border-rose-500/40
                            rounded-lg
                            shadow-sm
                            transition-all
                            flex
                            justify-between
                            items-center
                            cursor-pointer
                          "
                        >
                          <div className="min-w-0 pr-3">
                            <p
                              className="
                                text-sm
                                font-semibold
                                text-foreground
                                truncate
                                group-hover:text-rose-700
                                dark:group-hover:text-rose-400
                                transition-colors
                              "
                            >
                              {company.name}
                            </p>

                            {isAdminOrSenior && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                Rep:{" "}
                                <span className="font-medium text-foreground">
                                  {company.assignedTo?.name ||
                                    "Unassigned"}
                                </span>
                              </p>
                            )}
                          </div>

                          <span
                            className="
                              shrink-0
                              text-[10px]
                              uppercase
                              tracking-wider
                              font-bold
                              text-rose-700
                              dark:text-rose-400
                              bg-rose-50
                              dark:bg-rose-500/10
                              border
                              border-rose-100
                              dark:border-rose-500/20
                              px-2
                              py-1
                              rounded-md
                            "
                          >
                            Overdue
                          </span>
                        </div>
                      ))}

                    {displayOverdue.length > 5 && (
                      <button
                        className="
                          w-full
                          text-xs
                          text-center
                          text-rose-600
                          dark:text-rose-400
                          hover:text-rose-700
                          dark:hover:text-rose-300
                          hover:bg-rose-50
                          dark:hover:bg-rose-500/10
                          font-semibold
                          py-2
                          rounded-md
                          transition-colors
                        "
                      >
                        View all {displayOverdue.length} overdue
                        tasks
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ==================================================
                  TODAY
              ================================================== */}

              <div>
                <h3
                  className="
                    text-xs
                    font-bold
                    tracking-wider
                    text-amber-600
                    dark:text-amber-400
                    uppercase
                    flex
                    items-center
                    gap-1.5
                    mb-3
                  "
                >
                  <Clock className="h-3.5 w-3.5" />

                  Due Today ({displayToday.length})
                </h3>

                {displayToday.length === 0 ? (
                  <div
                    className="
                      p-3
                      bg-muted
                      rounded-lg
                      text-sm
                      text-muted-foreground
                      italic
                      border
                      border-border
                    "
                  >
                    No tasks due today.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayToday
                      .slice(0, 5)
                      .map((company: any) => (
                        <div
                          key={company.id}
                          className="
                            group
                            p-3
                            bg-card
                            border
                            border-amber-100
                            dark:border-amber-500/20
                            hover:border-amber-300
                            dark:hover:border-amber-500/40
                            rounded-lg
                            shadow-sm
                            transition-all
                            flex
                            justify-between
                            items-center
                            cursor-pointer
                          "
                        >
                          <div className="min-w-0 pr-3">
                            <p
                              className="
                                text-sm
                                font-semibold
                                text-foreground
                                truncate
                                group-hover:text-amber-700
                                dark:group-hover:text-amber-400
                                transition-colors
                              "
                            >
                              {company.name}
                            </p>

                            {isAdminOrSenior && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                Rep:{" "}
                                <span className="font-medium text-foreground">
                                  {company.assignedTo?.name ||
                                    "Unassigned"}
                                </span>
                              </p>
                            )}
                          </div>

                          <span
                            className="
                              shrink-0
                              text-[10px]
                              uppercase
                              tracking-wider
                              font-bold
                              text-amber-700
                              dark:text-amber-400
                              bg-amber-50
                              dark:bg-amber-500/10
                              border
                              border-amber-100
                              dark:border-amber-500/20
                              px-2
                              py-1
                              rounded-md
                            "
                          >
                            Today
                          </span>
                        </div>
                      ))}

                    {displayToday.length > 5 && (
                      <button
                        className="
                          w-full
                          text-xs
                          text-center
                          text-amber-600
                          dark:text-amber-400
                          hover:text-amber-700
                          dark:hover:text-amber-300
                          hover:bg-amber-50
                          dark:hover:bg-amber-500/10
                          font-semibold
                          py-2
                          rounded-md
                          transition-colors
                        "
                      >
                        View all {displayToday.length} tasks due
                        today
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