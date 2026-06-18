const express = require('express');
const db      = require('../config/db');
const router  = express.Router();

router.get('/', async (req, res) => {
    try {
        const { client_id } = req.query;

        const [rows] = client_id
            ? await db.execute('SELECT * FROM contracts WHERE client_id = ? ORDER BY id DESC', [client_id])
            : await db.execute('SELECT * FROM contracts ORDER BY id DESC');

        res.json({ contracts: rows });
    } catch (err) {
        console.error('GET /contracts error:', err);
        res.status(500).json({ message: 'Eroare la citirea contractelor din baza de date' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { client_id, client_email, name, address, type, price, status, eta, progress } = req.body;

        if (!client_id || !client_email || !name || !address || !type || !price) {
            return res.status(400).json({ message: 'Date lipsă pentru contract' });
        }

        const [result] = await db.execute(
            'INSERT INTO contracts (client_id,client_email,name,address,type,price,status,eta,progress) VALUES (?,?,?,?,?,?,?,?,?)',
            [client_id, client_email, name, address, type, price, status || 'Proiectare Tehnică Inițială', eta || 'Calculat după avizare', progress || 20]
        );

        res.json({ id: result.insertId });
    } catch (err) {
        console.error('POST /contracts error:', err);
        res.status(500).json({ message: 'Eroare la salvarea contractului' });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const { name, address, type, price, progress, status, eta } = req.body;

        const [result] = await db.execute(
            'UPDATE contracts SET name=?,address=?,type=?,price=?,progress=?,status=?,eta=? WHERE id=?',
            [name, address, type, price, progress, status, eta, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Contractul nu a fost găsit' });
        }

        res.json({ ok: true });
    } catch (err) {
        console.error('PATCH /contracts/:id error:', err);
        res.status(500).json({ message: 'Eroare la actualizarea contractului' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM contracts WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Contractul nu a fost găsit' });
        }

        res.json({ ok: true });
    } catch (err) {
        console.error('DELETE /contracts/:id error:', err);
        res.status(500).json({ message: 'Eroare la ștergerea contractului' });
    }
});

module.exports = router;
