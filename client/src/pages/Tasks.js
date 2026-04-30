import { useEffect, useState } from 'react';
import axios from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function Tasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', project_id: '',
        assigned_to: '', due_date: '', priority: 'medium'
    });

    const fetchTasks = () => axios.get('/tasks').then(r => setTasks(r.data));

    useEffect(() => {
        fetchTasks();
        axios.get('/projects').then(r => setProjects(r.data));
        if (user.role === 'admin') {
            axios.get('/auth/users').then(r => setUsers(r.data));
        }
    }, [user.role]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/tasks', form);
            setShowForm(false);
            setForm({
                title: '', description: '', project_id: '',
                assigned_to: '', due_date: '', priority: 'medium'
            });
            fetchTasks();
        } catch { alert('Error creating task'); }
    };

    const handleStatusChange = async (id, status) => {
        await axios.patch(`/tasks/${id}/status`, { status });
        fetchTasks();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await axios.delete(`/tasks/${id}`);
            fetchTasks();
        } catch (err) {
            alert('Error deleting task');
        }
    };

    const getPriorityBadge = (p) => {
        const cls = {
            high: 'badge-high',
            medium: 'badge-medium',
            low: 'badge-low',
        }[p] || 'badge-todo';
        return <span className={`badge ${cls}`}>{p.charAt(0).toUpperCase() + p.slice(1)}</span>;
    };

    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Tasks</h1>
                        <p>Track your assignments and progress</p>
                    </div>
                    {user.role === 'admin' && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="btn btn-primary"
                        >
                            + New Task
                        </button>
                    )}
                </div>

                {/* Tasks Table */}
                <div className="tasks-table-wrap">
                    <table className="tasks-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Project</th>
                                <th>Assigned To</th>
                                <th>Priority</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                {user.role === 'admin' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task.id}>
                                    <td className="task-title">{task.title}</td>
                                    <td>{task.project_name}</td>
                                    <td>{task.assigned_name}</td>
                                    <td>{getPriorityBadge(task.priority)}</td>
                                    <td>
                                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                                    </td>
                                    <td>
                                        <select
                                            className="status-select"
                                            value={task.status}
                                            onChange={e => handleStatusChange(task.id, e.target.value)}
                                        >
                                            <option value="todo">To Do</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="done">Done</option>
                                        </select>
                                    </td>
                                    {user.role === 'admin' && (
                                        <td>
                                            <button 
                                                onClick={() => handleDelete(task.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--danger)' }}
                                                title="Delete Task"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {tasks.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">✅</div>
                            <h3>No tasks yet</h3>
                            <p>You're all caught up!</p>
                        </div>
                    )}
                </div>

                {/* Create Task Modal */}
                {showForm && user.role === 'admin' && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>Create New Task</h2>
                            <form onSubmit={handleCreate}>
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Task Title</label>
                                        <input
                                            className="form-input"
                                            placeholder="What needs to be done?"
                                            value={form.title}
                                            onChange={e => setForm({ ...form, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Description</label>
                                        <textarea
                                            className="form-input"
                                            placeholder="Task details and instructions..."
                                            rows="3"
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Project</label>
                                        <select
                                            className="form-select"
                                            value={form.project_id}
                                            onChange={e => setForm({ ...form, project_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Project</option>
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Assign To</label>
                                        <select
                                            className="form-select"
                                            value={form.assigned_to}
                                            onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Team Member</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>{u.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Due Date</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={form.due_date}
                                            onChange={e => setForm({ ...form, due_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Priority</label>
                                        <select
                                            className="form-select"
                                            value={form.priority}
                                            onChange={e => setForm({ ...form, priority: e.target.value })}
                                        >
                                            <option value="low">Low Priority</option>
                                            <option value="medium">Medium Priority</option>
                                            <option value="high">High Priority</option>
                                        </select>
                                    </div>
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
                                        Create Task
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