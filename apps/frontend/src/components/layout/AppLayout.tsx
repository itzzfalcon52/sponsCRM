import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar";
import Topbar from "./TopBar";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
      <div className="app-shell flex h-dvh overflow-hidden bg-background text-foreground">
        <aside className="hidden w-64 shrink-0 lg:block" aria-label="Main navigation">
          <Sidebar />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col bg-background">
          <Topbar />
          <main id="main-content" className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-background text-foreground transition-colors duration-200">
            <Outlet />
          </main>
        </div>
      </div>
      <DialogContent
        className="mobile-navigation left-0 top-0 flex h-dvh max-h-none w-[min(20rem,calc(100vw-3rem))] max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-r border-border bg-sidebar p-0 sm:max-w-none"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Navigation</DialogTitle>
        <DialogDescription className="sr-only">Navigate your workspace.</DialogDescription>
        <Sidebar onNavigate={() => setMenuOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
