import { useState, useRef, useEffect } from "react";
import {
  Pencil,
  MoreVertical,
  Phone,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Mail,
  Calendar,
  Clock,
} from "lucide-react";

import EditCompanyModal from "./EditCompanyModal";
import { getStatusColor } from "./CompanyTableUtils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import ActivityModal from "../activity/activityModal";
import TimelineModal from "../activity/TimelineModal";

export default function MemberCompanyTable({
  companies = [],
  isLoading = false,
  filters = {},
}: any) {
  // ============================================================
  // MODAL STATE
  // ============================================================

  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const [activityOpen, setActivityOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const [timelineOpen, setTimelineOpen] = useState(false);
  const [selectedTimelineCompany, setSelectedTimelineCompany] =
    useState<any>(null);

  // ============================================================
  // DROPDOWN STATE
  // ============================================================

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(
    null
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // SAFELY EXTRACT COMPANIES
  // ============================================================

  let safeCompanies: any[] = [];

  if (Array.isArray(companies)) {
    safeCompanies = companies;
  } else if (
    companies &&
    Array.isArray(companies.companies)
  ) {
    safeCompanies = companies.companies;
  } else if (
    companies &&
    Array.isArray(companies.data)
  ) {
    safeCompanies = companies.data;
  }

  // ============================================================
  // FILTERING
  // ============================================================

  const filteredCompanies = safeCompanies.filter((c: any) => {
    let match = true;

    // Search
    if (filters.q) {
      const search = filters.q.toLowerCase();

      const matchesSearch =
        c.name?.toLowerCase().includes(search) ||
        c.contactName?.toLowerCase().includes(search) ||
        c.domain?.toLowerCase().includes(search);

      match = match && matchesSearch;
    }

    // Status
    if (filters.status) {
      match = match && c.status === filters.status;
    }

    // Domain
    if (filters.domain) {
      match =
        match &&
        c.domain
          ?.toLowerCase()
          .includes(filters.domain.toLowerCase());
    }

    return match;
  });

  // ============================================================
  // PAGINATION
  // ============================================================

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const totalPages = Math.ceil(
    filteredCompanies.length / itemsPerPage
  );

  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ============================================================
  // RESET PAGE WHEN FILTERS CHANGE
  // ============================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // ============================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // ============================================================

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setOpenDropdownId(null);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ============================================================
  // ACTION HANDLERS
  // ============================================================

  const handleAction = (
    company: any,
    action: "edit"
  ) => {
    setSelected(company);
    setOpenDropdownId(null);

    if (action === "edit") {
      setEditOpen(true);
    }
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
  // GET LATEST ACTIVITY
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
      (a, b) => {
        const dateA = new Date(
          a.createdAt
        ).getTime();

        const dateB = new Date(
          b.createdAt
        ).getTime();

        return dateB - dateA;
      }
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
              inline-flex
              items-center
              gap-1.5
              whitespace-nowrap
              rounded-md
              border
              border-emerald-200
              bg-emerald-50
              px-2.5
              py-1
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
              inline-flex
              items-center
              gap-1.5
              whitespace-nowrap
              rounded-md
              border
              border-amber-200
              bg-amber-50
              px-2.5
              py-1
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
              inline-flex
              items-center
              gap-1.5
              whitespace-nowrap
              rounded-md
              border
              border-indigo-200
              bg-indigo-50
              px-2.5
              py-1
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
              inline-flex
              items-center
              gap-1.5
              whitespace-nowrap
              rounded-md
              border
              border-border
              bg-muted
              px-2.5
              py-1
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
  // TABLE SKELETON
  // ============================================================

  const TableSkeleton = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <tr
          key={i}
          className="
            animate-pulse
            border-b
            border-border
            last:border-0
          "
        >
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
            <div className="h-6 w-20 rounded-md bg-muted" />
          </td>

          <td className="px-6 py-4">
            <div className="h-6 w-24 rounded-md bg-muted" />
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
        flex
        h-[calc(100vh-200px)]
        min-h-[500px]
        flex-col
        overflow-hidden
        rounded-xl
        border
        border-border
        bg-card
        text-card-foreground
        shadow-sm
        transition-colors
      "
    >
      {/* ========================================================
          TABLE AREA
      ======================================================== */}

      <div className="flex-1 overflow-auto">
        <table
          className="
            relative
            w-full
            border-collapse
            text-left
            text-sm
          "
        >
          {/* ======================================================
              TABLE HEADER
          ====================================================== */}

          <thead
            className="
              sticky
              top-0
              z-20
              border-b
              border-border
              bg-muted/90
              text-muted-foreground
              backdrop-blur-sm
            "
          >
            <tr>
              <th
                className="
                  whitespace-nowrap
                  px-6
                  py-4
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                "
              >
                Company Info
              </th>

              <th
                className="
                  whitespace-nowrap
                  px-6
                  py-4
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                "
              >
                Contact Info
              </th>

              <th
                className="
                  whitespace-nowrap
                  px-6
                  py-4
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                "
              >
                Domain
              </th>

              <th
                className="
                  whitespace-nowrap
                  px-6
                  py-4
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                "
              >
                Status
              </th>

              <th
                className="
                  whitespace-nowrap
                  px-6
                  py-4
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                "
              >
                Activity
              </th>

              <th
                className="
                  whitespace-nowrap
                  px-6
                  py-4
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                "
              >
                Follow Up
              </th>

              <th
                className="
                  whitespace-nowrap
                  px-6
                  py-4
                  text-right
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                "
              >
                Actions
              </th>
            </tr>
          </thead>

          {/* ======================================================
              TABLE BODY
          ====================================================== */}

          <tbody className="divide-y divide-border">
            {isLoading ? (
              <TableSkeleton />
            ) : paginatedCompanies.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center"
                >
                  <div
                    className="
                      font-medium
                      text-muted-foreground
                    "
                  >
                    No companies found.
                  </div>

                  <div
                    className="
                      mt-1
                      text-xs
                      text-muted-foreground/70
                    "
                  >
                    Try adapting your search or filter
                    requirements.
                  </div>
                </td>
              </tr>
            ) : (
              paginatedCompanies.map((c: any) => (
                <tr
                  key={c.id}
                  className="
                    group
                    transition-colors
                    hover:bg-muted/50
                  "
                >
                  {/* ==================================================
                      COMPANY INFO
                  ================================================== */}

                  <td className="px-6 py-4">
                    <div
                      className="
                        font-semibold
                        text-foreground
                      "
                    >
                      {c.name}
                    </div>

                    <div
                      className="
                        mt-1
                        flex
                        items-center
                        gap-1.5
                        text-xs
                        text-muted-foreground
                      "
                    >
                      <div
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-muted-foreground/40
                        "
                      />

                      {c.contactName || "No Contact"}
                    </div>
                  </td>

                  {/* ==================================================
                      CONTACT INFO
                  ================================================== */}

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
                            c.linkedinUrl.startsWith(
                              "http"
                            )
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
                            p-1.5
                            text-muted-foreground/30
                          "
                          title="No LinkedIn"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* ==================================================
                      DOMAIN
                  ================================================== */}

                  <td className="px-6 py-4">
                    {c.domain ? (
                      <span
                        className="
                          inline-flex
                          items-center
                          whitespace-nowrap
                          rounded-md
                          border
                          border-border
                          bg-muted
                          px-2.5
                          py-1
                          text-xs
                          font-medium
                          text-muted-foreground
                        "
                      >
                        {c.domain}
                      </span>
                    ) : (
                      <span
                        className="
                          text-xs
                          font-medium
                          text-muted-foreground/40
                        "
                      >
                        -
                      </span>
                    )}
                  </td>

                  {/* ==================================================
                      STATUS
                  ================================================== */}

                  <td className="px-6 py-4">
                    <span
                      className={`
                        inline-flex
                        items-center
                        whitespace-nowrap
                        rounded-full
                        border
                        px-2.5
                        py-1
                        text-xs
                        font-semibold
                        ${getStatusColor(c.status)}
                      `}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                  </td>

                  {/* ==================================================
                      ACTIVITY
                  ================================================== */}

                  <td className="px-6 py-4">
                    {getLatestActivity(c.activities) ? (
                      renderActivityPill(
                        getLatestActivity(
                          c.activities
                        )
                      )
                    ) : (
                      <span
                        className="
                          text-xs
                          italic
                          text-muted-foreground/60
                        "
                      >
                        No activity
                      </span>
                    )}
                  </td>

                  {/* ==================================================
                      FOLLOW UP
                  ================================================== */}

                  <td className="px-6 py-4">
                    {c.nextFollowUp ? (
                      <span
                        className="
                          whitespace-nowrap
                          text-sm
                          font-medium
                          text-foreground
                        "
                      >
                        {new Date(
                          c.nextFollowUp
                        ).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
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
                        Not set
                      </span>
                    )}
                  </td>

                  {/* ==================================================
                      ACTIONS
                  ================================================== */}

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

                    {/* ==================================================
                        DROPDOWN
                    ================================================== */}

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
                        {/* EDIT */}

                        <button
                          onClick={() =>
                            handleAction(c, "edit")
                          }
                          className="
                            flex
                            w-full
                            items-center
                            gap-2
                            px-3
                            py-2
                            text-left
                            text-sm
                            text-foreground
                            transition-colors
                            hover:bg-accent
                          "
                        >
                          <Pencil
                            className="
                              h-4
                              w-4
                              text-muted-foreground
                            "
                          />

                          Edit
                        </button>

                        {/* LOG ACTIVITY */}

                        <button
                          onClick={() =>
                            handleAddActivity(c)
                          }
                          className="
                            flex
                            w-full
                            items-center
                            gap-2
                            px-3
                            py-2
                            text-left
                            text-sm
                            text-foreground
                            transition-colors
                            hover:bg-accent
                          "
                        >
                          <CalendarCheck
                            className="
                              h-4
                              w-4
                              text-indigo-500
                              dark:text-indigo-400
                            "
                          />

                          Log Activity
                        </button>

                        {/* TIMELINE */}

                        <button
                          onClick={() =>
                            handleViewTimeline(c)
                          }
                          className="
                            flex
                            w-full
                            items-center
                            gap-2
                            border-t
                            border-border
                            px-3
                            py-2
                            text-left
                            text-sm
                            text-foreground
                            transition-colors
                            hover:bg-accent
                          "
                        >
                          <Clock
                            className="
                              h-4
                              w-4
                              text-muted-foreground
                            "
                          />

                          View Timeline
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
          items-center
          justify-between
          border-t
          border-border
          bg-muted/40
          px-6
          py-4
        "
      >
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {filteredCompanies.length === 0
              ? 0
              : (currentPage - 1) *
                  itemsPerPage +
                1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-foreground">
            {Math.min(
              currentPage * itemsPerPage,
              filteredCompanies.length
            )}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {filteredCompanies.length}
          </span>{" "}
          results
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-4">
            {/* PREVIOUS */}

            <Button
              variant="outline"
              size="sm"
              className="
                h-8
                gap-1
                border-border
                bg-background
                font-medium
                shadow-sm
                hover:bg-muted
              "
              disabled={
                currentPage === 1 ||
                isLoading
              }
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.max(prev - 1, 1)
                )
              }
            >
              <ChevronLeft className="-ml-1 h-4 w-4" />
              Previous
            </Button>

            {/* PAGE NUMBERS */}

            <div className="hidden items-center gap-1 sm:flex">
              {Array.from({
                length: totalPages,
              }).map((_, i) => (
                <button
                  key={i}
                  disabled={isLoading}
                  onClick={() =>
                    setCurrentPage(i + 1)
                  }
                  className={`
                    h-8
                    w-8
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
              ))}
            </div>

            {/* NEXT */}

            <Button
              variant="outline"
              size="sm"
              className="
                h-8
                gap-1
                border-border
                bg-background
                font-medium
                shadow-sm
                hover:bg-muted
              "
              disabled={
                currentPage === totalPages ||
                isLoading
              }
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    prev + 1,
                    totalPages
                  )
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

      <EditCompanyModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        company={selected}
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