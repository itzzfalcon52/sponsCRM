import { useState, useRef, useEffect } from "react";
import {
  Pencil,
  Trash2,
  UserPlus,
  MoreVertical,
  Phone,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Mail,
  Calendar,
  CalendarCheck,
  Clock,
} from "lucide-react";

import AssignModal from "./AssignModal";
import EditCompanyModal from "./EditCompanyModal";
import { getStatusColor } from "./CompanyTableUtils";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import ActivityModal from "../activity/activityModal";
import TimelineModal from "../activity/TimelineModal";

export default function CompanyTable({
  companies = [],
  isLoading = false,
}: any) {
  // ============================================================
  // BULK ASSIGNMENT
  // ============================================================

  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ============================================================
  // MODALS / DROPDOWNS
  // ============================================================

  const [assignOpen, setAssignOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [selected, setSelected] = useState<any>(null);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(
    null
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // PAGINATION
  // ============================================================

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const totalPages = Math.ceil(companies.length / itemsPerPage);

  const paginatedCompanies = companies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ============================================================
  // ACTIVITY / TIMELINE
  // ============================================================

  const [activityOpen, setActivityOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const [timelineOpen, setTimelineOpen] = useState(false);
  const [selectedTimelineCompany, setSelectedTimelineCompany] =
    useState<any>(null);

  // ============================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // ============================================================

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ============================================================
  // ACTION HANDLERS
  // ============================================================

  const handleAction = (
    company: any,
    action: "edit" | "assign" | "delete"
  ) => {
    setSelected(company);
    setOpenDropdownId(null);

    if (action === "edit") {
      setEditOpen(true);
    }

    if (action === "assign") {
      setSelectedIds([]);
      setAssignOpen(true);
    }

    if (action === "delete") {
      console.log("Delete", company.id);
    }
  };

  // ============================================================
  // BULK SELECTION
  // ============================================================

  const toggleSelectAll = () => {
    if (
      selectedIds.length === paginatedCompanies.length &&
      paginatedCompanies.length > 0
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(
        paginatedCompanies.map((company: any) => company.id)
      );
    }
  };

  const handleToggleBulkMode = () => {
    setIsBulkMode(!isBulkMode);
    setSelectedIds([]);
  };

  // ============================================================
  // ACTIVITY
  // ============================================================

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

  // ============================================================
  // LATEST ACTIVITY
  // ============================================================

  const getLatestActivity = (activities: any[]) => {
    if (
      !activities ||
      !Array.isArray(activities) ||
      activities.length === 0
    ) {
      return null;
    }

    const sorted = [...activities].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    return sorted[0].type;
  };

  // ============================================================
  // ACTIVITY PILL
  // ============================================================

  const renderActivityPill = (type: string) => {
    switch (type) {
      case "CALL":
        return (
          <span
            className="
              inline-flex items-center gap-1.5
              whitespace-nowrap
              rounded-md
              border
              border-emerald-200
              bg-emerald-50
              px-2.5 py-1
              text-[11px]
              font-semibold
              tracking-wide
              text-emerald-700
              dark:border-emerald-900/60
              dark:bg-emerald-950/40
              dark:text-emerald-400
            "
          >
            <Phone className="h-3 w-3" />
            Call
          </span>
        );

      case "EMAIL":
        return (
          <span
            className="
              inline-flex items-center gap-1.5
              whitespace-nowrap
              rounded-md
              border
              border-amber-200
              bg-amber-50
              px-2.5 py-1
              text-[11px]
              font-semibold
              tracking-wide
              text-amber-700
              dark:border-amber-900/60
              dark:bg-amber-950/40
              dark:text-amber-400
            "
          >
            <Mail className="h-3 w-3" />
            Email
          </span>
        );

      case "MEETING":
        return (
          <span
            className="
              inline-flex items-center gap-1.5
              whitespace-nowrap
              rounded-md
              border
              border-indigo-200
              bg-indigo-50
              px-2.5 py-1
              text-[11px]
              font-semibold
              tracking-wide
              text-indigo-700
              dark:border-indigo-900/60
              dark:bg-indigo-950/40
              dark:text-indigo-400
            "
          >
            <Calendar className="h-3 w-3" />
            Meeting
          </span>
        );

      default:
        return (
          <span
            className="
              inline-flex items-center gap-1.5
              whitespace-nowrap
              rounded-md
              border
              border-border
              bg-muted
              px-2.5 py-1
              text-[11px]
              font-semibold
              tracking-wide
              text-muted-foreground
            "
          >
            {type}
          </span>
        );
    }
  };

  // ============================================================
  // SKELETON
  // ============================================================

  const TableSkeleton = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <tr
          key={i}
          className="
            animate-pulse
            border-b border-border
            last:border-0
          "
        >
          {isBulkMode && (
            <td className="w-12 px-6 py-4">
              <div className="h-4 w-4 rounded bg-muted" />
            </td>
          )}

          <td className="px-6 py-4">
            <div className="mb-2 h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-24 rounded bg-muted/70" />
          </td>

          <td className="px-6 py-4">
            <div className="flex gap-2">
              <div className="h-6 w-6 rounded bg-muted" />
              <div className="h-6 w-6 rounded bg-muted" />
            </div>
          </td>

          <td className="px-6 py-4">
            <div className="h-6 w-20 rounded-md bg-muted" />
          </td>

          <td className="px-6 py-4">
            <div className="h-6 w-24 rounded-full bg-muted" />
          </td>

          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
          </td>

          <td className="px-6 py-4">
            <div className="h-4 w-20 rounded bg-muted" />
          </td>

          <td className="px-6 py-4 text-right">
            <div className="ml-auto h-6 w-6 rounded bg-muted" />
          </td>
        </tr>
      ))}
    </>
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="
        flex h-[calc(100vh-200px)]
        min-h-[500px]
        flex-col
        overflow-hidden
        rounded-xl
        border border-border
        bg-card
        text-card-foreground
        shadow-sm
        transition-colors
      "
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div
        className="
          flex flex-wrap
          items-center justify-between
          gap-4
          rounded-t-xl
          border-b border-border
          bg-card/80
          px-6 py-4
          backdrop-blur-sm
        "
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            Company Details
          </h2>

          <span
            className="
              rounded-full
              bg-muted
              px-2.5 py-1
              text-xs
              font-bold
              text-muted-foreground
            "
          >
            {companies.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Bulk Toggle */}

          <Button
            variant={isBulkMode ? "secondary" : "outline"}
            onClick={handleToggleBulkMode}
            className="
              font-semibold
              shadow-sm
              transition-all
              border-border
              bg-background
              text-foreground
              hover:bg-muted
            "
          >
            <CheckSquare className="mr-2 h-4 w-4 shrink-0" />

            {isBulkMode ? "Cancel Selection" : "Bulk Assign"}
          </Button>

          {/* Assign Selected */}

          {isBulkMode && selectedIds.length > 0 && (
            <Button
              onClick={() => setAssignOpen(true)}
              className="
                bg-indigo-600
                font-semibold
                text-white
                shadow-sm
                hover:bg-indigo-700
                dark:bg-indigo-600
                dark:hover:bg-indigo-500
              "
            >
              <UserPlus className="mr-2 h-4 w-4" />

              Assign Selected ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* ========================================================
          TABLE
      ======================================================== */}

      <div className="flex-1 overflow-auto">
        <table className="relative w-full border-collapse text-left text-sm">
          {/* TABLE HEADER */}

          <thead
            className="
              sticky top-0 z-20
              border-b border-border
              bg-muted/90
              text-muted-foreground
              backdrop-blur-sm
            "
          >
            <tr>
              {isBulkMode && (
                <th className="w-12 px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === paginatedCompanies.length &&
                      paginatedCompanies.length > 0
                    }
                    onChange={toggleSelectAll}
                    disabled={isLoading}
                    className="
                      h-4 w-4
                      cursor-pointer
                      rounded
                      border-border
                      text-indigo-600
                      accent-indigo-600
                      focus:ring-indigo-500
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  />
                </th>
              )}

              <th className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Company Info
              </th>

              <th className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Contact Info
              </th>

              <th className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Domain
              </th>

              <th className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Status
              </th>

              <th className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Activity
              </th>

              <th className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Assigned To
              </th>

              <th className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Last Contacted
              </th>

              <th className="whitespace-nowrap px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* TABLE BODY */}

          <tbody className="divide-y divide-border">
            {isLoading ? (
              <TableSkeleton />
            ) : paginatedCompanies.length === 0 ? (
              <tr>
                <td
                  colSpan={isBulkMode ? 9 : 8}
                  className="px-6 py-12 text-center"
                >
                  <div className="font-medium text-muted-foreground">
                    No companies found.
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground/70">
                    Try adjusting your search or filters.
                  </div>
                </td>
              </tr>
            ) : (
              paginatedCompanies.map((c: any) => (
                <tr
                  key={c.id}
                  className={`
                    group
                    transition-colors
                    hover:bg-muted/50
                    ${
                      selectedIds.includes(c.id)
                        ? "bg-indigo-50/60 dark:bg-indigo-950/30"
                        : ""
                    }
                  `}
                >
                  {/* CHECKBOX */}

                  {isBulkMode && (
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, c.id]);
                          } else {
                            setSelectedIds(
                              selectedIds.filter(
                                (id: string) => id !== c.id
                              )
                            );
                          }
                        }}
                        className="
                          h-4 w-4
                          cursor-pointer
                          rounded
                          border-border
                          accent-indigo-600
                          focus:ring-indigo-500
                        "
                      />
                    </td>
                  )}

                  {/* COMPANY INFO */}

                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">
                      {c.name}
                    </div>

                    <div
                      className="
                        mt-1
                        flex items-center gap-1.5
                        text-xs
                        text-muted-foreground
                      "
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />

                      {c.contactName || "No Contact"}
                    </div>
                  </td>

                  {/* CONTACT INFO */}

                  {/* ============================================================
    CONTACT INFO
============================================================ */}

<td className="px-6 py-4">
  <div className="flex items-center gap-3">

    {/* PHONE */}

    {c.phoneNumber ? (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();

          navigator.clipboard.writeText(
            c.phoneNumber
          );

          toast.success(
            `Copied ${c.phoneNumber} to clipboard!`
          );
        }}
        className="
          rounded-md
          p-1.5
          text-muted-foreground
          transition-colors
          hover:bg-indigo-50
          hover:text-indigo-600
          dark:hover:bg-indigo-950/40
          dark:hover:text-indigo-400
        "
        title={`Copy ${c.phoneNumber}`}
      >
        <Phone className="h-4 w-4" />
      </button>
    ) : (
      <span
        className="
          rounded-md
          p-1.5
          text-muted-foreground/30
        "
        title="No Phone"
      >
        <Phone className="h-4 w-4" />
      </span>
    )}

    {/* LINKEDIN */}

    {c.linkedinUrl ? (
      <a
        href={
          c.linkedinUrl.startsWith("http")
            ? c.linkedinUrl
            : `https://${c.linkedinUrl}`
        }
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) =>
          e.stopPropagation()
        }
        className="
          rounded-md
          p-1.5
          text-muted-foreground
          transition-colors
          hover:bg-blue-50
          hover:text-blue-600
          dark:hover:bg-blue-950/40
          dark:hover:text-blue-400
        "
        title="Open LinkedIn in new tab"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    ) : (
      <span
        className="
          rounded-md
          p-1.5
          text-muted-foreground/30
        "
        title="No LinkedIn"
      >
        <ExternalLink className="h-4 w-4" />
      </span>
    )}

    {/* EMAIL */}

    {c.email ? (
      <a
        href={`mailto:${c.email}`}
        onClick={(e) =>
          e.stopPropagation()
        }
        className="
          rounded-md
          p-1.5
          text-muted-foreground
          transition-colors
          hover:bg-amber-50
          hover:text-amber-600
          dark:hover:bg-amber-950/40
          dark:hover:text-amber-400
        "
        title={`Email ${c.email}`}
      >
        <Mail className="h-4 w-4" />
      </a>
    ) : (
      <span
        className="
          rounded-md
          p-1.5
          text-muted-foreground/30
        "
        title="No Email"
      >
        <Mail className="h-4 w-4" />
      </span>
    )}

  </div>
</td>
                  {/* DOMAIN */}

                  <td className="px-6 py-4">
                    {c.domain ? (
                      <span
                        className="
                          inline-flex
                          whitespace-nowrap
                          rounded-md
                          border border-border
                          bg-muted
                          px-2.5 py-1
                          text-xs
                          font-medium
                          text-muted-foreground
                        "
                      >
                        {c.domain}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground/40">
                        -
                      </span>
                    )}
                  </td>

                  {/* STATUS */}

                  <td className="px-6 py-4">
                    <span
                      className={`
                        inline-flex
                        whitespace-nowrap
                        rounded-full
                        border
                        px-2.5 py-1
                        text-xs
                        font-semibold
                        ${getStatusColor(c.status)}
                      `}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                  </td>

                  {/* LATEST ACTIVITY */}

                  <td className="px-6 py-4">
                    {getLatestActivity(c.activities) ? (
                      renderActivityPill(
                        getLatestActivity(c.activities)
                      )
                    ) : (
                      <span
                        className="
                          text-xs
                          font-medium
                          italic
                          text-muted-foreground/50
                        "
                      >
                        No Activity
                      </span>
                    )}
                  </td>

                  {/* ASSIGNED MEMBER */}

                  <td className="px-6 py-4">
                    {c.assignedTo?.name ? (
                      <div className="flex items-center gap-2.5">
                        <div
                          className="
                            flex h-7 w-7 shrink-0
                            items-center justify-center
                            rounded-full
                            bg-indigo-100
                            text-xs
                            font-bold
                            text-indigo-700
                            ring-2
                            ring-background
                            dark:bg-indigo-950
                            dark:text-indigo-300
                          "
                        >
                          {c.assignedTo.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <span
                          className="
                            whitespace-nowrap
                            text-sm
                            font-medium
                            text-foreground
                          "
                        >
                          {c.assignedTo.name}
                        </span>
                      </div>
                    ) : (
                      <span
                        className="
                          inline-flex
                          whitespace-nowrap
                          rounded-md
                          border border-border
                          bg-muted
                          px-2 py-1
                          text-xs
                          font-medium
                          italic
                          text-muted-foreground
                        "
                      >
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* LAST CONTACTED */}

                  <td className="px-6 py-4">
                    {c.lastContactedAt ? (
                      <span
                        className="
                          whitespace-nowrap
                          text-sm
                          font-medium
                          text-foreground
                        "
                      >
                        {new Date(
                          c.lastContactedAt
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    ) : (
                      <span
                        className="
                          text-xs
                          font-medium
                          italic
                          text-muted-foreground
                        "
                      >
                        Never
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}

                  <td className="relative px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        setOpenDropdownId(
                          openDropdownId === c.id
                            ? null
                            : c.id
                        );
                      }}
                      className="
                        rounded-md
                        p-1.5
                        text-muted-foreground
                        transition-colors
                        hover:bg-muted
                        hover:text-foreground
                      "
                      aria-label={`Actions for ${c.name}`}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {openDropdownId === c.id && (
                      <div
                        ref={dropdownRef}
                        className="
                          absolute
                          right-10
                          top-12
                          z-[60]
                          w-40
                          animate-in
                          fade-in
                          zoom-in-95
                          rounded-xl
                          border
                          border-border
                          bg-popover
                          py-1.5
                          text-popover-foreground
                          shadow-xl
                          duration-100
                        "
                      >
                        {/* Edit */}

                        <button
                          onClick={() =>
                            handleAction(c, "edit")
                          }
                          className="
                            flex w-full
                            items-center gap-2
                            px-3 py-2
                            text-left
                            text-sm
                            text-foreground
                            transition-colors
                            hover:bg-accent
                          "
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                          Edit
                        </button>

                        {/* Assign */}

                        <button
                          onClick={() =>
                            handleAction(c, "assign")
                          }
                          className="
                            flex w-full
                            items-center gap-2
                            px-3 py-2
                            text-left
                            text-sm
                            text-foreground
                            transition-colors
                            hover:bg-accent
                          "
                        >
                          <UserPlus className="h-4 w-4 text-muted-foreground" />
                          Assign
                        </button>

                        {/* Add Activity */}

                        <button
                          onClick={() =>
                            handleAddActivity(c)
                          }
                          className="
                            flex w-full
                            items-center gap-2
                            px-3 py-2
                            text-left
                            text-sm
                            text-foreground
                            transition-colors
                            hover:bg-accent
                          "
                        >
                          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                          Add Activity
                        </button>

                        {/* Timeline */}

                        <button
                          onClick={() =>
                            handleViewTimeline(c)
                          }
                          className="
                            flex w-full
                            items-center gap-2
                            px-3 py-2
                            text-left
                            text-sm
                            text-foreground
                            transition-colors
                            hover:bg-accent
                          "
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          View Timeline
                        </button>

                        <div className="my-1 border-t border-border" />

                        {/* Delete */}

                        <button
                          onClick={() =>
                            handleAction(c, "delete")
                          }
                          className="
                            flex w-full
                            items-center gap-2
                            px-3 py-2
                            text-left
                            text-sm
                            text-red-600
                            transition-colors
                            hover:bg-red-50
                            dark:text-red-400
                            dark:hover:bg-red-950/40
                          "
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                          Delete
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

      {/* ========================================================
          PAGINATION
      ======================================================== */}

      <div
        className="
          flex
          items-center justify-between
          rounded-b-xl
          border-t border-border
          bg-muted/40
          px-6 py-4
        "
      >
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {companies.length === 0
              ? 0
              : (currentPage - 1) * itemsPerPage + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-foreground">
            {Math.min(
              currentPage * itemsPerPage,
              companies.length
            )}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {companies.length}
          </span>{" "}
          results
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-4">
            {/* Previous */}

            <Button
              variant="outline"
              size="sm"
              className="
                h-8 gap-1
                border-border
                bg-background
                font-medium
                shadow-sm
                hover:bg-muted
              "
              disabled={currentPage === 1 || isLoading}
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.max(prev - 1, 1)
                )
              }
            >
              <ChevronLeft className="-ml-1 h-4 w-4" />
              Previous
            </Button>

            {/* Page Numbers */}

            <div className="hidden items-center gap-1 sm:flex">
              {Array.from({ length: totalPages }).map(
                (_, i) => (
                  <button
                    key={i}
                    disabled={isLoading}
                    onClick={() =>
                      setCurrentPage(i + 1)
                    }
                    className={`
                      h-8 w-8
                      rounded-md
                      text-sm
                      font-medium
                      transition-colors

                      ${
                        currentPage === i + 1
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }

                      disabled:opacity-50
                    `}
                  >
                    {i + 1}
                  </button>
                )
              )}
            </div>

            {/* Next */}

            <Button
              variant="outline"
              size="sm"
              className="
                h-8 gap-1
                border-border
                bg-background
                font-medium
                shadow-sm
                hover:bg-muted
              "
              disabled={
                currentPage === totalPages || isLoading
              }
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, totalPages)
                )
              }
            >
              Next
              <ChevronRight className="-mr-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* ========================================================
          MODALS
      ======================================================== */}

      <AssignModal
        open={assignOpen}
        company={selected}
        selectedIds={selectedIds}
        onClose={() => {
          setAssignOpen(false);
          setIsBulkMode(false);
          setSelectedIds([]);
        }}
      />

      <EditCompanyModal
        open={editOpen}
        company={selected}
        onClose={() => setEditOpen(false)}
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