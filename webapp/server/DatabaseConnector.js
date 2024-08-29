const mysql = require('mysql');
const util = require('util');
const { SQLSecrets } = require('./DBConfigs');

function connectToDatabase() {
  return new Promise((resolve, reject) => {
    const conn = mysql.createConnection({
      host: SQLSecrets.HOST,
      port: SQLSecrets.PORT,
      user: SQLSecrets.USER,
      password: SQLSecrets.USER_PASSWORD,
      database: SQLSecrets.DB_NAME,
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

function closeDatabaseConnection(conn) {
  return new Promise((resolve, reject) => {
      conn.end((error) => {
          if (error) {
              console.log('Error ending the connection:', error);
              reject(error);
          } else {
              resolve();
          }
      });
  });
}

module.exports = {
    connectToDatabase,
    closeDatabaseConnection,
    performQuery,
}