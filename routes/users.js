const express = require('express');
const db      = require('../config/db');
const router  = express.Router();

router.get('/', (req, res) => {
    const rows = db.prepare('SELECT id,name,email,role,spec,phone FROM users').all();
    res.json({ users: rows });
});

module.exports = router;