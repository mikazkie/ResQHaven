import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "../../authentication/AuthContext";
import ResQHaven from "../../assets/images/RESQHAVEN.png";

const ADMIN_ROLES = ["barangay_official", "dswd", "drrmo", "super_admin"];
const BARANGAY_OFFICIAL_ROLES = ["barangay_official", "super_admin"];
const DSWD_ROLES = ["dswd", "super_admin"];
const DRRMO_ROLES = ["drrmo", "super_admin"];
const TRACK_ROLES = ["barangay_official", "drrmo", "super_admin"];
const EVAC_VIEW_ROLES = ["barangay_official", "dswd", "drrmo", "super_admin"];

const navItems = [
  {
    icon: <i className="bi bi-house"></i>,
    name: "Dashboard",
    path: "/dashboard",
    roles: ADMIN_ROLES
  },
  {
    icon: <i className="bi bi-pie-chart"></i>,
    name: "Analytics",
    subItems: [
      {
        name: "Reports",
        path: "/report",
        roles: ADMIN_ROLES
      }
    ]
  },
  {
    name: "Forms",
    icon: <i className="bi bi-clipboard-check"></i>,
    subItems: [
      {
        name: "Check In",
        path: "/check-reg",
        roles: BARANGAY_OFFICIAL_ROLES
      },
      {
        name: "Family Check In",
        path: "/familyCheckin",
        roles: BARANGAY_OFFICIAL_ROLES
      },
      {
        name: "Evacuation Center",
        path: "/evacuation-reg",
        roles: DRRMO_ROLES
      },
      {
        name: "Hazard",
        path: "/hazard-reg",
        roles: DRRMO_ROLES
      },
      {
        name: "Admin",
        path: "/admin-reg",
        roles: DRRMO_ROLES
      },
      {
        name: "Hotline",
        path: "/hotline-reg",
        roles: DRRMO_ROLES
      }
    ]
  },
  {
    name: "Tables",
    icon: <i className="bi bi-table"></i>,
    subItems: [
      {
        name: "Evacuation Center",
        path: "/evacuation",
        roles: EVAC_VIEW_ROLES
      },
      {
        name: "Inventory",
        path: "/inventory",
        roles: DSWD_ROLES
      },
      {
        name: "Employees",
        path: "/employees",
        roles: DRRMO_ROLES
      },
      {
        name: "Distribution Requests",
        path: "/distribution-requests",
        roles: DSWD_ROLES
      }
    ]
  }
];

const otherItems = [
  {
    icon: <i className="bi bi-controller"></i>,
    name: "Simulations",
    subItems: [
      {
        name: "Simulate",
        path: "/simulate",
        roles: DRRMO_ROLES
      }
    ]
  },
  {
    icon: <i className="bi bi-geo"></i>,
    name: "Track",
    path: "/track",
    roles: TRACK_ROLES
  }
];

export default function AppSidebar() {
  const { user, loading } = useAuth();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const subMenuRefs = useRef({});
  const [subMenuHeight, setSubMenuHeight] = useState({});

  const isExpandedView = isExpanded || isHovered || isMobileOpen;
  const isActive = (path) => location.pathname === path;

  const canSee = (roles) => {
    if (!roles || roles.length === 0) {
      return true;
    }

    if (!user) {
      return false;
    }

    return roles.includes(user.role);
  };

  useEffect(() => {
    if (loading) {
      return;
    }

    let matched = false;

    ["main", "other"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : otherItems;

      items.forEach((item, index) => {
        if (!item.subItems) {
          return;
        }

        item.subItems.forEach((subItem) => {
          if (isActive(subItem.path) && canSee(subItem.roles)) {
            setOpenSubmenu({ type: menuType, index });
            matched = true;
          }
        });
      });
    });

    if (!matched) {
      setOpenSubmenu(null);
    }
  }, [location.pathname, user, loading]);

  useEffect(() => {
    if (openSubmenu === null) {
      return;
    }

    const key = `${openSubmenu.type}-${openSubmenu.index}`;
    const element = subMenuRefs.current[key];

    if (element) {
      setSubMenuHeight((prev) => ({
        ...prev,
        [key]: element.scrollHeight || 0
      }));
    }
  }, [openSubmenu, user, loading, isExpandedView, location.pathname]);

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === menuType && prev.index === index) {
        return null;
      }

      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items, menuType) => (
    <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
      {items.map((item, index) => {
        const visibleSubItems = item.subItems
          ? item.subItems.filter((subItem) => canSee(subItem.roles))
          : null;

        if (visibleSubItems && visibleSubItems.length === 0) {
          return null;
        }

        if (item.roles && !canSee(item.roles)) {
          return null;
        }

        const key = `${menuType}-${index}`;
        const isOpen =
          openSubmenu?.type === menuType &&
          openSubmenu?.index === index;

        return (
          <li key={item.name}>
            {visibleSubItems ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`d-flex align-items-center w-100 border-0 px-3 py-2 rounded gap-2 fw-medium ${
                    isOpen
                      ? "bg-warning bg-opacity-25 text-warning-emphasis"
                      : "bg-transparent text-secondary"
                  }`}
                  style={{
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                >
                  <span className="text-center" style={{ width: 24, fontSize: "1.1rem" }}>
                    {item.icon}
                  </span>

                  {isExpandedView ? (
                    <>
                      <span className="flex-grow-1 text-start">{item.name}</span>
                      <span
                        className="ms-auto"
                        style={{
                          fontSize: "0.65rem",
                          transition: "transform 0.2s",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          display: "inline-block"
                        }}
                      >
                        ▼
                      </span>
                    </>
                  ) : null}
                </button>

                {isExpandedView ? (
                  <div
                    ref={(element) => {
                      subMenuRefs.current[key] = element;
                    }}
                    style={{
                      overflow: "hidden",
                      transition: "height 0.25s ease",
                      height: isOpen ? `${subMenuHeight[key] || 0}px` : "0px"
                    }}
                  >
                    <ul className="list-unstyled ps-4 pt-1 mb-0">
                      {visibleSubItems.map((subItem) => (
                        <li key={subItem.name}>
                          <Link
                            to={subItem.path}
                            className={`d-flex align-items-center gap-2 px-3 py-2 rounded text-decoration-none ${
                              isActive(subItem.path)
                                ? "text-danger fw-semibold"
                                : "text-secondary"
                            }`}
                            style={{
                              fontSize: "0.82rem",
                              background: isActive(subItem.path)
                                ? "rgba(220,53,69,0.08)"
                                : "transparent",
                              transition: "all 0.15s"
                            }}
                          >
                            <span
                              className={`rounded-circle ${
                                isActive(subItem.path)
                                  ? "bg-danger"
                                  : "bg-secondary bg-opacity-25"
                              }`}
                              style={{
                                width: 6,
                                height: 6,
                                flexShrink: 0,
                                display: "inline-block"
                              }}
                            />
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : item.path ? (
              <Link
                to={item.path}
                className={`d-flex align-items-center px-3 py-2 rounded gap-2 text-decoration-none fw-medium ${
                  isActive(item.path)
                    ? "text-danger"
                    : "text-secondary"
                }`}
                style={{
                  fontSize: "0.875rem",
                  background: isActive(item.path)
                    ? "rgba(220,53,69,0.08)"
                    : "transparent",
                  transition: "all 0.15s"
                }}
              >
                <span className="text-center" style={{ width: 24, fontSize: "1.1rem" }}>
                  {item.icon}
                </span>
                {isExpandedView ? <span>{item.name}</span> : null}
              </Link>
            ) : null}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <style>{`
        .app-sidebar {
          width: ${isExpandedView ? "260px" : "72px"};
          min-height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1040;
          transition: width 0.3s ease, transform 0.3s ease;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .app-sidebar::-webkit-scrollbar {
          width: 4px;
        }
        .app-sidebar::-webkit-scrollbar-thumb {
          background: #dee2e6;
          border-radius: 4px;
        }
        @media (max-width: 991px) {
          .app-sidebar {
            transform: ${isMobileOpen ? "translateX(0)" : "translateX(-100%)"};
          }
        }
      `}</style>

      <aside
        className="app-sidebar bg-white border-end shadow-sm d-flex flex-column"
        onMouseEnter={() => {
          if (!isExpanded) {
            setIsHovered(true);
          }
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="d-flex m-auto align-items-center px-3 border-bottom" style={{ height: 64, flexShrink: 0 }}>
          <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
            <div className="d-flex align-items-center justify-content-center text-white flex-shrink-0" />
            {isExpandedView ? (
              <span className="fw-bold text-dark" style={{ fontSize: "1rem", whiteSpace: "nowrap" }}>
                <img src={ResQHaven} style={{ width: "200px" }} className="rounded float-start" alt="ResQHaven" />
              </span>
            ) : null}
          </Link>
        </div>

        <div className="p-3 flex-grow-1">
          <div className="mb-3">
            {isExpandedView ? (
              <p
                className="text-uppercase text-muted mb-2 px-3"
                style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "1px" }}
              >
                Menu
              </p>
            ) : null}
            {renderMenuItems(navItems, "main")}
          </div>

          <hr className="my-3 text-muted" />

          <div>
            {isExpandedView ? (
              <p
                className="text-uppercase text-muted mb-2 px-3"
                style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "1px" }}
              >
                Others
              </p>
            ) : null}
            {renderMenuItems(otherItems, "other")}
          </div>
        </div>
      </aside>
    </>
  );
}
