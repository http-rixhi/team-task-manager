import { useEffect, useState } from 'react';
import axios from '../api/axios';
import Navbar from '../components/Navbar';
import '../App.css';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/tasks/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const getStatusCount = (status) => {
        if (!stats?.byStatus) return 0;
        const found = stats.byStatus.find(s => s.status === status);
        return found ? found.count : 0;
    };

    if (loading) return (
        <div className="app-layout">
            <Navbar />
            <div className="main-content">
                <div className="loading-spinner" />
            </div>
        </div>
    );

    const todoCount = getStatusCount('todo');
    const progressCount = getStatusCount('in_progress');
    const doneCount = getStatusCount('done');
    const total = stats?.total || 0;

    const getPercent = (count) => total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p>Overview of your team's progress</p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="stats-grid">
                    <div className="stat-card orange" style={{ animationDelay: '0ms' }}>
                        <div className="stat-icon">📋</div>
                        <div className="stat-value">{total}</div>
                        <div className="stat-label">Total Tasks</div>
                    </div>
                    <div className="stat-card warning" style={{ animationDelay: '80ms' }}>
                        <div className="stat-icon">📝</div>
                        <div className="stat-value">{todoCount}</div>
                        <div className="stat-label">To Do</div>
                    </div>
                    <div className="stat-card info" style={{ animationDelay: '160ms' }}>
                        <div className="stat-icon">🔄</div>
                        <div className="stat-value">{progressCount}</div>
                        <div className="stat-label">In Progress</div>
                    </div>
                    <div className="stat-card danger" style={{ animationDelay: '240ms' }}>
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-value">{stats?.overdue || 0}</div>
                        <div className="stat-label">Overdue</div>
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="card" style={{ animationDelay: '300ms' }}>
                    <h2 className="card-title">Task Status Breakdown</h2>
                    
                    <div className="progress-row">
                        <div className="progress-header">
                            <span className="progress-label">📝 To Do</span>
                            <span className="progress-count">{todoCount} tasks • {getPercent(todoCount)}%</span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill orange" style={{ width: `${getPercent(todoCount)}%` }} />
                        </div>
                    </div>

                    <div className="progress-row">
                        <div className="progress-header">
                            <span className="progress-label">🔄 In Progress</span>
                            <span className="progress-count">{progressCount} tasks • {getPercent(progressCount)}%</span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill info" style={{ width: `${getPercent(progressCount)}%` }} />
                        </div>
                    </div>

                    <div className="progress-row">
                        <div className="progress-header">
                            <span className="progress-label">✅ Done</span>
                            <span className="progress-count">{doneCount} tasks • {getPercent(doneCount)}%</span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill success" style={{ width: `${getPercent(doneCount)}%` }} />
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card" style={{ animationDelay: '400ms', marginTop: '20px' }}>
                    <h2 className="card-title">Recent Activity</h2>
                    {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                        <div className="activity-list" style={{ marginTop: '16px' }}>
                            {stats.recentActivity.map(activity => (
                                <div key={activity.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--gray-800)' }}>{activity.title}</div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '4px', textTransform: 'capitalize' }}>
                                            {activity.project_name} • {new Date(activity.created_at).toLocaleDateString()}
                                            {activity.assigned_name ? ` • Assigned to ${activity.assigned_name}` : ''}
                                        </div>
                                    </div>
                                    <span className={`badge badge-${activity.status === 'in_progress' ? 'progress' : activity.status}`} style={{ textTransform: 'capitalize' }}>
                                        {activity.status.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--gray-500)', marginTop: '16px', fontSize: '0.9rem' }}>No recent activity found.</p>
                    )}
                </div>
            </main>
        </div>
    );
}