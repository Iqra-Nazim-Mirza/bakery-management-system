//const mysql=require('mysql2/promise'); require('dotenv').config(); const pool=mysql.createPool({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,waitForConnections:true,connectionLimit:10}); module.exports=pool;
const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "bakery_bloom",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection()
    .then(connection => {
        console.log("MySQL connected successfully");
        connection.release();
    })
    .catch(error => {
        console.error("MySQL connection failed:", error.message);
    });

module.exports = db;