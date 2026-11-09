import React from "react";

const AboutSection = ({ aboutMe, personalInfo }) => {
  const { story, highlights = [] } = aboutMe || {};

  return (
    <section id="about" className="py-5" style={{ background: "rgba(255, 255, 255, 0.02)" }}>
      <div className="container py-4">
        <div className="text-center mb-5">
          <h6 className="text-info text-uppercase fw-bold letter-spacing-1">About Me</h6>
          <h2 className="fw-bold text-white">Engineering with Passion & Precision</h2>
          <div className="mx-auto" style={{ width: "60px", height: "4px", background: "var(--primary-gradient)", borderRadius: "2px" }}></div>
        </div>

        <div className="row g-4 align-items-center">
          <div className="col-lg-6">
            <div className="card p-4 border-0 h-100" style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
              borderRadius: "16px"
            }}>
              <h4 className="fw-bold text-white mb-3">
                <i className="bi bi-person-lines-fill text-info me-2"></i>My Background & Philosophy
              </h4>
              <p className="text-white-50 leading-relaxed mb-4" style={{ fontSize: "15.5px" }}>
                {story || "I specialize in end-to-end full stack development with modern JavaScript, Node, Express, and React. Passionate about turning complex real-world requirements into elegant, high-throughput digital systems."}
              </p>

              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="p-3 rounded" style={{ background: "rgba(255, 255, 255, 0.04)" }}>
                    <small className="text-muted d-block">Full Name</small>
                    <span className="fw-semibold text-white">{personalInfo?.fullName || "Developer"}</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="p-3 rounded" style={{ background: "rgba(255, 255, 255, 0.04)" }}>
                    <small className="text-muted d-block">Email</small>
                    <span className="fw-semibold text-white">{personalInfo?.email || "dev@example.com"}</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="p-3 rounded" style={{ background: "rgba(255, 255, 255, 0.04)" }}>
                    <small className="text-muted d-block">Location</small>
                    <span className="fw-semibold text-white">{personalInfo?.location || "Remote"}</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="p-3 rounded" style={{ background: "rgba(255, 255, 255, 0.04)" }}>
                    <small className="text-muted d-block">Primary Focus</small>
                    <span className="fw-semibold text-info">{personalInfo?.title || "Full Stack Web"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card p-4 border-0 h-100" style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
              borderRadius: "16px"
            }}>
              <h4 className="fw-bold text-white mb-3">
                <i className="bi bi-stars text-warning me-2"></i>Core Strengths & Highlights
              </h4>

              <div className="d-flex flex-column gap-3">
                {highlights && highlights.length > 0 ? (
                  highlights.map((item, idx) => (
                    <div key={idx} className="d-flex align-items-start gap-3 p-3 rounded" style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      borderLeft: "4px solid #6366f1"
                    }}>
                      <i className="bi bi-check-circle-fill text-success fs-5 mt-1"></i>
                      <div>
                        <p className="mb-0 text-white" style={{ fontSize: "14.5px" }}>{item}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No highlights added yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
