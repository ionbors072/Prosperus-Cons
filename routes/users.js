const express = require('express');
const db      = require('../config/db');
const router  = express.Router();

// GET /api/users — lista utilizatori (fara parola)
router.get('/', async (req, res) => {
    const [rows] = await db.execute('SELECT id,name,email,role,spec,phone FROM users');
    res.json({ users: rows });
});

module.exports = router;