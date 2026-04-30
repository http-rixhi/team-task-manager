import { useEffect, useState } from 'react';
import axios from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function Projects() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ name: '', description: '' });
    const [showForm, setShowForm] = useState(false);
    const [memberForm, setMemberForm] = useState({ projectId: null, userId: '' });

    const fetchProjects = () => {
        axios.get('/projects').then(res => setProjects(res.data));
    };

    const fetchUsers = () => {
        axios.get('/auth/users').then(res => setUsers(res.data));
    };

    useEffect(() => {
        fetchProjects();
        if (user.role === 'admin') fetchUsers();
    }, [user.role]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/projects', form);
            setForm({ name: '', description: '' });
            setShowForm(false);
            fetchProjects();
        } catch (err) {
            alert('Error creating project');
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/projects/${memberForm.projectId}/members`, {
                user_id: memberForm.userId
            });
            alert('Member added!');
            setMemberForm({ projectId: null, userId: '' });
        } catch {
            alert('Error adding member');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project? All tasks and members will also be deleted.')) return;
        try {
            await axios.delete(`/projects/${id}`);
            fetchProjects();
        } catch (err) {
            alert('Error deleting project');
        }
    };

    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Projects</h1>
                        <p>Manage your workspaces and team members</p>
                    </div>
                    {user.role === 'admin' && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="btn btn-primary"
                        >
                            + New Project
                        </button>
                    )}
                </div>

                {/* Projects List */}
                {projects.length === 0 ? (
                     <div className="card empty-state">
                        <div className="empty-state-icon">📁</div>
                        <h3>No projects found</h3>
                        <p>Get started by creating a new project workspace.</p>
                     </div>
                ) : (
                    <div className="projects-grid">
                        {projects.map((project, index) => (
                            <div 
                                key={project.id} 
                                className="project-card" 
                                style={{ animationDelay: `${index * 60}ms` }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3>{project.name}</h3>
                                    {user.role === 'admin' && (
                                        <button 
                                            onClick={() => handleDelete(project.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--danger)' }}
                                            title="Delete Project"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                                <p>{project.description}</p>

                                {/* Add Member — Admin only */}
                                {user.role === 'admin' && (
                                    <div className="member-form">
                                        {memberForm.projectId === project.id ? (
                                            <form onSubmit={handleAddMember} style={{ display: 'flex', width: '100%', gap: '8px' }}>
                                                <select
                                                    value={memberForm.userId}
                                                    onChange={(e) =>
                                                        setMemberForm({ ...memberForm, userId: e.target.value })
                                                    }
                                                    required
                                                >
                                                    <option value="">Select user</option>
                                                    {users.map(u => (
                                                        <option key={u.id} value={u.id}>{u.name}</option>
                                                    ))}
                                                </select>
                                                <button type="submit" className="btn btn-primary btn-sm">Add</button>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => setMemberForm({ projectId: null, userId: '' })}
                                                >
                                                    Cancel
                                                </button>
                                            </form>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    setMemberForm({ projectId: project.id, userId: '' })
                                                }
                                                className="btn-add-member"
                                            >
                                                + Add Team Member
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Project Modal */}
                {showForm && user.role === 'admin' && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>Create New Project</h2>
                            <form onSubmit={handleCreate}>
                                <div className="form-group">
                                    <label>Project Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="E.g., Website Redesign"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        className="form-input"
                                        placeholder="What is this project about?"
                                        rows="3"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Create Project
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}