const { connectToDatabase, performQuery } = require('./DatabaseConnector');

// Function to login. Set a session in the database
async function login(username, password, session) {
    let conn;
    try {
      conn = await connectToDatabase();
      const currentTime = new Date();

      const salt_rows = await performQuery(
        conn, 
        "SELECT salt FROM `users` WHERE `username` = ?",
        [username]
      )

      if(salt_rows.length !== 1){
        return 0
      }
      const salt = salt_rows[0].salt
      //console.log(`salt of user='${username}' is '${salt}'`)
      // Perform the database query
      const rows = await performQuery(
        conn,
        "SELECT * FROM `users` WHERE `username` = ? AND `password` = SHA2(CONCAT(?, ?), 256)",
        [username, password, salt]
      );
  
      console.log(rows);
      if (rows.length !== 1) {
        return 0;
      }
      // Update Session table
      await performQuery(
        conn,
        "DELETE FROM `cookie_data` WHERE userId = ?",
        [rows[0].userId]
      );

      await performQuery(
        conn,
        "INSERT `cookie_data` (sessionId, userId, createdAt, expiresAt) VALUES (?, ?, ?, ?)",
        [session.id, rows[0].userId, currentTime, session.cookie._expires]
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