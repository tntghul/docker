import React from "react";

const ExperienceSection = ({ experience = [] }) => {
  return (
    <section id="experience" className="py-5">
      <div className="container py-4">
        <div className="text-center mb-5">
          <h6 className="text-info text-uppercase fw-bold letter-spacing-1">Career Journey</h6>
          <h2 className="fw-bold text-white">Work Experience</h2>
          <div className="mx-auto" style={{ width: "60px", height: "4px", background: "var(--primary-gradient)", borderRadius: "2px" }}></div>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="d-flex flex-column gap-4">
              {experience && experience.length > 0 ? (
                experience.map((exp, idx) => (
                  <div key={idx} className="card p-4 border-0 position-relative" style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "16px",
                    borderLeft: "6px solid #6366f1"
                  }}>
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-2">
                      <div>
                        <h4 className="fw-bold text-white mb-1">{exp.role}</h4>
                        <h6 className="text-info fw-semibold mb-0">
                          <i className="bi bi-building me-1"></i>{exp.company}
                        </h6>
                      </div>
                      <div className="text-lg-end mt-2 mt-lg-0">
                        <span className="badge bg-dark border border-secondary px-3 py-2 rounded-pill text-white-50">
                          <i className="bi bi-calendar3 me-1"></i>{exp.startDate} – {exp.endDate}
                        </span>
                        {exp.location && (
                          <div className="small text-muted mt-1">
                            <i className="bi bi-geo-alt me-1"></i>{exp.location}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <ul className="mb-0 text-white-50 ps-3" style={{ fontSize: "14.5px", lineHeight: "1.7" }}>
                        {exp.highlights && exp.highlights.map((point, pIdx) => (
                          <li key={pIdx} className="mb-1">{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted">No experience entries recorded.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
