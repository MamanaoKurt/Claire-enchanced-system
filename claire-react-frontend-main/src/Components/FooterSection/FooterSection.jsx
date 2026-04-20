import React, { useState } from "react";
import "./FooterSection.css";
import logo from "../../assets/logo.png";

const FooterSection = () => {
  const [showFbModal, setShowFbModal] = useState(false);

  const openBranchLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setShowFbModal(false);
  };

  return (
    <>
      <footer className="footer-section">
        <div className="footer-inner">
          <div className="footer-left">
            <img src={logo} alt="Claire Beauty Lounge logo" />
            <p>
              <b>PHONE</b> +63 965 365 6545
            </p>
            <p>
              <b>EMAIL</b> clairelounge2023@gmail.com
            </p>

            <div className="footer-social-row">
              <b>SOCIAL</b>

              <div className="footer-social-icons">
                <button
                  type="button"
                  aria-label="Facebook"
                  className="footer-social-link footer-social-button"
                  onClick={() => setShowFbModal(true)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.19 2.23.19v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z"
                    />
                  </svg>
                </button>

                <a
                  href="https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.instagram.com%2Fclairelounge%3Ffbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExVjFEVmt2c1Y2WHlMMjBtbnNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR44VXdbNyysdmrHQTe1xprDuYBQoPeGCCcc5yv5JI7gtjuMoS3EXAx6ZnjhPg_aem_ufN2ncgD6z2ODc6neRnWPQ&h=AT7m3K6bwJHWcyJZW9pJRYd06hsFvS2Ysl2gc_wX_lPP6eSCLSVqf5Rcku4JNyf9Jyyt0DEGpYxorykKslns2lQNTipj-RgwETshZMa0AEuPltm_JLNtN92vTTuvRnDR3n_L"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="footer-social-link"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm4.75-3.25a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-mid">
            <p>
              <b>OPENING HOURS</b>
            </p>
            <p>
              Monday - Friday: 9:00 AM - 8:00 PM
              <br />
              Saturday: 10:00 AM - 6:00 PM
              <br />
              Sunday: 11:00 AM - 5:00 PM
            </p>
          </div>

          <div className="footer-right">
            <h1>
              We would love
              <br />
              to hear from you!
            </h1>
            <p>
              This is an accessible establishment.
              <br />
              Please reach out for additional
              <br />
              accommodations.
            </p>
          </div>
        </div>
      </footer>

      {showFbModal && (
        <div
          className="contact-modal-backdrop"
          onClick={() => setShowFbModal(false)}
        >
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <p className="contact-modal__eyebrow">CLAIRE BEAUTY LOUNGE</p>
            <h3>Select a branch</h3>
            <p className="contact-modal__text">
              Choose which Facebook page you want to open.
            </p>

            <div className="contact-modal__actions">
              <button
                type="button"
                className="contact-modal__button"
                onClick={() =>
                  openBranchLink("https://www.facebook.com/profile.php?id=61587237901341")
                }
              >
                Quezon City Branch
              </button>

              <button
                type="button"
                className="contact-modal__button"
                onClick={() =>
                  openBranchLink(
                    "https://www.facebook.com/CLAIRElounge"
                  )
                }
              >
                SJDM Bulacan Branch
              </button>
            </div>

            <button
              type="button"
              className="contact-modal__close"
              onClick={() => setShowFbModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FooterSection;