const express = require('express');
const db      = require('../config/db');
const router  = express.Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id,name,email,role,spec,phone FROM users ORDER BY id DESC');
        res.json({ users: rows });
    } catch (err) {
        console.error('GET /users error:', err);
        res.status(500).json({ message: 'Eroare la citirea utilizatorilor din baza de date' });
    }
});

module.exports = router;
