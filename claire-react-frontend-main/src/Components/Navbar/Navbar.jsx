import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

import logo from "../../assets/logo.png";
import bellIcon from "../../assets/notification-bell.png";
import userIcon from "../../assets/user-icon.png";
import {
  fetchNotificationsApi,
  getCurrentUserApi,
  logoutApi,
} from "../../lib/api";
import {
  getStoredUser,
  resolveUserRole,
  ROLES,
  getRoleLabel,
} from "../../lib/auth";

const POLL_INTERVAL_MS = 15000;

const getSeenStorageKey = (user) => {
  if (!user?.email) return "claire_notifications_seen_guest";
  return `claire_notifications_seen_${user.email}`;
};

const getItemTimestamp = (item) => {
  return item?.updated_at || item?.created_at || null;
};

const getLatestSeenValue = (items) => {
  const timestamps = items
    .map((item) => getItemTimestamp(item))
    .filter(Boolean)
    .sort();

  return timestamps.length ? timestamps[timestamps.length - 1] : null;
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [notifications, setNotifications] = useState([]);
  const [lastSeenAt, setLastSeenAt] = useState(null);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const currentRole = resolveUserRole(currentUser);
  const isLoggedIn = Boolean(currentUser?.email);
  const isAdmin = currentRole === ROLES.ADMIN;
  const isStaff = currentRole === ROLES.STAFF;

  const portalPath = isAdmin ? "/admin" : isStaff ? "/staff-portal" : "/profile";
  const portalLabel = isAdmin ? "Admin Portal" : isStaff ? "Staff Portal" : null;

  const seenStorageKey = useMemo(
    () => getSeenStorageKey(currentUser),
    [currentUser],
  );

  const unreadCount = useMemo(() => {
    if (!isLoggedIn) return 0;
    if (!lastSeenAt) return notifications.length;

    const seenTime = new Date(lastSeenAt).getTime();

    return notifications.filter((item) => {
      const timestamp = getItemTimestamp(item);
      if (!timestamp) return false;
      return new Date(timestamp).getTime() > seenTime;
    }).length;
  }, [isLoggedIn, lastSeenAt, notifications]);

  const markNotificationsSeen = (items = notifications) => {
    const latestSeen = getLatestSeenValue(items);
    if (!latestSeen) return;

    try {
      localStorage.setItem(seenStorageKey, latestSeen);
    } catch {
      //
    }

    setLastSeenAt(latestSeen);
  };

  const loadNotifications = async () => {
    if (!isLoggedIn) {
      setNotifications([]);
      return [];
    }

    try {
      const response = await fetchNotificationsApi();
      const items = Array.isArray(response?.data) ? response.data : [];
      setNotifications(items);
      return items;
    } catch {
      setNotifications([]);
      return [];
    }
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const goToSection = (sectionId) => {
    setProfileOpen(false);
    setNotifOpen(false);

    if (location.pathname === "/") {
      scrollToSection(sectionId);
      return;
    }

    navigate("/");

    setTimeout(() => {
      scrollToSection(sectionId);
    }, 250);
  };

  const goToPage = (path) => {
    setProfileOpen(false);
    setNotifOpen(false);
    navigate(path);
  };

  useEffect(() => {
    const syncUser = async () => {
      const stored = getStoredUser();
      setCurrentUser(stored);

      if (stored?.email) {
        try {
          const freshUser = await getCurrentUserApi();
          localStorage.setItem("claire_user", JSON.stringify(freshUser));
          setCurrentUser(freshUser);
          window.dispatchEvent(new Event("claire-user-updated"));
        } catch {
          //
        }
      }
    };

    syncUser();
  }, [location.pathname]);

  useEffect(() => {
    const handleUserUpdated = () => {
      setCurrentUser(getStoredUser());
    };

    window.addEventListener("claire-user-updated", handleUserUpdated);

    return () => {
      window.removeEventListener("claire-user-updated", handleUserUpdated);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }

      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    try {
      const savedSeen = localStorage.getItem(seenStorageKey);
      setLastSeenAt(savedSeen);
    } catch {
      setLastSeenAt(null);
    }
  }, [seenStorageKey]);

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      return;
    }

    let active = true;

    const run = async () => {
      const items = await loadNotifications();
      if (!active) return;

      if (!lastSeenAt && items.length > 0) {
        try {
          const savedSeen = localStorage.getItem(seenStorageKey);
          if (savedSeen) {
            setLastSeenAt(savedSeen);
          }
        } catch {
          //
        }
      }
    };

    run();

    const interval = window.setInterval(run, POLL_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [isLoggedIn, seenStorageKey]);

  useEffect(() => {
    if (!notifOpen) return;
    markNotificationsSeen(notifications);
  }, [notifOpen, notifications]);

  const handleBellClick = async () => {
    setProfileOpen(false);

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (!notifOpen) {
      const items = await loadNotifications();
      setNotifOpen(true);
      markNotificationsSeen(items);
      return;
    }

    setNotifOpen(false);
  };

  const handleNotificationOpen = () => {
    markNotificationsSeen(notifications);
    setNotifOpen(false);

    if (isAdmin) {
      navigate("/admin");
      return;
    }

    if (isStaff) {
      navigate("/staff-portal");
      return;
    }

    navigate("/profile");
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      //
    } finally {
      setCurrentUser(null);
      setNotifications([]);
      setProfileOpen(false);
      setNotifOpen(false);
      window.dispatchEvent(new Event("claire-user-updated"));
      navigate("/login");
    }
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button type="button" className="site-logo-btn" onClick={() => goToSection("home")}>
          <img src={logo} alt="Claire Beauty Lounge" className="site-logo" />
        </button>

        <nav className="site-nav">
          <button onClick={() => goToSection("home")} className="site-nav__btn">
            Home
          </button>
          <button onClick={() => goToSection("services")} className="site-nav__btn">
            Services
          </button>
          <button onClick={() => goToSection("gallery")} className="site-nav__btn">
            Gallery
          </button>
          <button onClick={() => goToPage("/page1")} className="site-nav__btn">
            Book Appointment
          </button>
          {portalLabel ? (
            <button onClick={() => goToPage(portalPath)} className="site-nav__btn">
              {portalLabel}
            </button>
          ) : null}
        </nav>

        <div className="site-header__actions">
          <div className="notification-menu" ref={notifRef}>
            <button type="button" className="icon-btn notif-btn" onClick={handleBellClick}>
              <img src={bellIcon} alt="Notifications" className="notif-icon" />
              {unreadCount > 0 ? <span className="notif-badge">{unreadCount}</span> : null}
            </button>

            {notifOpen && isLoggedIn ? (
              <div className="notif-dropdown">
                <div className="notif-dropdown__header">
                  <strong>Notifications</strong>
                  <button
                    type="button"
                    className="notif-open-btn"
                    onClick={handleNotificationOpen}
                  >
                    Open
                  </button>
                </div>

                {notifications.length ? (
                  <div className="notif-dropdown__list">
                    {notifications.map((item) => {
                      const isUnread = !lastSeenAt
                        ? true
                        : (() => {
                            const timestamp = getItemTimestamp(item);
                            if (!timestamp) return false;
                            return new Date(timestamp).getTime() > new Date(lastSeenAt).getTime();
                          })();

                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`notif-dropdown__item ${isUnread ? "is-unread" : ""}`}
                          onClick={handleNotificationOpen}
                        >
                          <span className="notif-dropdown__title">
                            {item.title || "Notification"}
                          </span>
                          <span className="notif-dropdown__message">
                            {item.description || item.message || "You have a new update."}
                          </span>
                          <span className="notif-dropdown__time">
                            {item.time || ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="notif-dropdown__empty">No notifications yet.</div>
                )}
              </div>
            ) : null}
          </div>

          <div className="profile-menu" ref={profileRef}>
            <button
              type="button"
              className="icon-btn profile-btn"
              onClick={() => {
                setProfileOpen((prev) => !prev);
                setNotifOpen(false);
              }}
            >
              <img src={userIcon} alt="Profile" className="profile-icon" />
            </button>

            {profileOpen ? (
              <div className="profile-dropdown">
                {isLoggedIn ? (
                  <>
                    <div className="profile-dropdown__header">
                      <strong>{currentUser?.name || "User"}</strong>
                      <span>{getRoleLabel(currentRole)}</span>
                    </div>

                    <div className="profile-dropdown__actions">
                      <button type="button" onClick={() => goToPage("/profile")}>
                        My Profile
                      </button>

                      <button type="button" onClick={() => goToPage("/page1")}>
                        Book Appointment
                      </button>

                      {portalLabel ? (
                        <button type="button" onClick={() => goToPage(portalPath)}>
                          {portalLabel}
                        </button>
                      ) : null}

                      <button type="button" onClick={handleLogout}>
                        Log Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="profile-dropdown__actions">
                    <button type="button" onClick={() => goToPage("/login")}>
                      Log In
                    </button>
                    <button type="button" onClick={() => goToPage("/signup")}>
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;