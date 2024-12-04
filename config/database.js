let mysql = require('mysql2');

// Konfigurasi koneksi database
let connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'disaster',
  password: '111',
  database: 'db_express_api',
});

// Menghubungkan ke database
connection.connect(function (error) {
  if (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
});

// Ekspor koneksi
module.exports = connection;
