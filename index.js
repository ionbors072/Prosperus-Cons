require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/users',     require('./routes/users'));

app.listen(process.env.PORT, () => {
    console.log('Server pornit pe http://localhost:' + process.env.PORT);
});