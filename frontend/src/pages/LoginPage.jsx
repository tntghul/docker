import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/client";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint = isRegister ? authApi.register : authApi.login;
      const res = await endpoint(formData);

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user || { email: formData.email }));
        setSuccess("Authentication successful! Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/admin");
        }, 1000);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.response?.data?.message || "Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3" style={{ background: "var(--bg-primary)" }}>
      <div className="card p-4 p-md-5 border-0 shadow-lg" style={{
        maxWidth: "450px",
        width: "100%",
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: "20px"
      }}>
        <div className="text-center mb-4">
          <div className="mx-auto mb-3" style={{
            width: "56px",
            height: "56px",
            background: "var(--primary-gradient)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "26px",
            boxShadow: "0 8px 25px var(--primary-glow)"
          }}>
            <i className="bi bi-shield-lock"></i>
          </div>
          <h3 className="fw-bolder text-white mb-1">
            {isRegister ? "Create Admin Account" : "Admin Dashboard Login"}
          </h3>
          <p className="text-white-50 small">
            {isRegister ? "Initialize admin credentials for the portfolio CMS" : "Sign in to manage portfolio content & AI resume builder"}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success py-2 small d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill"></i>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="mb-3">
              <label className="form-label text-white-50 small">Admin Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Ayansh Admin"
                style={{ background: "rgba(255, 255, 255, 0.06)", borderColor: "rgba(255, 255, 255, 0.15)", color: "#fff" }}
                required={isRegister}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label text-white-50 small">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="admin@example.com"
              style={{ background: "rgba(255, 255, 255, 0.06)", borderColor: "rgba(255, 255, 255, 0.15)", color: "#fff" }}
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-white-50 small">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              style={{ background: "rgba(255, 255, 255, 0.06)", borderColor: "rgba(255, 255, 255, 0.15)", color: "#fff" }}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 rounded-pill fw-bold"
            style={{ background: "var(--primary-gradient)", border: "none" }}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              <i className="bi bi-box-arrow-in-right me-2"></i>
            )}
            {isRegister ? "Register Admin" : "Sign In to Dashboard"}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top border-secondary border-opacity-25">
          <button
            type="button"
            className="btn btn-link text-info small text-decoration-none"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
          >
            {isRegister ? "Already registered? Sign In here" : "First time setup? Create Admin Account"}
          </button>

          <div className="mt-2">
            <Link to="/" className="text-white-50 small text-decoration-none">
              <i className="bi bi-arrow-left me-1"></i>Back to Public Portfolio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
