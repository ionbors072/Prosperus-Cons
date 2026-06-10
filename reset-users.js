require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');

async function reset() {
    const db = await mysql.createConnection({
        host:     process.env.DB_HOST,
        user:     process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    const users = [
    { name: 'Ing. Borș Ion',  email: 'ing.bors.ion@prosperus.md', pass: 'admin2026',  role: 'inginer',  spec: 'Coordonator Tehnic / Manager Global', phone: '+373 69 000 001' },
    { name: 'Andrei Vasile',  email: 'vasile@prosperus.md',        pass: 'vasile99',   role: 'lucrator', spec: 'Sudor Electrofuziune PEHD',            phone: '+373 69 000 002' },
    { name: 'Ion Grădinaru',  email: 'ion.g@prosperus.md',         pass: 'ionteren',   role: 'lucrator', spec: 'Operator Excavator / Mecanizat',        phone: '+373 69 000 003' },
    { name: 'Mihai Stoian',   email: 'mihai@prosperus.md',         pass: 'mihai2026',  role: 'lucrator', spec: 'Tehnician Probe Presiune & Instalații',  phone: '+373 69 000 004' },
    { name: 'Popescu Radu',   email: 'client@exemplu.com',         pass: '123456',     role: 'client',   spec: 'N/A - Beneficiar',                      phone: '+373 69 000 005' },
    ];

    await db.execute('DELETE FROM users');
    console.log('Utilizatori vechi stersi.');

    for (const u of users) {
        const hash = await bcrypt.hash(u.pass, 10);
        await db.execute(
            'INSERT INTO users (name, email, password_hash, role, spec, phone) VALUES (?,?,?,?,?,?)',
            [u.name, u.email, hash, u.role, u.spec, u.phone]
        );
        console.log(`Inserat: ${u.email}`);
    }

    console.log('Gata! Toti utilizatorii au fost resetati cu parolele corecte.');
    await db.end();
}

reset();