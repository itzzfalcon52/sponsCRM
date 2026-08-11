import { useState, useEffect } from "react";
import { useActivity } from "../../hooks/useActivity";
import { Button } from "@/components/ui/button";
import {
  X,
  Phone,
  Mail,
  Calendar,
  Loader2,
} from "lucide-react";

export default function ActivityModal({
  open,
  onClose,
  company,
}: any) {
  const [type, setType] = useState<"CALL" | "EMAIL" | "MEETING">("CALL");
  const [note, setNote] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");

  const { createActivity, isLoading } = useActivity(company?.id);

  // ============================================================
  // RESET FORM WHEN MODAL OPENS
  // ============================================================

  useEffect(() => {
    if (open) {
      setType("CALL");
      setNote("");
      setNextFollowUp("");
    }
  }, [open]);

  if (!open || !company) return null;

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = () => {
    if (!note.trim() || isLoading) return;

    createActivity({
      companyId: company.id,
      type,
      note: note.trim(),
      nextFollowUp: nextFollowUp || undefined,
    });

    onClose();
  };

  // ============================================================
  // ACTIVITY TYPES
  // ============================================================

  const activityTypes = [
    {
      value: "CALL",
      label: "Call",
      description: "Phone conversation",
      icon: Phone,
    },
    {
      value: "EMAIL",
      label: "Email",
      description: "Email interaction",
      icon: Mail,
    },
    {
      value: "MEETING",
      label: "Meeting",
      description: "In-person / online",
      icon: Calendar,
    },
  ];

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        p-4
        backdrop-blur-sm

        dark:bg-black/60

        animate-in
        fade-in
        duration-200
      "
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      {/* ========================================================
          MODAL
      ======================================================== */}

      <div
        className="
          flex
          w-full
          max-w-lg
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-background
          text-foreground
          shadow-2xl

          animate-in
          zoom-in-95
          duration-200
        "
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

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
            <h2
              className="
                text-lg
                font-semibold
                tracking-tight
                text-foreground
              "
            >
              Log Activity
            </h2>

            <p
              className="
                mt-0.5
                truncate
                text-sm
                font-medium
                text-muted-foreground
              "
            >
              {company.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close modal"
            className="
              ml-4
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              text-muted-foreground
              transition-all

              hover:bg-muted
              hover:text-foreground

              focus:outline-none
              focus:ring-2
              focus:ring-ring
              focus:ring-offset-2
              focus:ring-offset-background

              active:scale-95

              disabled:pointer-events-none
              disabled:opacity-50
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ======================================================
            BODY
        ====================================================== */}

        <div className="space-y-6 px-6 py-6">
          {/* ====================================================
              ACTIVITY TYPE
          ==================================================== */}

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                className="
                  text-sm
                  font-semibold
                  text-foreground
                "
              >
                Activity Type
              </label>

              <span
                className="
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >
                Required
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {activityTypes.map(
                ({
                  value,
                  label,
                  description,
                  icon: Icon,
                }) => {
                  const isActive = type === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        setType(value as "CALL" | "EMAIL" | "MEETING")
                      }
                      className={`
                        group
                        flex
                        min-h-[100px]
                        flex-col
                        items-center
                        justify-center
                        rounded-xl
                        border
                        p-3
                        text-center
                        transition-all
                        duration-200

                        focus:outline-none
                        focus:ring-2
                        focus:ring-indigo-500/30
                        focus:ring-offset-2
                        focus:ring-offset-background

                        disabled:cursor-not-allowed
                        disabled:opacity-60

                        ${
                          isActive
                            ? `
                              border-indigo-500
                              bg-indigo-50
                              text-indigo-700
                              shadow-sm
                              ring-1
                              ring-indigo-500

                              dark:border-indigo-400
                              dark:bg-indigo-950/40
                              dark:text-indigo-300
                            `
                            : `
                              border-border
                              bg-background
                              text-muted-foreground

                              hover:border-indigo-300
                              hover:bg-indigo-50/50
                              hover:text-foreground

                              dark:hover:border-indigo-800
                              dark:hover:bg-indigo-950/30
                              dark:hover:text-indigo-300
                            `
                        }
                      `}
                    >
                      <div
                        className={`
                          mb-2
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          transition-colors

                          ${
                            isActive
                              ? `
                                bg-indigo-100
                                dark:bg-indigo-900/60
                              `
                              : `
                                bg-muted
                                group-hover:bg-indigo-100/70
                                dark:group-hover:bg-indigo-900/40
                              `
                          }
                        `}
                      >
                        <Icon
                          className={`
                            h-4
                            w-4

                            ${
                              isActive
                                ? `
                                  text-indigo-600
                                  dark:text-indigo-400
                                `
                                : `
                                  text-muted-foreground
                                  group-hover:text-indigo-600
                                  dark:group-hover:text-indigo-400
                                `
                            }
                          `}
                        />
                      </div>

                      <span className="text-sm font-semibold">
                        {label}
                      </span>

                      <span
                        className="
                          mt-0.5
                          hidden
                          text-[9px]
                          font-medium
                          text-muted-foreground
                          sm:block
                        "
                      >
                        {description}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* ====================================================
              NOTES
          ==================================================== */}

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="activity-note"
                className="
                  text-sm
                  font-semibold
                  text-foreground
                "
              >
                Notes & Details
              </label>

              <span
                className={`
                  text-[10px]
                  font-medium
                  ${
                    note.length > 900
                      ? "text-amber-500"
                      : "text-muted-foreground"
                  }
                `}
              >
                {note.length}/1000
              </span>
            </div>

            <textarea
              id="activity-note"
              placeholder="What was discussed?"
              value={note}
              maxLength={1000}
              disabled={isLoading}
              onChange={(e) => setNote(e.target.value)}
              className="
                min-h-[120px]
                w-full
                resize-none
                rounded-xl
                border
                border-border
                bg-background
                p-3.5
                text-sm
                text-foreground
                shadow-sm
                outline-none
                transition-all

                placeholder:text-muted-foreground/60

                hover:border-muted-foreground/30

                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/20

                dark:focus:border-indigo-400

                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />

            {!note.trim() && (
              <p className="text-[11px] text-muted-foreground">
                Add a short note describing the interaction.
              </p>
            )}
          </div>

          {/* ====================================================
              FOLLOW-UP
          ==================================================== */}

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="next-follow-up"
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-foreground
                "
              >
                <Calendar className="h-4 w-4 text-muted-foreground" />

                <span>Next Follow-up Date</span>
              </label>

              <span
                className="
                  rounded-md
                  bg-muted
                  px-2
                  py-0.5
                  text-[10px]
                  font-medium
                  text-muted-foreground
                "
              >
                Optional
              </span>
            </div>

            <input
              id="next-follow-up"
              type="date"
              value={nextFollowUp}
              disabled={isLoading}
              onChange={(e) =>
                setNextFollowUp(e.target.value)
              }
              className="
                w-full
                rounded-xl
                border
                border-border
                bg-background
                px-3
                py-2.5
                text-sm
                text-foreground
                shadow-sm
                outline-none
                transition-all

                hover:border-muted-foreground/30

                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/20

                dark:focus:border-indigo-400

                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />

            <p
              className="
                text-[11px]
                text-muted-foreground
              "
            >
              Set a date if you need to contact this company
              again.
            </p>
          </div>
        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div
          className="
            flex
            items-center
            justify-end
            gap-3
            border-t
            border-border
            bg-muted/40
            px-6
            py-4
          "
        >
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
            className="
              border-border
              bg-background
              text-foreground

              hover:bg-muted

              disabled:opacity-50
            "
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !note.trim()}
            className="
              min-w-[125px]
              bg-indigo-600
              font-semibold
              text-white
              shadow-sm
              transition-all

              hover:bg-indigo-700
              hover:shadow-md

              dark:bg-indigo-500
              dark:hover:bg-indigo-600

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Activity"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}