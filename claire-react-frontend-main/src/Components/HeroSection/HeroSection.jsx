import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";
import { fetchCurrentServiceApi } from "../../lib/api";

const heroSpaImage =
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80";

const CONTACT_OPTIONS = [
  {
    label: "Claire Beauty Lounge Quezon City",
    url: "https://www.facebook.com/profile.php?id=61587237901341",
  },
  {
    label: "Claire Beauty Lounge SJDM-Bulacan",
    url: "https://www.facebook.com/CLAIRElounge",
  },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [serviceInfo, setServiceInfo] = useState({
    count: 0,
    customers: [],
    message: "No customer is being served right now.",
  });

  useEffect(() => {
    let mounted = true;

    const loadCurrentService = async () => {
      try {
        const data = await fetchCurrentServiceApi();

        if (!mounted) return;

        setServiceInfo({
          count: Number(data?.count || 0),
          customers: Array.isArray(data?.customers) ? data.customers : [],
          message: data?.message || "No customer is being served right now.",
        });
      } catch {
        if (!mounted) return;

        setServiceInfo({
          count: 0,
          customers: [],
          message: "No customer is being served right now.",
        });
      }
    };

    loadCurrentService();
    const interval = setInterval(loadCurrentService, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const openFacebookPage = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setIsContactOpen(false);
  };

  return (
    <section className="Hero" id="home">
      <div className="hero-inner">
        <div className="hero-left">
          <p className="hero-kicker">Claire Beauty Lounge</p>
          <h1>Give yourself a little pampering</h1>
          <p className="hero-subtitle">
            Relax, sit back, get your nails done—we got you.
          </p>

          <div className="left-buttons">
            <button
              className="button1"
              type="button"
              onClick={() => setIsContactOpen(true)}
            >
              CONTACT US
            </button>

            <button
              className="button2"
              type="button"
              onClick={() => navigate("/page1")}
            >
              BOOK NOW
            </button>
          </div>

          <div className="card">
            <div className="card-top">
              <div className="hero__dot" aria-hidden="true" />
              <div className="hero__cardLabel">CURRENTLY SERVICING</div>
            </div>

            {serviceInfo.customers.length === 0 ? (
              <>
                <div className="card-mid">No active customer</div>
                <div className="card-bottom">{serviceInfo.message}</div>
              </>
            ) : (
              <>
                <div className="currently-servicing-list">
                  {serviceInfo.customers.map((customer) => (
                    <div className="currently-servicing-item" key={customer.id}>
                      <div className="card-mid">{customer.customer_name}</div>
                      <div className="card-bottom">
                        {customer.number_of_people === 1
                          ? "1 customer is currently in service."
                          : `${customer.number_of_people} customers are currently in service.`}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card-bottom currently-servicing-summary">
                  {serviceInfo.message}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="hero-right" aria-hidden="true">
          <div className="hero-image-frame">
            <img
              src={heroSpaImage}
              alt="Luxury spa ambiance"
              className="hero-image"
            />
          </div>
        </div>
      </div>

      {isContactOpen ? (
        <div
          className="contact-modal-backdrop"
          onClick={() => setIsContactOpen(false)}
        >
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <p className="contact-modal__eyebrow">Claire Beauty Lounge</p>
            <h3>Select a branch</h3>
            <p className="contact-modal__text">
              Choose the Facebook page you want to open.
            </p>

            <div className="contact-modal__actions">
              {CONTACT_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  className="contact-modal__button"
                  onClick={() => openFacebookPage(option.url)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="contact-modal__close"
              onClick={() => setIsContactOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default HeroSection;