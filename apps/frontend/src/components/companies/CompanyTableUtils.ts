// utils
export const getStatusColor = (status: string) => {
  switch (status) {
    case "IN_TALKS":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300";

    case "NEGOTIATING":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300";

    case "CLOSED":
      return "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300";

    case "POSITIVE":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";

    case "CONTACTED":
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300";

    case "REJECTED":
      return "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300";

    case "NOT_CONTACTED":
      return "bg-muted text-muted-foreground";

    default:
      return "bg-muted text-muted-foreground";
  }
};