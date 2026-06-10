const express  = require('express');
const bcrypt   = require('bcryptjs');
const db       = require('../config/db');
const router   = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password, role, phone } = req.body;
    if (phone && !/^\+?[0-9\s\-]{7,20}$/.test(phone)) {
    return res.status(400).json({ message: 'Număr de telefon invalid!' });
    }
    if (!name || !email || !password) return res.status(400).json({ message: 'Câmpuri lipsă' });

    const hash = await bcrypt.hash(password, 10);
    const spec = role === 'lucrator' ? 'Lucrător General' : 'N/A - Beneficiar';

    try {
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password_hash, role, spec, phone) VALUES (?,?,?,?,?,?)',
            [name, email, hash, role || 'client', spec, phone || null]
        );
        res.json({ user: { id: result.insertId, name, email, role, spec } });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ message: 'Email deja înregistrat' });
        res.status(500).json({ message: 'Eroare server' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Email sau parolă incorectă' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Email sau parolă incorectă' });

    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, spec: user.spec, phone: user.phone } });
});

module.exports = router;