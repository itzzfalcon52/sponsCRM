import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  User as UserIcon,
  Mail,
  Shield,
  Camera,
  BadgeCheck,
  Calendar,
  Save,
  Loader2,
  Lock,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Profile() {
  const {
    user,
    updateProfile,
    changePassword,
    deleteAccount,
    isUpdatingProfile,
    isChangingPassword,
    isDeletingAccount,
  } = useAuth();

  // ============================================================
  // PROFILE STATE
  // ============================================================

  const [name, setName] = useState(user?.name || "");

  // ============================================================
  // PASSWORD STATE
  // ============================================================

  const [showPassFields, setShowPassFields] = useState(false);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
  });

  // ============================================================
  // DELETE ACCOUNT STATE
  // ============================================================

  const [deleteConfirm, setDeleteConfirm] = useState("");

  // ============================================================
  // UPDATE PROFILE
  // ============================================================

  const handleUpdateProfile = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    await updateProfile({
      name: name.trim(),
    });
  };

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  const handleChangePassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (passwords.new.length < 6) {
      toast.error(
        "New password must be at least 6 characters"
      );
      return;
    }

    if (!passwords.current) {
      toast.error("Please enter your current password");
      return;
    }

    await changePassword({
      currentPassword: passwords.current,
      newPassword: passwords.new,
    });

    // Reset state after successful mutation
    setPasswords({
      current: "",
      new: "",
    });

    setShowPassFields(false);
  };

  // ============================================================
  // DELETE ACCOUNT
  // ============================================================

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      return;
    }

    await deleteAccount();
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="
        max-w-5xl
        mx-auto
        py-12
        px-6
        space-y-10
        animate-in
        fade-in
        slide-in-from-bottom-4
        duration-700
      "
    >
      {/* ========================================================
          PROFILE HEADER
      ======================================================== */}

      <div
        className="
          flex
          flex-col
          md:flex-row
          md:items-end
          justify-between
          gap-6
          border-b
          border-border
          pb-10
        "
      >
        {/* Identity */}

        <div className="flex items-center gap-6">
          {/* Avatar */}

          <div className="relative group">
            <div
              className="
                h-24
                w-24
                rounded-3xl
                bg-gradient-to-br
                from-indigo-500
                to-purple-600
                flex
                items-center
                justify-center
                text-white
                text-3xl
                font-black
                shadow-xl
                shadow-indigo-500/20
                ring-4
                ring-background
                transition-transform
                group-hover:scale-105
              "
            >
              {user?.name?.charAt(0).toUpperCase() ||
                user?.email?.charAt(0).toUpperCase()}
            </div>

            {/* Avatar button */}

            <button
              type="button"
              aria-label="Change profile picture"
              className="
                absolute
                -bottom-2
                -right-2
                p-2
                bg-card
                rounded-xl
                border
                border-border
                shadow-sm
                text-muted-foreground
                hover:text-indigo-600
                dark:hover:text-indigo-400
                hover:border-indigo-300
                dark:hover:border-indigo-500/50
                transition-all
                hover:scale-110
              "
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          {/* User information */}

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1
                className="
                  text-3xl
                  font-black
                  text-foreground
                  tracking-tight
                "
              >
                {user?.name || "User Profile"}
              </h1>

              <BadgeCheck
                className="
                  h-5
                  w-5
                  text-indigo-500
                  dark:text-indigo-400
                  fill-indigo-50
                  dark:fill-indigo-500/10
                "
              />
            </div>

            <p
              className="
                text-muted-foreground
                font-medium
                flex
                items-center
                gap-2
                text-sm
              "
            >
              <Mail className="h-4 w-4" />

              {user?.email}
            </p>
          </div>
        </div>

        {/* Member since */}

        <div
          className="
            px-4
            py-2
            bg-muted
            rounded-xl
            border
            border-border
            flex
            items-center
            gap-2
          "
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />

          <span
            className="
              text-xs
              font-bold
              text-muted-foreground
              uppercase
              tracking-wider
            "
          >
            Member since 2026
          </span>
        </div>
      </div>

      {/* ========================================================
          MAIN CONTENT
      ======================================================== */}

      <div className="grid lg:grid-cols-3 gap-10">
        {/* ======================================================
            LEFT SIDEBAR
        ====================================================== */}

        <div className="lg:col-span-1 space-y-6">
          {/* ====================================================
              PASSWORD SECURITY
          ==================================================== */}

          <div
            className={`
              rounded-[2rem]
              p-8
              transition-all
              duration-500

              ${
                showPassFields
                  ? `
                    bg-slate-950
                    dark:bg-slate-950
                    text-white
                    shadow-2xl
                    shadow-black/20
                    scale-[1.02]
                  `
                  : `
                    bg-indigo-600
                    dark:bg-indigo-600
                    text-white
                    shadow-xl
                    shadow-indigo-500/20
                  `
              }
            `}
          >
            <div className="flex items-center justify-between mb-4">
              <Shield className="h-8 w-8 opacity-80" />

              {showPassFields && (
                <Lock
                  className="
                    h-5
                    w-5
                    text-indigo-400
                    animate-pulse
                  "
                />
              )}
            </div>

            <h3 className="text-xl font-bold mb-2 tracking-tight">
              Account Security
            </h3>

            <p
              className={`
                text-sm
                leading-relaxed
                mb-6

                ${
                  showPassFields
                    ? "text-slate-400 font-medium"
                    : "text-indigo-100"
                }
              `}
            >
              {showPassFields
                ? "Enter your current and new password to update your credentials."
                : "Manage your credentials and keep your account protected."}
            </p>

            {!showPassFields ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowPassFields(true)}
                className="
                  w-full
                  font-bold
                  rounded-xl
                  text-indigo-600
                  hover:bg-white
                  dark:hover:bg-slate-100
                  transition-all
                  active:scale-95
                "
              >
                Change Password
              </Button>
            ) : (
              <form
                onSubmit={handleChangePassword}
                className="
                  space-y-4
                  animate-in
                  zoom-in-95
                  duration-300
                "
              >
                {/* Current password */}

                <div className="space-y-1">
                  <Label
                    className="
                      text-[10px]
                      uppercase
                      font-black
                      tracking-widest
                      text-slate-500
                      ml-1
                    "
                  >
                    Current Password
                  </Label>

                  <Input
                    type="password"
                    required
                    autoComplete="current-password"
                    className="
                      bg-slate-800
                      border-slate-700
                      text-white
                      placeholder:text-slate-500
                      rounded-xl
                      h-10
                      focus-visible:ring-indigo-500/30
                      focus-visible:border-indigo-500
                    "
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        current: e.target.value,
                      })
                    }
                  />
                </div>

                {/* New password */}

                <div className="space-y-1">
                  <Label
                    className="
                      text-[10px]
                      uppercase
                      font-black
                      tracking-widest
                      text-slate-500
                      ml-1
                    "
                  >
                    New Password
                  </Label>

                  <Input
                    type="password"
                    required
                    autoComplete="new-password"
                    minLength={6}
                    className="
                      bg-slate-800
                      border-slate-700
                      text-white
                      placeholder:text-slate-500
                      rounded-xl
                      h-10
                      focus-visible:ring-indigo-500/30
                      focus-visible:border-indigo-500
                    "
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        new: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Actions */}

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    className="
                      w-full
                      bg-white
                      text-slate-900
                      hover:bg-slate-100
                      font-black
                      rounded-xl
                      h-11
                    "
                  >
                    {isChangingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Verify & Update"
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPassFields(false);
                      setPasswords({
                        current: "",
                        new: "",
                      });
                    }}
                    className="
                      text-xs
                      font-bold
                      text-slate-500
                      hover:text-slate-300
                      transition-colors
                      py-1
                    "
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ====================================================
              ACCOUNT STATUS
          ==================================================== */}

          <div
            className="
              bg-card
              border
              border-border
              rounded-[2rem]
              p-6
              shadow-sm
            "
          >
            <h4
              className="
                text-xs
                font-black
                uppercase
                text-muted-foreground
                tracking-widest
                mb-4
              "
            >
              Account Status
            </h4>

            <div
              className="
                flex
                items-center
                gap-3
                p-3
                bg-muted/60
                rounded-2xl
                border
                border-border
              "
            >
              <div
                className="
                  h-10
                  w-10
                  rounded-xl
                  bg-card
                  border
                  border-border
                  flex
                  items-center
                  justify-center
                  shadow-sm
                "
              >
                <UserIcon
                  className="
                    h-5
                    w-5
                    text-indigo-500
                    dark:text-indigo-400
                  "
                />
              </div>

              <div>
                <p
                  className="
                    text-sm
                    font-black
                    text-foreground
                    uppercase
                    tracking-tight
                    leading-none
                    mb-1
                  "
                >
                  {user?.role || "Member"}
                </p>

                <p
                  className="
                    text-[9px]
                    text-muted-foreground
                    font-bold
                    uppercase
                    tracking-widest
                  "
                >
                  Global Permissions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            RIGHT CONTENT
        ====================================================== */}

        <div className="lg:col-span-2 space-y-8">
          {/* ====================================================
              PERSONAL DETAILS
          ==================================================== */}

          <form
            onSubmit={handleUpdateProfile}
            className="
              bg-card
              border
              border-border
              rounded-[2rem]
              p-8
              shadow-sm
              space-y-8
            "
          >
            <div className="space-y-6">
              <h2
                className="
                  text-lg
                  font-bold
                  text-foreground
                  flex
                  items-center
                  gap-2
                "
              >
                <UserIcon
                  className="
                    h-5
                    w-5
                    text-muted-foreground
                  "
                />

                Personal Details
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}

                <div className="space-y-2">
                  <label
                    className="
                      text-[10px]
                      font-black
                      text-muted-foreground
                      uppercase
                      tracking-widest
                      ml-1
                    "
                  >
                    Full Name
                  </label>

                  <Input
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    className="
                      h-12
                      bg-muted/50
                      border-border
                      rounded-xl
                      focus-visible:ring-4
                      focus-visible:ring-indigo-500/10
                      font-bold
                      text-foreground
                      transition-all
                      focus-visible:border-indigo-500
                    "
                  />
                </div>

                {/* Email */}

                <div className="space-y-2">
                  <label
                    className="
                      text-[10px]
                      font-black
                      text-muted-foreground
                      uppercase
                      tracking-widest
                      ml-1
                    "
                  >
                    Email Address
                  </label>

                  <Input
                    disabled
                    value={user?.email || ""}
                    className="
                      h-12
                      bg-muted
                      border-border
                      rounded-xl
                      font-bold
                      text-muted-foreground
                      cursor-not-allowed
                    "
                  />
                </div>
              </div>
            </div>

            {/* Save section */}

            <div
              className="
                pt-6
                border-t
                border-border
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-4
              "
            >
              <p
                className="
                  text-xs
                  text-muted-foreground
                  font-medium
                  max-w-[250px]
                  leading-relaxed
                "
              >
                Your public name is visible to all
                members within your organization.
              </p>

              <Button
                type="submit"
                disabled={isUpdatingProfile}
                className="
                  h-12
                  px-8
                  bg-indigo-600
                  hover:bg-indigo-700
                  dark:bg-indigo-500
                  dark:hover:bg-indigo-600
                  text-white
                  font-black
                  rounded-2xl
                  shadow-lg
                  shadow-indigo-500/20
                  transition-all
                  active:scale-95
                "
              >
                {isUpdatingProfile ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}

                Save Changes
              </Button>
            </div>
          </form>

          {/* ====================================================
              DANGER ZONE
          ==================================================== */}

          <div
            className="
              bg-rose-50/50
              dark:bg-rose-950/20
              border-2
              border-dashed
              border-rose-200
              dark:border-rose-900/60
              rounded-[2rem]
              p-8
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
              {/* Warning */}

              <div className="space-y-1">
                <h3
                  className="
                    font-bold
                    text-rose-900
                    dark:text-rose-400
                    flex
                    items-center
                    gap-2
                    uppercase
                    tracking-tight
                  "
                >
                  <AlertCircle className="h-4 w-4" />

                  Danger Zone
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
                  Deleting your account is permanent.
                  This will scrub all your associated
                  pipeline history and activities.
                </p>
              </div>

              {/* Delete controls */}

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  w-full
                  md:w-auto
                "
              >
                <div className="space-y-1 text-center md:text-left">
                  <p
                    className="
                      text-[9px]
                      font-black
                      text-rose-600
                      dark:text-rose-400
                      uppercase
                      tracking-widest
                      ml-1
                    "
                  >
                    Type "DELETE" to confirm
                  </p>

                  <Input
                    placeholder="DELETE"
                    value={deleteConfirm}
                    onChange={(e) =>
                      setDeleteConfirm(e.target.value)
                    }
                    className="
                      h-10
                      bg-background
                      border-rose-200
                      dark:border-rose-900
                      text-rose-900
                      dark:text-rose-300
                      font-black
                      text-center
                      placeholder:text-rose-200
                      dark:placeholder:text-rose-900
                      rounded-xl
                      focus-visible:ring-4
                      focus-visible:ring-rose-500/10
                      focus-visible:border-rose-300
                    "
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={
                    deleteConfirm !== "DELETE" ||
                    isDeletingAccount
                  }
                  className={`
                    h-12
                    px-8
                    font-black
                    rounded-2xl
                    transition-all
                    active:scale-95

                    ${
                      deleteConfirm === "DELETE"
                        ? `
                          bg-rose-600
                          text-white
                          hover:bg-rose-700
                          shadow-xl
                          shadow-rose-500/20
                        `
                        : `
                          bg-rose-100
                          dark:bg-rose-950/40
                          text-rose-300
                          dark:text-rose-800
                          cursor-not-allowed
                          shadow-none
                        `
                    }
                  `}
                >
                  {isDeletingAccount ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Terminate Account
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}