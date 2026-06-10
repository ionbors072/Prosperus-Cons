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

// PORT corect pentru Render + local
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
    console.log(`Server pornit pe portul ${PORT}`);
});
