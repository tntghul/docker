import React from "react";

const EducationSection = ({ education = [], certifications = [] }) => {
  return (
    <section id="education" className="py-5" style={{ background: "rgba(255, 255, 255, 0.02)" }}>
      <div className="container py-4">
        <div className="text-center mb-5">
          <h6 className="text-info text-uppercase fw-bold letter-spacing-1">Credentials</h6>
          <h2 className="fw-bold text-white">Education & Certifications</h2>
          <div className="mx-auto" style={{ width: "60px", height: "4px", background: "var(--primary-gradient)", borderRadius: "2px" }}></div>
        </div>

        <div className="row g-4">
          {/* Education Column */}
          <div className="col-lg-6">
            <h4 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
              <i className="bi bi-mortarboard-fill text-info"></i>Academic Background
            </h4>

            <div className="d-flex flex-column gap-3">
              {education && education.length > 0 ? (
                education.map((edu, idx) => (
                  <div key={idx} className="card p-3 border-0" style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "14px"
                  }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="fw-bold text-white mb-1">{edu.degree}</h5>
                        <p className="text-info mb-1 fw-semibold">{edu.institution}</p>
                        {edu.fieldOfStudy && (
                          <small className="text-white-50">{edu.fieldOfStudy}</small>
                        )}
                      </div>
                      <span className="badge bg-dark border border-secondary text-white-50">
                        {edu.startYear} – {edu.endYear || "Present"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No education records added.</p>
              )}
            </div>
          </div>

          {/* Certifications Column */}
          <div className="col-lg-6">
            <h4 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
              <i className="bi bi-patch-check-fill text-warning"></i>Licenses & Certifications
            </h4>

            <div className="d-flex flex-column gap-3">
              {certifications && certifications.length > 0 ? (
                certifications.map((cert, idx) => (
                  <div key={idx} className="card p-3 border-0" style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "14px"
                  }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="fw-bold text-white mb-1">{cert.title}</h5>
                        <p className="text-warning mb-1 fw-semibold">
                          <i className="bi bi-award me-1"></i>{cert.issuer}
                        </p>
                        {cert.issueDate && (
                          <small className="text-white-50">Issued: {cert.issueDate}</small>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No certifications recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
