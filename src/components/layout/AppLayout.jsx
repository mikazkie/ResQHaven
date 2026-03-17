import { Outlet } from "react-router";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";

function LayoutContent() {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const sidebarWidth = isExpanded || isHovered ? 260 : 72;
  
  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>

      {/* Sidebar */}
      <AppSidebar />
      <Backdrop />

      {/* Main Area */}
      <div
        style={{
          marginLeft: isMobileOpen ? 0 : sidebarWidth,
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
        className="main-area"
      >
        {/* Header */}
        <AppHeader />

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            padding: "24px",
            maxWidth: 1400,
            width: "100%",
            margin: "0 auto",
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Responsive margin fix */}
      <style>{`
        @media (max-width: 991px) {
          .main-area {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function AppLayout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}
