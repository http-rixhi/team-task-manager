import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const links = [
        { to: '/dashboard', icon: '📊', label: 'Dashboard' },
        { to: '/projects', icon: '📁', label: 'Projects' },
        { to: '/tasks', icon: '✅', label: 'Tasks' },
        { to: '/users', icon: '👥', label: 'Users', adminOnly: true },
    ];

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <h1>
                    <span className="sidebar-brand-icon">⚡</span>
                    TaskManager
                </h1>
            </div>

            <nav className="sidebar-nav">
                {links.map(link => {
                    if (link.adminOnly && user?.role !== 'admin') return null;
                    return (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={`sidebar-link ${location.pathname === link.to ? 'active' : ''}`}
                        >
                            <span className="sidebar-link-icon">{link.icon}</span>
                            {link.label}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">
                        {getInitials(user?.name)}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user?.name}</div>
                        <div className="sidebar-user-role">{user?.role}</div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="btn-logout"
                        title="Sign out"
                    >
                        📴
                    </button>
                </div>
            </div>
        </aside>
    );
}