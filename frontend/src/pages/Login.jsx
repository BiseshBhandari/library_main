import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const API_URL = 'http://localhost:5001/api/auth';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid username or password');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            if (data.user.role === 'Admin') {
                navigate('/admin/manage-book');

            } else if (data.user.role === 'Member') {
                navigate('/dashboard');
            }
            else if (data.user.role === 'Staff') {
                navigate('/staff/StaffDashboard');
            } else {
                throw new Error('Invalid user role');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-containe">
            <div className="auth-card">
                <h1 className="site-title">BookHaven</h1>
                <h2 className="auth-heading">Log into your account</h2>
                <p className="auth-subtext">
                    Enter your email and password to log into your account
                </p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="auth-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="auth-input"
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} className="auth-button">
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>

                <p className="auth-link">Forgot password?</p>
                <p className="auth-link">
                    Don’t have an account? <Link to="/register" className="link">Sign up.</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
