import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import {
  fetchUpcomingAppointmentApi,
  getCurrentUserApi,
  logoutApi,
} from "../lib/api";
import { resolveUserRole, ROLES, getRoleLabel } from "../lib/auth";

const formatDate = (dateValue) => {
  if (!dateValue) return "—";

  try {
    return new Date(dateValue).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateValue;
  }
};

const formatDateTime = (appointment) => {
  if (!appointment) return "No upcoming booking yet.";

  if (appointment.starts_at) {
    try {
      return new Date(appointment.starts_at).toLocaleString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      //
    }
  }

  return `${formatDate(appointment.appointment_date)} • ${appointment.time_slot || "—"}`;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [appointmentMessage, setAppointmentMessage] = useState("Loading upcoming appointment...");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = await getCurrentUserApi();
        setUser(currentUser);
        localStorage.setItem("claire_user", JSON.stringify(currentUser));
        window.dispatchEvent(new Event("claire-user-updated"));

        try {
          const upcoming = await fetchUpcomingAppointmentApi();
          setUpcomingAppointment(upcoming?.data || null);
          setAppointmentMessage(
            upcoming?.data ? "Upcoming appointment found." : "No booking yet. Reserve your next glam session today."
          );
        } catch {
          setUpcomingAppointment(null);
          setAppointmentMessage("No booking yet. Reserve your next glam session today.");
        }
      } catch {
        setUser(null);
        localStorage.removeItem("claire_user");
        window.dispatchEvent(new Event("claire-user-updated"));
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      //
    } finally {
      localStorage.removeItem("claire_user");
      window.dispatchEvent(new Event("claire-user-updated"));
      setUser(null);
      navigate("/login");
    }
  };

  const selectedServices = useMemo(() => {
    if (!upcomingAppointment?.services?.length) return "No selected services yet.";

    return upcomingAppointment.services
      .map((service) => {
        const serviceName = service?.name || "Service";
        const category = service?.category ? ` (${service.category})` : "";
        return `${serviceName}${category}`;
      })
      .join(", ");
  }, [upcomingAppointment]);

  if (isLoading) {
    return (
      <section className="profile-page">
        <div className="profile-card profile-empty">
          <h1>Loading your profile...</h1>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="profile-page">
        <div className="profile-card profile-empty">
          <h1>You are not signed in</h1>
          <p>Please log in first to access your profile details.</p>
          <button type="button" onClick={() => navigate("/login")}>
            Go to Log In
          </button>
        </div>
      </section>
    );
  }

  const currentRole = resolveUserRole(user);

  return (
    <section className="profile-page">
      <div className="profile-card">
        <p className="profile-eyebrow">My Account</p>
        <h1>{user.name}</h1>
        <p className="profile-email">{user.email}</p>
        <p className="profile-role">{getRoleLabel(currentRole)}</p>

        <div className="profile-grid">
          <article className="profile-highlight">
            <h2>Upcoming Appointment</h2>
            <p className="profile-highlight__main">{formatDateTime(upcomingAppointment)}</p>
            <p>{appointmentMessage}</p>
            {upcomingAppointment ? (
              <>
                <p><strong>Status:</strong> {upcomingAppointment.status || "—"}</p>
                <p><strong>Party Size:</strong> {upcomingAppointment.number_of_people || 1}</p>
                <p><strong>Total:</strong> PHP {Number(upcomingAppointment.quoted_total || 0).toLocaleString()}</p>
              </>
            ) : null}
          </article>

          <article>
            <h2>Selected Services</h2>
            <p>{selectedServices}</p>
          </article>
        </div>

        <div className="profile-actions">
          {currentRole === ROLES.ADMIN ? (
            <button
              type="button"
              className="profile-action-btn"
              onClick={() => navigate("/admin")}
            >
              Open Admin Portal
            </button>
          ) : null}

          {currentRole === ROLES.STAFF ? (
            <button
              type="button"
              className="profile-action-btn"
              onClick={() => navigate("/staff-portal")}
            >
              Open Staff Portal
            </button>
          ) : null}

          <button
            type="button"
            className="profile-action-btn"
            onClick={() => navigate("/page1")}
          >
            Book Appointment
          </button>

          <button type="button" className="profile-action-btn is-logout" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;