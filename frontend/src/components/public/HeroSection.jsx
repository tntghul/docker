import React from "react";

const HeroSection = ({ personalInfo, socialLinks }) => {
  const {
    fullName = "Ayansh Developer",
    title = "Full Stack MERN Developer & AI Specialist",
    bio = "Crafting resilient microservices, responsive web applications, and intelligent generative AI solutions.",
    location = "India",
    avatarUrl,
    resumeUrl
  } = personalInfo || {};

  return (
    <section className="py-5 text-center text-lg-start position-relative">
      <div className="container py-lg-4">
        <div className="row align-items-center g-5">
          <div className="col-lg-7">
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3" style={{
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              color: "#818cf8",
              fontSize: "13px",
              fontWeight: 600
            }}>
              <span className="spinner-grow spinner-grow-sm text-info" role="status"></span>
              Available for Opportunities & Collaborations
            </div>

            <h1 className="display-4 fw-bolder mb-3 text-white">
              Hi, I'm <span style={{
                background: "var(--primary-gradient)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>{fullName}</span>
            </h1>

            <h3 className="h4 text-info mb-3 fw-semibold">
              {title}
            </h3>

            <p className="lead text-white-50 mb-4 mx-auto mx-lg-0" style={{ maxWidth: "620px", fontSize: "16.5px", lineHeight: "1.7" }}>
              {bio}
            </p>

            <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start gap-3 mb-4">
              <a href="#projects" className="btn btn-primary px-4 py-2 rounded-pill fw-bold" style={{
                background: "var(--primary-gradient)",
                border: "none",
                boxShadow: "0 8px 20px var(--primary-glow)"
              }}>
                <i className="bi bi-code-slash me-2"></i>Explore Projects
              </a>

              {resumeUrl ? (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-light px-4 py-2 rounded-pill fw-semibold"
                >
                  <i className="bi bi-file-earmark-person me-2"></i>Resume
                </a>
              ) : (
                <a href="#contact" className="btn btn-outline-light px-4 py-2 rounded-pill fw-semibold">
                  <i className="bi bi-envelope me-2"></i>Contact Me
                </a>
              )}
            </div>

            {location && (
              <div className="text-white-50">
                <span className="badge bg-dark text-white-50 border border-secondary px-3 py-2 rounded-pill">
                  <i className="bi bi-geo-alt me-1 text-danger"></i>{location}
                </span>
              </div>
            )}
          </div>

          <div className="col-lg-5 text-center">
            <div className="position-relative d-inline-block">
              <div style={{
                position: "absolute",
                inset: "-12px",
                background: "var(--primary-gradient)",
                borderRadius: "50%",
                filter: "blur(24px)",
                opacity: 0.5,
                zIndex: 0
              }}></div>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="rounded-circle shadow-lg position-relative"
                  style={{
                    width: "280px",
                    height: "280px",
                    objectFit: "cover",
                    border: "4px solid rgba(255, 255, 255, 0.2)",
                    zIndex: 1
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div
                  className="rounded-circle shadow-lg position-relative d-flex align-items-center justify-content-center text-white fw-bold display-3"
                  style={{
                    width: "280px",
                    height: "280px",
                    background: "var(--primary-gradient)",
                    border: "4px solid rgba(255, 255, 255, 0.2)",
                    zIndex: 1,
                    letterSpacing: "2px"
                  }}
                >
                  {fullName ? fullName.split(" ").filter(Boolean).map(n => n[0]).slice(0, 2).join("").toUpperCase() : "SS"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
