const router = require('express').Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get tasks
router.get('/', verifyToken, async (req, res) => {
    try {
        let rows;
        if (req.user.role === 'admin') {
            [rows] = await db.query(`
        SELECT t.*, u.name as assigned_name, p.name as project_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN projects p ON t.project_id = p.id
      `);
        } else {
            [rows] = await db.query(`
        SELECT t.*, u.name as assigned_name, p.name as project_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.assigned_to = ?`, [req.user.id]
            );
        }
        res.json(rows);
    } catch { res.status(500).json({ message: 'Server error' }); }
});

// Create task (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const { title, description, project_id, assigned_to, due_date, priority } = req.body;
    try {
        await db.query(
            'INSERT INTO tasks (title, description, project_id, assigned_to, created_by, due_date, priority) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description, project_id, assigned_to, req.user.id, due_date, priority]
        );
        res.status(201).json({ message: 'Task created' });
    } catch { res.status(500).json({ message: 'Server error' }); }
});

// Update task status
router.patch('/:id/status', verifyToken, async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Status updated' });
    } catch { res.status(500).json({ message: 'Server error' }); }
});

// Dashboard
router.get('/stats', verifyToken, async (req, res) => {
    try {
        let total, byStatus, overdue, recentActivity = [];
        
        if (req.user.role === 'admin') {
            [total] = await db.query('SELECT COUNT(*) as count FROM tasks');
            [byStatus] = await db.query('SELECT status, COUNT(*) as count FROM tasks GROUP BY status');
            [overdue] = await db.query("SELECT COUNT(*) as count FROM tasks WHERE due_date < CURDATE() AND status != 'done'");
            [recentActivity] = await db.query(`
                SELECT t.id, t.title, t.status, t.created_at, p.name as project_name, u.name as assigned_name 
                FROM tasks t 
                LEFT JOIN projects p ON t.project_id = p.id
                LEFT JOIN users u ON t.assigned_to = u.id
                ORDER BY t.created_at DESC LIMIT 5
            `);
        } else {
            [total] = await db.query('SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ?', [req.user.id]);
            [byStatus] = await db.query('SELECT status, COUNT(*) as count FROM tasks WHERE assigned_to = ? GROUP BY status', [req.user.id]);
            [overdue] = await db.query("SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ? AND due_date < CURDATE() AND status != 'done'", [req.user.id]);
            [recentActivity] = await db.query(`
                SELECT t.id, t.title, t.status, t.created_at, p.name as project_name 
                FROM tasks t 
                LEFT JOIN projects p ON t.project_id = p.id
                WHERE t.assigned_to = ?
                ORDER BY t.created_at DESC LIMIT 5
            `, [req.user.id]);
        }
        res.json({ total: total[0].count, byStatus, overdue: overdue[0].count, recentActivity });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: 'Server error' }); 
    }
});
// Delete task (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
        res.json({ message: 'Task deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;