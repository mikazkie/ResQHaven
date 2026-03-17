import { createContext, useContext, useState } from "react";

const SidebarContext = createContext(undefined);

export function SidebarProvider({ children }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleSidebar = () => setIsExpanded((prev) => !prev);
  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{
        isExpanded,
        isMobileOpen,
        isHovered,
        setIsHovered,
        toggleSidebar,
        toggleMobileSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}
