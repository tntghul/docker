import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllUsers } from '../api/userApi.js';

const Dashboard = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Load logged-in user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing stored user", e);
            }
        }

        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchAllUsers();
            if (Array.isArray(data)) {
                setUsers(data);
            } else if (data.users && Array.isArray(data.users)) {
                setUsers(data.users);
            } else {
                setUsers([]);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch users from database');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    // Filter users by search term
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users;
        const term = searchTerm.toLowerCase();
        return users.filter(u => 
            (u.email && u.email.toLowerCase().includes(term)) ||
            (u._id && u._id.toLowerCase().includes(term))
        );
    }, [users, searchTerm]);

    const getUserInitial = (email) => {
        return email ? email.charAt(0).toUpperCase() : 'U';
    };

    return (
        <div className="min-vh-100 p-3 p-md-4 position-relative">
            {/* Ambient Background Glow Orbs */}
            <div className="ambient-glow">
                <div className="ambient-blob-1"></div>
                <div className="ambient-blob-2"></div>
            </div>

            <div className="container position-relative z-1" style={{ maxWidth: '1100px' }}>
                
                {/* Navbar / Top Bar */}
                <div className="glass-card p-3 p-md-4 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="brand-icon-badge mb-0" style={{ width: '46px', height: '46px', borderRadius: '14px', fontSize: '20px' }}>
                            <i className="bi bi-grid-1x2-fill"></i>
                        </div>
                        <div>
                            <h4 className="fw-bold mb-0 text-white">Portfolio Dashboard</h4>
                            <span className="text-muted small">Live Backend & Database Sync</span>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <button 
                            className="btn btn-outline-light btn-sm px-3 py-2 rounded-3 d-flex align-items-center gap-2"
                            onClick={loadUsers} 
                            disabled={loading}
                            style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)' }}
                        >
                            <i className={`bi bi-arrow-repeat ${loading ? 'spin' : ''}`}></i>
                            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                        </button>
                        
                        <button 
                            className="btn btn-danger btn-sm px-3 py-2 rounded-3 d-flex align-items-center gap-2"
                            onClick={handleLogout}
                            style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
                        >
                            <i className="bi bi-box-arrow-right"></i>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>

                {/* Stat Metric Cards */}
                <div className="row g-3 mb-4">
                    {/* Active User Card */}
                    <div className="col-12 col-md-4">
                        <div className="dashboard-stat-card d-flex align-items-center gap-3">
                            <div className="stat-icon stat-icon-cyan">
                                <i className="bi bi-person-badge-fill"></i>
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-muted small fw-semibold">Current Session</div>
                                <div className="text-white fw-bold text-truncate" title={currentUser?.email || 'Guest'}>
                                    {currentUser?.email || 'Guest User'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Registered Users */}
                    <div className="col-12 col-md-4">
                        <div className="dashboard-stat-card d-flex align-items-center gap-3">
                            <div className="stat-icon stat-icon-purple">
                                <i className="bi bi-people-fill"></i>
                            </div>
                            <div>
                                <div className="text-muted small fw-semibold">Total Users</div>
                                <div className="text-white fw-bold fs-5">{users.length} Registered</div>
                            </div>
                        </div>
                    </div>

                    {/* MongoDB Status */}
                    <div className="col-12 col-md-4">
                        <div className="dashboard-stat-card d-flex align-items-center gap-3">
                            <div className="stat-icon stat-icon-green">
                                <i className="bi bi-database-check"></i>
                            </div>
                            <div>
                                <div className="text-muted small fw-semibold">MongoDB Atlas</div>
                                <div className="text-white fw-bold d-flex align-items-center gap-2">
                                    <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2 py-1">
                                        ● Connected
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Users Table Section */}
                <div className="glass-card p-4">
                    
                    {/* Table Header with Search */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
                        <div>
                            <h5 className="fw-bold mb-1 text-white">Registered Users Directory</h5>
                            <span className="text-muted small">Fetched directly from MongoDB collection</span>
                        </div>

                        {/* Search Input */}
                        <div className="input-icon-wrapper" style={{ minWidth: '240px' }}>
                            <i className="bi bi-search input-icon-left" style={{ fontSize: '14px' }}></i>
                            <input 
                                type="text"
                                className="form-control-custom py-2 ps-5 pe-3"
                                style={{ fontSize: '13.5px', borderRadius: '12px' }}
                                placeholder="Search by email or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Feedback Messages */}
                    {error && (
                        <div className="alert-custom-danger mb-4">
                            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                            <div className="flex-grow-1">{error}</div>
                            <button className="btn btn-outline-light btn-sm ms-2" onClick={loadUsers}>
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary mb-3" style={{ width: '2.5rem', height: '2.5rem' }} role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <div className="text-muted">Fetching latest users from database...</div>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="display-6 text-muted mb-3">
                                <i className="bi bi-inbox"></i>
                            </div>
                            <h6 className="text-white fw-semibold">
                                {searchTerm ? 'No matching users found' : 'No users found in database'}
                            </h6>
                            <p className="text-muted small">
                                {searchTerm ? 'Try a different search keyword' : 'Create a new user on the signup page to see it here!'}
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table custom-table mb-0">
                                <thead>
                                    <tr>
                                        <th style={{ width: '60px' }}>#</th>
                                        <th>User</th>
                                        <th>User ID</th>
                                        <th>Registered Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u, index) => (
                                        <tr key={u._id || index}>
                                            <td className="text-muted">{index + 1}</td>
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="user-avatar-badge">
                                                        {getUserInitial(u.email)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold text-white">{u.email}</div>
                                                        {currentUser?.email === u.email && (
                                                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0" style={{ fontSize: '10.5px' }}>
                                                                You
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <code className="text-info bg-dark bg-opacity-50 px-2 py-1 rounded small border border-secondary border-opacity-25">
                                                    {u._id}
                                                </code>
                                            </td>
                                            <td className="text-muted small">
                                                <i className="bi bi-calendar3 me-1"></i>
                                                {u.createdAt ? new Date(u.createdAt).toLocaleString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : 'Recent'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
