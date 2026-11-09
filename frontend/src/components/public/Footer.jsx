import React from "react";
import { Link } from "react-router-dom";

const Footer = ({ personalInfo }) => {
  return (
    <footer className="py-4 border-top border-secondary border-opacity-25" style={{ background: "rgba(10, 14, 23, 0.95)" }}>
      <div className="container d-flex flex-wrap justify-content-between align-items-center gap-3">
        <p className="col-md-6 mb-0 text-white-50 small">
          © {new Date().getFullYear()} <span className="text-white fw-bold">{personalInfo?.fullName || "Developer"}</span>. Powered by Smart Portfolio CMS & Gemini AI.
        </p>

        <ul className="nav col-md-4 justify-content-end align-items-center gap-3">
          <li className="nav-item">
            <a href="#about" className="nav-link px-2 text-white-50 small">About</a>
          </li>
          <li className="nav-item">
            <a href="#projects" className="nav-link px-2 text-white-50 small">Projects</a>
          </li>
          <li className="nav-item">
            <Link to="/admin" className="nav-link px-2 text-info small fw-bold">
              <i className="bi bi-gear-fill me-1"></i>CMS Admin
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
