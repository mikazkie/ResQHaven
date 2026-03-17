import { useSidebar } from "./SidebarContext";

export default function Backdrop() {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      onClick={toggleMobileSidebar}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1039,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(2px)",
      }}
      className="d-lg-none"
    />
  );
}
