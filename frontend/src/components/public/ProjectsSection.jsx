import React, { useState } from "react";

const ProjectsSection = ({ projects = [] }) => {
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...new Set(projects.map((p) => p.category || "Full Stack"))];

  const filteredProjects = filter === "All"
    ? projects
    : projects.filter((p) => (p.category || "Full Stack") === filter);

  return (
    <section id="projects" className="py-5" style={{ background: "rgba(255, 255, 255, 0.02)" }}>
      <div className="container py-4">
        <div className="text-center mb-5">
          <h6 className="text-info text-uppercase fw-bold letter-spacing-1">Portfolio Works</h6>
          <h2 className="fw-bold text-white">Featured Engineering Projects</h2>
          <div className="mx-auto" style={{ width: "60px", height: "4px", background: "var(--primary-gradient)", borderRadius: "2px" }}></div>
        </div>

        {/* Filter Pills */}
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className={`btn btn-sm rounded-pill px-3 py-1 ${
                filter === cat ? "btn-primary text-white fw-bold" : "btn-outline-secondary text-white-50"
              }`}
              style={filter === cat ? { background: "var(--primary-gradient)", border: "none" } : {}}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="row g-4">
          {filteredProjects && filteredProjects.length > 0 ? (
            filteredProjects.map((project, idx) => (
              <div key={idx} className="col-md-6 col-lg-4">
                <div className="card h-100 p-4 border-0 d-flex flex-column justify-content-between" style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)"
                }}>
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="badge bg-secondary-subtle text-info border border-info border-opacity-25 px-2 py-1">
                        {project.category || "Full Stack"}
                      </span>
                      {project.featured && (
                        <span className="badge bg-warning-subtle text-warning border border-warning border-opacity-25 px-2 py-1">
                          <i className="bi bi-star-fill me-1"></i>Featured
                        </span>
                      )}
                    </div>

                    <h4 className="fw-bold text-white mb-2">{project.title}</h4>

                    <p className="text-white-50 mb-3" style={{ fontSize: "14.5px", lineHeight: "1.6" }}>
                      {project.description}
                    </p>

                    <div className="d-flex flex-wrap gap-1 mb-4">
                      {project.techStack && project.techStack.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="badge bg-dark text-info-emphasis border border-secondary px-2 py-1"
                          style={{ fontSize: "11.5px" }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 pt-3 border-top border-secondary border-opacity-25">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-primary rounded-pill px-3 fw-semibold flex-grow-1"
                        style={{ background: "var(--primary-gradient)", border: "none" }}
                      >
                        <i className="bi bi-box-arrow-up-right me-1"></i>Live Demo
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-light rounded-pill px-3"
                      >
                        <i className="bi bi-github me-1"></i>Code
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center text-muted">No projects found in this category.</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
