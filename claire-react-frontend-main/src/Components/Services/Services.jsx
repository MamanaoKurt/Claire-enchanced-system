import React, { useMemo, useRef, useState } from "react";
import "./Services.css";

import manicureImg from "../../assets/manicure.jpg";
import pedicureImg from "../../assets/pedicure.jpg";
import nailArtImg from "../../assets/nail-art-extension.jpg";
import spaImg from "../../assets/spa.jpg";
import lashesBrowsImg from "../../assets/lashes-brows.jpg";
import lashExtensionsImg from "../../assets/lash-extensions.jpg";
import threadingImg from "../../assets/threading.jpg";
import hairWaxingImg from "../../assets/hairwaxing.jpg";
import spmuImg from "../../assets/spmu.jpg";

const services = [
  {
    title: "Manicure",
    image: manicureImg,
    description:
      "Professional manicure service that cleans, shapes, and polishes your nails for a neat and elegant finish.",
  },
  {
    title: "Pedicure",
    image: pedicureImg,
    description:
      "Refreshing pedicure treatment that helps keep your feet clean, smooth, relaxed, and well-groomed.",
  },
  {
    title: "Nail Art and Extension",
    image: nailArtImg,
    description:
      "Creative nail designs and durable nail extensions tailored to match your preferred style and look.",
  },
  {
    title: "Spa",
    image: spaImg,
    description:
      "Relaxing spa service that helps ease tension, soothe muscles, and calm your mind.",
  },
  {
    title: "Lashes and Brows",
    image: lashesBrowsImg,
    description:
      "Beauty enhancement service for lashes and brows for a cleaner, fuller, and more defined appearance.",
  },
  {
    title: "Lash Extensions",
    image: lashExtensionsImg,
    description:
      "Carefully applied lash extensions that add length, volume, and a more polished eye look.",
  },
  {
    title: "Threading",
    image: threadingImg,
    description:
      "Precise threading service for shaping brows and removing unwanted facial hair with clean results.",
  },
  {
    title: "Hairwaxing",
    image: hairWaxingImg,
    description:
      "Effective waxing service that removes unwanted hair and leaves the skin smoother for a longer time.",
  },
  {
    title: "Semi-Permanent Make-Up (SPMU)",
    image: spmuImg,
    description:
      "Semi-permanent cosmetic enhancement designed to improve brows, lips, or other facial features with lasting results.",
  },
];

const ITEMS_PER_PAGE = 3;

const Services = () => {
  const [page, setPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const fullGridRef = useRef(null);

  const totalPages = Math.ceil(services.length / ITEMS_PER_PAGE);

  const visibleServices = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return services.slice(start, start + ITEMS_PER_PAGE);
  }, [page]);

  const handlePrev = () => {
    setPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    setPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index) => {
    setPage(index);
  };

  const handleViewAll = () => {
    const next = !showAll;
    setShowAll(next);

    if (next) {
      setTimeout(() => {
        fullGridRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 150);
    }
  };

  return (
    <section className="services-section" id="services">
      <div className="services-header">
        <h1 className="services-title">Our Services</h1>
        <button className="services-viewall-btn" type="button" onClick={handleViewAll}>
          {showAll ? "Show Less" : "View All"}
        </button>
      </div>

      <div className="services-slider-wrapper">
        <button className="services-arrow left-arrow" onClick={handlePrev} type="button">
          &#10094;
        </button>

        <div className="services-cards">
          {visibleServices.map((service, index) => (
            <article className="services-card" key={`${service.title}-${index}`}>
              <img
                src={service.image}
                alt={service.title}
                className="services-card-image"
              />
              <div className="services-card-content">
                <h2>{service.title}</h2>
                <p>{service.description}</p>
              </div>
            </article>
          ))}
        </div>

        <button className="services-arrow right-arrow" onClick={handleNext} type="button">
          &#10095;
        </button>
      </div>

      <div className="services-dots">
        {Array.from({ length: totalPages }).map((_, index) => (
          <span
            key={index}
            className={`services-dot ${page === index ? "active" : ""}`}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </div>

      {showAll && (
        <div className="services-all-grid" ref={fullGridRef}>
          {services.map((service) => (
            <article className="services-card services-card--full" key={service.title}>
              <img
                src={service.image}
                alt={service.title}
                className="services-card-image"
              />
              <div className="services-card-content">
                <h2>{service.title}</h2>
                <p>{service.description}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Services;