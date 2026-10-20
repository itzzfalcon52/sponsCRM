import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/api/authApi";
import { useAuthStore } from "@/stores/authstore";
import { loadGoogleIdentity } from "@/lib/googleIdentity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = { disabled?: boolean; onBusyChange: (busy: boolean) => void };
type LinkRequest = { credential: string; email: string };

export default function GoogleSignIn({ disabled = false, onBusyChange }: Props) {
  const clientId = import.meta.env.VITE_GOOGLE_SIGN_IN_CLIENT_ID?.trim();
  const container = useRef<HTMLDivElement>(null);
  const blocked = useRef(false);
  const mounted = useRef(false);
  const submitRef = useRef<(credential: string) => void>(() => {});
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState(false);
  const [link, setLink] = useState<LinkRequest | null>(null);
  const [password, setPassword] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    onBusyChange(pending || Boolean(link));
    return () => onBusyChange(false);
  }, [pending, link, onBusyChange]);

  async function signIn(credential: string, currentPassword?: string) {
    if (blocked.current || disabled) return;
    blocked.current = true;
    setPending(true);
    setError("");
    try {
      const response = await authApi.googleSignIn({ credential, ...(currentPassword ? { currentPassword } : {}) });
      // Prevent an earlier /me request from overwriting the newly signed-in session.
      await queryClient.cancelQueries({ queryKey: ["authUser"] });
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "authUser" });
      queryClient.setQueryData(["authUser"], response);
      setUser(response.data.user);
      if (!mounted.current) return;
      setLink(null);
      setPassword("");
      toast.success("Signed in with Google");
      navigate("/organization");
    } catch (cause) {
      if (!mounted.current) return;
      const detail = isAxiosError(cause) ? cause.response?.data : undefined;
      if (detail?.code === "GOOGLE_LINK_REQUIRED") {
        setLink({ credential, email: detail.email });
      } else {
        setError(detail?.message || "Google sign-in failed. Please try again.");
        if (detail?.code !== "GOOGLE_LINK_PASSWORD_INVALID" && isAxiosError(cause) && cause.response) {
          setLink(null);
          setPassword("");
        }
      }
    } finally {
      blocked.current = false;
      if (mounted.current) setPending(false);
    }
  }

  useEffect(() => {
    submitRef.current = (credential) => {
      if (!disabled && !link) void signIn(credential);
    };
  });

  useEffect(() => {
    if (!clientId) return;
    let active = true;
    loadGoogleIdentity().then((identity) => {
      if (!active || !container.current) return;
      identity.initialize({
        client_id: clientId, ux_mode: "popup", auto_select: false,
        callback: ({ credential }) => {
          if (active && credential) submitRef.current(credential);
        },
      });
      identity.renderButton(container.current, {
        type: "standard", theme: "outline", size: "large", text: "continue_with",
        width: Math.min(400, Math.floor(container.current.getBoundingClientRect().width)),
      });
      setReady(true);
    }).catch((cause: Error) => {
      if (active) setLoadError(cause.message);
    });
    return () => { active = false; };
  }, [clientId, attempt]);

  // Password authentication remains available when Google has not been configured.
  if (!clientId) return null;

  return (
    <div className="space-y-4">
      <div className="min-h-11" hidden={Boolean(link) || pending} inert={disabled}>
        <div ref={container} className="mx-auto w-full max-w-[400px]" />
        {!ready && !loadError && <p role="status" className="text-center text-sm text-muted-foreground">Loading Google sign-in…</p>}
      </div>
      {loadError && <div className="space-y-2 text-center">
        <p role="alert" className="text-sm text-destructive">{loadError}</p>
        <Button type="button" variant="outline" disabled={disabled} onClick={() => {
          setLoadError(""); setAttempt((value) => value + 1);
        }}>Retry Google sign-in</Button>
      </div>}
      {pending && <p role="status" className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
      </p>}
      {link && <form className="space-y-3 rounded-lg border p-4" onSubmit={(event) => {
        event.preventDefault();
        void signIn(link.credential, password);
      }}>
        <p className="break-words text-sm">An account already exists for <strong>{link.email}</strong>. Enter your existing CRM password once to connect Google and keep all your data.</p>
        <Label htmlFor="google-link-password">Existing CRM password</Label>
        <Input id="google-link-password" type="password" autoComplete="current-password"
          required minLength={6} value={password} disabled={pending}
          onChange={(event) => setPassword(event.target.value)} />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending || disabled}>Connect and sign in</Button>
          <Button type="button" variant="outline" disabled={pending} onClick={() => {
            setLink(null); setPassword(""); setError("");
          }}>Cancel</Button>
        </div>
      </form>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /><span>or use email and password</span><div className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
