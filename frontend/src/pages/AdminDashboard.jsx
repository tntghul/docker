import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { portfolioApi, resumeApi } from "../api/client";
import { downloadResumePDF } from "../utils/pdfExport";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // AI Resume Builder States
  const [jdInput, setJdInput] = useState("");
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [targetCompany, setTargetCompany] = useState("Google");
  const [generatingResume, setGeneratingResume] = useState(false);
  const [tailoredResume, setTailoredResume] = useState(null);
  const [savingResume, setSavingResume] = useState(false);

  // Resume History State
  const [resumeHistory, setResumeHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Show Toast Helper
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  // Check auth and fetch admin portfolio
  const fetchPortfolioData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await portfolioApi.getAdminPortfolio();
      setPortfolio(res.data);
      if (res.data?.theme) {
        document.documentElement.setAttribute("data-theme", res.data.theme);
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        showToast("Failed to load portfolio from database.", "danger");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await resumeApi.getResumeHistory();
      setResumeHistory(res.data);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
    fetchHistory();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Save changes to database
  const savePortfolioChanges = async (overrideData) => {
    try {
      setSaving(true);
      const payload = overrideData || portfolio;
      const res = await portfolioApi.updatePortfolio(payload);
      setPortfolio(res.data.data);
      showToast("Portfolio changes successfully saved and published live!");
    } catch (err) {
      console.error("Save error:", err);
      showToast(err.response?.data?.message || "Failed to save portfolio changes.", "danger");
    } finally {
      setSaving(false);
    }
  };

  // Avatar file upload with client-side compression
  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, WebP)", "danger");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);

        setPortfolio((prev) => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            avatarUrl: compressedDataUrl
          }
        }));

        showToast("Photo loaded! Click 'Save Profile Information' below to save.");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Generate Tailored Resume via AI
  const handleGenerateResume = async (e) => {
    e.preventDefault();
    if (!jdInput.trim()) {
      showToast("Please paste a Job Description first.", "warning");
      return;
    }

    try {
      setGeneratingResume(true);
      const res = await resumeApi.generateResume({
        jobDescription: jdInput,
        targetRole,
        targetCompany
      });
      setTailoredResume(res.data.data);
      showToast("AI Resume tailored successfully! Review and export below.");
    } catch (err) {
      console.error("AI Generation failed:", err);
      showToast(err.response?.data?.message || "AI Resume generation failed.", "danger");
    } finally {
      setGeneratingResume(false);
    }
  };

  // Save tailored resume into history
  const handleSaveResumeToHistory = async () => {
    if (!tailoredResume) return;
    try {
      setSavingResume(true);
      await resumeApi.saveResume({
        ...tailoredResume,
        jobDescriptionRaw: jdInput
      });
      showToast("Tailored resume saved to history!");
      fetchHistory();
    } catch (err) {
      showToast("Failed to save resume into history.", "danger");
    } finally {
      setSavingResume(false);
    }
  };

  // Delete resume from history
  const handleDeleteResumeHistory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this saved resume?")) return;
    try {
      await resumeApi.deleteResume(id);
      showToast("Resume deleted from history.");
      fetchHistory();
    } catch (err) {
      showToast("Failed to delete resume.", "danger");
    }
  };

  // Add newly discovered JD skills directly to permanent portfolio skills
  const handleAddJdSkillsToPortfolio = () => {
    if (!tailoredResume?.addedFromJdSkills || tailoredResume.addedFromJdSkills.length === 0) return;

    const currentSkills = [...(portfolio?.skills || [])];
    let targetCat = currentSkills.find(
      (c) => c.category === "Targeted Technologies" || c.category === "Core Competencies" || c.category === "Frontend"
    );

    if (!targetCat) {
      targetCat = { category: "Targeted Technologies", items: [] };
      currentSkills.push(targetCat);
    }

    tailoredResume.addedFromJdSkills.forEach((skill) => {
      if (!targetCat.items.includes(skill)) {
        targetCat.items.push(skill);
      }
    });

    const updated = { ...portfolio, skills: currentSkills };
    setPortfolio(updated);
    savePortfolioChanges(updated);
    showToast("Added JD skills to your permanent portfolio!");
  };

  // Handlers for Project CRUD
  const [editingProjectIndex, setEditingProjectIndex] = useState(null);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    category: "Full Stack",
    techStack: "",
    liveUrl: "",
    githubUrl: "",
    featured: false
  });

  const handleStartEditProject = (index) => {
    const proj = portfolio?.projects?.[index];
    if (!proj) return;
    setEditingProjectIndex(index);
    setNewProject({
      title: proj.title || "",
      description: proj.description || "",
      category: proj.category || "Full Stack",
      techStack: Array.isArray(proj.techStack) ? proj.techStack.join(", ") : (proj.techStack || ""),
      liveUrl: proj.liveUrl || "",
      githubUrl: proj.githubUrl || "",
      featured: Boolean(proj.featured)
    });
    const formEl = document.getElementById("project-form-card");
    if (formEl) formEl.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEditProject = () => {
    setEditingProjectIndex(null);
    setNewProject({
      title: "",
      description: "",
      category: "Full Stack",
      techStack: "",
      liveUrl: "",
      githubUrl: "",
      featured: false
    });
  };

  const handleSaveProject = () => {
    if (!newProject.title.trim() || !newProject.description.trim()) {
      showToast("Title and Description are required for projects.", "warning");
      return;
    }
    const stackArray = typeof newProject.techStack === "string"
      ? newProject.techStack.split(",").map((s) => s.trim()).filter(Boolean)
      : newProject.techStack;

    const projectData = {
      ...newProject,
      techStack: stackArray
    };

    let updatedProjects;
    if (editingProjectIndex !== null) {
      updatedProjects = [...(portfolio.projects || [])];
      updatedProjects[editingProjectIndex] = projectData;
      showToast("Project updated successfully!");
    } else {
      updatedProjects = [...(portfolio.projects || []), projectData];
      showToast("Project added successfully!");
    }

    const updated = { ...portfolio, projects: updatedProjects };
    setPortfolio(updated);
    savePortfolioChanges(updated);
    handleCancelEditProject();
  };

  const handleDeleteProject = (index) => {
    if (!window.confirm("Delete this project?")) return;
    if (editingProjectIndex === index) {
      handleCancelEditProject();
    }
    const updatedProjects = portfolio.projects.filter((_, idx) => idx !== index);
    const updated = { ...portfolio, projects: updatedProjects };
    setPortfolio(updated);
    savePortfolioChanges(updated);
  };

  // Handlers for Experience CRUD
  const [editingExpIndex, setEditingExpIndex] = useState(null);
  const [newExp, setNewExp] = useState({ company: "", role: "", startDate: "", endDate: "Present", location: "Remote", highlights: "" });

  const handleStartEditExperience = (index) => {
    const exp = portfolio?.experience?.[index];
    if (!exp) return;
    setEditingExpIndex(index);
    setNewExp({
      company: exp.company || "",
      role: exp.role || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "Present",
      location: exp.location || "Remote",
      highlights: Array.isArray(exp.highlights) ? exp.highlights.join("\n") : (exp.highlights || "")
    });
    const formEl = document.getElementById("experience-form-card");
    if (formEl) formEl.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEditExperience = () => {
    setEditingExpIndex(null);
    setNewExp({ company: "", role: "", startDate: "", endDate: "Present", location: "Remote", highlights: "" });
  };

  const handleSaveExperience = () => {
    if (!newExp.company.trim() || !newExp.role.trim()) {
      showToast("Company and Role are required.", "warning");
      return;
    }
    const points = typeof newExp.highlights === "string"
      ? newExp.highlights.split("\n").map((h) => h.trim()).filter(Boolean)
      : newExp.highlights;

    const expData = { ...newExp, highlights: points };

    let updatedExp;
    if (editingExpIndex !== null) {
      updatedExp = [...(portfolio.experience || [])];
      updatedExp[editingExpIndex] = expData;
      showToast("Experience updated successfully!");
    } else {
      updatedExp = [...(portfolio.experience || []), expData];
      showToast("Experience entry added successfully!");
    }

    const updated = { ...portfolio, experience: updatedExp };
    setPortfolio(updated);
    savePortfolioChanges(updated);
    handleCancelEditExperience();
  };

  const handleDeleteExperience = (index) => {
    if (!window.confirm("Delete this experience entry?")) return;
    if (editingExpIndex === index) {
      handleCancelEditExperience();
    }
    const updatedExp = portfolio.experience.filter((_, idx) => idx !== index);
    const updated = { ...portfolio, experience: updatedExp };
    setPortfolio(updated);
    savePortfolioChanges(updated);
  };

  // Handlers for Skill Category & Item CRUD
  const [newSkillCat, setNewSkillCat] = useState("");
  const [newSkillItem, setNewSkillItem] = useState({ catIndex: 0, name: "" });

  const handleAddSkillCategory = () => {
    if (!newSkillCat.trim()) return;
    const updatedSkills = [...(portfolio.skills || []), { category: newSkillCat.trim(), items: [] }];
    const updated = { ...portfolio, skills: updatedSkills };
    setPortfolio(updated);
    savePortfolioChanges(updated);
    setNewSkillCat("");
  };

  const handleAddSkillItem = (catIdx) => {
    if (!newSkillItem.name.trim()) return;
    const updatedSkills = [...portfolio.skills];
    updatedSkills[catIdx].items.push(newSkillItem.name.trim());
    const updated = { ...portfolio, skills: updatedSkills };
    setPortfolio(updated);
    savePortfolioChanges(updated);
    setNewSkillItem({ catIndex: 0, name: "" });
  };

  const handleDeleteSkillItem = (catIdx, itemIdx) => {
    const updatedSkills = [...portfolio.skills];
    updatedSkills[catIdx].items.splice(itemIdx, 1);
    const updated = { ...portfolio, skills: updatedSkills };
    setPortfolio(updated);
    savePortfolioChanges(updated);
  };

  // Skill category inline rename
  const [editingSkillCatIndex, setEditingSkillCatIndex] = useState(null);
  const [editingSkillCatName, setEditingSkillCatName] = useState("");

  const handleStartEditSkillCategory = (cIdx, currentName) => {
    setEditingSkillCatIndex(cIdx);
    setEditingSkillCatName(currentName);
  };

  const handleSaveSkillCategoryName = (cIdx) => {
    if (!editingSkillCatName.trim()) return;
    const updatedSkills = [...(portfolio.skills || [])];
    updatedSkills[cIdx].category = editingSkillCatName.trim();
    const updated = { ...portfolio, skills: updatedSkills };
    setPortfolio(updated);
    savePortfolioChanges(updated);
    setEditingSkillCatIndex(null);
    setEditingSkillCatName("");
    showToast("Category renamed successfully!");
  };

  // Handlers for Education CRUD
  const [editingEduIndex, setEditingEduIndex] = useState(null);
  const [eduForm, setEduForm] = useState({ degree: "", institution: "", startYear: "", endYear: "", fieldOfStudy: "" });

  const handleStartEditEdu = (index) => {
    const edu = portfolio?.education?.[index];
    if (!edu) return;
    setEditingEduIndex(index);
    setEduForm({
      degree: edu.degree || "",
      institution: edu.institution || "",
      startYear: edu.startYear || "",
      endYear: edu.endYear || "",
      fieldOfStudy: edu.fieldOfStudy || ""
    });
  };

  const handleCancelEditEdu = () => {
    setEditingEduIndex(null);
    setEduForm({ degree: "", institution: "", startYear: "", endYear: "", fieldOfStudy: "" });
  };

  const handleSaveEdu = () => {
    if (!eduForm.degree.trim() || !eduForm.institution.trim()) {
      showToast("Degree and Institution are required.", "warning");
      return;
    }
    let updatedEdu;
    if (editingEduIndex !== null) {
      updatedEdu = [...(portfolio.education || [])];
      updatedEdu[editingEduIndex] = { ...eduForm };
      showToast("Education entry updated!");
    } else {
      updatedEdu = [...(portfolio.education || []), { ...eduForm }];
      showToast("Education entry added!");
    }
    const updated = { ...portfolio, education: updatedEdu };
    setPortfolio(updated);
    savePortfolioChanges(updated);
    handleCancelEditEdu();
  };

  const handleDeleteEdu = (index) => {
    if (!window.confirm("Delete this education entry?")) return;
    if (editingEduIndex === index) handleCancelEditEdu();
    const updatedEdu = portfolio.education.filter((_, i) => i !== index);
    const updated = { ...portfolio, education: updatedEdu };
    setPortfolio(updated);
    savePortfolioChanges(updated);
  };

  // Handlers for Certification CRUD
  const [editingCertIndex, setEditingCertIndex] = useState(null);
  const [certForm, setCertForm] = useState({ title: "", issuer: "", issueDate: "", credentialUrl: "" });

  const handleStartEditCert = (index) => {
    const cert = portfolio?.certifications?.[index];
    if (!cert) return;
    setEditingCertIndex(index);
    setCertForm({
      title: cert.title || "",
      issuer: cert.issuer || "",
      issueDate: cert.issueDate || "",
      credentialUrl: cert.credentialUrl || ""
    });
  };

  const handleCancelEditCert = () => {
    setEditingCertIndex(null);
    setCertForm({ title: "", issuer: "", issueDate: "", credentialUrl: "" });
  };

  const handleSaveCert = () => {
    if (!certForm.title.trim() || !certForm.issuer.trim()) {
      showToast("Title and Issuer are required.", "warning");
      return;
    }
    let updatedCerts;
    if (editingCertIndex !== null) {
      updatedCerts = [...(portfolio.certifications || [])];
      updatedCerts[editingCertIndex] = { ...certForm };
      showToast("Certification updated!");
    } else {
      updatedCerts = [...(portfolio.certifications || []), { ...certForm }];
      showToast("Certification added!");
    }
    const updated = { ...portfolio, certifications: updatedCerts };
    setPortfolio(updated);
    savePortfolioChanges(updated);
    handleCancelEditCert();
  };

  const handleDeleteCert = (index) => {
    if (!window.confirm("Delete this certification?")) return;
    if (editingCertIndex === index) handleCancelEditCert();
    const updatedCerts = portfolio.certifications.filter((_, i) => i !== index);
    const updated = { ...portfolio, certifications: updatedCerts };
    setPortfolio(updated);
    savePortfolioChanges(updated);
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100" style={{ background: "var(--bg-primary)" }}>
        <div className="spinner-border text-info" style={{ width: "3.5rem", height: "3.5rem" }} role="status"></div>
        <p className="mt-3 text-white-50">Initializing Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: "var(--bg-primary)", color: "var(--text-main)" }}>
      {/* Toast Notification */}
      {toast.show && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div className={`alert alert-${toast.type} shadow-lg d-flex align-items-center gap-2 mb-0 rounded-4`}>
            <i className={`bi bi-${toast.type === "success" ? "check-circle-fill" : "exclamation-triangle-fill"}`}></i>
            <span className="fw-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Admin Navbar */}
      <nav className="navbar navbar-dark border-bottom border-secondary border-opacity-25 px-3 py-2 sticky-top" style={{
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(12px)"
      }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center gap-2">
            <span className="badge rounded-pill bg-primary px-3 py-2 fw-bold">
              <i className="bi bi-shield-check me-1"></i>CMS ADMIN
            </span>
            <span className="fw-bold text-white d-none d-md-inline">Smart Portfolio CMS + AI Resume Builder</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Link to="/" target="_blank" className="btn btn-sm btn-outline-info rounded-pill px-3">
              <i className="bi bi-box-arrow-up-right me-1"></i>View Live Site
            </Link>

            <button
              onClick={() => savePortfolioChanges()}
              disabled={saving}
              className="btn btn-sm btn-success rounded-pill px-3 fw-bold"
            >
              {saving ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-floppy2-fill me-1"></i>}
              Save All Changes
            </button>

            <button onClick={handleLogout} className="btn btn-sm btn-outline-danger rounded-pill px-3">
              <i className="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4 px-md-4">
        <div className="row g-4">
          {/* Sidebar Navigation */}
          <div className="col-lg-3 col-xl-2">
            <div className="card p-3 border-0" style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
              borderRadius: "16px"
            }}>
              <div className="d-flex align-items-center gap-2 mb-3 pb-3 border-bottom border-secondary border-opacity-25">
                {portfolio?.personalInfo?.avatarUrl ? (
                  <img
                    src={portfolio.personalInfo.avatarUrl}
                    alt="avatar"
                    className="rounded-circle"
                    style={{ width: "42px", height: "42px", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                    style={{ width: "42px", height: "42px", fontSize: "14px" }}
                  >
                    {(portfolio?.personalInfo?.fullName || "A").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="overflow-hidden">
                  <h6 className="mb-0 text-white fw-bold text-truncate">{portfolio?.personalInfo?.fullName || "Admin"}</h6>
                  <small className="text-info" style={{ fontSize: "11px" }}>Portfolio Owner</small>
                </div>
              </div>

              <div className="nav flex-column nav-pills gap-1">
                <button
                  className={`nav-link text-start rounded-3 d-flex align-items-center gap-2 ${activeTab === "overview" ? "active bg-primary fw-bold" : "text-white-50"}`}
                  onClick={() => setActiveTab("overview")}
                >
                  <i className="bi bi-grid-1x2-fill"></i>Overview
                </button>
                <button
                  className={`nav-link text-start rounded-3 d-flex align-items-center gap-2 ${activeTab === "profile" ? "active bg-primary fw-bold" : "text-white-50"}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <i className="bi bi-person-circle"></i>Personal & Bio
                </button>
                <button
                  className={`nav-link text-start rounded-3 d-flex align-items-center gap-2 ${activeTab === "skills" ? "active bg-primary fw-bold" : "text-white-50"}`}
                  onClick={() => setActiveTab("skills")}
                >
                  <i className="bi bi-stars"></i>Skills CMS
                </button>
                <button
                  className={`nav-link text-start rounded-3 d-flex align-items-center gap-2 ${activeTab === "projects" ? "active bg-primary fw-bold" : "text-white-50"}`}
                  onClick={() => setActiveTab("projects")}
                >
                  <i className="bi bi-code-square"></i>Projects CMS
                </button>
                <button
                  className={`nav-link text-start rounded-3 d-flex align-items-center gap-2 ${activeTab === "experience" ? "active bg-primary fw-bold" : "text-white-50"}`}
                  onClick={() => setActiveTab("experience")}
                >
                  <i className="bi bi-briefcase-fill"></i>Experience CMS
                </button>
                <button
                  className={`nav-link text-start rounded-3 d-flex align-items-center gap-2 ${activeTab === "education" ? "active bg-primary fw-bold" : "text-white-50"}`}
                  onClick={() => setActiveTab("education")}
                >
                  <i className="bi bi-mortarboard-fill"></i>Education & Certs
                </button>
                <button
                  className={`nav-link text-start rounded-3 d-flex align-items-center gap-2 ${activeTab === "social" ? "active bg-primary fw-bold" : "text-white-50"}`}
                  onClick={() => setActiveTab("social")}
                >
                  <i className="bi bi-palette-fill"></i>Social & Theme
                </button>

                <hr className="border-secondary border-opacity-25 my-2" />

                <button
                  className={`nav-link text-start rounded-3 d-flex align-items-center gap-2 ${activeTab === "ai-resume" ? "active bg-gradient text-white fw-bold shadow" : "text-warning"}`}
                  style={activeTab === "ai-resume" ? { background: "var(--primary-gradient)" } : {}}
                  onClick={() => setActiveTab("ai-resume")}
                >
                  <i className="bi bi-cpu-fill"></i>AI Resume Builder
                </button>
                <button
                  className={`nav-link text-start rounded-3 d-flex align-items-center gap-2 ${activeTab === "history" ? "active bg-primary fw-bold" : "text-white-50"}`}
                  onClick={() => {
                    setActiveTab("history");
                    fetchHistory();
                  }}
                >
                  <i className="bi bi-clock-history"></i>Resume History
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content Panes */}
          <div className="col-lg-9 col-xl-10">
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="d-flex flex-column gap-4">
                <div className="card p-4 border-0" style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "16px"
                }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="fw-bold text-white mb-0">System Overview & Dashboard</h4>
                    <span className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill">
                      ● Live & Published
                    </span>
                  </div>
                  <p className="text-white-50">
                    Welcome to your central administration hub. Updates made in any section below are saved directly into MongoDB and immediately reflect on the public website with zero redeployments.
                  </p>

                  <div className="row g-3 mt-2">
                    <div className="col-md-3">
                      <div className="p-3 rounded-4" style={{ background: "rgba(99, 102, 241, 0.12)", border: "1px solid rgba(99, 102, 241, 0.25)" }}>
                        <small className="text-muted d-block">Total Projects</small>
                        <h2 className="fw-bold text-info mb-0">{portfolio?.projects?.length || 0}</h2>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 rounded-4" style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
                        <small className="text-muted d-block">Skill Categories</small>
                        <h2 className="fw-bold text-success mb-0">{portfolio?.skills?.length || 0}</h2>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 rounded-4" style={{ background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.25)" }}>
                        <small className="text-muted d-block">Work Experiences</small>
                        <h2 className="fw-bold text-warning mb-0">{portfolio?.experience?.length || 0}</h2>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 rounded-4" style={{ background: "rgba(236, 72, 153, 0.12)", border: "1px solid rgba(236, 72, 153, 0.25)" }}>
                        <small className="text-muted d-block">Saved AI Resumes</small>
                        <h2 className="fw-bold text-danger mb-0">{resumeHistory.length}</h2>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card p-4 border-0 h-100" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "16px" }}>
                      <h5 className="fw-bold text-white mb-3">Quick Navigation</h5>
                      <div className="d-grid gap-2">
                        <button className="btn btn-outline-info text-start" onClick={() => setActiveTab("ai-resume")}>
                          <i className="bi bi-cpu-fill me-2"></i>Launch AI Resume Builder (Paste JD)
                        </button>
                        <button className="btn btn-outline-light text-start" onClick={() => setActiveTab("projects")}>
                          <i className="bi bi-plus-circle me-2"></i>Add or Modify Projects
                        </button>
                        <button className="btn btn-outline-light text-start" onClick={() => setActiveTab("profile")}>
                          <i className="bi bi-pencil-square me-2"></i>Update Personal Bio & Links
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card p-4 border-0 h-100" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "16px" }}>
                      <h5 className="fw-bold text-white mb-3">Active Visual Theme</h5>
                      <p className="text-white-50 small">
                        Selected theme controls colors on the live portfolio:
                      </p>
                      <select
                        className="form-select bg-dark text-white border-secondary mb-3"
                        value={portfolio?.theme || "modern-dark"}
                        onChange={(e) => {
                          const updated = { ...portfolio, theme: e.target.value };
                          setPortfolio(updated);
                          document.documentElement.setAttribute("data-theme", e.target.value);
                          savePortfolioChanges(updated);
                        }}
                      >
                        <option value="modern-dark">Modern Dark (Default)</option>
                        <option value="minimal-light">Minimalist Light</option>
                        <option value="emerald-glow">Emerald Glow</option>
                        <option value="cyber-indigo">Cyber Indigo</option>
                      </select>
                      <small className="text-success">
                        <i className="bi bi-check2-circle me-1"></i>Theme synced with database
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PERSONAL INFO & BIO */}
            {activeTab === "profile" && (
              <div className="card p-4 border-0" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "16px" }}>
                <h4 className="fw-bold text-white mb-4">Personal Information & Bio</h4>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-white-50 small">Full Name</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      value={portfolio?.personalInfo?.fullName || ""}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        personalInfo: { ...portfolio.personalInfo, fullName: e.target.value }
                      })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-white-50 small">Professional Title / Headline</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      value={portfolio?.personalInfo?.title || ""}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        personalInfo: { ...portfolio.personalInfo, title: e.target.value }
                      })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-white-50 small">Email Address</label>
                    <input
                      type="email"
                      className="form-control bg-dark text-white border-secondary"
                      value={portfolio?.personalInfo?.email || ""}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        personalInfo: { ...portfolio.personalInfo, email: e.target.value }
                      })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-white-50 small">Phone</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      value={portfolio?.personalInfo?.phone || ""}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        personalInfo: { ...portfolio.personalInfo, phone: e.target.value }
                      })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-white-50 small">Location</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      value={portfolio?.personalInfo?.location || ""}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        personalInfo: { ...portfolio.personalInfo, location: e.target.value }
                      })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-white-50 small d-flex justify-content-between align-items-center mb-1">
                      <span>Profile / Avatar Photo</span>
                      {portfolio?.personalInfo?.avatarUrl && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm text-danger text-decoration-none p-0"
                          style={{ fontSize: "12px" }}
                          onClick={() => setPortfolio({
                            ...portfolio,
                            personalInfo: { ...portfolio.personalInfo, avatarUrl: "" }
                          })}
                        >
                          <i className="bi bi-trash3 me-1"></i>Remove Photo
                        </button>
                      )}
                    </label>

                    <div className="p-2 rounded-3 bg-dark border border-secondary">
                      <div className="d-flex align-items-center gap-3">
                        {portfolio?.personalInfo?.avatarUrl ? (
                          <img
                            src={portfolio.personalInfo.avatarUrl}
                            alt="Avatar Preview"
                            className="rounded-circle border border-primary flex-shrink-0"
                            style={{ width: "46px", height: "46px", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white-50 flex-shrink-0"
                            style={{ width: "46px", height: "46px", background: "rgba(255,255,255,0.08)", border: "1px dashed #6c757d" }}
                          >
                            <i className="bi bi-person-fill fs-5"></i>
                          </div>
                        )}

                        <div className="flex-grow-1">
                          <input
                            type="file"
                            accept="image/*"
                            id="avatarFileInput"
                            className="d-none"
                            onChange={(e) => {
                              handleAvatarFileUpload(e);
                              e.target.value = "";
                            }}
                          />
                          <div className="d-flex flex-wrap align-items-center gap-2">
                            <label
                              htmlFor="avatarFileInput"
                              className="btn btn-sm btn-outline-info rounded-pill px-3 mb-0"
                              style={{ cursor: "pointer", fontSize: "12.5px" }}
                            >
                              <i className="bi bi-cloud-arrow-up-fill me-1"></i>
                              {portfolio?.personalInfo?.avatarUrl ? "Change Photo" : "Upload Photo"}
                            </label>
                            
                            <button
                              type="button"
                              className="btn btn-link text-white-50 p-0 text-decoration-none"
                              style={{ fontSize: "11px" }}
                              onClick={() => setShowUrlInput(!showUrlInput)}
                            >
                              {showUrlInput ? "Hide URL" : "Paste URL instead?"}
                            </button>
                          </div>
                          <small className="text-white-50 d-block mt-1" style={{ fontSize: "11px" }}>
                            Upload directly from computer/mobile (PNG, JPG, WebP)
                          </small>
                        </div>
                      </div>

                      {showUrlInput && (
                        <div className="mt-2 pt-2 border-top border-secondary border-opacity-25">
                          <input
                            type="text"
                            placeholder="https://example.com/photo.jpg"
                            className="form-control form-control-sm bg-black text-white border-secondary"
                            value={portfolio?.personalInfo?.avatarUrl || ""}
                            onChange={(e) => setPortfolio({
                              ...portfolio,
                              personalInfo: { ...portfolio.personalInfo, avatarUrl: e.target.value }
                            })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-white-50 small">Hero Bio Summary</label>
                    <textarea
                      rows="3"
                      className="form-control bg-dark text-white border-secondary"
                      value={portfolio?.personalInfo?.bio || ""}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        personalInfo: { ...portfolio.personalInfo, bio: e.target.value }
                      })}
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-white-50 small">About Me Story</label>
                    <textarea
                      rows="4"
                      className="form-control bg-dark text-white border-secondary"
                      value={portfolio?.aboutMe?.story || ""}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        aboutMe: { ...portfolio.aboutMe, story: e.target.value }
                      })}
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-white-50 small">Key Highlights (One per line)</label>
                    <textarea
                      rows="3"
                      className="form-control bg-dark text-white border-secondary"
                      value={(portfolio?.aboutMe?.highlights || []).join("\n")}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        aboutMe: {
                          ...portfolio.aboutMe,
                          highlights: e.target.value.split("\n").filter(Boolean)
                        }
                      })}
                    ></textarea>
                  </div>
                </div>

                <div className="mt-4">
                  <button className="btn btn-primary px-4 rounded-pill fw-bold" onClick={() => savePortfolioChanges()}>
                    Save Profile Information
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: SKILLS MANAGEMENT */}
            {activeTab === "skills" && (
              <div className="card p-4 border-0" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "16px" }}>
                <h4 className="fw-bold text-white mb-4">Skills Management</h4>

                {/* Add new Category */}
                <div className="p-3 rounded-4 mb-4" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <h6 className="text-info fw-bold mb-2">Create New Skill Category</h6>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="e.g. Cloud & DevOps"
                      value={newSkillCat}
                      onChange={(e) => setNewSkillCat(e.target.value)}
                    />
                    <button className="btn btn-primary px-4 text-nowrap rounded-pill" onClick={handleAddSkillCategory}>
                      <i className="bi bi-plus-lg me-1"></i>Add Category
                    </button>
                  </div>
                </div>

                {/* Categories and items */}
                <div className="d-flex flex-column gap-4">
                  {portfolio?.skills?.map((catGroup, cIdx) => (
                    <div key={cIdx} className="p-3 rounded-4" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        {editingSkillCatIndex === cIdx ? (
                          <div className="d-flex align-items-center gap-2 flex-grow-1 me-3">
                            <input
                              type="text"
                              className="form-control form-control-sm bg-dark text-white border-warning"
                              value={editingSkillCatName}
                              onChange={(e) => setEditingSkillCatName(e.target.value)}
                              autoFocus
                            />
                            <button
                              className="btn btn-sm btn-warning text-dark px-3 rounded-pill text-nowrap fw-bold"
                              onClick={() => handleSaveSkillCategoryName(cIdx)}
                            >
                              <i className="bi bi-check-lg me-1"></i>Save
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary px-2 rounded-pill text-nowrap"
                              onClick={() => setEditingSkillCatIndex(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="d-flex align-items-center gap-2">
                            <h5 className="fw-bold text-white mb-0">{catGroup.category}</h5>
                            <button
                              className="btn btn-sm btn-link text-info text-decoration-none p-0 ms-1"
                              title="Rename Category"
                              onClick={() => handleStartEditSkillCategory(cIdx, catGroup.category)}
                            >
                              <i className="bi bi-pencil-square" style={{ fontSize: "14px" }}></i>
                            </button>
                          </div>
                        )}

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            if (!window.confirm(`Delete the entire category "${catGroup.category}" and its skills?`)) return;
                            const updatedSkills = portfolio.skills.filter((_, idx) => idx !== cIdx);
                            const updated = { ...portfolio, skills: updatedSkills };
                            setPortfolio(updated);
                            savePortfolioChanges(updated);
                          }}
                        >
                          <i className="bi bi-trash me-1"></i>Remove Category
                        </button>
                      </div>

                      {/* Skill tags */}
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {catGroup.items?.map((item, iIdx) => (
                          <span key={iIdx} className="badge bg-dark border border-secondary text-white px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                            <span>{item}</span>
                            <i
                              className="bi bi-x-circle text-danger cursor-pointer"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleDeleteSkillItem(cIdx, iIdx)}
                            ></i>
                          </span>
                        ))}
                      </div>

                      {/* Add item to this category */}
                      <div className="d-flex gap-2" style={{ maxWidth: "400px" }}>
                        <input
                          type="text"
                          className="form-control form-control-sm bg-dark text-white border-secondary"
                          placeholder={`Add skill to ${catGroup.category}`}
                          value={newSkillItem.catIndex === cIdx ? newSkillItem.name : ""}
                          onChange={(e) => setNewSkillItem({ catIndex: cIdx, name: e.target.value })}
                        />
                        <button
                          className="btn btn-sm btn-outline-info text-nowrap rounded-pill"
                          onClick={() => handleAddSkillItem(cIdx)}
                        >
                          <i className="bi bi-plus"></i>Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: PROJECTS MANAGEMENT */}
            {activeTab === "projects" && (
              <div className="d-flex flex-column gap-4">
                {/* Create or Edit Project Form */}
                <div id="project-form-card" className="card p-4 border-0" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "16px" }}>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h4 className="fw-bold text-white mb-0">
                      {editingProjectIndex !== null ? (
                        <>
                          <i className="bi bi-pencil-square text-warning me-2"></i>Edit Project
                          <span className="badge bg-warning text-dark ms-2" style={{ fontSize: "12px" }}>
                            Editing #{editingProjectIndex + 1}
                          </span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-folder-plus text-primary me-2"></i>Add New Project
                        </>
                      )}
                    </h4>
                    {editingProjectIndex !== null && (
                      <button
                        className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                        onClick={handleCancelEditProject}
                      >
                        <i className="bi bi-x-circle me-1"></i>Cancel Editing
                      </button>
                    )}
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-white-50 small">Project Title</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="e.g. AI Content Platform"
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-white-50 small">Category</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="e.g. Full Stack / AI/ML"
                        value={newProject.category}
                        onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-white-50 small">Description</label>
                      <textarea
                        rows="2"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="Key technical capabilities and value delivered"
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-white-50 small">Tech Stack (Comma-separated)</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="React, Node.js, MongoDB, Gemini API"
                        value={newProject.techStack}
                        onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-white-50 small">Live Demo URL</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="https://..."
                        value={newProject.liveUrl}
                        onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-white-50 small">GitHub Repo URL</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="https://github.com/..."
                        value={newProject.githubUrl}
                        onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                      />
                    </div>
                    <div className="col-12 d-flex align-items-center justify-content-between pt-2">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="featuredCheck"
                          checked={newProject.featured}
                          onChange={(e) => setNewProject({ ...newProject, featured: e.target.checked })}
                        />
                        <label className="form-check-label text-white-50" htmlFor="featuredCheck">
                          Mark as Featured Project
                        </label>
                      </div>

                      {editingProjectIndex !== null ? (
                        <div className="d-flex gap-2">
                          <button className="btn btn-outline-secondary px-3 rounded-pill fw-semibold" onClick={handleCancelEditProject}>
                            Cancel
                          </button>
                          <button className="btn btn-warning px-4 rounded-pill fw-bold text-dark" onClick={handleSaveProject}>
                            <i className="bi bi-check-circle-fill me-1"></i>Update Project
                          </button>
                        </div>
                      ) : (
                        <button className="btn btn-primary px-4 rounded-pill fw-bold" onClick={handleSaveProject}>
                          <i className="bi bi-plus-circle me-1"></i>Add Project
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Existing Projects List */}
                <div className="card p-4 border-0" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "16px" }}>
                  <h4 className="fw-bold text-white mb-3">Existing Projects ({portfolio?.projects?.length || 0})</h4>
                  <div className="d-flex flex-column gap-3">
                    {portfolio?.projects?.map((proj, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-3 rounded-4 d-flex justify-content-between align-items-start"
                        style={{
                          background: editingProjectIndex === pIdx ? "rgba(234, 179, 8, 0.08)" : "rgba(255, 255, 255, 0.03)",
                          border: editingProjectIndex === pIdx ? "1px solid #eab308" : "1px solid rgba(255, 255, 255, 0.07)",
                          transition: "border-color 0.2s"
                        }}
                      >
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <h5 className="fw-bold text-white mb-0">{proj.title}</h5>
                            <span className="badge bg-secondary-subtle text-info">{proj.category || "Full Stack"}</span>
                            {proj.featured && <span className="badge bg-warning-subtle text-warning">Featured</span>}
                            {editingProjectIndex === pIdx && (
                              <span className="badge bg-warning text-dark">Editing Now</span>
                            )}
                          </div>
                          <p className="text-white-50 small mb-2">{proj.description}</p>
                          <div className="d-flex flex-wrap gap-1">
                            {proj.techStack?.map((t, tIdx) => (
                              <span key={tIdx} className="badge bg-dark border border-secondary text-info-emphasis">{t}</span>
                            ))}
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2 ms-3 flex-shrink-0">
                          <button
                            className="btn btn-sm btn-outline-info rounded-pill px-3"
                            onClick={() => handleStartEditProject(pIdx)}
                            title="Edit this project"
                          >
                            <i className="bi bi-pencil-square me-1"></i>Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill px-3"
                            onClick={() => handleDeleteProject(pIdx)}
                            title="Delete this project"
                          >
                            <i className="bi bi-trash me-1"></i>Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: EXPERIENCE MANAGEMENT */}
            {activeTab === "experience" && (
              <div className="d-flex flex-column gap-4">
                <div id="experience-form-card" className="card p-4 border-0" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "16px" }}>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h4 className="fw-bold text-white mb-0">
                      {editingExpIndex !== null ? (
                        <>
                          <i className="bi bi-pencil-square text-warning me-2"></i>Edit Work Experience
                          <span className="badge bg-warning text-dark ms-2" style={{ fontSize: "12px" }}>
                            Editing #{editingExpIndex + 1}
                          </span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-briefcase-fill text-primary me-2"></i>Add Work Experience
                        </>
                      )}
                    </h4>
                    {editingExpIndex !== null && (
                      <button
                        className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                        onClick={handleCancelEditExperience}
                      >
                        <i className="bi bi-x-circle me-1"></i>Cancel Editing
                      </button>
                    )}
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-white-50 small">Company Name</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        value={newExp.company}
                        onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-white-50 small">Job Role / Title</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        value={newExp.role}
                        onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-white-50 small">Start Date</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="e.g. Jan 2023"
                        value={newExp.startDate}
                        onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-white-50 small">End Date</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="e.g. Present"
                        value={newExp.endDate}
                        onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-white-50 small">Location</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="Remote / Bengaluru"
                        value={newExp.location}
                        onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-white-50 small">Key Achievements (One per line)</label>
                      <textarea
                        rows="3"
                        className="form-control bg-dark text-white border-secondary"
                        value={newExp.highlights}
                        onChange={(e) => setNewExp({ ...newExp, highlights: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="col-12 text-end">
                      {editingExpIndex !== null ? (
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn btn-outline-secondary px-3 rounded-pill fw-semibold" onClick={handleCancelEditExperience}>
                            Cancel
                          </button>
                          <button className="btn btn-warning px-4 rounded-pill fw-bold text-dark" onClick={handleSaveExperience}>
                            <i className="bi bi-check-circle-fill me-1"></i>Update Experience Entry
                          </button>
                        </div>
                      ) : (
                        <button className="btn btn-primary px-4 rounded-pill fw-bold" onClick={handleSaveExperience}>
                          <i className="bi bi-plus-circle me-1"></i>Add Experience Entry
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card p-4 border-0" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "16px" }}>
                  <h4 className="fw-bold text-white mb-3">Work History Timeline ({portfolio?.experience?.length || 0})</h4>
                  <div className="d-flex flex-column gap-3">
                    {portfolio?.experience?.map((exp, eIdx) => (
                      <div
                        key={eIdx}
                        className="p-3 rounded-4 d-flex justify-content-between align-items-start"
                        style={{
                          background: editingExpIndex === eIdx ? "rgba(234, 179, 8, 0.08)" : "rgba(255, 255, 255, 0.03)",
                          border: editingExpIndex === eIdx ? "1px solid #eab308" : "1px solid rgba(255, 255, 255, 0.07)",
                          transition: "border-color 0.2s"
                        }}
                      >
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <h5 className="fw-bold text-white mb-0">{exp.role} @ <span className="text-info">{exp.company}</span></h5>
                            {editingExpIndex === eIdx && (
                              <span className="badge bg-warning text-dark">Editing Now</span>
                            )}
                          </div>
                          <small className="text-muted d-block mb-2">{exp.startDate} – {exp.endDate} ({exp.location})</small>
                          <ul className="small text-white-50 mb-0 ps-3">
                            {exp.highlights?.map((h, hIdx) => (
                              <li key={hIdx}>{h}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="d-flex align-items-center gap-2 ms-3 flex-shrink-0">
                          <button
                            className="btn btn-sm btn-outline-info rounded-pill px-3"
                            onClick={() => handleStartEditExperience(eIdx)}
                            title="Edit this experience"
                          >
                            <i className="bi bi-pencil-square me-1"></i>Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill px-3"
                            onClick={() => handleDeleteExperience(eIdx)}
                            title="Delete this experience"
                          >
                            <i className="bi bi-trash me-1"></i>Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: EDUCATION & CERTS */}
            {activeTab === "education" && (
              <div className="card p-4 border-0" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "16px" }}>
                <h4 className="fw-bold text-white mb-4">Education & Certifications</h4>
                <div className="row g-4">
                  {/* Left Column: Education */}
                  <div className="col-lg-6">
                    <div className="p-3 rounded-4 mb-4" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="text-info fw-bold mb-0">
                          {editingEduIndex !== null ? (
                            <>
                              <i className="bi bi-pencil-square text-warning me-2"></i>Edit Degree
                            </>
                          ) : (
                            <>
                              <i className="bi bi-mortarboard-fill me-2"></i>Add Degree / Education
                            </>
                          )}
                        </h5>
                        {editingEduIndex !== null && (
                          <button className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-0" onClick={handleCancelEditEdu}>
                            Cancel
                          </button>
                        )}
                      </div>

                      <div className="row g-2">
                        <div className="col-12">
                          <input
                            type="text"
                            className="form-control form-control-sm bg-dark text-white border-secondary"
                            placeholder="Degree (e.g. B.Tech Computer Science)"
                            value={eduForm.degree}
                            onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                          />
                        </div>
                        <div className="col-12">
                          <input
                            type="text"
                            className="form-control form-control-sm bg-dark text-white border-secondary"
                            placeholder="Institution / University"
                            value={eduForm.institution}
                            onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                          />
                        </div>
                        <div className="col-6">
                          <input
                            type="text"
                            className="form-control form-control-sm bg-dark text-white border-secondary"
                            placeholder="Start Year (e.g. 2020)"
                            value={eduForm.startYear}
                            onChange={(e) => setEduForm({ ...eduForm, startYear: e.target.value })}
                          />
                        </div>
                        <div className="col-6">
                          <input
                            type="text"
                            className="form-control form-control-sm bg-dark text-white border-secondary"
                            placeholder="End Year (e.g. 2024)"
                            value={eduForm.endYear}
                            onChange={(e) => setEduForm({ ...eduForm, endYear: e.target.value })}
                          />
                        </div>
                        <div className="col-12 text-end pt-1">
                          {editingEduIndex !== null ? (
                            <div className="d-flex justify-content-end gap-2">
                              <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={handleCancelEditEdu}>
                                Cancel
                              </button>
                              <button className="btn btn-sm btn-warning text-dark fw-bold rounded-pill px-3" onClick={handleSaveEdu}>
                                <i className="bi bi-check-circle-fill me-1"></i>Update Degree
                              </button>
                            </div>
                          ) : (
                            <button className="btn btn-sm btn-primary rounded-pill px-3 fw-bold" onClick={handleSaveEdu}>
                              <i className="bi bi-plus-circle me-1"></i>Add Degree
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <h6 className="text-white-50 fw-semibold mb-2">Saved Degrees ({portfolio?.education?.length || 0})</h6>
                    <div className="d-flex flex-column gap-2">
                      {portfolio?.education?.map((edu, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-3 bg-dark d-flex justify-content-between align-items-center"
                          style={{
                            border: editingEduIndex === idx ? "1px solid #eab308" : "1px solid rgba(255, 255, 255, 0.15)",
                            background: editingEduIndex === idx ? "rgba(234, 179, 8, 0.08)" : undefined
                          }}
                        >
                          <div>
                            <div className="fw-bold text-white d-flex align-items-center gap-2">
                              <span>{edu.degree}</span>
                              {editingEduIndex === idx && <span className="badge bg-warning text-dark">Editing</span>}
                            </div>
                            <div className="text-white-50 small">{edu.institution} ({edu.startYear} - {edu.endYear})</div>
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-info rounded-pill px-2 py-1"
                              onClick={() => handleStartEditEdu(idx)}
                              title="Edit Degree"
                            >
                              <i className="bi bi-pencil-square me-1"></i>Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger rounded-pill px-2 py-1"
                              onClick={() => handleDeleteEdu(idx)}
                              title="Delete Degree"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Certifications */}
                  <div className="col-lg-6">
                    <div className="p-3 rounded-4 mb-4" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="text-warning fw-bold mb-0">
                          {editingCertIndex !== null ? (
                            <>
                              <i className="bi bi-pencil-square text-warning me-2"></i>Edit Certification
                            </>
                          ) : (
                            <>
                              <i className="bi bi-patch-check-fill me-2"></i>Add Certification
                            </>
                          )}
                        </h5>
                        {editingCertIndex !== null && (
                          <button className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-0" onClick={handleCancelEditCert}>
                            Cancel
                          </button>
                        )}
                      </div>

                      <div className="row g-2">
                        <div className="col-12">
                          <input
                            type="text"
                            className="form-control form-control-sm bg-dark text-white border-secondary"
                            placeholder="Certificate Title (e.g. AWS Solutions Architect)"
                            value={certForm.title}
                            onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                          />
                        </div>
                        <div className="col-12">
                          <input
                            type="text"
                            className="form-control form-control-sm bg-dark text-white border-secondary"
                            placeholder="Issuer (e.g. Amazon Web Services / Coursera)"
                            value={certForm.issuer}
                            onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                          />
                        </div>
                        <div className="col-12">
                          <input
                            type="text"
                            className="form-control form-control-sm bg-dark text-white border-secondary"
                            placeholder="Issue Date (e.g. 2024)"
                            value={certForm.issueDate}
                            onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                          />
                        </div>
                        <div className="col-12 text-end pt-1">
                          {editingCertIndex !== null ? (
                            <div className="d-flex justify-content-end gap-2">
                              <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={handleCancelEditCert}>
                                Cancel
                              </button>
                              <button className="btn btn-sm btn-warning text-dark fw-bold rounded-pill px-3" onClick={handleSaveCert}>
                                <i className="bi bi-check-circle-fill me-1"></i>Update Certificate
                              </button>
                            </div>
                          ) : (
                            <button className="btn btn-sm btn-primary rounded-pill px-3 fw-bold" onClick={handleSaveCert}>
                              <i className="bi bi-plus-circle me-1"></i>Add Certificate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <h6 className="text-white-50 fw-semibold mb-2">Saved Certifications ({portfolio?.certifications?.length || 0})</h6>
                    <div className="d-flex flex-column gap-2">
                      {portfolio?.certifications?.map((cert, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-3 bg-dark d-flex justify-content-between align-items-center"
                          style={{
                            border: editingCertIndex === idx ? "1px solid #eab308" : "1px solid rgba(255, 255, 255, 0.15)",
                            background: editingCertIndex === idx ? "rgba(234, 179, 8, 0.08)" : undefined
                          }}
                        >
                          <div>
                            <div className="fw-bold text-white d-flex align-items-center gap-2">
                              <span>{cert.title}</span>
                              {editingCertIndex === idx && <span className="badge bg-warning text-dark">Editing</span>}
                            </div>
                            <div className="text-white-50 small">{cert.issuer} ({cert.issueDate})</div>
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-info rounded-pill px-2 py-1"
                              onClick={() => handleStartEditCert(idx)}
                              title="Edit Certificate"
                            >
                              <i className="bi bi-pencil-square me-1"></i>Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger rounded-pill px-2 py-1"
                              onClick={() => handleDeleteCert(idx)}
                              title="Delete Certificate"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: SOCIAL LINKS & THEME */}
            {activeTab === "social" && (
              <div className="card p-4 border-0" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "16px" }}>
                <h4 className="fw-bold text-white mb-4">Social Links & Theme Settings</h4>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-white-50 small">GitHub URL</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      value={portfolio?.socialLinks?.github || ""}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        socialLinks: { ...portfolio.socialLinks, github: e.target.value }
                      })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-white-50 small">LinkedIn URL</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      value={portfolio?.socialLinks?.linkedin || ""}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        socialLinks: { ...portfolio.socialLinks, linkedin: e.target.value }
                      })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-white-50 small">Twitter / X URL</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      value={portfolio?.socialLinks?.twitter || ""}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        socialLinks: { ...portfolio.socialLinks, twitter: e.target.value }
                      })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-white-50 small">Personal Website URL</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      value={portfolio?.socialLinks?.website || ""}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        socialLinks: { ...portfolio.socialLinks, website: e.target.value }
                      })}
                    />
                  </div>
                  <div className="col-12 mt-4">
                    <button className="btn btn-primary px-4 rounded-pill fw-bold" onClick={() => savePortfolioChanges()}>
                      Save Social Links
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: AI RESUME BUILDER (MODULE 3) */}
            {activeTab === "ai-resume" && (
              <div className="d-flex flex-column gap-4">
                {/* AI Input Form */}
                <div className="card p-4 border-0" style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "16px"
                }}>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "var(--primary-gradient)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff"
                    }}>
                      <i className="bi bi-magic fs-5"></i>
                    </div>
                    <div>
                      <h4 className="fw-bold text-white mb-0">AI Resume Tailoring Engine</h4>
                      <small className="text-info">Powered by Google Gemini 2.5 Flash • Zero-Hallucination Guaranteed</small>
                    </div>
                  </div>

                  <form onSubmit={handleGenerateResume}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">Target Role Title</label>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary"
                          placeholder="e.g. Senior Full Stack Engineer"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">Target Company</label>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary"
                          placeholder="e.g. Google / Microsoft / Startup"
                          value={targetCompany}
                          onChange={(e) => setTargetCompany(e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label text-white-50 small">
                          Paste Company Job Description (JD)
                        </label>
                        <textarea
                          rows="5"
                          className="form-control bg-dark text-white border-secondary"
                          placeholder="Paste requirements, responsibilities, and required tech stack from the job posting..."
                          value={jdInput}
                          onChange={(e) => setJdInput(e.target.value)}
                          required
                        ></textarea>
                      </div>
                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn btn-primary px-4 py-2 rounded-pill fw-bold"
                          style={{ background: "var(--primary-gradient)", border: "none" }}
                          disabled={generatingResume}
                        >
                          {generatingResume ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Gemini Analyzing Job Description...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-lightning-charge-fill me-2"></i>Analyze & Generate Tailored Resume
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* AI Tailored Output Section */}
                {tailoredResume && (
                  <div className="d-flex flex-column gap-4">
                    {/* Skills Gap Analysis Card */}
                    <div className="card p-4 border-0" style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--card-border)",
                      borderRadius: "16px"
                    }}>
                      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold text-white mb-0">
                          <i className="bi bi-graph-up-arrow text-success me-2"></i>Candidate Alignment Score
                        </h5>
                        <span className="badge bg-success fs-6 px-3 py-2 rounded-pill">
                          {tailoredResume.matchScore}% Match Score
                        </span>
                      </div>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="p-3 rounded-4" style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
                            <h6 className="text-success fw-bold mb-2">
                              <i className="bi bi-check-circle-fill me-1"></i>Matched Skills in Profile ({tailoredResume.matchedSkills?.length || 0})
                            </h6>
                            <div className="d-flex flex-wrap gap-1">
                              {tailoredResume.matchedSkills?.map((s, idx) => (
                                <span key={idx} className="badge bg-success-subtle text-success border border-success px-2 py-1">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="p-3 rounded-4" style={{ background: "rgba(14, 165, 233, 0.12)", border: "1px solid rgba(14, 165, 233, 0.3)" }}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="text-info fw-bold mb-0">
                                <i className="bi bi-stars text-warning me-1"></i>Auto-Added From JD To CV ({tailoredResume.addedFromJdSkills?.length || 0})
                              </h6>
                              {tailoredResume.addedFromJdSkills?.length > 0 && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-info rounded-pill py-0 px-2"
                                  style={{ fontSize: "11px" }}
                                  onClick={handleAddJdSkillsToPortfolio}
                                >
                                  <i className="bi bi-plus-circle me-1"></i>Save to Portfolio
                                </button>
                              )}
                            </div>
                            <div className="d-flex flex-wrap gap-1">
                              {tailoredResume.addedFromJdSkills && tailoredResume.addedFromJdSkills.length > 0 ? (
                                tailoredResume.addedFromJdSkills.map((s, idx) => (
                                  <span key={idx} className="badge bg-info-subtle text-info border border-info px-2 py-1">
                                    + {s}
                                  </span>
                                ))
                              ) : (
                                <small className="text-white-50">All required skills were already in your profile!</small>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Toolbar */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                      <h5 className="text-white fw-bold mb-0">
                        <i className="bi bi-file-earmark-pdf-fill text-danger me-2"></i>ATS-Optimized Resume Preview
                      </h5>

                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-info rounded-pill px-3"
                          onClick={handleSaveResumeToHistory}
                          disabled={savingResume}
                        >
                          <i className="bi bi-bookmark-fill me-1"></i>
                          {savingResume ? "Saving..." : "Save to History"}
                        </button>

                        <button
                          className="btn btn-danger rounded-pill px-4 fw-bold"
                          onClick={() => downloadResumePDF(
                            "printable-resume-canvas",
                            portfolio?.personalInfo?.fullName || "Candidate",
                            tailoredResume.targetRole || "Role"
                          )}
                        >
                          <i className="bi bi-download me-1"></i>Download ATS PDF
                        </button>
                      </div>
                    </div>

                    {/* ATS RESUME CANVAS (Printable A4 preview) */}
                    <div className="card p-3 p-md-4 border-0" style={{ background: "#334155", borderRadius: "16px" }}>
                      <div id="printable-resume-canvas" className="resume-paper">
                        {/* Header */}
                        <div className="text-center pb-3 border-bottom border-2 border-primary">
                          <h2 className="fw-bolder mb-1" style={{ color: "#0f172a", textTransform: "uppercase", letterSpacing: "1px" }}>
                            {portfolio?.personalInfo?.fullName || "Candidate Name"}
                          </h2>
                          <div className="fw-bold mb-2" style={{ color: "#2563eb", fontSize: "15px" }}>
                            {tailoredResume.targetRole || portfolio?.personalInfo?.title}
                          </div>
                          <div className="small text-muted d-flex justify-content-center flex-wrap gap-3">
                            {portfolio?.personalInfo?.email && <span>📧 {portfolio.personalInfo.email}</span>}
                            {portfolio?.personalInfo?.phone && <span>📱 {portfolio.personalInfo.phone}</span>}
                            {portfolio?.personalInfo?.location && <span>📍 {portfolio.personalInfo.location}</span>}
                            {portfolio?.socialLinks?.github && <span>💻 github.com</span>}
                            {portfolio?.socialLinks?.linkedin && <span>🔗 linkedin.com</span>}
                          </div>
                        </div>

                        {/* Professional Summary */}
                        <div className="resume-item">
                          <div className="resume-section-title">Professional Summary</div>
                          <p style={{ fontSize: "13px", lineHeight: "1.6", color: "#334155" }}>
                            {tailoredResume.tailoredSummary}
                          </p>
                        </div>

                        {/* Skills */}
                        <div className="resume-item">
                          <div className="resume-section-title">Core Competencies & Technical Skills</div>
                          <div className="d-flex flex-wrap gap-1">
                            {(tailoredResume.tailoredSkills || tailoredResume.matchedSkills || []).map((s, idx) => (
                              <span key={idx} className="resume-skill-badge">{s}</span>
                            ))}
                          </div>
                        </div>

                        {/* Tailored Experience */}
                        <div className="resume-item">
                          <div className="resume-section-title">Professional Experience</div>
                          {tailoredResume.selectedExperience?.map((exp, idx) => (
                            <div key={idx} className="mb-3">
                              <div className="d-flex justify-content-between align-items-baseline">
                                <span className="fw-bold" style={{ fontSize: "14px", color: "#0f172a" }}>{exp.role}</span>
                                <span className="small text-muted">{exp.startDate} – {exp.endDate}</span>
                              </div>
                              <div className="fw-semibold small text-primary mb-1">{exp.company}</div>
                              <ul className="mb-0 ps-3" style={{ fontSize: "12.5px", color: "#475569" }}>
                                {exp.highlights?.map((h, hIdx) => (
                                  <li key={hIdx}>{h}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Tailored Projects */}
                        <div className="resume-item">
                          <div className="resume-section-title">Featured Engineering Projects</div>
                          {tailoredResume.selectedProjects?.map((proj, idx) => (
                            <div key={idx} className="mb-2">
                              <div className="d-flex justify-content-between">
                                <span className="fw-bold" style={{ fontSize: "13.5px", color: "#0f172a" }}>{proj.title}</span>
                                {proj.techStack && (
                                  <span className="small text-muted">{proj.techStack.slice(0, 4).join(", ")}</span>
                                )}
                              </div>
                              <p className="mb-0" style={{ fontSize: "12.5px", color: "#475569" }}>{proj.description}</p>
                            </div>
                          ))}
                        </div>

                        {/* Education */}
                        {portfolio?.education && portfolio.education.length > 0 && (
                          <div className="resume-item">
                            <div className="resume-section-title">Education</div>
                            {portfolio.education.map((edu, idx) => (
                              <div key={idx} className="d-flex justify-content-between small">
                                <div>
                                  <span className="fw-bold">{edu.degree}</span> – {edu.institution}
                                </div>
                                <span className="text-muted">{edu.startYear} – {edu.endYear}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 9: RESUME HISTORY (MODULE 4) */}
            {activeTab === "history" && (
              <div className="card p-4 border-0" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "16px" }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 className="fw-bold text-white mb-0">Saved Resume History</h4>
                    <small className="text-white-50">Manage previously generated tailored resumes</small>
                  </div>
                  <button className="btn btn-sm btn-outline-info rounded-pill px-3" onClick={fetchHistory}>
                    <i className="bi bi-arrow-clockwise me-1"></i>Refresh
                  </button>
                </div>

                {loadingHistory ? (
                  <div className="text-center py-5">
                    <span className="spinner-border text-info"></span>
                  </div>
                ) : resumeHistory.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-dark table-hover align-middle custom-table">
                      <thead>
                        <tr>
                          <th>Target Role</th>
                          <th>Target Company</th>
                          <th>Match Score</th>
                          <th>Saved Date</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumeHistory.map((res) => (
                          <tr key={res._id}>
                            <td className="fw-bold text-white">{res.targetRole}</td>
                            <td><span className="badge bg-secondary">{res.targetCompany || "General"}</span></td>
                            <td>
                              <span className="badge bg-success-subtle text-success border border-success">
                                {res.matchScore}% Match
                              </span>
                            </td>
                            <td className="text-white-50 small">{new Date(res.createdAt).toLocaleDateString()}</td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-info rounded-pill me-2"
                                onClick={() => {
                                  setTailoredResume(res);
                                  setActiveTab("ai-resume");
                                }}
                              >
                                <i className="bi bi-eye me-1"></i>Preview
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger rounded-pill"
                                onClick={() => handleDeleteResumeHistory(res._id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-folder2-open fs-1 d-block mb-2 text-white-50"></i>
                    No saved resumes yet. Use the <strong>AI Resume Builder</strong> tab to create one!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
