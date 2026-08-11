import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  X,
  Clock,
  Phone,
  Mail,
  Users,
  Activity as ActivityIcon,
} from "lucide-react";
import { useActivity } from "@/hooks/useActivity";
import { format, formatDistanceToNow } from "date-fns";

export default function TimelineModal({
  open,
  onClose,
  company,
}: any) {
  // ============================================================
  // ACTIVITY DATA
  // ============================================================

  const { activities, isLoading } = useActivity(company?.id);

  // ============================================================
  // ACTIVITY ICON
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

  // ============================================================
  // ACTIVITY COLOR
  // ============================================================

  const getActivityColor = (type: string) => {
    switch (type) {
      case "CALL":
        return `
          bg-emerald-50
          text-emerald-700
          border-emerald-200

          dark:bg-emerald-950/30
          dark:text-emerald-400
          dark:border-emerald-900/60
        `;

      case "EMAIL":
        return `
          bg-amber-50
          text-amber-700
          border-amber-200

          dark:bg-amber-950/30
          dark:text-amber-400
          dark:border-amber-900/60
        `;

      case "MEETING":
        return `
          bg-indigo-50
          text-indigo-700
          border-indigo-200

          dark:bg-indigo-950/30
          dark:text-indigo-400
          dark:border-indigo-900/60
        `;

      default:
        return `
          bg-muted
          text-muted-foreground
          border-border
        `;
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
      >
        {/* ======================================================
            BACKDROP
        ====================================================== */}

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="
              fixed
              inset-0
              bg-slate-900/40
              backdrop-blur-sm

              dark:bg-black/60
            "
          />
        </Transition.Child>

        {/* ======================================================
            MODAL CONTAINER
        ====================================================== */}

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel
                className="
                  w-full
                  max-w-lg
                  transform
                  overflow-hidden
                  rounded-2xl
                  bg-background
                  text-foreground
                  shadow-2xl
                  ring-1
                  ring-border
                  transition-all
                "
              >
                {/* ==================================================
                    HEADER
                ================================================== */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-border
                    bg-muted/40
                    px-6
                    py-4
                  "
                >
                  <div className="min-w-0">
                    <Dialog.Title
                      as="h3"
                      className="
                        text-lg
                        font-semibold
                        text-foreground
                      "
                    >
                      Activity Timeline
                    </Dialog.Title>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-muted-foreground
                      "
                    >
                      History for{" "}
                      <span
                        className="
                          font-medium
                          text-foreground
                        "
                      >
                        {company?.name}
                      </span>
                    </p>
                  </div>

                  {/* Close button */}

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close activity timeline"
                    className="
                      shrink-0
                      rounded-full
                      p-2
                      text-muted-foreground

                      transition-colors

                      hover:bg-muted
                      hover:text-foreground

                      focus:outline-none
                      focus:ring-2
                      focus:ring-ring
                      focus:ring-offset-2
                      focus:ring-offset-background
                    "
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* ==================================================
                    CONTENT
                ================================================== */}

                <div
                  className="
                    max-h-[60vh]
                    overflow-y-auto
                    px-6
                    py-6
                  "
                >
                  {/* =================================================
                      LOADING
                  ================================================= */}

                  {isLoading ? (
                    <div
                      className="
                        flex
                        flex-col
                        items-center
                        justify-center
                        py-10
                        text-muted-foreground
                      "
                    >
                      <Clock
                        className="
                          mb-3
                          h-8
                          w-8
                          animate-spin
                          text-indigo-500
                          dark:text-indigo-400
                        "
                      />

                      <p className="text-sm">
                        Loading history...
                      </p>
                    </div>
                  ) : activities.length === 0 ? (
                    /* ===============================================
                       EMPTY STATE
                    =============================================== */

                    <div className="py-10 text-center">
                      <div
                        className="
                          mx-auto
                          mb-3
                          flex
                          h-16
                          w-16
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-border
                          bg-muted
                        "
                      >
                        <ActivityIcon
                          className="
                            h-8
                            w-8
                            text-muted-foreground/50
                          "
                        />
                      </div>

                      <p
                        className="
                          text-sm
                          text-muted-foreground
                        "
                      >
                        No activity recorded yet.
                      </p>
                    </div>
                  ) : (
                    /* ===============================================
                       TIMELINE
                    =============================================== */

                    <div
                      className="
                        relative
                        space-y-6

                        before:absolute
                        before:inset-y-0
                        before:left-5
                        before:w-0.5
                        before:-translate-x-px
                        before:bg-gradient-to-b
                        before:from-transparent
                        before:via-border
                        before:to-transparent
                      "
                    >
                      {activities.map((a: any) => (
                        <div
                          key={a.id}
                          className="
                            relative
                            flex
                            items-start
                            gap-4
                          "
                        >
                          {/* ========================================
                              TIMELINE ICON
                          ======================================== */}

                          <div
                            className={`
                              relative
                              z-10
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              border
                              shadow-sm
                              ring-4
                              ring-background

                              ${getActivityColor(a.type)}
                            `}
                          >
                            {getActivityIcon(a.type)}
                          </div>

                          {/* ========================================
                              ACTIVITY CARD
                          ======================================== */}

                          <div
                            className="
                              min-w-0
                              flex-1
                              rounded-xl
                              border
                              border-border
                              bg-card
                              p-4
                              shadow-sm

                              transition-all

                              hover:border-indigo-300
                              hover:shadow-md

                              dark:hover:border-indigo-500/50
                            "
                          >
                            {/* Activity header */}

                            <div
                              className="
                                mb-2
                                flex
                                items-start
                                justify-between
                                gap-3
                              "
                            >
                              <p
                                className="
                                  text-sm
                                  font-semibold
                                  capitalize
                                  text-foreground
                                "
                              >
                                {a.type.toLowerCase()}
                              </p>

                              <span
                                className="
                                  shrink-0
                                  whitespace-nowrap
                                  rounded-md
                                  border
                                  border-border
                                  bg-muted/60
                                  px-2
                                  py-1
                                  text-xs
                                  text-muted-foreground
                                "
                              >
                                {format(
                                  new Date(a.createdAt),
                                  "MMM d, p"
                                )}
                              </span>
                            </div>

                            {/* Activity metadata */}

                            <p
                              className="
                                mb-3
                                text-xs
                                text-muted-foreground
                              "
                            >
                              Logged by{" "}
                              <span
                                className="
                                  font-medium
                                  text-foreground
                                "
                              >
                                {a.user?.name || "Someone"}
                              </span>{" "}
                              •{" "}
                              {formatDistanceToNow(
                                new Date(a.createdAt),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </p>

                            {/* Note */}

                            {a.note && (
                              <div
                                className="
                                  rounded-lg
                                  border
                                  border-border
                                  bg-muted/50
                                  p-3
                                  text-sm
                                  leading-relaxed
                                  text-muted-foreground
                                "
                              >
                                {a.note}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}