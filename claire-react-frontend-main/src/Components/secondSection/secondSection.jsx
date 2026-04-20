import React from "react";
import "./secondSection.css";

const secondSectionimage =
  "https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=1200&q=80";

const secondSection = () => {
  return (
    <div className="second-section">
      <div className="inner">
        <div className="left">
          <img
            src={secondSectionimage}
            alt="secondSection"
            className="secondSection-image"
          />
        </div>

        <div className="right">
          <h1>Exceptional Nail Care, Rooted in Wellness.</h1>
          <p>
            We believe that true beauty should not compromise your health.
            Unlike traditional salons, we distinguish ourselves through our
            commitment to your complete well-being. From our meticulous hygiene
            standards to our serene environment, we offer an award-winning
            experience that guarantees you will not just leave with stunning
            nails—you will leave feeling entirely refreshed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default secondSection;