import { create } from "zustand";

/**
 * This file contains a small global "Auth Store" using Zustand.
 *
 * Purpose:
 * - Keep the current authenticated user in a single place (global state).
 * - Expose helper actions to set the user after login/register/me calls.
 * - Provide a single boolean (`isAuthenticated`) for easy UI gating.
 *
 * What this store does NOT do:
 * - It does not call the backend directly.
 * - It does not store/refresh JWT tokens.
 * - It does not persist state across reloads (unless you add zustand/middleware).
 *
 * Typical stack flow (Backend → React Query → Zustand → UI):
 *
 * 1) UI triggers an auth action:
 *    - Login page submits credentials
 *    - Register page submits data
 *    - App shell loads and calls "GET /me" to check session
 *
 * 2) React Query performs the request:
 *    - `useMutation` for POST /login, POST /register
 *    - `useQuery` for GET /me (session restore on refresh)
 *
 * 3) On success, React Query callback updates Zustand:
 *    - `useAuthStore.getState().setUser(response.user)`
 *    This centralizes "who is logged in" so the whole app updates instantly.
 *
 * 4) UI reads Zustand and renders accordingly:
 *    - Navbar shows user name/email if `user != null`
 *    - Routes guard pages using `isAuthenticated`
 *    - Pages can show org/role-based UI using `user.role` and `user.organization`
 *
 * 5) On logout:
 *    - UI calls backend logout endpoint (optional, depends on auth strategy)
 *    - Clear React Query cache (optional but recommended)
 *    - Call `logout()` to clear Zustand (UI immediately updates)
 */

/**
 * `User` describes the shape of the authenticated user we want in the frontend.
 *
 * Notes:
 * - This is a FRONTEND type; it should match what your backend returns from
 *   endpoints like `/auth/login` or `/auth/me`.
 * - Keep it minimal: only include fields needed by the UI.
 * - `organization` here is optional and can be null, because:
 *   - a user might not have joined/created an organization yet
 *   - or the backend may omit organization data for some endpoints
 */
export type User = {
  id: string;
  email: string;
  name?: string;

  /**
   * Using a string-literal union gives you autocomplete + compile-time safety.

   */
  role: "ADMIN" | "MEMBER" | "SENIOR";

  /**
   * Basic org info for UI display and routing decisions.
   * Example UI usage:
   * - show org name in header
   * - if organization is null, redirect user to "Create/Join Org" screen
   */
  organization?:
    | {
        id: string;
        name: string;
        inviteCode?: string;
        googleAccessToken?: string | null;
        lastSyncedAt?: string | null;
      }
    | null;
};

/**
 * `AuthState` is the shape of the Zustand store.
 *
 * - `user`: the authenticated user object, or null if logged out.
 * - `isAuthenticated`: a derived boolean used for route guarding / UI gating.
 * - `setUser`: an action used after successful auth calls (login/register/me).
 * - `logout`: clears user session in the client state.
 */
type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; 
  setLoading: (loading: boolean) => void; 
  
  setUser: (user: User | null) => void;
  logout: () => void;
};

/**
 * `useAuthStore` is the Zustand hook.
 *
 * How it works:
 * - `create<AuthState>((set) => ({ ... }))` creates a store with initial state
 *   and actions that can update state via `set(...)`.
 *
 * How UI uses it:
 * - Read state:
 *     const user = useAuthStore(s => s.user)
 *     const isAuthenticated = useAuthStore(s => s.isAuthenticated)
 * - Call an action:
 *     const setUser = useAuthStore(s => s.setUser)
 *     setUser(userFromBackend)
 */
export const useAuthStore = create<AuthState>((set) => ({
  /**
   * Initial state: no user session loaded yet.
   * In many apps, you then run a React Query `useQuery(['me'], fetchMe)`
   * which, if valid, will call `setUser(me.user)` to populate this.
   */
  user: null,
  isAuthenticated: false,
  isLoading: true,

  /**
   * setUser:
   * - Stores the user object (or null).
   * - Sets `isAuthenticated` based on whether a user exists.
   *
   * Why compute isAuthenticated here?
   * - Keeps UI logic simple: no need to write `!!user` everywhere.
   */
  setUser: (user: User | null) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setLoading: (loading: boolean) =>
    set({
      isLoading: loading,
    }),
  

  /**
   * logout:
   * - Clears the user from the store.
   * - Marks the session as unauthenticated.
   *
   * Typical full logout flow in an app:
   * 1) Call backend logout endpoint (if using httpOnly cookie sessions):
   *      await api.post('/auth/logout')
   * 2) Clear React Query caches:
   *      queryClient.clear() or removeQueries(['me'])
   * 3) Clear Zustand:
   *      useAuthStore.getState().logout()
   * 4) Redirect to /login
   */
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));