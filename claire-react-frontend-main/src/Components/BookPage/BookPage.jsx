import React, { useEffect, useMemo, useState } from "react";
import "./BookPage.css";
import ServiceCard from "./servicesButtons/ServiceCard";
import {
  createPublicAppointment,
  fetchAppointmentAvailability,
  fetchAppointmentCalendar,
  getCurrentUserApi,
} from "../../lib/api";
import { getStoredUser } from "../../lib/auth";

const STEPS = [
  { id: "services", label: "Services" },
  { id: "details", label: "Schedule" },
  { id: "review", label: "Review" },
];

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const makeGuestSlot = (index) => ({
  id: `guest-${index}-${Date.now()}`,
  label: `Guest ${index + 1}`,
  services: [],
});

const getTodayLocalYmd = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getMonthKey = (date) => date.slice(0, 7);

const buildCalendarGrid = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const firstWeekDay = firstDay.getDay();
  const totalDays = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = 0; i < firstWeekDay; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push(date);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

const BookPage = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [guestSlots, setGuestSlots] = useState([makeGuestSlot(0)]);
  const [activeGuestIndex, setActiveGuestIndex] = useState(0);

  const [calendarMonth, setCalendarMonth] = useState(getMonthKey(getTodayLocalYmd()));
  const [calendarData, setCalendarData] = useState({});
  const [calendarLabel, setCalendarLabel] = useState("");
  const [calendarLoading, setCalendarLoading] = useState(false);

  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [formData, setFormData] = useState(() => ({
    fullName: "",
    phoneNumber: "",
    emailAddress: "",
    appointmentDate: getTodayLocalYmd(),
    preferredTime: "",
    specialRequest: "",
  }));

  const [formErrors, setFormErrors] = useState({});
  const [bookingMessage, setBookingMessage] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const today = getTodayLocalYmd();

  const services = [
    { name: "Classic", price: 180, category: "Manicure" },
    { name: "Gel", price: 400, category: "Manicure" },
    { name: "Removal", price: 200, category: "Manicure" },
    { name: "Kiddie Classic", price: 90, category: "Manicure" },
    { name: "Classic", price: 200, category: "Pedicure" },
    { name: "Gel", price: 450, category: "Pedicure" },
    { name: "Removal", price: 200, category: "Pedicure" },
    { name: "Kiddie Classic", price: 110, category: "Pedicure" },
    { name: "Extension with Gel", price: 999, category: "Nail Art and Extension" },
    { name: "Removal", price: 300, category: "Nail Art and Extension" },
    { name: "Repair per Nail", price: 100, category: "Nail Art and Extension" },
    { name: "Nail Art", price: null, priceLabel: "Depends on design", category: "Nail Art and Extension" },
    { name: "Classic Hand Spa", price: 250, category: "Spa" },
    { name: "Classic Foot Spa", price: 299, category: "Spa" },
    { name: "Luxurious Hand Spa", price: 350, category: "Spa" },
    { name: "Luxurious Foot Spa", price: 400, category: "Spa" },
    { name: "Kiddie Classic Foot Spa", price: 149, category: "Spa" },
    { name: "Kiddie Bronze", price: 299, category: "Spa" },
    { name: "Hand Paraffin", price: 250, category: "Spa" },
    { name: "Foot Paraffin", price: 270, category: "Spa" },
    { name: "Hand and Foot Paraffin", price: 500, category: "Spa" },
    { name: "Ear Candling", price: 180, category: "Spa" },
    { name: "Lash Lift", price: 599, category: "Lashes and Brows" },
    { name: "Lash Tint", price: 199, category: "Lashes and Brows" },
    { name: "Removal", price: 299, category: "Lashes and Brows" },
    { name: "Brow Tint", price: 299, category: "Lashes and Brows" },
    { name: "Brow Lamination", price: 480, category: "Lashes and Brows" },
    { name: "Classic", price: 699, category: "Lash Extension" },
    { name: "Hybrid", price: 799, category: "Lash Extension" },
    { name: "Volume", price: 899, category: "Lash Extension" },
    { name: "Korean YY", price: 899, category: "Lash Extension" },
    { name: "Anime/Wispy", price: 1199, category: "Lash Extension" },
    { name: "Fox Eye/Megavolume", price: 1199, category: "Lash Extension" },
    { name: "Upper Lip", price: 199, category: "Threading" },
    { name: "Lower Lip", price: 199, category: "Threading" },
    { name: "Brows", price: 200, category: "Threading" },
    { name: "Upper Lip", price: 699, category: "Hair Waxing" },
    { name: "Lower Lip", price: 799, category: "Hair Waxing" },
    { name: "Underarm", price: 899, category: "Hair Waxing" },
    { name: "Half Leg", price: 899, category: "Hair Waxing" },
    { name: "Full Leg", price: 1199, category: "Hair Waxing" },
    { name: "Bikini", price: 1199, category: "Hair Waxing" },
    { name: "Brazilian", price: 599, category: "Hair Waxing" },
    { name: "BB Glow", price: 1499, category: "Semi-Permanent Make-Up, SPMU" },
    { name: "BB Blush", price: 999, category: "Semi-Permanent Make-Up, SPMU" },
    { name: "BB Glow plus BB Blush", price: 1999, category: "Semi-Permanent Make-Up, SPMU" },
    { name: "2 Sessions Microblading", price: 2499, category: "Semi-Permanent Make-Up, SPMU" },
    { name: "Microshading", price: 3499, category: "Semi-Permanent Make-Up, SPMU" },
    { name: "Combination Brows", price: 3999, category: "Semi-Permanent Make-Up, SPMU" },
    { name: "Brow Reconstruction", price: 4999, category: "Semi-Permanent Make-Up, SPMU" },
    { name: "Lips", price: 3999, category: "Semi-Permanent Make-Up, SPMU" },
  ];

  const getServiceId = (service) => `${service.category}-${service.name}`;

  useEffect(() => {
    let cancelled = false;

    const mergeProfile = (user) => {
      if (!user?.email) return;

      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName.trim() ? prev.fullName : user.name ?? "",
        emailAddress: prev.emailAddress.trim() ? prev.emailAddress : user.email ?? "",
      }));
    };

    const load = async () => {
      const cached = getStoredUser();

      try {
        const user = await getCurrentUserApi();
        if (cancelled) return;

        try {
          localStorage.setItem("claire_user", JSON.stringify(user));
        } catch {}

        mergeProfile(user);
      } catch {
        if (!cancelled) mergeProfile(cached);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setGuestSlots((prev) => {
      const next = [];

      for (let i = 0; i < numberOfPeople; i += 1) {
        if (prev[i]) {
          next.push({ ...prev[i], label: `Guest ${i + 1}` });
        } else {
          next.push(makeGuestSlot(i));
        }
      }

      return next;
    });

    setActiveGuestIndex((i) => Math.min(Math.max(i, 0), numberOfPeople - 1));
  }, [numberOfPeople]);

  useEffect(() => {
    let active = true;

    const loadCalendar = async () => {
      setCalendarLoading(true);

      try {
        const data = await fetchAppointmentCalendar(calendarMonth);
        if (!active) return;

        setCalendarData(data?.days || {});
        setCalendarLabel(data?.label || "");
      } catch {
        if (!active) return;
        setCalendarData({});
        setCalendarLabel("");
      } finally {
        if (active) setCalendarLoading(false);
      }
    };

    loadCalendar();

    return () => {
      active = false;
    };
  }, [calendarMonth]);

  useEffect(() => {
    let active = true;

    const loadAvailability = async () => {
      if (!formData.appointmentDate) {
        setAvailableSlots([]);
        return;
      }

      setSlotsLoading(true);

      try {
        const data = await fetchAppointmentAvailability(formData.appointmentDate);
        if (!active) return;

        const slots = Array.isArray(data?.slots) ? data.slots : [];
        setAvailableSlots(slots);

        const stillAvailable = slots.some(
          (slot) => slot.available && slot.value === formData.preferredTime,
        );

        if (!stillAvailable) {
          const firstAvailable = slots.find((slot) => slot.available);
          setFormData((prev) => ({
            ...prev,
            preferredTime: firstAvailable?.value || "",
          }));
        }
      } catch {
        if (!active) return;
        setAvailableSlots([]);
      } finally {
        if (active) setSlotsLoading(false);
      }
    };

    loadAvailability();

    return () => {
      active = false;
    };
  }, [formData.appointmentDate]);

  const activeGuestServices = guestSlots[activeGuestIndex]?.services ?? [];

  const handleServiceToggle = (service) => {
    setFormErrors((current) => ({
      ...current,
      selectedServices: "",
    }));

    setGuestSlots((slots) =>
      slots.map((guest, index) => {
        if (index !== activeGuestIndex) return guest;

        const selected = guest.services.some(
          (item) => getServiceId(item) === getServiceId(service),
        );

        if (selected) {
          return {
            ...guest,
            services: guest.services.filter(
              (item) => getServiceId(item) !== getServiceId(service),
            ),
          };
        }

        return {
          ...guest,
          services: [...guest.services, service],
        };
      }),
    );
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setFormErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const quotedTotal = useMemo(
    () =>
      guestSlots.reduce(
        (sum, guest) =>
          sum +
          guest.services.reduce(
            (serviceSum, item) => serviceSum + (typeof item.price === "number" ? item.price : 0),
            0,
          ),
        0,
      ),
    [guestSlots],
  );

  const validateServicesStep = () => {
    const errors = {};
    const emptyGuests = guestSlots
      .map((guest, index) => (guest.services.length === 0 ? index + 1 : null))
      .filter(Boolean);

    if (emptyGuests.length > 0) {
      errors.selectedServices = `Add at least one service for: Guest ${emptyGuests.join(", Guest ")}.`;
    }

    return errors;
  };

  const validateDetailsStep = () => {
    const errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[\d+\s()-]{7,20}$/;

    if (!formData.fullName.trim()) errors.fullName = "Full name is required.";
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required.";
    } else if (!phonePattern.test(formData.phoneNumber.trim())) {
      errors.phoneNumber = "Enter a valid phone number.";
    }

    if (!formData.emailAddress.trim()) {
      errors.emailAddress = "Email address is required.";
    } else if (!emailPattern.test(formData.emailAddress.trim())) {
      errors.emailAddress = "Enter a valid email address.";
    }

    if (!formData.appointmentDate) {
      errors.appointmentDate = "Please choose a date.";
    } else if (formData.appointmentDate < today) {
      errors.appointmentDate = "Appointment date cannot be in the past.";
    }

    if (!formData.preferredTime.trim()) {
      errors.preferredTime = "Please choose an available time slot.";
    }

    return errors;
  };

  const goNext = () => {
    setBookingMessage("");

    if (stepIndex === 0) {
      const errors = validateServicesStep();
      if (Object.keys(errors).length > 0) {
        setFormErrors((current) => ({ ...current, ...errors }));
        return;
      }
      setFormErrors({});
      setStepIndex(1);
      return;
    }

    if (stepIndex === 1) {
      const errors = validateDetailsStep();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      setFormErrors({});
      setStepIndex(2);
    }
  };

  const goBack = () => {
    setBookingMessage("");
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleConfirmBooking = async () => {
    const serviceErrors = validateServicesStep();
    const detailErrors = validateDetailsStep();
    const merged = { ...serviceErrors, ...detailErrors };

    if (Object.keys(merged).length > 0) {
      setFormErrors(merged);
      setStepIndex(Object.keys(serviceErrors).length > 0 ? 0 : 1);
      return;
    }

    setFormErrors({});
    setBookingMessage("");
    setIsSubmittingBooking(true);

    const guestsPayload = guestSlots.map((guest) => ({
      label: guest.label,
      services: guest.services.map((item) => ({
        name: item.name,
        category: item.category,
        price: typeof item.price === "number" ? item.price : null,
      })),
    }));

    const payload = {
      customer_name: formData.fullName.trim(),
      customer_email: formData.emailAddress.trim(),
      customer_phone: formData.phoneNumber.trim(),
      guests: guestsPayload,
      number_of_people: numberOfPeople,
      quoted_total: quotedTotal,
      appointment_date: formData.appointmentDate,
      preferred_time: formData.preferredTime.trim(),
      customer_notes: formData.specialRequest.trim() || null,
    };

    try {
      await createPublicAppointment(payload);
      setBookingMessage("Booking submitted! We will confirm your appointment soon.");
    } catch (err) {
      setBookingMessage(err.message || "Booking failed. Please try again.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const serviceCategories = [...new Set(services.map((service) => service.category))];
  const calendarCells = buildCalendarGrid(calendarMonth);

  const selectedDaySummary = calendarData[formData.appointmentDate] || null;

  const changeMonth = (offset) => {
    const [year, month] = calendarMonth.split("-").map(Number);
    const next = new Date(year, month - 1 + offset, 1);
    const nextMonthKey = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
    setCalendarMonth(nextMonthKey);

    const nextDate = `${nextMonthKey}-${String(Math.min(1, 1)).padStart(2, "0")}`;
    if (!formData.appointmentDate.startsWith(nextMonthKey)) {
      setFormData((prev) => ({
        ...prev,
        appointmentDate: nextDate,
        preferredTime: "",
      }));
    }
  };

  return (
    <div id="book" className="book-layout">
      <div className="book-main">
        <div className="book-step-tabs">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              type="button"
              className={`book-step-tab ${stepIndex === index ? "is-active" : ""}`}
              onClick={() => setStepIndex(index)}
            >
              <span>{index + 1}</span>
              {step.label}
            </button>
          ))}
        </div>

        {stepIndex === 0 && (
          <section className="book-card">
            <div className="book-card-header">
              <div>
                <p className="book-eyebrow">Step 1</p>
                <h2>Choose services</h2>
                <p className="book-subcopy">Select services first before choosing a date.</p>
              </div>

              <label className="book-party-size">
                <span>Party size</span>
                <select value={numberOfPeople} onChange={(e) => setNumberOfPeople(Number(e.target.value))}>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </label>
            </div>

            {numberOfPeople > 1 && (
              <div className="book-guest-tabs">
                {guestSlots.map((guest, index) => (
                  <button
                    key={guest.id}
                    type="button"
                    className={`book-guest-tab ${activeGuestIndex === index ? "is-active" : ""}`}
                    onClick={() => setActiveGuestIndex(index)}
                  >
                    {guest.label}
                    <span>{guest.services.length}</span>
                  </button>
                ))}
              </div>
            )}

            {serviceCategories.map((category) => (
              <div key={category} className="book-category-block">
                <h3>{category}</h3>
                <div className="book-category-grid">
                  {services
                    .filter((service) => service.category === category)
                    .map((service) => (
                      <ServiceCard
                        key={getServiceId(service)}
                        service={service}
                        onToggle={handleServiceToggle}
                        isSelected={activeGuestServices.some(
                          (item) => getServiceId(item) === getServiceId(service),
                        )}
                      />
                    ))}
                </div>
              </div>
            ))}

            {formErrors.selectedServices && (
              <p className="book-error">{formErrors.selectedServices}</p>
            )}

            <div className="book-action-row">
              <button type="button" className="book-primary-btn" onClick={goNext}>
                Continue to schedule
              </button>
            </div>
          </section>
        )}

        {stepIndex === 1 && (
          <section className="book-card">
            <div className="book-card-header">
              <div>
                <p className="book-eyebrow">Step 2</p>
                <h2>Choose date and time</h2>
                <p className="book-subcopy">See which dates are available before choosing a time slot.</p>
              </div>
            </div>

            <div className="book-schedule-grid">
              <div className="book-calendar-card">
                <div className="book-calendar-head">
                  <button type="button" onClick={() => changeMonth(-1)}>‹</button>
                  <h3>{calendarLabel || calendarMonth}</h3>
                  <button type="button" onClick={() => changeMonth(1)}>›</button>
                </div>

                <div className="book-week-row">
                  {WEEK_DAYS.map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>

                <div className="book-calendar-grid">
                  {calendarCells.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="book-calendar-empty" />;
                    }

                    const info = calendarData[date];
                    const status = info?.status || "available";
                    const isSelected = formData.appointmentDate === date;
                    const isPast = date < today;

                    return (
                      <button
                        key={date}
                        type="button"
                        disabled={isPast}
                        className={`book-calendar-day status-${status} ${isSelected ? "is-selected" : ""}`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            appointmentDate: date,
                            preferredTime: "",
                          }))
                        }
                      >
                        <strong>{info?.day || Number(date.slice(8, 10))}</strong>
                        <small>
                          {status === "fully_booked"
                            ? "Fully booked"
                            : status === "partially_booked"
                            ? "Partly booked"
                            : "Available"}
                        </small>
                      </button>
                    );
                  })}
                </div>

                <div className="book-legend">
                  <span><i className="legend available" /> Available</span>
                  <span><i className="legend partial" /> Partly booked</span>
                  <span><i className="legend full" /> Fully booked</span>
                </div>
              </div>

              <div className="book-details-card">
                <div className="book-form-grid">
                  <label>
                    <span>Full Name</span>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                    {formErrors.fullName && <small className="book-error">{formErrors.fullName}</small>}
                  </label>

                  <label>
                    <span>Phone Number</span>
                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
                    {formErrors.phoneNumber && <small className="book-error">{formErrors.phoneNumber}</small>}
                  </label>

                  <label>
                    <span>Email Address</span>
                    <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleInputChange} />
                    {formErrors.emailAddress && <small className="book-error">{formErrors.emailAddress}</small>}
                  </label>

                  <label>
                    <span>Appointment Date</span>
                    <input type="date" name="appointmentDate" min={today} value={formData.appointmentDate} onChange={handleInputChange} />
                    {formErrors.appointmentDate && <small className="book-error">{formErrors.appointmentDate}</small>}
                  </label>
                </div>

                <div className="book-day-summary">
                  <h4>Selected date</h4>
                  <p>{formData.appointmentDate}</p>
                  <p>
                    {selectedDaySummary
                      ? `${selectedDaySummary.available_slots} of ${selectedDaySummary.total_slots} slots available`
                      : "Loading date status..."}
                  </p>
                </div>

                <div className="book-slot-section">
                  <h4>Available Time Slots</h4>
                  {slotsLoading ? <p className="book-subcopy">Loading available slots...</p> : null}

                  <div className="book-slot-grid">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        disabled={!slot.available}
                        className={`book-slot-btn ${formData.preferredTime === slot.value ? "is-selected" : ""}`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            preferredTime: slot.value,
                          }))
                        }
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>

                  {formErrors.preferredTime && <small className="book-error">{formErrors.preferredTime}</small>}
                </div>

                <label className="book-textarea">
                  <span>Special Request</span>
                  <textarea name="specialRequest" rows={4} value={formData.specialRequest} onChange={handleInputChange} />
                </label>

                <div className="book-action-row">
                  <button type="button" className="book-secondary-btn" onClick={goBack}>
                    Back
                  </button>
                  <button type="button" className="book-primary-btn" onClick={goNext}>
                    Review booking
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {stepIndex === 2 && (
          <section className="book-card">
            <div className="book-card-header">
              <div>
                <p className="book-eyebrow">Step 3</p>
                <h2>Review your booking</h2>
                <p className="book-subcopy">Check everything before submitting.</p>
              </div>
            </div>

            <div className="book-review-grid">
              <div className="book-review-block">
                <h3>Customer details</h3>
                <p><strong>Name:</strong> {formData.fullName || "—"}</p>
                <p><strong>Phone:</strong> {formData.phoneNumber || "—"}</p>
                <p><strong>Email:</strong> {formData.emailAddress || "—"}</p>
              </div>

              <div className="book-review-block">
                <h3>Schedule</h3>
                <p><strong>Date:</strong> {formData.appointmentDate || "—"}</p>
                <p><strong>Time:</strong> {formData.preferredTime || "—"}</p>
                <p><strong>Party size:</strong> {numberOfPeople}</p>
              </div>

              <div className="book-review-block book-review-services">
                <h3>Selected services</h3>
                {guestSlots.map((guest) => (
                  <div key={guest.id} className="book-review-guest">
                    <h4>{guest.label}</h4>
                    <ul>
                      {guest.services.map((service) => (
                        <li key={`${guest.id}-${getServiceId(service)}`}>
                          {service.name} — {service.category}
                          {typeof service.price === "number" ? ` (PHP ${service.price})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {bookingMessage && (
              <p className={`book-message ${bookingMessage.toLowerCase().includes("submitted") ? "is-success" : "is-error"}`}>
                {bookingMessage}
              </p>
            )}

            <div className="book-action-row">
              <button type="button" className="book-secondary-btn" onClick={goBack}>
                Back
              </button>
              <button
                type="button"
                className="book-primary-btn"
                onClick={handleConfirmBooking}
                disabled={isSubmittingBooking}
              >
                {isSubmittingBooking ? "Submitting..." : "Confirm booking"}
              </button>
            </div>
          </section>
        )}
      </div>

      <aside className="book-sidebar">
        <div className="book-summary-card">
          <p className="book-eyebrow">Booking Summary</p>
          <h3>Claire Beauty Lounge</h3>
          <p className="book-summary-copy">
            Cleaner scheduling, faster date checking, and a better booking flow.
          </p>

          <div className="book-summary-line">
            <span>Guests</span>
            <strong>{numberOfPeople}</strong>
          </div>

          <div className="book-summary-line">
            <span>Date</span>
            <strong>{formData.appointmentDate || "Not set"}</strong>
          </div>

          <div className="book-summary-line">
            <span>Time</span>
            <strong>{formData.preferredTime || "Select a slot"}</strong>
          </div>

          <div className="book-summary-line">
            <span>Total</span>
            <strong>PHP {quotedTotal.toLocaleString()}</strong>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default BookPage;