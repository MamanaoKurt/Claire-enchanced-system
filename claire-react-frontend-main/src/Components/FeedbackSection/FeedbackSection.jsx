import React from "react";
import "./FeedbackSection.css";

const GOOGLE_FORM_LINK =
  "https://docs.google.com/forms/d/e/1FAIpQLScAhj7ZYK_AkLxpmn5lXNHT-xHtROgpMrArmPcYWNtNJOpBcg/viewform?usp=header";

const FeedbackSection = () => {
  const handleFeedbackClick = () => {
    window.open(GOOGLE_FORM_LINK, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="feedback-section" id="feedback">
      <div className="feedback-container">
        <p className="feedback-eyebrow">Claire Beauty Lounge</p>
        <h2>We’d love to hear from you</h2>
        <p className="feedback-text">
          Share your experience, suggestions, and feedback to help us improve
          our services for every client.
        </p>

        <button
          type="button"
          className="feedback-button"
          onClick={handleFeedbackClick}
        >
          Give Feedback
        </button>
      </div>
    </section>
  );
};

export default FeedbackSection;