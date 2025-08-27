const mysql = require('mysql2');

const dbConfig = {
  host: process.env.HOST || "localhost",
  user: process.env.USER || "root",
  password:"",
  database: process.env.DATABASE_NAME || "studentdb",
  port: process.env.PORT || 3306
};
const connection = mysql.createConnection(dbConfig);
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

module.exports = connection;
