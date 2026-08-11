// src/components/layout/AppLayout.tsx

import Sidebar from "./SideBar";
import Topbar from "./TopBar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* ============================================================
          SIDEBAR
      ============================================================ */}
      <Sidebar />

      {/* ============================================================
          RIGHT SIDE
      ============================================================ */}
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        {/* Topbar */}
        <Topbar />

        {/* ============================================================
            MAIN CONTENT
        ============================================================ */}
        <main
          className="
            min-h-0
            flex-1
            overflow-y-auto
            bg-background
            text-foreground
            transition-colors
            duration-200
          "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}