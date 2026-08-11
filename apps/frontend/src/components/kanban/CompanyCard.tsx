import {
  Calendar,
  Clock,
  AlertCircle,
  Building2,
  User,
} from "lucide-react";

function CompanyCard({ company }: { company: any }) {
  const followUp = company.nextFollowUp
    ? new Date(company.nextFollowUp)
    : null;

  const today = new Date();

  // Normalize dates to midnight so time-of-day doesn't
  // incorrectly affect overdue/today calculations.
  const normalizeDate = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  const normalizedToday = normalizeDate(today);

  const normalizedFollowUp = followUp
    ? normalizeDate(followUp)
    : null;

  let statusConfig = {
    color: "text-muted-foreground bg-muted/60 border-border",
    icon: <Calendar className="h-3 w-3" />,
    label: "No follow-up",
  };

  if (normalizedFollowUp) {
    const diffTime =
      normalizedFollowUp.getTime() -
      normalizedToday.getTime();

    const diffDays =
      diffTime / (1000 * 60 * 60 * 24);

    // Overdue
    if (diffDays < 0) {
      statusConfig = {
        color:
          "text-rose-700 bg-rose-50 border-rose-200 " +
          "dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900/60",
        icon: <AlertCircle className="h-3 w-3" />,
        label: `Overdue • ${normalizedFollowUp.toLocaleDateString(
          undefined,
          {
            month: "short",
            day: "numeric",
          }
        )}`,
      };
    }

    // Due today
    else if (diffDays === 0) {
      statusConfig = {
        color:
          "text-amber-700 bg-amber-50 border-amber-200 " +
          "dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/60",
        icon: <Clock className="h-3 w-3" />,
        label: "Due Today",
      };
    }

    // Upcoming
    else {
      statusConfig = {
        color:
          "text-emerald-700 bg-emerald-50 border-emerald-200 " +
          "dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/60",
        icon: <Calendar className="h-3 w-3" />,
        label: normalizedFollowUp.toLocaleDateString(
          undefined,
          {
            month: "short",
            day: "numeric",
          }
        ),
      };
    }
  }

  const assigneeName =
    company.assignedTo?.name || "Unassigned";

  const assigneeInitials = assigneeName
    .charAt(0)
    .toUpperCase();

  return (
    <div
      className="
        group
        relative
        rounded-xl
        border
        border-border
        bg-card
        p-4
        shadow-sm
        transition-all
        duration-200
        hover:border-indigo-300
        hover:shadow-md
        dark:hover:border-indigo-500/50
        dark:hover:shadow-indigo-950/20
      "
    >
      {/* Company Header */}
      <div className="flex items-start justify-between gap-2">
        {/* Company Info */}
        <div className="min-w-0 flex-1">
          <h4
            className="
              flex
              items-center
              gap-1.5
              truncate
              text-sm
              font-semibold
              text-foreground
            "
          >
            {company.name}
          </h4>

          <p
            className="
              mt-1
              flex
              items-center
              gap-1
              truncate
              text-[11px]
              font-medium
              text-muted-foreground
            "
          >
            <Building2
              className="
                h-3
                w-3
                shrink-0
                text-muted-foreground/70
              "
            />

            {company.industry || "No industry"}
          </p>
        </div>

        {/* Assignee */}
        <div
          className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-muted
            text-[10px]
            font-bold
            text-muted-foreground
            ring-2
            ring-card
            shadow-sm
            transition-transform
            duration-200
            group-hover:scale-105
          "
          title={`Assigned to: ${assigneeName}`}
        >
          {company.assignedTo ? (
            assigneeInitials
          ) : (
            <User
              className="
                h-3.5
                w-3.5
                text-muted-foreground/70
              "
            />
          )}
        </div>
      </div>

      {/* Divider */}
      <div
        className="
          my-3
          h-px
          w-full
          bg-border
          opacity-60
        "
      />

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between">
        {/* Follow-up */}
        {followUp ? (
          <div
            className={`
              flex
              items-center
              gap-1.5
              rounded-md
              border
              px-2
              py-1
              text-[10px]
              font-semibold
              transition-colors
              ${statusConfig.color}
            `}
          >
            {statusConfig.icon}

            <span className="truncate">
              {statusConfig.label}
            </span>
          </div>
        ) : (
          <div
            className="
              flex
              items-center
              gap-1
              text-[10px]
              font-medium
              text-muted-foreground
            "
          >
            <Calendar className="h-3 w-3" />

            No follow-up
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyCard;