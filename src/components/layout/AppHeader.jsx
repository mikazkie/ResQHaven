import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "../../authentication/AuthContext";
import { getRequest, postRequest } from "../../API/API";

const formatRelativeTime = (value) => {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (!Number.isFinite(diffMs) || diffMs < 0) {
    return "Just now";
  }

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const getAlertTone = (type = "", level = "") => {
  const text = `${type} ${level}`.toLowerCase();

  if (text.includes("typhoon") || text.includes("flood") || text.includes("very high")) {
    return "danger";
  }

  if (text.includes("storm") || text.includes("high") || text.includes("moderate")) {
    return "warning";
  }

  return "primary";
};

const getRequestTone = (status = "") => {
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  return "warning";
};

export default function AppHeader() {
  const [showAppMenu, setShowAppMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [alertNotifications, setAlertNotifications] = useState([]);
  const [requestNotifications, setRequestNotifications] = useState([]);
  const [lastSeenAt, setLastSeenAt] = useState(() => {
    const savedValue = localStorage.getItem("adminNotificationSeenAt");
    return savedValue ? Number(savedValue) || 0 : 0;
  });

  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const displayName = user?.firstName || user?.email || "Admin";
  const roleLabel = user?.role ? user.role.replace(/_/g, " ").toUpperCase() : "ADMIN";
  const profileInitial = displayName.charAt(0).toUpperCase() || "A";
  const canSeeRequestNotifications = ["super_admin", "dswd", "barangay_official"].includes(user?.role);

  const handleToggle = () => {
    if (window.innerWidth >= 992) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadNotifications = async () => {
      try {
        setNotificationsLoading(true);

        const requests = [getRequest("api/alerts")];
        if (canSeeRequestNotifications) {
          requests.push(getRequest("api/distribution-requests?status=all"));
        }

        const results = await Promise.allSettled(requests);

        if (!mounted) {
          return;
        }

        const alertsResult = results[0];
        setAlertNotifications(
          alertsResult?.status === "fulfilled" ? alertsResult.value?.data || [] : []
        );

        if (canSeeRequestNotifications) {
          const requestsResult = results[1];
          setRequestNotifications(
            requestsResult?.status === "fulfilled" ? requestsResult.value?.requests || [] : []
          );
        } else {
          setRequestNotifications([]);
        }
      } catch (error) {
        console.log(error);
        if (mounted) {
          setAlertNotifications([]);
          setRequestNotifications([]);
        }
      } finally {
        if (mounted) {
          setNotificationsLoading(false);
        }
      }
    };

    if (user) {
      loadNotifications();
    }

    return () => {
      mounted = false;
    };
  }, [canSeeRequestNotifications, user]);

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

  const notifications = useMemo(() => {
    const disasterItems = alertNotifications.slice(0, 4).map((alert) => ({
      id: `alert-${alert.id}`,
      icon: "bi bi-exclamation-triangle",
      title: alert.disaster_type || "Disaster Alert",
      msg:
        [alert.affected_areas, alert.alert_level].filter(Boolean).join(" | ") ||
        "Active disaster alert",
      time: formatRelativeTime(alert.detected_at || alert.created_at),
      color: getAlertTone(alert.disaster_type, alert.alert_level),
      sortValue: new Date(alert.detected_at || alert.created_at || 0).getTime(),
      onClick: () => {
        setShowNotifs(false);
        navigate("/simulation");
      }
    }));

    const requestItems = requestNotifications.slice(0, 4).map((request) => ({
      id: `request-${request.id}`,
      icon: "bi bi-box-seam",
      title: `Request #${request.id}`,
      msg: `${request.request_type === "batch" ? "Batch" : "Individual"} request is ${request.status}`,
      time: formatRelativeTime(request.reviewed_at || request.created_at),
      color: getRequestTone(request.status),
      sortValue: new Date(request.reviewed_at || request.created_at || 0).getTime(),
      onClick: () => {
        setShowNotifs(false);
        navigate("/distribution-requests");
      }
    }));

    return [...disasterItems, ...requestItems]
      .sort((a, b) => b.sortValue - a.sortValue)
      .slice(0, 8);
  }, [alertNotifications, navigate, requestNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.sortValue > lastSeenAt).length,
    [lastSeenAt, notifications]
  );

  const markNotificationsAsSeen = () => {
    const seenAt = Date.now();
    localStorage.setItem("adminNotificationSeenAt", String(seenAt));
    setLastSeenAt(seenAt);
  };

  return (
    <>
      <header
        className="d-flex align-items-center px-3 border-bottom bg-white shadow-sm sticky-top gap-2"
        style={{ height: "64px", zIndex: 1030 }}
      >
        <button
          className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
          style={{ width: 38, height: 38 }}
          onClick={handleToggle}
        >
          <i className={`bi ${isMobileOpen ? "bi-x-lg" : "bi-list"}`}></i>
        </button>

        <button
          className="btn btn-outline-secondary d-lg-none ms-auto"
          style={{ width: 38, height: 38 }}
          onClick={() => setShowAppMenu((current) => !current)}
        >
          <i className="bi bi-three-dots"></i>
        </button>

        <div
          className={`align-items-center gap-2 ms-auto ${
            showAppMenu ? "d-flex" : "d-none d-lg-flex"
          }`}
        >
          <div className="position-relative">
            <button
              className="btn btn-outline-secondary position-relative"
              style={{ width: 38, height: 38 }}
              onClick={() => {
                setShowNotifs((current) => {
                  const nextValue = !current;
                  if (nextValue) {
                    markNotificationsAsSeen();
                  }
                  return nextValue;
                });
                setShowProfile(false);
              }}
            >
              <i className="bi bi-bell"></i>
              {unreadCount ? (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </button>

            {showNotifs && (
              <div className="dropdown-menu show p-0 shadow" style={{ minWidth: 320, right: 0 }}>
                <div className="px-3 py-2 border-bottom d-flex justify-content-between small fw-bold text-uppercase text-muted">
                  Notifications
                  <span
                    className="text-primary"
                    style={{ cursor: "pointer", textTransform: "none" }}
                    onClick={() => setShowNotifs(false)}
                  >
                    Close
                  </span>
                </div>

                {notificationsLoading ? (
                  <div className="px-3 py-4 text-center text-muted small">
                    Loading notifications...
                  </div>
                ) : notifications.length ? (
                  notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="d-flex gap-2 px-3 py-2 border-bottom bg-white border-0 w-100 text-start"
                      onClick={() => {
                        markNotificationsAsSeen();
                        item.onClick();
                      }}
                    >
                      <div
                        className={`bg-${item.color} bg-opacity-10 rounded d-flex align-items-center justify-content-center flex-shrink-0`}
                        style={{ width: 34, height: 34 }}
                      >
                        <i className={`${item.icon} text-${item.color}`}></i>
                      </div>

                      <div>
                        <div className="fw-semibold small">{item.title}</div>
                        <div className="text-muted small">{item.msg}</div>
                        <div className="text-secondary" style={{ fontSize: 11 }}>
                          {item.time}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-muted small">
                    No new disaster or request notifications.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="position-relative">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
              style={{
                width: 38,
                height: 38,
                background: "linear-gradient(135deg,#0d6efd,#6ea8fe)",
                cursor: "pointer"
              }}
              onClick={() => {
                setShowProfile((current) => !current);
                setShowNotifs(false);
              }}
            >
              {profileInitial}
            </div>

            {showProfile && (
              <div className="dropdown-menu show shadow" style={{ minWidth: 220, right: 0 }}>
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

                <Link to="/profile" className="dropdown-item" onClick={() => setShowProfile(false)}>
                  <i className="bi bi-person me-2"></i>
                  My Profile
                </Link>

                <Link to="/settings" className="dropdown-item" onClick={() => setShowProfile(false)}>
                  <i className="bi bi-gear me-2"></i>
                  Settings
                </Link>

                <div className="dropdown-divider"></div>

                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Sign Out
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
