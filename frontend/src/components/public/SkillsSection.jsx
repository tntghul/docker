import React from "react";

const SkillsSection = ({ skills = [] }) => {
  const getCategoryIcon = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes("front")) return "bi-layout-text-window-reverse text-info";
    if (cat.includes("back")) return "bi-server text-warning";
    if (cat.includes("data")) return "bi-database-fill text-success";
    if (cat.includes("ai") || cat.includes("tool")) return "bi-cpu-fill text-danger";
    return "bi-code-square text-primary";
  };

  return (
    <section id="skills" className="py-5">
      <div className="container py-4">
        <div className="text-center mb-5">
          <h6 className="text-info text-uppercase fw-bold letter-spacing-1">Technical Stack</h6>
          <h2 className="fw-bold text-white">Skills & Proficiencies</h2>
          <div className="mx-auto" style={{ width: "60px", height: "4px", background: "var(--primary-gradient)", borderRadius: "2px" }}></div>
        </div>

        <div className="row g-4">
          {skills && skills.length > 0 ? (
            skills.map((catGroup, idx) => (
              <div key={idx} className="col-md-6 col-lg-3">
                <div className="card h-100 p-4 border-0" style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "16px",
                  transition: "transform 0.3s ease"
                }}>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <i className={`bi ${getCategoryIcon(catGroup.category)} fs-4`}></i>
                    <h5 className="fw-bold text-white mb-0">{catGroup.category}</h5>
                  </div>

                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {catGroup.items && catGroup.items.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="badge px-3 py-2 rounded-pill"
                        style={{
                          background: "rgba(255, 255, 255, 0.06)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          color: "#f8fafc",
                          fontSize: "13px",
                          fontWeight: 500
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center text-muted">No skills configured yet.</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
