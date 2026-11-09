import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ portfolio, onThemeChange }) => {
  const currentTheme = portfolio?.theme || "modern-dark";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{
      background: "rgba(10, 14, 23, 0.85)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      zIndex: 1000
    }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
          <span style={{
            background: "var(--primary-gradient)",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "18px"
          }}>
            ⚡
          </span>
          <span className="text-white">{portfolio?.personalInfo?.fullName || "Developer Portfolio"}</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#portfolioNav"
          aria-controls="portfolioNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="portfolioNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1 gap-lg-3">
            <li className="nav-item">
              <a className="nav-link text-white-50 hover-text-white" href="#about">About</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white-50" href="#skills">Skills</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white-50" href="#projects">Projects</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white-50" href="#experience">Experience</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white-50" href="#education">Education</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white-50" href="#contact">Contact</a>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {/* Theme Selector */}
            <select
              className="form-select form-select-sm"
              value={currentTheme}
              onChange={(e) => onThemeChange && onThemeChange(e.target.value)}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                color: "#f8fafc",
                borderColor: "rgba(255, 255, 255, 0.15)",
                width: "auto",
                cursor: "pointer"
              }}
              title="Switch Portfolio Theme"
            >
              <option value="modern-dark" className="text-dark">🌙 Modern Dark</option>
              <option value="minimal-light" className="text-dark">☀️ Minimal Light</option>
              <option value="emerald-glow" className="text-dark">🌿 Emerald Glow</option>
              <option value="cyber-indigo" className="text-dark">👾 Cyber Indigo</option>
            </select>

            {/* Admin Portal Link */}
            <Link
              to="/admin"
              className="btn btn-sm btn-outline-light rounded-pill px-3 d-flex align-items-center gap-1"
            >
              <i className="bi bi-shield-lock"></i>
              <span>Admin CMS</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
