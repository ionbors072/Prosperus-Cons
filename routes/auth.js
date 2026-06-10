const express = require('express');
const bcrypt  = require('bcryptjs');
const db      = require('../config/db');
const router  = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, password, role, phone } = req.body;
    if (phone && !/^\+?[0-9\s\-]{7,20}$/.test(phone))
        return res.status(400).json({ message: 'Număr de telefon invalid!' });
    if (!name || !email || !password)
        return res.status(400).json({ message: 'Câmpuri lipsă' });

    const hash = await bcrypt.hash(password, 10);
    const spec = role === 'lucrator' ? 'Lucrător General' : 'N/A - Beneficiar';

    try {
        const stmt = db.prepare(
            'INSERT INTO users (name, email, password_hash, role, spec, phone) VALUES (?,?,?,?,?,?)'
        );
        const result = stmt.run(name, email, hash, role || 'client', spec, phone || null);
        res.json({ user: { id: result.lastInsertRowid, name, email, role, spec } });
    } catch (err) {
        if (err.message.includes('UNIQUE'))
            return res.status(409).json({ message: 'Email deja înregistrat' });
        res.status(500).json({ message: 'Eroare server' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ message: 'Email sau parolă incorectă' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Email sau parolă incorectă' });

    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, spec: user.spec, phone: user.phone } });
});

module.exports = router;