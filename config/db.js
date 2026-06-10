const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'database.db'));

// Creare tabele daca nu exista
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'client',
        spec TEXT,
        phone TEXT
    );

    CREATE TABLE IF NOT EXISTS contracts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        client_email TEXT,
        name TEXT,
        address TEXT,
        type TEXT,
        price TEXT,
        status TEXT,
        eta TEXT,
        progress INTEGER DEFAULT 0
    );
`);

module.exports = db;