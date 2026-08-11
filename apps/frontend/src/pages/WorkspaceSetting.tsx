import { useState } from "react";
import { useAuthStore } from "../stores/authstore";
import { useOrg } from "../hooks/useOrg";
import {
  Building2,
  Trash2,
  LogOut,
  Save,
  AlertTriangle,
  Users,
  ShieldAlert,
  Info,
  ChevronRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function WorkspaceSettings() {
  const { user } = useAuthStore();

  const {
    orgMembers,
    updateOrg,
    leaveOrg,
    deleteOrg,
    isUpdatingOrg,
    isLeavingOrg,
    isDeletingOrg,
  } = useOrg();

  const [orgName, setOrgName] = useState(
    user?.organization?.name || ""
  );

  const [isDeletingModal, setIsDeletingModal] =
    useState(false);

  const [confirmName, setConfirmName] = useState("");

  const role = user?.role;

  const isAdmin = role === "ADMIN";
  const isSenior = role === "SENIOR";

  // ============================================================
  // LAST ADMIN PROTECTION
  // ============================================================

  const otherAdmins =
    orgMembers?.filter(
      (member: any) =>
        member.role === "ADMIN" &&
        member.id !== user?.id
    ) || [];

  // ============================================================
  // UPDATE ORGANIZATION
  // ============================================================

  const handleUpdate = () => {
    if (!orgName.trim()) {
      toast.error("Workspace name cannot be empty");
      return;
    }

    updateOrg({
      name: orgName.trim(),
    });
  };

  // ============================================================
  // LEAVE ORGANIZATION
  // ============================================================

  const handleLeave = () => {
    if (isAdmin && otherAdmins.length === 0) {
      toast.error(
        "You are the last Admin. Please appoint another Admin first."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to leave this workspace?"
    );

    if (!confirmed) return;

    leaveOrg();
  };

  // ============================================================
  // DELETE ORGANIZATION
  // ============================================================

  const handleDelete = () => {
    const currentActualName =
      user?.organization?.name || "";

    const enteredName = confirmName
      .trim()
      .toLowerCase();

    const actualName = currentActualName
      .trim()
      .toLowerCase();

    if (enteredName !== actualName) {
      toast.error(
        `Name does not match. Please type "${currentActualName}" exactly.`
      );
      return;
    }

    const confirmed = window.confirm(
      "This action is irreversible. Are you absolutely sure?"
    );

    if (!confirmed) return;

    deleteOrg();
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="
        max-w-6xl
        mx-auto
        py-8
        sm:py-10
        px-4
        sm:px-6
        space-y-10
        sm:space-y-12
        animate-in
        fade-in
        slide-in-from-bottom-4
        duration-700
      "
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div
        className="
          flex
          flex-col
          md:flex-row
          md:items-center
          justify-between
          gap-5
          border-b
          border-border
          pb-7
          sm:pb-8
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
              <Building2
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
                sm:text-3xl
                font-black
                text-foreground
                tracking-tight
              "
            >
              Workspace Settings
            </h1>
          </div>

          <p
            className="
              text-sm
              text-muted-foreground
              font-medium
              mt-2
            "
          >
            Manage workspace identity, security,
            and membership status.
          </p>
        </div>

        {/* Current Role */}

        <div
          className="
            self-start
            md:self-auto
            flex
            items-center
            gap-2
            px-4
            py-2
            bg-indigo-50
            dark:bg-indigo-500/10
            rounded-2xl
            border
            border-indigo-100
            dark:border-indigo-500/20
          "
        >
          <ShieldCheck
            className="
              h-4
              w-4
              text-indigo-600
              dark:text-indigo-400
            "
          />

          <span
            className="
              text-xs
              font-black
              text-indigo-700
              dark:text-indigo-400
              uppercase
              tracking-widest
            "
          >
            Logged in as {role}
          </span>
        </div>
      </div>

      {/* ========================================================
          MAIN GRID
      ======================================================== */}

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
        {/* ======================================================
            LEFT COLUMN
        ====================================================== */}

        <div className="lg:col-span-1 space-y-6">
          {/* Role permissions */}

          <div
            className="
              p-6
              bg-muted/50
              rounded-3xl
              border
              border-border
            "
          >
            <h3
              className="
                font-bold
                text-foreground
                flex
                items-center
                gap-2
                mb-4
              "
            >
              <Info
                className="
                  h-4
                  w-4
                  text-indigo-500
                "
              />

              Role Permissions
            </h3>

            <ul className="space-y-3">
              {/* Full system access */}

              <li
                className={`
                  text-xs
                  flex
                  items-center
                  gap-2
                  ${
                    isAdmin
                      ? "text-indigo-600 dark:text-indigo-400 font-bold"
                      : "text-muted-foreground"
                  }
                `}
              >
                <ChevronRight className="h-3 w-3 shrink-0" />

                Full System Access
              </li>

              {/* Export */}

              <li
                className={`
                  text-xs
                  flex
                  items-center
                  gap-2
                  ${
                    isAdmin || isSenior
                      ? "text-indigo-600 dark:text-indigo-400 font-bold"
                      : "text-muted-foreground"
                  }
                `}
              >
                <ChevronRight className="h-3 w-3 shrink-0" />

                Export & Advanced Search
              </li>

              {/* CRM */}

              <li
                className="
                  text-xs
                  flex
                  items-center
                  gap-2
                  text-indigo-600
                  dark:text-indigo-400
                  font-bold
                "
              >
                <ChevronRight className="h-3 w-3 shrink-0" />

                Basic CRM Operations
              </li>
            </ul>
          </div>

          {/* Workspace summary */}

          <div
            className="
              p-6
              bg-card
              rounded-3xl
              border
              border-border
              shadow-sm
            "
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="
                  h-9
                  w-9
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
                    h-4
                    w-4
                    text-indigo-600
                    dark:text-indigo-400
                  "
                />
              </div>

              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-foreground
                  "
                >
                  Workspace Members
                </p>

                <p
                  className="
                    text-xs
                    text-muted-foreground
                  "
                >
                  Current organization size
                </p>
              </div>
            </div>

            <div
              className="
                text-3xl
                font-black
                text-foreground
              "
            >
              {orgMembers?.length || 0}
            </div>

            <p
              className="
                text-xs
                text-muted-foreground
                mt-1
              "
            >
              {orgMembers?.length === 1
                ? "member"
                : "members"}{" "}
              in this workspace
            </p>
          </div>
        </div>

        {/* ======================================================
            RIGHT COLUMN
        ====================================================== */}

        <div className="lg:col-span-2 space-y-10">
          {/* ====================================================
              IDENTITY
          ==================================================== */}

          <section className="space-y-4">
            <div className="flex items-center gap-2 ml-1">
              <Building2
                className="
                  h-5
                  w-5
                  text-muted-foreground
                "
              />

              <h2
                className="
                  text-sm
                  font-black
                  uppercase
                  tracking-widest
                  text-muted-foreground
                "
              >
                Identity
              </h2>
            </div>

            <div
              className="
                bg-card
                border
                border-border
                rounded-[2rem]
                p-6
                sm:p-8
                shadow-sm
                transition-all
                hover:shadow-md
              "
            >
              <div className="space-y-2">
                <label
                  className="
                    text-xs
                    font-bold
                    text-muted-foreground
                    ml-1
                  "
                >
                  Organization Display Name
                </label>

                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    gap-3
                  "
                >
                  <input
                    disabled={!isAdmin}
                    value={orgName}
                    onChange={(e) =>
                      setOrgName(e.target.value)
                    }
                    className={`
                      flex-1
                      h-12
                      px-5
                      rounded-2xl
                      border
                      bg-muted/50
                      text-foreground
                      font-bold
                      outline-none
                      transition-all
                      placeholder:text-muted-foreground

                      focus:ring-4
                      focus:ring-indigo-500/10

                      ${
                        !isAdmin
                          ? `
                            cursor-not-allowed
                            opacity-50
                            border-border
                          `
                          : `
                            border-border
                            focus:border-indigo-500
                            hover:border-indigo-300
                            dark:hover:border-indigo-500/50
                          `
                      }
                    `}
                  />

                  {isAdmin && (
                    <Button
                      onClick={handleUpdate}
                      disabled={isUpdatingOrg}
                      className="
                        h-12
                        px-8
                        bg-indigo-600
                        hover:bg-indigo-700
                        text-white
                        rounded-2xl
                        font-black
                        shadow-lg
                        shadow-indigo-500/20
                        transition-all
                        active:scale-95
                      "
                    >
                      {isUpdatingOrg ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {!isAdmin && (
                  <p
                    className="
                      text-[10px]
                      text-amber-600
                      dark:text-amber-400
                      font-bold
                      mt-2
                      flex
                      items-center
                      gap-1
                    "
                  >
                    <ShieldAlert className="h-3 w-3" />

                    You need Admin privileges
                    to rename this workspace.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ====================================================
              MEMBERSHIP
          ==================================================== */}

          <section className="space-y-4">
            <div className="flex items-center gap-2 ml-1">
              <LogOut
                className="
                  h-5
                  w-5
                  text-muted-foreground
                "
              />

              <h2
                className="
                  text-sm
                  font-black
                  uppercase
                  tracking-widest
                  text-muted-foreground
                "
              >
                Membership
              </h2>
            </div>

            <div
              className="
                bg-card
                border
                border-border
                rounded-[2rem]
                p-6
                sm:p-8
                shadow-sm
                flex
                flex-col
                md:flex-row
                md:items-center
                justify-between
                gap-6
              "
            >
              <div className="space-y-1">
                <h3
                  className="
                    font-bold
                    text-foreground
                  "
                >
                  Leave Workspace
                </h3>

                <p
                  className="
                    text-sm
                    text-muted-foreground
                    font-medium
                  "
                >
                  Exit this organization and
                  clear your workspace session.
                </p>
              </div>

              <Button
                variant="outline"
                disabled={isLeavingOrg}
                onClick={handleLeave}
                className="
                  h-12
                  px-8
                  border-border
                  text-muted-foreground
                  font-black
                  rounded-2xl
                  hover:bg-rose-50
                  hover:text-rose-600
                  hover:border-rose-200
                  dark:hover:bg-rose-950/30
                  dark:hover:text-rose-400
                  dark:hover:border-rose-900
                  transition-all
                  active:scale-95
                "
              >
                {isLeavingOrg ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Leaving...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Leave
                  </>
                )}
              </Button>
            </div>
          </section>

          {/* ====================================================
              DANGER ZONE
          ==================================================== */}

          {isAdmin && (
            <section className="space-y-4 pt-4">
              <div
                className="
                  flex
                  items-center
                  gap-2
                  ml-1
                  text-rose-500
                  dark:text-rose-400
                "
              >
                <AlertTriangle className="h-5 w-5" />

                <h2
                  className="
                    text-sm
                    font-black
                    uppercase
                    tracking-widest
                  "
                >
                  Danger Zone
                </h2>
              </div>

              <div
                className="
                  bg-rose-50/60
                  dark:bg-rose-950/15
                  border-2
                  border-dashed
                  border-rose-200
                  dark:border-rose-900/60
                  rounded-[2rem]
                  p-6
                  sm:p-8
                  space-y-6
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    justify-between
                    gap-6
                  "
                >
                  <div className="space-y-1">
                    <h3
                      className="
                        font-bold
                        text-rose-900
                        dark:text-rose-300
                      "
                    >
                      Delete this organization
                    </h3>

                    <p
                      className="
                        text-xs
                        text-rose-700/70
                        dark:text-rose-300/70
                        font-medium
                        max-w-sm
                        leading-relaxed
                      "
                    >
                      Once deleted, your pipeline
                      data, activities, and member
                      lists are gone forever. This
                      cannot be undone.
                    </p>
                  </div>

                  {!isDeletingModal ? (
                    <Button
                      onClick={() =>
                        setIsDeletingModal(true)
                      }
                      className="
                        h-12
                        px-8
                        bg-rose-600
                        hover:bg-rose-700
                        text-white
                        font-black
                        rounded-2xl
                        shadow-xl
                        shadow-rose-500/20
                        transition-all
                        active:scale-95
                      "
                    >
                      <Trash2 className="h-4 w-4 mr-2" />

                      Delete Workspace
                    </Button>
                  ) : (
                    <div
                      className="
                        space-y-3
                        w-full
                        md:w-auto
                      "
                    >
                      <input
                        placeholder={`Type "${user?.organization?.name}"`}
                        value={confirmName}
                        onChange={(e) =>
                          setConfirmName(
                            e.target.value
                          )
                        }
                        className="
                          h-12
                          w-full
                          md:w-72
                          px-4
                          rounded-xl
                          border-2
                          border-rose-200
                          dark:border-rose-900
                          bg-background
                          text-foreground
                          text-sm
                          font-bold
                          outline-none
                          focus:ring-4
                          focus:ring-rose-500/10
                        "
                      />

                      <div className="flex gap-2">
                        <Button
                          onClick={handleDelete}
                          disabled={isDeletingOrg}
                          className="
                            flex-1
                            bg-rose-600
                            text-white
                            font-bold
                            rounded-xl
                            h-10
                            hover:bg-rose-700
                            shadow-lg
                            shadow-rose-500/20
                          "
                        >
                          {isDeletingOrg ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-3 w-3 mr-2" />
                              Confirm
                            </>
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          disabled={isDeletingOrg}
                          onClick={() => {
                            setIsDeletingModal(
                              false
                            );
                            setConfirmName("");
                          }}
                          className="
                            px-4
                            text-muted-foreground
                            font-bold
                            hover:bg-rose-100
                            dark:hover:bg-rose-950/40
                          "
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}