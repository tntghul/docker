import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../api/userApi.js';

const Signup = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.email || !formData.password) {
            setError('Please fill in all required fields.');
            return;
        }

        if (formData.password.length < 4) {
            setError('Password must be at least 4 characters long.');
            return;
        }

        setLoading(true);

        try {
            let res;
            if (isLogin) {
                res = await loginUser(formData);
                setSuccess('Welcome back! Logging you in...');
            } else {
                res = await registerUser(formData);
                setSuccess('Account created successfully! Preparing dashboard...');
            }

            if (res.user) {
                localStorage.setItem('user', JSON.stringify(res.user));
            }

            setTimeout(() => {
                navigate('/dashboard');
            }, 900);
        } catch (err) {
            setError(err.message || 'Unable to connect to backend server.');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (mode) => {
        setIsLogin(mode === 'login');
        setError('');
        setSuccess('');
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative">
            {/* Ambient Background Glow Orbs */}
            <div className="ambient-glow">
                <div className="ambient-blob-1"></div>
                <div className="ambient-blob-2"></div>
            </div>

            {/* Auth Glass Card Container */}
            <div className="auth-container">
                <div className="glass-card p-4 p-sm-5">
                    
                    {/* Header Branding */}
                    <div className="text-center mb-4">
                        <div className="brand-icon-badge">
                            <i className={isLogin ? "bi bi-box-arrow-in-right" : "bi bi-person-fill-lock"}></i>
                        </div>
                        <h2 className="auth-title">
                            {isLogin ? 'Welcome Back' : 'Create an Account'}
                        </h2>
                        <p className="auth-subtitle">
                            {isLogin 
                                ? 'Enter your credentials to access your account' 
                                : 'Join our developer platform in a few clicks'}
                        </p>
                    </div>

                    {/* Mode Switch Tabs */}
                    <div className="mode-switch-wrapper">
                        <button
                            type="button"
                            className={`mode-switch-btn ${!isLogin ? 'active' : ''}`}
                            onClick={() => switchMode('signup')}
                        >
                            <i className="bi bi-person-plus me-1"></i> Sign Up
                        </button>
                        <button
                            type="button"
                            className={`mode-switch-btn ${isLogin ? 'active' : ''}`}
                            onClick={() => switchMode('login')}
                        >
                            <i className="bi bi-box-arrow-in-right me-1"></i> Log In
                        </button>
                    </div>

                    {/* Feedback Messages */}
                    {error && (
                        <div className="alert-custom-danger">
                            <i className="bi bi-exclamation-octagon-fill fs-5"></i>
                            <div>{error}</div>
                        </div>
                    )}

                    {success && (
                        <div className="alert-custom-success">
                            <i className="bi bi-check-circle-fill fs-5"></i>
                            <div>{success}</div>
                        </div>
                    )}

                    {/* Form Fields */}
                    <form onSubmit={handleSubmit} noValidate>
                        {/* Email Input */}
                        <div className="form-group-custom">
                            <label className="form-label-custom" htmlFor="userEmail">
                                Email Address
                            </label>
                            <div className="input-icon-wrapper">
                                <i className="bi bi-envelope input-icon-left"></i>
                                <input
                                    type="email"
                                    id="userEmail"
                                    name="email"
                                    className="form-control-custom"
                                    placeholder="alex@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="form-group-custom mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <label className="form-label-custom mb-0" htmlFor="userPassword">
                                    Password
                                </label>
                                {isLogin && (
                                    <span className="text-muted small" style={{ fontSize: '12px' }}>
                                        Default Secure
                                    </span>
                                )}
                            </div>
                            <div className="input-icon-wrapper">
                                <i className="bi bi-shield-lock input-icon-left"></i>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="userPassword"
                                    name="password"
                                    className="form-control-custom"
                                    placeholder="••••••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn-gradient-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span>{isLogin ? 'Sign In to Account' : 'Create Free Account'}</span>
                                    <i className="bi bi-arrow-right"></i>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Bottom Helper Switch */}
                    <div className="auth-footer-text">
                        {isLogin ? "Don't have an account yet?" : "Already registered?"}{' '}
                        <span
                            className="auth-footer-link ms-1"
                            onClick={() => switchMode(isLogin ? 'signup' : 'login')}
                        >
                            {isLogin ? 'Sign up now' : 'Log in here'}
                        </span>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Signup;
