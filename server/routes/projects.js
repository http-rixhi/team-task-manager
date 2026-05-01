const router = require('express').Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM projects');
        res.json(rows);
    } catch { res.status(500).json({ message: 'Server error' }); }
});

// Create project (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const { name, description } = req.body;
    try {
        await db.query(
            'INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)',
            [name, description, req.user.id]
        );
        res.status(201).json({ message: 'Project created' });
    } catch { res.status(500).json({ message: 'Server error' }); }
});

// Add member (admin only)
router.post('/:id/members', verifyToken, isAdmin, async (req, res) => {
    const { user_id } = req.body;
    try {
        await db.query(
            'INSERT INTO project_members (project_id, user_id) VALUES (?, ?)',
            [req.params.id, user_id]
        );
        res.json({ message: 'Member added' });
    } catch { res.status(500).json({ message: 'Server error' }); }
});
// Delete project (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM tasks WHERE project_id = ?', [req.params.id]);
        await db.query('DELETE FROM project_members WHERE project_id = ?', [req.params.id]);
        await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
        res.json({ message: 'Project deleted' });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: 'Server error' }); 
    }
});

module.exports = router;