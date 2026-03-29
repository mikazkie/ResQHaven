import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "../../authentication/AuthContext";
import { postRequest } from "../../API/API";

export default function AppHeader() {
  const [showAppMenu, setShowAppMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const searchRef = useRef(null);
  const displayName = user?.firstName || user?.email || "Admin";
  const roleLabel = user?.role ? user.role.replace(/_/g, " ").toUpperCase() : "ADMIN";
  const profileInitial = displayName.charAt(0).toUpperCase() || "A";

  const handleToggle = () => {
    if (window.innerWidth >= 992) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await postRequest("auth/logout", {});
    } catch (error) {
      console.log(error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setShowProfile(false);
      setShowNotifs(false);
      navigate("/login", { replace: true });
    }
  };

  const notifications = [
    { id: 1, icon: "🌀", title: "Typhoon Warning", msg: "Signal No. 2 in Cebu", time: "2m ago", color: "danger" },
    { id: 2, icon: "🌊", title: "Flood Alert", msg: "Mambaling — High Risk", time: "10m ago", color: "warning" },
    { id: 3, icon: "✅", title: "Center Update", msg: "Mambaling Gym now open", time: "1h ago", color: "success" },
  ];

  return (
    <>
      <header className="d-flex align-items-center px-3 border-bottom bg-white shadow-sm sticky-top gap-2"
        style={{ height: "64px", zIndex: 1030 }}>

        {/* Toggle Button */}
        <button
          className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
          style={{ width: 38, height: 38 }}
          onClick={handleToggle}
        >
          {isMobileOpen ? "✕" : "☰"}
        </button>

        {/* Mobile Logo */}
        <Link
          to="/"
          className="d-lg-none text-decoration-none d-flex align-items-center gap-2"
        >
          <div
            className="d-flex align-items-center justify-content-center text-white rounded"
            style={{ width: 32, height: 32, background: "#0d6efd" }}
          >
            🛡️
          </div>

          <span className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>
            RiskReady
          </span>
        </Link>

        {/* Search */}
        <div className="position-relative d-none d-lg-block">
          <span
            className="position-absolute text-secondary"
            style={{ left: 10, top: "50%", transform: "translateY(-50%)" }}
          >
            🔍
          </span>

          <input
            ref={searchRef}
            type="text"
            placeholder="Search or type command..."
            className="form-control"
            style={{ paddingLeft: 34, paddingRight: 60, width: 320, height: 38 }}
          />

          <span
            className="position-absolute border rounded px-1 small text-secondary bg-light"
            style={{ right: 8, top: "50%", transform: "translateY(-50%)" }}
          >
            ⌘ K
          </span>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="btn btn-outline-secondary d-lg-none ms-auto"
          style={{ width: 38, height: 38 }}
          onClick={() => setShowAppMenu(!showAppMenu)}
        >
          ···
        </button>

        {/* Right Side */}
        <div
          className={`align-items-center gap-2 ms-auto ${
            showAppMenu ? "d-flex" : "d-none d-lg-flex"
          }`}
        >

          {/* Notifications */}
          <div className="position-relative">

            <button
              className="btn btn-outline-secondary position-relative"
              style={{ width: 38, height: 38 }}
              onClick={() => {
                setShowNotifs(!showNotifs);
                setShowProfile(false);
              }}
            >
              🔔
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </button>

            {showNotifs && (
              <div
                className="dropdown-menu show p-0 shadow"
                style={{ minWidth: 300, right: 0 }}
              >
                <div className="px-3 py-2 border-bottom d-flex justify-content-between small fw-bold text-uppercase text-muted">
                  Notifications
                  <span
                    className="text-primary"
                    style={{ cursor: "pointer", textTransform: "none" }}
                    onClick={() => setShowNotifs(false)}
                  >
                    Mark all read
                  </span>
                </div>

                {notifications.map((n) => (
                  <div key={n.id} className="d-flex gap-2 px-3 py-2 border-bottom">
                    <div
                      className={`bg-${n.color} bg-opacity-10 rounded d-flex align-items-center justify-content-center`}
                      style={{ width: 34, height: 34 }}
                    >
                      {n.icon}
                    </div>

                    <div>
                      <div className="fw-semibold small">{n.title}</div>
                      <div className="text-muted small">{n.msg}</div>
                      <div className="text-secondary" style={{ fontSize: 11 }}>
                        {n.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="position-relative">

            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
              style={{
                width: 38,
                height: 38,
                background: "linear-gradient(135deg,#0d6efd,#6ea8fe)",
                cursor: "pointer",
              }}
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifs(false);
              }}
            >
              {profileInitial}
            </div>

            {showProfile && (
              <div
                className="dropdown-menu show shadow"
                style={{ minWidth: 200, right: 0 }}
              >
                <div className="px-3 py-3 border-bottom d-flex gap-2">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                    style={{ width: 38, height: 38 }}
                  >
                    {profileInitial}
                  </div>

                  <div>
                    <div className="fw-semibold small">{displayName}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {roleLabel}
                    </div>
                  </div>
                </div>

                <Link
                  to="/profile"
                  className="dropdown-item"
                  onClick={() => setShowProfile(false)}
                >
                  👤 My Profile
                </Link>

                <Link
                  to="/settings"
                  className="dropdown-item"
                  onClick={() => setShowProfile(false)}
                >
                  ⚙️ Settings
                </Link>

                <div className="dropdown-divider"></div>

                <button
                  className="dropdown-item text-danger"
                  onClick={handleLogout}
                >
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {(showNotifs || showProfile) && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1000 }}
          onClick={() => {
            setShowNotifs(false);
            setShowProfile(false);
          }}
        />
      )}
    </>
  );
}
