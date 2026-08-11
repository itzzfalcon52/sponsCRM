import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import "./app.css";

import { api } from "./api/axios";
import { useAuthStore } from "./stores/authstore";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FeaturesPage from "./pages/Features";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";

// Authenticated pages
import Org from "./pages/Org";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import Team from "./pages/Team";
import Activities from "./pages/Activities";
import Pipeline from "./pages/Pipeline";
import WorkspaceSettings from "./pages/WorkspaceSetting";

// Layouts / guards
import NavBar from "./components/NavBar";
import Footer from "./components/landing/Footer";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import OrgRequiredRoute from "./components/OrgRequiredRoute";

// ============================================================
// PUBLIC WEBSITE LAYOUT
// ============================================================

const MainLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
};

// ============================================================
// INITIAL SESSION LOADING SCREEN
// ============================================================

function SessionLoader() {
  return (
    <div
      className="
        flex
        min-h-screen
        w-full
        items-center
        justify-center
        bg-background
        text-foreground
        transition-colors
        duration-200
      "
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div
          className="
            h-12
            w-12
            animate-spin
            rounded-full
            border-4
            border-muted
            border-t-indigo-600
            dark:border-muted
            dark:border-t-indigo-400
          "
        />

        {/* Loading text */}
        <p
          className="
            text-sm
            font-semibold
            text-muted-foreground
            animate-pulse
          "
        >
          Syncing Session...
        </p>
      </div>
    </div>
  );
}

// ============================================================
// APP
// ============================================================

const App = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const isLoading = useAuthStore((state) => state.isLoading);

  // ==========================================================
  // INITIAL AUTHENTICATION CHECK
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        setLoading(true);

        const res = await api.get("/auth/me");

        if (!mounted) return;

        setUser(res.data.data.user);
      } catch (error) {
        if (!mounted) return;

        // No valid session
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [setUser, setLoading]);

  // ==========================================================
  // WAIT FOR AUTH STATE TO INITIALIZE
  // ==========================================================

  if (isLoading) {
    return <SessionLoader />;
  }

  // ==========================================================
  // ROUTES
  // ==========================================================

  return (
    <Routes>
      {/* ======================================================
          PUBLIC ROUTES
      ====================================================== */}

      <Route
        path="/"
        element={
          <MainLayout>
            <Landing />
          </MainLayout>
        }
      />

      <Route
        path="/login"
        element={
          <MainLayout>
            <Login />
          </MainLayout>
        }
      />

      <Route
        path="/register"
        element={
          <MainLayout>
            <Register />
          </MainLayout>
        }
      />

      <Route
        path="/features"
        element={
          <MainLayout>
            <FeaturesPage />
          </MainLayout>
        }
      />

      <Route
        path="/pricing"
        element={
          <MainLayout>
            <PricingPage />
          </MainLayout>
        }
      />

      <Route
        path="/about"
        element={
          <MainLayout>
            <AboutPage />
          </MainLayout>
        }
      />

      {/* ======================================================
          AUTHENTICATED BUT ORGANIZATION-INDEPENDENT ROUTES
      ====================================================== */}

      <Route
        path="/organization"
        element={
          <MainLayout>
            <ProtectedRoute>
              <Org />
            </ProtectedRoute>
          </MainLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <MainLayout>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </MainLayout>
        }
      />

      {/* ======================================================
          APPLICATION ROUTES

          ProtectedRoute
              ↓
          OrgRequiredRoute
              ↓
          AppLayout
              ↓
          Application pages
      ====================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<OrgRequiredRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/settings"
              element={<WorkspaceSettings />}
            />

            <Route
              path="/companies/*"
              element={<Companies />}
            />

            <Route
              path="/team/*"
              element={<Team />}
            />

            <Route
              path="/activities/*"
              element={<Activities />}
            />

            <Route
              path="/pipeline/*"
              element={<Pipeline />}
            />
          </Route>
        </Route>
      </Route>

      {/* ======================================================
          FALLBACK
      ====================================================== */}

      <Route
        path="*"
        element={
          <MainLayout>
            <Landing />
          </MainLayout>
        }
      />
    </Routes>
  );
};

export default App;