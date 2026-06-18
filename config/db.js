const mysql = require('mysql2/promise');

const connectionString = process.env.MYSQL_URL || process.env.DATABASE_URL;

const pool = connectionString
    ? mysql.createPool(connectionString)
    : mysql.createPool({
        host:     process.env.MYSQLHOST,
        user:     process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        port:     Number(process.env.MYSQLPORT) || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        dateStrings: true
    });

module.exports = pool;
