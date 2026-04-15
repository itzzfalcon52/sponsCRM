// src/components/layout/AppLayout.tsx
import Sidebar from "./SideBar";
import Topbar from "./TopBar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="flex h-screen">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Right Side */}
      <div className="flex flex-col flex-1">
        
        {/* Topbar */}
        <Topbar />

        {/* Main Content */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}