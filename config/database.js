let mysql = require('mysql2');

// Konfigurasi koneksi database
let connection = mysql.createConnection({
  host: '******',
  user: '*****',
  password: '*****',
  database: '******',
});

// Menghubungkan ke database
connection.connect(function (error) {
  if (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
});

// Ekspor koneksi
module.exports = connection;
