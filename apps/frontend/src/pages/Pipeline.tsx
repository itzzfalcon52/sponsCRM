import { useState } from "react";
import { useCompanies, useInfiniteCompanies } from "../hooks/useCompany";
import CompanyCard from "../components/kanban/CompanyCard";
import {
  LayoutGrid,
  Loader2,
  Plus,
  Zap,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_COLUMNS = [
  "NOT_CONTACTED",
  "CONTACTED",
  "IN_TALKS",
  "NEGOTIATING",
  "POSITIVE",
  "REJECTED",
  "CLOSED",
];

const STATUS_CONFIG: Record<
  string,
  {
    color: string;
    dot: string;
    bg: string;
    badge: string;
  }
> = {
  NOT_CONTACTED: {
    color: "border-l-slate-300 dark:border-l-slate-600",
    dot: "bg-slate-400",
    bg: "bg-slate-500/5",
    badge:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },

  CONTACTED: {
    color: "border-l-blue-400 dark:border-l-blue-500",
    dot: "bg-blue-500",
    bg: "bg-blue-500/5",
    badge:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  },

  IN_TALKS: {
    color: "border-l-indigo-400 dark:border-l-indigo-500",
    dot: "bg-indigo-500",
    bg: "bg-indigo-500/5",
    badge:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  },

  NEGOTIATING: {
    color: "border-l-amber-400 dark:border-l-amber-500",
    dot: "bg-amber-500",
    bg: "bg-amber-500/5",
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  },

  POSITIVE: {
    color: "border-l-emerald-400 dark:border-l-emerald-500",
    dot: "bg-emerald-500",
    bg: "bg-emerald-500/5",
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },

  REJECTED: {
    color: "border-l-rose-400 dark:border-l-rose-500",
    dot: "bg-rose-500",
    bg: "bg-rose-500/5",
    badge:
      "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  },

  CLOSED: {
    color: "border-l-green-500 dark:border-l-green-500",
    dot: "bg-green-600",
    bg: "bg-green-600/5",
    badge:
      "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  },
};

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function Pipeline() {
  const { updateCompany } = useCompanies({});

  const [draggedCompanyId, setDraggedCompanyId] = useState<
    string | null
  >(null);

  // ============================================================
  // DRAG START
  // ============================================================

  const handleDragStart = (
    e: React.DragEvent,
    id: string
  ) => {
    setDraggedCompanyId(id);

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  // ============================================================
  // DRAG OVER
  // ============================================================

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // ============================================================
  // DROP
  // ============================================================

  const handleDrop = (
    e: React.DragEvent,
    newStatus: string
  ) => {
    e.preventDefault();

    const companyId =
      draggedCompanyId ||
      e.dataTransfer.getData("text/plain");

    if (!companyId) return;

    updateCompany?.(
      {
        id: companyId,
        data: {
          status: newStatus,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            `Pipeline updated: ${formatStatus(newStatus)}`,
            {
              icon: (
                <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
              ),
            }
          );
        },

        onError: () => {
          toast.error("Failed to update pipeline stage.");
        },

        onSettled: () => {
          setDraggedCompanyId(null);
        },
      }
    );
  };

  return (
    <div
      className="
        h-screen
        flex
        flex-col
        bg-background
        text-foreground
        overflow-hidden
      "
    >
      {/* ========================================================
          SCROLLBAR STYLING
      ======================================================== */}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .kanban-board-wrapper::-webkit-scrollbar {
              height: 10px;
            }

            .kanban-board-wrapper::-webkit-scrollbar-track {
              background: hsl(var(--muted));
              border-radius: 10px;
            }

            .kanban-board-wrapper::-webkit-scrollbar-thumb {
              background: hsl(var(--border));
              border-radius: 10px;
              border: 3px solid hsl(var(--muted));
            }

            .kanban-board-wrapper::-webkit-scrollbar-thumb:hover {
              background: hsl(var(--muted-foreground) / 0.45);
            }

            .column-scroll::-webkit-scrollbar {
              width: 5px;
            }

            .column-scroll::-webkit-scrollbar-track {
              background: transparent;
            }

            .column-scroll::-webkit-scrollbar-thumb {
              background: hsl(var(--border));
              border-radius: 10px;
            }

            .column-scroll::-webkit-scrollbar-thumb:hover {
              background: hsl(var(--muted-foreground) / 0.35);
            }
          `,
        }}
      />

      {/* ========================================================
          HEADER
      ======================================================== */}

      <header
        className="
          px-8
          pt-8
          pb-6
          shrink-0
          flex
          items-center
          justify-between
          bg-background/80
          backdrop-blur-md
          border-b
          border-border/50
          z-10
        "
      >
        {/* LEFT */}

        <div className="flex items-center gap-4">
          <div
            className="
              h-12
              w-12
              bg-indigo-600
              dark:bg-indigo-500
              rounded-2xl
              flex
              items-center
              justify-center
              shadow-xl
              shadow-indigo-500/20
              rotate-3
            "
          >
            <LayoutGrid className="h-6 w-6 text-white -rotate-3" />
          </div>

          <div>
            <h1
              className="
                text-2xl
                font-black
                tracking-tight
                text-foreground
                leading-none
              "
            >
              Deal Pipeline
            </h1>

            <p
              className="
                text-sm
                font-semibold
                text-muted-foreground
                mt-1
              "
            >
              SponsCRM Workflow
            </p>
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-4">
          {/* Team avatars placeholder */}

          <div className="hidden sm:flex -space-x-2 mr-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="
                  h-8
                  w-8
                  rounded-full
                  border-2
                  border-background
                  bg-muted
                  shadow-sm
                "
              />
            ))}
          </div>

          <button
            className="
              bg-card
              border
              border-border
              px-4
              py-2
              rounded-xl
              text-xs
              font-bold
              text-foreground
              shadow-sm
              hover:bg-muted
              transition-all
              flex
              items-center
              gap-2
            "
          >
            <Users className="h-4 w-4 text-muted-foreground" />

            <span className="hidden sm:inline">
              Team View
            </span>
          </button>
        </div>
      </header>

      {/* ========================================================
          KANBAN BOARD
      ======================================================== */}

      <main
        className="
          flex-1
          overflow-x-auto
          kanban-board-wrapper
          px-8
          pb-12
          pt-6
          flex
          flex-row
          gap-6
          items-start
        "
      >
        {STATUS_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            draggedCompanyId={draggedCompanyId}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}

        {/* Spacer */}

        <div className="shrink-0 w-8 h-full" />
      </main>
    </div>
  );
}

// ================================================================
// KANBAN COLUMN
// ================================================================

function KanbanColumn({
  status,
  draggedCompanyId,
  onDragStart,
  onDragOver,
  onDrop,
}: any) {
  const {
    companies,
    totalItems = 0,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCompanies({
    status,
  });

  const [isOver, setIsOver] = useState(false);

  const config =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG.NOT_CONTACTED;

  return (
    <div
      onDragOver={(e) => {
        onDragOver(e);
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        onDrop(e, status);
        setIsOver(false);
      }}
      className={`
        flex
        flex-col
        shrink-0
        w-[320px]
        max-h-full
        bg-card
        rounded-3xl
        border
        border-border
        transition-all
        duration-300
        relative
        overflow-hidden
        border-l-[4px]
        ${config.color}

        ${
          isOver
            ? `
              border-indigo-500
              dark:border-indigo-400
              bg-indigo-50/30
              dark:bg-indigo-500/5
              scale-[1.02]
              shadow-2xl
              shadow-indigo-500/10
              z-20
            `
            : `
              shadow-sm
              hover:shadow-md
            `
        }
      `}
    >
      {/* ========================================================
          BACKGROUND ACCENT
      ======================================================== */}

      <div
        className={`
          absolute
          inset-0
          ${config.bg}
          opacity-50
          pointer-events-none
          rounded-3xl
        `}
      />

      {/* ========================================================
          COLUMN HEADER
      ======================================================== */}

      <div
        className="
          p-5
          flex
          items-center
          justify-between
          shrink-0
          relative
          z-10
          border-b
          border-border/60
        "
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`
              h-2.5
              w-2.5
              rounded-full
              ${config.dot}
              shadow-sm
              shrink-0
            `}
          />

          <h3
            className="
              text-xs
              font-black
              text-foreground
              uppercase
              tracking-widest
              truncate
            "
          >
            {formatStatus(status)}
          </h3>
        </div>

        {/* Count */}

        <div
          className={`
            h-6
            min-w-[24px]
            px-1.5
            flex
            items-center
            justify-center
            rounded-lg
            text-[10px]
            font-black
            shrink-0
            ${config.badge}
          `}
        >
          {totalItems}
        </div>
      </div>

      {/* ========================================================
          CARDS LIST
      ======================================================== */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-3
          py-4
          pb-6
          space-y-4
          column-scroll
          relative
          z-10
        "
        onScroll={(e) => {
          const element = e.currentTarget;

          const nearBottom =
            element.scrollHeight -
              element.scrollTop <=
            element.clientHeight + 100;

          if (
            nearBottom &&
            hasNextPage &&
            !isFetchingNextPage
          ) {
            fetchNextPage();
          }
        }}
      >
        {/* ======================================================
            LOADING
        ====================================================== */}

        {isLoading ? (
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              h-32
              space-y-2
            "
          >
            <Loader2
              className="
                h-6
                w-6
                animate-spin
                text-indigo-500
                dark:text-indigo-400
              "
            />

            <p
              className="
                text-[10px]
                font-bold
                text-muted-foreground
                uppercase
                tracking-tighter
              "
            >
              Updating stage...
            </p>
          </div>
        ) : totalItems === 0 ? (
          /* ====================================================
             EMPTY STATE
          ==================================================== */

          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              py-12
              border-2
              border-dashed
              border-border
              rounded-2xl
              bg-muted/30
              m-1
            "
          >
            <div
              className="
                h-10
                w-10
                bg-card
                rounded-full
                flex
                items-center
                justify-center
                shadow-sm
                border
                border-border
                mb-2
              "
            >
              <Plus className="h-4 w-4 text-muted-foreground/50" />
            </div>

            <p
              className="
                text-[10px]
                font-black
                text-muted-foreground
                uppercase
                tracking-widest
              "
            >
              No deals here
            </p>

            <p
              className="
                text-[9px]
                text-muted-foreground/70
                mt-1
              "
            >
              Drag a company here
            </p>
          </div>
        ) : (
          <>
            {/* ==================================================
                COMPANY CARDS
            ================================================== */}

            {companies?.map(
              (company: any, index: number) => (
                <div
                  key={`${company.id}-${index}`}
                  draggable
                  onDragStart={(e) =>
                    onDragStart(e, company.id)
                  }
                  className={`
                    transition-all
                    duration-300
                    cursor-grab
                    active:cursor-grabbing

                    ${
                      draggedCompanyId === company.id
                        ? `
                          opacity-25
                          scale-90
                          rotate-2
                        `
                        : `
                          opacity-100
                          hover:-translate-y-1
                        `
                    }
                  `}
                >
                  <CompanyCard company={company} />
                </div>
              )
            )}

            {/* ==================================================
                LOAD MORE
            ================================================== */}

            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="
                  w-full
                  py-4
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-2
                  group
                  transition-all
                  rounded-xl
                  hover:bg-muted/50
                  disabled:opacity-60
                "
              >
                {isFetchingNextPage ? (
                  <Loader2
                    className="
                      h-5
                      w-5
                      animate-spin
                      text-muted-foreground
                    "
                  />
                ) : (
                  <>
                    <div
                      className="
                        h-1
                        w-8
                        bg-border
                        rounded-full
                        group-hover:bg-indigo-400
                        transition-colors
                      "
                    />

                    <span
                      className="
                        text-[9px]
                        font-black
                        uppercase
                        text-muted-foreground
                        tracking-tighter
                        group-hover:text-indigo-600
                        dark:group-hover:text-indigo-400
                        transition-colors
                      "
                    >
                      View{" "}
                      {Math.max(
                        0,
                        totalItems -
                          (companies?.length || 0)
                      )}{" "}
                      More Deals
                    </span>
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}