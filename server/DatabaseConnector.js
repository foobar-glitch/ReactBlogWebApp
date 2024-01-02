const mysql = require('mysql');
const util = require('util');
const {db_host, db_user, db_password, db_name} = require('/var/www/private/nodejs/mysqlCredentials')

// Function to establish a MySQL connection
function connectToDatabase() {
  return new Promise((resolve, reject) => {
    const conn = mysql.createConnection({
      host: db_host,
      user: db_user,
      password: db_password,
      database: db_name,
    });

    conn.connect((error) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve(conn);
      }
    });
  });
}

// Function to perform the database query
async function performQuery(conn, sql, values) {
    const query = util.promisify(conn.query).bind(conn);
    return await query(sql, values);
}

module.exports = {
    connectToDatabase,
    performQuery,
}