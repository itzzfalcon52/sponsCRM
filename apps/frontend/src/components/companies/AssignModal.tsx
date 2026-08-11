import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useOrg } from "../../hooks/useOrg";
import { useCompanies } from "../../hooks/useCompany";
import {
  UserPlus,
  UserMinus,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function AssignModal({
  open,
  onClose,
  company,
  selectedIds = [],
}: any) {
  const { orgMembers } = useOrg();
  const { assignCompany, bulkAssign } = useCompanies();

  // Track the ID of the user being assigned,
  // or "unassign" for the unassign action.
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const isBulk = selectedIds.length > 0;

  const handleAssign = (targetUserId: string | null) => {
    if (loadingId) return;

    setLoadingId(
      targetUserId === null ? "unassign" : targetUserId
    );

    const action = isBulk ? bulkAssign : assignCompany;

    const payload = isBulk
      ? {
          companyIds: selectedIds,
          assignedToId: targetUserId,
        }
      : {
          id: company.id,
          assignedToId: targetUserId,
        };

    action(payload as any, {
      onSuccess: () => {
        toast.success(
          targetUserId
            ? `${
                isBulk ? selectedIds.length + " companies" : "Company"
              } assigned successfully!`
            : `${
                isBulk ? selectedIds.length + " companies" : "Company"
              } unassigned successfully!`
        );

        onClose();
      },

      onError: () => {
        toast.error(
          "An error occurred. Please try again."
        );
      },

      onSettled: () => {
        setLoadingId(null);
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!loadingId) {
          onClose(isOpen);
        }
      }}
    >
      <DialogContent
        className="
          sm:max-w-[450px]
          p-0
          overflow-hidden
          border-border
          bg-background
          text-foreground
          shadow-2xl
        "
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <DialogHeader
          className="
            px-6
            pt-6
            pb-4
            border-b
            border-border
            bg-muted/40
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                items-center
                justify-center
                rounded-xl
                bg-primary/10
                p-2.5
              "
            >
              <UserPlus className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <DialogTitle
                className="
                  text-xl
                  font-bold
                  tracking-tight
                  text-foreground
                "
              >
                {isBulk
                  ? "Bulk Assign Companies"
                  : "Assign Company"}
              </DialogTitle>

              <DialogDescription
                className="
                  mt-1
                  text-sm
                  text-muted-foreground
                "
              >
                {isBulk ? (
                  <>
                    Select a team member to assign{" "}
                    <span className="font-semibold text-foreground">
                      {selectedIds.length}
                    </span>{" "}
                    companies to.
                  </>
                ) : (
                  <>
                    Select a team member to assign{" "}
                    <span className="font-semibold text-foreground">
                      {company?.name}
                    </span>{" "}
                    to.
                  </>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* =====================================================
            TEAM MEMBERS AREA
        ====================================================== */}

        <div
          className="
            relative
            max-h-[50vh]
            space-y-2.5
            overflow-y-auto
            bg-muted/20
            p-4
          "
        >
          {/* Loading overlay */}

          {loadingId && (
            <div
              className="
                absolute
                inset-0
                z-10
                cursor-not-allowed
                bg-background/30
                backdrop-blur-[1px]
              "
            />
          )}

          {/* ===================================================
              UNASSIGN
          ==================================================== */}

          {((!isBulk && company?.assignedToId) || isBulk) && (
            <div
              className={`
                mb-4
                flex
                items-center
                justify-between
                rounded-xl
                border
                p-3
                transition-all
                duration-200

                border-destructive/20
                bg-destructive/5

                ${
                  loadingId
                    ? "cursor-not-allowed opacity-60"
                    : `
                      cursor-pointer
                      hover:border-destructive/40
                      hover:bg-destructive/10
                      hover:shadow-sm
                    `
                }
              `}
              onClick={() => handleAssign(null)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-destructive/10
                    text-destructive
                  "
                >
                  <UserMinus className="h-5 w-5" />
                </div>

                <div>
                  <p
                    className="
                      text-sm
                      font-semibold
                      leading-none
                      text-destructive
                    "
                  >
                    Unassign
                  </p>

                  <p
                    className="
                      mt-1.5
                      line-clamp-1
                      text-xs
                      text-destructive/70
                    "
                  >
                    Remove current assignment
                  </p>
                </div>
              </div>

              {loadingId === "unassign" && (
                <Loader2
                  className="
                    mr-2
                    h-5
                    w-5
                    animate-spin
                    text-destructive
                  "
                />
              )}
            </div>
          )}

          {/* ===================================================
              TEAM MEMBERS
          ==================================================== */}

          {orgMembers && orgMembers.length > 0 ? (
            orgMembers.map((m: any) => {
              const isAssigned =
                !isBulk &&
                company?.assignedToId === m.id;

              const isLoadingThis =
                loadingId === m.id;

              return (
                <div
                  key={m.id}
                  className={`
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    border
                    p-3
                    transition-all
                    duration-200

                    ${
                      isAssigned
                        ? `
                          border-primary/30
                          bg-primary/10
                          ring-1
                          ring-primary/30
                          shadow-sm
                        `
                        : loadingId
                        ? `
                          cursor-not-allowed
                          border-border
                          bg-card
                          opacity-60
                        `
                        : `
                          cursor-pointer
                          border-border
                          bg-card
                          hover:border-primary/30
                          hover:bg-primary/5
                          hover:shadow-sm
                        `
                    }
                  `}
                  onClick={() => {
                    if (!isAssigned && !loadingId) {
                      handleAssign(m.id);
                    }
                  }}
                >
                  {/* User information */}

                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-full
                        text-sm
                        font-bold

                        ${
                          isAssigned
                            ? `
                              bg-primary/15
                              text-primary
                            `
                            : `
                              bg-muted
                              text-muted-foreground
                            `
                        }
                      `}
                    >
                      {m.name
                        ? m.name
                            .charAt(0)
                            .toUpperCase()
                        : m.email
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          truncate
                          text-sm
                          font-semibold
                          leading-none
                          text-foreground
                        "
                      >
                        {m.name || "Unknown User"}
                      </p>

                      <p
                        className="
                          mt-1.5
                          max-w-[150px]
                          truncate
                          text-xs
                          text-muted-foreground
                        "
                      >
                        {m.email}
                      </p>
                    </div>
                  </div>

                  {/* Role + state */}

                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`
                        rounded-md
                        px-2
                        py-1
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wider

                        ${
                          m.role === "ADMIN"
                            ? `
                              bg-amber-500/10
                              text-amber-600
                              dark:text-amber-400
                            `
                            : m.role === "SENIOR"
                            ? `
                              bg-purple-500/10
                              text-purple-600
                              dark:text-purple-400
                            `
                            : `
                              bg-muted
                              text-muted-foreground
                            `
                        }
                      `}
                    >
                      {m.role}
                    </span>

                    {isLoadingThis ? (
                      <Loader2
                        className="
                          h-5
                          w-5
                          animate-spin
                          text-primary
                        "
                      />
                    ) : isAssigned ? (
                      <CheckCircle2
                        className="
                          h-5
                          w-5
                          text-primary
                        "
                      />
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            /* =================================================
               EMPTY STATE
            ================================================== */

            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                py-10
                text-center
              "
            >
              <div
                className="
                  mb-3
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-muted
                "
              >
                <UserPlus
                  className="
                    h-5
                    w-5
                    text-muted-foreground
                  "
                />
              </div>

              <p
                className="
                  text-sm
                  font-medium
                  text-foreground
                "
              >
                No team members found
              </p>

              <p
                className="
                  mt-1
                  max-w-[260px]
                  text-xs
                  text-muted-foreground
                "
              >
                There are currently no other members
                in this organization.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}