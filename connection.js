const mysql = require("mysql2");
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "rootroot",
    database: "employee_database"
});
connection.connect(function (err) {
    if (err) throw err;
}); module.exports = connect;