import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css'; // Reuse same styles for consistency

const API_URL = 'http://localhost:5001/api/auth';

function Register() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        if (formData.fullName.length > 100) {
            newErrors.fullName = 'Full name cannot be longer than 100 characters.';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email address.';
        }

        if (formData.password.length < 8 || formData.password.length > 50) {
            newErrors.password = 'Password must be between 8 and 50 characters.';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'The password and confirmation password do not match.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            navigate('/login');
        } catch (err) {
            setErrors({ general: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-containe">
            <div className="auth-card">
                <h1 className="site-title">BookHaven</h1>
                <h2 className="auth-heading">Create your account</h2>
                <p className="auth-subtext">
                    Enter your information to register for BookHaven
                </p>

                {errors.general && <div className="error-message">{errors.general}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="auth-input"
                            required
                        />
                        {errors.fullName && <div className="error-message">{errors.fullName}</div>}
                    </div>
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
                        {errors.email && <div className="error-message">{errors.email}</div>}
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
                        {errors.password && <div className="error-message">{errors.password}</div>}
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="auth-input"
                            required
                        />
                        {errors.confirmPassword && (
                            <div className="error-message">{errors.confirmPassword}</div>
                        )}
                    </div>
                    <button type="submit" disabled={loading} className="auth-button">
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p className="auth-link">
                    Already have an account?{' '}
                    <Link to="/login" className="link">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
