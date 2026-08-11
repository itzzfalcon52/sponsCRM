import { useState } from "react";
import { useOrg } from "../hooks/useOrg";
import { useAuthStore } from "../stores/authstore";
import {
  MoreVertical,
  Shield,
  UserX,
  UserMinus,
  ShieldAlert,
  Award,
  Users,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Team() {
  const {
    orgMembers,
    isOrgMembersLoading,
    removeOrgMember,
    updateMemberRole,
  } = useOrg();

  const currentUser = useAuthStore((s) => s.user);

  const isAdmin = currentUser?.role === "ADMIN";

  const [openDropdownId, setOpenDropdownId] =
    useState<string | null>(null);

  const [removingUser, setRemovingUser] =
    useState<any>(null);

  const [isRemoving, setIsRemoving] = useState(false);

  // ============================================================
  // ROLE CHANGE
  // ============================================================

  const handleRoleChange = (
    userId: string,
    newRole: string
  ) => {
    updateMemberRole(
      {
        userId,
        role: newRole,
      },
      {
        onSuccess: () => {
          toast.success(
            `User role updated to ${newRole}`
          );
        },

        onError: (err: any) => {
          toast.error(
            err?.message ||
              "Failed to update role"
          );
        },
      }
    );

    setOpenDropdownId(null);
  };

  // ============================================================
  // REMOVE MEMBER
  // ============================================================

  const handleRemove = () => {
    if (!removingUser || isRemoving) return;

    setIsRemoving(true);

    removeOrgMember(removingUser.id, {
      onSuccess: () => {
        toast.success(
          "Member removed successfully"
        );

        setRemovingUser(null);
      },

      onError: (err: any) => {
        toast.error(
          err?.message ||
            "Failed to remove member"
        );
      },

      onSettled: () => {
        setIsRemoving(false);
      },
    });
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (isOrgMembersLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2
          className="
            h-6
            w-6
            animate-spin
            text-indigo-500
          "
        />

        <p
          className="
            text-sm
            font-medium
            text-muted-foreground
          "
        >
          Loading team members...
        </p>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="
        p-6
        max-w-6xl
        mx-auto
        space-y-6
        animate-in
        fade-in
        slide-in-from-bottom-4
        duration-500
      "
      onClick={() => setOpenDropdownId(null)}
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          justify-between
          gap-4
        "
      >
        <div>
          <div className="flex items-center gap-3">
            <div
              className="
                h-10
                w-10
                rounded-xl
                bg-indigo-100
                dark:bg-indigo-500/15
                flex
                items-center
                justify-center
              "
            >
              <Users
                className="
                  h-5
                  w-5
                  text-indigo-600
                  dark:text-indigo-400
                "
              />
            </div>

            <h1
              className="
                text-2xl
                font-bold
                text-foreground
              "
            >
              Team Members
            </h1>
          </div>

          <p
            className="
              text-sm
              text-muted-foreground
              mt-2
            "
          >
            Manage your organization's members,
            roles, and access.
          </p>
        </div>

        {/* Member count */}

        <div
          className="
            self-start
            sm:self-auto
            px-3
            py-1.5
            rounded-full
            bg-muted
            border
            border-border
            text-xs
            font-bold
            text-muted-foreground
          "
        >
          {orgMembers?.length || 0}{" "}
          {orgMembers?.length === 1
            ? "Member"
            : "Members"}
        </div>
      </div>

      {/* ========================================================
          TEAM TABLE
      ======================================================== */}

      <div
        className="
          bg-card
          border
          border-border
          rounded-2xl
          shadow-sm
          overflow-hidden
          min-h-[400px]
        "
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            {/* ==================================================
                TABLE HEADER
            ================================================== */}

            <thead
              className="
                bg-muted/60
                text-muted-foreground
                border-b
                border-border
              "
            >
              <tr>
                <th
                  className="
                    px-6
                    py-4
                    font-semibold
                    text-xs
                    tracking-wider
                    uppercase
                  "
                >
                  Member
                </th>

                <th
                  className="
                    px-6
                    py-4
                    font-semibold
                    text-xs
                    tracking-wider
                    uppercase
                  "
                >
                  Role
                </th>

                <th
                  className="
                    px-6
                    py-4
                    font-semibold
                    text-xs
                    tracking-wider
                    uppercase
                  "
                >
                  Joined
                </th>

                <th
                  className="
                    px-6
                    py-4
                    font-semibold
                    text-xs
                    tracking-wider
                    uppercase
                    text-right
                  "
                >
                  Actions
                </th>
              </tr>
            </thead>

            {/* ==================================================
                TABLE BODY
            ================================================== */}

            <tbody className="divide-y divide-border">
              {orgMembers?.map(
                (member: any) => {
                  const isMe =
                    member.id ===
                    currentUser?.id;

                  return (
                    <tr
                      key={member.id}
                      className="
                        hover:bg-muted/40
                        transition-colors
                        group
                      "
                    >
                      {/* ========================================
                          MEMBER
                      ======================================== */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}

                          <div
                            className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              font-bold
                              text-sm
                              bg-indigo-100
                              dark:bg-indigo-500/15
                              text-indigo-700
                              dark:text-indigo-400
                            "
                          >
                            {member.name
                              ? member.name
                                  .charAt(0)
                                  .toUpperCase()
                              : member.email
                                  ?.charAt(0)
                                  .toUpperCase()}
                          </div>

                          {/* User information */}

                          <div className="min-w-0">
                            <div
                              className="
                                font-semibold
                                text-foreground
                                flex
                                items-center
                                gap-2
                              "
                            >
                              <span className="truncate">
                                {member.name ||
                                  "Unnamed User"}
                              </span>

                              {isMe && (
                                <span
                                  className="
                                    shrink-0
                                    text-[10px]
                                    bg-muted
                                    text-muted-foreground
                                    px-2
                                    py-0.5
                                    rounded-full
                                    border
                                    border-border
                                    font-medium
                                  "
                                >
                                  You
                                </span>
                              )}
                            </div>

                            <div
                              className="
                                text-xs
                                text-muted-foreground
                                mt-0.5
                                truncate
                              "
                            >
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ========================================
                          ROLE
                      ======================================== */}

                      <td className="px-6 py-4">
                        <RoleBadge
                          role={member.role}
                        />
                      </td>

                      {/* ========================================
                          JOINED
                      ======================================== */}

                      <td
                        className="
                          px-6
                          py-4
                          text-muted-foreground
                          text-sm
                          whitespace-nowrap
                        "
                      >
                        {member.createdAt
                          ? new Date(
                              member.createdAt
                            ).toLocaleDateString(
                              undefined,
                              {
                                month:
                                  "short",
                                day: "numeric",
                                year:
                                  "numeric",
                              }
                            )
                          : "—"}
                      </td>

                      {/* ========================================
                          ACTIONS
                      ======================================== */}

                      <td
                        className="
                          px-6
                          py-4
                          text-right
                          relative
                        "
                      >
                        {isAdmin && !isMe && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setOpenDropdownId(
                                  openDropdownId ===
                                    member.id
                                    ? null
                                    : member.id
                                )
                              }
                              className="
                                p-1.5
                                text-muted-foreground
                                hover:text-foreground
                                hover:bg-muted
                                rounded-md
                                transition-colors
                                focus:outline-none
                                focus:ring-2
                                focus:ring-indigo-500/30
                              "
                              aria-label={`Actions for ${
                                member.name ||
                                member.email
                              }`}
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>

                            {/* Dropdown */}

                            {openDropdownId ===
                              member.id && (
                              <div
                                className="
                                  absolute
                                  right-10
                                  top-12
                                  w-52
                                  bg-popover
                                  text-popover-foreground
                                  rounded-xl
                                  shadow-xl
                                  border
                                  border-border
                                  z-[60]
                                  py-1.5
                                  animate-in
                                  fade-in
                                  zoom-in-95
                                  duration-100
                                  overflow-hidden
                                "
                              >
                                {/* Make Senior */}

                                {member.role !==
                                  "SENIOR" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRoleChange(
                                        member.id,
                                        "SENIOR"
                                      )
                                    }
                                    className="
                                      w-full
                                      text-left
                                      px-3
                                      py-2.5
                                      text-sm
                                      text-foreground
                                      hover:bg-muted
                                      flex
                                      items-center
                                      gap-2.5
                                      transition-colors
                                    "
                                  >
                                    <Award
                                      className="
                                        h-4
                                        w-4
                                        text-purple-500
                                      "
                                    />

                                    Make Senior
                                  </button>
                                )}

                                {/* Make Member */}

                                {member.role !==
                                  "MEMBER" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRoleChange(
                                        member.id,
                                        "MEMBER"
                                      )
                                    }
                                    className="
                                      w-full
                                      text-left
                                      px-3
                                      py-2.5
                                      text-sm
                                      text-foreground
                                      hover:bg-muted
                                      flex
                                      items-center
                                      gap-2.5
                                      transition-colors
                                    "
                                  >
                                    <UserX
                                      className="
                                        h-4
                                        w-4
                                        text-slate-500
                                        dark:text-slate-400
                                      "
                                    />

                                    Make Member
                                  </button>
                                )}

                                {/* Make Admin */}

                                {member.role !==
                                  "ADMIN" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRoleChange(
                                        member.id,
                                        "ADMIN"
                                      )
                                    }
                                    className="
                                      w-full
                                      text-left
                                      px-3
                                      py-2.5
                                      text-sm
                                      text-foreground
                                      hover:bg-muted
                                      flex
                                      items-center
                                      gap-2.5
                                      transition-colors
                                    "
                                  >
                                    <ShieldAlert
                                      className="
                                        h-4
                                        w-4
                                        text-amber-500
                                      "
                                    />

                                    Make Admin
                                  </button>
                                )}

                                {/* Separator */}

                                <div
                                  className="
                                    h-px
                                    bg-border
                                    my-1
                                  "
                                />

                                {/* Remove */}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setRemovingUser(
                                      member
                                    );
                                    setOpenDropdownId(
                                      null
                                    );
                                  }}
                                  className="
                                    w-full
                                    text-left
                                    px-3
                                    py-2.5
                                    text-sm
                                    text-rose-600
                                    dark:text-rose-400
                                    hover:bg-rose-50
                                    dark:hover:bg-rose-950/30
                                    flex
                                    items-center
                                    gap-2.5
                                    transition-colors
                                  "
                                >
                                  <UserMinus className="h-4 w-4" />

                                  Remove Member
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {/* Empty state */}

        {(!orgMembers ||
          orgMembers.length === 0) && (
          <div
            className="
              min-h-[320px]
              flex
              flex-col
              items-center
              justify-center
              gap-3
              text-center
              px-6
            "
          >
            <div
              className="
                h-12
                w-12
                rounded-2xl
                bg-muted
                flex
                items-center
                justify-center
              "
            >
              <Users
                className="
                  h-5
                  w-5
                  text-muted-foreground
                "
              />
            </div>

            <div>
              <p
                className="
                  font-semibold
                  text-foreground
                "
              >
                No team members found
              </p>

              <p
                className="
                  text-sm
                  text-muted-foreground
                  mt-1
                "
              >
                There are currently no members
                in this organization.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          REMOVE CONFIRMATION MODAL
      ======================================================== */}

      <Dialog
        open={!!removingUser}
        onOpenChange={(open) => {
          if (!open && !isRemoving) {
            setRemovingUser(null);
          }
        }}
      >
        <DialogContent
          className="
            sm:max-w-[430px]
            bg-background
            border-border
          "
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Remove Team Member
            </DialogTitle>

            <DialogDescription className="text-muted-foreground leading-relaxed">
              Are you sure you want to remove{" "}
              <span
                className="
                  font-semibold
                  text-foreground
                "
              >
                {removingUser?.name ||
                  removingUser?.email}
              </span>{" "}
              from the organization? They will
              lose access to all pipeline data.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isRemoving}
              onClick={() =>
                setRemovingUser(null)
              }
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={isRemoving}
              onClick={handleRemove}
            >
              {isRemoving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <UserMinus className="h-4 w-4 mr-2" />
                  Remove Member
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// ROLE BADGE
// ============================================================

function RoleBadge({
  role,
}: {
  role: string;
}) {
  const config =
    role === "ADMIN"
      ? {
          className:
            "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
          icon: Shield,
        }
      : role === "SENIOR"
      ? {
          className:
            "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
          icon: Award,
        }
      : {
          className:
            "bg-muted text-muted-foreground",
          icon: UserX,
        };

  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        px-2.5
        py-1
        rounded-md
        text-xs
        font-semibold
        ${config.className}
      `}
    >
      <Icon className="h-3.5 w-3.5" />
      {role}
    </span>
  );
}