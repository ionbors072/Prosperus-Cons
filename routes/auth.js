const express  = require('express');
const bcrypt   = require('bcryptjs');
const db       = require('../config/db');
const router   = express.Router();

router.post('/register', async (req, res) => {
    const { name, password, phone } = req.body;
    const email = String(req.body.email || '').trim().toLowerCase();
    const role = req.body.role || 'client';

    if (phone && !/^\+?[0-9\s\-]{7,20}$/.test(phone)) {
        return res.status(400).json({ message: 'Număr de telefon invalid!' });
    }

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Câmpuri lipsă' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        return res.status(400).json({ message: 'Email invalid' });
    }

    if (String(password).length < 8) {
        return res.status(400).json({ message: 'Parola trebuie să aibă minim 8 caractere' });
    }

    const hash = await bcrypt.hash(password, 10);
    const spec = role === 'lucrator' ? 'Lucrător General' : 'N/A - Beneficiar';

    try {
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password_hash, role, spec, phone) VALUES (?,?,?,?,?,?)',
            [name.trim(), email, hash, role, spec, phone || null]
        );

        res.json({ user: { id: result.insertId, name: name.trim(), email, role, spec, phone: phone || null } });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email deja înregistrat' });
        }

        console.error('POST /auth/register error:', err);
        res.status(500).json({ message: 'Eroare server' });
    }
});

router.post('/login', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const { password } = req.body;

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (!rows.length) {
            return res.status(401).json({ message: 'Email sau parolă incorectă' });
        }

        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);

        if (!valid) {
            return res.status(401).json({ message: 'Email sau parolă incorectă' });
        }

        res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, spec: user.spec, phone: user.phone } });
    } catch (err) {
        console.error('POST /auth/login error:', err);
        res.status(500).json({ message: 'Eroare server' });
    }
});

module.exports = router;
