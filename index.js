require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servire fișiere statice (frontend)
app.use(express.static(__dirname));

// Rute API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/users', require('./routes/users'));

app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'prosperus-backend' });
});

// 404 personalizat pentru API și pagini
app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'Ruta API nu există' });
    }

    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// PORT corect pentru Railway/Render + local
const PORT = process.env.PORT || 8080;

// Start server
app.listen(PORT, () => {
    console.log(`Server pornit pe portul ${PORT}`);
});
