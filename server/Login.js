const { connectToDatabase, performQuery } = require('./DatabaseConnector');
const {cookie_table_name, users_table_name} = require('/var/www/private/nodejs/mysqlCredentials')

// Function to login. Set a session in the database
async function login(username, password, session) {
    let conn;
    try {
      conn = await connectToDatabase();
      const currentTime = new Date();

      const salt_rows = await performQuery(
        conn, 
        `SELECT salt FROM ${users_table_name} WHERE username = ?`,
        [username]
      )

      console.log(salt_rows.length)
      if(salt_rows.length !== 1){
        return 0
      }
      
      const salt = salt_rows[0].salt
      console.log(`salt of user='${username}' is '${salt}'`)
      // Perform the database query
      const rows = await performQuery(
        conn,
        `SELECT * FROM ${users_table_name} WHERE username = ? AND password = SHA2(CONCAT(?, ?), 256)`,
        [username, password, salt]
      );
      console.log("ffa")
  
      console.log(rows);
      if (rows.length !== 1) {
        return 0;
      }
      // Update Session table
      await performQuery(
        conn,
        `DELETE FROM ${cookie_table_name} WHERE userId = ?`,
        [rows[0].userId]
      );
      console.log("MY SESSION")
      console.log(session)
      console.log(session.id)
      await performQuery(
        conn,
        `INSERT ${cookie_table_name} (userId, cookieData, created_at, expired_at) VALUES (?, ?, ?, ?)`,
        [rows[0].userId, session.id, currentTime, session.cookie._expires]
      );
      
      return 1;
    } finally {
      if (conn) {
        conn.end();
      }
    }
  }


module.exports = {
  login
}