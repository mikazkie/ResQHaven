import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "../../authentication/AuthContext";

const navItems = [
  {
    icon: "⊞",
    name: "Dashboard",
    subItems: [
      { 
        name: "Ecommerce", 
        path: "/dashboard",
        roles: ['super_admin', 'center_staff']
      }
    ]

  },
  {
    icon: "📅",
    name: "Calendar",
    path: "/calendar",
  },
  {
    icon: "👤",
    name: "User Profile",
    path: "/profile",
  },
  {
    name: "Forms",
    icon: "📋",
    subItems: [
      {
        name: "Check In",
        path: "/check-reg",
        roles: ['super_admin', 'center_staff']
      },
      {
        name: "Family Check In",
        path: "/familyCheckin",
        roles: ['super_admin', 'center_staff']
      },
      {
        name: "Evacuation Center",
        path: "/evacuation-reg",
        roles: ['super_admin', 'center_staff']
      },
      {
        name: "Hazard",
        path: "/hazard-reg",
        roles: ['super_admin', 'barangay_official']
      },
      {
        name: "Admin",
        path: "/admin-reg",
        roles: ['super_admin']
      },
      {
        name: "Hotline",
        path: "/hotline-reg",
        roles: ['super_admin', 'barangay_official']
      }
    ],
  },
  {
    name: "Tables",
    icon: "📊",
    subItems: [
      { name: "Evacuation Center", path: "/evacuation" }
    ],
  },
  {
    name: "Pages",
    icon: "📄",
    subItems: [
      { name: "Blank Page", path: "/blank" },
      { name: "404 Error", path: "/error-404" },
    ],
  },
];

const othersItems = [
  {
    icon: "🥧",
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart" },
      { name: "Bar Chart", path: "/bar-chart" },
    ],
  },
  {
    icon: "🥧",
    name: "Simulations",
    subItems: [
      { name: "Simulate", path: "/simulate" },
    ],
  },
  {
    icon: "🧩",
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts" },
      { name: "Avatar", path: "/avatars" },
      { name: "Badge", path: "/badge" },
      { name: "Buttons", path: "/buttons" },
      { name: "Images", path: "/images" },
      { name: "Videos", path: "/videos" },
    ],
  },
  {
    icon: "🔌",
    name: "Authentication",
    roles: ['super_admin'],
    subItems: [
      { name: "Sign In", path: "/signin" },
      { name: "Sign Up", path: "/signup" },
    ],
  },
];

export default function AppSidebar() {
  const { user } = useAuth();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const subMenuRefs = useRef({});
  const [subMenuHeight, setSubMenuHeight] = useState({});

  const isActive = (path) => location.pathname === path;
  const isExpanded_ = isExpanded || isHovered || isMobileOpen;

  // ✅ Check if user can see item
  const canSee = (roles) => {
    if (!roles || roles.length === 0) return true
    if (!user) return false
    return roles.includes(user.role)
  }

  useEffect(() => {
    let matched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((sub) => {
            if (isActive(sub.path)) {
              setOpenSubmenu({ type: menuType, index });
              matched = true;
            }
          });
        }
      });
    });
    if (!matched) setOpenSubmenu(null);
  }, [location]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === menuType && prev.index === index) return null;
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items, menuType) => (
    <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
      {items.map((nav, index) => {

        // ✅ Filter subItems by role
        const filteredSubItems = nav.subItems
          ? nav.subItems.filter(sub => canSee(sub.roles))
          : null

        // ✅ Hide parent if no visible children
        if (filteredSubItems && filteredSubItems.length === 0) {
          return null
        }

        // ✅ Hide parent item by role
        if (nav.roles && !canSee(nav.roles)) {
          return null
        }

        const key = `${menuType}-${index}`;
        const isOpen =
          openSubmenu?.type === menuType &&
          openSubmenu?.index === index;

        return (
          <li key={nav.name}>
            {filteredSubItems ? (
              <>
                {/* Parent button with submenu */}
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`d-flex align-items-center
                    w-100 border-0 px-3 py-2 rounded
                    gap-2 fw-medium
                    ${isOpen
                      ? 'bg-warning bg-opacity-25 text-warning-emphasis'
                      : 'bg-transparent text-secondary'
                    }`}
                  style={{
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <span className="text-center"
                    style={{ width: 24, fontSize: '1.1rem' }}
                  >
                    {nav.icon}
                  </span>

                  {isExpanded_ && (
                    <>
                      <span className="flex-grow-1 text-start">
                        {nav.name}
                      </span>
                      <span
                        className="ms-auto"
                        style={{
                          fontSize: '0.65rem',
                          transition: 'transform 0.2s',
                          transform: isOpen
                            ? 'rotate(180deg)'
                            : 'rotate(0deg)',
                          display: 'inline-block'
                        }}
                      >
                        ▼
                      </span>
                    </>
                  )}
                </button>

                {/* Submenu */}
                {isExpanded_ && (
                  <div
                    ref={(el) => (subMenuRefs.current[key] = el)}
                    style={{
                      overflow: 'hidden',
                      transition: 'height 0.25s ease',
                      height: isOpen
                        ? `${subMenuHeight[key] || 0}px`
                        : '0px',
                    }}
                  >
                    <ul className="list-unstyled ps-4 pt-1 mb-0">
                      {filteredSubItems.map((sub) => (
                        <li key={sub.name}>
                          <Link
                            to={sub.path}
                            className={`d-flex align-items-center
                              gap-2 px-3 py-2 rounded
                              text-decoration-none
                              ${isActive(sub.path)
                                ? 'text-danger fw-semibold'
                                : 'text-secondary'
                              }`}
                            style={{
                              fontSize: '0.82rem',
                              background: isActive(sub.path)
                                ? 'rgba(220,53,69,0.08)'
                                : 'transparent',
                              transition: 'all 0.15s'
                            }}
                          >
                            <span
                              className={`rounded-circle ${
                                isActive(sub.path)
                                  ? 'bg-danger'
                                  : 'bg-secondary bg-opacity-25'
                              }`}
                              style={{
                                width: 6,
                                height: 6,
                                flexShrink: 0,
                                display: 'inline-block'
                              }}
                            />
                            {sub.name}
                            {sub.new && (
                              <span className="badge bg-success ms-auto"
                                style={{ fontSize: '0.6rem' }}
                              >
                                new
                              </span>
                            )}
                            {sub.pro && (
                              <span className="badge bg-primary ms-auto"
                                style={{ fontSize: '0.6rem' }}
                              >
                                pro
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              nav.path && canSee(nav.roles) && (
                <Link
                  to={nav.path}
                  className={`d-flex align-items-center
                    px-3 py-2 rounded gap-2
                    text-decoration-none fw-medium
                    ${isActive(nav.path)
                      ? 'text-danger'
                      : 'text-secondary'
                    }`}
                  style={{
                    fontSize: '0.875rem',
                    background: isActive(nav.path)
                      ? 'rgba(220,53,69,0.08)'
                      : 'transparent',
                    transition: 'all 0.15s'
                  }}
                >
                  <span className="text-center"
                    style={{ width: 24, fontSize: '1.1rem' }}
                  >
                    {nav.icon}
                  </span>
                  {isExpanded_ && (
                    <span>{nav.name}</span>
                  )}
                </Link>
              )
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <style>{`
        .app-sidebar {
          width: ${isExpanded_ ? '260px' : '72px'};
          min-height: 100vh;
          position: fixed;
          top: 0; left: 0;
          z-index: 1040;
          transition: width 0.3s ease,
            transform 0.3s ease;
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
            transform: ${isMobileOpen
              ? 'translateX(0)'
              : 'translateX(-100%)'
            };
          }
        }
        .nav-link-item:hover {
          background: rgba(0,0,0,0.04) !important;
          color: #212529 !important;
        }
        .submenu-link:hover {
          background: rgba(220,53,69,0.05) !important;
          color: #dc3545 !important;
        }
      `}</style>

      <aside
        className="app-sidebar bg-white border-end shadow-sm d-flex flex-column"
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >

        {/* ── Logo ── */}
        <div className="d-flex align-items-center
          px-3 border-bottom"
          style={{ height: 64, flexShrink: 0 }}
        >
          <Link
            to="/"
            className="text-decoration-none
              d-flex align-items-center gap-2"
          >
            <div className="bg-danger rounded
              d-flex align-items-center
              justify-content-center text-white
              flex-shrink-0"
              style={{
                width: 36, height: 36,
                fontSize: '1rem'
              }}
            >
              🛡️
            </div>
            {isExpanded_ && (
              <span className="fw-bold text-dark"
                style={{
                  fontSize: '1rem',
                  whiteSpace: 'nowrap'
                }}
              >
                RiskReady
              </span>
            )}
          </Link>
        </div>

        {/* ── Nav Content ── */}
        <div className="p-3 flex-grow-1">

          {/* Main Menu */}
          <div className="mb-3">
            {isExpanded_ && (
              <p className="text-uppercase
                text-muted mb-2 px-3"
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '1px'
                }}
              >
                Menu
              </p>
            )}
            {renderMenuItems(navItems, "main")}
          </div>

          <hr className="my-3 text-muted" />

          {/* Others Menu */}
          <div>
            {isExpanded_ && (
              <p className="text-uppercase
                text-muted mb-2 px-3"
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '1px'
                }}
              >
                Others
              </p>
            )}
            {renderMenuItems(othersItems, "others")}
          </div>

        </div>

        {/* ── Logout ── */}
        {isExpanded_ && (
          <div className="p-3 border-top">
            <button
              className="d-flex align-items-center
                w-100 border-0 px-3 py-2 rounded
                gap-2 fw-medium text-danger
                bg-danger bg-opacity-10"
              style={{
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onClick={() => {
                // call your logout here
              }}
            >
              <span className="text-center"
                style={{ width: 24, fontSize: '1.1rem' }}
              >
                🚪
              </span>
              <span>Logout</span>
            </button>
          </div>
        )}

      </aside>
    </>
  );
}