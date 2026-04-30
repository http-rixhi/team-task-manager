import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import '../App.css';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('/auth/login', form);
            login(res.data.token, res.data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-left">
                <h1>Welcome back to<br />TaskManager</h1>
                <p>Exclusive task manager for ETHARA.AI for all managers and team members to manage their tasks and projects</p>
                <div className="auth-features">
                    <div className="auth-feature">
                        <span className="auth-feature-icon">📊</span>
                        Real-time dashboard
                    </div>
                    <div className="auth-feature">
                        <span className="auth-feature-icon">👥</span>
                        Team management
                    </div>
                    <div className="auth-feature">
                        <span className="auth-feature-icon">⚡</span>
                        Smart task prioritization
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-card">
                    <h2>Sign in</h2>
                    <p className="auth-subtitle">Enter your credentials to access your account</p>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="you@ethara.ai"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Don't have an account?{' '}
                        <Link to="/signup">Create account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}