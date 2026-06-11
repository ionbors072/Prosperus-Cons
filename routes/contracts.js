const express = require('express');
const db      = require('../config/db');
const router  = express.Router();

router.get('/', async (req, res) => {
    const { client_id } = req.query;
    const [rows] = client_id
        ? await db.execute('SELECT * FROM contracts WHERE client_id = ?', [client_id])
        : await db.execute('SELECT * FROM contracts');
    res.json({ contracts: rows });
});

router.post('/', async (req, res) => {
    const { client_id, client_email, name, address, type, price, status, eta, progress } = req.body;
    const [result] = await db.execute(
        'INSERT INTO contracts (client_id,client_email,name,address,type,price,status,eta,progress) VALUES (?,?,?,?,?,?,?,?,?)',
        [client_id, client_email, name, address, type, price, status, eta, progress]
    );
    res.json({ id: result.insertId });
});

router.patch('/:id', async (req, res) => {
    const { name, address, type, price, progress, status, eta } = req.body;
    await db.execute(
        'UPDATE contracts SET name=?,address=?,type=?,price=?,progress=?,status=?,eta=? WHERE id=?',
        [name, address, type, price, progress, status, eta, req.params.id]
    );
    res.json({ ok: true });
});

module.exports = router;