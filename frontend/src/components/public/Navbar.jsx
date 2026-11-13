import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = ({ portfolio, onThemeChange }) => {
  const currentTheme = portfolio?.theme || "modern-dark";
  const isLight = currentTheme === "minimal-light";
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  const toggleNav = () => setIsNavOpen((prev) => !prev);
  const closeNav = () => setIsNavOpen(false);

  // Close mobile menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsNavOpen(false);
      }
    };

    if (isNavOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isNavOpen]);

  // Smooth scroll handler for nav links
  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setIsNavOpen(false);

    // If on a different page, navigate to root with target
    if (location.pathname !== "/" && !location.pathname.startsWith("/p/")) {
      window.location.href = `/#${targetId}`;
      return;
    }

    // Allow time for menu collapse layout shift before calculating target position
    setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        const navHeight = navRef.current ? navRef.current.offsetHeight : 70;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = Math.max(0, elementPosition - navHeight - 14);

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });

        // Also update URL hash without jump
        window.history.pushState(null, "", `#${targetId}`);
      }
    }, 120);
  };

  return (
    <nav
      ref={navRef}
      className={`navbar navbar-expand-lg ${isLight ? "navbar-light" : "navbar-dark"} sticky-top portfolio-navbar`}
      style={{
        background: isLight ? "rgba(255, 255, 255, 0.94)" : "rgba(10, 14, 23, 0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: isLight ? "1px solid rgba(0, 0, 0, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)",
        zIndex: 1000,
        transition: "background 0.3s ease, border-color 0.3s ease"
      }}
    >
      <div className="container">
        {/* Brand Logo & Name */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/" onClick={closeNav}>
          <span
            className="brand-icon"
            style={{
              background: "var(--primary-gradient)",
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "18px",
              boxShadow: "0 4px 12px var(--primary-glow)"
            }}
          >
            ⚡
          </span>
          <span className={isLight ? "text-dark" : "text-white"}>
            {portfolio?.personalInfo?.fullName || "Developer Portfolio"}
          </span>
        </Link>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="navbar-toggler border-0 p-2 rounded-3 shadow-none"
          type="button"
          onClick={toggleNav}
          aria-controls="portfolioNav"
          aria-expanded={isNavOpen}
          aria-label="Toggle navigation"
          style={{ outline: "none" }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Nav Links & Actions */}
        <div className={`collapse navbar-collapse ${isNavOpen ? "show" : ""}`} id="portfolioNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1 gap-lg-3 py-2 py-lg-0">
            <li className="nav-item">
              <a
                className={`nav-link ${isLight ? "text-dark" : "text-white-50"}`}
                href="#about"
                onClick={(e) => handleNavClick(e, "about")}
              >
                About
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${isLight ? "text-dark" : "text-white-50"}`}
                href="#skills"
                onClick={(e) => handleNavClick(e, "skills")}
              >
                Skills
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${isLight ? "text-dark" : "text-white-50"}`}
                href="#projects"
                onClick={(e) => handleNavClick(e, "projects")}
              >
                Projects
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${isLight ? "text-dark" : "text-white-50"}`}
                href="#experience"
                onClick={(e) => handleNavClick(e, "experience")}
              >
                Experience
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${isLight ? "text-dark" : "text-white-50"}`}
                href="#education"
                onClick={(e) => handleNavClick(e, "education")}
              >
                Education
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${isLight ? "text-dark" : "text-white-50"}`}
                href="#contact"
                onClick={(e) => handleNavClick(e, "contact")}
              >
                Contact
              </a>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0 pt-2 pt-lg-0 border-top border-secondary border-opacity-10 border-top-lg-0">
            {/* Theme Selector */}
            <select
              className="form-select form-select-sm"
              value={currentTheme}
              onChange={(e) => onThemeChange && onThemeChange(e.target.value)}
              style={{
                background: isLight ? "#ffffff" : "rgba(255, 255, 255, 0.08)",
                color: isLight ? "#0f172a" : "#f8fafc",
                borderColor: isLight ? "#cbd5e1" : "rgba(255, 255, 255, 0.15)",
                width: "auto",
                cursor: "pointer",
                borderRadius: "10px",
                fontWeight: 500
              }}
              title="Switch Portfolio Theme"
            >
              <option value="modern-dark">🌙 Modern Dark</option>
              <option value="minimal-light">☀️ Minimal Light</option>
              <option value="emerald-glow">🌿 Emerald Glow</option>
              <option value="cyber-indigo">👾 Cyber Indigo</option>
            </select>

            {/* Admin Portal Link */}
            <Link
              to="/admin"
              onClick={closeNav}
              className={`btn btn-sm ${isLight ? "btn-outline-primary" : "btn-outline-light"} rounded-pill px-3 d-flex align-items-center gap-1 fw-semibold`}
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
