import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./StaffSchedulePage.css";
import {
  addStaffAppointmentNotes,
  fetchStaffAppointments,
  requestStaffAppointmentReschedule,
  updateStaffAppointmentStatus,
} from "../lib/api";

const mondayOf = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const ymd = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
};

const formatDisplayDate = (isoYmd) => {
  if (!isoYmd) {
    return "";
  }
  const [y, m, day] = isoYmd.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const StaffSchedulePage = () => {
  const [anchor, setAnchor] = useState(() => new Date());
  const [view, setView] = useState("week");
  const [items, setItems] = useState([]);
  const [period, setPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [rescheduleNote, setRescheduleNote] = useState("");
  const [rescheduleProposed, setRescheduleProposed] = useState("");

  const weekStart = useMemo(() => mondayOf(anchor), [anchor]);

  /** Wider API window so customer bookings (any day in range) still load; calendar shows all days that have rows. */
  const apiRange = useMemo(() => {
    if (view === "day") {
      const d = new Date(anchor);
      d.setHours(0, 0, 0, 0);
      return { from: ymd(d), to: ymd(addDays(d, 56)) };
    }
    return { from: ymd(weekStart), to: ymd(addDays(weekStart, 55)) };
  }, [view, anchor, weekStart]);

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await fetchStaffAppointments({
        from: apiRange.from,
        to: apiRange.to,
      });
      setItems(data.data ?? []);
      setPeriod(data.period ?? null);
    } catch (err) {
      setError(err.message || "Could not load your schedule.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [apiRange.from, apiRange.to]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = items.find((a) => a.id === selectedId) ?? null;
  const canAct = Boolean(selected?.viewer_is_assigned);

  useEffect(() => {
    setNoteDraft("");
    setRescheduleNote("");
    setRescheduleProposed("");
  }, [selectedId]);

  const baseDayKeys = useMemo(() => {
    if (view === "day") {
      const d = new Date(anchor);
      d.setHours(0, 0, 0, 0);
      return [ymd(d)];
    }
    const keys = [];
    for (let i = 0; i < 7; i += 1) {
      keys.push(ymd(addDays(weekStart, i)));
    }
    return keys;
  }, [view, anchor, weekStart]);

  const dayKeys = useMemo(() => {
    const fromItems = [
      ...new Set(items.map((i) => i.appointment_date).filter(Boolean)),
    ].sort();
    return [...new Set([...baseDayKeys, ...fromItems])].sort();
  }, [baseDayKeys, items]);

  const groupedByDay = useMemo(() => {
    const map = new Map();
    items.forEach((row) => {
      const key = row.appointment_date;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(row);
    });
    map.forEach((list) => {
      list.sort((a, b) => {
        const assignedA = a.viewer_is_assigned ? 1 : 0;
        const assignedB = b.viewer_is_assigned ? 1 : 0;
        if (assignedA !== assignedB) {
          return assignedA - assignedB;
        }
        return String(a.starts_at ?? "").localeCompare(
          String(b.starts_at ?? ""),
        );
      });
    });
    return map;
  }, [items]);

  const shiftWeek = (delta) => {
    setAnchor((prev) => addDays(prev, delta * 7));
  };

  const shiftDay = (delta) => {
    setAnchor((prev) => addDays(prev, delta));
  };

  const servicesLine = (row) => {
    if (row.guests?.length) {
      return row.guests
        .map((guest) => {
          const label = guest.label || "Guest";
          const lines = (guest.services ?? [])
            .map((s) => `${s.category ?? ""} — ${s.name ?? ""}`.trim())
            .filter(Boolean)
            .join(" · ");
          return lines ? `${label}: ${lines}` : label;
        })
        .join(" | ");
    }
    return (row.services ?? [])
      .map((s) => `${s.category ?? ""} — ${s.name ?? ""}`.trim())
      .join(" · ");
  };

  const handleStatus = async (status) => {
    if (!selected) {
      return;
    }
    setError("");
    try {
      await updateStaffAppointmentStatus(selected.id, status);
      await load();
    } catch (err) {
      setError(err.message || "Status update failed.");
    }
  };

  const handleSaveNotes = async () => {
    if (!selected || !noteDraft.trim()) {
      return;
    }
    setError("");
    try {
      await addStaffAppointmentNotes(selected.id, noteDraft.trim());
      setNoteDraft("");
      await load();
    } catch (err) {
      setError(err.message || "Could not save notes.");
    }
  };

  const handleRescheduleRequest = async () => {
    if (!selected) {
      return;
    }
    setError("");
    try {
      await requestStaffAppointmentReschedule(selected.id, {
        note: rescheduleNote.trim() || null,
        proposed_starts_at: rescheduleProposed
          ? new Date(rescheduleProposed).toISOString()
          : null,
      });
      setRescheduleNote("");
      setRescheduleProposed("");
      await load();
    } catch (err) {
      setError(err.message || "Reschedule request failed.");
    }
  };

  return (
    <section className="staff-schedule">
      <header className="staff-schedule__header">
        <p className="staff-schedule__eyebrow">Staff</p>
        <h1>My appointments</h1>
        <p>
          Your assigned visits plus new online bookings that are still
          unassigned (visible until an admin assigns them to someone).
        </p>
      </header>

      <div className="staff-schedule__toolbar">
        <div className="staff-schedule__tabs">
          <button
            type="button"
            className={view === "day" ? "is-active" : ""}
            onClick={() => setView("day")}
          >
            Day
          </button>
          <button
            type="button"
            className={view === "week" ? "is-active" : ""}
            onClick={() => setView("week")}
          >
            Week
          </button>
        </div>
        <div className="staff-schedule__nav">
          <button
            type="button"
            onClick={() => (view === "day" ? shiftDay(-1) : shiftWeek(-1))}
          >
            ← Prev
          </button>
          <button type="button" onClick={() => setAnchor(new Date())}>
            Today
          </button>
          <button
            type="button"
            onClick={() => (view === "day" ? shiftDay(1) : shiftWeek(1))}
          >
            Next →
          </button>
        </div>
        <button
          type="button"
          className="staff-schedule__refresh"
          onClick={load}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {period ? (
        <p className="staff-schedule__period">
          {new Date(period.from).toLocaleDateString()} —{" "}
          {new Date(period.to).toLocaleDateString()}
        </p>
      ) : null}

      {error ? <p className="staff-schedule__error">{error}</p> : null}

      {loading ? (
        <p className="staff-schedule__muted">Loading schedule…</p>
      ) : null}

      <div className="staff-schedule__layout">
        <div className="staff-schedule__calendar">
          {dayKeys.map((key) => (
            <section key={key} className="staff-schedule__day">
              <h2>{formatDisplayDate(key)}</h2>
              <ul>
                {(groupedByDay.get(key) ?? []).length === 0 ? (
                  <li className="staff-schedule__empty-day">No appointments</li>
                ) : (
                  (groupedByDay.get(key) ?? []).map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        className={`staff-schedule__slot ${selectedId === row.id ? "is-selected" : ""} ${row.viewer_is_assigned ? "" : "is-queue"}`}
                        onClick={() => setSelectedId(row.id)}
                      >
                        <span className="staff-schedule__slot-time">
                          {row.time_slot}
                        </span>
                        <span className="staff-schedule__slot-name">
                          {row.customer_name}
                        </span>
                        <span
                          className={`staff-schedule__pill staff-schedule__pill--${row.status}`}
                        >
                          {row.status}
                        </span>
                        {!row.viewer_is_assigned ? (
                          <span className="staff-schedule__queue-badge">
                            New — unassigned
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </section>
          ))}
        </div>

        <aside className="staff-schedule__detail">
          {!selected ? (
            <p className="staff-schedule__muted">
              Select an appointment to see customer details and actions.
            </p>
          ) : (
            <>
              <h2>{selected.customer_name}</h2>
              <p className="staff-schedule__muted">
                {selected.appointment_date} · {selected.time_slot}
              </p>
              <span
                className={`staff-schedule__pill staff-schedule__pill--${selected.status}`}
              >
                {selected.status}
              </span>

              <section className="staff-schedule__card">
                <h3>Customer</h3>
                <p>
                  <strong>Email:</strong> {selected.customer_email}
                </p>
                <p>
                  <strong>Phone:</strong> {selected.customer_phone}
                </p>
                <p>
                  <strong>People:</strong> {selected.number_of_people}
                </p>
              </section>

              <section className="staff-schedule__card">
                <h3>Services</h3>
                <p>{servicesLine(selected)}</p>
                <p>
                  <strong>Quoted:</strong> PHP{" "}
                  {Number(selected.quoted_total).toLocaleString()}
                </p>
              </section>

              <section className="staff-schedule__card">
                <h3>Customer notes</h3>
                <p>{selected.customer_notes || "—"}</p>
              </section>

              <section className="staff-schedule__card">
                <h3>Staff notes (log)</h3>
                <pre className="staff-schedule__notes">
                  {selected.staff_notes || "—"}
                </pre>
              </section>

              {!canAct ? (
                <section className="staff-schedule__card staff-schedule__card--notice">
                  <p>
                    <strong>New customer booking.</strong> Not assigned to you
                    yet — you can review details here. After an admin assigns
                    this appointment to you in the admin console, status and
                    notes will unlock.
                  </p>
                </section>
              ) : null}

              <section
                className={`staff-schedule__card ${!canAct ? "is-disabled" : ""}`}
              >
                <h3>Update status</h3>
                <div className="staff-schedule__actions">
                  <button
                    type="button"
                    disabled={!canAct}
                    onClick={() => handleStatus("ongoing")}
                  >
                    Ongoing
                  </button>
                  <button
                    type="button"
                    disabled={!canAct}
                    onClick={() => handleStatus("completed")}
                  >
                    Completed
                  </button>
                  <button
                    type="button"
                    className="is-muted"
                    disabled={!canAct}
                    onClick={() => handleStatus("no_show")}
                  >
                    No-show
                  </button>
                </div>
              </section>

              <section
                className={`staff-schedule__card ${!canAct ? "is-disabled" : ""}`}
              >
                <h3>Add note after service</h3>
                <textarea
                  rows={3}
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="What happened during the visit?"
                  disabled={!canAct}
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={!canAct || !noteDraft.trim()}
                >
                  Append note
                </button>
              </section>

              <section
                className={`staff-schedule__card ${!canAct ? "is-disabled" : ""}`}
              >
                <h3>Request reschedule</h3>
                <label>
                  Proposed start (optional)
                  <input
                    type="datetime-local"
                    value={rescheduleProposed}
                    onChange={(e) => setRescheduleProposed(e.target.value)}
                    disabled={!canAct}
                  />
                </label>
                <label>
                  Message to admin
                  <textarea
                    rows={2}
                    value={rescheduleNote}
                    onChange={(e) => setRescheduleNote(e.target.value)}
                    placeholder="Reason or preferred slots"
                    disabled={!canAct}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleRescheduleRequest}
                  disabled={!canAct}
                >
                  Submit request
                </button>
                {selected.reschedule_requested_at ? (
                  <p className="staff-schedule__muted">
                    Last request:{" "}
                    {new Date(
                      selected.reschedule_requested_at,
                    ).toLocaleString()}
                  </p>
                ) : null}
              </section>
            </>
          )}
        </aside>
      </div>
    </section>
  );
};

export default StaffSchedulePage;
