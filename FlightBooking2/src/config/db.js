const mysql = require('mysql2');
const util = require('util');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

/* eslint-disable no-console*/
db.connect(err => {
  if (err) throw err;
  console.log('Connected to database');
});

db.queryAsync = util.promisify(db.query).bind(db);

module.exports = db;
