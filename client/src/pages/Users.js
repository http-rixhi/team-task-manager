import { useEffect, useState } from 'react';
import axios from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function Users() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);

    const fetchUsers = () => {
        axios.get('/auth/users').then(res => setUsers(res.data)).catch(console.error);
    };

    useEffect(() => {
        if (user.role === 'admin') fetchUsers();
    }, [user.role]);

    const handleRoleChange = async (id, newRole) => {
        if (id === user.id) {
            alert("You cannot change your own role.");
            return;
        }
        try {
            await axios.patch(`/auth/users/${id}/role`, { role: newRole });
            fetchUsers();
        } catch (err) {
            alert('Error updating role');
        }
    };

    const handleDelete = async (id) => {
        if (id === user.id) {
            alert("You cannot delete yourself.");
            return;
        }
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`/auth/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting user');
        }
    };

    if (user.role !== 'admin') {
        return (
            <div className="app-layout">
                <Navbar />
                <main className="main-content">
                    <div className="empty-state">
                        <div className="empty-state-icon">🔒</div>
                        <h3>Access Denied</h3>
                        <p>You must be an admin to view this page.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>User Management</h1>
                        <p>Manage team members and roles</p>
                    </div>
                </div>

                <div className="tasks-table-wrap">
                    <table className="tasks-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td className="task-title">{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <select
                                            className="status-select"
                                            value={u.role}
                                            onChange={e => handleRoleChange(u.id, e.target.value)}
                                            disabled={u.id === user.id}
                                        >
                                            <option value="member">Member</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleDelete(u.id)}
                                            style={{ background: 'none', border: 'none', cursor: u.id === user.id ? 'not-allowed' : 'pointer', fontSize: '1.2rem', color: u.id === user.id ? 'var(--gray-300)' : 'var(--danger)' }}
                                            title="Delete User"
                                            disabled={u.id === user.id}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
