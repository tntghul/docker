import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { portfolioApi } from "../api/client";
import Navbar from "../components/public/Navbar";
import HeroSection from "../components/public/HeroSection";
import AboutSection from "../components/public/AboutSection";
import SkillsSection from "../components/public/SkillsSection";
import ProjectsSection from "../components/public/ProjectsSection";
import ExperienceSection from "../components/public/ExperienceSection";
import EducationSection from "../components/public/EducationSection";
import ContactSection from "../components/public/ContactSection";
import Footer from "../components/public/Footer";

const HomePage = () => {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const targetUserId = userId || searchParams.get("userId") || searchParams.get("user");

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await portfolioApi.getPublicPortfolio(targetUserId);
      setPortfolio(res.data);
      if (res.data?.theme) {
        document.documentElement.setAttribute("data-theme", res.data.theme);
      }
    } catch (err) {
      console.error("Failed to load portfolio:", err);
      setError("Unable to connect to portfolio database. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [targetUserId]);

  const handleThemeChange = (newTheme) => {
    if (portfolio) {
      setPortfolio({ ...portfolio, theme: newTheme });
    }
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100" style={{ background: "var(--bg-primary)" }}>
        <div className="spinner-border text-primary" style={{ width: "3.5rem", height: "3.5rem" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-white-50 fw-semibold">Loading Live Portfolio...</p>
      </div>
    );
  }

  if (error && !portfolio) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center p-4">
        <div className="alert alert-danger p-4 rounded-4 shadow" style={{ maxWidth: "500px" }}>
          <i className="bi bi-exclamation-triangle-fill fs-1 text-danger mb-3 d-block"></i>
          <h4 className="fw-bold">Database Connection Issue</h4>
          <p className="small mb-3">{error}</p>
          <button className="btn btn-outline-danger btn-sm rounded-pill px-4" onClick={fetchPortfolio}>
            <i className="bi bi-arrow-clockwise me-1"></i>Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-app-root">
      <Navbar portfolio={portfolio} onThemeChange={handleThemeChange} />
      <HeroSection personalInfo={portfolio?.personalInfo} socialLinks={portfolio?.socialLinks} />
      <AboutSection aboutMe={portfolio?.aboutMe} personalInfo={portfolio?.personalInfo} />
      <SkillsSection skills={portfolio?.skills} />
      <ProjectsSection projects={portfolio?.projects} />
      <ExperienceSection experience={portfolio?.experience} />
      <EducationSection education={portfolio?.education} certifications={portfolio?.certifications} />
      <ContactSection personalInfo={portfolio?.personalInfo} socialLinks={portfolio?.socialLinks} />
      <Footer personalInfo={portfolio?.personalInfo} />
    </div>
  );
};

export default HomePage;
