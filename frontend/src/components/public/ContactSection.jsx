import React, { useState } from "react";

const ContactSection = ({ personalInfo, socialLinks }) => {
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      setFormSent(false);
    }, 4000);
  };

  return (
    <section id="contact" className="py-5">
      <div className="container py-4">
        <div className="text-center mb-5">
          <h6 className="text-info text-uppercase fw-bold letter-spacing-1">Get In Touch</h6>
          <h2 className="fw-bold text-white">Let's Connect & Collaborate</h2>
          <div className="mx-auto" style={{ width: "60px", height: "4px", background: "var(--primary-gradient)", borderRadius: "2px" }}></div>
        </div>

        <div className="row g-4 justify-content-center">
          <div className="col-lg-5">
            <div className="card p-4 border-0 h-100" style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
              borderRadius: "16px"
            }}>
              <h4 className="fw-bold text-white mb-3">Contact Information</h4>
              <p className="text-white-50 mb-4" style={{ fontSize: "14.5px" }}>
                Whether you have an upcoming project, a full-time role, or an interesting engineering problem, I'd love to hear from you.
              </p>

              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                    width: "44px",
                    height: "44px",
                    background: "rgba(99, 102, 241, 0.2)",
                    color: "#818cf8"
                  }}>
                    <i className="bi bi-envelope-at fs-5"></i>
                  </div>
                  <div>
                    <small className="text-muted d-block">Email</small>
                    <a href={`mailto:${personalInfo?.email || "dev@example.com"}`} className="text-white text-decoration-none fw-semibold">
                      {personalInfo?.email || "dev@example.com"}
                    </a>
                  </div>
                </div>

                {personalInfo?.phone && (
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                      width: "44px",
                      height: "44px",
                      background: "rgba(16, 185, 129, 0.2)",
                      color: "#34d399"
                    }}>
                      <i className="bi bi-telephone fs-5"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Phone</small>
                      <span className="text-white fw-semibold">{personalInfo.phone}</span>
                    </div>
                  </div>
                )}

                {personalInfo?.location && (
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                      width: "44px",
                      height: "44px",
                      background: "rgba(244, 63, 94, 0.2)",
                      color: "#fb7185"
                    }}>
                      <i className="bi bi-geo-alt fs-5"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Location</small>
                      <span className="text-white fw-semibold">{personalInfo.location}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card p-4 border-0 h-100" style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
              borderRadius: "16px"
            }}>
              <h4 className="fw-bold text-white mb-3">Send a Message</h4>

              {formSent && (
                <div className="alert alert-success d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Message sent successfully! Thank you for reaching out.</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-white-50 small">Your Name</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ background: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.15)", color: "#fff" }}
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-white-50 small">Your Email</label>
                    <input
                      type="email"
                      className="form-control"
                      style={{ background: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.15)", color: "#fff" }}
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label text-white-50 small">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ background: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.15)", color: "#fff" }}
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label text-white-50 small">Message</label>
                    <textarea
                      rows="4"
                      className="form-control"
                      style={{ background: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.15)", color: "#fff" }}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-primary px-4 py-2 rounded-pill fw-bold"
                      style={{ background: "var(--primary-gradient)", border: "none" }}
                    >
                      <i className="bi bi-send-fill me-2"></i>Send Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
