import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./AdminAppointmentsPage.css";
import {
  cancelAdminAppointment,
  createAdminAppointment,
  fetchAdminAppointments,
  fetchAdminReportsSummary,
  updateAdminAppointment,
} from "../lib/api";

const STATUSES = [
  "pending",
  "confirmed",
  "ongoing",
  "completed",
  "no_show",
  "cancelled",
];

const EMPTY_SERVICE = {
  name: "",
  category: "",
  price: 0,
};

const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState(null);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [formMode, setFormMode] = useState(null);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    number_of_people: 1,
    quoted_total: 0,
    appointment_date: "",
    time_slot: "",
    status: "pending",
    customer_notes: "",
    services: [{ ...EMPTY_SERVICE }],
  });

  const loadAppointments = useCallback(async () => {
    const data = await fetchAdminAppointments({
      from: filterFrom || undefined,
      to: filterTo || undefined,
      status: filterStatus || undefined,
    });

    const rows = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.appointments)
          ? data.appointments
          : [];

    setAppointments(rows);
    return rows;
  }, [filterFrom, filterTo, filterStatus]);

  const loadReports = useCallback(async () => {
    const data = await fetchAdminReportsSummary({
      from: reportFrom || undefined,
      to: reportTo || undefined,
    });

    setReports(data || null);
    return data;
  }, [reportFrom, reportTo]);

  const refreshAll = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      await Promise.all([loadAppointments(), loadReports()]);
    } catch (err) {
      setError(err?.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }, [loadAppointments, loadReports]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const calculateServicesTotal = useCallback((services) => {
    return services.reduce((sum, service) => {
      return sum + Number(service?.price || 0);
    }, 0);
  }, []);

  const normalizeServices = useCallback((services) => {
    return services
      .map((service) => ({
        name: String(service?.name || "").trim(),
        category: String(service?.category || "").trim(),
        price: Number(service?.price || 0),
      }))
      .filter((service) => service.name && service.category);
  }, []);

  const resetForm = () => {
    setForm({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      number_of_people: 1,
      quoted_total: 0,
      appointment_date: "",
      time_slot: "",
      status: "pending",
      customer_notes: "",
      services: [{ ...EMPTY_SERVICE }],
    });
  };

  const openCreate = () => {
    setFormMode("create");
    setSelectedId(null);
    resetForm();
  };

  const openEdit = (row) => {
    const rowServices =
      Array.isArray(row.services) && row.services.length > 0
        ? row.services.map((service) => ({
            name: service?.name || "",
            category: service?.category || "",
            price: Number(service?.price || 0),
          }))
        : [{ ...EMPTY_SERVICE }];

    setFormMode("edit");
    setSelectedId(row.id);
    setForm({
      customer_name: row.customer_name || "",
      customer_email: row.customer_email || "",
      customer_phone: row.customer_phone || "",
      number_of_people: row.number_of_people || 1,
      quoted_total: Number(row.quoted_total || 0),
      appointment_date: row.appointment_date || "",
      time_slot: row.time_slot || "",
      status: row.status || "pending",
      customer_notes: row.customer_notes || "",
      services: rowServices,
    });
  };

  const updateServiceField = (index, field, value) => {
    setForm((prev) => {
      const nextServices = [...prev.services];
      nextServices[index] = {
        ...nextServices[index],
        [field]: field === "price" ? Number(value || 0) : value,
      };

      return {
        ...prev,
        services: nextServices,
        quoted_total: calculateServicesTotal(nextServices),
      };
    });
  };

  const addServiceLine = () => {
    setForm((prev) => {
      const nextServices = [...prev.services, { ...EMPTY_SERVICE }];
      return {
        ...prev,
        services: nextServices,
        quoted_total: calculateServicesTotal(nextServices),
      };
    });
  };

  const removeServiceLine = (index) => {
    setForm((prev) => {
      const nextServices =
        prev.services.length > 1
          ? prev.services.filter((_, i) => i !== index)
          : [{ ...EMPTY_SERVICE }];

      return {
        ...prev,
        services: nextServices,
        quoted_total: calculateServicesTotal(nextServices),
      };
    });
  };

  const buildPayload = () => {
    const cleanedServices = normalizeServices(form.services);

    if (cleanedServices.length === 0) {
      throw new Error("Please add at least one complete service.");
    }

    const computedTotal = calculateServicesTotal(cleanedServices);

    return {
      customer_name: form.customer_name,
      customer_email: form.customer_email,
      customer_phone: form.customer_phone,
      number_of_people: Number(form.number_of_people),
      quoted_total: computedTotal,
      appointment_date: form.appointment_date,
      time_slot: form.time_slot,
      status: form.status,
      customer_notes: form.customer_notes || null,
      staff_notes: null,
      services: cleanedServices,
      guests: null,
      schedule_overridden: false,
      assigned_staff_id: null,
    };
  };

  const handleSave = async () => {
    setError("");

    try {
      const payload = buildPayload();

      if (formMode === "create") {
        await createAdminAppointment(payload);
      } else if (formMode === "edit" && selectedId) {
        await updateAdminAppointment(selectedId, payload);
      }

      setFormMode(null);
      setSelectedId(null);
      resetForm();
      await refreshAll();
    } catch (err) {
      setError(err?.message || "Save failed.");
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Cancel this appointment?")) {
      return;
    }

    setError("");

    try {
      await cancelAdminAppointment(id);
      await refreshAll();
    } catch (err) {
      setError(err?.message || "Cancel failed.");
    }
  };

  const completedRevenue = useMemo(() => {
    return appointments
      .filter((item) => String(item.status).toLowerCase() === "completed")
      .reduce((sum, item) => sum + Number(item.quoted_total || 0), 0);
  }, [appointments]);

  const completedCount = useMemo(() => {
    return appointments.filter(
      (item) => String(item.status).toLowerCase() === "completed"
    ).length;
  }, [appointments]);

  const reportRevenue = Number(reports?.revenue_completed || 0);
  const revenueToDisplay =
    reportRevenue > 0 || reports ? reportRevenue : completedRevenue;

  const printableServicesText = (row) => {
    if (Array.isArray(row.services) && row.services.length > 0) {
      return row.services
        .map((service) => {
          const category = service?.category ? `${service.category}: ` : "";
          const name = service?.name || "Service";
          const price =
            service?.price !== undefined && service?.price !== null
              ? ` (PHP ${Number(service.price).toLocaleString()})`
              : "";
          return `${category}${name}${price}`;
        })
        .join("<br/>");
    }

    return "Service details not available";
  };

  const printReceipt = (row) => {
    const receiptWindow = window.open("", "_blank", "width=900,height=700");

    if (!receiptWindow) {
      window.alert("Pop-up blocked. Please allow pop-ups to print the receipt.");
      return;
    }

    const total = Number(row.quoted_total || 0).toLocaleString();
    const people = Number(row.number_of_people || 1);
    const servicesHtml = printableServicesText(row);

    receiptWindow.document.write(`
      <html>
        <head>
          <title>Claire Beauty Lounge Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #231f15;
              padding: 32px;
              line-height: 1.5;
            }
            .receipt {
              max-width: 760px;
              margin: 0 auto;
              border: 1px solid #d7c79e;
              border-radius: 14px;
              padding: 28px;
            }
            .head {
              text-align: center;
              margin-bottom: 28px;
            }
            .head h1 {
              margin: 0 0 8px;
              color: #897a42;
              font-size: 30px;
            }
            .head p {
              margin: 0;
              color: #5c4f28;
            }
            .section-title {
              margin: 22px 0 8px;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #897a42;
              font-weight: bold;
            }
            .row {
              display: flex;
              justify-content: space-between;
              gap: 20px;
              border-bottom: 1px solid #eee2bf;
              padding: 8px 0;
            }
            .row strong {
              min-width: 180px;
            }
            .services-box {
              border: 1px solid #e7d9b3;
              border-radius: 10px;
              padding: 12px;
              background: #fffdfa;
            }
            .total {
              margin-top: 24px;
              font-size: 22px;
              font-weight: bold;
              color: #897a42;
              text-align: right;
            }
            .footer {
              margin-top: 28px;
              text-align: center;
              color: #6b6248;
              font-size: 13px;
            }
            @media print {
              body {
                padding: 0;
              }
              .receipt {
                border: none;
                border-radius: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="head">
              <h1>Claire Beauty Lounge</h1>
              <p>Appointment Receipt</p>
            </div>

            <div class="section-title">Customer Information</div>
            <div class="row"><strong>Name</strong><span>${row.customer_name || "-"}</span></div>
            <div class="row"><strong>Email</strong><span>${row.customer_email || "-"}</span></div>
            <div class="row"><strong>Phone</strong><span>${row.customer_phone || "-"}</span></div>

            <div class="section-title">Booking Details</div>
            <div class="row"><strong>Appointment Date</strong><span>${row.appointment_date || "-"}</span></div>
            <div class="row"><strong>Time Slot</strong><span>${row.time_slot || "-"}</span></div>
            <div class="row"><strong>Status</strong><span>${row.status || "-"}</span></div>
            <div class="row"><strong>Number of People</strong><span>${people}</span></div>

            <div class="section-title">Services</div>
            <div class="services-box">${servicesHtml}</div>

            ${
              row.customer_notes
                ? `
                <div class="section-title">Customer Notes</div>
                <div class="services-box">${row.customer_notes}</div>
              `
                : ""
            }

            <div class="total">Total: PHP ${total}</div>

            <div class="footer">
              This receipt was printed from the admin portal.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    receiptWindow.document.close();
  };

  return (
    <section className="admin-appts">
      <header className="admin-appts__header">
        <p className="admin-appts__eyebrow">Admin</p>
        <h1>Appointments &amp; reports</h1>
        <p>Full control over bookings and salon analytics.</p>

        <div className="admin-appts__header-actions">
          <button
            type="button"
            className="admin-appts__btn admin-appts__btn--primary"
            onClick={openCreate}
          >
            New appointment
          </button>

          <button
            type="button"
            className="admin-appts__btn"
            onClick={refreshAll}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </header>

      {error ? <p className="admin-appts__error">{error}</p> : null}

      <section className="admin-appts__reports">
        <h2>Reports &amp; analytics</h2>

        <div className="admin-appts__filters">
          <label>
            From
            <input
              type="date"
              value={reportFrom}
              onChange={(e) => setReportFrom(e.target.value)}
            />
          </label>

          <label>
            To
            <input
              type="date"
              value={reportTo}
              onChange={(e) => setReportTo(e.target.value)}
            />
          </label>

          <button
            type="button"
            className="admin-appts__btn"
            onClick={loadReports}
          >
            Apply
          </button>
        </div>

        <div className="admin-appts__report-note">
          Revenue is based on completed bookings only.
        </div>

        <div className="admin-appts__report-grid">
          <article>
            <h3>Bookings</h3>
            <strong>{reports?.booking_count ?? appointments.length}</strong>
            <span>in selected period</span>
          </article>

          <article>
            <h3>Revenue (completed)</h3>
            <strong>PHP {revenueToDisplay.toLocaleString()}</strong>
            <span>sum of completed bookings only</span>
          </article>

          <article>
            <h3>Completed bookings</h3>
            <strong>{completedCount}</strong>
            <span>used in revenue calculation</span>
          </article>

          <article className="admin-appts__report-popular">
            <h3>Popular services</h3>
            <ul>
              {(reports?.popular_services ?? []).map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <span>{row.count}</span>
                </li>
              ))}
              {(!reports?.popular_services ||
                reports.popular_services.length === 0) && (
                <li>
                  <span>No data yet</span>
                  <span>0</span>
                </li>
              )}
            </ul>
          </article>
        </div>
      </section>

      <section className="admin-appts__list-section">
        <div className="admin-appts__list-head">
          <h2>All bookings</h2>

          <div className="admin-appts__filters">
            <label>
              From
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
              />
            </label>

            <label>
              To
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
              />
            </label>

            <label>
              Status
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="admin-appts__btn"
              onClick={loadAppointments}
            >
              Apply filters
            </button>
          </div>
        </div>

        <div className="admin-appts__table-wrap">
          <table className="admin-appts__table">
            <thead>
              <tr>
                <th>When</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {appointments.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.appointment_date}</strong>
                    <span>{row.time_slot}</span>
                  </td>

                  <td>
                    <strong>{row.customer_name}</strong>
                    <span>{row.customer_email}</span>
                  </td>

                  <td>
                    <span
                      className={`admin-appts__pill admin-appts__pill--${row.status}`}
                    >
                      {row.status}
                    </span>
                  </td>

                  <td>PHP {Number(row.quoted_total || 0).toLocaleString()}</td>

                  <td className="admin-appts__row-actions">
                    <button
                      type="button"
                      className="admin-appts__linkish"
                      onClick={() => openEdit(row)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="admin-appts__linkish"
                      onClick={() => printReceipt(row)}
                    >
                      Print Receipt
                    </button>

                    {row.status !== "cancelled" ? (
                      <button
                        type="button"
                        className="admin-appts__linkish admin-appts__linkish--danger"
                        onClick={() => handleCancelBooking(row.id)}
                      >
                        Cancel
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && appointments.length === 0 ? (
            <p className="admin-appts__muted">
              No appointments match your filters.
            </p>
          ) : null}
        </div>
      </section>

      {formMode ? (
        <div
          className="admin-appts__drawer-backdrop"
          role="presentation"
          onClick={() => setFormMode(null)}
        >
          <div
            className="admin-appts__drawer"
            role="dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-appts__drawer-head">
              <h2>
                {formMode === "create" ? "Create appointment" : "Edit appointment"}
              </h2>

              <button
                type="button"
                className="admin-appts__icon-btn"
                onClick={() => setFormMode(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="admin-appts__form-grid">
              <label>
                Customer name
                <input
                  value={form.customer_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customer_name: e.target.value }))
                  }
                />
              </label>

              <label>
                Email
                <input
                  value={form.customer_email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customer_email: e.target.value }))
                  }
                />
              </label>

              <label>
                Phone
                <input
                  value={form.customer_phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customer_phone: e.target.value }))
                  }
                />
              </label>

              <label>
                People
                <input
                  type="number"
                  min={1}
                  value={form.number_of_people}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, number_of_people: e.target.value }))
                  }
                />
              </label>

              <label>
                Quoted total (PHP)
                <input type="number" value={form.quoted_total} readOnly />
              </label>

              <label>
                Date
                <input
                  type="date"
                  value={form.appointment_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, appointment_date: e.target.value }))
                  }
                />
              </label>

              <label>
                Time slot
                <input
                  value={form.time_slot}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, time_slot: e.target.value }))
                  }
                  placeholder="e.g. 2:00 PM"
                />
              </label>

              <label>
                Status
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <div className="admin-appts__full admin-appts__services-editor">
                <div className="admin-appts__services-head">
                  <h3>Services</h3>
                  <button
                    type="button"
                    className="admin-appts__btn"
                    onClick={addServiceLine}
                  >
                    Add service
                  </button>
                </div>

                <div className="admin-appts__services-list">
                  {form.services.map((service, index) => (
                    <div className="admin-appts__service-row" key={index}>
                      <label>
                        Service name
                        <input
                          value={service.name}
                          onChange={(e) =>
                            updateServiceField(index, "name", e.target.value)
                          }
                          placeholder="e.g. Gel Polish"
                        />
                      </label>

                      <label>
                        Category
                        <input
                          value={service.category}
                          onChange={(e) =>
                            updateServiceField(index, "category", e.target.value)
                          }
                          placeholder="e.g. Manicure"
                        />
                      </label>

                      <label>
                        Price
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={service.price}
                          onChange={(e) =>
                            updateServiceField(index, "price", e.target.value)
                          }
                          placeholder="0.00"
                        />
                      </label>

                      <button
                        type="button"
                        className="admin-appts__remove-service"
                        onClick={() => removeServiceLine(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <label className="admin-appts__full">
                Customer notes
                <textarea
                  rows={4}
                  value={form.customer_notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customer_notes: e.target.value }))
                  }
                  placeholder="Add notes here"
                />
              </label>
            </div>

            <div className="admin-appts__drawer-actions">
              <button
                type="button"
                className="admin-appts__btn"
                onClick={() => setFormMode(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="admin-appts__btn admin-appts__btn--primary"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default AdminAppointmentsPage;