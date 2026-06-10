const express = require('express');
const db      = require('../config/db');
const router  = express.Router();

router.get('/', (req, res) => {
    const { client_id } = req.query;
    const rows = client_id
        ? db.prepare('SELECT * FROM contracts WHERE client_id = ?').all(client_id)
        : db.prepare('SELECT * FROM contracts').all();
    res.json({ contracts: rows });
});

router.post('/', (req, res) => {
    const { client_id, client_email, name, address, type, price, status, eta, progress } = req.body;
    const result = db.prepare(
        'INSERT INTO contracts (client_id,client_email,name,address,type,price,status,eta,progress) VALUES (?,?,?,?,?,?,?,?,?)'
    ).run(client_id, client_email, name, address, type, price, status, eta, progress);
    res.json({ id: result.lastInsertRowid });
});

router.patch('/:id', (req, res) => {
    const { name, address, type, price, progress, status, eta } = req.body;
    db.prepare(
        'UPDATE contracts SET name=?,address=?,type=?,price=?,progress=?,status=?,eta=? WHERE id=?'
    ).run(name, address, type, price, progress, status, eta, req.params.id);
    res.json({ ok: true });
});

module.exports = router;